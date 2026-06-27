import type { ChartConfiguration, ChartType as ChartJsType } from "chart.js";
import { ChartKind, DataPayload, DataSeries } from "../services/types";

/**
 * Oxford Economics chart palette — applied consistently to preview and to the
 * image inserted into the document so what the user sees is what they get.
 */
export const OE_PALETTE = ["#0077C8", "#00A3E0", "#E87722", "#6BA539", "#7D3F98", "#D0006F", "#FFC72C"];
const OE_INK = "#0B1F3A";
const OE_GRID = "rgba(11, 31, 58, 0.10)";

/** Map our user-facing chart kinds onto Chart.js primitives. */
export function toChartJsType(kind: ChartKind): ChartJsType {
  switch (kind) {
    case "line":
    case "area":
      return "line";
    case "bar":
    case "column":
      return "bar";
    case "pie":
      return "pie";
    default:
      return "line";
  }
}

function labelsFromSeries(series: DataSeries[]): string[] {
  const longest = series.reduce((a, b) => (b.observations.length > a.observations.length ? b : a), series[0]);
  return longest.observations.map((o) => formatDateLabel(o.date, longest.frequency));
}

function formatDateLabel(iso: string, frequency?: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const year = d.getFullYear();
  if (frequency === "Annual") return String(year);
  if (frequency === "Quarterly") return `${year} Q${Math.floor(d.getMonth() / 3) + 1}`;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
}

/**
 * Build a complete Chart.js configuration for the given data and chart kind.
 * `forImage` tightens styling (solid background, larger fonts) for the static
 * PNG embedded in the Word document.
 */
export function buildChartConfig(payload: DataPayload, kind: ChartKind, forImage = false): ChartConfiguration {
  const series = payload.series;
  const isPie = kind === "pie";
  const isArea = kind === "area";
  const isHorizontal = kind === "bar";

  const labels = labelsFromSeries(series);

  const datasets = isPie
    ? [
        {
          label: series[0]?.name ?? "",
          data: series[0]?.observations.map((o) => o.value) ?? [],
          backgroundColor: labels.map((_, i) => OE_PALETTE[i % OE_PALETTE.length]),
          borderColor: "#ffffff",
          borderWidth: forImage ? 2 : 1,
        },
      ]
    : series.map((s, i) => {
        const color = OE_PALETTE[i % OE_PALETTE.length];
        return {
          label: [s.location, s.name].filter(Boolean).join(" — "),
          data: s.observations.map((o) => o.value),
          borderColor: color,
          backgroundColor: isArea ? hexToRgba(color, 0.18) : color,
          fill: isArea ? "origin" : false,
          tension: kind === "line" || isArea ? 0.3 : 0,
          pointRadius: forImage ? 2 : 2.5,
          borderWidth: 2,
        };
      });

  const config: ChartConfiguration = {
    type: toChartJsType(kind),
    data: { labels, datasets },
    options: {
      indexAxis: isHorizontal ? "y" : "x",
      responsive: true,
      maintainAspectRatio: false,
      animation: forImage ? false : undefined,
      devicePixelRatio: forImage ? 2 : undefined,
      plugins: {
        legend: {
          display: isPie || series.length > 1,
          position: isPie ? "right" : "top",
          labels: { color: OE_INK, font: { size: forImage ? 13 : 12 }, boxWidth: 12, usePointStyle: true },
        },
        title: {
          display: !!payload.summary,
          text: payload.summary,
          color: OE_INK,
          font: { size: forImage ? 14 : 13, weight: "bold" },
          padding: { bottom: 8 },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const unit = series[ctx.datasetIndex]?.units ?? series[0]?.units ?? "";
              return `${ctx.dataset.label}: ${ctx.formattedValue}${unit ? " " + unit : ""}`;
            },
          },
        },
      },
      scales: isPie
        ? undefined
        : {
            x: { grid: { color: OE_GRID }, ticks: { color: OE_INK, font: { size: forImage ? 12 : 11 } } },
            y: {
              grid: { color: OE_GRID },
              ticks: { color: OE_INK, font: { size: forImage ? 12 : 11 } },
              title: {
                display: !!series[0]?.units,
                text: series[0]?.units,
                color: OE_INK,
              },
            },
          },
    },
  };

  return config;
}

function hexToRgba(hex: string, alpha: number): string {
  const m = hex.replace("#", "");
  const bigint = parseInt(m, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
