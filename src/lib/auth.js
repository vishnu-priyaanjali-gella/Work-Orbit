// Browser-only demo login. Passwords are stored as hashes, but anyone using this
// browser can read or edit Local Storage, so do not use real passwords.
export const normalizeEmail = (email) => email.trim().toLowerCase();
export const isEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));

export async function hashPassword(userId, password) {
  const bytes = new TextEncoder().encode(`${userId}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}
