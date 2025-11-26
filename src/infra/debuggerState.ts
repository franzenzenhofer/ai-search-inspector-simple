import { SearchEvent } from "../core/types";

export type RequestInfo = { url: string; method: string; body?: string; status?: number; startedAt: number };

export type DebuggerState = {
  targets: string[];
  requests: Map<string, RequestInfo>;
  attachedTabId?: number;
  listener?: (source: chrome.debugger.Debuggee, method: string, params?: object) => void;
  callback?: (event: SearchEvent) => void;
};

export const createDebuggerState = (): DebuggerState => ({
  targets: ["/backend-api/conversation", "process_upload_stream"],
  requests: new Map<string, RequestInfo>()
});
