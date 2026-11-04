// src/components/Perkembangan.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DualLineGrowthChart from './DualLineGrowthChart';
import StandarKesehatanCard from './StandarKesehatanCard';

/**
 * Halaman Perkembangan & Komparasi Individu
 * Didesain responsif:
 * - Mobile (< lg): Stack vertikal compact
 * - Tablet & Desktop (>= lg): Grid 2 kolom seimbang (kiri: profil & grafik, kanan: standar kesehatan & riwayat)
 */
export default function Perkembangan({ initialChildId }) {
  const { getTenantData } = useAuth();
  const [selectedChildId, setSelectedChildId] = useState(initialChildId || null);

  const currentTenantData = getTenantData();
  const children = currentTenantData?.children || [];
  const selectedChild = children.find(c => c.id === selectedChildId) || children[0];

  useEffect(() => {
    if (initialChildId) {
      setSelectedChildId(initialChildId);
    } else if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [initialChildId, children, selectedChildId]);

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

  return (
    <section className="space-y-4" id="perkembangan">
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
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:outline-none focus:border-posyandu-600"
            >
              {children.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nama} ({c.gender === 'L' ? 'L' : 'P'}, Usia: {c.usiaBulan} bln, Ortu: {c.namaOrtu})
                </option>
              ))}
            </select>
          </div>

          {/* Profil Singkat Balita Terpilih */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
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
            <div className="text-right flex-shrink-0">
              <span className="text-xs font-black text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-xl block">
                {latest.usia || selectedChild.usiaBulan} Bulan
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">{latest.tgl}</span>
            </div>
          </div>

          {/* 1. Grafik Visual Khusus TB & BB (Dual Line Chart) + 4 Kartu Perbandingan Lengkap */}
          <DualLineGrowthChart history={history} />
        </div>

        {/* KOLOM KANAN: Standar Kesehatan Kemenkes & Tabel Riwayat Pemeriksaan */}
        <div className="lg:col-span-5 space-y-3.5">
          {/* 2. Grouping Kategori Standar Kesehatan Anak (Kemenkes RI Permenkes No. 2/2020) */}
          <StandarKesehatanCard
            child={selectedChild}
            currentMeasurement={latest}
            prevMeasurement={prev}
          />

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
    </section>
  );
}
