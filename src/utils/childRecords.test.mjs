import assert from 'node:assert/strict';
import { prepareChild, validateMeasurement, ageInMonths } from './childRecords.js';
const input = { nama: 'Anak Uji', namaOrtu: 'Ibu Uji', gender: 'L', tglLahir: '2024-01-15', nik: '0012345678901234' };
const child = prepareChild(input);
assert.equal(child.nik, '0012345678901234');
assert.equal(ageInMonths('2024-01-15', '2024-02-14'), 0);
assert.equal(ageInMonths('2024-01-15', '2024-02-15'), 1);
assert.throws(() => ageInMonths('2024-02-31', '2024-03-15'));
assert.throws(() => prepareChild(input, [child]));
assert.throws(() => prepareChild({ ...input, nik: '123' }));
assert.throws(() => validateMeasurement(child, { tgl: '2024-02-15', bb: -1, tb: 60, lk: 40, lila: 12 }));
assert.equal(validateMeasurement(child, { tgl: '2024-02-15', bb: 4, tb: 60, lk: 40, lila: 12 }).usia, 1);
// Exercise provider callbacks without React rendering; retain same callbacks across writes.
const { readFile } = await import('node:fs/promises');
const { withMeasurements, prepareImportedChildren } = await import('./childRecords.js');
const source = (await readFile(new URL('../context/AuthContext.jsx', import.meta.url), 'utf8')).replace(/\r\n/g, '\n');
const body = source.slice(source.indexOf("  const [currentTenant"), source.indexOf('  return (\n    <AuthContext.Provider'));
const api = source.match(/<AuthContext.Provider value=\{\{([\s\S]*?)\}\}>/)[1];
let persisted = JSON.stringify({ arca: { children: [] } });
let failSave = false;
const mount = () => Function('useState', 'useRef', 'useEffect', 'useCallback', 'loadLocalDB', 'saveLocalDB',
  'prepareChild', 'withMeasurements', 'prepareImportedChildren', `${body}\nreturn {${api}};`)(
  value => [value, () => {}], value => ({ current: value }), effect => effect(), callback => callback,
  () => JSON.parse(persisted), value => { if (failSave) throw new Error('quota'); persisted = JSON.stringify(value); },
  prepareChild, withMeasurements, prepareImportedChildren);
const store = mount();
const registered = store.addChild(input);
assert.deepEqual(JSON.parse(persisted).arca.children[0].history, []);
assert.equal(mount().addMeasurement('missing', {}), false);
assert.throws(() => mount().addChild(input), /sudah terdaftar/);
assert.throws(() => store.addChild(input), /sudah terdaftar/);
const measurement = { tgl: '2024-03-15', bb: 5, tb: 60, lk: 40, lila: 12 };
assert.equal(store.addMeasurement(registered.id, measurement), true);
const saved = persisted;
assert.throws(() => store.addMeasurement(registered.id, measurement), /sudah ada/);
assert.equal(persisted, saved);
const older = { ...measurement, tgl: '2024-02-15', bb: 4 };
assert.equal(store.addMeasurement(registered.id, older), true);
let loaded = JSON.parse(persisted).arca.children[0];
assert.deepEqual(loaded.history.map(h => h.tgl), [older.tgl, measurement.tgl]);
assert.equal(loaded.bb, 5);
assert.equal(loaded.usiaBulan, 2);
assert.equal(loaded.tgl, measurement.tgl);
const reloaded = mount();
assert.throws(() => reloaded.addChild(input), /sudah terdaftar/);
assert.throws(() => reloaded.addMeasurement(registered.id, older), /sudah ada/);
const importedInput = { ...input, nama: 'Anak Import', nik: '0012345678901235', history: [measurement, older] };
assert.equal(store.importChildren([importedInput]), 1);
loaded = JSON.parse(persisted).arca.children[1];
assert.equal(loaded.bb, 5);
assert.equal(loaded.usiaBulan, 2);
const beforeImport = persisted;
assert.throws(() => store.importChildren([importedInput]), /sudah terdaftar/);
assert.equal(persisted, beforeImport);
const other = { ...importedInput, nama: 'Anak Lain', nik: '0012345678901236' };
assert.throws(() => store.importChildren([other, importedInput]), /sudah terdaftar/);
assert.throws(() => store.importChildren([{ ...other, history: [measurement, measurement] }]), /sudah ada/);
assert.equal(persisted, beforeImport);
const beforeFailure = persisted;
failSave = true;
assert.throws(() => store.addChild(other), /quota/);
assert.equal(persisted, beforeFailure);
failSave = false;
assert.ok(store.addChild(other)); // Failed save must not advance latest DB reference.
assert.equal(JSON.parse(persisted).arca.children.length, 3);
console.log('Child/provider: repeated writes, atomic duplicates, date sorting, cached age, save failure and reload passed.');
