import { rootDomain, UrlCount } from "../core/stats";
import { escapeHtml, showToast } from "./dom";

let overlayElement: HTMLElement | null = null;

const createOverlay = (): HTMLElement => {
  const overlay = document.createElement("div");
  overlay.id = "domain-overlay";
  overlay.className = "domain-overlay";
  document.body.appendChild(overlay);
  return overlay;
};

const ensureOverlay = (): HTMLElement => {
  if (!overlayElement) overlayElement = createOverlay();
  return overlayElement;
};

const renderUrlList = (urls: UrlCount[]): string =>
  urls.map((u) => `<li class="overlay-url-item"><a href="${escapeHtml(u.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(u.url)}</a> <span class="overlay-url-count">(${u.count}x)</span></li>`).join("");

const buildOverlayHtml = (domain: string, urls: UrlCount[]): string => {
  const urlsText = urls.map((u) => u.url).join("\n");
  return `<div class="overlay-content"><div class="overlay-header"><span class="overlay-title">${escapeHtml(domain)}</span><button class="overlay-close">✕</button></div><ul class="overlay-urls">${renderUrlList(urls)}</ul><div class="overlay-footer"><button class="overlay-copy" data-copy-text="${escapeHtml(urlsText)}">Copy URLs</button></div></div>`;
};

export const showDomainOverlay = (domain: string, allUrls: UrlCount[]): void => {
  const filteredUrls = allUrls.filter((u) => rootDomain(u.url) === domain);
  if (!filteredUrls.length) return;
  const overlay = ensureOverlay();
  overlay.innerHTML = buildOverlayHtml(domain, filteredUrls);
  overlay.classList.add("visible");
};

export const hideDomainOverlay = (): void => {
  if (overlayElement) overlayElement.classList.remove("visible");
};

export const handleOverlayClick = async (target: HTMLElement): Promise<void> => {
  if (target.classList.contains("overlay-close")) { hideDomainOverlay(); return; }
  if (target.classList.contains("overlay-copy")) {
    const text = target.getAttribute("data-copy-text");
    if (text) { await navigator.clipboard.writeText(text); showToast("URLs copied"); }
  }
};
