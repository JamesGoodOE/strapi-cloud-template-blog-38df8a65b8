import * as React from "react";
import {
  makeStyles,
  tokens,
  Spinner,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  TabList,
  Tab,
  CounterBadge,
} from "@fluentui/react-components";
import { ChatSparkleRegular, LibraryRegular } from "@fluentui/react-icons";
import { Header } from "./Header";
import { EmptyState } from "./EmptyState";
import { AnswerTurn } from "./AnswerTurn";
import { QuestionInput } from "./QuestionInput";
import { LibraryView } from "./LibraryView";
import { LensToggle } from "./LensToggle";
import { useLibrary } from "../LibraryContext";
import { ask, AskOeError } from "../../services/askoe";
import { AskOeAnswer, Lens } from "../../services/types";

const LENS_KEY = "askoe.lens";

function initialLens(): Lens {
  try {
    return window.localStorage.getItem(LENS_KEY) === "executive" ? "executive" : "analyst";
  } catch {
    return "analyst";
  }
}

const useStyles = makeStyles({
  app: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: tokens.colorNeutralBackground2,
  },
  tabBar: {
    display: "flex",
    alignItems: "center",
    backgroundColor: tokens.colorNeutralBackground1,
    paddingInline: "8px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  tabs: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    overflowY: "auto",
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  thinking: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase200,
    padding: "2px",
  },
  tabLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  },
});

type TabValue = "ask" | "library";

export const App: React.FC = () => {
  const styles = useStyles();
  const { charts } = useLibrary();
  const [tab, setTab] = React.useState<TabValue>("ask");
  const [lens, setLens] = React.useState<Lens>(initialLens);
  const [turns, setTurns] = React.useState<AskOeAnswer[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [conversationId, setConversationId] = React.useState<string | undefined>(undefined);
  const abortRef = React.useRef<AbortController | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (tab === "ask") {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [turns, busy, tab]);

  const changeLens = (next: Lens) => {
    setLens(next);
    try {
      window.localStorage.setItem(LENS_KEY, next);
    } catch {
      /* localStorage unavailable */
    }
  };

  const handleSubmit = async (question: string) => {
    setTab("ask");
    setBusy(true);
    setError(null);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const answer = await ask({ question, conversationId, lens, signal: controller.signal });
      setTurns((prev) => [...prev, answer]);
      setConversationId(answer.conversationId);
    } catch (err) {
      if ((err as DOMException)?.name === "AbortError") {
        // User cancelled — no error surfaced.
      } else if (err instanceof AskOeError) {
        setError(err.message);
      } else {
        setError("Something went wrong contacting AskOE. Please try again.");
        // eslint-disable-next-line no-console
        console.error(err);
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  };

  const handleCancel = () => abortRef.current?.abort();

  return (
    <div className={styles.app}>
      <Header />

      <div className={styles.tabBar}>
        <TabList
          className={styles.tabs}
          selectedValue={tab}
          onTabSelect={(_, d) => setTab(d.value as TabValue)}
          size="small"
        >
          <Tab value="ask" icon={<ChatSparkleRegular />}>
            Ask
          </Tab>
          <Tab value="library">
            <span className={styles.tabLabel}>
              <LibraryRegular /> Library
              {charts.length > 0 && (
                <CounterBadge count={charts.length} size="small" appearance="filled" color="brand" />
              )}
            </span>
          </Tab>
        </TabList>
        <LensToggle lens={lens} onChange={changeLens} />
      </div>

      {tab === "ask" ? (
        <>
          <div className={styles.scroll} ref={scrollRef}>
            {turns.length === 0 && !busy && <EmptyState onPick={handleSubmit} />}
            {turns.map((t) => (
              <AnswerTurn key={t.id} answer={t} />
            ))}
            {busy && (
              <div className={styles.thinking}>
                <Spinner size="tiny" />
                AskOE is thinking…
              </div>
            )}
            {error && (
              <MessageBar intent="error">
                <MessageBarBody>
                  <MessageBarTitle>Couldn’t get an answer</MessageBarTitle>
                  {error}
                </MessageBarBody>
              </MessageBar>
            )}
          </div>
          <QuestionInput onSubmit={handleSubmit} onCancel={handleCancel} busy={busy} />
        </>
      ) : (
        <div className={styles.scroll}>
          <LibraryView />
        </div>
      )}
    </div>
  );
};
