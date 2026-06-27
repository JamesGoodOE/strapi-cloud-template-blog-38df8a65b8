import * as React from "react";
import {
  SavedChart,
  loadLibrary,
  saveChart as persistSave,
  removeChart as persistRemove,
  renameChart as persistRename,
  clearLibrary as persistClear,
} from "../services/chartLibrary";

interface LibraryContextValue {
  charts: SavedChart[];
  ready: boolean;
  save: (input: Omit<SavedChart, "id" | "createdAt">) => Promise<SavedChart>;
  remove: (id: string) => Promise<void>;
  rename: (id: string, title: string) => Promise<void>;
  clear: () => Promise<void>;
}

const LibraryContext = React.createContext<LibraryContextValue | null>(null);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [charts, setCharts] = React.useState<SavedChart[]>([]);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    loadLibrary().then((c) => {
      if (active) {
        setCharts(c);
        setReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const save = React.useCallback(async (input: Omit<SavedChart, "id" | "createdAt">) => {
    const next = await persistSave(input);
    setCharts(next);
    return next[0];
  }, []);

  const remove = React.useCallback(async (id: string) => {
    setCharts(await persistRemove(id));
  }, []);

  const rename = React.useCallback(async (id: string, title: string) => {
    setCharts(await persistRename(id, title));
  }, []);

  const clear = React.useCallback(async () => {
    setCharts(await persistClear());
  }, []);

  const value = React.useMemo(
    () => ({ charts, ready, save, remove, rename, clear }),
    [charts, ready, save, remove, rename, clear]
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};

export function useLibrary(): LibraryContextValue {
  const ctx = React.useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within a LibraryProvider");
  return ctx;
}
