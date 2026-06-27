import * as React from "react";
import {
  makeStyles,
  tokens,
  Button,
  Spinner,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@fluentui/react-components";
import { ChartMultipleRegular, Delete20Regular } from "@fluentui/react-icons";
import { useLibrary } from "../LibraryContext";
import { SavedChartCard } from "./SavedChartCard";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  count: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    textAlign: "center",
    padding: "32px 16px",
    color: tokens.colorNeutralForeground3,
  },
  emptyIcon: {
    fontSize: "40px",
    color: tokens.colorNeutralForeground4,
  },
  emptyTitle: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground2,
  },
});

export const LibraryView: React.FC = () => {
  const styles = useStyles();
  const { charts, ready, clear } = useLibrary();

  if (!ready) {
    return (
      <div className={styles.empty}>
        <Spinner size="small" label="Loading your charts…" />
      </div>
    );
  }

  if (charts.length === 0) {
    return (
      <div className={styles.empty}>
        <ChartMultipleRegular className={styles.emptyIcon} />
        <div className={styles.emptyTitle}>Your chart library is empty</div>
        <p>
          When AskOE returns economic data, choose <strong>Save to library</strong> on the chart to keep it here.
          Saved charts can be restyled and re-inserted into any document, any time.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <span className={styles.count}>
          {charts.length} saved {charts.length === 1 ? "chart" : "charts"}
        </span>
        <Dialog>
          <DialogTrigger disableButtonEnhancement>
            <Button appearance="subtle" size="small" icon={<Delete20Regular />}>
              Clear all
            </Button>
          </DialogTrigger>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>Clear chart library?</DialogTitle>
              <DialogContent>
                This permanently removes all {charts.length} saved charts. Charts already inserted into documents are
                unaffected.
              </DialogContent>
              <DialogActions>
                <DialogTrigger disableButtonEnhancement>
                  <Button appearance="secondary">Cancel</Button>
                </DialogTrigger>
                <DialogTrigger disableButtonEnhancement>
                  <Button appearance="primary" onClick={() => clear()}>
                    Clear all
                  </Button>
                </DialogTrigger>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      </div>

      {charts.map((c) => (
        <SavedChartCard key={c.id} chart={c} />
      ))}
    </div>
  );
};
