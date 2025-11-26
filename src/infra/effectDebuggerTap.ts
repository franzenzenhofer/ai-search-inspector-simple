import { SearchEvent } from "../core/types";
import { addLog } from "../logs/logStore";
import { buildDebuggerListener } from "./debuggerHandlers";
import { createDebuggerState } from "./debuggerState";

const state = createDebuggerState();

const enableDebugger = (tabId: number): void => {
  chrome.debugger.attach({ tabId }, "1.3", () => {
    const err = chrome.runtime.lastError;
    if (err) { addLog("error", "capture", "debugger attach failed", { message: err.message }); state.attachedTabId = undefined; return; }
    chrome.debugger.sendCommand({ tabId }, "Network.enable");
    addLog("info", "capture", "debugger attached", { tabId });
  });
};

const attachToTab = (tabId: number): void => {
  if (state.attachedTabId && state.attachedTabId !== tabId) chrome.debugger.detach({ tabId: state.attachedTabId });
  state.attachedTabId = tabId;
  state.listener = state.listener ?? buildDebuggerListener(state);
  chrome.debugger.onEvent.removeListener(state.listener);
  chrome.debugger.onEvent.addListener(state.listener);
  enableDebugger(tabId);
};

const findChatTab = async (): Promise<number | undefined> => {
  const tabs = await chrome.tabs.query({ url: ["https://chat.openai.com/*", "https://chatgpt.com/*"] });
  const target = tabs.find((tab) => tab.active && tab.id) ?? tabs[0];
  return target?.id;
};

const maybeAttach = async (): Promise<void> => {
  const id = await findChatTab();
  if (id && id !== state.attachedTabId) attachToTab(id);
};

export const attachDebugger = (): void => {
  if (!state.callback) { addLog("warn", "capture", "attachDebugger called but no callback stored"); return; }
  void maybeAttach();
  addLog("info", "capture", "debugger attach requested (panel opened)");
};

export const detachDebugger = (): void => {
  if (!state.attachedTabId) return;
  chrome.debugger.detach({ tabId: state.attachedTabId }, () => {
    const err = chrome.runtime.lastError;
    if (err) addLog("warn", "capture", "debugger detach failed", { message: err.message });
    else addLog("info", "capture", "debugger detached (panel closed)", { tabId: state.attachedTabId });
  });
  state.attachedTabId = undefined;
  state.requests.clear();
};

export const effectInitDebuggerTap = (onEvent: (event: SearchEvent) => void): void => {
  state.callback = onEvent;
  state.listener = buildDebuggerListener(state);
  chrome.tabs.onActivated.addListener(() => { if (state.attachedTabId) void maybeAttach(); });
  chrome.tabs.onUpdated.addListener((_id, changeInfo) => { if (state.attachedTabId && changeInfo.status === "complete") void maybeAttach(); });
  chrome.debugger.onDetach.addListener(() => { state.attachedTabId = undefined; state.requests.clear(); addLog("info", "capture", "debugger detached by external event"); });
  chrome.debugger.onEvent.addListener(state.listener);
  addLog("info", "capture", "debugger tap initialized (not attached yet)");
};
