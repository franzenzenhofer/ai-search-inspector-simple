import { parseSearchEvent, RawCapture } from "../core/parseSearchEvent";
import { addLog } from "../logs/logStore";
import { SearchEvent } from "../core/types";

type RequestInfo = { url: string; method: string; body?: string; status?: number; startedAt: number };

const targets = ["/backend-api/conversation", "process_upload_stream"];
const requests = new Map<string, RequestInfo>();
let attachedTabId: number | undefined;
let listener: ((source: chrome.debugger.Debuggee, method: string, params?: object) => void) | undefined;
let storedCallback: ((event: SearchEvent) => void) | undefined;

const isTarget = (url?: string): boolean => Boolean(url && targets.some((needle) => url.includes(needle)));
const decodeBody = (result?: { body?: string; base64Encoded?: boolean }): string | undefined => (!result?.body ? undefined : result.base64Encoded ? atob(result.body) : result.body);
const fetchBody = async (requestId: string): Promise<string | undefined> => (!attachedTabId ? undefined : decodeBody((await chrome.debugger.sendCommand({ tabId: attachedTabId }, "Network.getResponseBody", { requestId })) as { body?: string; base64Encoded?: boolean }));
const emitCapture = async (requestId: string, onEvent: (event: SearchEvent) => void): Promise<void> => {
  const info = requests.get(requestId);
  if (!info) return;
  requests.delete(requestId);
  const capture: RawCapture = { url: info.url, method: info.method, requestBody: info.body, responseBody: await fetchBody(requestId), status: info.status ?? 0, startedAt: info.startedAt, completedAt: Date.now() };
  const event = parseSearchEvent(capture);
  if (event) onEvent(event);
};
const handleRequest = (params: { requestId: string; request?: { url?: string; method?: string; postData?: string } }): void => {
  const url = params.request?.url;
  const method = params.request?.method;
  if (!url || !isTarget(url) || !method) return;
  requests.set(params.requestId, { url, method, body: params.request?.postData, startedAt: Date.now() });
};
const handleResponse = (params: { requestId: string; response?: { status?: number } }): void => {
  const info = requests.get(params.requestId);
  if (info) requests.set(params.requestId, { ...info, status: params.response?.status ?? info.status });
};
const handleFinished = (params: { requestId: string }, onEvent: (event: SearchEvent) => void): void => { void emitCapture(params.requestId, onEvent); };
const onDebuggerEvent = (onEvent: (event: SearchEvent) => void) => (source: chrome.debugger.Debuggee, method: string, params?: object): void => {
  if (source.tabId !== attachedTabId || !params) return;
  if (method === "Network.requestWillBeSent") handleRequest(params as { requestId: string; request: { url: string; method: string; postData?: string } });
  if (method === "Network.responseReceived") handleResponse(params as { requestId: string; response: { status: number } });
  if (method === "Network.loadingFinished") handleFinished(params as { requestId: string }, onEvent);
};
const enableDebugger = (tabId: number): void => {
  chrome.debugger.attach({ tabId }, "1.3", () => {
    const err = chrome.runtime.lastError;
    if (err) { addLog("error", "capture", "debugger attach failed", { message: err.message }); attachedTabId = undefined; return; }
    chrome.debugger.sendCommand({ tabId }, "Network.enable");
    addLog("info", "capture", "debugger attached", { tabId });
  });
};
const attachToTab = (tabId: number, onEvent: (event: SearchEvent) => void): void => {
  if (attachedTabId && attachedTabId !== tabId) chrome.debugger.detach({ tabId: attachedTabId });
  attachedTabId = tabId;
  if (!listener) listener = onDebuggerEvent(onEvent);
  chrome.debugger.onEvent.removeListener(listener);
  chrome.debugger.onEvent.addListener(listener);
  enableDebugger(tabId);
};
const findChatTab = async (): Promise<number | undefined> => {
  const tabs = await chrome.tabs.query({ url: ["https://chat.openai.com/*", "https://chatgpt.com/*"] });
  const target = tabs.find((tab) => tab.active && tab.id) ?? tabs[0];
  return target?.id;
};
const maybeAttach = async (onEvent: (event: SearchEvent) => void): Promise<void> => {
  const id = await findChatTab();
  if (id && id !== attachedTabId) attachToTab(id, onEvent);
};
export const attachDebugger = (): void => {
  if (!storedCallback) {
    addLog("warn", "capture", "attachDebugger called but no callback stored");
    return;
  }
  void maybeAttach(storedCallback);
  addLog("info", "capture", "debugger attach requested (panel opened)");
};
export const detachDebugger = (): void => {
  if (attachedTabId) {
    chrome.debugger.detach({ tabId: attachedTabId }, () => {
      const err = chrome.runtime.lastError;
      if (err) addLog("warn", "capture", "debugger detach failed", { message: err.message });
      else addLog("info", "capture", "debugger detached (panel closed)", { tabId: attachedTabId });
    });
    attachedTabId = undefined;
    requests.clear();
  }
};
export const effectInitDebuggerTap = (onEvent: (event: SearchEvent) => void): void => {
  storedCallback = onEvent;
  // DO NOT auto-attach here - wait for panel to open
  // Set up tab event listeners (will only attach if panel is open)
  chrome.tabs.onActivated.addListener(() => { if (attachedTabId) void maybeAttach(onEvent); });
  chrome.tabs.onUpdated.addListener((_id, changeInfo, tab) => { if (attachedTabId && changeInfo.status === "complete" && isTarget(tab.url)) void maybeAttach(onEvent); });
  chrome.debugger.onDetach.addListener(() => { attachedTabId = undefined; requests.clear(); addLog("info", "capture", "debugger detached by external event"); });
  addLog("info", "capture", "debugger tap initialized (not attached yet)");
};
