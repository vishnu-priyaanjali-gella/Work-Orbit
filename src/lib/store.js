import { addDays, daysBetween, toKey } from './dates.js';

export const STATUSES = [
  { id: 'todo', label: 'To do' },
  { id: 'doing', label: 'In progress' },
  { id: 'done', label: 'Done' },
];
export const PRIORITIES = ['high', 'medium', 'low'];
export const COLORS = ['#047857', '#7c3aed', '#d97706', '#db2777', '#2563eb', '#dc2626'];

export const uid = () => Math.random().toString(36).slice(2, 10);

export const ADMIN = {
  id: 'admin', name: 'Administrator', email: 'admin@task.com', role: 'admin',
  // SHA-256 of the demo password shown on the login page.
  passwordHash: 'bf6b5bdb74c79ece9fc0ad0ac9fb0359f9555d4f35a83b2e6ec69ae99e09603d',
};

export const initialState = () => ({ users: [ADMIN], projects: [], tasks: [] });

// Sample project given to each new account.
export function starterData(userId, today = toKey(new Date())) {
  const projectId = `start-${userId}`;
  const task = (n, title, status, priority, offset) => ({
    id: `${projectId}-${n}`, projectId, title, status, priority, assigneeId: userId,
    description: '', due: offset === null ? '' : addDays(today, offset), comments: [],
  });
  return {
    project: { id: projectId, name: 'Getting Started', color: COLORS[0], ownerId: userId, memberIds: [userId] },
    tasks: [
      task(1, 'Create your account', 'done', 'low', 0),
      task(2, 'Add your first task', 'doing', 'high', 1),
      task(3, 'Drag a task onto the calendar', 'todo', 'medium', null),
    ],
  };
}

export function reducer(state, action) {
  const mapTask = (id, fn) => ({ ...state, tasks: state.tasks.map((t) => (t.id === id ? fn(t) : t)) });
  switch (action.type) {
    case 'saveTask': {
      const exists = state.tasks.some((t) => t.id === action.task.id);
      return exists
        ? mapTask(action.task.id, () => action.task)
        : { ...state, tasks: [...state.tasks, action.task] };
    }
    case 'updateTask':
      return mapTask(action.id, (t) => ({ ...t, ...action.changes }));
    case 'deleteTask':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };
    case 'addProject':
      return { ...state, projects: [...state.projects, action.project] };
    case 'deleteProject':
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.id),
        tasks: state.tasks.filter((t) => t.projectId !== action.id),
      };
    case 'register': {
      if (state.users.some((u) => u.email === action.user.email)) return state;
      const { project, tasks } = starterData(action.user.id, action.today);
      return {
        users: [...state.users, action.user],
        projects: [...state.projects, project],
        tasks: [...state.tasks, ...tasks],
      };
    }
    case 'deleteUser': {
      if (action.id === ADMIN.id) return state;
      // Shared projects pass to another member; projects with no one left are removed.
      const projects = state.projects
        .map((p) => {
          const memberIds = p.memberIds.filter((m) => m !== action.id);
          return { ...p, memberIds, ownerId: p.ownerId === action.id ? memberIds[0] : p.ownerId };
        })
        .filter((p) => p.memberIds.length);
      const kept = new Set(projects.map((p) => p.id));
      return {
        users: state.users.filter((u) => u.id !== action.id),
        projects,
        tasks: state.tasks
          .filter((t) => kept.has(t.projectId))
          .map((t) => (t.assigneeId === action.id ? { ...t, assigneeId: '' } : t)),
      };
    }
    case 'updateUser': {
      const { name, email, passwordHash } = action.changes;
      const taken = state.users.some((u) => u.email === email && u.id !== action.id);
      if (action.id === ADMIN.id || taken) return state;
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.id ? { ...u, name, email, ...(passwordHash && { passwordHash }) } : u
        ),
      };
    }
    case 'addMember':
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.projectId && !p.memberIds.includes(action.memberId)
            ? { ...p, memberIds: [...p.memberIds, action.memberId] }
            : p
        ),
      };
    case 'removeMember':
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.projectId ? { ...p, memberIds: p.memberIds.filter((m) => m !== action.memberId) } : p
        ),
        tasks: state.tasks.map((t) =>
          t.projectId === action.projectId && t.assigneeId === action.memberId ? { ...t, assigneeId: '' } : t
        ),
      };
    case 'importProject': {
      const { data, userId } = action;
      if (importBlocked(state, data, userId)) return state;
      // People are matched by email; anyone without an account here is left out.
      const localId = new Map();
      for (const m of data.members) {
        const user = state.users.find((u) => u.email === m.email && u.role !== 'admin');
        if (user) localId.set(m.id, user.id);
      }
      const existing = state.projects.find((p) => p.id === data.project.id);
      const memberIds = [...new Set([...(existing?.memberIds ?? []), userId, ...localId.values()])];
      const project = {
        id: data.project.id, name: data.project.name,
        color: COLORS.includes(data.project.color) ? data.project.color : COLORS[0],
        ownerId: existing?.ownerId ?? userId, memberIds,
      };
      const tasks = data.tasks.map((t) => ({ ...t, assigneeId: localId.get(t.assigneeId) ?? '' }));
      const ids = new Set(tasks.map((t) => t.id));
      return {
        ...state,
        projects: [...state.projects.filter((p) => p.id !== project.id), project],
        tasks: [...state.tasks.filter((t) => !ids.has(t.id)), ...tasks],
      };
    }
    case 'replace':
      return action.state;
    default:
      return state;
  }
}

// An import may not overwrite a project the user does not belong to, or another project's tasks.
export function importBlocked(state, data, userId) {
  const existing = state.projects.find((p) => p.id === data.project.id);
  if (existing && !existing.memberIds.includes(userId)) return true;
  const ids = new Set(data.tasks.map((t) => t.id));
  return state.tasks.some((t) => ids.has(t.id) && t.projectId !== data.project.id);
}

export function exportProject(state, projectId) {
  const project = state.projects.find((p) => p.id === projectId);
  const tasks = state.tasks.filter((t) => t.projectId === projectId);
  // Only names and emails leave the app, never password hashes.
  const members = state.users
    .filter((u) => project.memberIds.includes(u.id))
    .map(({ id, name, email }) => ({ id, name, email }));
  return { project, members, tasks };
}

export function parseImport(text) {
  const data = JSON.parse(text);
  const str = (v) => typeof v === 'string';
  const ok =
    data && str(data.project?.id) && str(data.project?.name) && Array.isArray(data.project.memberIds) &&
    Array.isArray(data.members) && data.members.every((m) => str(m?.id) && str(m?.name) && str(m?.email)) &&
    Array.isArray(data.tasks) &&
    data.tasks.every(
      (t) => str(t?.id) && str(t?.title) && str(t?.due) && str(t?.description) && Array.isArray(t.comments) &&
        t.comments.every((c) => str(c?.id) && str(c?.author) && str(c?.text)) &&
        t.projectId === data.project.id && STATUSES.some((s) => s.id === t.status) && PRIORITIES.includes(t.priority)
    );
  if (!ok) throw new Error('This is not a valid project file.');
  return data;
}

// Unfinished tasks that are overdue or due within `window` days, most urgent first.
export function reminders(tasks, today, window = 2) {
  return tasks
    .filter((t) => t.status !== 'done' && t.due && daysBetween(today, t.due) <= window)
    .sort((a, b) => a.due.localeCompare(b.due));
}

export function progress(tasks, today) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const overdue = tasks.filter((t) => t.status !== 'done' && t.due && t.due < today).length;
  return { total, done, overdue, percent: total ? Math.round((done / total) * 100) : 0 };
}
