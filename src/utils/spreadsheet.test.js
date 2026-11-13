import assert from 'node:assert/strict';
import * as XLSX from 'xlsx';
import { examinationRows, createWorkbook, parseWorkbook, MAX_FILE_BYTES } from './spreadsheet.js';

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
console.log('Monthly filter and real XLSX export passed');
