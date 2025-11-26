import { copyAllSummaries } from "./copyAll";
import { flashText } from "./dom";
import { getStateSnapshot } from "./viewState";

const sendMessage = (type: string): Promise<unknown> => chrome.runtime.sendMessage({ type });

const handleClearData = (): void => { void sendMessage("clear-all-data").then(() => window.location.reload()); };

const handleHardReload = (): void => {
  void sendMessage("clear-all-data");
  void sendMessage("reload-detection");
  setTimeout(() => window.location.reload(), 100);
};

const handleCopyAll = (): void => {
  const { events } = getStateSnapshot();
  const button = document.getElementById("copy-all");
  const fallback = button?.textContent ?? "Copy all";
  void copyAllSummaries(events).then(() => flashText(button, "✓ Copied All", fallback));
};

export const setupControls = (): void => {
  const on = (id: string, handler: () => void): void => document.getElementById(id)?.addEventListener("click", handler);
  on("clear-data", handleClearData);
  on("hard-reload", handleHardReload);
  on("copy-all", handleCopyAll);
};
