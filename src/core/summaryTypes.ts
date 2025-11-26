export type SummaryResult = {
  title: string;
  url: string;
  snippet: string;
  attribution?: string;
  pub_date?: number | null;
  ref_id?: Record<string, unknown>;
  type?: string;
  rawJson: string;
};

export type SummaryQuery = { query: string; results: SummaryResult[] };

export type SummaryEventType = "search" | "follow-up" | "unknown";
export type SummaryEvent = { id: string; timestamp: number; queries: SummaryQuery[]; eventType?: SummaryEventType; turnId?: string };

export type SearchModelQueries = { queries?: string[] };

export type SummaryEntry = {
  type?: string;
  url?: string;
  title?: string;
  snippet?: string;
  pub_date?: number | null;
  attribution?: string;
  ref_id?: Record<string, unknown>;
};

export type SummaryResultGroup = { domain?: string; entries?: SummaryEntry[] };

export type SearchQueryItem = { type?: string; q?: string };

export type SummaryMetadata = {
  search_model_queries?: SearchModelQueries;
  search_result_groups?: SummaryResultGroup[];
  search_queries?: SearchQueryItem[];
  turn_exchange_id?: string;
  search_display_string?: string;
  searched_display_string?: string;
};

export type SummaryAuthor = { role?: string };

export type SummaryMessage = { id?: string; create_time?: number; metadata?: SummaryMetadata; author?: SummaryAuthor };

export type MappingNode = { id: string; message?: SummaryMessage; parent?: string };

export type Mapping = Record<string, MappingNode>;
