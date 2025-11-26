import { describe, expect, it } from "vitest";
import { parseSearchEvent, parseSearchEvents, RawCapture } from "../src/core/parseSearchEvent";

const makeCapture = (body: unknown): RawCapture => ({
  url: "https://chatgpt.com/backend-api/conversation",
  method: "POST",
  status: 200,
  requestBody: undefined,
  responseBody: JSON.stringify(body),
  startedAt: 1,
  completedAt: 2
});

describe("parseSearchEvent", () => {
  it("pulls queries from parent nodes and keeps raw values", () => {
    const capture = makeCapture({
      mapping: {
        parent: {
          id: "parent",
          message: { id: "m-parent", create_time: 10, metadata: { search_model_queries: { queries: [' "Franz Enzenhofer" '] } } }
        },
        child: {
          parent: "parent",
          message: {
            id: "m-child",
            create_time: 11,
            author: { role: "tool" },
            metadata: { search_result_groups: [{ entries: [{ type: "search_result", title: "Raw Title", url: "https://one.test", snippet: "  Raw snippet with spaces  " }] }] }
          }
        }
      }
    });

    const event = parseSearchEvent(capture);
    expect(event?.query).toBe(' "Franz Enzenhofer" ');
    expect(event?.results[0]?.snippet).toBe("  Raw snippet with spaces  ");
    expect(event?.rawResponse).toBe(capture.responseBody);
    expect(event?.startedAt).toBe(11000);
  });

  it("uses turn_exchange_id to share queries across nodes in same turn", () => {
    const turnId = "turn-123";
    const capture = makeCapture({
      mapping: {
        queryNode: {
          id: "queryNode",
          message: {
            id: "m-query", create_time: 1,
            metadata: { turn_exchange_id: turnId, search_model_queries: { queries: ["shared query"] } }
          }
        },
        event1: {
          parent: "queryNode",
          message: {
            id: "m-event1", create_time: 10, author: { role: "tool" },
            metadata: { turn_exchange_id: turnId, search_result_groups: [{ entries: [{ type: "search_result", url: "https://a.test" }] }] }
          }
        },
        event2: {
          parent: "event1",
          message: {
            id: "m-event2", create_time: 12, author: { role: "tool" },
            metadata: { turn_exchange_id: turnId, search_result_groups: [{ entries: [{ type: "search_result", url: "https://b.test" }] }] }
          }
        }
      }
    });

    const events = parseSearchEvents(capture);
    expect(events).toHaveLength(2);
    // Both events share the same turn_exchange_id, so both get the query
    expect(events[0].query).toBe("shared query");
    expect(events[1].query).toBe("shared query");
    expect(events[0].turnId).toBe(turnId);
    expect(events[1].turnId).toBe(turnId);
  });

  it("detects event type based on search_display_string in turn", () => {
    const turnId = "turn-456";
    const capture = makeCapture({
      mapping: {
        searchInitiator: {
          id: "init",
          message: {
            id: "m-init", create_time: 1, author: { role: "assistant" },
            metadata: { turn_exchange_id: turnId, search_display_string: "Searching the web..." }
          }
        },
        resultNode: {
          parent: "init",
          message: {
            id: "m-result", create_time: 10, author: { role: "tool" },
            metadata: { turn_exchange_id: turnId, search_result_groups: [{ entries: [{ type: "search_result", url: "https://x.test" }] }] }
          }
        }
      }
    });

    const events = parseSearchEvents(capture);
    expect(events).toHaveLength(1);
    expect(events[0].eventType).toBe("search");
  });

  it("marks events without search_display_string as follow-up", () => {
    const turnId = "turn-789";
    const capture = makeCapture({
      mapping: {
        resultNode: {
          message: {
            id: "m-result", create_time: 10, author: { role: "tool" },
            metadata: { turn_exchange_id: turnId, search_result_groups: [{ entries: [{ type: "search_result", url: "https://y.test" }] }] }
          }
        }
      }
    });

    const events = parseSearchEvents(capture);
    expect(events).toHaveLength(1);
    expect(events[0].eventType).toBe("follow-up");
  });
});
