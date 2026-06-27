import * as React from "react";
import { Badge, makeStyles, tokens } from "@fluentui/react-components";
import { PersonStarRegular } from "@fluentui/react-icons";
import { AskOeAnswer } from "../../services/types";
import { CitationCard } from "./CitationCard";
import { DataAnswerCard } from "./DataAnswerCard";

const useStyles = makeStyles({
  turn: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  question: {
    alignSelf: "flex-end",
    maxWidth: "85%",
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    padding: "8px 12px",
    borderRadius: "12px 12px 2px 12px",
    fontSize: tokens.fontSizeBase300,
  },
  answerBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  answerHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  answerText: {
    fontSize: tokens.fontSizeBase300,
    lineHeight: tokens.lineHeightBase400,
    color: tokens.colorNeutralForeground1,
    margin: 0,
    // Executive answers use line breaks for their bottom-line + bullets.
    whiteSpace: "pre-line",
  },
  sectionLabel: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground2,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginTop: "2px",
  },
  cards: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
});

function kindBadge(kind: AskOeAnswer["kind"]): { text: string; color: "brand" | "success" | "informative" } {
  switch (kind) {
    case "report":
      return { text: "Research", color: "brand" };
    case "data":
      return { text: "Data", color: "success" };
    case "mixed":
      return { text: "Research + Data", color: "informative" };
  }
}

export interface AnswerTurnProps {
  answer: AskOeAnswer;
}

export const AnswerTurn: React.FC<AnswerTurnProps> = ({ answer }) => {
  const styles = useStyles();
  const badge = kindBadge(answer.kind);
  const showReports = answer.kind === "report" || answer.kind === "mixed";
  const showData = (answer.kind === "data" || answer.kind === "mixed") && !!answer.data;
  // For data/mixed answers, the first citation describes the data's provenance.
  const dataSource = answer.citations[0];

  return (
    <div className={styles.turn}>
      <div className={styles.question}>{answer.question}</div>

      <div className={styles.answerBlock}>
        <div className={styles.answerHeader}>
          <Badge appearance="tint" color={badge.color}>
            {badge.text}
          </Badge>
          {answer.lens === "executive" && (
            <Badge appearance="tint" color="important" icon={<PersonStarRegular />}>
              Executive
            </Badge>
          )}
        </div>

        {answer.answer && <p className={styles.answerText}>{answer.answer}</p>}

        {showReports && answer.citations.length > 0 && (
          <>
            <span className={styles.sectionLabel}>
              Insert a quotation {answer.citations.length > 1 ? `(${answer.citations.length} sources)` : ""}
            </span>
            <div className={styles.cards}>
              {answer.citations.map((c) => (
                <CitationCard key={c.id} citation={c} />
              ))}
            </div>
          </>
        )}

        {showData && answer.data && (
          <div className={styles.cards}>
            <DataAnswerCard payload={answer.data} source={dataSource} question={answer.question} />
          </div>
        )}
      </div>
    </div>
  );
};
