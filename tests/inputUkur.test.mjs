import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ageInMonths } from '../src/utils/childRecords.js';
const source = readFileSync(new URL('../src/components/InputUkur.jsx', import.meta.url), 'utf8');
const handler = source.slice(source.indexOf('  const handleSubmit ='), source.indexOf('  const handleCloseModal'));
const child = { id: 'new-child', tglLahir: '2024-01-01', history: [] };
const tenant = { children: [child] };
const state = {};
const setters = ['setError', 'setSavedChild', 'setSelectedChildId', 'setSavedMeasurement', 'setSavedPrevMeasurement', 'setShowResultModal', 'setBb', 'setTb', 'setLk', 'setLila'];
function submit(save, selectedChildId = '') {
  const activeChildId = tenant.children.some(c => c.id === selectedChildId) ? selectedChildId : tenant.children[0]?.id || '';
  const names = ['tenant', 'selectedChildId', 'activeChildId', 'bb', 'tb', 'lk', 'lila', 'examDate', 'ageInMonths', 'addMeasurement', ...setters];
  return Function(...names, `${handler}; return handleSubmit;`)(tenant, selectedChildId, activeChildId, '5.12', '60', '40', '12', '2024-03-01', ageInMonths, save, ...setters.map(key => value => { state[key] = value; }))({ preventDefault() {} });
}
let saved;
submit((id, data) => { saved = { id, data }; return true; });
assert.equal(saved.id, child.id);
assert.equal(saved.data.bb, 5.12);
assert.equal(state.setShowResultModal, true);
assert.equal(state.setError, '');
submit(() => false);
assert.equal(state.setError, 'Data tidak berhasil disimpan.');
submit(() => { throw new Error('Pemeriksaan pada tanggal ini sudah ada.'); });
assert.equal(state.setError, 'Pemeriksaan pada tanggal ini sudah ada.');
console.log('InputUkur: late-loaded child selection, decimal values, successful save and precise save failures passed.');
