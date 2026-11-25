import { useState } from 'react';
import Modal from './Modal.jsx';
import { PRIORITIES, STATUSES, uid } from '../lib/store.js';

export default function TaskModal({ task, state, user, isNew, dispatch, onClose }) {
  const [draft, setDraft] = useState(task);
  const [comment, setComment] = useState('');
  const project = state.projects.find((p) => p.id === draft.projectId);
  const set = (key) => (e) => setDraft({ ...draft, [key]: e.target.value });

  const addComment = () => {
    if (!comment.trim()) return;
    const entry = { id: uid(), author: user.name, text: comment.trim() };
    setDraft({ ...draft, comments: [...draft.comments, entry] });
    setComment('');
  };

  const save = (e) => {
    e.preventDefault();
    if (!draft.title.trim()) return;
    // A comment still in the box is saved too, so it is not silently lost.
    const comments = comment.trim()
      ? [...draft.comments, { id: uid(), author: user.name, text: comment.trim() }]
      : draft.comments;
    dispatch({ type: 'saveTask', task: { ...draft, title: draft.title.trim(), comments } });
    onClose();
  };

  return (
    <Modal title={isNew ? 'New task' : 'Edit task'} onClose={onClose}>
      <form onSubmit={save}>
        <label>Title
          <input required autoFocus value={draft.title} onChange={set('title')} />
        </label>
        <label>Description
          <textarea rows="3" value={draft.description} onChange={set('description')} />
        </label>
        <div className="grid">
          <label>Project
            <select value={draft.projectId} onChange={(e) => setDraft({ ...draft, projectId: e.target.value, assigneeId: '' })}>
              {state.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <label>Assignee
            <select value={draft.assigneeId} onChange={set('assigneeId')}>
              <option value="">Unassigned</option>
              {state.members.filter((m) => project?.memberIds.includes(m.id)).map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </label>
          <label>Deadline
            <input type="date" value={draft.due} onChange={set('due')} />
          </label>
          <label>Priority
            <select value={draft.priority} onChange={set('priority')}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>)}
            </select>
          </label>
          <label>Status
            <select value={draft.status} onChange={set('status')}>
              {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
        </div>

        <h3>Comments</h3>
        {draft.comments.map((c) => <p className="comment" key={c.id}><b>{c.author}:</b> {c.text}</p>)}
        <div className="inline">
          <input
            value={comment}
            aria-label="Comment"
            placeholder="Write a comment"
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addComment(); } }}
          />
          <button type="button" onClick={addComment}>Post</button>
        </div>

        <footer>
          {!isNew && (
            <button type="button" className="danger" onClick={() => {
              if (!window.confirm('Delete this task?')) return;
              dispatch({ type: 'deleteTask', id: draft.id });
              onClose();
            }}>Delete</button>
          )}
          <button type="button" onClick={onClose}>Cancel</button>
          <button className="primary">Save task</button>
        </footer>
      </form>
    </Modal>
  );
}
