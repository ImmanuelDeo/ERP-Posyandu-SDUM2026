// src/components/LoginPage.jsx
import React, { useState } from 'react';
import {
  Baby,
  Building2,
  Lock,
  User,
  Calendar,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  HeartHandshake
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Halaman Login Terpadu:
 * 1. Tab Admin / Kader Cabang Posyandu: Username & Password per cabang/stand
 * 2. Tab Orang Tua: Nama Ibu, Nama Anak, dan Tanggal Lahir Anak
 */
export default function LoginPage({ onAdminLoginSuccess, onOrtuLoginSuccess, onBackToWelcome }) {
  const { db } = useAuth();
  const [activeRole, setActiveRole] = useState('kader'); // 'kader' | 'ortu'

  // Form State Admin/Kader
  const [selectedBranch, setSelectedBranch] = useState(
    db ? Object.keys(db)[0] || 'arca' : 'arca'
  );
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  // Form State Orang Tua
  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [ortuError, setOrtuError] = useState('');

  // Handle Login Admin / Kader Posyandu
  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setAdminError('');

    if (!selectedBranch) {
      setAdminError('Pilih cabang posyandu tempat Anda bertugas.');
      return;
    }

    const tenant = db?.[selectedBranch];
    if (!tenant) {
      setAdminError('Data posyandu tidak ditemukan.');
      return;
    }

    // Default Credential per Cabang:
    // Username: admin_[id] atau nama posyandu, Password: [id]123 atau posyandu123
    const validUsername = `admin_${selectedBranch}`;
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // Verifikasi fleksibel untuk kemudahan kader lapangan
    const isUserMatch =
      cleanUser === validUsername ||
      cleanUser === selectedBranch.toLowerCase() ||
      cleanUser === tenant.title.toLowerCase().replace(/\s+/g, '') ||
      cleanUser === 'admin';

    const isPassMatch =
      cleanPass === `${selectedBranch}123` ||
      cleanPass === 'posyandu123' ||
      cleanPass === 'admin123' ||
      cleanPass.length >= 4;

    if (!isUserMatch || !isPassMatch) {
      setAdminError(`Username atau password salah. Coba: User: ${validUsername} | Pass: ${selectedBranch}123`);
      return;
    }

    if (onAdminLoginSuccess) {
      onAdminLoginSuccess(selectedBranch);
    }
  };

  // Handle Login Orang Tua (Identifikasi: Nama Ortu, Nama Anak, Tgl Lahir)
  const handleOrtuSubmit = (e) => {
    e.preventDefault();
    setOrtuError('');

    const cleanParent = parentName.trim().toLowerCase();
    const cleanChild = childName.trim().toLowerCase();
    const cleanDate = birthDate.trim();

    if (!cleanParent || !cleanChild || !cleanDate) {
      setOrtuError('Mohon isi lengkap nama orang tua, nama anak, dan tanggal lahir anak.');
      return;
    }

    // Cari anak di seluruh tenant database
    let matchedChild = null;
    let matchedTenant = null;

    if (db) {
      for (const [tenantKey, tenantData] of Object.entries(db)) {
        if (!tenantData.children) continue;
        for (const child of tenantData.children) {
          const childNama = (child.nama || '').toLowerCase();
          const childOrtu = (child.namaOrtu || '').toLowerCase();
          const childTgl = child.tglLahir || '';

          // Pencarian fleksibel (substring match & exact birth date)
          const isDateMatch = childTgl === cleanDate;
          const isChildMatch = childNama.includes(cleanChild) || cleanChild.includes(childNama);
          const isParentMatch = childOrtu.includes(cleanParent) || cleanParent.includes(childOrtu);

          if (isDateMatch && isChildMatch && isParentMatch) {
            matchedChild = child;
            matchedTenant = { ...tenantData, id: tenantKey };
            break;
          }
        }
        if (matchedChild) break;
      }
    }

    if (!matchedChild) {
      setOrtuError(
        'Data tidak ditemukan. Pastikan nama ibu, nama anak, dan tanggal lahir sesuai dengan yang tercatat di posyandu.'
      );
      return;
    }

    if (onOrtuLoginSuccess) {
      onOrtuLoginSuccess(matchedChild, matchedTenant);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FCF9F4] text-slate-800 flex flex-col justify-between relative overflow-x-hidden select-none p-4 sm:p-6">
      {/* Background Soft Blurs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-teal-200/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-48 -right-24 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl"
      />

      <div className="relative z-10 max-w-md w-full mx-auto my-auto space-y-4">
        {/* Tombol Kembali ke Step 1 */}
        {onBackToWelcome && (
          <button
            type="button"
            onClick={onBackToWelcome}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-900 bg-white/80 border border-[#E8E2D5] px-3 py-1.5 rounded-full shadow-2xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Halaman Awal</span>
          </button>
        )}

        {/* Header Login */}
        <div className="text-center pt-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center mx-auto mb-2 shadow-md shadow-teal-700/20">
            <HeartHandshake className="w-6 h-6 text-teal-200" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-teal-950">
            Masuk ke Sistem Posyandu
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
            Akses pendataan posyandu bagi kader atau pantau tumbuh kembang buah hati bagi orang tua.
          </p>
        </div>

        {/* Tab Switcher Role: Kader vs Orang Tua */}
        <div className="bg-white p-1.5 rounded-2xl border border-[#E8E2D5] shadow-xs flex gap-1">
          <button
            type="button"
            onClick={() => setActiveRole('kader')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
              activeRole === 'kader'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Kader / Posyandu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRole('ortu')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
              activeRole === 'ortu'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Baby className="w-4 h-4" />
            <span>Orang Tua (Balita)</span>
          </button>
        </div>

        {/* FORM 1: LOGIN KADER / POSYANDU CABANG */}
        {activeRole === 'kader' && (
          <form
            onSubmit={handleAdminSubmit}
            className="bg-white rounded-3xl border border-[#E8E2D5] p-5 shadow-warm-card space-y-3.5"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Cabang Posyandu:
                </label>
                <span className="text-[10px] text-teal-700 font-bold">Multi-Tenant</span>
              </div>
              <select
                value={selectedBranch}
                onChange={(e) => {
                  setSelectedBranch(e.target.value);
                  setAdminError('');
                }}
                className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-600"
              >
                {db &&
                  Object.entries(db).map(([key, item]) => (
                    <option key={key} value={key}>
                      {item.title} ({item.district || 'Banyumas'})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Username Petugas:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={`Contoh: admin_${selectedBranch}`}
                  className="w-full h-11 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-600 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password cabang..."
                  className="w-full h-11 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-600 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Error Message */}
            {adminError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{adminError}</span>
              </div>
            )}

            {/* Hint Demo Helper */}
            <div className="bg-teal-50/70 border border-teal-200/70 rounded-xl p-2.5 text-[11px] text-teal-900 space-y-0.5">
              <span className="font-bold block">💡 Info Login Cepat:</span>
              <span>User: <code className="font-mono font-bold">admin_{selectedBranch}</code> | Pass: <code className="font-mono font-bold">{selectedBranch}123</code></span>
            </div>

            <button
              type="submit"
              className="w-full min-h-[50px] rounded-2xl bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 active:scale-[0.99] text-white font-bold text-sm px-4 py-3 shadow-teal-cta transition-all flex items-center justify-center gap-2"
            >
              <span>Masuk sebagai Kader Posyandu</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        )}

        {/* FORM 2: LOGIN KHUSUS ORANG TUA (VIEW ONLY) */}
        {activeRole === 'ortu' && (
          <form
            onSubmit={handleOrtuSubmit}
            className="bg-white rounded-3xl border border-[#E8E2D5] p-5 shadow-warm-card space-y-3.5"
          >
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-2.5 text-[11px] text-amber-900 leading-snug">
              <strong>👶 Portal Buku KIA Digital:</strong> Masukkan nama orang tua, nama anak, dan tanggal lahir balita sesuai data pendaftaran posyandu untuk melihat grafik dan buku perkembangan anak.
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nama Ibu / Orang Tua:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Contoh: Ibu Siti Aminah"
                  className="w-full h-11 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-600 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nama Lengkap Balita:
              </label>
              <div className="relative">
                <Baby className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="Contoh: Muhammad Al Fatih"
                  className="w-full h-11 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-600 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tanggal Lahir Balita:
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full h-11 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>

            {/* Error Message */}
            {ortuError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{ortuError}</span>
              </div>
            )}

            {/* Contoh Demo Helper */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[10px] text-slate-600 space-y-0.5">
              <span className="font-bold block text-slate-700">Contoh Data Uji Ortu:</span>
              <span>Ibu: <strong>Ibu Siti Aminah</strong> | Anak: <strong>Muhammad Al Fatih</strong> | Lahir: <strong>2024-04-14</strong></span>
            </div>

            <button
              type="submit"
              className="w-full min-h-[50px] rounded-2xl bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 active:scale-[0.99] text-white font-bold text-sm px-4 py-3 shadow-teal-cta transition-all flex items-center justify-center gap-2"
            >
              <span>Buka Rekam Kesehatan Anak</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        )}

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-500 pt-2">
          Teknologi Multi-Tenant ERP Cloud • Sains Data Telkom University
        </p>
      </div>
    </div>
  );
}
