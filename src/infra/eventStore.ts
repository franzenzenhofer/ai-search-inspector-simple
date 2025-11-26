import { SearchEvent } from "../core/types";

type Loader = () => Promise<SearchEvent[]>;
type Persister = (events: SearchEvent[]) => Promise<void>;
type Notifier = (events: SearchEvent[]) => void;
type ErrorLogger = (error: unknown) => void;

type StoreState = { events: SearchEvent[]; hydrated: boolean; queue: Promise<void> };

const createState = (): StoreState => ({ events: [], hydrated: false, queue: Promise.resolve() });

const ensureHydrated = async (state: StoreState, loadEvents: Loader): Promise<void> => {
  if (state.hydrated) return;
  state.events = await loadEvents();
  state.hydrated = true;
};

const persistAndNotify = async (state: StoreState, persistEvents: Persister, notify: Notifier): Promise<void> => {
  await persistEvents(state.events);
  notify(state.events);
};

const enqueue = (state: StoreState, task: () => Promise<void>, logError: ErrorLogger): Promise<void> => {
  state.queue = state.queue
    .then(task)
    .catch((error: unknown) => { logError(error); state.queue = Promise.resolve(); });
  return state.queue;
};

/** Check if two events are duplicates by ID or rawResponse content */
const isDuplicate = (a: SearchEvent, b: SearchEvent): boolean => {
  if (a.id === b.id) return true;
  // Same rawResponse = same conversation capture = duplicate
  if (a.rawResponse && b.rawResponse && a.rawResponse === b.rawResponse) return true;
  return false;
};

const buildUpsert = (
  state: StoreState,
  loadEvents: Loader,
  persistEvents: Persister,
  notify: Notifier,
  logError: ErrorLogger
): ((event: SearchEvent) => Promise<void>) =>
  (event: SearchEvent): Promise<void> =>
    enqueue(state, async () => {
      await ensureHydrated(state, loadEvents);
      const isDupe = state.events.some((existing) => isDuplicate(existing, event));
      if (isDupe) return;
      state.events = [...state.events.filter((item) => item.id !== event.id).slice(-199), event];
      await persistAndNotify(state, persistEvents, notify);
    }, logError);

const buildGet = (state: StoreState, loadEvents: Loader): (() => Promise<SearchEvent[]>) => async () => {
  await ensureHydrated(state, loadEvents);
  return state.events;
};

export const createEventStore = (
  loadEvents: Loader,
  persistEvents: Persister,
  notify: Notifier,
  logError: ErrorLogger
): { upsert: (event: SearchEvent) => Promise<void>; get: () => Promise<SearchEvent[]>; clear: () => Promise<void> } => {
  const state = createState();
  const clear = async (): Promise<void> => {
    await ensureHydrated(state, loadEvents);
    state.events = [];
    await persistAndNotify(state, persistEvents, notify);
  };
  return { upsert: buildUpsert(state, loadEvents, persistEvents, notify, logError), get: buildGet(state, loadEvents), clear };
};
