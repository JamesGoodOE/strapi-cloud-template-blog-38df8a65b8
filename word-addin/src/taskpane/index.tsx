/* global document, Office */
import * as React from "react";
import { createRoot } from "react-dom/client";
import { FluentProvider } from "@fluentui/react-components";
import { App } from "./components/App";
import { LibraryProvider } from "./LibraryContext";
import { oxfordLightTheme } from "./theme";
import "./taskpane.css";

/* Render only once the Office host is ready, so Word.run is available. */
Office.onReady((info) => {
  const container = document.getElementById("container");
  if (!container) return;
  const root = createRoot(container);

  if (info.host === Office.HostType.Word) {
    root.render(
      <FluentProvider theme={oxfordLightTheme}>
        <LibraryProvider>
          <App />
        </LibraryProvider>
      </FluentProvider>
    );
  } else {
    root.render(
      <FluentProvider theme={oxfordLightTheme}>
        <div style={{ padding: 16, fontFamily: "Segoe UI, sans-serif" }}>
          <h3>AskOE for Word</h3>
          <p>This add-in is designed to run inside Microsoft Word.</p>
        </div>
      </FluentProvider>
    );
  }
});
