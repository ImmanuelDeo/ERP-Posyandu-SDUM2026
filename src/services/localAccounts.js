// Local prototype only: browser storage is editable, not a server authorization boundary.
const KEY = 'erp_posyandu_accounts_v1';
const ITERATIONS = 600000;
let adminActive = null;
let parentActive = null;
const SESSION_KEY = 'erp_posyandu_session_v1';
const SESSION_TTL = 8 * 60 * 60 * 1000;
let activeSession = null;
let adminCredential = null;
const credential = (record) => JSON.stringify([record?.username, record?.salt, record?.hash, record?.iterations]);
async function fingerprint(record) {
  return hex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(credential(record)))));
}
function saveSession(session) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); }
  catch { logoutLocalAccount(); throw new Error('Sesi lokal tidak dapat disimpan. Izinkan penyimpanan tab lalu login kembali.'); }
  activeSession = session;
}
function validSession(session) {
  const now = Date.now();
  return session?.version === 1 && ['admin', 'parent'].includes(session.role) &&
    typeof session.tenantId === 'string' && Boolean(session.tenantId) &&
    Number.isSafeInteger(session.issuedAt) && Number.isSafeInteger(session.expiresAt) &&
    session.issuedAt <= now && session.expiresAt > now &&
    session.expiresAt > session.issuedAt && session.expiresAt - session.issuedAt <= SESSION_TTL;
}
function sessionActive() {
  try {
    if (validSession(activeSession) && sessionStorage.getItem(SESSION_KEY) === JSON.stringify(activeSession) &&
      (!adminActive || credential(read().admin) === adminCredential)) return true;
  } catch { /* Unreadable storage must not preserve access. */ }
  logoutLocalAccount();
  return false;
}
function newSession(role, tenantId) {
  const issuedAt = Date.now();
  return { version: 1, role, tenantId, issuedAt, expiresAt: issuedAt + SESSION_TTL };
}
export async function restoreLocalSession(db) {
  adminActive = null;
  parentActive = null;
  activeSession = null;
  adminCredential = null;
  try {
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    if (!validSession(session) || !Object.hasOwn(db || {}, session.tenantId) || !db[session.tenantId]) throw new Error('Invalid session');
    if (session.role === 'admin') {
      const record = read().admin;
      if (!record || typeof session.fingerprint !== 'string' || !/^[a-f0-9]{64}$/.test(session.fingerprint) || session.fingerprint !== await fingerprint(record)) throw new Error('Stale credentials');
      adminActive = session.tenantId;
      adminCredential = credential(record);
    } else {
      if (typeof session.id !== 'string' || !session.id || typeof session.childId !== 'string' || !session.childId) throw new Error('Invalid parent');
      const fields = identity(session);
      if (uniqueChild(fields, session.tenantId, db)?.id !== session.childId) throw new Error('Stale child');
      parentActive = session;
    }
    activeSession = session;
    if (!sessionActive()) return null;
    return session.role === 'admin' ? { role: 'admin', tenantId: session.tenantId } : { role: 'parent', id: session.id, tenantId: session.tenantId, childId: session.childId };
  } catch { logoutLocalAccount(); return null; }
}
const normalize = (value) => String(value ?? '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('id-ID');
const motherName = (value) => normalize(value).replace(/^(?:(?:ibu|mama|bunda|ny\.?)\s+)+/u, '');

function read() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return { admin: null, parents: [] };
  const data = JSON.parse(raw);
  if (!data || !Array.isArray(data.parents) || !Object.hasOwn(data, 'admin')) {
    throw new Error('Penyimpanan akun tidak valid. Hubungi pengelola; data tidak direset.');
  }
  return data;
}
function username(value) {
  const result = normalize(value);
  if (!/^[a-z0-9][a-z0-9._-]{2,59}$/.test(result)) throw new Error('Username harus 3–60 karakter: huruf, angka, titik, garis bawah, atau tanda hubung.');
  return result;
}
function passwordInput(value) {
  if (typeof value !== 'string' || value.length < 12 || value.length > 128) throw new Error('Password harus 12–128 karakter.');
  return value;
}
const hex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
async function derive(password, salt) {
  if (!globalThis.crypto?.subtle) throw new Error('Penyimpanan password memerlukan HTTPS atau localhost.');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  return hex(new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: ITERATIONS }, key, 256)));
}
async function verify(password, record) {
  passwordInput(password);
  return record?.iterations === ITERATIONS && typeof record.salt === 'string' && record.salt.length === 32 && await derive(password, record.salt) === record.hash;
}
export function hasLocalAdmin() { return Boolean(read().admin); }
export function logoutLocalAccount() {
  adminActive = null; parentActive = null; activeSession = null; adminCredential = null;
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Access already revoked in memory. */ }
}
export function isLocalAdmin(tenantId) { return Boolean(tenantId && adminActive === tenantId && sessionActive()); }
export async function loginLocalAdmin(name, password, tenantId, db) {
  logoutLocalAccount();
  const data = read();
  if (!data.admin) throw new Error('Admin belum diprovisikan. Hubungi operator untuk impor akun lokal dari scripts/provision-local-admin.mjs; pendaftaran publik tidak tersedia.');
  const user = username(name);
  if (!Object.hasOwn(db || {}, tenantId) || !(await verify(password, data.admin)) || user !== data.admin.username) throw new Error('Posyandu, username, atau password tidak sesuai.');
  const digest = await fingerprint(data.admin);
  saveSession({ ...newSession('admin', tenantId), fingerprint: digest });
  adminCredential = credential(data.admin);
  adminActive = tenantId;
}
function identity(input) {
  const result = {};
  for (const field of ['motherName', 'childName']) {
    const value = String(input[field] ?? '').trim().replace(/\s+/g, ' ');
    if (value.length < 2 || value.length > 150 || !/\p{L}/u.test(value)) throw new Error('Nama ibu dan anak wajib diisi, 2–150 karakter.');
    result[field] = value;
  }
  const date = String(input.birthDate ?? '');
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date || date > new Date().toISOString().slice(0, 10)) throw new Error('Tanggal lahir tidak valid atau berada di masa depan.');
  result.birthDate = date;
  return result;
}
export function matchesParentRequest(account, child) {
  return Boolean(motherName(account.motherName) && normalize(account.childName) &&
    motherName(account.motherName) === motherName(child.namaOrtu) &&
    normalize(account.childName) === normalize(child.nama) && account.birthDate === child.tglLahir);
}
function uniqueChild(fields, tenantId, db) {
  if (!Object.hasOwn(db || {}, tenantId)) return null;
  const candidates = db[tenantId]?.children?.filter((child) => matchesParentRequest(fields, child)) || [];
  return candidates.length === 1 && candidates[0].id ? candidates[0] : null;
}
export function loginLocalParent(input, tenantId, db) {
  logoutLocalAccount();
  const fields = identity(input);
  const child = uniqueChild(fields, tenantId, db);
  if (!child) throw new Error('Data tidak cocok tepat dengan satu anak di posyandu ini. Periksa nama lengkap, tanggal lahir, dan duplikat bersama kader.');
  const session = { ...newSession('parent', tenantId), ...fields, id: crypto.randomUUID(), childId: child.id };
  saveSession(session);
  parentActive = session;
  return { id: parentActive.id, tenantId, childId: child.id };
}
export function resolveLocalParent(sessionId, db) {
  if (!parentActive || parentActive.id !== sessionId || !sessionActive()) return null;
  const { tenantId, childId } = parentActive;
  const child = uniqueChild(parentActive, tenantId, db);
  return child?.id === childId ? { child, tenant: { ...db[tenantId], id: tenantId } } : null;
}
export function createLocalTenant(db, input) {
  if (!isLocalAdmin(adminActive) || !Object.hasOwn(db || {}, adminActive)) throw new Error('Login pengelola lokal diperlukan untuk mendaftarkan posyandu.');
  const title = String(input?.title ?? '').trim();
  const district = String(input?.district ?? '').trim();
  if (title.length < 2 || title.length > 150 || district.length > 300) throw new Error('Nama posyandu wajib 2–150 karakter; alamat maksimal 300 karakter.');
  let key;
  do { key = `pos-${crypto.randomUUID()}`; } while (Object.hasOwn(db, key));
  // Ignore caller-supplied IDs and children: never overwrite or clone another tenant.
  return { key, db: { ...db, [key]: { id: key, title, district, children: [] } } };
}
