import { flashText, showToast } from "./dom";
import { showDomainOverlay, hideDomainOverlay, handleOverlayClick } from "./domainOverlay";
import { getStatsUrls } from "./statsView";

const handleCopy = async (target: HTMLElement): Promise<void> => {
  const copyText = target.getAttribute("data-copy-text");
  if (!copyText) return;
  const original = target.textContent ?? "Copy";
  try {
    await navigator.clipboard.writeText(copyText);
    flashText(target, "✓ Copied", original);
    showToast("Copied");
  } catch {
    flashText(target, "✗ Failed", original);
    showToast("Copy failed");
  }
};

const handleToggle = (target: HTMLElement): void => {
  const toggleId = target.getAttribute("data-toggle-id");
  if (!toggleId) return;
  const element = document.getElementById(toggleId);
  if (!element) return;
  const isHidden = element.classList.contains("hidden");
  element.classList.toggle("hidden");
  target.textContent = isHidden ? "▼ Hide Raw JSON" : "▶ Show Raw JSON";
  const copyRow = element.querySelector<HTMLElement>(".raw-json-copy");
  if (copyRow) copyRow.classList.toggle("hidden", !isHidden);
};

const handleStatToggle = (target: HTMLElement): void => {
  const toggleTarget = target.getAttribute("data-toggle-target");
  if (!toggleTarget) return;
  const element = document.getElementById(toggleTarget);
  if (!element) return;
  const isHidden = element.classList.contains("hidden");
  element.classList.toggle("hidden");
  target.textContent = isHidden ? "Hide" : "Show";
  const openAllBtn = target.parentElement?.querySelector<HTMLElement>(".stat-open-all");
  if (openAllBtn) openAllBtn.classList.toggle("hidden", !isHidden);
};

const handleOpenAll = (target: HTMLElement): void => {
  const urlsData = target.getAttribute("data-urls");
  if (!urlsData) return;
  const urls = urlsData.split("\n").filter(Boolean);
  urls.forEach((url) => chrome.tabs.create({ url, active: false }));
  showToast(`Opening ${urls.length} URLs`);
};

const handleDomainClick = (target: HTMLElement): void => {
  const domain = target.getAttribute("data-domain");
  if (domain) showDomainOverlay(domain, getStatsUrls());
};

const handleUrlCopy = (target: HTMLElement): void => {
  const text = target.getAttribute("data-copy-text");
  if (text) navigator.clipboard.writeText(text).then(() => showToast("URL copied"));
};

const handleClick = (target: HTMLElement): void => {
  if (target.classList.contains("copy-btn-sm") || target.classList.contains("copy-btn")) void handleCopy(target);
  if (target.classList.contains("toggle-btn")) handleToggle(target);
  if (target.classList.contains("stat-toggle")) handleStatToggle(target);
  if (target.classList.contains("stat-open-all")) handleOpenAll(target);
  if (target.classList.contains("stat-domain")) handleDomainClick(target);
  if (target.classList.contains("overlay-close") || target.classList.contains("overlay-copy")) void handleOverlayClick(target);
  if (target.classList.contains("domain-overlay")) hideDomainOverlay();
  if (target.classList.contains("url-copy")) handleUrlCopy(target);
};

export const setupDelegation = (): void => {
  document.body.addEventListener("click", (event) => handleClick(event.target as HTMLElement));
};
