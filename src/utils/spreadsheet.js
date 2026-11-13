import * as XLSX from 'xlsx/xlsx.mjs';
const { SSF } = XLSX;
import { prepareChild, validateMeasurement } from './childRecords.js';

export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_ROWS = 5000;

export function parseWorkbook(bytes, existing = []) {
  if (!bytes?.byteLength || bytes.byteLength > MAX_FILE_BYTES) throw new Error('File wajib berisi data, maksimal 5 MB.');
  const workbook = XLSX.read(bytes, { type: 'array', cellDates: false, sheetRows: MAX_ROWS + 2 });
  if (workbook.SheetNames.length !== 1) throw new Error('Gunakan satu lembar data saja.');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet?.['!ref']) throw new Error('File kosong.');
  const range = XLSX.utils.decode_range(sheet['!fullref'] || sheet['!ref']);
  if (range.e.r > MAX_ROWS || range.e.c >= HEADERS.length) throw new Error('Maksimal 5000 baris dan 13 kolom.');
  for (const [key, cell] of Object.entries(sheet)) {
    if (!key.startsWith('!') && cell.f) throw new Error('Rumus Excel tidak diizinkan.');
  }
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: true, blankrows: true });
  const headers = rows.shift()?.map(value => String(value).trim());
  if (!headers || new Set(headers).size !== headers.length || HEADERS.filter(h => h !== 'Usia Bulan').some(h => !headers.includes(h)) || headers.some(h => !HEADERS.includes(h))) {
    throw new Error('Kolom tidak sesuai template. Semua kolom wajib; Usia Bulan opsional.');
  }
  const children = new Map();
  const date = value => {
    if (typeof value === 'number' && Number.isInteger(value)) {
      const parsed = SSF.parse_date_code(value, { date1904: !!workbook.Workbook?.WBProps?.date1904 });
      if (parsed) return `${String(parsed.y).padStart(4, '0')}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`;
    }
    return String(value).trim();
  };
  rows.forEach((values, index) => {
    if (values.every(v => v === '')) return;
    try {
      const row = Object.fromEntries(headers.map((header, i) => [header, values[i] ?? '']));
      if (typeof row.NIK !== 'string' || !/^\d{16}$/.test(row.NIK.trim())) throw new Error('NIK wajib teks 16 digit. Atur format sel Text sebelum mengetik NIK.');
      if (typeof row['No HP'] !== 'string') throw new Error('No HP wajib teks agar nol awal tidak hilang.');
      const child = prepareChild({ nik: row.NIK, nama: row['Nama Anak'], gender: String(row['Jenis Kelamin']).trim().toUpperCase(),
        tglLahir: date(row['Tanggal Lahir']), namaOrtu: row['Nama Orang Tua'], telp: row['No HP'], alamat: row.Alamat }, existing);
      const measurement = { tgl: date(row['Tanggal Pemeriksaan']) };
      for (const [key, header] of [['bb', 'BB (kg)'], ['tb', 'TB (cm)'], ['lk', 'LK (cm)'], ['lila', 'LiLA (cm)']]) {
        const value = row[header];
        if (!(typeof value === 'number' || (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value.trim())))) throw new Error(`${header} wajib angka desimal valid.`);
        measurement[key] = value;
      }
      child.history = [validateMeasurement(child, measurement)];
      if (row['Usia Bulan'] !== undefined && row['Usia Bulan'] !== '' &&
        (!/^\d+$/.test(String(row['Usia Bulan'])) || Number(row['Usia Bulan']) !== child.history[0].usia)) {
        throw new Error('Usia Bulan harus bilangan bulat sesuai tanggal lahir dan pemeriksaan.');
      }
      const previous = children.get(child.nik);
      if (previous) {
        if (['nama', 'gender', 'tglLahir', 'namaOrtu', 'telp', 'alamat'].some(key => child[key] !== previous[key])) throw new Error('Identitas NIK yang sama tidak konsisten.');
        if (previous.history.some(h => h.tgl === measurement.tgl)) throw new Error('Pemeriksaan duplikat untuk NIK dan tanggal yang sama.');
        previous.history.push(...child.history);
      } else {
        if ([...children.values()].some(c => c.nama.toLowerCase() === child.nama.toLowerCase() && c.tglLahir === child.tglLahir && c.namaOrtu.toLowerCase() === child.namaOrtu.toLowerCase())) throw new Error('Identitas anak duplikat dengan NIK berbeda.');
        children.set(child.nik, child);
      }
    } catch (error) {
      throw new Error(`Baris ${index + 2}: ${error.message}`);
    }
  });
  if (!children.size) throw new Error('File kosong.');
  return [...children.values()].map(child => {
    child.history.sort((a, b) => a.tgl.localeCompare(b.tgl));
    const latest = child.history.at(-1);
    return { ...child, bb: latest.bb, tb: latest.tb, lk: latest.lk, lila: latest.lila };
  });
}

export const HEADERS = ['NIK', 'Nama Anak', 'Jenis Kelamin', 'Tanggal Lahir', 'Nama Orang Tua', 'No HP', 'Alamat', 'Tanggal Pemeriksaan', 'Usia Bulan', 'BB (kg)', 'TB (cm)', 'LK (cm)', 'LiLA (cm)'];

export function examinationRows(children, month = '', query = '', gender = 'ALL') {
  const search = query.trim().toLowerCase();
  return children.flatMap(child => {
    if ((gender !== 'ALL' && child.gender !== gender) ||
      !(String(child.nama || '').toLowerCase().includes(search) || String(child.nik || '').includes(search))) return [];
    return (child.history || []).filter(measurement => /^\d{4}-\d{2}-\d{2}$/.test(measurement.tgl) &&
      (!month || measurement.tgl.slice(0, 7) === month)).map(measurement => ({ child, measurement }));
  }).sort((a, b) => b.measurement.tgl.localeCompare(a.measurement.tgl));
}

export function createWorkbook(rows) {
  const data = rows.map(({ child, measurement }) => [String(child.nik || ''), child.nama, child.gender,
    child.tglLahir || '', child.namaOrtu || '', String(child.telp || ''), child.alamat || '',
    measurement.tgl, measurement.usia ?? '', measurement.bb ?? '', measurement.tb ?? '', measurement.lk ?? '', measurement.lila ?? '']);
  const sheet = XLSX.utils.aoa_to_sheet([HEADERS, ...data]);
  sheet['!cols'] = HEADERS.map(() => ({ wch: 22 }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Pemeriksaan');
  return workbook;
}
