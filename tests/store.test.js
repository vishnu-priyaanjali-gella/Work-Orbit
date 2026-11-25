import test from 'node:test';
import assert from 'node:assert/strict';
import { ADMIN, exportProject, initialState, parseImport, progress, reducer, reminders } from '../src/lib/store.js';
import { addDays, monthGrid } from '../src/lib/dates.js';
import { hashPassword } from '../src/lib/auth.js';
import { ADMIN_SESSION_KEY, DATA_KEY, SESSION_KEY, loadData, loadSession, saveData, saveSession } from '../src/lib/storage.js';

const today = '2026-03-10';
const person = (id) => ({ id, name: id, email: `${id}@x.com`, role: 'user', passwordHash: 'h' });
const setup = () =>
  ['ana', 'ben'].reduce((s, id) => reducer(s, { type: 'register', user: person(id), today }), initialState());

test('registering creates a starter project and rejects duplicate emails', () => {
  const s = setup();
  assert.equal(s.projects.length, 2);
  assert.equal(reducer(s, { type: 'register', user: person('ana'), today }), s);
});

test('completing a task updates progress and reminders', () => {
  const s = setup();
  const next = reducer(s, { type: 'updateTask', id: 'start-ana-2', changes: { status: 'done' } });
  assert.equal(progress(next.tasks, today).done, progress(s.tasks, today).done + 1);
  assert.ok(!reminders(next.tasks, today).some((t) => t.id === 'start-ana-2'));
});

test('deleting a user hands shared projects to a remaining member', () => {
  const shared = reducer(setup(), { type: 'addMember', projectId: 'start-ana', memberId: 'ben' });
  const next = reducer(shared, { type: 'deleteUser', id: 'ana' });
  assert.equal(next.projects.find((p) => p.id === 'start-ana').ownerId, 'ben');
  assert.ok(next.tasks.every((t) => t.assigneeId !== 'ana'));
  assert.equal(reducer(next, { type: 'deleteUser', id: 'admin' }), next);
});

test('export omits private fields, import restores, outsiders cannot overwrite', () => {
  const s = setup();
  const json = JSON.stringify(exportProject(s, 'start-ana'));
  assert.ok(!json.includes('passwordHash'));
  const data = parseImport(json);
  assert.equal(reducer(s, { type: 'importProject', data, userId: 'ben' }), s);
  const without = reducer(s, { type: 'deleteProject', id: 'start-ana' });
  const restored = reducer(without, { type: 'importProject', data, userId: 'ana' });
  assert.equal(restored.tasks.length, s.tasks.length);
  assert.throws(() => parseImport('{"project":{}}'));
});

test('date helpers cross month and year boundaries', () => {
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(monthGrid(2026, 10)[0], '2026-10-26');
});

test('demo admin password matches', async () => {
  assert.equal(await hashPassword(ADMIN.id, 'admin123'), ADMIN.passwordHash);
});

test('admin can edit a user but not take another email', () => {
  const s = setup();
  const next = reducer(s, { type: 'updateUser', id: 'ana', changes: { name: 'Ana R', email: 'ana.r@x.com' } });
  const ana = next.users.find((u) => u.id === 'ana');
  assert.deepEqual([ana.name, ana.email, ana.passwordHash], ['Ana R', 'ana.r@x.com', 'h']);
  assert.equal(reducer(s, { type: 'updateUser', id: 'ana', changes: { name: 'A', email: 'ben@x.com' } }), s);
});

test('Local Storage saves, loads, removes and survives bad data', () => {
  const items = new Map();
  globalThis.localStorage = {
    getItem: (k) => items.get(k) ?? null,
    setItem: (k, v) => items.set(k, String(v)),
    removeItem: (k) => items.delete(k),
  };
  const data = setup();
  assert.ok(saveData(data));
  assert.deepEqual(loadData(), data);
  saveSession('ana');
  assert.equal(loadSession(), 'ana');
  saveSession(null);
  assert.ok(!items.has(SESSION_KEY));
  saveSession('admin', ADMIN_SESSION_KEY);
  saveSession(null);
  assert.equal(loadSession(ADMIN_SESSION_KEY), 'admin');
  items.set(DATA_KEY, '{broken');
  assert.deepEqual(loadData(), initialState());
  assert.equal(items.get(`${DATA_KEY}:backup`), '{broken');
});
