import { useAuth } from '../context/AuthContext';
import { Users, CheckCircle2, AlertCircle, Calendar, ShieldCheck, FileSpreadsheet } from 'lucide-react';

export default function Beranda() {
  const { getTenantData } = useAuth();
  const tenant = getTenantData();
  const children = tenant?.children || [];
  const total = children.length;
  const weighedCount = Math.max(0, total - 1);
  const unweighedCount = Math.min(total, 1);
  const weighedPct = total > 0 ? Math.round((weighedCount / total) * 100) : 0;
  const lCount = children.filter(c => c.gender === 'L').length;
  const pCount = children.filter(c => c.gender === 'P').length;
  const lPct = total > 0 ? Math.round((lCount / total) * 100) : 50;
  const pPct = total > 0 ? (100 - lPct) : 50;

  // Age group counts
  const age1 = children.filter(c => c.usiaBulan <= 12).length;
  const age2 = children.filter(c => c.usiaBulan >= 13 && c.usiaBulan <= 24).length;
  const age3 = children.filter(c => c.usiaBulan >= 25).length;

  const circumference = 314.16; // 2 * pi * 50
  const maleDash = ((lPct / 100) * circumference).toFixed(1);

  return (
    <section className="space-y-6" id="beranda">
      {/* Monthly Header Banner */}
      <div className="bg-gradient-to-r from-posyandu-700 via-posyandu-600 to-teal-500 rounded-3xl p-5 sm:p-7 text-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-teal-100 bg-white/15 px-2 py-0.5 rounded-full inline-block">
              Oktober 2026
            </span>
            <span className="text-[10px] uppercase font-bold text-teal-200">
              • {tenant?.title || 'Posyandu'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
            Overview Pelayanan Fisik Balita
          </h2>
          <p className="text-xs text-teal-100 max-w-xl">
            Sistem monitoring otomatis data fisik (BB, TB, LK, LiLA) per individu balita tanpa pencatatan kertas ganda.
          </p>
        </div>

        {/* Quick ERP Status Pill */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/20 self-start md:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          <div className="text-left text-[11px]">
            <span className="block text-teal-100 font-medium leading-none">Isolasi Data:</span>
            <strong className="text-white font-bold leading-tight">Aktif (RLS Protected)</strong>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards Grid - Fully Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        <MetricCard
          title="Total Balita"
          value={total}
          unit="Anak"
          subtitle="Terdaftar resmi di posyandu"
          icon={<Users className="w-4 h-4" />}
          iconBg="bg-teal-50"
          iconColor="text-teal-700"
        />
        <MetricCard
          title="Sudah Diperiksa"
          value={weighedCount}
          unit="Anak"
          subtitle={`${weighedPct}% Selesai Ditimbang`}
          icon={<CheckCircle2 className="w-4 h-4" />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
          valueColor="text-emerald-600"
          highlightSubtitle
        />
        <MetricCard
          title="Belum Hadir"
          value={unweighedCount}
          unit="Anak"
          subtitle="Perlu jadwal susulan"
          icon={<AlertCircle className="w-4 h-4" />}
          iconBg="bg-amber-50"
          iconColor="text-amber-700"
          valueColor="text-amber-600"
        />
        <MetricCard
          title="Rata-rata Usia"
          value="18.2"
          unit="Bulan"
          subtitle="Rentang sasaran (0-5 thn)"
          icon={<Calendar className="w-4 h-4" />}
          iconBg="bg-blue-50"
          iconColor="text-blue-700"
        />
      </div>

      {/* Analytics Demografi Row - Side-by-Side balanced on all screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Card 1: Donut Chart Jenis Kelamin */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">Komposisi Jenis Kelamin</h3>
              <p className="text-[11px] text-slate-400">Rasio gender balita yang terdaftar</p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
              {lCount} L : {pCount} P
            </span>
          </div>

          {/* Donut Graphic */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 my-5">
            <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                {/* Female Arc (Base Pink) */}
                <circle cx="70" cy="70" r="50" fill="none" stroke="#f43f5e" strokeWidth="15" />
                {/* Male Arc (Blue) */}
                <circle
                  cx="70"
                  cy="70"
                  r="50"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="15"
                  strokeDasharray={`${maleDash} ${circumference}`}
                  strokeDashoffset="0"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              {/* Center Info Inside Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-2xl font-black text-slate-900 leading-none">{total}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Balita</span>
              </div>
            </div>

            {/* Clear External Legends */}
            <div className="flex flex-col gap-2 w-full max-w-xs sm:w-auto">
              <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-blue-50/70 border border-blue-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-xs font-semibold text-slate-700">Laki-laki</span>
                </div>
                <strong className="text-xs font-black text-blue-800">{lCount} Anak ({lPct}%)</strong>
              </div>

              <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-rose-50/70 border border-rose-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-xs font-semibold text-slate-700">Perempuan</span>
                </div>
                <strong className="text-xs font-black text-rose-800">{pCount} Anak ({pPct}%)</strong>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 text-center sm:text-left">
            Data otomatis terpisah murni per posyandu aktif.
          </div>
        </div>

        {/* Card 2: Distribusi Kelompok Usia */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">Distribusi Kelompok Usia</h3>
              <p className="text-[11px] text-slate-400">Pembagian umur sasaran pelayanan</p>
            </div>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-100">
              3 Kategori
            </span>
          </div>

          {/* Progress Bars */}
          <div className="space-y-3.5 my-3">
            <AgeCategoryRow
              label="0 - 12 Bulan (Bayi)"
              subtext="Fase ASI eksklusif & awal MPASI"
              count={age1}
              total={total}
              barColor="bg-teal-500"
            />
            <AgeCategoryRow
              label="13 - 24 Bulan (Batita)"
              subtext="Fase percepatan motorik kasar"
              count={age2}
              total={total}
              barColor="bg-teal-600"
            />
            <AgeCategoryRow
              label="25 - 59 Bulan (Balita)"
              subtext="Pemantauan fisik rutin"
              count={age3}
              total={total}
              barColor="bg-teal-700"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Rentang Usia:</span>
            <strong className="text-teal-800 font-bold">0 s.d. 59 Bulan</strong>
          </div>
        </div>
      </div>

      {/* Quick Summary Note for Kader */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-teal-700 flex-shrink-0" />
          <span>
            Data tersimpan rapi layaknya format Excel. Buka <strong>Buku Data</strong> untuk pencarian cepat atau ekspor laporan bulanan.
          </span>
        </div>
        <div className="text-[11px] font-semibold text-slate-400 self-end sm:self-auto">
          Multi-Tenant ERP Engine
        </div>
      </div>
    </section>
  );
}

function MetricCard({ title, value, unit, subtitle, icon, iconBg, iconColor, valueColor = "text-slate-900", highlightSubtitle }) {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between transition hover:shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 tracking-wide">{title}</span>
        <span className={`p-1.5 ${iconBg} ${iconColor} rounded-xl`}>{icon}</span>
      </div>
      <div className="mt-2">
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl sm:text-3xl font-black tracking-tight ${valueColor}`}>{value}</span>
          {unit && <span className="text-xs text-slate-400 font-medium">{unit}</span>}
        </div>
        <p className={`text-[11px] mt-1 line-clamp-1 ${highlightSubtitle ? 'text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md inline-block' : 'text-slate-400 font-medium'}`}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function AgeCategoryRow({ label, subtext, count, total, barColor }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs mb-1">
        <div>
          <span className="font-bold text-slate-800">{label}</span>
          <span className="text-[10px] text-slate-400 hidden sm:inline ml-1.5">• {subtext}</span>
        </div>
        <strong className="text-slate-900 font-black">{count} Balita ({pct}%)</strong>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}