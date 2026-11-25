import { formatDue } from '../lib/dates.js';

export default function TaskCard({ task, state, dispatch, today, onOpen }) {
  const project = state.projects.find((p) => p.id === task.projectId);
  const person = state.members.find((m) => m.id === task.assigneeId);
  const done = task.status === 'done';
  const overdue = !done && task.due && task.due < today;

  return (
    <article
      className={`card ${done ? 'done' : ''}`}
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/task', task.id)}
      style={{ borderLeftColor: project?.color }}
    >
      <input
        type="checkbox"
        checked={done}
        aria-label={`Mark "${task.title}" ${done ? 'incomplete' : 'complete'}`}
        onChange={() => dispatch({ type: 'updateTask', id: task.id, changes: { status: done ? 'todo' : 'done' } })}
      />
      <button className="card-body" onClick={() => onOpen(task)}>
        <strong>{task.title}</strong>
        <span className="meta">
          <em className={`pill ${task.priority}`}>{task.priority}</em>
          <span className={overdue ? 'overdue' : ''}>
            {done ? 'Completed' : formatDue(task.due, today)}
          </span>
          {person && <span>👤 {person.name}</span>}
          {task.comments.length > 0 && <span>💬 {task.comments.length}</span>}
        </span>
      </button>
    </article>
  );
}
