/* global Office */

/**
 * Ribbon command function-file. The primary ribbon button uses ShowTaskpane,
 * so it opens the task pane directly without JS, but this handler is registered
 * for any future action-based commands and keeps the manifest's FunctionFile
 * contract satisfied.
 */
Office.onReady(() => {
  // No-op: ready for action commands.
});

/** Example action command, wired up for future use. */
function openAskOe(event: Office.AddinCommands.Event): void {
  // Action commands could, for example, run a saved query. For now we simply
  // complete so Office knows the handler finished.
  event.completed();
}

// Register so Office can resolve the function by name from the manifest.
Office.actions.associate("openAskOe", openAskOe);
