import { addLog } from "../logs/logStore";

const hasSidePanel = (): boolean => Boolean(chrome.sidePanel?.setOptions);

const primePanel = async (tabId: number, url?: string): Promise<void> => {
  if (!hasSidePanel()) { addLog("error", "ui", "side panel API unavailable"); return; }
  await chrome.sidePanel.setOptions({ tabId, path: "sidepanel.html", enabled: true });
  addLog("info", "ui", "side panel primed for tab", { tabId, url });
};

const openPanel = async (tabId: number, url?: string): Promise<void> => {
  if (!hasSidePanel()) { addLog("error", "ui", "side panel API unavailable"); return; }
  await chrome.sidePanel.open({ tabId });
  addLog("info", "ui", "side panel opened from action", { tabId, url });
};

const onActionClick = (tab: chrome.tabs.Tab): void => {
  const id = tab.id;
  if (id === undefined) return;
  void primePanel(id, tab.url).then(() => openPanel(id, tab.url));
};

const setBehavior = (): void => {
  if (chrome.sidePanel?.setPanelBehavior) void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
};

export const effectInitSidePanel = (): void => {
  setBehavior();
  chrome.action.onClicked.addListener(onActionClick);
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => { if (changeInfo.status === "complete") void primePanel(tabId, tab.url); });
  chrome.tabs.onActivated.addListener(async (activeInfo) => { const tab = await chrome.tabs.get(activeInfo.tabId); void primePanel(activeInfo.tabId, tab.url); });
};
