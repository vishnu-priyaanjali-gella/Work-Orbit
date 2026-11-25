// Dates are stored as local "YYYY-MM-DD" strings, so they compare correctly as text
// and never shift between time zones.
export function toKey(date) {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

export function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key, n) {
  const date = fromKey(key);
  date.setDate(date.getDate() + n);
  return toKey(date);
}

export function daysBetween(from, to) {
  return Math.round((fromKey(to) - fromKey(from)) / 86400000);
}

// 42 days (6 weeks, Monday first) covering the given month.
export function monthGrid(year, month) {
  const first = new Date(year, month, 1);
  const start = toKey(new Date(year, month, 1 - ((first.getDay() + 6) % 7)));
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export function formatDue(due, today) {
  if (!due) return 'No deadline';
  const diff = daysBetween(today, due);
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  if (diff === -1) return '1 day overdue';
  if (diff < 0) return `${-diff} days overdue`;
  return `Due ${fromKey(due).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`;
}
