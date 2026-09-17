// ============================================================
// Guest ID management — anonymous user identity in localStorage.
// A guest_id is a random UUID generated on first visit.
// It persists across sessions until the user authenticates,
// at which point scans are migrated to their auth user_id.
// ============================================================

const GUEST_ID_KEY = 'inkquest_guest_id';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Returns the guest_id from localStorage, creating one if it doesn't exist.
 * Returns null in SSR/non-browser environments.
 */
export function getOrCreateGuestId(): string | null {
  if (typeof window === 'undefined') return null;

  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = generateUUID();
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
}

/**
 * Clears the guest_id from localStorage.
 * Call this AFTER successfully migrating guest scans to an authenticated user.
 */
export function clearGuestId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_ID_KEY);
}

/**
 * Gets the guest_id without creating a new one.
 * Returns null if no guest session exists.
 */
export function getGuestId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(GUEST_ID_KEY);
}
