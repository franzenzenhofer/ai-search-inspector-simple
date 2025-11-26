import { describe, expect, it, vi } from "vitest";
import { createEventStore } from "../src/infra/eventStore";
import { SearchEvent } from "../src/core/types";

const makeEvent = (id: string): SearchEvent => ({
  id,
  url: "https://chatgpt.com/backend-api/conversation/123",
  method: "GET",
  status: 200,
  rawResponse: `{"id":"${id}"}`, // Different rawResponse per event to avoid duplicate detection
  startedAt: Date.now(),
  completedAt: Date.now()
});

describe("createEventStore", () => {
  it("keeps all events when multiple upserts overlap", async () => {
    let stored: SearchEvent[] = [];
    const load = vi.fn(async (): Promise<SearchEvent[]> => stored);
    const persist = vi.fn(async (events: SearchEvent[]): Promise<void> => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      stored = events;
    });
    const notified: SearchEvent[][] = [];
    const notify = (events: SearchEvent[]): void => { notified.push(events); };
    const errors: unknown[] = [];
    const store = createEventStore(load, persist, notify, (error: unknown) => { errors.push(error); });

    await Promise.all([store.upsert(makeEvent("first")), store.upsert(makeEvent("second"))]);

    const events = await store.get();
    expect(events.map((e) => e.id).sort()).toEqual(["first", "second"]);
    expect(notified.at(-1)?.length).toBe(2);
    expect(errors).toHaveLength(0);
    expect(load).toHaveBeenCalledTimes(1);
  });
});
