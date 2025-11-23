import { SearchEvent } from "../core/types";

type Loader = () => Promise<SearchEvent[]>;
type Persister = (events: SearchEvent[]) => Promise<void>;
type Notifier = (events: SearchEvent[]) => void;
type ErrorLogger = (error: unknown) => void;

export const createEventStore = (
  loadEvents: Loader,
  persistEvents: Persister,
  notify: Notifier,
  logError: ErrorLogger
) => {
  let events: SearchEvent[] = [];
  let hydrated = false;
  let queue = Promise.resolve<void>(undefined);

  const ensureHydrated = async (): Promise<void> => {
    if (hydrated) return;
    events = await loadEvents();
    hydrated = true;
  };

  const upsert = (event: SearchEvent): Promise<void> => {
    queue = queue
      .then(async () => {
        await ensureHydrated();
        events = [...events.filter((item) => item.id !== event.id).slice(-199), event];
        await persistEvents(events);
        notify(events);
      })
      .catch((error: unknown) => {
        logError(error);
        queue = Promise.resolve<void>(undefined);
      });
    return queue;
  };

  const get = async (): Promise<SearchEvent[]> => {
    await ensureHydrated();
    return events;
  };

  return { upsert, get };
};
