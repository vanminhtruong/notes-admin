const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { Op } = require('../../back/node_modules/sequelize');

function load(file, mocks) {
  const exports = {};
  const source = fs.readFileSync(path.resolve(__dirname, file), 'utf8');
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
  } }).outputText, { exports, console, require: name => {
    if (name in mocks) return mocks[name];
    if (name === 'sequelize') return { Op };
    if (name.includes('asyncHandler')) return { default: fn => fn, __esModule: true };
    return {};
  } });
  return exports;
}

test('dashboard uses aggregate endpoint without requiring user/note list permissions', async () => {
  let result;
  const api = { getDashboardStats: async () => ({ data: {
    totalUsers: 6, activeUsers: 2, totalNotes: 54, totalFolders: 4, notesInFolders: 4,
  } }) };
  for (const name of ['getTopNotesCreators', 'getRecentOnlineUsers', 'getTopOfflineUsers',
    'getTopCategoriesCreators', 'getTopChatUsers', 'getTopNoteSharers']) api[name] = async () => ({ data: [] });
  const { useDashboardHandlers } = load('../src/pages/Dashboard/hooks/Manager-handle/useDashboardHandlers.ts', {
    react: { useCallback: fn => fn }, '@services/adminService': api,
  });
  const noop = () => {};
  await useDashboardHandlers({ setLoading: noop, setStats: value => result = value,
    setTopNotesCreators: noop, setRecentOnlineUsers: noop, setTopOfflineUsers: noop,
    setTopCategoriesCreators: noop, setTopChatUsers: noop, setTopNoteSharers: noop,
  }).loadDashboardData();
  assert.equal(result.totalNotes, 54);
  assert.equal(result.notesInFolders, 4);
  assert.equal(result.totalUsers, 6);
});

test('admin pagination counts unique notes and folders; archived folder notes remain accessible', async () => {
  const queries = [], folderQueries = [];
  const { default: Service } = load('../../back/src/service/admin-service/admin.notes.service.js', {
    '../../repositories/index.js': {
      noteRepository: { findAndCountAll: async query => { queries.push(query); return { count: 6, rows: [] }; }, count: async () => 4 },
      noteFolderRepository: { count: async () => 4, findAndCountAll: async query => { folderQueries.push(query); return { count: 4, rows: [] }; } },
    },
  });
  const api = new Service({});
  const res = { json() {} };
  await api.getAllUsersNotes({ query: { isArchived: 'true' } }, res);
  await api.getAllUsersNotes({ query: { isArchived: 'false' } }, res);
  await api.getAllUsersNotes({ query: { folderId: '2', isArchived: 'true' } }, res);
  await api.getAllFolders({ query: {} }, res);
  assert.equal(queries[0].distinct, true);
  assert.equal('folderId' in queries[0].where, false);
  assert.equal(queries[1].where.folderId, null);
  assert.equal(queries[2].where.folderId, 2);
  assert.equal(folderQueries[0].distinct, true);
});

test('aggregate user total includes disabled accounts and folder count matches visible contents', async () => {
  let userScope, folderScope, result;
  const { default: Service } = load('../../back/src/service/admin-service/admin.dashboard.service.js', {
    '../../repositories/index.js': {
      userRepository: { count: async q => { userScope = q.where; return 6; }, findAll: async () => [{id:1}, {id:2}] },
      noteRepository: { count: async q => { if (q) folderScope = q.where; return q ? 4 : 54; } },
      noteFolderRepository: { count: async () => 4 },
    },
    '../../socket/socketHandler.js': { isUserOnline: id => id === 1 },
  });
  await new Service({}).getDashboardStats({}, { json: value => result = value.data });
  assert.equal(userScope.role, 'user');
  assert.equal('isActive' in userScope, false);
  assert.equal(folderScope.isArchived, false);
  assert.equal(folderScope.folderId[Op.ne], null);
  assert.equal(result.activeUsers, 1);
  assert.equal(result.totalNotes, 54);
});

test('archive and folder moves refresh dashboard and unsubscribe on unmount', () => {
  const { EventEmitter } = require('node:events');
  const socket = new EventEmitter();
  const cleanups = [];
  let refreshes = 0;
  const { useDashboardEffects } = load('../src/pages/Dashboard/hooks/Manager-Effects/useDashboardEffects.ts', {
    react: { useEffect: fn => { const cleanup = fn(); if (cleanup) cleanups.push(cleanup); } },
    '@services/socket': { getAdminSocket: () => socket },
  });
  useDashboardEffects({ loadDashboardData() {}, refreshDashboardData: () => refreshes++ });
  socket.emit('user_note_archived');
  socket.emit('admin_note_moved_to_folder');
  assert.equal(refreshes, 2);
  cleanups.forEach(fn => fn());
  socket.emit('user_note_archived');
  assert.equal(refreshes, 2);
});

test('date-only fields reject invalid legacy dates and retain calendar dates without timezone shifts', () => {
  const { toYMD, formatDateOnly } = load('../src/utils/date.ts', {});
  assert.equal(toYMD('Invalid date'), '');
  assert.equal(toYMD('0000-00-00'), '');
  assert.equal(toYMD('2025-02-29'), '');
  assert.equal(toYMD('2024-02-29'), '2024-02-29');
  assert.equal(toYMD('2000-01-02T00:00:00.000Z'), '2000-01-02');
  assert.equal(formatDateOnly('2000-01-02'), '02/01/2000');
});
