import { SearchEvent } from "../core/types";
import { byId, escapeHtml, formatJson, setHtml } from "./dom";

const rawContainer = byId<HTMLDivElement>("raw-container");

const renderRawItem = (event: SearchEvent, idx: number): string => {
  const json = event.rawResponse ?? "No response data";
  const formatted = formatJson(json);
  return [
    `<div class="raw-item">`,
    `<div class="raw-header">Response #${idx + 1} - ${escapeHtml(event.query)} (${json.length} bytes)<button class="copy-btn" data-copy-text="${escapeHtml(json)}">Copy JSON</button></div>`,
    `<div class="raw-response"><pre>${escapeHtml(formatted)}</pre></div>`,
    `</div>`
  ].join("");
};

export const renderRawResponses = (events: SearchEvent[]): void => {
  if (!events.length) { setHtml(rawContainer, ""); return; }
  const itemsHtml = events.map((event, idx) => renderRawItem(event, idx)).join("");
  setHtml(rawContainer, `<h2 id="full-json" class="section-title">Full JSON</h2>${itemsHtml}`);
};
