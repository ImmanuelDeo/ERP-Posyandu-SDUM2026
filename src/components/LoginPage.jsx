import React, { useState } from 'react';
import { hasLocalAdmin, loginLocalAdmin, loginLocalParent } from '../services/localAccounts';

export default function LoginPage({ db, targetTenantId, onAdminLoginSuccess, onOrtuLoginSuccess, onBackToWelcome }) {
  const [mode, setMode] = useState('admin');
  const [adminExists] = useState(() => { try { return hasLocalAdmin(); } catch { return true; } });
  const [tenantId, setTenantId] = useState(targetTenantId || '');
  const empty = { username: '', password: '', confirm: '', motherName: '', childName: '', birthDate: '' };
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const changeMode = (value) => { setMode(value); setForm(empty); setMessage(''); setShowPassword(false); };
  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setMessage('');
    try {
      if (mode === 'admin') {
        await loginLocalAdmin(form.username, form.password, tenantId, db);
        setForm(empty); onAdminLoginSuccess?.(tenantId);
      } else {
        const session = loginLocalParent(form, tenantId, db);
        setForm(empty); onOrtuLoginSuccess?.(session);
      }
    } catch (err) { setMessage(err.message || 'Penyimpanan akun gagal. Coba lagi.'); }
    finally { setBusy(false); }
  };
  const placeholders = { username: 'Masukkan username dari pengelola', password: 'Masukkan password admin Anda', motherName: 'Contoh: Siti Aminah', childName: 'Contoh: Muhammad Al Fatih' };
  const field = (name, label, type = 'text') => <div key={name}>
    <label htmlFor={`login-${name}`} className="block text-sm font-bold mb-1">{label}</label>
    <input id={`login-${name}`} name={name} type={type === 'password' && showPassword ? 'text' : type} required disabled={busy} placeholder={placeholders[name]} aria-describedby={name === 'birthDate' ? 'birth-date-help' : undefined}
      autoComplete={name === 'username' ? 'username' : type === 'password' ? 'current-password' : 'off'}
      minLength={type === 'password' ? 12 : undefined} maxLength={type === 'password' ? 128 : 150}
      value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      className="w-full min-h-11 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:border-teal-700" />
    {name === 'birthDate' && <p id="birth-date-help" className="mt-1 text-xs text-slate-500">Pilih tanggal, bulan, dan tahun sesuai tanggal lahir anak yang terdaftar.</p>}
  </div>;
  return <div className="min-h-screen bg-[#FCF9F4] text-slate-800 p-4 sm:p-6 flex items-center justify-center">
    <div className="max-w-xl w-full space-y-4">
      <button type="button" onClick={onBackToWelcome} disabled={busy} className="min-h-11 text-sm font-bold text-teal-800">Kembali</button>
      <h1 className="text-center font-serif text-2xl font-bold text-teal-950">Akun Sistem Posyandu</h1>
      <p className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs leading-relaxed">Prototipe lokal, bukan autentikasi server. Nama dan tanggal lahir bukan bukti identitas yang aman; siapa pun yang mengetahuinya dapat membuka data anak pada perangkat ini. Jangan gunakan alur ini untuk data pasien asli atau produksi. Data dan akun hanya tersimpan di browser ini dan dapat diubah oleh pengguna perangkat. Password disimpan sebagai hash PBKDF2, bukan teks biasa. Jangan gunakan password layanan lain atau data pasien asli. Supabase Auth dan perlindungan akses server belum aktif.</p>
      <div className="flex gap-2 bg-white border rounded-2xl p-1.5">
        {[['admin', 'Admin / Kader'], ['parent', 'Orang Tua']].map(([key, label]) => <button key={key} type="button" disabled={busy} aria-pressed={key === 'admin' ? mode === 'admin' : mode !== 'admin'} onClick={() => changeMode(key)} className={`flex-1 min-h-11 rounded-xl text-sm font-bold ${(key === 'admin' ? mode === 'admin' : mode !== 'admin') ? 'bg-teal-700 text-white' : 'text-slate-600'}`}>{label}</button>)}
      </div>
      <form onSubmit={submit} className="bg-white rounded-3xl border border-[#E8E2D5] p-5 sm:p-6 shadow-warm-card space-y-4">
        <h2 className="font-bold text-teal-900">{mode === 'admin' ? 'Login Admin / Kader' : 'Login Orang Tua'}</h2>
        <label htmlFor="login-tenant" className="block text-sm font-bold">Posyandu</label>
        <select id="login-tenant" required disabled={busy || Boolean(targetTenantId)} value={tenantId} onChange={(e) => setTenantId(e.target.value)} className="w-full min-h-11 px-3 border rounded-xl">
          <option value="">Pilih Posyandu</option>
          {Object.entries(db || {}).map(([id, tenant]) => <option key={id} value={id}>{tenant.title}</option>)}
        </select>
        {mode === 'admin' && !adminExists && <p role="alert" className="text-sm">Admin belum diprovisikan. Hubungi operator untuk membuat berkas impor dengan scripts/provision-local-admin.mjs dan memasangnya melalui DevTools pada browser ini. Pendaftaran admin publik tidak tersedia.</p>}
        {mode === 'admin' ? <>
          {field('username', 'Username')}{field('password', 'Password (12–128 karakter)', 'password')}
          <button type="button" aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)} className="min-h-11 text-sm text-teal-800">{showPassword ? 'Sembunyikan password' : 'Tampilkan password'}</button>
        </> : <>
          <p className="text-sm">Masukkan nama lengkap ibu, nama lengkap anak, dan tanggal lahir sesuai data utama anak di posyandu pilihan. Tanpa pendaftaran atau persetujuan akun. Nama ibu dinormalisasi (huruf, spasi, sapaan); nama anak harus cocok lengkap. Data ganda ditolak.</p>
          {field('motherName', 'Nama Lengkap Ibu')}{field('childName', 'Nama Lengkap Anak')}{field('birthDate', 'Tanggal Lahir Anak', 'date')}
        </>}
        {message && <p role="status" className="p-3 rounded-xl bg-amber-50 text-sm">{message}</p>}
        <button type="submit" disabled={busy || (mode === 'admin' && !adminExists)} className="w-full min-h-[52px] rounded-2xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold text-sm p-3">{busy ? 'Memproses…' : 'Login'}</button>
      </form>
    </div>
  </div>;
}
