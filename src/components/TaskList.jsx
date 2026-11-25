import TaskCard from './TaskCard.jsx';
import { addDays } from '../lib/dates.js';

export default function TaskList({ tasks, onNew, ...rest }) {
  const { today } = rest;
  const week = addDays(today, 7);
  const open = tasks.filter((t) => t.status !== 'done').sort((a, b) => a.due.localeCompare(b.due));
  const groups = [
    ['Overdue', open.filter((t) => t.due && t.due < today)],
    ['Today', open.filter((t) => t.due === today)],
    ['Next 7 days', open.filter((t) => t.due > today && t.due <= week)],
    ['Later', open.filter((t) => t.due > week)],
    ['No deadline', open.filter((t) => !t.due)],
    ['Completed', tasks.filter((t) => t.status === 'done')],
  ].filter(([, items]) => items.length);

  if (!groups.length) return <p className="muted">No tasks match. Add one with “+ New task”.</p>;

  return (
    <div className="list">
      {groups.map(([label, items]) => (
        <section key={label}>
          <h2>{label} <small>{items.length}</small></h2>
          {items.map((t) => <TaskCard key={t.id} task={t} {...rest} />)}
        </section>
      ))}
    </div>
  );
}
