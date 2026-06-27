import * as React from "react";
import { Switch, Tooltip, makeStyles, tokens } from "@fluentui/react-components";
import { Lens } from "../../services/types";

const useStyles = makeStyles({
  root: {
    display: "flex",
    alignItems: "center",
    whiteSpace: "nowrap",
    paddingRight: "8px",
  },
  switch: {
    fontSize: tokens.fontSizeBase200,
  },
});

export interface LensToggleProps {
  lens: Lens;
  onChange: (lens: Lens) => void;
}

/**
 * Toggles the framing applied to the next question: the default analyst view,
 * or a concise executive summary. Sits beside the Ask/Library tabs.
 */
export const LensToggle: React.FC<LensToggleProps> = ({ lens, onChange }) => {
  const styles = useStyles();
  return (
    <Tooltip
      relationship="description"
      content="Executive lens: concise, bottom-line-first answers for senior readers. Applies to your next question."
    >
      <div className={styles.root}>
        <Switch
          className={styles.switch}
          checked={lens === "executive"}
          onChange={(_, d) => onChange(d.checked ? "executive" : "analyst")}
          label="Executive lens"
          labelPosition="before"
        />
      </div>
    </Tooltip>
  );
};
