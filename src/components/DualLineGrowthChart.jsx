// src/components/DualLineGrowthChart.jsx
import React, { useState } from 'react';
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
 * Komponen Grafik Pertumbuhan Terpisah (Bukan Dual Chart):
 * 1. Grafik Simulasi Berat Badan (BB dlm kg) - Terpisah
 * 2. Grafik Simulasi Tinggi Badan (TB dlm cm) - Terpisah
 * 3. Dilengkapi tab switcher: [Berat Badan] | [Tinggi Badan] | [Lihat Keduanya]
 * 4. Kartu perbandingan kenaikan/penurunan (BB, TB, LK, LiLA) dengan indikator netral bila tetap.
 */
export default function DualLineGrowthChart({ history = [] }) {
  const [activeChart, setActiveChart] = useState('bb'); // 'bb' | 'tb' | 'both'

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

  // Helper render Grafik Tunggal (Single Axis Terpisah)
  const renderSingleChart = (metricKey, title, unit, strokeColor, fillColor, minMargin = 0.9, maxMargin = 1.1) => {
    const values = history.map(h => Number(h[metricKey]) || 0);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const minVal = Math.floor(rawMin * minMargin);
    const maxVal = Math.ceil(rawMax * maxMargin);
    const range = Math.max(0.2, maxVal - minVal);

    const w = 340, h = 150, padL = 36, padR = 20, padT = 20, padB = 26;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    const points = history.map((item, idx) => {
      const val = Number(item[metricKey]) || 0;
      const x = padL + (history.length === 1 ? plotW / 2 : (idx / (history.length - 1)) * plotW);
      const y = padT + plotH - ((val - minVal) / range) * plotH;
      return { x, y, val, usia: item.usia, tgl: item.tgl };
    });

    const polylineStr = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

    return (
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
              <span>{title}</span>
              <span className="text-[10px] font-semibold text-slate-400">({unit})</span>
            </h4>
            <p className="text-[10px] text-slate-500">
              Riwayat simulasi pertumbuhan per bulan
            </p>
          </div>
          <span className="text-xs font-black px-2 py-0.5 rounded-lg border bg-slate-50 text-slate-700">
            Terakhir: <strong>{latest[metricKey]} {unit}</strong>
          </span>
        </div>

        <div className="w-full h-40 relative">
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full select-none" role="img" aria-label={title}>
            {/* Gridlines */}
            <line x1={padL} y1={padT} x2={w - padR} y2={padT} stroke="#f1f5f9" strokeDasharray="3,3" />
            <line x1={padL} y1={padT + plotH / 2} x2={w - padR} y2={padT + plotH / 2} stroke="#f1f5f9" strokeDasharray="3,3" />
            <line x1={padL} y1={h - padB} x2={w - padR} y2={h - padB} stroke="#e2e8f0" strokeWidth="1.5" />

            {/* Sumbu Label Nilai Kiri */}
            <text x={padL - 4} y={padT + 4} fontSize="8" fontWeight="bold" fill="#64748b" textAnchor="end">{maxVal}{unit}</text>
            <text x={padL - 4} y={padT + plotH / 2 + 3} fontSize="8" fontWeight="bold" fill="#94a3b8" textAnchor="end">{((maxVal + minVal) / 2).toFixed(1)}</text>
            <text x={padL - 4} y={h - padB} fontSize="8" fontWeight="bold" fill="#64748b" textAnchor="end">{minVal}{unit}</text>

            {/* Area Shading Gradient */}
            {points.length > 1 && (
              <polygon
                fill={fillColor}
                points={`${points[0].x},${h - padB} ${polylineStr} ${points[points.length - 1].x},${h - padB}`}
              />
            )}

            {/* Garis Tren */}
            {points.length > 1 && (
              <polyline
                fill="none"
                stroke={strokeColor}
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylineStr}
              />
            )}

            {/* Titik Data */}
            {points.map((p, idx) => (
              <g key={`pt-${idx}`}>
                <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke={strokeColor} strokeWidth="2.5" />
                <text x={p.x} y={p.y - 7} fontSize="8.5" fontWeight="800" fill={strokeColor} textAnchor="middle">
                  {p.val}
                </text>
                <text x={p.x} y={h - 9} fontSize="8" fontWeight="600" fill="#64748b" textAnchor="middle">
                  {p.usia}bl
                </text>
              </g>
            ))}
          </svg>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span>Titik atas: Nilai {unit}</span>
          <span>Sumbu bawah: Usia (bl = bulan)</span>
        </div>
      </div>
    );
  };

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

      {/* Tab Switcher: Pilihan Grafik Terpisah */}
      <div className="bg-slate-100 p-1 rounded-xl flex gap-1 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveChart('bb')}
          className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeChart === 'bb'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Grafik BB (kg)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveChart('tb')}
          className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeChart === 'tb'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>Grafik TB (cm)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveChart('both')}
          className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeChart === 'both'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Keduanya</span>
        </button>
      </div>

      {/* Render Grafik Terpisah Sesuai Pilihan Tab */}
      <div className="space-y-3">
        {(activeChart === 'bb' || activeChart === 'both') &&
          renderSingleChart(
            'bb',
            'Grafik Simulasi Berat Badan (BB)',
            'kg',
            '#0d9488',
            'rgba(13, 148, 136, 0.08)',
            0.9,
            1.1
          )}

        {(activeChart === 'tb' || activeChart === 'both') &&
          renderSingleChart(
            'tb',
            'Grafik Simulasi Tinggi Badan (TB)',
            'cm',
            '#2563eb',
            'rgba(37, 99, 235, 0.08)',
            0.92,
            1.08
          )}
      </div>
    </div>
  );
}
