import { describe, expect, it } from "vitest";
import { summarizeEvents } from "../src/core/summarize";
import { SearchEvent } from "../src/core/types";

const event = (query: string, results: number, time: number): SearchEvent => ({
  id: `${query}-${time}`,
  query,
  url: "https://chat.openai.com",
  method: "POST",
  status: 200,
  resultCount: results,
  results: [],
  startedAt: time - 1,
  completedAt: time
});

describe("summarizeEvents", () => {
  it("groups by query and totals counts", () => {
    const rows = summarizeEvents([event("a", 1, 3), event("a", 2, 5), event("b", 4, 4)]);
    expect(rows[0]?.query).toBe("a");
    expect(rows[0]?.count).toBe(2);
    expect(rows[0]?.totalResults).toBe(3);
    expect(rows[1]?.query).toBe("b");
  });
});
