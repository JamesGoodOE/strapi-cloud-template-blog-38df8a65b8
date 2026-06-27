import * as React from "react";
import { Button, makeStyles, tokens, Spinner, MessageBar, MessageBarBody } from "@fluentui/react-components";
import { ChartMultiple20Regular, Checkmark20Filled, BookmarkAdd20Regular, Bookmark20Filled } from "@fluentui/react-icons";
import { ChartKind, DataPayload, ReportCitation } from "../../services/types";
import { ChartTypePicker } from "./ChartTypePicker";
import { ChartPreview } from "./ChartPreview";
import { insertChart } from "../../office/insertChart";
import { useLibrary } from "../LibraryContext";

const useStyles = makeStyles({
  card: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground1,
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  label: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground2,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  summary: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground1,
    margin: 0,
  },
  source: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
  },
});

export interface DataAnswerCardProps {
  payload: DataPayload;
  /** Used to attribute the chart source line. */
  source?: ReportCitation;
  /** The question that produced this data, stored alongside saved charts. */
  question?: string;
}

export const DataAnswerCard: React.FC<DataAnswerCardProps> = ({ payload, source, question }) => {
  const styles = useStyles();
  const library = useLibrary();
  const singleSeries = payload.series.length === 1;
  const [kind, setKind] = React.useState<ChartKind>("line");
  const [state, setState] = React.useState<"idle" | "inserting" | "done">("idle");
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSave = async () => {
    try {
      const title = payload.summary || question || payload.series[0]?.name || "Saved chart";
      await library.save({ title, kind, payload, source, question });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to save chart to library", err);
    }
  };

  const handleInsert = async () => {
    setState("inserting");
    setError(null);
    try {
      await insertChart(payload, kind, source);
      setState("done");
      window.setTimeout(() => setState("idle"), 2200);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to insert chart", err);
      setError("Could not insert the chart. Place your cursor in the document and try again.");
      setState("idle");
    }
  };

  return (
    <div className={styles.card}>
      <span className={styles.label}>Economic data</span>
      {payload.summary && <p className={styles.summary}>{payload.summary}</p>}

      <div>
        <span className={styles.label}>Chart type</span>
        <div style={{ marginTop: 6 }}>
          <ChartTypePicker value={kind} onChange={setKind} allowPie={singleSeries} />
        </div>
      </div>

      <ChartPreview payload={payload} kind={kind} />

      {error && (
        <MessageBar intent="error">
          <MessageBarBody>{error}</MessageBarBody>
        </MessageBar>
      )}

      <div className={styles.source}>
        Source: Oxford Economics{payload.series[0]?.source ? `, ${payload.series[0].source}` : ""}.
      </div>

      <div className={styles.actions}>
        <Button
          appearance="secondary"
          size="small"
          icon={saved ? <Bookmark20Filled /> : <BookmarkAdd20Regular />}
          onClick={handleSave}
        >
          {saved ? "Saved" : "Save to library"}
        </Button>
        <Button
          appearance={state === "done" ? "secondary" : "primary"}
          size="small"
          icon={
            state === "inserting" ? (
              <Spinner size="tiny" />
            ) : state === "done" ? (
              <Checkmark20Filled />
            ) : (
              <ChartMultiple20Regular />
            )
          }
          disabled={state === "inserting"}
          onClick={handleInsert}
        >
          {state === "done" ? "Inserted" : "Insert chart"}
        </Button>
      </div>
    </div>
  );
};
