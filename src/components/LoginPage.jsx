import React, { useState } from 'react';
import { hasLocalAdmin, setupLocalAdmin, loginLocalAdmin, registerLocalParent, loginLocalParent } from '../services/localAccounts';

export default function LoginPage({ onAdminLoginSuccess, onOrtuLoginSuccess, onBackToWelcome }) {
  const [mode, setMode] = useState('admin');
  const [adminExists, setAdminExists] = useState(() => { try { return hasLocalAdmin(); } catch { return true; } });
  const empty = { username: '', password: '', confirm: '', motherName: '', childName: '', birthDate: '' };
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const creating = mode === 'register' || (mode === 'admin' && !adminExists);
  const changeMode = (value) => { setMode(value); setForm(empty); setMessage(''); setShowPassword(false); };
  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setMessage('');
    try {
      if (creating && form.password !== form.confirm) throw new Error('Konfirmasi password tidak sama.');
      if (mode === 'admin') {
        if (!adminExists) { await setupLocalAdmin(form.username, form.password); setAdminExists(true); }
        else await loginLocalAdmin(form.username, form.password);
        setForm(empty); onAdminLoginSuccess?.();
      } else if (mode === 'register') {
        await registerLocalParent(form, form.password);
        setMode('parent'); setForm({ ...empty, username: form.username });
        setMessage('Akun dibuat. Menunggu verifikasi kader; login untuk melihat status. Data anak belum dapat diakses.');
      } else {
        const account = await loginLocalParent(form.username, form.password);
        setForm(empty); onOrtuLoginSuccess?.(account);
      }
    } catch (err) { setMessage(err.message || 'Penyimpanan akun gagal. Coba lagi.'); }
    finally { setBusy(false); }
  };
  const field = (name, label, type = 'text') => <div key={name}>
    <label htmlFor={`login-${name}`} className="block text-sm font-bold mb-1">{label}</label>
    <input id={`login-${name}`} name={name} type={type === 'password' && showPassword ? 'text' : type} required disabled={busy}
      autoComplete={name === 'username' ? 'username' : type === 'password' ? (creating ? 'new-password' : 'current-password') : 'off'}
      minLength={type === 'password' ? 12 : undefined} maxLength={type === 'password' ? 128 : 150}
      value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      className="w-full min-h-11 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:border-teal-700" />
  </div>;
  return <div className="min-h-screen bg-[#FCF9F4] text-slate-800 p-4 sm:p-6 flex items-center justify-center">
    <div className="max-w-xl w-full space-y-4">
      <button type="button" onClick={onBackToWelcome} disabled={busy} className="min-h-11 text-sm font-bold text-teal-800">Kembali</button>
      <h1 className="text-center font-serif text-2xl font-bold text-teal-950">Akun Sistem Posyandu</h1>
      <p className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs leading-relaxed">Prototipe lokal, bukan autentikasi server. Data dan akun hanya tersimpan di browser ini dan dapat diubah oleh pengguna perangkat. Password disimpan sebagai hash PBKDF2, bukan teks biasa. Jangan gunakan password layanan lain atau data pasien asli. Supabase Auth dan perlindungan akses server belum aktif.</p>
      <div className="flex gap-2 bg-white border rounded-2xl p-1.5">
        {[['admin', 'Admin / Kader'], ['parent', 'Orang Tua']].map(([key, label]) => <button key={key} type="button" disabled={busy} aria-pressed={key === 'admin' ? mode === 'admin' : mode !== 'admin'} onClick={() => changeMode(key)} className={`flex-1 min-h-11 rounded-xl text-sm font-bold ${(key === 'admin' ? mode === 'admin' : mode !== 'admin') ? 'bg-teal-700 text-white' : 'text-slate-600'}`}>{label}</button>)}
      </div>
      <form onSubmit={submit} className="bg-white rounded-3xl border border-[#E8E2D5] p-5 sm:p-6 shadow-warm-card space-y-4">
        <h2 className="font-bold text-teal-900">{mode === 'admin' ? (adminExists ? 'Login Admin / Kader' : 'Siapkan Pengelola Lokal') : creating ? 'Daftar Akun Orang Tua' : 'Login Orang Tua'}</h2>
        {mode === 'admin' && !adminExists && <p className="text-xs">Buat akun pengelola pada browser ini. Ini bukan pendaftaran admin produksi dan tidak memverifikasi kewenangan petugas.</p>}
        {mode === 'register' && <p className="text-xs">Nama ibu, nama lengkap anak, dan tanggal lahir digunakan untuk peninjauan kader, bukan bukti kepemilikan. Kader harus memeriksa identitas secara langsung sebelum menghubungkan data. Nama tidak dicocokkan sebagian.</p>}
        {field('username', 'Username')}{field('password', 'Password (12–128 karakter)', 'password')}
        <button type="button" aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)} className="min-h-11 text-sm text-teal-800">{showPassword ? 'Sembunyikan password' : 'Tampilkan password'}</button>
        {creating && field('confirm', 'Konfirmasi Password', 'password')}
        {mode === 'register' && <>{field('motherName', 'Nama Lengkap Ibu')}{field('childName', 'Nama Lengkap Anak')}{field('birthDate', 'Tanggal Lahir Anak', 'date')}</>}
        {message && <p role="status" className="p-3 rounded-xl bg-amber-50 text-sm">{message}</p>}
        <button type="submit" disabled={busy} className="w-full min-h-[52px] rounded-2xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold text-sm p-3">{busy ? 'Memproses…' : creating ? (mode === 'admin' ? 'Buat Pengelola Lokal & Pilih Posyandu' : 'Daftar & Ajukan Verifikasi Kader') : 'Login'}</button>
        {mode !== 'admin' && <button type="button" disabled={busy} onClick={() => changeMode(creating ? 'parent' : 'register')} className="min-h-11 w-full text-sm font-bold text-teal-800">{creating ? 'Sudah punya akun? Login' : 'Belum punya akun? Daftar'}</button>}
      </form>
    </div>
  </div>;
}
