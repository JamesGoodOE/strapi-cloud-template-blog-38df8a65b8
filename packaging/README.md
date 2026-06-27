# Portable Windows host for AskOE for Word

Packages the pre-built add-in into a **single `AskOE-AddIn.exe`** that runs with
**no installation and no administrator rights**. The exe bundles Node and a tiny
HTTPS server that serves the add-in at `https://localhost:3000`; Word then loads
the task pane from that URL. This is the no-admin alternative to `npm start`
(which requires installing Node).

> An Office add-in is a web app loaded by Word from a URL — it can't itself be a
> native executable. This exe is therefore a self-contained **local host** for
> the add-in, not the add-in compiled to machine code.

## Files

| File | Purpose |
| --- | --- |
| `server.js` | The HTTPS static server (serves `dist/` + a status page). Bundled into the exe. |
| `package.json` | `pkg` configuration (embeds `dist/**` and `certs/**`, targets `node18-win-x64`). |
| `build.sh` | One command to build the exe and the distributable zip. |
| `bundle/START-HERE.txt` | End-user setup instructions (shipped in the zip). |
| `bundle/Trust-Certificate.ps1` | No-admin helper that trusts the localhost cert for the current user. |

Generated artifacts (`dist/`, `certs/`, `build/`, the copied `manifest.xml`/`*.crt`
in `bundle/`, and the zip) are git-ignored and recreated by `build.sh`. The
self-signed private key is intentionally **not** committed.

## Build

```bash
cd packaging
./build.sh
```

Produces `packaging/bundle/` and `packaging/AskOE-Word-AddIn-portable-win64.zip`.

### Notes

- `build.sh` uses `pkg --no-bytecode` so it cross-compiles to Windows from any
  host (incl. Linux/CI) without needing to execute a Windows Node binary.
- The first `pkg` run downloads a Windows Node base binary into `~/.pkg-cache`.
  In a restricted network you can pre-place it as
  `~/.pkg-cache/v3.5/fetched-v18.20.4-win-x64` from the
  [pkg-fetch releases](https://github.com/yao-pkg/pkg-fetch/releases/tag/v3.5).
- The exe is **unsigned**, so Windows SmartScreen warns once ("More info →
  Run anyway"). Code-signing requires a signing certificate and is not needed
  for local testing.
- Change the port with `set PORT=3001 & AskOE-AddIn.exe` (also update
  `manifest.xml`).
