import { SearchEvent } from "../core/types";
import { effectInitWebRequestTap } from "./effectWebRequestTap";
import { effectInitSidePanel } from "./effectSidePanel";
import { effectInitDebuggerTap, attachDebugger, detachDebugger } from "./effectDebuggerTap";
import { addLog, clearLogs, getLogs, hydrateLogs } from "../logs/logStore";
const EVENT_KEY = "search-events", LOG_KEY = "logs";
const loadState = async (): Promise<{ events: SearchEvent[] }> => {
  const stored = await chrome.storage.session.get([EVENT_KEY, LOG_KEY]);
  const events = (stored[EVENT_KEY] as SearchEvent[] | undefined) ?? [];
  hydrateLogs(((stored[LOG_KEY] as ReturnType<typeof getLogs>) ?? []));
  return { events };
};
const persist = async (events: SearchEvent[]): Promise<void> => chrome.storage.session.set({ [EVENT_KEY]: events, [LOG_KEY]: getLogs() });
const notifyPanels = (events: SearchEvent[]): void => {
  chrome.runtime.sendMessage({ type: "state-updated", events, logs: getLogs() }, () => {
    const err = chrome.runtime.lastError;
    if (err) addLog("warn", "ui", "notify panels failed", { message: err.message });
  });
};
const upsertEvent = async (event: SearchEvent): Promise<void> => {
  const { events } = await loadState();
  const trimmed = [...events.filter((item) => item.id !== event.id).slice(-199), event];
  addLog("info", "capture", "search event captured", { query: event.query, url: event.url });
  await persist(trimmed);
  notifyPanels(trimmed);
};
const reloadChatTab = async (): Promise<void> => {
  const tabs = await chrome.tabs.query({ url: ["https://chat.openai.com/*", "https://chatgpt.com/*"] });
  const target = tabs.find((tab) => tab.active) ?? tabs[0];
  if (!target?.id) {
    addLog("warn", "capture", "no ChatGPT tab found");
    await persist((await loadState()).events);
    return;
  }
  await chrome.tabs.reload(target.id);
  addLog("info", "capture", "reloaded ChatGPT tab");
  await persist((await loadState()).events);
};
const clearLogState = async (): Promise<void> => {
  const { events } = await loadState();
  clearLogs();
  await persist(events);
  notifyPanels(events);
};
const clearAllData = async (): Promise<void> => {
  clearLogs();
  await persist([]);
  notifyPanels([]);
  addLog("info", "capture", "all data cleared");
};
const handleSearchEvent = (event: SearchEvent | undefined, sendResponse: (response: unknown) => void): boolean => {
  if (!event) return false;
  void upsertEvent(event);
  sendResponse({ ok: true });
  return true;
};
const handleGetState = (sendResponse: (response: unknown) => void): boolean => {
  void loadState().then((state) => sendResponse({ ...state, logs: getLogs() }));
  return true;
};
const handleReload = (sendResponse: (response: unknown) => void): boolean => { void reloadChatTab().then(() => sendResponse({ ok: true })); return true; };
const handleClearLogs = (sendResponse: (response: unknown) => void): boolean => { void clearLogState().then(() => sendResponse({ ok: true })); return true; };
const handleClearAllData = (sendResponse: (response: unknown) => void): boolean => { void clearAllData().then(() => sendResponse({ ok: true })); return true; };
const handlePanelOpened = (sendResponse: (response: unknown) => void): boolean => {
  addLog("info", "ui", "side panel opened, attaching debugger");
  attachDebugger();
  sendResponse({ ok: true });
  return true;
};
const handlePanelClosed = (sendResponse: (response: unknown) => void): boolean => {
  addLog("info", "ui", "side panel closed, detaching debugger");
  detachDebugger();
  sendResponse({ ok: true });
  return true;
};
const handleMessage = (message: unknown, sendResponse: (response: unknown) => void): boolean => {
  const typed = message as { type?: string; event?: SearchEvent };
  if (typed.type === "search-event") return handleSearchEvent(typed.event as SearchEvent, sendResponse);
  if (typed.type === "get-state") return handleGetState(sendResponse);
  if (typed.type === "reload-detection") return handleReload(sendResponse);
  if (typed.type === "clear-log") return handleClearLogs(sendResponse);
  if (typed.type === "clear-all-data") return handleClearAllData(sendResponse);
  if (typed.type === "panel-opened") return handlePanelOpened(sendResponse);
  if (typed.type === "panel-closed") return handlePanelClosed(sendResponse);
  return false;
};
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => handleMessage(message, sendResponse));
effectInitSidePanel();
effectInitDebuggerTap((event) => void upsertEvent(event));
effectInitWebRequestTap((event) => void upsertEvent(event));
