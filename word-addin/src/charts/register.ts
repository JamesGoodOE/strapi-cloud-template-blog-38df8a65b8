import { Chart, registerables } from "chart.js";

/**
 * Register all Chart.js controllers/elements/scales once, globally. Imported by
 * both the in-task-pane preview (react-chartjs-2) and the offscreen renderer
 * used to embed charts into the document, so both share one registry.
 */
let registered = false;
export function ensureChartsRegistered(): void {
  if (registered) return;
  Chart.register(...registerables);
  registered = true;
}

ensureChartsRegistered();
