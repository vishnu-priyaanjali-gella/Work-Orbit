// All Local Storage access is here: read, write and remove.
import { ADMIN, initialState } from './store.js';

export const DATA_KEY = 'workorbit:data';
// Each portal has its own login session.
export const SESSION_KEY = 'workorbit:session';
export const ADMIN_SESSION_KEY = 'workorbit:admin-session';

export function parseData(json) {
  try {
    const data = JSON.parse(json);
    const valid = [data?.users, data?.projects, data?.tasks].every(Array.isArray);
    if (!valid) return null;
    // The demo administrator is always available.
    return data.users.some((u) => u.id === ADMIN.id) ? data : { ...data, users: [ADMIN, ...data.users] };
  } catch {
    return null;
  }
}

export function loadData() {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (raw === null) return initialState();
    const data = parseData(raw);
    if (data) return data;
    // Keep a copy of unreadable data before starting again.
    localStorage.setItem(`${DATA_KEY}:backup`, raw);
  } catch { /* storage is blocked */ }
  return initialState();
}

export function saveData(data) {
  try {
    const json = JSON.stringify(data);
    if (localStorage.getItem(DATA_KEY) !== json) localStorage.setItem(DATA_KEY, json);
    return true;
  } catch {
    return false;
  }
}

export function loadSession(key = SESSION_KEY) {
  try { return localStorage.getItem(key); } catch { return null; }
}

export function saveSession(userId, key = SESSION_KEY) {
  try {
    if (userId) localStorage.setItem(key, userId);
    else localStorage.removeItem(key);
  } catch { /* keep the session in memory */ }
}
