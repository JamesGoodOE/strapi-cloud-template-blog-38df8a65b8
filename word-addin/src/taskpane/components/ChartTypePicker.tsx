import * as React from "react";
import { makeStyles, tokens, Tooltip } from "@fluentui/react-components";
import {
  DataLine24Regular,
  DataBarVertical24Regular,
  DataBarHorizontal24Regular,
  DataArea24Regular,
  DataPie24Regular,
} from "@fluentui/react-icons";
import { ChartKind } from "../../services/types";

const CHOICES: { kind: ChartKind; label: string; icon: React.ReactElement }[] = [
  { kind: "line", label: "Line", icon: <DataLine24Regular /> },
  { kind: "column", label: "Column", icon: <DataBarVertical24Regular /> },
  { kind: "bar", label: "Bar", icon: <DataBarHorizontal24Regular /> },
  { kind: "area", label: "Area", icon: <DataArea24Regular /> },
  { kind: "pie", label: "Pie", icon: <DataPie24Regular /> },
];

const useStyles = makeStyles({
  root: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  option: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
    minWidth: "52px",
    padding: "6px 4px",
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    cursor: "pointer",
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    transitionProperty: "background-color, border-color, color",
    transitionDuration: tokens.durationFaster,
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      border: `1px solid ${tokens.colorBrandStroke1}`,
    },
  },
  selected: {
    border: `1px solid ${tokens.colorBrandStroke1}`,
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    fontWeight: tokens.fontWeightSemibold,
  },
});

export interface ChartTypePickerProps {
  value: ChartKind;
  onChange: (kind: ChartKind) => void;
  /** Pie only makes sense for a single multi-point series; hide otherwise. */
  allowPie?: boolean;
}

export const ChartTypePicker: React.FC<ChartTypePickerProps> = ({ value, onChange, allowPie = true }) => {
  const styles = useStyles();
  const choices = allowPie ? CHOICES : CHOICES.filter((c) => c.kind !== "pie");

  return (
    <div className={styles.root} role="radiogroup" aria-label="Chart type">
      {choices.map((c) => (
        <Tooltip key={c.kind} content={`${c.label} chart`} relationship="label">
          <div
            role="radio"
            aria-checked={value === c.kind}
            tabIndex={0}
            className={`${styles.option} ${value === c.kind ? styles.selected : ""}`}
            onClick={() => onChange(c.kind)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onChange(c.kind);
              }
            }}
          >
            {c.icon}
            {c.label}
          </div>
        </Tooltip>
      ))}
    </div>
  );
};
