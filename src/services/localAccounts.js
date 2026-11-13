// Local prototype only: browser storage is editable, not a server authorization boundary.
const KEY = 'erp_posyandu_accounts_v1';
const ITERATIONS = 600000;
let adminActive = false;
let parentActive = null;
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
function save(data) { localStorage.setItem(KEY, JSON.stringify(data)); }
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
async function credential(password) {
  passwordInput(password);
  const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
  return { salt, hash: await derive(password, salt), iterations: ITERATIONS };
}
async function verify(password, record) {
  passwordInput(password);
  return record?.iterations === ITERATIONS && typeof record.salt === 'string' && record.salt.length === 32 && await derive(password, record.salt) === record.hash;
}
function requireAdmin() { if (!adminActive) throw new Error('Login pengelola lokal diperlukan.'); }
export function hasLocalAdmin() { return Boolean(read().admin); }
export function logoutLocalAccount() { adminActive = false; parentActive = null; }

export async function setupLocalAdmin(name, password) {
  const user = username(name);
  if (read().admin) throw new Error('Akun pengelola lokal sudah tersedia.');
  const secret = await credential(password);
  const data = read();
  if (data.admin) throw new Error('Akun pengelola lokal sudah tersedia.');
  save({ ...data, admin: { username: user, ...secret } });
  adminActive = true;
}
export async function loginLocalAdmin(name, password) {
  adminActive = false;
  const data = read();
  const user = username(name);
  if (!data.admin || !(await verify(password, data.admin)) || user !== data.admin.username) throw new Error('Username atau password tidak sesuai.');
  adminActive = true;
}
function registration(input) {
  const result = { username: username(input.username) };
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
function publicAccount({ hash: _hash, salt: _salt, iterations: _iterations, ...account }) { return account; }

export async function registerLocalParent(input, password) {
  const fields = registration(input);
  passwordInput(password);
  const secret = await credential(password);
  const data = read();
  if (data.parents.some((p) => p.username === fields.username)) throw new Error('Username tidak tersedia.');
  // Names and DOB are a review request, never proof of ownership or a database lookup at signup.
  const account = { ...fields, ...secret, id: crypto.randomUUID(), status: 'pending', tenantId: null, childId: null };
  save({ ...data, parents: [...data.parents, account] });
  return publicAccount(account);
}
export async function loginLocalParent(name, password) {
  parentActive = null;
  const user = username(name);
  const account = read().parents.find((p) => p.username === user);
  if (!account || !(await verify(password, account))) throw new Error('Username atau password tidak sesuai.');
  adminActive = false;
  parentActive = account.id;
  return publicAccount(account);
}
export function listPendingParents() {
  requireAdmin();
  return read().parents.filter((p) => p.status === 'pending').map(publicAccount);
}
export function matchesParentRequest(account, child) {
  return Boolean(motherName(account.motherName) && normalize(account.childName) &&
    motherName(account.motherName) === motherName(child.namaOrtu) &&
    normalize(account.childName) === normalize(child.nama) && account.birthDate === child.tglLahir);
}
export function approveLocalParent(accountId, tenantId, childId, db) {
  requireAdmin();
  const data = read();
  const account = data.parents.find((p) => p.id === accountId && p.status === 'pending');
  const candidates = db?.[tenantId]?.children?.filter((c) => account && matchesParentRequest(account, c)) || [];
  if (!account || candidates.length !== 1 || candidates[0].id !== childId) throw new Error('Data tidak cocok tepat atau terdapat duplikat. Periksa identitas dan perbaiki data terlebih dahulu.');
  if (data.parents.some((p) => p.status === 'approved' && p.tenantId === tenantId && p.childId === childId)) throw new Error('Anak sudah terhubung ke akun lain. Hubungi pengelola.');
  save({ ...data, parents: data.parents.map((p) => p.id === accountId ? { ...p, status: 'approved', tenantId, childId } : p) });
}
export function resolveLocalParent(accountId, db) {
  if (parentActive !== accountId) return null;
  const account = read().parents.find((p) => p.id === accountId);
  if (!account || account.status !== 'approved') return null;
  const tenant = db?.[account.tenantId];
  const child = tenant?.children?.find((c) => c.id === account.childId);
  // No stale fallback: deleted or changed links cannot expose cached clinical records.
  return child && matchesParentRequest(account, child) ? { child, tenant: { ...tenant, id: account.tenantId } } : null;
}
