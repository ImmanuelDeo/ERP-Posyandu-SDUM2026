// src/components/DualLineGrowthChart.jsx
import React from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Minus, Scale, Ruler } from 'lucide-react';
import { evaluateGrowthKMS } from '../utils/kemenkesStandards';

/**
 * Komponen Dual Line Chart untuk Visualisasi Perbandingan TB dan BB Anak
 * Menampilkan 2 garis dalam 1 grafik terpadu:
 * - Garis Teal: Berat Badan (kg)
 * - Garis Biru/Indigo: Tinggi Badan (cm)
 * Dilengkapi kartu perbandingan data TB dan BB dari bulan lalu agar validitas update terpantau jelas.
 */
export default function DualLineGrowthChart({ history = [], child = null }) {
  if (!history || history.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
        Belum ada riwayat pengukuran fisik untuk ditampilkan.
      </div>
    );
  }

  const latest = history[history.length - 1];
  const prev = history.length > 1 ? history[history.length - 2] : null;

  // Perhitungan Kenaikan / Penurunan dari Bulan Lalu
  const diffBB = prev ? Number((latest.bb - prev.bb).toFixed(2)) : 0;
  const diffTB = prev ? Number((latest.tb - prev.tb).toFixed(1)) : 0;
  const growthEval = evaluateGrowthKMS(latest.bb, prev?.bb, latest.usia);

  // SVG Dual Axis Chart Math
  const bbValues = history.map(h => h.bb || 0);
  const tbValues = history.map(h => h.tb || 0);

  const minBB = Math.floor(Math.min(...bbValues) * 0.9);
  const maxBB = Math.ceil(Math.max(...bbValues) * 1.1);

  const minTB = Math.floor(Math.min(...tbValues) * 0.92);
  const maxTB = Math.ceil(Math.max(...tbValues) * 1.08);

  const w = 340, h = 180, padL = 34, padR = 34, padT = 24, padB = 28;
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
      {/* Kartu Ringkasan Perbandingan Bulan Lalu */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {/* Box Berat Badan */}
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
            {prev ? (
              <div className="mt-1 flex items-center gap-1 text-[11px] font-bold">
                {diffBB > 0 ? (
                  <span className="text-emerald-600 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>+{diffBB} kg</span>
                  </span>
                ) : diffBB < 0 ? (
                  <span className="text-rose-600 flex items-center gap-0.5">
                    <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{diffBB} kg</span>
                  </span>
                ) : (
                  <span className="text-slate-500 flex items-center gap-0.5">
                    <Minus className="w-3.5 h-3.5" />
                    <span>0.0 kg</span>
                  </span>
                )}
                <span className="text-[9px] text-slate-400 font-normal">vs bln lalu</span>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 mt-1">Pengukuran awal</p>
            )}
          </div>
        </div>

        {/* Box Tinggi Badan */}
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
            {prev ? (
              <div className="mt-1 flex items-center gap-1 text-[11px] font-bold">
                {diffTB > 0 ? (
                  <span className="text-blue-600 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>+{diffTB} cm</span>
                  </span>
                ) : diffTB < 0 ? (
                  <span className="text-rose-600 flex items-center gap-0.5">
                    <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{diffTB} cm</span>
                  </span>
                ) : (
                  <span className="text-slate-500 flex items-center gap-0.5">
                    <Minus className="w-3.5 h-3.5" />
                    <span>0.0 cm</span>
                  </span>
                )}
                <span className="text-[9px] text-slate-400 font-normal">vs bln lalu</span>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 mt-1">Pengukuran awal</p>
            )}
          </div>
        </div>
      </div>

      {/* Evaluasi Status Kenaikan KMS (KBM Alert) */}
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

      {/* SVG Dual Line Chart Container */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <div>
            <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">
              Grafik Pertumbuhan TB & BB (Dual Line)
            </h3>
            <p className="text-[10px] text-slate-500">
              Riwayat perkembangan berat (kg) & tinggi (cm) balita
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
        <div className="w-full h-48 relative">
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
          * Angka atas hijau (BB dlm kg), angka bawah biru (TB dlm cm), sumbu X adalah usia (bl = bulan).
        </p>
      </div>
    </div>
  );
}
