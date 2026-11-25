import TaskCard from './TaskCard.jsx';
import { useDropZone } from './dropZone.js';
import { STATUSES } from '../lib/store.js';

const byDue = (a, b) => (a.due || '9999').localeCompare(b.due || '9999');

export default function Board({ tasks, onNew, ...rest }) {
  const zone = useDropZone((id, status) => rest.dispatch({ type: 'updateTask', id, changes: { status } }));

  return (
    <div className="board">
      {STATUSES.map((s) => {
        const items = tasks.filter((t) => t.status === s.id).sort(byDue);
        return (
          <section key={s.id} className="column" data-status={s.id} {...zone(s.id)}>
            <h2>{s.label} <small>{items.length}</small></h2>
            {items.map((t) => <TaskCard key={t.id} task={t} {...rest} />)}
            {!items.length && <p className="muted empty">Drop tasks here</p>}
            <button className="ghost" onClick={() => onNew({ status: s.id })}>+ Add task</button>
          </section>
        );
      })}
    </div>
  );
}
