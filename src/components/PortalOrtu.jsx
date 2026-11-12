// src/components/PortalOrtu.jsx
import React, { useState } from 'react';
import {
  Baby,
  Calendar,
  User,
  MapPin,
  LogOut,
  Sparkles,
  FileText,
  Info
} from 'lucide-react';
import DualLineGrowthChart from './DualLineGrowthChart';
import StandarKesehatanCard from './StandarKesehatanCard';

/**
 * Interface Khusus Orang Tua (View Only)
 * Didesain responsif:
 * - Mobile (< lg): Stack vertikal compact, mudah dibaca ibu-ibu di smartphone.
 * - Tablet & Desktop (>= lg): Grid 2 kolom seimbang (kiri: profil & grafik, kanan: standar kemenkes & buku riwayat)
 *   sehingga memenuhi layar laptop secara proporsional tanpa ruang kosong berlebih.
 */
export default function PortalOrtu({ child, tenant, onLogout, onOpenTentang }) {
  const [activeMeasurement, setActiveMeasurement] = useState(null);
  const [activePrev, setActivePrev] = useState(null);

  if (!child) return null;

  const history = child.history || [];
  const latest = history[history.length - 1] || {
    bb: child.bb,
    tb: child.tb,
    lk: child.lk,
    lila: child.lila,
    usia: child.usiaBulan,
    tgl: 'Terbaru'
  };
  const prev = history.length > 1 ? history[history.length - 2] : null;

  const currentDisplay = activeMeasurement || latest;
  const prevDisplay = activeMeasurement ? activePrev : prev;

  return (
    <div className="min-h-screen w-full bg-[#FCF9F4] text-slate-800 flex flex-col justify-between overflow-x-hidden antialiased">
      {/* Top Header Khusus Orang Tua */}
      <header className="sticky top-0 z-40 bg-teal-800 text-white shadow-md w-full">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-teal-600/60 border border-teal-400/40 flex items-center justify-center text-white flex-shrink-0 shadow-xs">
              <Baby className="w-5 h-5 text-teal-200" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-serif font-bold text-sm sm:text-base tracking-tight truncate leading-tight">
                  Buku Kesehatan Digital
                </h1>
                <span className="bg-emerald-500/30 text-emerald-200 text-[9px] font-black px-1.5 py-0.5 rounded border border-emerald-300/30">
                  ORTU
                </span>
              </div>
              <p className="text-[11px] text-teal-100/80 truncate leading-none mt-0.5">
                {tenant?.title || 'Posyandu Terpadu'} • {tenant?.district || 'Kabupaten Banyumas'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenTentang && (
              <button
                type="button"
                onClick={onOpenTentang}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-teal-100 text-xs font-bold transition flex-shrink-0 border border-white/20"
                title="Tentang Posyandu Cerdas"
              >
                <Info className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tentang</span>
              </button>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-teal-100 text-xs font-bold transition flex-shrink-0 border border-white/20"
              title="Keluar dari Portal Orang Tua"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area - Responsif Adaptif Tablet & Desktop */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-5 space-y-4">
        {/* Banner Sambutan Hangat */}
        <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-amber-50 border border-teal-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-800 mb-1">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Portal Tumbuh Kembang Buah Hati</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Selamat datang, <strong>{child.namaOrtu}</strong>. Ini adalah rekam pertumbuhan resmi ananda <strong>{child.nama}</strong> yang tercatat di posyandu secara digital.
          </p>
        </div>

        {/* Grid 2 Kolom di Layar Lebar (>= lg) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
          {/* KOLOM KIRI: Profil Balita & Grafik Dual Line TB & BB */}
          <div className="lg:col-span-7 space-y-4">
            {/* Kartu Profil Balita */}
            <div className="bg-white rounded-3xl border border-[#E8E2D5] p-4 sm:p-5 shadow-warm-card space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-xs flex-shrink-0 ${
                    child.gender === 'L' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-pink-100 text-pink-700 border border-pink-200'
                  }`}>
                    {child.gender}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 truncate">
                      {child.nama}
                    </h2>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span>NIK: {child.nik ? `${child.nik.slice(0, 6)}******${child.nik.slice(-4)}` : '-'}</span>
                      <span>•</span>
                      <span className="font-bold text-teal-800">{child.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-teal-50 text-teal-800 border border-teal-200">
                  {latest.usia || child.usiaBulan} Bulan
                </span>
              </div>

              {/* Info Tambahan Profil */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block">Lahir:</span>
                    <span className="font-semibold text-slate-800 truncate block">{child.tglLahir || '-'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block">Orang Tua:</span>
                    <span className="font-semibold text-slate-800 truncate block">{child.namaOrtu}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block">Alamat:</span>
                    <span className="font-semibold text-slate-800 truncate block">{child.alamat}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grafik KMS Standar Kemenkes TB & BB + 4 Kartu Perbandingan Lengkap */}
            <DualLineGrowthChart
              history={history}
              child={child}
              onRecordChange={(cur, prevRec) => {
                setActiveMeasurement(cur);
                setActivePrev(prevRec);
              }}
            />
          </div>

          {/* KOLOM KANAN: Standar Kesehatan Kemenkes & Tabel Riwayat */}
          <div className="lg:col-span-5 space-y-4">
            {/* Standar Kesehatan Anak Kemenkes */}
            <StandarKesehatanCard
              child={child}
              currentMeasurement={currentDisplay}
              prevMeasurement={prevDisplay}
            />

            {/* Riwayat Penimbangan Lengkap (Tabel) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>Buku Catatan Penimbangan Bulanan</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {history.length} Catatan
                </span>
              </div>

              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Tanggal</th>
                      <th className="py-2.5 px-2">Usia</th>
                      <th className="py-2.5 px-2 text-teal-800 font-black">BB (kg)</th>
                      <th className="py-2.5 px-2 text-blue-800 font-black">TB (cm)</th>
                      <th className="py-2.5 px-2">LK</th>
                      <th className="py-2.5 px-2">LiLA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                    {history.slice().reverse().map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">{row.tgl}</td>
                        <td className="py-2.5 px-2 text-slate-600">{row.usia} bln</td>
                        <td className="py-2.5 px-2 text-teal-700 font-black">{row.bb}</td>
                        <td className="py-2.5 px-2 text-blue-700 font-black">{row.tb}</td>
                        <td className="py-2.5 px-2 text-slate-600">{row.lk || '-'}</td>
                        <td className="py-2.5 px-2 text-slate-600">{row.lila || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-5 text-xs text-slate-500 border-t border-[#E8E2D5] bg-[#FCF9F4]">
        Buku Kesehatan Ibu dan Anak Digital • Posyandu Cerdas SDUM 2026
      </footer>
    </div>
  );
}
