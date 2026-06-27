import * as React from "react";
import {
  Button,
  makeStyles,
  tokens,
  Spinner,
  Input,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
} from "@fluentui/react-components";
import {
  ChartMultiple20Regular,
  Checkmark20Filled,
  MoreHorizontal20Regular,
  Edit20Regular,
  Delete20Regular,
} from "@fluentui/react-icons";
import { SavedChart } from "../../services/chartLibrary";
import { ChartKind } from "../../services/types";
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
  header: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  title: {
    flex: 1,
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground1,
  },
  meta: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
  },
});

export interface SavedChartCardProps {
  chart: SavedChart;
}

export const SavedChartCard: React.FC<SavedChartCardProps> = ({ chart }) => {
  const styles = useStyles();
  const library = useLibrary();
  const singleSeries = chart.payload.series.length === 1;
  const [kind, setKind] = React.useState<ChartKind>(chart.kind);
  const [state, setState] = React.useState<"idle" | "inserting" | "done">("idle");
  const [editing, setEditing] = React.useState(false);
  const [titleDraft, setTitleDraft] = React.useState(chart.title);

  const handleInsert = async () => {
    setState("inserting");
    try {
      await insertChart(chart.payload, kind, chart.source);
      setState("done");
      window.setTimeout(() => setState("idle"), 2200);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to insert saved chart", err);
      setState("idle");
    }
  };

  const commitRename = async () => {
    const t = titleDraft.trim();
    if (t && t !== chart.title) await library.rename(chart.id, t);
    setEditing(false);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        {editing ? (
          <Input
            value={titleDraft}
            size="small"
            style={{ flex: 1 }}
            autoFocus
            onChange={(_, d) => setTitleDraft(d.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") {
                setTitleDraft(chart.title);
                setEditing(false);
              }
            }}
          />
        ) : (
          <span className={styles.title}>{chart.title}</span>
        )}
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <Button appearance="subtle" size="small" icon={<MoreHorizontal20Regular />} aria-label="More actions" />
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem icon={<Edit20Regular />} onClick={() => setEditing(true)}>
                Rename
              </MenuItem>
              <MenuItem icon={<Delete20Regular />} onClick={() => library.remove(chart.id)}>
                Delete
              </MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>

      <ChartTypePicker value={kind} onChange={setKind} allowPie={singleSeries} />
      <ChartPreview payload={chart.payload} kind={kind} />

      <span className={styles.meta}>Saved {formatRelative(chart.createdAt)}</span>

      <div className={styles.actions}>
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
          {state === "done" ? "Inserted" : "Insert into document"}
        </Button>
      </div>
    </div>
  );
};

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
