import { AskOeAnswer } from "./types";

/**
 * Deterministic sample responses used by the mock provider so the add-in is
 * fully demoable locally with no credentials or network access. These mirror
 * the shape the real AskOE API returns, so swapping providers requires no UI
 * changes.
 */

let counter = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now()}-${counter++}`;

function quarterlySeries(start: number, points: number[], startYear = 2024): { date: string; value: number }[] {
  const out: { date: string; value: number }[] = [];
  let q = start; // 0..3
  let year = startYear;
  for (const value of points) {
    const month = q * 3 + 1;
    out.push({ date: `${year}-${String(month).padStart(2, "0")}-01`, value });
    q += 1;
    if (q > 3) {
      q = 0;
      year += 1;
    }
  }
  return out;
}

function annualSeries(startYear: number, points: number[]): { date: string; value: number }[] {
  return points.map((value, i) => ({ date: `${startYear + i}-01-01`, value }));
}

const REPORT_ANSWER = (question: string): AskOeAnswer => ({
  conversationId: "demo",
  id: nextId("ans"),
  question,
  kind: "report",
  answer:
    "Oxford Economics expects global growth to remain subdued in 2026, with GDP " +
    "expanding around 2.6%. Tighter financial conditions and softer trade are the " +
    "principal drags, partially offset by resilient services demand and easing inflation " +
    "across advanced economies.",
  citations: [
    {
      id: nextId("cite"),
      reportTitle: "Global Economic Outlook — Q2 2026",
      author: "Oxford Economics Macro Research",
      publicationDate: "2026-04-15",
      locator: "p. 4",
      url: "https://www.oxfordeconomics.com/resource/global-economic-outlook-q2-2026",
      excerpt:
        "We expect global GDP growth of 2.6% in 2026, with tighter financial conditions and " +
        "softer goods trade weighing on activity, partially offset by resilient services demand " +
        "and a gradual easing of inflation across advanced economies.",
    },
    {
      id: nextId("cite"),
      reportTitle: "Inflation Watch: The Last Mile",
      author: "Oxford Economics Global Macro Service",
      publicationDate: "2026-03-28",
      locator: "Exhibit 2",
      url: "https://www.oxfordeconomics.com/resource/inflation-watch-the-last-mile",
      excerpt:
        "Core inflation in the advanced economies should converge towards target by late 2026, " +
        "though the final stretch of disinflation is proving slower than in prior cycles.",
    },
  ],
});

const DATA_ANSWER = (question: string): AskOeAnswer => ({
  conversationId: "demo",
  id: nextId("ans"),
  question,
  kind: "data",
  answer:
    "US real GDP growth slows from 2.5% in 2024 to 1.8% in 2026 before recovering toward 2.1% by 2028, " +
    "as the lagged effects of monetary tightening fade and investment stabilises.",
  citations: [
    {
      id: nextId("cite"),
      reportTitle: "Global Economic Model — June 2026 vintage",
      author: "Oxford Economics",
      publicationDate: "2026-06-01",
      url: "https://www.oxfordeconomics.com/global-economic-model",
      excerpt: "Forecasts produced with the Oxford Economics Global Economic Model, June 2026 baseline.",
    },
  ],
  data: {
    summary: "US Real GDP, annual % change, 2024–2028 (Global Economic Model baseline).",
    series: [
      {
        id: "USA_GDP_PYR",
        name: "Real GDP, % year",
        location: "United States",
        units: "% year",
        frequency: "Annual",
        source: "Global Economic Model",
        observations: annualSeries(2024, [2.5, 2.0, 1.8, 1.9, 2.1]),
      },
    ],
  },
});

const MIXED_ANSWER = (question: string): AskOeAnswer => ({
  conversationId: "demo",
  id: nextId("ans"),
  question,
  kind: "mixed",
  answer:
    "Eurozone inflation is set to ease towards the ECB's 2% target through 2026. Headline HICP " +
    "falls from 2.8% to 2.1% over the year, and Oxford Economics research notes the disinflation " +
    "is increasingly broad-based across goods and services.",
  citations: [
    {
      id: nextId("cite"),
      reportTitle: "Eurozone Quarterly Forecast — Q2 2026",
      author: "Oxford Economics European Macro Service",
      publicationDate: "2026-04-22",
      locator: "p. 11",
      url: "https://www.oxfordeconomics.com/resource/eurozone-quarterly-forecast-q2-2026",
      excerpt:
        "Headline HICP inflation should fall back to the ECB's 2% target by end-2026, with the " +
        "disinflation now broad-based across both goods and services components.",
    },
  ],
  data: {
    summary: "Eurozone HICP inflation, annual % change, quarterly, 2024 Q1 – 2026 Q4.",
    series: [
      {
        id: "EZ_HICP_PYR",
        name: "HICP inflation, % year",
        location: "Eurozone",
        units: "% year",
        frequency: "Quarterly",
        source: "Global Economic Model",
        observations: quarterlySeries(0, [2.9, 2.6, 2.5, 2.8, 2.7, 2.5, 2.3, 2.2, 2.2, 2.1, 2.1, 2.0]),
      },
    ],
  },
});

/**
 * Pick a representative mock answer from the question text so demos feel
 * responsive: data-ish questions return a chartable series, report-ish
 * questions return citations, and ambiguous ones return a mixed answer.
 */
export function mockAnswerFor(question: string): AskOeAnswer {
  const q = question.toLowerCase();
  const dataHints = ["gdp", "forecast", "growth", "rate", "chart", "data", "series", "trend", "%", "number"];
  const reportHints = ["report", "outlook", "view", "expect", "research", "why", "risk", "analysis", "say"];

  const dataScore = dataHints.filter((h) => q.includes(h)).length;
  const reportScore = reportHints.filter((h) => q.includes(h)).length;

  if (dataScore > 0 && reportScore > 0) return MIXED_ANSWER(question);
  if (dataScore > reportScore) return DATA_ANSWER(question);
  if (reportScore > dataScore) return REPORT_ANSWER(question);
  // Default rotates so the demo shows variety.
  const pick = counter % 3;
  if (pick === 0) return DATA_ANSWER(question);
  if (pick === 1) return REPORT_ANSWER(question);
  return MIXED_ANSWER(question);
}

export const SUGGESTED_PROMPTS: string[] = [
  "What is Oxford Economics' GDP growth forecast for the US through 2028?",
  "Summarise the outlook for Eurozone inflation in 2026",
  "What are the key downside risks to global growth this year?",
  "Show me the trend in UK unemployment",
];
