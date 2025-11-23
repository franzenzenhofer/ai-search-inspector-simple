import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { parseSearchEvent, parseSearchEvents, RawCapture } from "../src/core/parseSearchEvent";

type HarEntry = {
  request: { url: string; method: string; postData?: { text?: string } };
  response: { status: number; content?: { text?: string; encoding?: string } };
};

const toCapture = (entry: HarEntry): RawCapture => {
  const responseText = entry.response.content?.text;
  const isBase64 = entry.response.content?.encoding === "base64";
  const responseBody = responseText && isBase64 ? Buffer.from(responseText, "base64").toString("utf8") : responseText;
  return { url: entry.request.url, method: entry.request.method, status: entry.response.status, requestBody: entry.request.postData?.text, responseBody, startedAt: 0, completedAt: 0 };
};

const loadHar = (file: string): HarEntry[] => {
  const content = fs.readFileSync(path.join(process.cwd(), file), "utf8");
  const parsed = JSON.parse(content) as { log?: { entries?: HarEntry[] } };
  return parsed.log?.entries ?? [];
};

describe("HAR replay parsing", () => {
  it("extracts search events from chatgpt.com thinking HAR", () => {
    const entries = loadHar("har-file-examples/chatgpt.com-thinking.har");
    const events = entries
      .map((entry) => parseSearchEvent(toCapture(entry)))
      .filter((event): event is NonNullable<ReturnType<typeof parseSearchEvent>> => Boolean(event));
    expect(events.length).toBeGreaterThan(0);
    const first = events[0];
    expect(first.query.toLowerCase()).toContain("franz enzenhofer");
    expect(first.resultCount).toBeGreaterThan(0);
  });
  it("extracts multiple searches from conversation with thinking", () => {
    const entries = loadHar("har-file-examples/multipe-searches-chatgpt.com-thinking.har");
    const captures = entries.map((entry) => toCapture(entry));
    const events = captures.flatMap((capture) => parseSearchEvents(capture));
    expect(events.length).toBeGreaterThanOrEqual(3);
    const queries = events.map((e) => e.query.toLowerCase());
    expect(queries.some((q) => q.includes("franz enzenhofer"))).toBe(true);
    events.forEach((event) => { expect(event.results.length).toBeGreaterThan(0); event.results.forEach((result) => { expect(result.url).toBeTruthy(); expect(result.title).toBeTruthy(); }); });
  });
});
