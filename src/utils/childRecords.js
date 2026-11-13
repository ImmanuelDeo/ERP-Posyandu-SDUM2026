// Local record validation. Server must repeat these checks before cloud writes.
export function ageInMonths(birth, date) {
  const b = new Date(`${birth}T00:00:00Z`), d = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birth || '') || !/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !Number.isFinite(+b) || !Number.isFinite(+d) || b.toISOString().slice(0, 10) !== birth || d.toISOString().slice(0, 10) !== date || d < b) throw new Error('Tanggal lahir atau pemeriksaan tidak valid.');
  return (d.getUTCFullYear() - b.getUTCFullYear()) * 12 + d.getUTCMonth() - b.getUTCMonth() - (d.getUTCDate() < b.getUTCDate() ? 1 : 0);
}
export function validateMeasurement(child, measurement) {
  const usia = ageInMonths(child.tglLahir, measurement.tgl);
  if (measurement.tgl > new Date().toISOString().slice(0, 10)) throw new Error('Tanggal pemeriksaan tidak boleh di masa depan.');
  const result = { tgl: measurement.tgl, usia };
  for (const [key, min, max] of [['bb', 1, 40], ['tb', 30, 150], ['lk', 20, 65], ['lila', 5, 35]]) {
    const value = Number(measurement[key]);
    if (measurement[key] === '' || measurement[key] == null || !Number.isFinite(value) || value < min || value > max) throw new Error(`Nilai ${key.toUpperCase()} harus antara ${min} dan ${max}.`);
    result[key] = value;
  }
  return result;
}
export function prepareChild(input, existing = []) {
  const child = { id: crypto.randomUUID(), history: [] };
  for (const key of ['nama', 'namaOrtu', 'nik', 'telp', 'alamat']) {
    child[key] = String(input[key] || '').trim().replace(/\s+/g, ' ');
    if (child[key].length > (key === 'alamat' ? 500 : 120)) throw new Error('Data identitas terlalu panjang.');
  }
  if (child.nama.length < 2 || child.namaOrtu.length < 2) throw new Error('Nama anak dan nama ibu wajib diisi.');
  if (child.nik && !/^\d{16}$/.test(child.nik)) throw new Error('NIK harus 16 digit, atau kosongkan jika belum tersedia.');
  if (child.telp && !/^\+?[\d -]{8,20}$/.test(child.telp)) throw new Error('Nomor telepon tidak valid.');
  if (!['L', 'P'].includes(input.gender)) throw new Error('Jenis kelamin tidak valid.');
  child.gender = input.gender;
  child.tglLahir = input.tglLahir;
  child.usiaBulan = ageInMonths(child.tglLahir, new Date().toISOString().slice(0, 10));
  const duplicate = existing.find(c => (child.nik && c.nik === child.nik) || (c.nama?.toLowerCase() === child.nama.toLowerCase() && c.tglLahir === child.tglLahir && c.namaOrtu?.toLowerCase() === child.namaOrtu.toLowerCase()));
  if (duplicate) throw new Error(`Data sudah terdaftar: ${duplicate.nama}, ibu ${duplicate.namaOrtu || '-'}. Gunakan tab "Balita Terdaftar" untuk input pengukuran, atau ubah identitas bila ini memang anak yang berbeda.`);
  return child;
}
