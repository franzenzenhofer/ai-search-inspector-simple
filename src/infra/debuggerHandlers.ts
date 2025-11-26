import { parseSearchEvents, RawCapture } from "../core/parseSearchEvent";
import { SearchEvent } from "../core/types";
import { DebuggerState, RequestInfo } from "./debuggerState";

const isTarget = (targets: string[], url?: string): boolean => Boolean(url && targets.some((needle) => url.includes(needle)));

const decodeBody = (result?: { body?: string; base64Encoded?: boolean }): string | undefined => {
  if (!result?.body) return undefined;
  return result.base64Encoded ? atob(result.body) : result.body;
};

const fetchBody = async (state: DebuggerState, requestId: string): Promise<string | undefined> => {
  if (!state.attachedTabId) return undefined;
  const response = await chrome.debugger.sendCommand({ tabId: state.attachedTabId }, "Network.getResponseBody", { requestId }) as { body?: string; base64Encoded?: boolean };
  return decodeBody(response);
};

const buildCaptures = async (state: DebuggerState, requestId: string): Promise<SearchEvent[]> => {
  const info = state.requests.get(requestId);
  if (!info) return [];
  state.requests.delete(requestId);
  const capture: RawCapture = { url: info.url, method: info.method, requestBody: info.body, responseBody: await fetchBody(state, requestId), status: info.status ?? 0, startedAt: info.startedAt, completedAt: Date.now() };
  return parseSearchEvents(capture);
};

export const handleRequest = (state: DebuggerState, params: { requestId: string; request?: { url?: string; method?: string; postData?: string } }): void => {
  const url = params.request?.url;
  const method = params.request?.method;
  if (!url || !isTarget(state.targets, url) || !method) return;
  const request: RequestInfo = { url, method, body: params.request?.postData, startedAt: Date.now() };
  state.requests.set(params.requestId, request);
};

export const handleResponse = (state: DebuggerState, params: { requestId: string; response?: { status?: number } }): void => {
  const info = state.requests.get(params.requestId);
  if (info) state.requests.set(params.requestId, { ...info, status: params.response?.status ?? info.status });
};

export const handleFinished = async (state: DebuggerState, params: { requestId: string }): Promise<void> => {
  const events = await buildCaptures(state, params.requestId);
  const callback = state.callback;
  if (callback) events.forEach((event) => callback(event));
};

export const buildDebuggerListener = (state: DebuggerState): ((source: chrome.debugger.Debuggee, method: string, params?: object) => void) => {
  return (source, method, params) => {
    if (source.tabId !== state.attachedTabId || !params) return;
    if (method === "Network.requestWillBeSent") handleRequest(state, params as { requestId: string; request: { url: string; method: string; postData?: string } });
    if (method === "Network.responseReceived") handleResponse(state, params as { requestId: string; response: { status: number } });
    if (method === "Network.loadingFinished") void handleFinished(state, params as { requestId: string });
  };
};
