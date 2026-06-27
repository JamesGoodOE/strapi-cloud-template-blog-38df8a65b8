import * as React from "react";
import { makeStyles, tokens, Badge, Tooltip } from "@fluentui/react-components";
import { OE } from "../theme";
import { activeProviderName } from "../../services/askoe";

const useStyles = makeStyles({
  root: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 14px",
    background: `linear-gradient(135deg, ${OE.navy} 0%, ${OE.blue} 100%)`,
    color: "#ffffff",
  },
  mark: {
    width: "28px",
    height: "28px",
    flexShrink: 0,
  },
  titles: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.2,
  },
  product: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
  },
  org: {
    fontSize: tokens.fontSizeBase200,
    opacity: 0.85,
  },
  spacer: {
    flex: 1,
  },
});

export const Header: React.FC = () => {
  const styles = useStyles();
  const provider = activeProviderName();

  return (
    <header className={styles.root}>
      {/* Inline hexagon mark in brand colours — no external asset needed. */}
      <svg className={styles.mark} viewBox="0 0 32 32" aria-hidden="true">
        <polygon points="16,2 29,9.5 29,22.5 16,30 3,22.5 3,9.5" fill="#ffffff" opacity="0.16" />
        <polygon points="16,7 24,11.5 24,20.5 16,25 8,20.5 8,11.5" fill="#ffffff" />
        <text x="16" y="20" textAnchor="middle" fontSize="10" fontWeight="700" fill={OE.navy}>
          OE
        </text>
      </svg>
      <div className={styles.titles}>
        <span className={styles.product}>AskOE for Word</span>
        <span className={styles.org}>Oxford Economics</span>
      </div>
      <div className={styles.spacer} />
      {provider === "mock" && (
        <Tooltip
          content="Running with sample data. Configure ASKOE_API_BASE to connect to the live AskOE API."
          relationship="label"
        >
          <Badge appearance="filled" color="warning" size="small">
            Demo data
          </Badge>
        </Tooltip>
      )}
    </header>
  );
};
