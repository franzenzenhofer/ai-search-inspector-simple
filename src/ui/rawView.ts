import { SearchEvent } from "../core/types";
import { byId, escapeHtml, formatJson, setHtml } from "./dom";

const rawContainer = byId<HTMLDivElement>("raw-container");

const renderRawItem = (event: SearchEvent, idx: number): string => {
  const json = event.rawResponse ?? "No response data";
  const formatted = formatJson(json);
  const desc = `Response #${idx + 1} - ${escapeHtml(event.query)} (${json.length} bytes)`;
  return `<div class="raw-item"><div class="raw-header">Full JSON</div><div class="raw-desc">${desc}</div><button class="copy-btn" data-copy-text="${escapeHtml(json)}">Copy JSON</button><div class="raw-response"><pre>${escapeHtml(formatted)}</pre></div></div>`;
};

export const renderRawResponses = (events: SearchEvent[]): void => {
  if (!events.length) { setHtml(rawContainer, ""); return; }
  const itemsHtml = events.map((event, idx) => renderRawItem(event, idx)).join("");
  setHtml(rawContainer, `<div id="full-json"></div>${itemsHtml}`);
};
