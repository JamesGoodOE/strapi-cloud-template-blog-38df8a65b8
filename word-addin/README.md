# AskOE for Word

A Microsoft Word add-in that brings **Oxford Economics AskOE** into the document.
Ask natural-language questions and, depending on what the answer is grounded in:

- **Economic Reports** → insert the quotation with a fully formatted **Oxford Economics citation** (report name, author, date, link).
- **Economic Data** → choose a **chart type** (line, column, bar, area, pie), preview it, and insert it as a sourced figure.
- **Mixed answers** surface both actions.

Every chart you generate can be **saved to a built-in chart library** and re-styled
or re-inserted into any document later — the underlying data is stored, not just an
image, so saved charts stay fully editable.

The add-in runs **locally today** and is structured to **deploy through Microsoft 365**
with Single Sign-On against the live AskOE API with no UI changes.

---

## Tech stack

| Concern        | Choice                                                            |
| -------------- | ----------------------------------------------------------------- |
| Host API       | Office.js (Word)                                                  |
| UI             | React 18 + Fluent UI v9 (Oxford Economics brand theme)            |
| Charts         | Chart.js + react-chartjs-2 (preview = embedded image, 1:1)        |
| Build          | TypeScript + Webpack 5                                             |
| Tooling        | `office-addin-*` (dev-certs, debugging, manifest validation)      |

## Project layout

```
word-addin/
├── manifest.xml                 Add-in manifest (sideload + O365)
├── webpack.config.js            Build + HTTPS dev server + env injection
├── assets/                      Icons (placeholder OE marks — replace with brand assets)
└── src/
    ├── services/
    │   ├── types.ts             Domain model (answers, citations, data series)
    │   ├── askoe.ts             AskOE client: mock + real HTTP providers
    │   ├── mockData.ts          Deterministic sample answers for local demo
    │   ├── auth.ts              Office SSO + dev-key token flow
    │   └── chartLibrary.ts      Persisted library of saved charts
    ├── charts/
    │   ├── buildChartConfig.ts  Shared Chart.js config (preview == inserted image)
    │   └── register.ts          One-time Chart.js registration
    ├── office/
    │   ├── insertCitation.ts    Quotation + citation insertion into Word
    │   └── insertChart.ts       Off-screen render → inline picture insertion
    ├── taskpane/                React UI (Ask + Library tabs, components, theme)
    └── commands/                Ribbon command function-file
```

## Run locally

Prerequisites: Node 18+ and desktop **Word** (Windows or Mac), or Word on the web.

```bash
cd word-addin
npm install
npm start          # builds, starts the HTTPS dev server, sideloads into Word
```

`npm start` uses `office-addin-debugging` to trust a local dev certificate, start
the dev server on <https://localhost:3000>, and sideload `manifest.xml` into Word.
On the **Home** ribbon tab you'll see an **Oxford Economics → Ask AskOE** button that
opens the task pane.

No credentials are needed locally: the add-in defaults to the **mock provider** and
returns representative sample answers (a "Demo data" badge is shown in the header).

Other useful scripts:

```bash
npm run dev-server   # just the webpack dev server
npm run build        # production bundle into dist/
npm run validate     # validate manifest.xml
npm run typecheck    # tsc --noEmit
npm stop             # stop debugging / unsideload
```

## Connecting to the real AskOE API

The data layer is provider-based (`src/services/askoe.ts`) so the UI never changes:

1. Set build-time config (see `.env.example`):
   ```
   ASKOE_PROVIDER=http
   ASKOE_API_BASE=https://api.oxfordeconomics.com/askoe/v1
   ```
2. The HTTP provider `POST`s `{ question, conversationId }` to `{base}/ask` and
   normalises the response into the domain model. It tolerates a server that does
   not classify answers — `report` vs `data` vs `mixed` is inferred from whether
   the payload carries citations, data series, or both.
3. You can also flip providers at runtime for demos:
   `localStorage.setItem("askoe.provider", "http" | "mock")`.

Expected response shape (see `AskOeAnswer` in `types.ts`):

```jsonc
{
  "conversationId": "…",
  "id": "…",
  "answer": "…",
  "kind": "report | data | mixed",      // optional; inferred if omitted
  "citations": [
    { "reportTitle": "…", "author": "…", "publicationDate": "ISO", "locator": "p. 4", "url": "…", "excerpt": "…" }
  ],
  "data": {
    "summary": "…",
    "series": [
      { "id": "…", "name": "Real GDP, % year", "location": "United States",
        "units": "% year", "frequency": "Annual", "source": "Global Economic Model",
        "observations": [ { "date": "2024-01-01", "value": 2.5 } ] }
    ]
  }
}
```

## Deploying through Microsoft 365 (future)

1. Host the built `dist/` on HTTPS (e.g. Azure Static Web Apps / your CDN).
2. In `webpack.config.js`, set `urlProd` to that host — production builds rewrite the
   manifest's `https://localhost:3000` URLs automatically.
3. Generate a new GUID for `<Id>` in `manifest.xml`.
4. Wire authentication: `src/services/auth.ts` already calls
   `Office.auth.getAccessToken` (Office SSO). Register an Azure AD app, add a
   `WebApplicationInfo` block to the manifest, and have the AskOE backend perform the
   on-behalf-of exchange for an Oxford Economics token.
5. Distribute via the Microsoft 365 admin center (**Integrated Apps**) or AppSource.

## Notes

- Icons in `assets/` are generated placeholders in OE navy — replace with official
  Oxford Economics brand assets before publishing.
- Charts are inserted as high-DPI PNG images so they render identically everywhere
  and travel with the document. The chart library keeps the source data, so a saved
  chart can be re-inserted at a different chart type at any time.
