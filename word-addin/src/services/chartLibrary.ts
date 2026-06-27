import { ChartKind, DataPayload, ReportCitation } from "./types";

/**
 * A chart the user has generated and saved for re-use. The full data payload is
 * stored (not just an image) so a saved chart can be re-rendered at any chart
 * type and re-inserted into any document, at any time.
 */
export interface SavedChart {
  id: string;
  title: string;
  kind: ChartKind;
  payload: DataPayload;
  source?: ReportCitation;
  /** ISO timestamp of when it was saved. */
  createdAt: string;
  /** The question that produced the underlying data, for context. */
  question?: string;
}

const STORAGE_KEY = "askoe.chartLibrary.v1";

/**
 * Persistence layer for the chart library.
 *
 * Prefers `OfficeRuntime.storage` — a durable, per-user add-in store that
 * survives across documents, sessions and devices once deployed through O365.
 * Falls back to `localStorage` when running outside an Office host (e.g. in a
 * plain browser during development).
 */
interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

function getStore(): KeyValueStore {
  const officeStore = (globalThis as { OfficeRuntime?: { storage?: KeyValueStore } }).OfficeRuntime?.storage;
  if (officeStore) return officeStore;
  return {
    getItem: async (k) => window.localStorage.getItem(k),
    setItem: async (k, v) => window.localStorage.setItem(k, v),
  };
}

export async function loadLibrary(): Promise<SavedChart[]> {
  try {
    const raw = await getStore().getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedChart[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Could not read chart library", err);
    return [];
  }
}

async function persist(charts: SavedChart[]): Promise<void> {
  await getStore().setItem(STORAGE_KEY, JSON.stringify(charts));
}

export async function saveChart(input: Omit<SavedChart, "id" | "createdAt">): Promise<SavedChart[]> {
  const charts = await loadLibrary();
  const entry: SavedChart = {
    ...input,
    id: `chart-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    createdAt: new Date().toISOString(),
  };
  const next = [entry, ...charts];
  await persist(next);
  return next;
}

export async function removeChart(id: string): Promise<SavedChart[]> {
  const charts = await loadLibrary();
  const next = charts.filter((c) => c.id !== id);
  await persist(next);
  return next;
}

export async function renameChart(id: string, title: string): Promise<SavedChart[]> {
  const charts = await loadLibrary();
  const next = charts.map((c) => (c.id === id ? { ...c, title } : c));
  await persist(next);
  return next;
}

export async function clearLibrary(): Promise<SavedChart[]> {
  await persist([]);
  return [];
}
