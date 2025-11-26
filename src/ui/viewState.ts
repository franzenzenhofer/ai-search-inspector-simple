import { LogEntry, SearchEvent } from "../core/types";
import { renderRawResponses } from "./rawView";
import { renderStats } from "./statsView";
import { renderStructured } from "./structuredView";

let currentEvents: SearchEvent[] = [];
let currentLogs: LogEntry[] = [];

const toggleTutorial = (hasEvents: boolean): void => {
  const tutorial = document.getElementById("tutorial");
  if (tutorial) tutorial.classList.toggle("hidden", hasEvents);
};

export const applyState = (events: SearchEvent[], logs: LogEntry[]): void => {
  currentEvents = events;
  currentLogs = logs;
  renderStats(events);
  renderStructured(events);
  renderRawResponses(events);
  toggleTutorial(events.length > 0);
};

export const getStateSnapshot = (): { events: SearchEvent[]; logs: LogEntry[] } => ({ events: currentEvents, logs: currentLogs });
