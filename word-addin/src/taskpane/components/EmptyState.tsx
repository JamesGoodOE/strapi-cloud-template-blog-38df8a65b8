import * as React from "react";
import { makeStyles, tokens } from "@fluentui/react-components";
import { Lightbulb24Regular, DocumentText20Regular, ChartMultiple20Regular } from "@fluentui/react-icons";
import { SUGGESTED_PROMPTS } from "../../services/mockData";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    padding: "8px 2px",
  },
  intro: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground2,
    lineHeight: tokens.lineHeightBase400,
    margin: 0,
  },
  capabilities: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  capability: {
    display: "flex",
    gap: "8px",
    alignItems: "flex-start",
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
  },
  capIcon: {
    color: tokens.colorBrandForeground1,
    flexShrink: 0,
    marginTop: "1px",
  },
  promptsHeader: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground2,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  prompt: {
    textAlign: "left",
    padding: "10px 12px",
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    fontSize: tokens.fontSizeBase300,
    cursor: "pointer",
    transitionProperty: "background-color, border-color",
    transitionDuration: tokens.durationFaster,
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      border: `1px solid ${tokens.colorBrandStroke1}`,
    },
  },
  promptList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
});

export interface EmptyStateProps {
  onPick: (prompt: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onPick }) => {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <p className={styles.intro}>
        Ask natural-language questions and bring Oxford Economics intelligence straight into your document.
      </p>
      <div className={styles.capabilities}>
        <div className={styles.capability}>
          <DocumentText20Regular className={styles.capIcon} />
          <span>
            For questions answered by <strong>research reports</strong>, insert a quotation with a full Oxford Economics
            citation.
          </span>
        </div>
        <div className={styles.capability}>
          <ChartMultiple20Regular className={styles.capIcon} />
          <span>
            For questions answered by <strong>economic data</strong>, choose a chart type and insert it as a sourced
            figure.
          </span>
        </div>
      </div>

      <div className={styles.promptsHeader}>
        <Lightbulb24Regular fontSize={16} />
        Try asking
      </div>
      <div className={styles.promptList}>
        {SUGGESTED_PROMPTS.map((p) => (
          <button key={p} className={styles.prompt} onClick={() => onPick(p)}>
            {p}
          </button>
        ))}
      </div>
    </div>
  );
};
