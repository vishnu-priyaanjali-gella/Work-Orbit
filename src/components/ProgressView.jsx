import { progress } from '../lib/store.js';

function Row({ label, tasks, today, color }) {
  const s = progress(tasks, today);
  return (
    <div className="progress-row">
      <div>
        <strong>{label}</strong>
        <span className="muted">{s.done}/{s.total} done{s.overdue ? ` · ${s.overdue} overdue` : ''}</span>
        <b>{s.percent}%</b>
      </div>
      <div className="bar"><span style={{ width: `${s.percent}%`, background: color }} /></div>
    </div>
  );
}

// Reflects the current project selection and filters.
export default function ProgressView({ tasks, state, today }) {
  const projects = state.projects.filter((p) => tasks.some((t) => t.projectId === p.id));
  const people = [...state.members, { id: '', name: 'Unassigned' }].filter((m) =>
    tasks.some((t) => t.assigneeId === m.id)
  );
  if (!tasks.length) return <p className="muted">No tasks to measure yet.</p>;

  return (
    <div className="progress">
      <section>
        <h2>By project</h2>
        {projects.map((p) => (
          <Row key={p.id} label={p.name} color={p.color} today={today} tasks={tasks.filter((t) => t.projectId === p.id)} />
        ))}
      </section>
      <section>
        <h2>By person</h2>
        {people.map((m) => (
          <Row key={m.id} label={m.name} today={today} tasks={tasks.filter((t) => t.assigneeId === m.id)} />
        ))}
      </section>
    </div>
  );
}
