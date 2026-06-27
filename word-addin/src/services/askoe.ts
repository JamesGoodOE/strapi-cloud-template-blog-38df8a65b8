import { getAccessToken } from "./auth";
import { mockAnswerFor } from "./mockData";
import { AskOeAnswer, AskOeProvider, AskOptions, AnswerKind, Lens } from "./types";

/**
 * AskOE client.
 *
 * Two interchangeable providers sit behind one interface:
 *   - MockProvider: deterministic local responses, no network/credentials.
 *   - HttpProvider: talks to the real AskOE REST API.
 *
 * The active provider is selected at build time by ASKOE_PROVIDER (see
 * webpack.config.js), but can be overridden at runtime via localStorage
 * ("askoe.provider") which is handy when demoing.
 */

const API_BASE = process.env.ASKOE_API_BASE || "";
const BUILD_PROVIDER = (process.env.ASKOE_PROVIDER as "mock" | "http") || "mock";

/** Simulated network latency for the mock provider, in ms. */
const MOCK_LATENCY = 750;

class MockProvider implements AskOeProvider {
  async ask({ question, lens, signal }: AskOptions): Promise<AskOeAnswer> {
    await delay(MOCK_LATENCY, signal);
    return mockAnswerFor(question, lens ?? "analyst");
  }
}

class HttpProvider implements AskOeProvider {
  constructor(private readonly baseUrl: string) {}

  async ask({ question, conversationId, lens, signal }: AskOptions): Promise<AskOeAnswer> {
    if (!this.baseUrl) {
      throw new AskOeError(
        "AskOE API base URL is not configured. Set ASKOE_API_BASE at build time, or switch to the mock provider."
      );
    }

    const effectiveLens: Lens = lens ?? "analyst";
    const token = await getAccessToken();
    const res = await fetch(`${this.baseUrl.replace(/\/$/, "")}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ question, conversationId, lens: effectiveLens }),
      signal,
    });

    if (!res.ok) {
      const detail = await safeText(res);
      throw new AskOeError(`AskOE request failed (${res.status}). ${detail}`.trim(), res.status);
    }

    const raw = (await res.json()) as Partial<AskOeAnswer> & Record<string, unknown>;
    return normalizeAnswer(raw, question, conversationId, effectiveLens);
  }
}

export class AskOeError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "AskOeError";
  }
}

/**
 * Defensively normalise an API payload into our domain shape and infer the
 * answer kind if the server didn't classify it.
 */
function normalizeAnswer(
  raw: Partial<AskOeAnswer> & Record<string, unknown>,
  question: string,
  conversationId?: string,
  lens: Lens = "analyst"
): AskOeAnswer {
  const citations = Array.isArray(raw.citations) ? raw.citations : [];
  const data = raw.data && Array.isArray(raw.data.series) ? raw.data : undefined;

  let kind = raw.kind as AnswerKind | undefined;
  if (!kind) {
    const hasData = !!data && data.series.length > 0;
    const hasReports = citations.length > 0;
    kind = hasData && hasReports ? "mixed" : hasData ? "data" : "report";
  }

  return {
    conversationId: raw.conversationId || conversationId || "default",
    id: raw.id || `ans-${Date.now()}`,
    question: raw.question || question,
    answer: raw.answer || "",
    kind,
    lens: (raw.lens as Lens) || lens,
    citations,
    data,
  };
}

function getRuntimeProvider(): "mock" | "http" {
  try {
    const override = window.localStorage.getItem("askoe.provider");
    if (override === "mock" || override === "http") return override;
  } catch {
    /* localStorage unavailable */
  }
  return BUILD_PROVIDER;
}

let cached: { key: string; provider: AskOeProvider } | null = null;

export function getProvider(): AskOeProvider {
  const key = getRuntimeProvider();
  if (cached && cached.key === key) return cached.provider;
  const provider = key === "http" ? new HttpProvider(API_BASE) : new MockProvider();
  cached = { key, provider };
  return provider;
}

export function activeProviderName(): "mock" | "http" {
  return getRuntimeProvider();
}

export function ask(options: AskOptions): Promise<AskOeAnswer> {
  return getProvider().ask(options);
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("Aborted", "AbortError"));
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}
