import { describe, expect, it } from "vitest";
import { parseSearchEvents, RawCapture } from "../src/core/parseSearchEvent";

const makeCapture = (body: unknown): RawCapture => ({
  url: "https://chatgpt.com/backend-api/conversation",
  method: "POST",
  status: 200,
  requestBody: undefined,
  responseBody: JSON.stringify(body),
  startedAt: 0,
  completedAt: 0
});

describe("parseSearchEvents", () => {
  it("orders search result nodes by create_time", () => {
    const capture = makeCapture({
      mapping: {
        early: {
          message: {
            id: "early-id",
            create_time: 2,
            metadata: { search_model_queries: { queries: ["early query"] }, search_result_groups: [{ entries: [{ type: "search_result", title: "First", url: "https://first.test" }] }] }
          }
        },
        later: {
          message: {
            id: "later-id",
            create_time: 5,
            metadata: { search_model_queries: { queries: ["late query"] }, search_result_groups: [{ entries: [{ type: "search_result", title: "Second", url: "https://second.test" }] }] }
          }
        }
      }
    });

    const events = parseSearchEvents(capture);
    expect(events.map((e) => e.query)).toEqual(["early query", "late query"]);
    expect(events[0].startedAt).toBe(2000);
    expect(events[1].results[0].title).toBe("Second");
  });

  it("uses fallback message when no query metadata exists", () => {
    const capture = makeCapture({
      mapping: {
        onlyResults: { message: { id: "no-query", create_time: 3, metadata: { search_result_groups: [{ entries: [{ type: "search_result", title: "Untyped", url: "https://no-query.test" }] }] } } }
      }
    });

    const events = parseSearchEvents(capture);
    expect(events).toHaveLength(1);
    expect(events[0].query).toBe("no search query identified");
    expect(events[0].results[0].url).toBe("https://no-query.test");
  });
});
