# ai-search-inspector-simple / AGENTS

## Mission
- Build a lean Manifest V3 Chrome extension that surfaces ChatGPT’s outbound search queries and the results they trigger.
- Present the data like a Google results inspector: query → result count → top result links → timestamps.
- When no data is detected, show a single state: “No search data found. Reload the ChatGPT tab to re-arm detection.”

## Core Engineering Rules
- TypeScript-only, strict mode; zero `any`, zero `@ts-ignore`, explicit return types.
- Source files (ts/tsx/tests) ≤75 lines; functions ≤15 lines; keep modules single-purpose.
- DRY by default: factor shared parsing, formatting, and table helpers; no duplicated conditionals or string literals.
- Minimal dependencies; prefer stdlib and small utilities over frameworks.
- Logging-first mindset: every meaningful event is logged with context; logs must be copyable/exportable.

## Architecture (small and separable)
- `src/core`: pure transforms (parse network events, extract queries, aggregate counts, build summary rows). No side effects or globals.
- `src/infra`: Chrome/DOM side effects (listeners, storage, messaging). Prefix impure functions with `effect*`; guard all Chrome API calls.
- `src/ui`: minimal side panel components (table, summary chips, empty state, reload button).
- `src/logs`: structured log store, formatters, exporter (copy-to-clipboard + download).
- Data flow: capture network event → normalize → store → derive summary → render UI. One-directional, no hidden state.

## Product Behavior
- Detect ChatGPT search traffic (SSE/JSONL/fetch) and record: query text, endpoint, status, result count, top link URLs/titles, started/completed timestamps.
- Show a summary table and a compact per-query detail view; keep it readable without nesting.
- Empty state must instruct: “No search data found. Reload the ChatGPT tab to re-arm detection.” Provide a reload/reattach button that re-registers listeners.
- If detection disconnects (service worker suspend), automatically reattach listeners on wake; surface that in the log.

## UI & UX
- Simple, clean, debuggable UI; no heavy theming. Use a compact neutral palette and monospace for data columns.
- Always-visible controls: copy log, download log, clear log, and “Reload detection.”
- Avoid animation complexity; fast render over flair. Keep components ≤75 lines and props typed.
- Accessibility: keyboard focusable controls, readable contrasts, table headers labeled.

## Logging & Debuggability
- Structured logger with levels (`info|warn|error`) and tags (`capture`, `parse`, `ui`, `storage`).
- Central log store with bounded length; trimming is logged. No stray `console.log`—use the logger, optionally bridge to console behind a flag.
- Export: copy-to-clipboard JSON and downloadable newline-delimited JSON. Include timestamp, event type, query id, payload summary.
- Provide a small in-UI “Live log” view for quick inspection while keeping the main table clean.

## Quality Gates
- Commands: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` must stay fast; keep tooling lean (ESLint + Vitest).
- Tests cover every core transform and error branch; aim for ≥90% coverage without over-mocking.
- CI-friendly: deterministic tests, no network calls; mock Chrome APIs and network payloads.

## Git Workflow
- Atomic commits per logical change set; related files together, nothing unrelated. Conventional commit messages.
- Prefer short loops: implement one slice (e.g., parser update + its tests), commit, then proceed.
- Never commit generated artifacts or secrets.

## Learning From The Original
- Study the previous `franzai-ai-search-inspector` to reuse only what is necessary; strip layers that add complexity without insight.
- Keep the network capture path minimal, the UI flat, and the state shape small and serializable.
- Document deviations from the original when simplifying (in README/changelog) to keep intent clear.

## Safety & Performance
- Minimal permissions (ChatGPT domains + needed webRequest/debugger scopes); justify each permission in README.
- Guard all Chrome API calls with error checks; log and surface failures instead of silently dropping data.
- Bound stored events to a small number (e.g., 200) to avoid memory bloat; evictions are logged.
- Clean teardown: remove listeners on unload/reload, handle service worker restarts gracefully.
