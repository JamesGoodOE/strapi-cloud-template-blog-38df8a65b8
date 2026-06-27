/*
 * AskOE for Word — portable local host.
 *
 * Bundled (with Node) into a single Windows .exe via pkg, so it runs with no
 * installation and no admin rights. Double-clicking the .exe serves the
 * pre-built add-in over HTTPS on https://localhost:3000 using an embedded
 * localhost certificate. Word loads the task pane from that URL.
 */
"use strict";

const https = require("https");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PORT = Number(process.env.PORT) || 3000;
const HOST = "127.0.0.1";
const ROOT = path.join(__dirname, "dist");
const CERT_DIR = path.join(__dirname, "certs");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

function contentType(file) {
  return MIME[path.extname(file).toLowerCase()] || "application/octet-stream";
}

const STATUS_PAGE = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>AskOE for Word — local host</title>
<style>
  :root { --navy:#0B1F3A; --blue:#0077C8; }
  body { font-family:"Segoe UI",system-ui,sans-serif; margin:0; background:#F4F7FB; color:var(--navy); }
  .wrap { max-width:680px; margin:0 auto; padding:32px 24px; }
  header { background:linear-gradient(135deg,var(--navy),var(--blue)); color:#fff; padding:24px; border-radius:12px; }
  header h1 { margin:0 0 4px; font-size:22px; }
  header p { margin:0; opacity:.85; }
  .ok { display:inline-block; background:#107C10; color:#fff; border-radius:999px; padding:3px 10px; font-size:13px; margin-top:12px; }
  ol { line-height:1.7; }
  code { background:#fff; border:1px solid #E2E8F0; border-radius:6px; padding:2px 6px; font-size:13px; }
  .card { background:#fff; border:1px solid #E2E8F0; border-radius:12px; padding:20px 24px; margin-top:18px; }
  a { color:var(--blue); }
</style></head>
<body><div class="wrap">
  <header>
    <h1>AskOE for Word</h1>
    <p>Local host is running.</p>
    <div class="ok">● Serving on https://localhost:${PORT}</div>
  </header>
  <div class="card">
    <h3>Finish setup in Word</h3>
    <ol>
      <li>If the browser warned this page is "not secure", install the bundled
          <code>AskOE-localhost.crt</code> into <b>Current User → Trusted Root</b>
          (no admin needed), then reload.</li>
      <li>Open <b>Word</b>.</li>
      <li>Go to <b>Insert → Add-ins → My Add-ins → Upload My Add-in</b>
          (or <b>More Add-ins</b>) and choose the bundled <code>manifest.xml</code>.</li>
      <li>On the <b>Home</b> ribbon, click <b>Oxford Economics → Ask AskOE</b>.</li>
    </ol>
    <p>Keep this window open while you use the add-in. Close it to stop the host.</p>
    <p>The task pane itself loads at
       <a href="/taskpane.html">/taskpane.html</a> (Word opens this automatically).</p>
  </div>
</div></body></html>`;

function notFound(res) {
  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("404 Not Found");
}

function startServer(key, cert) {
  const server = https.createServer({ key, cert }, (req, res) => {
    // Office task panes are framed by Word; permit cross-origin asset loads.
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-cache");

    let urlPath = "/";
    try {
      urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    } catch {
      urlPath = "/";
    }

    if (urlPath === "/" || urlPath === "/index.html") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(STATUS_PAGE);
      return;
    }

    // Resolve against the bundled dist/ and block path traversal.
    const safe = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
    const filePath = path.join(ROOT, safe);
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403);
      res.end("403 Forbidden");
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) return notFound(res);
      res.writeHead(200, { "Content-Type": contentType(filePath) });
      res.end(data);
    });
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\n  ✗ Port ${PORT} is already in use.`);
      console.error(`    Close the other program, or set a different port, e.g.:  set PORT=3001 & AskOE-AddIn.exe\n`);
    } else {
      console.error("\n  ✗ Server error:", err.message, "\n");
    }
    waitAndExit(1);
  });

  server.listen(PORT, HOST, () => {
    banner();
  });
}

function banner() {
  const line = "═".repeat(60);
  console.log("");
  console.log("  " + line);
  console.log("   AskOE for Word — local host is running");
  console.log("  " + line);
  console.log("");
  console.log(`   ●  URL:   https://localhost:${PORT}`);
  console.log("");
  console.log("   Next steps:");
  console.log("   1) First time only: trust the localhost certificate (no admin).");
  console.log("      Double-click  AskOE-localhost.crt  →  Install Certificate");
  console.log("      →  Current User  →  Trusted Root Certification Authorities.");
  console.log("   2) In Word:  Insert → Add-ins → Upload My Add-in → manifest.xml");
  console.log("   3) Home ribbon → Oxford Economics → Ask AskOE.");
  console.log("");
  console.log("   Open https://localhost:" + PORT + " in a browser to see this status page.");
  console.log("   Keep this window OPEN while testing. Close it to stop the host.");
  console.log("");
  console.log("  " + line + "\n");
}

function waitAndExit(code) {
  // Keep the console window open so the user can read messages when launched
  // by double-click (otherwise the window vanishes instantly on exit).
  if (process.platform === "win32") {
    console.log("  Press Ctrl+C to close this window.");
    setInterval(() => {}, 1 << 30);
  } else {
    process.exit(code);
  }
}

function main() {
  let key, cert;
  try {
    key = fs.readFileSync(path.join(CERT_DIR, "localhost-key.pem"));
    cert = fs.readFileSync(path.join(CERT_DIR, "localhost-cert.pem"));
  } catch (e) {
    console.error("  ✗ Could not read the bundled certificate:", e.message);
    return waitAndExit(1);
  }
  void os; // reserved for future diagnostics
  startServer(key, cert);
}

main();
