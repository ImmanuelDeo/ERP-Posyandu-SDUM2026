// src/components/Perkembangan.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DualLineGrowthChart from './DualLineGrowthChart';
import StandarKesehatanCard from './StandarKesehatanCard';
import { X, IdCard } from 'lucide-react';

/**
 * Halaman Perkembangan & Komparasi Individu
 * Didesain responsif:
 * - Mobile (< lg): Stack vertikal compact
 * - Tablet & Desktop (>= lg): Grid 2 kolom seimbang (kiri: profil & grafik, kanan: standar kesehatan & riwayat)
 */
export default function Perkembangan({ initialChildId }) {
  const { getTenantData } = useAuth();
  const currentTenantData = getTenantData();
  const children = currentTenantData?.children || [];
  const [selectedChildId, setSelectedChildId] = useState(initialChildId || children[0]?.id || null);

  const [activeRecord, setActiveRecord] = useState(null);
  const [activePrevRecord, setActivePrevRecord] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const selectedChild = children.find(c => c.id === selectedChildId) || children[0];

  useEffect(() => {
    if (initialChildId) {
      setSelectedChildId(initialChildId);
      setActiveRecord(null);
      setActivePrevRecord(null);
    }
  }, [initialChildId]);

  if (!selectedChild) {
    return (
      <section className="p-3 space-y-3" id="perkembangan">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
          Belum ada data balita yang terdaftar di posyandu ini.
        </div>
      </section>
    );
  }

  const history = selectedChild.history || [];
  const latest = history[history.length - 1] || {
    bb: selectedChild.bb,
    tb: selectedChild.tb,
    lk: selectedChild.lk,
    lila: selectedChild.lila,
    usia: selectedChild.usiaBulan,
    tgl: 'Terbaru'
  };
  const prev = history.length > 1 ? history[history.length - 2] : null;

  const currentMeasurement = activeRecord || latest;
  const prevMeasurement = activeRecord ? activePrevRecord : prev;

  const handleChildSelectChange = (newChildId) => {
    setSelectedChildId(newChildId);
    setActiveRecord(null);
    setActivePrevRecord(null);
  };

  return (
    <section className="space-y-6" id="perkembangan">
      {/* Grid 2 Kolom di Tablet & Desktop (>= lg) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
        {/* KOLOM KIRI: Selector, Profil Balita & Grafik Dual Line TB & BB */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* Child Selector */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Pilih Balita untuk Dipantau:
              </label>
              <span className="text-[10px] text-teal-700 font-semibold">
                {children.length} Balita Terdaftar
              </span>
            </div>
            <select
              value={selectedChildId || selectedChild.id}
              onChange={(e) => handleChildSelectChange(e.target.value)}
              className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:outline-none focus:border-posyandu-600"
            >
              {children.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nama} ({c.gender === 'L' ? 'L' : 'P'}, Usia: {c.usiaBulan} bln, Ortu: {c.namaOrtu})
                </option>
              ))}
            </select>
          </div>

          {/* Profil Singkat Balita Terpilih (Klik untuk Detail Identitas Lengkap) */}
          <button
            type="button"
            onClick={() => setShowProfileModal(true)}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 text-left cursor-pointer hover:border-teal-300 hover:bg-teal-50/40 transition focus:outline-none focus:ring-2 focus:ring-teal-500/25"
            title="Lihat detail identitas balita"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                selectedChild.gender === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
              }`}>
                {selectedChild.gender}
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                  {selectedChild.nama}
                </h3>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  Ibu/Ortu: {selectedChild.namaOrtu} • NIK: {selectedChild.nik ? selectedChild.nik.slice(-4) : '-'}
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0 flex items-center gap-2">
              <div>
                <span className="text-xs font-black text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-xl block">
                  {currentMeasurement.usia || selectedChild.usiaBulan} Bulan
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">{currentMeasurement.tgl}</span>
              </div>
              <span className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                <IdCard className="w-4 h-4 text-slate-500" />
              </span>
            </div>
          </button>

          {/* 1. Grafik Visual Standar KMS TB & BB + 4 Kartu Perbandingan Lengkap */}
          <DualLineGrowthChart
            history={history}
            child={selectedChild}
            onRecordChange={(cur, prevRec) => {
              setActiveRecord(cur);
              setActivePrevRecord(prevRec);
            }}
          />
        </div>

        {/* KOLOM KANAN: Standar Kesehatan Kemenkes & Tabel Riwayat Pemeriksaan */}
        <div className="lg:col-span-5 space-y-3.5">
          {/* 2. Grouping Kategori Standar Kesehatan Anak (Kemenkes RI Permenkes No. 2/2020) */}
          {history.length === 0 ? (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
              {selectedChild.nama} belum memiliki pengukuran. Isi pemeriksaan pertama melalui menu <strong className="text-teal-800">Input Ukur</strong>.
            </div>
          ) : (
            <StandarKesehatanCard
              child={selectedChild}
              currentMeasurement={currentMeasurement}
              prevMeasurement={prevMeasurement}
            />
          )}

          {/* 3. Riwayat Pemeriksaan Lengkap (Tabel) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Tabel Riwayat Pemeriksaan Fisik
              </h4>
              <span className="text-[10px] text-slate-400 font-semibold">{history.length} Catatan</span>
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

      {/* Modal Detail Identitas Balita */}
      {showProfileModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label={`Detail identitas balita ${selectedChild.nama}`}
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-teal-800 to-teal-600 text-white px-5 py-4 flex items-center justify-between gap-3 flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 border border-white/20 ${
                  selectedChild.gender === 'L' ? 'bg-blue-500/30 text-blue-100' : 'bg-pink-500/30 text-pink-100'
                }`}>
                  {selectedChild.gender}
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-base truncate">{selectedChild.nama}</h3>
                  <p className="text-[11px] text-teal-100/90 truncate">
                    {selectedChild.gender === 'L' ? 'Laki-laki' : 'Perempuan'} • {currentMeasurement.usia || selectedChild.usiaBulan} Bulan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center transition flex-shrink-0 cursor-pointer"
                aria-label="Tutup detail profil"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Isi Detail Identitas */}
            <div className="p-5 space-y-3 overflow-y-auto">
              {[
                ['Tanggal Lahir', selectedChild.tglLahir || '-'],
                ['Nama Ibu / Orang Tua', selectedChild.namaOrtu || '-'],
                ['NIK Anak', selectedChild.nik || 'Belum tersedia'],
                ['No. Telepon Orang Tua', selectedChild.telp || 'Belum tersedia'],
                ['Alamat', selectedChild.alamat || 'Belum tersedia'],
                ['Posyandu', currentTenantData?.title || '-'],
                ['Total Pemeriksaan Tercatat', `${history.length} kali`],
                ['Pemeriksaan Terakhir', `${currentMeasurement.tgl} (Usia ${currentMeasurement.usia || selectedChild.usiaBulan} bln)`]
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5 sm:gap-3 py-2 border-b border-slate-100 last:border-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">{label}</span>
                  <span className="text-xs font-semibold text-slate-800 sm:text-right break-words">{value}</span>
                </div>
              ))}
            </div>

            {/* Footer Modal */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 flex-shrink-0">
              Data identitas diisi saat registrasi balita melalui menu Input Ukur.
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
