const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { EventEmitter } = require('node:events');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const token = overrides => `test.${Buffer.from(JSON.stringify({ id: 7, role: 'admin',
  email: 'fixture@example.com', adminLevel: 'dev', adminPermissions: ['view_dashboard'],
  exp: Math.floor(Date.now() / 1000) + 3600, ...overrides })).toString('base64url')}.test`;

function environment() {
  const storage = new Map([['admin_token', token()]]);
  const counters = { reloads: 0, redirects: 0, timers: 0, refreshes: 0 };
  const localStorage = { getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
  const shared = { localStorage, process: { env: { NODE_ENV: 'test' } },
    console: { log() {}, error() {}, warn() {} },
    window: { location: { reload: () => counters.reloads++, replace: () => counters.redirects++ } },
    setTimeout: () => counters.timers++ };
  function load(file, mocks = {}) {
    const source = fs.readFileSync(path.join(root, file), 'utf8')
      .replace('import.meta.env.VITE_SOCKET_URL', "'http://fixture.invalid'");
    const exports = {};
    vm.runInNewContext(ts.transpileModule(source, { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
    } }).outputText, { ...shared, exports, require: name => mocks[name] ?? require(name) }, { filename: file });
    return exports;
  }
  const store = load('src/utils/adminPermissionStore.ts');
  const auth = load('src/utils/auth.ts', { './adminPermissionStore': store });
  const live = load('src/services/liveAdminPermissions.ts', { '@utils/auth': auth });
  const socket = new EventEmitter();
  socket.id = 'fixture-socket';
  socket.connected = true;
  socket.connect = () => socket;
  socket.disconnect = () => { socket.connected = false; socket.emit('disconnect'); };
  socket.off = (...args) => args.length ? EventEmitter.prototype.off.apply(socket, args) : socket.removeAllListeners();
  let socketOptions;
  let refresh = async () => ({ user: auth.getCurrentAdminInfo() });
  const service = { refreshToken: () => { counters.refreshes++; return refresh(); } };
  const api = load('src/services/socket.ts', {
    'socket.io-client': { io: (_url, options) => { socketOptions = options; return socket; } },
    'react-toastify': { toast: { success() {}, error() {}, warning() {} } },
    i18next: { t: key => key }, '@utils/auth': auth, './adminService': service,
    './adminEvents': { emitAdminEvent() {} }, './liveAdminPermissions': live,
  });
  api.getAdminSocket();
  const deliver = (event, data) => Promise.all(socket.listeners(event).map(listener => listener(data)));
  return { auth, store, live, counters, storage, deliver, api, load,
    setRefresh: fn => { refresh = fn; }, getSocketOptions: () => socketOptions };
}

test('grant and revoke update subscribers immediately with no reload or timer', async () => {
  const env = environment();
  let updates = 0;
  env.store.subscribeAdminPermissions(() => updates++);
  const granted = env.deliver('permissions_changed', { permissions: ['view_dashboard', 'manage_notes.edit'] });
  assert.equal(env.auth.hasPermission('manage_notes.edit'), true);
  assert(updates > 0, 'React subscribers must be notified before refreshing credentials');
  await granted;
  await env.deliver('permission_revoked', { permission: 'manage_notes.edit', permissions: ['view_dashboard'] });
  assert.equal(env.auth.hasPermission('manage_notes.edit'), false);
  await env.deliver('permissions_changed', { permissions: [] });
  assert.equal(env.auth.hasPermission('view_dashboard'), false);
  assert.equal(env.auth.getCurrentAdminInfo().adminPermissions.length, 0);
  assert.equal(env.counters.reloads, 0);
  assert.equal(env.counters.timers, 0);
  assert.equal(env.counters.redirects, 0);
});

test('toast deduplication does not discard consecutive permission updates', async () => {
  const env = environment();
  await env.deliver('permissions_changed', { permissions: ['manage_notes.view'] });
  await env.deliver('permissions_changed', { permissions: ['manage_users.view'] });
  assert.equal(env.auth.hasPermission('manage_notes.view'), false);
  assert.equal(env.auth.hasPermission('manage_users.view'), true);
});

test('a slow refresh cannot restore permissions already revoked by a newer event', async () => {
  const env = environment();
  const pending = [];
  env.setRefresh(() => new Promise(resolve => pending.push(resolve)));
  const granted = env.deliver('permissions_changed', { permissions: ['manage_notes.edit'], timestamp: '1' });
  await new Promise(setImmediate);
  const revoked = env.deliver('permission_revoked', { permission: 'manage_notes.edit', permissions: [], timestamp: '2' });
  assert.equal(env.auth.hasPermission('manage_notes.edit'), false);
  assert.equal(pending.length, 1, 'refreshes must be serialized');
  pending.shift()({ user: { adminPermissions: ['manage_notes.edit'], adminLevel: 'dev' } });
  await new Promise(setImmediate);
  assert.equal(env.auth.hasPermission('manage_notes.edit'), false);
  assert.equal(pending.length, 1);
  pending.shift()({ user: { adminPermissions: [], adminLevel: 'dev' } });
  await Promise.all([granted, revoked]);
  assert.equal(env.auth.hasPermission('manage_notes.edit'), false);
});

test('failed credential refresh still applies revocation immediately', async () => {
  const env = environment();
  env.live.applyLiveAdminPermissions({ permissions: ['manage_notes.edit'] });
  env.setRefresh(async () => { throw Error('offline'); });
  await env.deliver('permission_revoked', { permission: 'manage_notes.edit', permissions: [] });
  assert.equal(env.auth.hasPermission('manage_notes.edit'), false);
  assert.equal(env.counters.reloads, 0);
});

test('reconnect reads the latest token and synchronizes changes missed offline', async () => {
  const env = environment();
  const latest = token({ adminPermissions: ['manage_notes.view'] });
  env.auth.setAdminToken(latest);
  let credentials;
  env.getSocketOptions().auth(value => { credentials = value; });
  assert.equal(credentials.token, latest);
  env.setRefresh(async () => ({ user: { adminPermissions: ['manage_users.view'], adminLevel: 'mod' } }));
  await env.deliver('connect');
  await new Promise(setImmediate);
  assert.equal(env.auth.hasPermission('manage_users.view'), true);
  assert.equal(env.auth.hasPermission('manage_notes.view'), false);
});

test('legacy revocation payload removes a parent and all descendants', () => {
  const env = environment();
  env.live.applyLiveAdminPermissions({ permissions: ['manage_users', 'manage_users.view', 'manage_notes.view'] });
  env.live.applyLiveAdminPermissions({ permission: 'manage_users' });
  assert.equal(env.auth.hasPermission('manage_users'), false);
  assert.equal(env.auth.hasPermission('manage_notes.view'), true);
});

test('logout clears runtime overrides and a late refresh cannot log the user back in', async () => {
  const env = environment();
  const source = fs.readFileSync(path.join(root, 'src/services/adminService.ts'), 'utf8');
  const ast = ts.createSourceFile('adminService.ts', source, ts.ScriptTarget.Latest, true);
  let body;
  function visit(node) {
    if (ts.isMethodDeclaration(node) && node.name.getText(ast) === 'refreshToken') body = node.body.getText(ast);
    ts.forEachChild(node, visit);
  }
  visit(ast);
  const compiled = ts.transpileModule('async function refresh() ' + body, {
    compilerOptions: { target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const context = vm.createContext({ getAdminToken: env.auth.getAdminToken, setAdminToken: env.auth.setAdminToken });
  vm.runInContext(compiled, context);
  let resolve;
  const response = new Promise(done => { resolve = done; });
  const request = context.refresh.call({ axiosInstance: { post: () => response } });
  env.live.applyLiveAdminPermissions({ permissions: ['manage_notes.edit'] });
  env.auth.removeAdminToken();
  resolve({ token: token({ adminPermissions: ['manage_notes.edit'] }) });
  await request;
  assert.equal(env.auth.getAdminToken(), null);
  env.auth.setAdminToken(token({ adminPermissions: [] }));
  assert.equal(env.auth.hasPermission('manage_notes.edit'), false);
});

test('account deactivation still forces logout, unlike ordinary permission changes', async () => {
  const env = environment();
  await env.deliver('admin_account_deactivated', { timestamp: 'deactivated' });
  assert.equal(env.auth.getAdminToken(), null);
  assert.equal(env.counters.redirects, 1);
});
