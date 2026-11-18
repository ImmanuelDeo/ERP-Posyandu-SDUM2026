// Offline operator tool. No frontend signup; no password arguments, files, or logs.
// Usage: trusted-secret-source | node scripts/provision-local-admin.mjs USERNAME OUTPUT.js
// Source must emit only password on stdin (12–128 chars, one optional final newline).
// Windows interactive alternative (masked, password never enters shell history):
// $secret = Read-Host 'Local admin password' -AsSecureString
// $credential = [pscredential]::new('unused', $secret)
// $credential.GetNetworkCredential().Password | node scripts/provision-local-admin.mjs USERNAME OUTPUT.js
// Operator: inspect OUTPUT.js, paste its contents into DevTools Console on target app origin,
// then reload app. Import refuses existing admin; preserve account backup before recovery.
// Hash file permits offline guessing: restrict access, remove after import. Prototype only.
import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

try {
  const [username, output, ...extra] = process.argv.slice(2);
  if (extra.length || !/^[a-z0-9][a-z0-9._-]{2,59}$/.test(username || '') || !output) throw new Error('Usage: secret-source | node scripts/provision-local-admin.mjs USERNAME OUTPUT.js');
  if (process.stdin.isTTY) throw new Error('Provide password through stdin, never command arguments. See script comments for masked PowerShell input.');
  const password = readFileSync(0, 'utf8').replace(/\r?\n$/, '');
  if (password.length < 12 || password.length > 128 || /[\r\n]/.test(password)) throw new Error('Password must be 12–128 characters on one line.');
  const salt = randomBytes(16).toString('hex');
  const admin = { username, salt, hash: pbkdf2Sync(password, salt, 600000, 32, 'sha256').toString('hex'), iterations: 600000 };
  const script = `(() => {\n  const key = 'erp_posyandu_accounts_v1';\n  const raw = localStorage.getItem(key);\n  const data = raw ? JSON.parse(raw) : { admin: null, parents: [] };\n  if (!data || !Array.isArray(data.parents) || !Object.hasOwn(data, 'admin')) throw new Error('Invalid account storage; import refused.');\n  if (data.admin) throw new Error('Admin already exists; import refused.');\n  localStorage.setItem(key, JSON.stringify({ ...data, admin: ${JSON.stringify(admin)} }));\n  console.info('Local admin imported. Reload app; login required.');\n})();\n`;
  writeFileSync(output, script, { flag: 'wx', mode: 0o600 });
  console.info('Hashed import file created. Inspect and import on target app origin; login required.');
} catch (error) {
  console.error(error.code === 'EEXIST' ? 'Output exists; overwrite refused.' : error.code ? 'Provisioning IO failed.' : error.message);
  process.exitCode = 1;
}
