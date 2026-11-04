// src/components/DualLineGrowthChart.jsx
import React from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Scale,
  Ruler,
  CircleDot
} from 'lucide-react';
import { evaluateGrowthKMS } from '../utils/kemenkesStandards';

/**
 * Komponen Dual Line Growth Chart & Perbandingan 4 Metrik Fisik:
 * 1. Visualisasi Grafik: Khusus TB & BB saja (Dual Line SVG).
 * 2. Kartu Perbandingan Lengkap: BB, TB, Lingkar Kepala (LK), dan Lingkar Lengan (LiLA)
 *    dengan logic indikator:
 *    - Naik (diff > 0): Panah atas hijau/biru/teal
 *    - Turun (diff < 0): Panah bawah merah/rose
 *    - Tetap / Tidak Naik (diff === 0): Indikator NETRAL (abu-abu/slate dengan icon minus)
 */
export default function DualLineGrowthChart({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
        Belum ada riwayat pengukuran fisik untuk ditampilkan.
      </div>
    );
  }

  const latest = history[history.length - 1];
  const prev = history.length > 1 ? history[history.length - 2] : null;

  // Perhitungan Selisih Kenaikan / Penurunan / Tetap (Netral)
  const diffBB = prev ? Number((latest.bb - prev.bb).toFixed(2)) : 0;
  const diffTB = prev ? Number((latest.tb - prev.tb).toFixed(1)) : 0;
  const diffLK = prev ? Number(((latest.lk || 0) - (prev.lk || 0)).toFixed(1)) : 0;
  const diffLila = prev ? Number(((latest.lila || 0) - (prev.lila || 0)).toFixed(1)) : 0;

  const growthEval = evaluateGrowthKMS(latest.bb, prev?.bb, latest.usia);

  // Helper untuk merender badge status perbandingan
  const renderDiffBadge = (diff, unit = 'cm', primaryColor = 'text-emerald-700') => {
    if (!prev) {
      return <span className="text-[10px] text-slate-400 font-medium">Awal</span>;
    }
    if (diff > 0) {
      return (
        <span className={`text-[11px] font-bold flex items-center gap-0.5 ${primaryColor}`}>
          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.75]" />
          <span>+{diff} {unit}</span>
        </span>
      );
    }
    if (diff < 0) {
      return (
        <span className="text-[11px] font-bold text-rose-600 flex items-center gap-0.5">
          <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.75]" />
          <span>{diff} {unit}</span>
        </span>
      );
    }
    // Indikator Netral saat tidak naik tidak turun
    return (
      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 flex items-center gap-0.5">
        <Minus className="w-3 h-3 stroke-[2.5]" />
        <span>0.0 {unit} (Tetap)</span>
      </span>
    );
  };

  // SVG Dual Axis Chart Math (KHUSUS TB & BB SAJA)
  const bbValues = history.map(h => h.bb || 0);
  const tbValues = history.map(h => h.tb || 0);

  const minBB = Math.floor(Math.min(...bbValues) * 0.9);
  const maxBB = Math.ceil(Math.max(...bbValues) * 1.1);

  const minTB = Math.floor(Math.min(...tbValues) * 0.92);
  const maxTB = Math.ceil(Math.max(...tbValues) * 1.08);

  const w = 340, h = 175, padL = 34, padR = 34, padT = 24, padB = 28;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const pointsBB = history.map((item, idx) => {
    const x = padL + (history.length === 1 ? plotW / 2 : (idx / (history.length - 1)) * plotW);
    const y = padT + plotH - ((item.bb - minBB) / Math.max(0.1, maxBB - minBB)) * plotH;
    return { x, y, val: item.bb, usia: item.usia, tgl: item.tgl };
  });

  const pointsTB = history.map((item, idx) => {
    const x = padL + (history.length === 1 ? plotW / 2 : (idx / (history.length - 1)) * plotW);
    const y = padT + plotH - ((item.tb - minTB) / Math.max(0.1, maxTB - minTB)) * plotH;
    return { x, y, val: item.tb, usia: item.usia, tgl: item.tgl };
  });

  const polyBB = pointsBB.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const polyTB = pointsTB.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <div className="space-y-3">
      {/* Grid 4 Metrik Fisik (BB, TB, LK, LiLA) dengan Perbandingan & Logic Netral */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {/* 1. Berat Badan (BB) */}
        <div className="bg-white p-3 rounded-2xl border border-teal-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-teal-600" />
              <span>Berat Badan</span>
            </span>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
              {latest.bb} kg
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900">{latest.bb}</span>
              <span className="text-xs text-slate-500 font-semibold">kg</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              {renderDiffBadge(diffBB, 'kg', 'text-teal-700')}
              {prev && <span className="text-[9px] text-slate-400">bln lalu: {prev.bb}kg</span>}
            </div>
          </div>
        </div>

        {/* 2. Tinggi Badan (TB) */}
        <div className="bg-white p-3 rounded-2xl border border-blue-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5 text-blue-600" />
              <span>Tinggi Badan</span>
            </span>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              {latest.tb} cm
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900">{latest.tb}</span>
              <span className="text-xs text-slate-500 font-semibold">cm</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              {renderDiffBadge(diffTB, 'cm', 'text-blue-700')}
              {prev && <span className="text-[9px] text-slate-400">bln lalu: {prev.tb}cm</span>}
            </div>
          </div>
        </div>

        {/* 3. Lingkar Kepala (LK) - DENGAN PERBANDINGAN & LOGIC NETRAL */}
        <div className="bg-white p-3 rounded-2xl border border-emerald-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <CircleDot className="w-3.5 h-3.5 text-emerald-600" />
              <span>Lingkar Kepala</span>
            </span>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              {latest.lk || '-'} cm
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900">{latest.lk || '-'}</span>
              <span className="text-xs text-slate-500 font-semibold">cm</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              {renderDiffBadge(diffLK, 'cm', 'text-emerald-700')}
              {prev && <span className="text-[9px] text-slate-400">bln lalu: {prev.lk}cm</span>}
            </div>
          </div>
        </div>

        {/* 4. Lingkar Lengan (LiLA) - DENGAN PERBANDINGAN & LOGIC NETRAL */}
        <div className="bg-white p-3 rounded-2xl border border-purple-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
              <span>Lingkar Lengan</span>
            </span>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
              {latest.lila || '-'} cm
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900">{latest.lila || '-'}</span>
              <span className="text-xs text-slate-500 font-semibold">cm</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              {renderDiffBadge(diffLila, 'cm', 'text-purple-700')}
              {prev && <span className="text-[9px] text-slate-400">bln lalu: {prev.lila}cm</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Evaluasi Status Kenaikan KMS (KBM Alert Kemenkes) */}
      <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${growthEval.bg} ${growthEval.color}`}>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 flex-shrink-0" />
          <div>
            <span className="font-extrabold block text-xs">Evaluasi KMS Kemenkes: {growthEval.status}</span>
            <span className="text-[11px] opacity-90">{growthEval.label}</span>
          </div>
        </div>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${growthEval.isNaik ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-amber-100 border-amber-300 text-amber-800'}`}>
          KBM {growthEval.kbmGram}g
        </span>
      </div>

      {/* SVG Dual Line Chart Container (HANYA UNTUK TB & BB SAJA) */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <div>
            <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">
              Grafik Pertumbuhan TB & BB (Dual Line)
            </h3>
            <p className="text-[10px] text-slate-500">
              Visualisasi tren berat (kg) & tinggi (cm) balita dari bulan ke bulan
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-[11px] font-bold">
            <span className="flex items-center gap-1.5 text-teal-700">
              <span className="w-3 h-1.5 bg-teal-600 rounded-full inline-block" />
              <span>BB (kg)</span>
            </span>
            <span className="flex items-center gap-1.5 text-blue-700">
              <span className="w-3 h-1.5 bg-blue-600 rounded-full inline-block" />
              <span>TB (cm)</span>
            </span>
          </div>
        </div>

        {/* The Graphic Canvas */}
        <div className="w-full h-44 relative">
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full select-none" role="img" aria-label="Grafik Dual Line TB dan BB">
            {/* Gridlines */}
            <line x1={padL} y1={padT} x2={w - padR} y2={padT} stroke="#f1f5f9" strokeDasharray="3,3" />
            <line x1={padL} y1={padT + plotH / 2} x2={w - padR} y2={padT + plotH / 2} stroke="#f1f5f9" strokeDasharray="3,3" />
            <line x1={padL} y1={h - padB} x2={w - padR} y2={h - padB} stroke="#e2e8f0" strokeWidth="1.5" />

            {/* Sumbu Label Kiri (BB - kg) & Kanan (TB - cm) */}
            <text x={padL - 4} y={padT + 4} fontSize="8" fontWeight="bold" fill="#0d9488" textAnchor="end">{maxBB}kg</text>
            <text x={padL - 4} y={h - padB} fontSize="8" fontWeight="bold" fill="#0d9488" textAnchor="end">{minBB}kg</text>

            <text x={w - padR + 4} y={padT + 4} fontSize="8" fontWeight="bold" fill="#2563eb" textAnchor="start">{maxTB}cm</text>
            <text x={w - padR + 4} y={h - padB} fontSize="8" fontWeight="bold" fill="#2563eb" textAnchor="start">{minTB}cm</text>

            {/* Shading Area di bawah BB */}
            {pointsBB.length > 1 && (
              <polygon
                fill="rgba(13, 148, 136, 0.08)"
                points={`${pointsBB[0].x},${h - padB} ${polyBB} ${pointsBB[pointsBB.length - 1].x},${h - padB}`}
              />
            )}

            {/* Garis 1: Berat Badan (Teal) */}
            {pointsBB.length > 1 && (
              <polyline
                fill="none"
                stroke="#0d9488"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polyBB}
              />
            )}

            {/* Garis 2: Tinggi Badan (Blue) */}
            {pointsTB.length > 1 && (
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.8"
                strokeDasharray="5,2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polyTB}
              />
            )}

            {/* Titik-Titik Data BB */}
            {pointsBB.map((p, idx) => (
              <g key={`bb-${idx}`}>
                <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#0d9488" strokeWidth="2.5" />
                <text x={p.x} y={p.y - 7} fontSize="8" fontWeight="800" fill="#0f766e" textAnchor="middle">
                  {p.val}
                </text>
                <text x={p.x} y={h - 10} fontSize="8" fontWeight="600" fill="#64748b" textAnchor="middle">
                  {p.usia}bl
                </text>
              </g>
            ))}

            {/* Titik-Titik Data TB */}
            {pointsTB.map((p, idx) => (
              <g key={`tb-${idx}`}>
                <circle cx={p.x} cy={p.y} r="3.5" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
                <text x={p.x} y={p.y + 11} fontSize="8" fontWeight="800" fill="#1d4ed8" textAnchor="middle">
                  {p.val}
                </text>
              </g>
            ))}
          </svg>
        </div>
        <p className="text-[10px] text-slate-400 text-center italic">
          * Grafik fokus pada validasi TB & BB. Parameter Lingkar Kepala & Lengan tertera pada kartu di atas dan tabel di bawah.
        </p>
      </div>
    </div>
  );
}
