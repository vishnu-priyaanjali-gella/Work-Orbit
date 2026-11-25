import { useEffect, useState } from 'react';
import { reminders } from './store.js';
import { formatDue, toKey } from './dates.js';

// Today's date key, refreshed every minute so reminders roll over at midnight.
export function useToday() {
  const [today, setToday] = useState(() => toKey(new Date()));
  useEffect(() => {
    const id = setInterval(() => setToday(toKey(new Date())), 60000);
    return () => clearInterval(id);
  }, []);
  return today;
}

// Desktop notifications, sent once per task per day while the app is open.
export function useDesktopAlerts(tasks, today) {
  const supported = typeof Notification !== 'undefined';
  const [permission, setPermission] = useState(supported ? Notification.permission : 'unsupported');
  const [sent] = useState(() => new Set());

  useEffect(() => {
    if (permission !== 'granted') return;
    for (const t of reminders(tasks, today)) {
      const tag = `${t.id}:${t.due}:${today}`;
      if (sent.has(tag)) continue;
      sent.add(tag);
      try { new Notification(t.title, { body: formatDue(t.due, today), tag }); } catch { /* some mobile browsers refuse */ }
    }
  }, [tasks, today, permission, sent]);

  const enable = () => Notification.requestPermission().then(setPermission);
  return { permission, enable };
}
