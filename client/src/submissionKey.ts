// Retain only a payload digest and random key in this tab, never customer details.
// A lost response or remounted form can retry the same request safely.
export async function submissionKey(body: string): Promise<{ key: string; storageKey: string }> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body));
  const storageKey = `wyztec-quote-${Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')}`;
  try {
    const existing = sessionStorage.getItem(storageKey);
    if (existing && /^[0-9a-f-]{36}$/i.test(existing)) return { key: existing, storageKey };
  } catch {
    /* The component also retains the key when browser storage is disabled. */
  }
  const key = crypto.randomUUID();
  try {
    sessionStorage.setItem(storageKey, key);
  } catch {
    /* Use the in-memory key. */
  }
  return { key, storageKey };
}
