// src/components/StandarKesehatanCard.jsx
import React from 'react';
import { useState } from 'react';
import {
  Scale,
  Ruler,
  TrendingUp,
  Activity,
  Heart,
  BookOpen,
  ChevronDown
} from 'lucide-react';
import {
  getBBUCategory,
  getTBUCategory,
  getBBTBCategory,
  evaluateGrowthKMS
} from '../utils/kemenkesStandards';

/**
 * Grouping Kategori Standar Kesehatan Anak (Kemenkes RI)
 * Berfokus pada 4 parameter antropometri inti:
 * 1. BB/U (Berat Badan Menurut Usia)
 * 2. TB/U (Tinggi Badan Menurut Usia - Indikator Stunting)
 * 3. BB/TB (Berat Menurut Tinggi Badan - Status Gizi / Wasting)
 * 4. Pertumbuhan KMS (Evaluasi Kenaikan Berat Badan Minimal KBM)
 */
export default function StandarKesehatanCard({ child, currentMeasurement, prevMeasurement }) {
  const [showGlossary, setShowGlossary] = useState(false);

  if (!currentMeasurement) return null;

  const bb = currentMeasurement.bb;
  const tb = currentMeasurement.tb;
  const usia = currentMeasurement.usia || child?.usiaBulan || 12;
  const gender = child?.gender || 'L';

  const bbu = getBBUCategory(bb, usia, gender);
  const tbu = getTBUCategory(tb, usia, gender);
  const bbtb = getBBTBCategory(bb, tb, gender);
  const kms = evaluateGrowthKMS(bb, prevMeasurement?.bb, usia);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-warm-card p-5 sm:p-6 space-y-4">
      {/* Header Standar Kemenkes */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 flex-shrink-0 shadow-2xs">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
              Standar Kesehatan Anak (Kemenkes RI)
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500">
              Rujukan Buku KIA & Permenkes No. 2 Th 2020
            </p>
          </div>
        </div>
        <span className="text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 whitespace-nowrap">
          Z-Score Antropometri
        </span>
      </div>

      {/* Grid 4 Indikator Utama Kemenkes — Sejajar (Equal Height) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 items-stretch">
        {/* 1. Berat Badan Menurut Usia (BB/U) */}
        <div className={`p-4 rounded-2xl border ${bbu.bg} flex flex-col justify-between min-h-[110px]`}>
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 truncate">
              <Scale className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
              <span className="truncate">Berat / Usia (BB/U)</span>
            </span>
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-white border border-slate-200/80 shadow-2xs flex-shrink-0">
              {bbu.code}
            </span>
          </div>
          <div className="mt-1.5">
            <p className={`text-xs font-black ${bbu.color}`}>{bbu.label}</p>
            <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">{bbu.desc}</p>
          </div>
        </div>

        {/* 2. Tinggi Badan Menurut Usia (TB/U - Indikator Stunting) */}
        <div className={`p-4 rounded-2xl border ${tbu.bg} flex flex-col justify-between min-h-[110px]`}>
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 truncate">
              <Ruler className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span className="truncate">Tinggi / Usia (TB/U)</span>
            </span>
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-white border border-slate-200/80 shadow-2xs flex-shrink-0">
              {tbu.code}
            </span>
          </div>
          <div className="mt-1.5">
            <p className={`text-xs font-black ${tbu.color}`}>{tbu.label}</p>
            <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">{tbu.desc}</p>
          </div>
        </div>

        {/* 3. Berat terhadap Tinggi (BB/TB - Status Gizi / Wasting) */}
        <div className={`p-4 rounded-2xl border ${bbtb.bg} flex flex-col justify-between min-h-[110px]`}>
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 truncate">
              <Heart className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
              <span className="truncate">Status Gizi (BB/TB)</span>
            </span>
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-white border border-slate-200/80 shadow-2xs flex-shrink-0">
              {bbtb.code}
            </span>
          </div>
          <div className="mt-1.5">
            <p className={`text-xs font-black ${bbtb.color}`}>{bbtb.label}</p>
            <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">{bbtb.desc}</p>
          </div>
        </div>

        {/* 4. Evaluasi Kenaikan Berat Badan KMS (KBM Naik/Tidak Naik) */}
        <div className={`p-4 rounded-2xl border ${kms.bg} flex flex-col justify-between min-h-[110px]`}>
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 truncate">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="truncate">Pertumbuhan KMS (KBM)</span>
            </span>
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-white border border-slate-200/80 shadow-2xs flex-shrink-0">
              {kms.code}
            </span>
          </div>
          <div className="mt-1.5">
            <p className={`text-xs font-black ${kms.color}`}>{kms.status}</p>
            <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">{kms.label}</p>
          </div>
        </div>
      </div>

      {/* Kamus & Penjelasan Status Standar Kemenkes RI (Buku KIA) */}
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowGlossary(!showGlossary)}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 text-slate-700 text-xs font-bold transition border border-slate-200/70"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-700" />
            <span>Kamus Arti Status & Kode Antropometri Kemenkes RI</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
            <span>{showGlossary ? 'Sembunyikan' : 'Buka Penjelasan'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showGlossary ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {showGlossary && (
          <div className="mt-3 p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-3.5 text-slate-700 text-xs animate-in fade-in duration-200">
            {/* 1. Indikator KMS KBM */}
            <div>
              <h5 className="font-extrabold text-amber-950 text-xs flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                <span>Arti Kode Evaluasi Pertumbuhan KMS (Kenaikan BB):</span>
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-white border border-emerald-200">
                  <strong className="text-emerald-800 font-extrabold block">N (Naik Sesuai KBM):</strong>
                  <span>Berat badan naik sama dengan atau melampaui Kenaikan Berat Badan Minimal (KBM) sesuai usia bulan pada KMS. Pertumbuhan optimal.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-amber-200">
                  <strong className="text-amber-800 font-extrabold block">T (Tidak Naik):</strong>
                  <span>Berat badan bertambah tetapi di bawah KBM, atau berat badan tetap/mendatar, atau berat badan turun.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-rose-200">
                  <strong className="text-rose-800 font-extrabold block">GN (Gagal Naik / Faltering):</strong>
                  <span>Berat badan tidak naik (T) selama 2 kali penimbangan berturut-turut. Balita wajib segera dikonsultasikan ke Petugas Gizi / Puskesmas.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-teal-200">
                  <strong className="text-teal-800 font-extrabold block">B (Baru):</strong>
                  <span>Balita baru pertama kali ditimbang di Posyandu sehingga belum memiliki data pembanding bulan sebelumnya.</span>
                </div>
              </div>
            </div>

            {/* 2. Indikator Z-Score Antropometri Permenkes 2/2020 */}
            <div className="pt-2 border-t border-amber-200/60">
              <h5 className="font-extrabold text-amber-950 text-xs flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                <span>Arti Klasifikasi Antropometri Z-Score (Permenkes No. 2/2020):</span>
              </h5>
              <div className="space-y-1.5 text-[11px] leading-relaxed">
                <p>
                  • <strong>BB/U (Berat Menurut Usia):</strong> Menilai berat badan secara umum (Gizi Buruk: &lt; -3 SD, Gizi Kurang: -3 s.d. -2 SD, Normal: -2 s.d. +1 SD, Risiko BB Lebih: &gt; +1 SD).
                </p>
                <p>
                  • <strong>TB/U (Tinggi Menurut Usia):</strong> Indikator utama <em>Stunting</em> kronis (Sangat Pendek / Severely Stunted: &lt; -3 SD, Pendek / Stunted: -3 s.d. -2 SD, Normal: -2 s.d. +3 SD).
                </p>
                <p>
                  • <strong>BB/TB (Berat Menurut Tinggi):</strong> Menilai proporsi gizi akut / <em>Wasting</em> (Gizi Buruk: &lt; -3 SD, Gizi Kurang: -3 s.d. -2 SD, Gizi Baik/Normal: -2 s.d. +1 SD, Berisiko Gizi Lebih: +1 s.d. +2 SD, Obesitas: &gt; +3 SD).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}