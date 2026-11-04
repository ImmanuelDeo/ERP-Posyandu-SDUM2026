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
import { evaluateGrowthKMS, getKBM } from '../utils/kemenkesStandards';

// Rujukan Standar Antropometri WHO / Permenkes No. 2 Tahun 2020 per Usia Bulan (0 s.d. 24 Bulan)
// [Median, SD]
const KMS_REF_DATA = {
  // Berat Badan Laki-Laki (kg)
  bbL: [
    [3.3, 0.45], [4.5, 0.55], [5.6, 0.65], [6.4, 0.72], [7.0, 0.78],
    [7.5, 0.83], [7.9, 0.88], [8.3, 0.92], [8.6, 0.95], [8.9, 0.98],
    [9.2, 1.01], [9.4, 1.04], [9.6, 1.06], [9.9, 1.09], [10.1, 1.12],
    [10.3, 1.15], [10.5, 1.18], [10.7, 1.21], [10.9, 1.24], [11.1, 1.27],
    [11.3, 1.30], [11.5, 1.33], [11.8, 1.36], [12.0, 1.39], [12.2, 1.42]
  ],
  // Berat Badan Perempuan (kg)
  bbP: [
    [3.2, 0.43], [4.2, 0.52], [5.1, 0.60], [5.8, 0.67], [6.4, 0.73],
    [6.9, 0.78], [7.3, 0.82], [7.6, 0.86], [7.9, 0.90], [8.2, 0.93],
    [8.5, 0.96], [8.7, 0.99], [8.9, 1.02], [9.2, 1.05], [9.4, 1.08],
    [9.6, 1.11], [9.8, 1.14], [10.0, 1.17], [10.2, 1.20], [10.4, 1.23],
    [10.6, 1.26], [10.9, 1.29], [11.1, 1.32], [11.3, 1.35], [11.5, 1.38]
  ],
  // Tinggi/Panjang Badan Laki-Laki (cm)
  tbL: [
    [49.9, 1.9], [54.7, 2.0], [58.4, 2.1], [61.4, 2.2], [63.9, 2.3],
    [65.9, 2.4], [67.6, 2.4], [69.2, 2.5], [70.6, 2.5], [72.0, 2.6],
    [73.3, 2.6], [74.5, 2.6], [75.7, 2.7], [76.9, 2.7], [78.0, 2.8],
    [79.1, 2.8], [80.2, 2.9], [81.2, 2.9], [82.3, 3.0], [83.2, 3.0],
    [84.2, 3.1], [85.1, 3.1], [86.0, 3.2], [86.9, 3.2], [87.8, 3.3]
  ],
  // Tinggi/Panjang Badan Perempuan (cm)
  tbP: [
    [49.1, 1.9], [53.7, 2.0], [57.1, 2.1], [59.8, 2.2], [62.1, 2.3],
    [64.0, 2.4], [65.7, 2.4], [67.3, 2.5], [68.7, 2.5], [70.1, 2.6],
    [71.5, 2.6], [72.8, 2.6], [74.0, 2.7], [75.2, 2.7], [76.4, 2.8],
    [77.5, 2.8], [78.6, 2.9], [79.7, 2.9], [80.7, 2.9], [81.7, 3.0],
    [82.7, 3.1], [83.7, 3.1], [84.6, 3.2], [85.5, 3.2], [86.4, 3.3]
  ]
};

export default function DualLineGrowthChart({ history = [], child = null }) {
  const [activeTab, setActiveTab] = useState('bb'); // 'bb' | 'tb' | 'both'

  if (!history || history.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
        Belum ada riwayat pengukuran fisik untuk ditampilkan.
      </div>
    );
  }

  const latest = history[history.length - 1];
  const prev = history.length > 1 ? history[history.length - 2] : null;

  // 1. REVISI PERMINTAAN 1: Indikator kenaikan Berat Badan dalam satuan GRAM
  const diffBBKg = prev ? Number((latest.bb - prev.bb).toFixed(2)) : 0;
  const diffBBGram = Math.round(diffBBKg * 1000); // Satuan gram

  const diffTB = prev ? Number((latest.tb - prev.tb).toFixed(1)) : 0;
  const diffLK = prev ? Number(((latest.lk || 0) - (prev.lk || 0)).toFixed(1)) : 0;
  const diffLila = prev ? Number(((latest.lila || 0) - (prev.lila || 0)).toFixed(1)) : 0;

  const growthEval = evaluateGrowthKMS(latest.bb, prev?.bb, latest.usia);
  const isMale = (child?.gender || 'L').toUpperCase() === 'L';

  // Helper badge selisih umum
  const renderGeneralDiffBadge = (diff, unit, color = 'text-emerald-700') => {
    if (!prev) return <span className="text-[10px] text-slate-400 font-medium">Awal</span>;
    if (diff > 0) {
      return (
        <span className={`text-[11px] font-bold flex items-center gap-0.5 ${color}`}>
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
    return (
      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 flex items-center gap-0.5">
        <Minus className="w-3 h-3 stroke-[2.5]" />
        <span>0.0 {unit} (Tetap)</span>
      </span>
    );
  };

  // Helper badge selisih Berat Badan (KHUSUS GRAM)
  const renderBBGramBadge = () => {
    if (!prev) return <span className="text-[10px] text-slate-400 font-medium">Awal</span>;
    if (diffBBGram > 0) {
      return (
        <span className="text-[11px] font-black text-emerald-700 flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.75]" />
          <span>+{diffBBGram} gram</span>
        </span>
      );
    }
    if (diffBBGram < 0) {
      return (
        <span className="text-[11px] font-black text-rose-700 flex items-center gap-0.5 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
          <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.75]" />
          <span>{diffBBGram} gram</span>
        </span>
      );
    }
    return (
      <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-0.5">
        <Minus className="w-3 h-3 stroke-[2.5]" />
        <span>0 gram (Tetap)</span>
      </span>
    );
  };

  // 2. REVISI PERMINTAAN 2: RENDER GRAFIK KMS (KARTU MENUJU SEHAT) RESMI
  // Render Grafik KMS Berat Badan Menurut Usia (BB/U)
  const renderKMSBeratBadanChart = () => {
    const refList = isMale ? KMS_REF_DATA.bbL : KMS_REF_DATA.bbP;
    const maxAge = Math.max(12, ...history.map(h => h.usia || 0));
    const plotAgeLimit = Math.min(24, Math.max(maxAge + 1, 12));

    const w = 360, h = 210, padL = 38, padR = 24, padT = 20, padB = 34;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    const minScale = 2.0;  // 2 kg
    const maxScale = 15.0; // 15 kg
    const scaleRange = maxScale - minScale;

    const getX = (age) => padL + (age / plotAgeLimit) * plotW;
    const getY = (val) => padT + plotH - ((val - minScale) / scaleRange) * plotH;

    // Hitung pita-pita kurva KMS untuk umur 0 s.d. plotAgeLimit
    const ages = Array.from({ length: plotAgeLimit + 1 }, (_, i) => i);

    // +2 SD
    const ptsPlus2 = ages.map(a => `${getX(a).toFixed(1)},${getY(refList[a][0] + 2 * refList[a][1]).toFixed(1)}`);
    // +1 SD
    const ptsPlus1 = ages.map(a => `${getX(a).toFixed(1)},${getY(refList[a][0] + 1 * refList[a][1]).toFixed(1)}`);
    // Median (Garis Hijau Tengah Ideal)
    const ptsMedian = ages.map(a => `${getX(a).toFixed(1)},${getY(refList[a][0]).toFixed(1)}`);
    // -1 SD
    const ptsMinus1 = ages.map(a => `${getX(a).toFixed(1)},${getY(refList[a][0] - 1 * refList[a][1]).toFixed(1)}`);
    // -2 SD (Batas Bawah Normal / Awal Kuning)
    const ptsMinus2 = ages.map(a => `${getX(a).toFixed(1)},${getY(refList[a][0] - 2 * refList[a][1]).toFixed(1)}`);
    // -3 SD (Garis Merah Kemenkes - BGM)
    const ptsMinus3 = ages.map(a => `${getX(a).toFixed(1)},${getY(refList[a][0] - 3 * refList[a][1]).toFixed(1)}`);

    // Titik Plotting Balita Riil
    const childPoints = history.map(item => {
      const age = Math.min(plotAgeLimit, item.usia || 0);
      return {
        x: getX(age),
        y: getY(item.bb),
        val: item.bb,
        usia: item.usia,
        tgl: item.tgl
      };
    });
    const childPolyline = childPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

    return (
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-warm-card space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <h4 className="font-extrabold text-slate-900 text-sm">
                Grafik KMS Berat Badan Menurut Usia (BB/U)
              </h4>
            </div>
            <p className="text-[11px] text-slate-500">
              Standar Kurva Pertumbuhan KMS Kemenkes RI ({isMale ? 'Anak Laki-Laki' : 'Anak Perempuan'})
            </p>
          </div>
          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            KMS Aktif
          </span>
        </div>

        {/* SVG Canvas KMS BB */}
        <div className="w-full h-56 relative bg-[#FAFAF9] rounded-2xl border border-slate-200/70 overflow-hidden p-1">
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full select-none" role="img" aria-label="Grafik KMS Berat Badan">
            {/* 1. Pita Warna KMS: Bawah Garis Merah (< -3 SD) */}
            <polygon
              fill="#FEE2E2"
              points={`${getX(0)},${h - padB} ${ptsMinus3.join(' ')} ${getX(plotAgeLimit)},${h - padB}`}
            />

            {/* 2. Pita Warna KMS: Kuning Bawah (-3 SD s.d. -2 SD) */}
            <polygon
              fill="#FEF08A"
              points={`${ptsMinus3.join(' ')} ${[...ptsMinus2].reverse().join(' ')}`}
            />

            {/* 3. Pita Warna KMS: Hijau Muda Bawah (-2 SD s.d. -1 SD) */}
            <polygon
              fill="#D1FAE5"
              points={`${ptsMinus2.join(' ')} ${[...ptsMinus1].reverse().join(' ')}`}
            />

            {/* 4. Pita Warna KMS: Hijau Tua Ideal (-1 SD s.d. +1 SD) */}
            <polygon
              fill="#A7F3D0"
              points={`${ptsMinus1.join(' ')} ${[...ptsPlus1].reverse().join(' ')}`}
            />

            {/* 5. Pita Warna KMS: Hijau Muda Atas (+1 SD s.d. +2 SD) */}
            <polygon
              fill="#D1FAE5"
              points={`${ptsPlus1.join(' ')} ${[...ptsPlus2].reverse().join(' ')}`}
            />

            {/* 6. Garis Batas Standar KMS */}
            {/* Garis Merah BGM (-3 SD) */}
            <polyline fill="none" stroke="#DC2626" strokeWidth="2" strokeDasharray="3,2" points={ptsMinus3.join(' ')} />
            {/* Garis Kuning (-2 SD) */}
            <polyline fill="none" stroke="#CA8A04" strokeWidth="1.5" points={ptsMinus2.join(' ')} />
            {/* Garis Hijau Median (Pertumbuhan Ideal) */}
            <polyline fill="none" stroke="#059669" strokeWidth="2.5" points={ptsMedian.join(' ')} />
            {/* Garis Atas (+2 SD) */}
            <polyline fill="none" stroke="#CA8A04" strokeWidth="1.5" points={ptsPlus2.join(' ')} />

            {/* Grid & Sumbu X/Y */}
            <line x1={padL} y1={h - padB} x2={w - padR} y2={h - padB} stroke="#475569" strokeWidth="1.5" />
            <line x1={padL} y1={padT} x2={padL} y2={h - padB} stroke="#475569" strokeWidth="1.5" />

            {/* Label Sumbu Y (kg) */}
            {[2, 4, 6, 8, 10, 12, 14].map(val => (
              <g key={`y-bb-${val}`}>
                <line x1={padL - 3} y1={getY(val)} x2={w - padR} y2={getY(val)} stroke="#E2E8F0" strokeDasharray="2,3" />
                <text x={padL - 4} y={getY(val) + 3} fontSize="7.5" fontWeight="bold" fill="#64748B" textAnchor="end">{val}</text>
              </g>
            ))}

            {/* Label Sumbu X Usia (Bulan) */}
            {ages.filter(a => a % 2 === 0).map(a => (
              <g key={`x-age-${a}`}>
                <line x1={getX(a)} y1={h - padB} x2={getX(a)} y2={h - padB + 4} stroke="#475569" strokeWidth="1.2" />
                <text x={getX(a)} y={h - padB + 12} fontSize="7.5" fontWeight="bold" fill="#475569" textAnchor="middle">{a}</text>
                {/* Target KBM di bawah sumbu usia */}
                {a > 0 && (
                  <text x={getX(a)} y={h - padB + 22} fontSize="6" fontWeight="bold" fill="#0D9488" textAnchor="middle">
                    {getKBM(a)}g
                  </text>
                )}
              </g>
            ))}

            {/* Label Sumbu */}
            <text x={padL - 6} y={padT - 6} fontSize="7.5" fontWeight="bold" fill="#0F766E">kg</text>
            <text x={w - padR + 10} y={h - padB + 12} fontSize="7" fontWeight="bold" fill="#64748B">bln</text>

            {/* 7. Garis Plotting Riil Pertumbuhan Anak KMS */}
            {childPoints.length > 1 && (
              <polyline
                fill="none"
                stroke="#0F172A"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={childPolyline}
              />
            )}

            {/* Titik Plotting Anak */}
            {childPoints.map((p, idx) => (
              <g key={`child-pt-${idx}`}>
                <circle cx={p.x} cy={p.y} r="4.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.8" />
                <text x={p.x} y={p.y - 7} fontSize="8.5" fontWeight="900" fill="#0F172A" textAnchor="middle">
                  {p.val}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Legenda Warna KMS Resmi */}
        <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 space-y-1 text-[10px]">
          <div className="flex items-center justify-between font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#A7F3D0] border border-[#059669]" />
              <span>Hijau: Normal / Ideal (KMS)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#FEF08A] border border-[#CA8A04]" />
              <span>Kuning: Waspada / Kurang</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#FEE2E2] border border-[#DC2626]" />
              <span>Garis Merah: BGM</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-500 italic text-center pt-0.5">
            * Angka hijau di bawah sumbu adalah target Kenaikan Berat Badan Minimal (KBM) per bulan.
          </p>
        </div>
      </div>
    );
  };

  // Render Grafik KMS Panjang/Tinggi Badan Menurut Usia (TB/U — Indikator Stunting)
  const renderKMSTinggiBadanChart = () => {
    const refList = isMale ? KMS_REF_DATA.tbL : KMS_REF_DATA.tbP;
    const maxAge = Math.max(12, ...history.map(h => h.usia || 0));
    const plotAgeLimit = Math.min(24, Math.max(maxAge + 1, 12));

    const w = 360, h = 210, padL = 38, padR = 24, padT = 20, padB = 30;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    const minScale = 45.0; // 45 cm
    const maxScale = 95.0; // 95 cm
    const scaleRange = maxScale - minScale;

    const getX = (age) => padL + (age / plotAgeLimit) * plotW;
    const getY = (val) => padT + plotH - ((val - minScale) / scaleRange) * plotH;

    const ages = Array.from({ length: plotAgeLimit + 1 }, (_, i) => i);

    // +3 SD (Tinggi)
    const ptsPlus3 = ages.map(a => `${getX(a).toFixed(1)},${getY(refList[a][0] + 3 * refList[a][1]).toFixed(1)}`);
    // Median (Tinggi Ideal)
    const ptsMedian = ages.map(a => `${getX(a).toFixed(1)},${getY(refList[a][0]).toFixed(1)}`);
    // -2 SD (Batas Normal Bawah / Batas Stunting)
    const ptsMinus2 = ages.map(a => `${getX(a).toFixed(1)},${getY(refList[a][0] - 2 * refList[a][1]).toFixed(1)}`);
    // -3 SD (Garis Merah Sangat Pendek / Severely Stunted)
    const ptsMinus3 = ages.map(a => `${getX(a).toFixed(1)},${getY(refList[a][0] - 3 * refList[a][1]).toFixed(1)}`);

    // Titik Plotting Balita Riil
    const childPoints = history.map(item => {
      const age = Math.min(plotAgeLimit, item.usia || 0);
      return {
        x: getX(age),
        y: getY(item.tb),
        val: item.tb,
        usia: item.usia,
        tgl: item.tgl
      };
    });
    const childPolyline = childPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

    return (
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-warm-card space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              <h4 className="font-extrabold text-slate-900 text-sm">
                Grafik KMS Panjang/Tinggi Badan (TB/U)
              </h4>
            </div>
            <p className="text-[11px] text-slate-500">
              Kurva Pertumbuhan Standar Stunting Kemenkes RI ({isMale ? 'Anak Laki-Laki' : 'Anak Perempuan'})
            </p>
          </div>
          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
            KMS Aktif
          </span>
        </div>

        {/* SVG Canvas KMS TB */}
        <div className="w-full h-56 relative bg-[#FAFAF9] rounded-2xl border border-slate-200/70 overflow-hidden p-1">
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full select-none" role="img" aria-label="Grafik KMS Tinggi Badan">
            {/* 1. Area Merah: Sangat Pendek / Severely Stunted (< -3 SD) */}
            <polygon
              fill="#FEE2E2"
              points={`${getX(0)},${h - padB} ${ptsMinus3.join(' ')} ${getX(plotAgeLimit)},${h - padB}`}
            />

            {/* 2. Area Kuning: Pendek / Stunted (-3 SD s.d. -2 SD) */}
            <polygon
              fill="#FEF08A"
              points={`${ptsMinus3.join(' ')} ${[...ptsMinus2].reverse().join(' ')}`}
            />

            {/* 3. Area Hijau: Tinggi Normal (-2 SD s.d. +3 SD) */}
            <polygon
              fill="#D1FAE5"
              points={`${ptsMinus2.join(' ')} ${[...ptsPlus3].reverse().join(' ')}`}
            />

            {/* Garis Batas */}
            <polyline fill="none" stroke="#DC2626" strokeWidth="2" strokeDasharray="3,2" points={ptsMinus3.join(' ')} />
            <polyline fill="none" stroke="#CA8A04" strokeWidth="1.5" points={ptsMinus2.join(' ')} />
            <polyline fill="none" stroke="#059669" strokeWidth="2.5" points={ptsMedian.join(' ')} />
            <polyline fill="none" stroke="#2563EB" strokeWidth="1.5" points={ptsPlus3.join(' ')} />

            {/* Grid & Sumbu X/Y */}
            <line x1={padL} y1={h - padB} x2={w - padR} y2={h - padB} stroke="#475569" strokeWidth="1.5" />
            <line x1={padL} y1={padT} x2={padL} y2={h - padB} stroke="#475569" strokeWidth="1.5" />

            {/* Label Sumbu Y (cm) */}
            {[50, 60, 70, 80, 90].map(val => (
              <g key={`y-tb-${val}`}>
                <line x1={padL - 3} y1={getY(val)} x2={w - padR} y2={getY(val)} stroke="#E2E8F0" strokeDasharray="2,3" />
                <text x={padL - 4} y={getY(val) + 3} fontSize="7.5" fontWeight="bold" fill="#64748B" textAnchor="end">{val}</text>
              </g>
            ))}

            {/* Label Sumbu X Usia (Bulan) */}
            {ages.filter(a => a % 2 === 0).map(a => (
              <g key={`x-age-tb-${a}`}>
                <line x1={getX(a)} y1={h - padB} x2={getX(a)} y2={h - padB + 4} stroke="#475569" strokeWidth="1.2" />
                <text x={getX(a)} y={h - padB + 12} fontSize="7.5" fontWeight="bold" fill="#475569" textAnchor="middle">{a}</text>
              </g>
            ))}

            <text x={padL - 6} y={padT - 6} fontSize="7.5" fontWeight="bold" fill="#2563EB">cm</text>
            <text x={w - padR + 10} y={h - padB + 12} fontSize="7" fontWeight="bold" fill="#64748B">bln</text>

            {/* Garis Plotting Riil Tinggi Badan */}
            {childPoints.length > 1 && (
              <polyline
                fill="none"
                stroke="#1D4ED8"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={childPolyline}
              />
            )}

            {/* Titik Plotting Anak */}
            {childPoints.map((p, idx) => (
              <g key={`child-tb-pt-${idx}`}>
                <circle cx={p.x} cy={p.y} r="4.5" fill="#FFFFFF" stroke="#1D4ED8" strokeWidth="2.8" />
                <text x={p.x} y={p.y - 7} fontSize="8.5" fontWeight="900" fill="#1D4ED8" textAnchor="middle">
                  {p.val}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Legenda Warna KMS TB */}
        <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 flex items-center justify-between font-bold text-slate-700 text-[10px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#D1FAE5] border border-[#059669]" />
            <span>Hijau: Normal (Ideal)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#FEF08A] border border-[#CA8A04]" />
            <span>Kuning: Pendek (Stunted)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#FEE2E2] border border-[#DC2626]" />
            <span>Merah: Sangat Pendek</span>
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3.5">
      {/* Grid 4 Metrik Fisik (BB dengan GRAM, TB, LK, LiLA) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {/* 1. Berat Badan (BB) - Kenaikan dlm SATUAN GRAM */}
        <div className="bg-white p-3.5 rounded-2xl border border-teal-200/80 shadow-xs flex flex-col justify-between">
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
            {/* Indikator Selisih Murni dalam Satuan GRAM */}
            <div className="mt-1.5 flex items-center justify-between flex-wrap gap-1">
              {renderBBGramBadge()}
              {prev && <span className="text-[9px] text-slate-400">bln lalu: {prev.bb} kg</span>}
            </div>
          </div>
        </div>

        {/* 2. Tinggi Badan (TB) */}
        <div className="bg-white p-3.5 rounded-2xl border border-blue-200/80 shadow-xs flex flex-col justify-between">
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
            <div className="mt-1.5 flex items-center justify-between flex-wrap gap-1">
              {renderGeneralDiffBadge(diffTB, 'cm', 'text-blue-700')}
              {prev && <span className="text-[9px] text-slate-400">bln lalu: {prev.tb} cm</span>}
            </div>
          </div>
        </div>

        {/* 3. Lingkar Kepala (LK) */}
        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200/80 shadow-xs flex flex-col justify-between">
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
            <div className="mt-1.5 flex items-center justify-between flex-wrap gap-1">
              {renderGeneralDiffBadge(diffLK, 'cm', 'text-emerald-700')}
              {prev && <span className="text-[9px] text-slate-400">bln lalu: {prev.lk} cm</span>}
            </div>
          </div>
        </div>

        {/* 4. Lingkar Lengan (LiLA) */}
        <div className="bg-white p-3.5 rounded-2xl border border-purple-200/80 shadow-xs flex flex-col justify-between">
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
            <div className="mt-1.5 flex items-center justify-between flex-wrap gap-1">
              {renderGeneralDiffBadge(diffLila, 'cm', 'text-purple-700')}
              {prev && <span className="text-[9px] text-slate-400">bln lalu: {prev.lila} cm</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Evaluasi Status Kenaikan KMS (KBM Alert Kemenkes RI dlm GRAM) */}
      <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-semibold ${growthEval.bg} ${growthEval.color}`}>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 flex-shrink-0" />
          <div>
            <span className="font-extrabold block text-xs">Evaluasi Pertumbuhan KMS: {growthEval.status}</span>
            <span className="text-[11px] opacity-90">{growthEval.label}</span>
          </div>
        </div>
        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${growthEval.isNaik ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-amber-100 border-amber-300 text-amber-800'}`}>
          KBM: {growthEval.kbmGram}g
        </span>
      </div>

      {/* Tab Switcher Grafik KMS */}
      <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 text-xs font-bold shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('bb')}
          className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'bb'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>KMS Berat Badan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tb')}
          className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'tb'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>KMS Tinggi Badan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('both')}
          className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'both'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Kedua Grafik</span>
        </button>
      </div>

      {/* Render Grafik KMS Berdasarkan Pilihan Tab */}
      <div className="space-y-4">
        {(activeTab === 'bb' || activeTab === 'both') && renderKMSBeratBadanChart()}
        {(activeTab === 'tb' || activeTab === 'both') && renderKMSTinggiBadanChart()}
      </div>
    </div>
  );
}
