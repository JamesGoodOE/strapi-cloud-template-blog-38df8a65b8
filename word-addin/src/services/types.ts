/**
 * Shared domain types for the AskOE Word add-in.
 *
 * AskOE answers fall into two families that drive completely different
 * in-document actions:
 *   - "report"  -> backed by Oxford Economics written research (Economic Reports).
 *                  The user inserts a quotation with a formatted citation.
 *   - "data"    -> backed by Oxford Economics time series (Economic Data).
 *                  The user inserts a chart generated from the series.
 * "mixed" answers carry both and surface both actions.
 */
export type AnswerKind = "report" | "data" | "mixed";

/** A single Oxford Economics research report referenced by an answer. */
export interface ReportCitation {
  id: string;
  /** Report title, e.g. "Global Economic Outlook — Q2 2026". */
  reportTitle: string;
  /** Lead author / team, e.g. "Oxford Economics Macro Research". */
  author?: string;
  /** ISO date string of publication. */
  publicationDate?: string;
  /** Page or section reference, when available. */
  locator?: string;
  /** Deep link back to the report on the Oxford Economics platform. */
  url?: string;
  /** The exact passage the user may quote. */
  excerpt: string;
}

/** One observation in a time series: an ISO date and a numeric value. */
export interface Observation {
  date: string;
  value: number | null;
}

/** A single Oxford Economics economic data series. */
export interface DataSeries {
  id: string;
  /** Display name, e.g. "Real GDP, % year". */
  name: string;
  /** Location / geography, e.g. "United States". */
  location?: string;
  /** Measurement unit, e.g. "% year" or "US$bn". */
  units?: string;
  /** Native frequency: annual, quarterly, monthly. */
  frequency?: "Annual" | "Quarterly" | "Monthly" | string;
  /** Databank / model source, e.g. "Global Economic Model". */
  source?: string;
  observations: Observation[];
}

/** The data payload attached to a data-backed answer. */
export interface DataPayload {
  series: DataSeries[];
  /** Optional natural-language summary of what the data shows. */
  summary?: string;
}

/** A complete AskOE response. */
export interface AskOeAnswer {
  /** Conversation/thread id, so follow-up questions retain context. */
  conversationId: string;
  /** Unique id for this answer turn. */
  id: string;
  /** The original question, echoed back. */
  question: string;
  /** Markdown/plain-text answer body. */
  answer: string;
  kind: AnswerKind;
  /** Research citations (present for "report" and "mixed"). */
  citations: ReportCitation[];
  /** Economic data (present for "data" and "mixed"). */
  data?: DataPayload;
}

export interface AskOptions {
  question: string;
  conversationId?: string;
  signal?: AbortSignal;
}

/** Contract implemented by every AskOE provider (mock and real HTTP). */
export interface AskOeProvider {
  ask(options: AskOptions): Promise<AskOeAnswer>;
}

export type ChartKind = "line" | "column" | "bar" | "area" | "pie";

export interface ChartChoice {
  kind: ChartKind;
  label: string;
  description: string;
}
