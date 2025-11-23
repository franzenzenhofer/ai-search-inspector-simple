import { parseSearchEvent, RawCapture } from "../core/parseSearchEvent";

const safeRequestBody = async (input: RequestInfo | URL, init?: RequestInit): Promise<string | undefined> => {
  if (typeof init?.body === "string") return init.body;
  if (input instanceof Request) {
    try {
      const clone = input.clone();
      return await clone.text();
    } catch {
      return undefined;
    }
  }
  return undefined;
};

const safeResponseBody = async (response: Response): Promise<string | undefined> => {
  try {
    return await response.clone().text();
  } catch {
    return undefined;
  }
};

const buildCapture = async (args: Parameters<typeof fetch>, response: Response, startedAt: number): Promise<RawCapture> => {
  const [input, init] = args;
  const url = typeof input === "string" || input instanceof URL ? input.toString() : input.url;
  const method = init?.method ?? (input instanceof Request ? input.method : "GET");
  const requestBody = await safeRequestBody(input, init);
  const responseBody = await safeResponseBody(response);
  return { url, method, requestBody, responseBody, status: response.status, startedAt, completedAt: Date.now() };
};

const processFetch = async (args: Parameters<typeof fetch>, response: Response, startedAt: number): Promise<void> => {
  const capture = await buildCapture(args, response, startedAt);
  const event = parseSearchEvent(capture);
  if (event) void chrome.runtime.sendMessage({ type: "search-event", event });
};

const wrapFetchOnce = (): void => {
  const original = window.fetch.bind(window);
  window.fetch = async (...args): Promise<Response> => {
    const startedAt = Date.now();
    const response = await original(...args);
    void processFetch(args, response, startedAt);
    return response;
  };
};

wrapFetchOnce();
