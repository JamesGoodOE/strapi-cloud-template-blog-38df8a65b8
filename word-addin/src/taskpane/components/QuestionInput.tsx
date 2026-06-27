import * as React from "react";
import { Button, Textarea, makeStyles, tokens } from "@fluentui/react-components";
import { Send24Filled, Dismiss20Regular } from "@fluentui/react-icons";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    padding: "10px 12px",
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  row: {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
  },
  textarea: {
    flex: 1,
  },
  hint: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },
});

export interface QuestionInputProps {
  onSubmit: (question: string) => void;
  onCancel?: () => void;
  busy: boolean;
}

export const QuestionInput: React.FC<QuestionInputProps> = ({ onSubmit, onCancel, busy }) => {
  const styles = useStyles();
  const [value, setValue] = React.useState("");

  const submit = () => {
    const q = value.trim();
    if (!q || busy) return;
    onSubmit(q);
    setValue("");
  };

  return (
    <div className={styles.root}>
      <div className={styles.row}>
        <Textarea
          className={styles.textarea}
          value={value}
          placeholder="Ask AskOE about Oxford Economics research or data…"
          resize="vertical"
          rows={2}
          disabled={busy}
          onChange={(_, d) => setValue(d.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        {busy && onCancel ? (
          <Button appearance="secondary" icon={<Dismiss20Regular />} onClick={onCancel} aria-label="Cancel" />
        ) : (
          <Button
            appearance="primary"
            icon={<Send24Filled />}
            onClick={submit}
            disabled={!value.trim() || busy}
            aria-label="Ask"
          />
        )}
      </div>
      <span className={styles.hint}>Enter to send · Shift+Enter for a new line</span>
    </div>
  );
};
