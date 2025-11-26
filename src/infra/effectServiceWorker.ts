import { SearchEvent } from "../core/types";
import { addLog, clearLogs, getLogs, hydrateLogs } from "../logs/logStore";
import { createEventStore } from "./eventStore";
import { attachDebugger, detachDebugger, effectInitDebuggerTap } from "./effectDebuggerTap";
import { effectInitSidePanel } from "./effectSidePanel";
import { effectInitWebRequestTap } from "./effectWebRequestTap";
const EVENT_KEY = "search-events";
const LOG_KEY = "logs";

const loadEvents = async (): Promise<SearchEvent[]> => {
  const stored = await chrome.storage.session.get([EVENT_KEY, LOG_KEY]);
  hydrateLogs((stored[LOG_KEY] as ReturnType<typeof getLogs> | undefined) ?? []);
  return (stored[EVENT_KEY] as SearchEvent[] | undefined) ?? [];
};

const persistEvents = async (events: SearchEvent[]): Promise<void> =>
  chrome.storage.session.set({ [EVENT_KEY]: events, [LOG_KEY]: getLogs() });

const notifyPanels = (events: SearchEvent[]): void => {
  chrome.runtime.sendMessage({ type: "state-updated", events, logs: getLogs() }, () => {
    const err = chrome.runtime.lastError;
    if (err) addLog("warn", "ui", "notify panels failed", { message: err.message });
  });
};

const store = createEventStore(loadEvents, persistEvents, notifyPanels, (error) =>
  addLog("error", "storage", "event store failure", { message: `${error}` })
);

const reloadChatTab = async (): Promise<void> => {
  const tabs = await chrome.tabs.query({ url: ["https://chat.openai.com/*", "https://chatgpt.com/*"] });
  const target = tabs.find((tab) => tab.active) ?? tabs[0];
  if (!target?.id) { addLog("warn", "capture", "no ChatGPT tab found"); notifyPanels(await store.get()); return; }
  await chrome.tabs.reload(target.id);
  addLog("info", "capture", "reloaded ChatGPT tab");
  notifyPanels(await store.get());
};

const clearLogState = async (): Promise<void> => {
  const events = await store.get();
  clearLogs();
  await persistEvents(events);
  notifyPanels(events);
};

const clearAllData = async (): Promise<void> => {
  clearLogs();
  await store.clear();
};

const handlers: Record<string, (payload: { event?: SearchEvent }, sendResponse: (response: unknown) => void) => boolean> = {
  "search-event": (payload, sendResponse) => { if (!payload.event) return false; void store.upsert(payload.event); sendResponse({ ok: true }); return true; },
  "get-state": (_payload, sendResponse) => { void store.get().then((events) => sendResponse({ events, logs: getLogs() })); return true; },
  "reload-detection": (_payload, sendResponse) => { void reloadChatTab().then(() => sendResponse({ ok: true })); return true; },
  "clear-log": (_payload, sendResponse) => { void clearLogState().then(() => sendResponse({ ok: true })); return true; },
  "clear-all-data": (_payload, sendResponse) => { void clearAllData().then(() => sendResponse({ ok: true })); return true; },
  "panel-opened": (_payload, sendResponse) => { addLog("info", "ui", "side panel opened, attaching debugger"); attachDebugger(); sendResponse({ ok: true }); return true; },
  "panel-closed": (_payload, sendResponse) => { addLog("info", "ui", "side panel closed, detaching debugger"); detachDebugger(); sendResponse({ ok: true }); return true; }
};

const handleMessage = (message: unknown, sendResponse: (response: unknown) => void): boolean => {
  const typed = message as { type?: string; event?: SearchEvent };
  const handler = typed.type ? handlers[typed.type] : undefined;
  return handler ? handler(typed, sendResponse) : false;
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => handleMessage(message, sendResponse));
effectInitSidePanel();
effectInitDebuggerTap((event) => void store.upsert(event));
effectInitWebRequestTap((event) => void store.upsert(event));
