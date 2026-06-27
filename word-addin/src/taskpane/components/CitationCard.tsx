import * as React from "react";
import { Button, makeStyles, tokens, Link, Spinner } from "@fluentui/react-components";
import { DocumentText20Regular, TextQuote20Regular, Checkmark20Filled } from "@fluentui/react-icons";
import { ReportCitation } from "../../services/types";
import { formatCitation, insertQuotationWithCitation } from "../../office/insertCitation";

const useStyles = makeStyles({
  card: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderLeft: `3px solid ${tokens.colorBrandStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground1,
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: tokens.colorBrandForeground1,
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
  },
  excerpt: {
    fontStyle: "italic",
    color: tokens.colorNeutralForeground1,
    fontSize: tokens.fontSizeBase300,
    lineHeight: tokens.lineHeightBase300,
    margin: 0,
    paddingLeft: "8px",
    borderLeft: `2px solid ${tokens.colorNeutralStroke2}`,
  },
  meta: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
  },
});

export interface CitationCardProps {
  citation: ReportCitation;
}

export const CitationCard: React.FC<CitationCardProps> = ({ citation }) => {
  const styles = useStyles();
  const [state, setState] = React.useState<"idle" | "inserting" | "done">("idle");

  const handleInsert = async () => {
    setState("inserting");
    try {
      await insertQuotationWithCitation(citation);
      setState("done");
      window.setTimeout(() => setState("idle"), 2200);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to insert quotation", err);
      setState("idle");
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.titleRow}>
        <DocumentText20Regular />
        {citation.url ? (
          <Link href={citation.url} target="_blank" rel="noreferrer">
            {citation.reportTitle}
          </Link>
        ) : (
          <span>{citation.reportTitle}</span>
        )}
      </div>

      <p className={styles.excerpt}>“{citation.excerpt}”</p>

      <div className={styles.meta}>{formatCitation(citation)}</div>

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
              <TextQuote20Regular />
            )
          }
          disabled={state === "inserting"}
          onClick={handleInsert}
        >
          {state === "done" ? "Inserted" : "Insert quotation & citation"}
        </Button>
      </div>
    </div>
  );
};
