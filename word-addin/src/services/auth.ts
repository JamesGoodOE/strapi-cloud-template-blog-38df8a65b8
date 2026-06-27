/**
 * Authentication scaffolding.
 *
 * Local development: no token is required — the mock provider needs no auth,
 * and a real HTTP base URL can be pointed at a dev gateway that accepts a
 * static key supplied via `localStorage`.
 *
 * Production (O365 deployment): Word add-ins authenticate the signed-in
 * Microsoft 365 user via Office Single Sign-On. `Office.auth.getAccessToken`
 * returns a bootstrap token that the AskOE backend exchanges (on-behalf-of) for
 * an Oxford Economics access token. This module isolates that flow so the rest
 * of the app only ever asks for "a bearer token".
 *
 * See: https://learn.microsoft.com/office/dev/add-ins/develop/sso-in-office-add-ins
 */

const LOCAL_KEY = "askoe.devApiKey";

/** Returns a bearer token for the AskOE API, or null when running unauthenticated. */
export async function getAccessToken(): Promise<string | null> {
  // 1) Office SSO — available once the add-in is deployed through O365.
  try {
    const auth = (Office as unknown as { auth?: { getAccessToken?: (opts: object) => Promise<string> } }).auth;
    if (auth?.getAccessToken) {
      return await auth.getAccessToken({ allowSignInPrompt: true, allowConsentPrompt: true });
    }
  } catch (err) {
    // Fall through to dev key. SSO is expected to be unavailable when sideloaded locally.
    // eslint-disable-next-line no-console
    console.info("Office SSO unavailable, falling back to dev key.", err);
  }

  // 2) Local development key, set once via setDevApiKey() in the browser console.
  try {
    return window.localStorage.getItem(LOCAL_KEY);
  } catch {
    return null;
  }
}

/** Convenience for local testing: `setDevApiKey("...")` from the dev console. */
export function setDevApiKey(key: string): void {
  window.localStorage.setItem(LOCAL_KEY, key);
}

// Expose for manual local configuration.
(window as unknown as { setDevApiKey?: typeof setDevApiKey }).setDevApiKey = setDevApiKey;
