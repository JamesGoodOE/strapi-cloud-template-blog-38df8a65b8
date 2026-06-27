#!/usr/bin/env bash
#
# Reproducibly build the portable, no-install Windows host for the AskOE
# Word add-in: a single AskOE-AddIn.exe that serves the pre-built add-in over
# HTTPS on https://localhost:3000, plus a distributable bundle.
#
# Output: packaging/bundle/  and  packaging/AskOE-Word-AddIn-portable-win64.zip
#
# Requirements: Node 18+, npm, openssl, zip.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
ADDIN="$HERE/../word-addin"

echo "==> 1/5  Building the add-in production bundle"
( cd "$ADDIN" && npm install --no-audit --no-fund && npm run build )

echo "==> 2/5  Staging dist/"
rm -rf "$HERE/dist" && cp -r "$ADDIN/dist" "$HERE/dist"
cp "$ADDIN/manifest.xml" "$HERE/manifest.xml"

echo "==> 3/5  Generating a localhost certificate (self-signed)"
mkdir -p "$HERE/certs"
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout "$HERE/certs/localhost-key.pem" \
  -out "$HERE/certs/localhost-cert.pem" \
  -days 3650 -subj "/CN=localhost/O=Oxford Economics AskOE Add-in" \
  -addext "subjectAltName=DNS:localhost,DNS:127.0.0.1,IP:127.0.0.1"
cp "$HERE/certs/localhost-cert.pem" "$HERE/AskOE-localhost.crt"

echo "==> 4/5  Compiling the Windows .exe with pkg"
( cd "$HERE" && npm install --no-audit --no-fund )
# --no-bytecode keeps cross-compilation from needing to run a target/host
# Node binary (so it builds on any host, including CI).
"$HERE/node_modules/.bin/pkg" "$HERE" \
  --targets node18-win-x64 --no-bytecode --public --public-packages "*" \
  --output "$HERE/build/AskOE-AddIn.exe"

echo "==> 5/5  Assembling the distributable bundle"
cp "$HERE/build/AskOE-AddIn.exe" "$HERE/bundle/"
cp "$HERE/manifest.xml"          "$HERE/bundle/"
cp "$HERE/AskOE-localhost.crt"   "$HERE/bundle/"
ZIP="$HERE/AskOE-Word-AddIn-portable-win64.zip"
rm -f "$ZIP"
( cd "$HERE/bundle" && zip -r -9 "$ZIP" . )

echo
echo "Done."
echo "  Bundle folder : packaging/bundle/"
echo "  Zip           : $ZIP"
