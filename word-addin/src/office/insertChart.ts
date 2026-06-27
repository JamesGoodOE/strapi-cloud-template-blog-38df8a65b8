/* global Word */
import { Chart, Plugin } from "chart.js";
import "../charts/register";
import { buildChartConfig } from "../charts/buildChartConfig";
import { ChartKind, DataPayload, ReportCitation } from "../services/types";
import { formatCitation } from "./insertCitation";

const IMAGE_WIDTH = 720;
const IMAGE_HEIGHT = 420;

/**
 * Render a chart to a PNG off-screen (so styling exactly matches the preview)
 * and return the base64 payload Word's insertInlinePictureFromBase64 expects
 * (i.e. without the "data:image/png;base64," prefix).
 */
export async function renderChartToBase64(payload: DataPayload, kind: ChartKind): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = IMAGE_WIDTH;
  canvas.height = IMAGE_HEIGHT;
  // Solid white background so the image reads well on the page.
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create a drawing context for the chart.");

  const config = buildChartConfig(payload, kind, true);
  const chart = new Chart(canvas, {
    ...config,
    plugins: [whiteBackgroundPlugin],
  });

  try {
    chart.update("none");
    const dataUrl = chart.toBase64Image("image/png", 1);
    return dataUrl.replace(/^data:image\/png;base64,/, "");
  } finally {
    chart.destroy();
  }
}

/** Paints an opaque white background behind the chart before anything else. */
const whiteBackgroundPlugin: Plugin = {
  id: "oeWhiteBackground",
  beforeDraw: (chart: Chart) => {
    const { ctx, width, height } = chart;
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  },
};

/**
 * Insert a chart built from Economic Data at the current selection, followed by
 * a source line citing the Oxford Economics origin of the series.
 */
export async function insertChart(payload: DataPayload, kind: ChartKind, source?: ReportCitation): Promise<void> {
  const base64 = await renderChartToBase64(payload, kind);

  await Word.run(async (context) => {
    const selection = context.document.getSelection();
    const anchor = selection.insertParagraph("", Word.InsertLocation.after);
    anchor.alignment = Word.Alignment.centered;
    const picture = anchor.insertInlinePictureFromBase64(base64, Word.InsertLocation.start);
    picture.altTextDescription = payload.summary || "Oxford Economics chart";
    picture.width = 468; // Fit within default page margins (≈6.5in).

    const sourceText = source
      ? `Source: ${formatCitation(source)}`
      : `Source: Oxford Economics${payload.series[0]?.source ? `, ${payload.series[0].source}` : ""}.`;
    const caption = anchor.insertParagraph(sourceText, Word.InsertLocation.after);
    caption.font.italic = true;
    caption.font.size = 9;
    caption.font.color = "#5A6B7B";
    if (source?.url) {
      caption.getRange(Word.RangeLocation.whole).hyperlink = source.url;
    }

    await context.sync();
  });
}
