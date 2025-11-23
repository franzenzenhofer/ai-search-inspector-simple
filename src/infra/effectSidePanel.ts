const isChatGpt = (url?: string): boolean => {
  if (!url) return false;
  return url.startsWith("https://chat.openai.com/") || url.startsWith("https://chatgpt.com/");
};

const enablePanel = (tabId: number, url?: string): void => {
  if (!isChatGpt(url)) return;
  void chrome.sidePanel.setOptions({ tabId, path: "sidepanel.html", enabled: true });
  void chrome.sidePanel.open({ tabId });
};

export const effectInitSidePanel = (): void => {
  chrome.action.onClicked.addListener((tab) => {
    if (!tab.id) return;
    enablePanel(tab.id, tab.url);
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") enablePanel(tabId, changeInfo.url ?? tab.url);
  });

  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    enablePanel(activeInfo.tabId, tab.url);
  });
};
