import { describe, expect, it } from "vitest";
import { parseSearchEvent, RawCapture } from "../src/core/parseSearchEvent";

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
});
