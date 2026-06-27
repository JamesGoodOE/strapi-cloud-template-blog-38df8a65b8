# Trusts the AskOE localhost certificate for the CURRENT USER only.
# This does NOT require administrator rights.
#
# Run it by right-clicking this file -> "Run with PowerShell",
# or from a PowerShell window:  .\Trust-Certificate.ps1
#
# To undo later, open "Manage user certificates" (certmgr.msc) ->
# Trusted Root Certification Authorities -> Certificates, and delete "localhost".

$ErrorActionPreference = "Stop"
$cert = Join-Path $PSScriptRoot "AskOE-localhost.crt"

if (-not (Test-Path $cert)) {
    Write-Host "Could not find AskOE-localhost.crt next to this script." -ForegroundColor Red
    exit 1
}

Import-Certificate -FilePath $cert -CertStoreLocation "Cert:\CurrentUser\Root" | Out-Null
Write-Host "Done. The localhost certificate is now trusted for your user account." -ForegroundColor Green
Write-Host "You can now start AskOE-AddIn.exe and load the add-in in Word."
