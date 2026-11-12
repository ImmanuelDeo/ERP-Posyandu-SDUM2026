// src/components/Tentang.jsx
import React from 'react';
import {
  ArrowLeft,
  Sparkles,
  GraduationCap,
  Heart,
  Users,
  ShieldCheck,
  Activity,
  FileCheck,
  Building2
} from 'lucide-react';

/**
 * Halaman Tentang Posyandu Cerdas
 * Berisi informasi mengenai fungsi sistem, tujuan perancangan,
 * struktur tim perancang & pengembang, serta rujukan standar kesehatan balita.
 */
export default function Tentang({ onBack }) {
  return (
    <div className="min-h-screen w-full bg-[#FCF9F4] text-slate-800 flex flex-col justify-between relative overflow-x-hidden">
      {/* Background Decorative Washes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-teal-200/35 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-48 -right-24 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl"
      />

      {/* Kontainer Utama */}
      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 sm:px-6 md:px-8 py-6 sm:py-8 flex-1 flex flex-col">
        {/* Top Bar: Tombol Kembali & Logo Institusi */}
        <header className="flex items-center justify-between gap-3 pb-6 border-b border-slate-200/80">
          <button
            type="button"
            onClick={onBack}
            className="min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-teal-900 hover:bg-slate-50 active:scale-95 text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-600/30"
            aria-label="Kembali ke halaman sebelumnya"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5] text-teal-700" />
            <span>Kembali</span>
          </button>

          <div className="bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center">
            <img
              src="/tup-x-s1ds.png.webp"
              alt="Logo Telkom University Purwokerto dan S1 Sains Data"
              className="h-7 sm:h-8 w-auto object-contain"
            />
          </div>
        </header>

        {/* Hero Banner Halaman Tentang */}
        <section className="py-6 sm:py-8 space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-700/15 bg-teal-50 px-3.5 py-1 text-xs font-bold tracking-wider text-teal-800 uppercase shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
            <span>Profil & Informasi Sistem</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-teal-950 leading-tight">
            Tentang Posyandu Cerdas
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
            Sistem informasi posyandu modern yang dirancang untuk mendigitalkan pencatatan antropometri balita,
            menghitung standar pertumbuhan secara akurat, serta mempermudah evaluasi tumbuh kembang anak bagi kader dan orang tua.
          </p>
        </section>

        {/* Konten Utama: 4 Kartu Informasi Terstruktur */}
        <main className="space-y-5 pb-12">
          {/* Kartu 1: Tentang Web & Sistem */}
          <article className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-teal-800">
              <div className="w-9 h-9 rounded-2xl bg-teal-50 flex items-center justify-center border border-teal-200/70 text-teal-700">
                <Heart className="w-4 h-4" />
              </div>
              <h2 className="font-extrabold text-base sm:text-lg text-slate-900">
                Apa itu Posyandu Cerdas?
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Posyandu Cerdas adalah platform pengelolaan posyandu berbasis web yang menyederhanakan alur pelayanan posyandu balita.
              Sistem ini mencakup registrasi data balita, pencatatan hasil pengukuran fisik berkala, pemantauan kurva Kartu Menuju Sehat (KMS),
              serta penyediaan portal rekapitulasi data yang dapat diakses langsung oleh orang tua secara aman.
            </p>
          </article>

          {/* Kartu 2: Tujuan & Manfaat Perancangan */}
          <article className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-teal-800">
              <div className="w-9 h-9 rounded-2xl bg-teal-50 flex items-center justify-center border border-teal-200/70 text-teal-700">
                <Activity className="w-4 h-4" />
              </div>
              <h2 className="font-extrabold text-base sm:text-lg text-slate-900">
                Tujuan Pengembangan Sistem
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-xs font-bold text-teal-900 block flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Pencatatan Rapi</span>
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Menghilangkan duplikasi buku manual dan meminimalkan kesalahan input antropometri balita.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-xs font-bold text-teal-900 block flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Standar Kemenkes</span>
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Evaluasi pertumbuhan otomatis mengacu pada KBM dan antropometri resmi Kemenkes RI (Permenkes No. 2/2020).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-xs font-bold text-teal-900 block flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-teal-600" />
                  <span>Akses Terbuka Ortu</span>
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Orang tua dapat memantau grafik kenaikan berat badan dan tinggi badan anak kapan saja dari gawai mereka.
                </p>
              </div>
            </div>
          </article>

          {/* Kartu 3: Dirancang Oleh Siapa (Struktur Tim & Institusi) */}
          <article className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-teal-800">
              <div className="w-9 h-9 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-200/70 text-amber-700">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h2 className="font-extrabold text-base sm:text-lg text-slate-900">
                Perancang & Pengembang
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Sistem Posyandu Cerdas diinisiasi dan dikembangkan oleh tim akademisi Program Studi S1 Sains Data,
              Telkom University Purwokerto, sebagai wujud kontribusi nyata teknologi data bagi kesehatan masyarakat.
            </p>

            {/* Tabel / Grid Struktur Tim */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs">
              <div className="p-3 bg-slate-50 font-bold text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-slate-500 uppercase text-[10px] tracking-wider">Institusi:</span>
                <span className="text-slate-900 sm:text-right font-extrabold">Program Studi S1 Sains Data, Telkom University Purwokerto</span>
              </div>

              <div className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-slate-500 uppercase text-[10px] tracking-wider">Program Kegiatan:</span>
                <span className="text-slate-800 font-semibold sm:text-right">Sains Data Untuk Masyarakat (SDUM 2026)</span>
              </div>

              <div className="p-3 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-slate-500 uppercase text-[10px] tracking-wider">Dosen Pembimbing:</span>
                <span className="text-slate-700 italic sm:text-right font-medium">[Nama Dosen Pembimbing]</span>
              </div>

              <div className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-slate-500 uppercase text-[10px] tracking-wider">Tim Pengembang:</span>
                <span className="text-slate-700 italic sm:text-right font-medium">[Nama Anggota Tim Pengembang]</span>
              </div>

              <div className="p-3 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-slate-500 uppercase text-[10px] tracking-wider">Lokasi Implementasi:</span>
                <span className="text-slate-800 font-semibold sm:text-right flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-teal-600 inline" />
                  <span>Posyandu Wilayah Purwokerto, Kabupaten Banyumas</span>
                </span>
              </div>
            </div>
          </article>

          {/* Kartu 4: Informasi Versi & Teknis */}
          <article className="p-4 sm:p-5 rounded-2xl bg-teal-50/70 border border-teal-200/80 text-xs text-teal-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-extrabold block text-xs text-teal-900">
                Posyandu Cerdas v1.0.0
              </span>
              <p className="text-[11px] text-teal-800/80 mt-0.5">
                Rujukan: Permenkes RI No. 2 Tahun 2020 tentang Standar Antropometri Anak
              </p>
            </div>
            <span className="text-[10px] font-black px-3 py-1 rounded-full bg-white text-teal-800 border border-teal-200/80 self-start sm:self-center">
              Tahun 2026
            </span>
          </article>
        </main>

        {/* Footer Sederhana */}
        <footer className="pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
          Posyandu Cerdas &bull; Sains Data Telkom University Purwokerto &bull; 2026
        </footer>
      </div>
    </div>
  );
}
