import * as React from "react";
import { Chart as ReactChart } from "react-chartjs-2";
import "../../charts/register";
import { buildChartConfig, toChartJsType } from "../../charts/buildChartConfig";
import { ChartKind, DataPayload } from "../../services/types";
import { makeStyles, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
  frame: {
    position: "relative",
    height: "220px",
    width: "100%",
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: "8px",
    boxSizing: "border-box",
  },
});

export interface ChartPreviewProps {
  payload: DataPayload;
  kind: ChartKind;
}

/** Live in-task-pane preview of exactly what will be inserted into the document. */
export const ChartPreview: React.FC<ChartPreviewProps> = ({ payload, kind }) => {
  const styles = useStyles();
  const config = React.useMemo(() => buildChartConfig(payload, kind, false), [payload, kind]);

  return (
    <div className={styles.frame}>
      <ReactChart
        type={toChartJsType(kind)}
        data={config.data}
        options={config.options}
        // Remount on kind change so Chart.js switches controllers cleanly.
        key={kind}
      />
    </div>
  );
};
