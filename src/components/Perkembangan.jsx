import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';

export default function Perkembangan({ initialChildId }) {
  const { getTenantData } = useAuth();
  const [selectedChildId, setSelectedChildId] = useState(initialChildId || null);
  const [activeMetric, setActiveMetric] = useState('bb');

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
      <section className="p-3 space-y-3">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
          Tidak ada data balita.
        </div>
      </section>
    );
  }

  const history = selectedChild.history || [];
  const latest = history[history.length - 1];
  const prev = history.length > 1 ? history[history.length - 2] : latest;

  const metricLabels = {
    bb: { label: 'Berat Badan (BB)', unit: 'kg', color: '#0d9488' },
    tb: { label: 'Tinggi Badan (TB)', unit: 'cm', color: '#0d9488' },
    lk: { label: 'Lingkar Kepala (LK)', unit: 'cm', color: '#0d9488' },
    lila: { label: 'Lingkar Lengan (LiLA)', unit: 'cm', color: '#0d9488' },
  };

  const currentMetric = metricLabels[activeMetric];
  const values = history.map(h => h[activeMetric]);
  const minVal = Math.min(...values) * 0.93;
  const maxVal = Math.max(...values) * 1.06;

  // Diff calculation
  const diff = latest[activeMetric] - prev[activeMetric];
  const diffText = diff > 0 ? `▲ +${diff.toFixed(1)}` : diff < 0 ? `▼ ${diff.toFixed(1)}` : '━ Tetap';
  const diffColor = diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-rose-600' : 'text-slate-400';

  const renderSVG = () => {
    const w = 320, h = 135, padX = 26, padY = 22;
    const stepX = (w - 2 * padX) / Math.max(1, history.length - 1);
    const points = values.map((val, idx) => {
      const x = padX + idx * stepX;
      const y = h - padY - ((val - minVal) / (maxVal - minVal)) * (h - 2 * padY);
      return { x, y, val, age: history[idx].usia };
    });
    const polyline = points.map(p => `${p.x},${p.y}`).join(' ');

    return (
      <svg viewBox="0 0 320 140" className="w-full h-full" role="img" aria-label={`${currentMetric.label} chart`}>
        <line x1={padX} y1={padY} x2={w-padX} y2={padY} stroke="#e2e8f0" strokeDasharray="3,3" />
        <line x1={padX} y1={h/2} x2={w-padX} y2={h/2} stroke="#e2e8f0" strokeDasharray="3,3" />
        <line x1={padX} y1={h-padY} x2={w-padX} y2={h-padY} stroke="#cbd5e1" strokeWidth="1.5" />
        <polygon fill="rgba(13, 148, 136, 0.08)" points={`${points[0].x},${h-padY} ${polyline} ${points[points.length-1].x},${h-padY}`} />
        <polyline fill="none" stroke="#0d9488" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" points={polyline} />
        {points.map(p => (
          <g key={p.age}>
            <circle cx={p.x} cy={p.y} r="4.5" fill="#ffffff" stroke="#0f766e" strokeWidth="3" />
            <text x={p.x} y={p.y - 7} fontSize="9" fontWeight="800" fill="#0f766e" textAnchor="middle">{p.val}</text>
            <text x={p.x} y={h - 7} fontSize="8" fontWeight="600" fill="#64748b" textAnchor="middle">{p.age}bl</text>
          </g>
        ))}
      </svg>
    );
  };

  const renderHistoryTable = () => {
    return (
      <table className="w-full text-left text-[10px]">
        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
          <tr>
            <th className="py-2 px-2">Tanggal</th>
            <th className="py-2 px-1">Usia</th>
            <th className="py-2 px-1">BB</th>
            <th className="py-2 px-1">TB</th>
            <th className="py-2 px-1">LK</th>
            <th className="py-2 px-1">LiLA</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
          {history.slice().reverse().map((row, idx) => (
            <tr key={idx} className="hover:bg-slate-50 transition">
              <td className="py-2 px-2 font-semibold text-slate-900">{row.tgl}</td>
              <td className="py-2 px-1 text-slate-600">{row.usia} bln</td>
              <td className="py-2 px-1 font-black text-posyandu-700">{row.bb} kg</td>
              <td className="py-2 px-1 font-bold text-slate-800">{row.tb} cm</td>
              <td className="py-2 px-1 text-slate-600">{row.lk} cm</td>
              <td className="py-2 px-1 text-slate-600">{row.lila} cm</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <section className="p-3 space-y-3" id="perkembangan">
      {/* Child Selector */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs space-y-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pilih Balita:</label>
        <select
          value={selectedChildId}
          onChange={(e) => setSelectedChildId(e.target.value)}
          className="w-full h-10 px-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:outline-none focus:border-posyandu-600"
        >
          {children.map(c => (
            <option key={c.id} value={c.id}>{c.nama} ({c.usiaBulan} bln)</option>
          ))}
        </select>
      </div>

      {/* Child Profile */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-start justify-between">
          <div>
            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
              selectedChild.gender === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
            }`}>
              {selectedChild.gender === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN'}
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 mt-1">{selectedChild.nama}</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">NIK: {selectedChild.nik}</p>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-semibold text-slate-400 block uppercase tracking-wider">Usia</span>
            <span className="text-base font-black text-posyandu-700">{selectedChild.usiaBulan} Bulan</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-2 gap-1 text-xs">
          <div><span className="text-slate-400 block text-[10px]">Tgl Lahir:</span><span className="font-bold text-slate-700">{selectedChild.tglLahir}</span></div>
          <div><span className="text-slate-400 block text-[10px]">Ortu:</span><span className="font-bold text-slate-700">{selectedChild.namaOrtu}</span></div>
        </div>
      </div>

      {/* Komparasi */}
      <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-md border border-slate-800 space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-xs text-teal-300">Komparasi Perkembangan</h3>
            <p className="text-[10px] text-slate-400">Pemeriksaan Terbaru vs Pemeriksaan Lalu</p>
          </div>
          <span className="text-[9px] bg-slate-800 border border-slate-700 text-teal-400 font-bold px-1.5 py-0.5 rounded-lg">
            {latest?.tgl?.split(' ')[0] || 'N/A'} vs {prev?.tgl?.split(' ')[0] || 'N/A'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-800/90 p-2 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 block font-medium">Berat Badan (BB)</span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-lg font-black text-white">{latest.bb} <span className="text-xs font-normal text-slate-400">kg</span></span>
              <span className={`text-[10px] font-bold ${diffColor} bg-emerald-950/70 border border-emerald-800 px-1.5 py-0.5 rounded`}>
                {diff > 0 ? `▲ +${diff.toFixed(1)}` : diff < 0 ? `▼ ${diff.toFixed(1)}` : '━ Tetap'}
              </span>
            </div>
            <span className="text-[9px] text-slate-400 block mt-0.5">Lalu: <strong>{prev.bb} kg</strong></span>
          </div>
          <div className="bg-slate-800/90 p-2 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 block font-medium">Tinggi Badan (TB)</span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-lg font-black text-white">{latest.tb} <span className="text-xs font-normal text-slate-400">cm</span></span>
              <span className={`text-[10px] font-bold ${diffColor} bg-emerald-950/70 border border-emerald-800 px-1.5 py-0.5 rounded`}>
                {diff > 0 ? `▲ +${diff.toFixed(1)}` : diff < 0 ? `▼ ${diff.toFixed(1)}` : '━ Tetap'}
              </span>
            </div>
            <span className="text-[9px] text-slate-400 block mt-0.5">Lalu: <strong>{prev.tb} cm</strong></span>
          </div>
          <div className="bg-slate-800/90 p-2 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 block font-medium">Lingkar Kepala (LK)</span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-lg font-black text-white">{latest.lk} <span className="text-xs font-normal text-slate-400">cm</span></span>
              <span className={`text-[10px] font-bold ${diffColor} bg-emerald-950/70 border border-emerald-800 px-1.5 py-0.5 rounded`}>
                {diff > 0 ? `▲ +${diff.toFixed(1)}` : diff < 0 ? `▼ ${diff.toFixed(1)}` : '━ Tetap'}
              </span>
            </div>
            <span className="text-[9px] text-slate-400 block mt-0.5">Lalu: <strong>{prev.lk} cm</strong></span>
          </div>
          <div className="bg-slate-800/90 p-2 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 block font-medium">Lingkar Lengan (LiLA)</span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-lg font-black text-white">{latest.lila} <span className="text-xs font-normal text-slate-400">cm</span></span>
              <span className={`text-[10px] font-bold ${diffColor} bg-emerald-950/70 border border-emerald-800 px-1.5 py-0.5 rounded`}>
                {diff > 0 ? `▲ +${diff.toFixed(1)}` : diff < 0 ? `▼ ${diff.toFixed(1)}` : '━ Tetap'}
              </span>
            </div>
            <span className="text-[9px] text-slate-400 block mt-0.5">Lalu: <strong>{prev.lila} cm</strong></span>
          </div>
        </div>
      </div>

      {/* Grafik Tren */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-900">Grafik Tren Individu</h3>
          <span className="text-[10px] font-semibold text-posyandu-700 bg-posyandu-50 px-2 py-0.5 rounded-lg">
            {history[0]?.usia} - {latest?.usia} bln
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl text-[10px] font-bold text-center">
          {Object.entries(metricLabels).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setActiveMetric(key)}
              className={`py-1 rounded-lg ${activeMetric === key ? 'bg-posyandu-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {val.label.split('(')[1]?.replace(')', '') || val.label}
            </button>
          ))}
        </div>

        <div className="h-40 w-full bg-slate-50 rounded-xl border border-slate-100 p-2 flex items-center justify-center">
          {renderSVG()}
        </div>
        <p className="text-[10px] text-slate-500 text-center italic">
          Tren {currentMetric.label} balita dari pemeriksaan awal hingga terkini.
        </p>
      </div>

      {/* Log Riwayat */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-3 py-2 bg-slate-100/80 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-[9px] text-slate-700 uppercase tracking-wider">Log Riwayat Seluruh Pemeriksaan</h3>
          <span className="text-[9px] text-slate-500 font-semibold">{history.length} Kunjungan</span>
        </div>
        <div className="overflow-x-auto">
          {renderHistoryTable()}
        </div>
      </div>
    </section>
  );
}