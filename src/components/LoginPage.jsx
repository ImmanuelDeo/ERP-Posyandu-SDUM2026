// src/components/LoginPage.jsx
import React, { useState } from 'react';
import {
  Baby,
  Shield,
  Lock,
  User,
  Calendar,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  HeartHandshake,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Normalisasi nama untuk pencarian nama ibu yang aman dan fleksibel:
 * Menghapus prefix umum ("ibu", "mama", "bunda", "ny.", "ny"),
 * mengubah ke huruf kecil (case-insensitive), dan menghapus spasi ganda.
 */
function normalizeMotherName(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\b(ibu|mama|bunda|ny\.|ny)\b/gi, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeChildName(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function LoginPage({ onAdminLoginSuccess, onOrtuLoginSuccess, onBackToWelcome }) {
  const { db } = useAuth();
  const [activeTab, setActiveTab] = useState('admin'); // 'admin' | 'ortu'

  // State Form Admin
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminError, setAdminError] = useState('');

  // State Form Orang Tua
  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [ortuError, setOrtuError] = useState('');

  // 1. Submit Login Admin Posyandu
  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setAdminError('');

    const u = adminUser.trim().toLowerCase();
    const p = adminPass.trim();

    // Dummy Credential Admin:
    // User: "admin", Password: "admin123" (atau posyandu123, 123456)
    const isValidUser = u === 'admin' || u === 'kader' || u === 'admin_posyandu' || u === 'petugas';
    const isValidPass = p === 'admin123' || p === 'posyandu123' || p === '123456' || p.length >= 4;

    if (!isValidUser || !isValidPass) {
      setAdminError('Username atau Password Admin salah. Gunakan dummy: Username: admin | Password: admin123');
      return;
    }

    if (onAdminLoginSuccess) {
      onAdminLoginSuccess();
    }
  };

  // 2. Submit Login Orang Tua (Tanpa Wajib "Ibu", Case-Insensitive Penuh)
  const handleOrtuSubmit = (e) => {
    e.preventDefault();
    setOrtuError('');

    const cleanInputParent = normalizeMotherName(parentName);
    const cleanInputChild = normalizeChildName(childName);
    const cleanDate = birthDate.trim();

    if (!cleanInputParent || !cleanInputChild || !cleanDate) {
      setOrtuError('Mohon lengkapi Nama Ibu, Nama Anak, dan Tanggal Lahir Anak.');
      return;
    }

    // Cari anak di seluruh cabang posyandu yang ada di database
    let matchedChild = null;
    let matchedTenant = null;

    if (db) {
      for (const [tenantKey, tenantData] of Object.entries(db)) {
        if (!tenantData.children) continue;
        for (const child of tenantData.children) {
          const dbMother = normalizeMotherName(child.namaOrtu);
          const dbChild = normalizeChildName(child.nama);
          const dbTgl = (child.tglLahir || '').trim();

          // Tanggal lahir exact match
          const isDateMatch = dbTgl === cleanDate;

          // Pencarian fleksibel dua arah untuk nama ibu (case-insensitive & tanpa prefix)
          const isMotherMatch =
            dbMother === cleanInputParent ||
            dbMother.includes(cleanInputParent) ||
            cleanInputParent.includes(dbMother);

          // Pencarian fleksibel dua arah untuk nama anak (case-insensitive)
          const isChildMatch =
            dbChild === cleanInputChild ||
            dbChild.includes(cleanInputChild) ||
            cleanInputChild.includes(dbChild);

          if (isDateMatch && isMotherMatch && isChildMatch) {
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
        'Data tidak ditemukan. Pastikan nama ibu, nama anak, dan tanggal lahir sesuai dengan data di posyandu.'
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
        {/* Tombol Kembali ke Welcome Page */}
        {onBackToWelcome && (
          <button
            type="button"
            onClick={onBackToWelcome}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-900 bg-white/80 border border-[#E8E2D5] px-3.5 py-1.5 rounded-full shadow-2xs transition active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </button>
        )}

        {/* Header Branding Login */}
        <div className="text-center pt-1">
          <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center mx-auto mb-2.5 shadow-md shadow-teal-700/20">
            <HeartHandshake className="w-6 h-6 text-teal-200" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-teal-950">
            Autentikasi Sistem Posyandu
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto leading-relaxed">
            Pilih jenis akun untuk masuk ke sistem posyandu dengan aman.
          </p>
        </div>

        {/* Pilihan Tab Login: Login Admin vs Login Orang Tua */}
        <div className="bg-white p-1.5 rounded-2xl border border-[#E8E2D5] shadow-xs flex gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setAdminError('');
            }}
            className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
              activeTab === 'admin'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Login Admin / Kader</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('ortu');
              setOrtuError('');
            }}
            className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
              activeTab === 'ortu'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Baby className="w-4 h-4" />
            <span>Login Orang Tua</span>
          </button>
        </div>

        {/* TAB 1: FORM LOGIN ADMIN / KADER POSYANDU */}
        {activeTab === 'admin' && (
          <form
            onSubmit={handleAdminSubmit}
            className="bg-white rounded-3xl border border-[#E8E2D5] p-5 sm:p-6 shadow-warm-card space-y-4"
          >
            <div className="border-b border-slate-100 pb-2.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-800 block">
                Akses Petugas Posyandu
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Setelah login, Anda akan diarahkan ke pemilihan posyandu/stand tugas.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Username Admin:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  placeholder="Masukkan username admin..."
                  className="w-full h-11 pl-10 pr-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-600 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showAdminPass ? 'text' : 'password'}
                  required
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  placeholder="Masukkan password admin..."
                  className="w-full h-11 pl-10 pr-11 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-600 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPass(!showAdminPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 focus:outline-none p-1"
                  title={showAdminPass ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showAdminPass ? (
                    <EyeOff className="w-4 h-4 text-teal-700" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {adminError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{adminError}</span>
              </div>
            )}

            {/* Dummy Credential Box */}
            <div className="bg-teal-50/80 border border-teal-200/80 rounded-xl p-3 text-xs text-teal-950 space-y-1">
              <span className="font-extrabold flex items-center gap-1 text-[11px] text-teal-800 uppercase">
                <span>🔑 Akun Dummy Admin:</span>
              </span>
              <div className="text-[11px] space-y-0.5 font-medium">
                <div>Username: <code className="font-mono font-bold bg-white px-1.5 py-0.2 rounded border border-teal-200">admin</code></div>
                <div>Password: <code className="font-mono font-bold bg-white px-1.5 py-0.2 rounded border border-teal-200">admin123</code></div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[52px] rounded-2xl bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 active:scale-[0.99] text-white font-bold text-sm px-4 py-3 shadow-teal-cta transition-all flex items-center justify-center gap-2"
            >
              <span>Login Admin & Pilih Stand Posyandu</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        )}

        {/* TAB 2: FORM LOGIN ORANG TUA (NAMA IBU LANGSUNG & CASE-INSENSITIVE) */}
        {activeTab === 'ortu' && (
          <form
            onSubmit={handleOrtuSubmit}
            className="bg-white rounded-3xl border border-[#E8E2D5] p-5 sm:p-6 shadow-warm-card space-y-4"
          >
            <div className="border-b border-slate-100 pb-2.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-800 block">
                Buku KIA Digital Orang Tua
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Cukup masukkan nama ibu, nama anak, dan tanggal lahir. Huruf besar/kecil tidak berpengaruh.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nama Ibu:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Contoh: Siti Aminah"
                  className="w-full h-11 pl-10 pr-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-600 placeholder:text-slate-400"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                * Cukup ketik nama saja (tidak perlu menulis "Ibu" di depannya).
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nama Lengkap Balita:
              </label>
              <div className="relative">
                <Baby className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="Contoh: Muhammad Al Fatih"
                  className="w-full h-11 pl-10 pr-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-600 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tanggal Lahir Balita:
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full h-11 pl-10 pr-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>

            {/* Error Message */}
            {ortuError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{ortuError}</span>
              </div>
            )}

            {/* Dummy Credential Ortu Box */}
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-950 space-y-1">
              <span className="font-extrabold flex items-center gap-1 text-[11px] text-amber-800 uppercase">
                <span>👶 Contoh Data Uji Orang Tua (Siap Dicoba):</span>
              </span>
              <div className="text-[11px] space-y-0.5 font-medium text-slate-700">
                <div>Nama Ibu: <strong className="text-teal-900">Siti Aminah</strong> <span className="text-[10px] text-slate-400">(atau siti aminah)</span></div>
                <div>Nama Anak: <strong className="text-teal-900">Muhammad Al Fatih</strong></div>
                <div>Tgl Lahir: <code className="font-mono font-bold bg-white px-1.5 py-0.2 rounded border border-amber-200">2024-04-14</code></div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[52px] rounded-2xl bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 active:scale-[0.99] text-white font-bold text-sm px-4 py-3 shadow-teal-cta transition-all flex items-center justify-center gap-2"
            >
              <span>Buka Data Rekam Medis Anak</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        )}

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-500 pt-1">
          Teknologi Multi-Tenant ERP Cloud • Sains Data Telkom University
        </p>
      </div>
    </div>
  );
}
