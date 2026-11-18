import assert from 'node:assert/strict';
import * as XLSX from 'xlsx';
import { examinationRows, examinationRange, examinationFilename, createWorkbook, parseWorkbook, MAX_FILE_BYTES } from './spreadsheet.js';

const headers = ['NIK', 'Nama Anak', 'Jenis Kelamin', 'Tanggal Lahir', 'Nama Orang Tua', 'No HP', 'Alamat', 'Tanggal Pemeriksaan', 'BB (kg)', 'TB (cm)', 'LK (cm)', 'LiLA (cm)'];
const valid = ['0012345678901234', 'Anak', 'P', '2024-01-01', 'Ibu', '081234567890', 'RT 01', '2026-09-10', 9, 79, 44, 13];
function buffer(rows, cols = headers) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([cols, ...rows]), 'Data');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
const imported = parseWorkbook(buffer([valid]));
assert.equal(imported[0].nik, valid[0]);
assert.equal(imported[0].history[0].tgl, '2026-09-10');
assert.equal(imported[0].bb, 9);
assert.throws(() => parseWorkbook(buffer([valid]), [{ nik: valid[0] }]), /sudah terdaftar/);
assert.throws(() => parseWorkbook(buffer([valid, valid])), /duplikat/);
for (const [index, value] of [[0, 1234567890123456], [0, '123'], [2, 'X'], [3, '2024-02-30'], [7, '2099-01-01'], [7, '2023-12-01'], [8, '9oops'], [8, 0], [9, ''], [10, -2], [11, Infinity]]) {
  const row = [...valid]; row[index] = value;
  assert.throws(() => parseWorkbook(buffer([valid, row])), /Baris|duplikat/);
}
assert.throws(() => parseWorkbook(buffer([valid], headers.slice(1))), /Kolom/);
assert.throws(() => parseWorkbook(buffer([])), /kosong/);
assert.throws(() => parseWorkbook(new Uint8Array(MAX_FILE_BYTES + 1)), /5 MB/);
const dated = [...valid]; dated[3] = 45292; // 2024-01-01 Excel serial.
assert.equal(parseWorkbook(buffer([dated]))[0].tglLahir, '2024-01-01');
const next = [...valid]; next[7] = '2026-10-01'; next[8] = 10;
const grouped = parseWorkbook(buffer([next, valid]));
assert.equal(grouped.length, 1);
assert.equal(grouped[0].history.length, 2);
assert.equal(grouped[0].bb, 10);
const formula = XLSX.read(buffer([valid]));
formula.Sheets.Data.A2 = { t: 's', f: '"0012345678901234"', v: valid[0] };
assert.throws(() => parseWorkbook(XLSX.write(formula, { type: 'buffer', bookType: 'xlsx' })), /Rumus/);
assert.throws(() => parseWorkbook(buffer([[...valid, 99]], [...headers, 'Usia Bulan'])), /Usia Bulan/);
assert.equal(parseWorkbook(buffer([[...valid, 32]], [...headers, 'Usia Bulan']))[0].history[0].usia, 32);
assert.throws(() => parseWorkbook(buffer(Array.from({ length: 5001 }, () => valid))), /5000/);
const before = JSON.stringify(imported);
assert.throws(() => parseWorkbook(buffer([valid]), imported), /sudah terdaftar/);
assert.equal(JSON.stringify(imported), before);
const roundtrip = XLSX.write(createWorkbook(imported.flatMap(child => child.history.map(measurement => ({ child, measurement })))), { type: 'buffer', bookType: 'xlsx' });
assert.equal(parseWorkbook(roundtrip)[0].nik, valid[0]);
console.log('Strict atomic import validation passed');


const child = { nik: '0012345678901234', nama: 'Anak', gender: 'L', history: [
  { tgl: '2026-10-10', bb: 10, tb: 80, lk: 45, lila: 14, usia: 20 },
  { tgl: '2026-09-10', bb: 9, tb: 79, lk: 44, lila: 13, usia: 19 },
  { tgl: '2026-10-01', bb: 9.5, tb: 79.5, lk: 44, lila: 13, usia: 20 },
] };
const exactDay = examinationRows([child], { from: '2026-10-01', to: '2026-10-01' });
assert.deepEqual(exactDay.map(row => row.measurement.bb), [9.5]);
const rows = examinationRows([child], '2026-09');
assert.equal(rows.length, 1);
assert.equal(rows[0].measurement.bb, 9);
assert.equal(examinationRows([child], '2025-09').length, 0);
assert.equal(examinationRows([child], '2026-10').length, 2);
assert.equal(examinationRows([child], '2026-10')[0].measurement.tgl, '2026-10-10');
assert.equal(examinationRows([child], '', 'missing').length, 0);
assert.equal(examinationRows([child], '', '', 'P').length, 0);
const bytes = XLSX.write(createWorkbook(rows), { type: 'buffer', bookType: 'xlsx' });
assert.equal(bytes.subarray(0, 2).toString(), 'PK');
const wb = XLSX.read(bytes);
const exported = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
assert.equal(exported[0]['BB (kg)'], 9);
assert.equal(exported[0]['NIK'], child.nik);
assert.equal(exported[0]['Tanggal Pemeriksaan'], '2026-09-10');
assert.deepEqual(examinationRows([child], { from: '2026-09-10', to: '2026-10-01' }).map(row => row.measurement.bb), [9.5, 9]);
assert.equal(examinationRows([child], { from: '2026-01-01', to: '2026-12-31' }).length, 3);
assert.equal(examinationRows([child], { from: '2025-01-01', to: '2025-12-31' }).length, 0);
assert.equal(examinationRows([child], { from: '2026-10-01' }).length, 2);
assert.equal(examinationRows([child], { to: '2026-09-10' }).length, 1);
assert.equal(examinationRows([child], {}).length, 3);
assert.equal(examinationRows([child], {}, '  ANAK  ', 'L').length, 3);
assert.equal(examinationRows([child], {}, child.nik, 'L').length, 3);
for (const filter of [{ from: '2026-10-02', to: '2026-10-01' }, { from: '2026-02-29' }, { to: '2024-02-30' }, { from: '0000-01-01' }, { to: '10000-01-01' }, { from: '2026-1-01' }, '2026-13', '2026-00']) {
  assert.throws(() => examinationRows([child], filter), /Tanggal|Bulan/);
  assert.throws(() => examinationFilename('tenant', filter), /Tanggal|Bulan/);
}
const leapChild = { ...child, history: [{ tgl: '2024-02-28' }, { tgl: '2024-02-29' }, { tgl: '2024-03-01' }, { tgl: '2025-02-29' }] };
assert.deepEqual(examinationRange('2024-02'), { from: '2024-02-01', to: '2024-02-29' });
assert.deepEqual(examinationRange('2025-02'), { from: '2025-02-01', to: '2025-02-28' });
assert.deepEqual(examinationRange('9999-12'), { from: '9999-12-01', to: '9999-12-31' });
assert.equal(examinationRows([leapChild], { from: '2024-02-29', to: '2024-02-29' }).length, 1);
assert.equal(examinationRows([leapChild], '2024-02').length, 2);
assert.equal(examinationRows([leapChild]).length, 3);
const multiRows = examinationRows(grouped, { from: '2026-09-10', to: '2026-10-01' });
const multiBytes = XLSX.write(createWorkbook(multiRows), { type: 'buffer', bookType: 'xlsx' });
const multiSheet = XLSX.read(multiBytes).Sheets.Pemeriksaan;
assert.deepEqual(XLSX.utils.sheet_to_json(multiSheet).map(row => [row['Tanggal Pemeriksaan'], row['BB (kg)']]), multiRows.map(row => [row.measurement.tgl, row.measurement.bb]));
const multiImported = parseWorkbook(multiBytes);
assert.equal(multiImported.length, 1);
assert.deepEqual(multiImported[0].history.map(row => [row.tgl, row.bb]), [['2026-09-10', 9], ['2026-10-01', 10]]);
assert.equal(examinationFilename('tenant'), 'Data_Posyandu_tenant_semua.xlsx');
assert.equal(examinationFilename('tenant', { from: '2024-02-29', to: '2024-02-29' }), 'Data_Posyandu_tenant_2024-02-29.xlsx');
assert.equal(examinationFilename('tenant', '2024-02'), 'Data_Posyandu_tenant_2024-02-01_sampai_2024-02-29.xlsx');
assert.equal(examinationFilename('tenant', { from: '2026-01-01', to: '2026-12-31' }, 'Anak', 'P'), 'Data_Posyandu_tenant_2026-01-01_sampai_2026-12-31_P_pencarian.xlsx');
assert.equal(examinationFilename('../tenant', { to: '2026-09-10' }), 'Data_Posyandu____tenant_awal_sampai_2026-09-10.xlsx');
assert.equal(examinationFilename('tenant', { from: '2026-09-10' }), 'Data_Posyandu_tenant_2026-09-10_sampai_akhir.xlsx');
const emptyChild = { ...child, id: 'new-child', nama: 'Belum Ukur', history: [], bb: 99, usiaBulan: 99 };
const allRows = examinationRows([emptyChild, child]);
assert.equal(allRows.length, 4);
assert.equal(allRows.at(-1).measurement, null);
assert.equal(examinationRows([emptyChild], {}, 'belum', 'L').length, 1);
assert.equal(examinationRows([emptyChild], {}, '', 'P').length, 0);
for (const range of ['2026-10', { from: '2026-01-01' }, { to: '2026-12-31' }]) {
  assert.equal(examinationRows([emptyChild], range).length, 0);
}
const emptyBytes = XLSX.write(createWorkbook(allRows), { type: 'buffer', bookType: 'xlsx' });
const emptySheet = XLSX.read(emptyBytes).Sheets.Pemeriksaan;
const emptyExport = XLSX.utils.sheet_to_json(emptySheet, { defval: '' });
assert.equal(emptyExport.length, allRows.length);
assert.equal(emptyExport.at(-1)['Nama Anak'], emptyChild.nama);
for (const header of ['Tanggal Pemeriksaan', 'Usia Bulan', 'BB (kg)', 'TB (cm)', 'LK (cm)', 'LiLA (cm)']) {
  assert.equal(emptyExport.at(-1)[header], '');
}
assert.equal(emptySheet.A5.t, 's');
assert.equal(emptySheet.F5.t, 's');
assert.equal(grouped[0].usiaBulan, grouped[0].history.at(-1).usia);
assert.throws(() => parseWorkbook(emptyBytes), /Baris/); // Export never weakens strict measured-row imports.
console.log('Day/month/year filters, empty identity rows, blank XLSX metrics, strict imports and roundtrip passed');
