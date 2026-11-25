import { useState } from 'react';
import { useDropZone } from './dropZone.js';
import { fromKey, monthGrid } from '../lib/dates.js';

export default function Calendar({ tasks, state, dispatch, today, onOpen, onNew }) {
  const [cursor, setCursor] = useState(() => {
    const d = fromKey(today);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const zone = useDropZone((id, key) =>
    dispatch({ type: 'updateTask', id, changes: { due: key === 'none' ? '' : key } })
  );
  const move = (n) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1));

  const chip = (t) => (
    <button
      key={t.id}
      className={`chip ${t.status === 'done' ? 'done' : ''}`}
      style={{ borderLeftColor: state.projects.find((p) => p.id === t.projectId)?.color }}
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/task', t.id)}
      onClick={() => onOpen(t)}
      title={t.title}
    >
      {t.title}
    </button>
  );

  return (
    <div>
      <div className="cal-head">
        <button onClick={() => move(-1)} aria-label="Previous month">‹</button>
        <h2>{cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2>
        <button onClick={() => move(1)} aria-label="Next month">›</button>
        <span className="muted">Drag a task onto a date to schedule it.</span>
      </div>
      <div className="unscheduled" {...zone('none')}>
        <b>Unscheduled</b>
        {tasks.filter((t) => !t.due).map(chip)}
      </div>
      <div className="calendar-scroll">
        <div className="calendar">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <b key={d}>{d}</b>)}
          {monthGrid(cursor.getFullYear(), cursor.getMonth()).map((key) => {
            const date = fromKey(key);
            const outside = date.getMonth() !== cursor.getMonth();
            return (
              <div key={key} data-date={key} className={`day ${outside ? 'outside' : ''} ${key === today ? 'today' : ''}`} {...zone(key)}>
                <button className="date" onClick={() => onNew({ due: key })} aria-label={`Add task on ${key}`}>
                  {date.getDate()}
                </button>
                {tasks.filter((t) => t.due === key).map(chip)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
