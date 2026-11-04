// src/components/StandarKesehatanCard.jsx
import React from 'react';
import {
  Scale,
  Ruler,
  TrendingUp,
  Activity,
  Heart
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5 space-y-3">
      {/* Header Standar Kemenkes */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 leading-tight">
              Standar Kesehatan Anak (Kemenkes RI)
            </h4>
            <p className="text-[10px] text-slate-500">
              Rujukan Buku KIA & Permenkes No. 2 Th 2020
            </p>
          </div>
        </div>
        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
          Z-Score Antropometri
        </span>
      </div>

      {/* Grid 4 Indikator Utama Kemenkes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* 1. Berat Badan Menurut Usia (BB/U) */}
        <div className={`p-2.5 rounded-xl border ${bbu.bg}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
              <Scale className="w-3 h-3 text-teal-600" />
              <span>Status BB / Usia (BB/U)</span>
            </span>
            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-white border">
              {bbu.code}
            </span>
          </div>
          <p className={`text-xs font-black mt-1 ${bbu.color}`}>{bbu.label}</p>
          <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">{bbu.desc}</p>
        </div>

        {/* 2. Tinggi Badan Menurut Usia (TB/U - Indikator Stunting) */}
        <div className={`p-2.5 rounded-xl border ${tbu.bg}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
              <Ruler className="w-3 h-3 text-blue-600" />
              <span>Panjang/Tinggi (TB/U)</span>
            </span>
            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-white border">
              {tbu.code}
            </span>
          </div>
          <p className={`text-xs font-black mt-1 ${tbu.color}`}>{tbu.label}</p>
          <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">{tbu.desc}</p>
        </div>

        {/* 3. Berat terhadap Tinggi (BB/TB - Status Gizi / Wasting) */}
        <div className={`p-2.5 rounded-xl border ${bbtb.bg}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
              <Heart className="w-3 h-3 text-rose-600" />
              <span>Status Gizi (BB/TB)</span>
            </span>
            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-white border">
              {bbtb.code}
            </span>
          </div>
          <p className={`text-xs font-black mt-1 ${bbtb.color}`}>{bbtb.label}</p>
          <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">{bbtb.desc}</p>
        </div>

        {/* 4. Evaluasi Kenaikan Berat Badan KMS (KBM Naik/Tidak Naik) */}
        <div className={`p-2.5 rounded-xl border ${kms.bg}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>Pertumbuhan KMS (KBM)</span>
            </span>
            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-white border">
              {kms.code}
            </span>
          </div>
          <p className={`text-xs font-black mt-1 ${kms.color}`}>{kms.status}</p>
          <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">{kms.label}</p>
        </div>
      </div>
    </div>
  );
}
