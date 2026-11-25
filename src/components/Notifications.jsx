import { useState } from 'react';
import { formatDue } from '../lib/dates.js';

export default function Notifications({ tasks, today, alerts, onOpen }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="notify" onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}>
      <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label={`${tasks.length} deadline reminders`}>
        🔔 {tasks.length > 0 && <span className="badge">{tasks.length}</span>}
      </button>
      {open && (
        <div className="popover">
          <h3>Deadline reminders</h3>
          {!tasks.length && <p className="muted">Nothing due in the next 2 days.</p>}
          {tasks.map((t) => (
            <button key={t.id} className="reminder" onClick={() => { setOpen(false); onOpen(t); }}>
              <strong>{t.title}</strong>
              <span className={t.due < today ? 'overdue' : 'muted'}>{formatDue(t.due, today)}</span>
            </button>
          ))}
          {alerts.permission === 'default' && <button className="primary" onClick={alerts.enable}>Enable desktop alerts</button>}
          {alerts.permission === 'granted' && <p className="muted">Desktop alerts are on while this app is open.</p>}
          {alerts.permission === 'denied' && <p className="muted">Desktop alerts are blocked in your browser settings.</p>}
        </div>
      )}
    </div>
  );
}
