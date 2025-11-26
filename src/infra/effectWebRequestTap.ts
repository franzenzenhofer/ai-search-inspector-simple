import { parseSearchEvents, RawCapture } from "../core/parseSearchEvent";
import { SearchEvent } from "../core/types";

const toCapture = (details: chrome.webRequest.WebResponseCacheDetails): RawCapture => ({
  url: details.url,
  method: details.method,
  status: details.statusCode ?? 0,
  requestBody: undefined,
  responseBody: undefined,
  startedAt: Math.floor(details.timeStamp),
  completedAt: Math.floor(details.timeStamp)
});

/** Parse all search events from the response and notify callback for each */
const handleComplete = (details: chrome.webRequest.WebResponseCacheDetails, onEvent: (event: SearchEvent) => void): void => {
  const events = parseSearchEvents(toCapture(details));
  events.forEach((event) => onEvent(event));
};

export const effectInitWebRequestTap = (onEvent: (event: SearchEvent) => void): void => {
  chrome.webRequest.onCompleted.addListener((details) => handleComplete(details, onEvent), { urls: ["https://chat.openai.com/*", "https://chatgpt.com/*"] });
};
