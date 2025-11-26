import { LogEntry, SearchEvent } from "../core/types";
import { setupControls } from "./controls";
import { setupDelegation } from "./delegation";
import { applyState } from "./viewState";

const requestState = async (): Promise<void> => {
  const response = await chrome.runtime.sendMessage({ type: "get-state" }) as { events: SearchEvent[]; logs: LogEntry[] };
  applyState(response.events, response.logs);
};

const handleMessage = (message: unknown): void => {
  const typed = message as { type?: string; events?: SearchEvent[]; logs?: LogEntry[] };
  if (typed.type === "state-updated" && typed.events && typed.logs) applyState(typed.events, typed.logs);
};

const notifyLifecycle = (type: "panel-opened" | "panel-closed"): void => { void chrome.runtime.sendMessage({ type }); };

setupDelegation();
setupControls();
void requestState();

chrome.runtime.onMessage.addListener((message) => handleMessage(message));
notifyLifecycle("panel-opened");
window.addEventListener("beforeunload", () => notifyLifecycle("panel-closed"));
