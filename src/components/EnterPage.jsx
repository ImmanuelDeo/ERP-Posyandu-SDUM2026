// src/components/EnterPage.jsx
import React, { useState, useMemo } from 'react';
import {
  HeartHandshake,
  MapPin,
  Check,
  ArrowRight,
  ArrowLeft,
  Plus,
  Sparkles,
  Building2,
  X,
  Search,
  BookOpen,
  Info,
  CheckCircle2
} from 'lucide-react';

const DEFAULT_TENANTS = [
  {
    id: 'posyandu-arca',
    kode: 'POS-ARCA-01',
    nama: 'Posyandu Arca',
    alamat: 'Kelurahan Arcawinangun, Purwokerto Timur',
    jumlahBalita: 4,
    aksen: 'teal',
  },
  {
    id: 'posyandu-melati-01',
    kode: 'POS-MLT-01',
    nama: 'Posyandu Melati 01',
    alamat: 'Kecamatan Purwokerto Barat',
    jumlahBalita: 12,
    aksen: 'amber',
  },
];

/**
 * Fallback SVG Ilustrasi Step 1: Ibu Kader, Timbangan Dacin & Balita
 * Gaya Watercolor Soft Ink (Anti-AI Slop) - Aktif jika file asset belum termuat / offline PWA
 */
function Step1FallbackIllustration() {
  return (
    <svg
      viewBox="0 0 400 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full object-cover select-none"
      role="img"
      aria-label="Ilustrasi cat air Ibu Kader Posyandu menimbang balita dengan dacin"
    >
      <defs>
        <radialGradient id="s1Teal" cx="35%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#99F6E4" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#99F6E4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s1Amber" cx="70%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s1Rose" cx="50%" cy="80%" r="45%">
          <stop offset="0%" stopColor="#FECDD3" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FECDD3" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Watercolor Wash Spots */}
      <circle cx="140" cy="190" r="130" fill="url(#s1Teal)" />
      <circle cx="280" cy="130" r="110" fill="url(#s1Amber)" />
      <circle cx="200" cy="240" r="90" fill="url(#s1Rose)" />

      {/* Tiang & Palang Timbangan Dacin */}
      <line x1="90" y1="35" x2="310" y2="35" stroke="#0F766E" strokeWidth="3" strokeLinecap="round" />
      <circle cx="200" cy="35" r="5" fill="#0F766E" />
      <line x1="200" y1="35" x2="200" y2="10" stroke="#0F766E" strokeWidth="2.5" />

      {/* Tali Gantung & Sarung Timbang Bayi */}
      <line x1="240" y1="35" x2="225" y2="105" stroke="#B45309" strokeWidth="1.8" />
      <line x1="265" y1="35" x2="255" y2="105" stroke="#B45309" strokeWidth="1.8" />
      <path
        d="M210 105 Q240 165 270 105 Z"
        fill="#FEF3C7"
        stroke="#D97706"
        strokeWidth="2"
      />
      {/* Bayi Nyaman di Dalam Sarung */}
      <circle cx="240" cy="122" r="10" fill="#FDE2C8" stroke="#78350F" strokeWidth="1.2" />
      <path d="M236 122 Q240 125 244 122" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="242" cy="125" r="2" fill="#FB7185" fillOpacity="0.6" />

      {/* Ibu Kader Posyandu Berkerudung Teal */}
      <g>
        {/* Kerudung */}
        <path
          d="M95 95 C95 55, 150 55, 152 95 C154 120, 145 142, 122 144 C100 144, 93 124, 95 95 Z"
          fill="#14B8A6"
          fillOpacity="0.9"
          stroke="#0F766E"
          strokeWidth="2.2"
        />
        {/* Wajah */}
        <circle cx="130" cy="98" r="16" fill="#FDE2C8" stroke="#0F766E" strokeWidth="1.8" />
        <path d="M132 94 Q136 91 140 94" stroke="#0F766E" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M131 104 Q137 108 141 103" stroke="#0F766E" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="132" cy="102" r="3.5" fill="#FB7185" fillOpacity="0.5" />
        {/* Baju Kader */}
        <path
          d="M90 240 L100 144 C112 138, 142 138, 152 144 L165 240 Z"
          fill="#0D9488"
          stroke="#0F766E"
          strokeWidth="2.2"
        />
        {/* Tangan Mengangkat / Memegang Penyangga Timbangan */}
        <path
          d="M142 152 Q185 130 200 80"
          stroke="#0F766E"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <circle cx="202" cy="78" r="7" fill="#FDE2C8" stroke="#0F766E" strokeWidth="1.8" />
      </g>

      {/* Balita Berdiri Ceria di Samping Ibu */}
      <g>
        <circle cx="70" cy="180" r="13" fill="#FDE2C8" stroke="#334155" strokeWidth="1.6" />
        <path d="M66 177 Q70 174 74 177" stroke="#334155" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M66 185 Q71 188 75 185" stroke="#334155" strokeWidth="1.4" strokeLinecap="round" />
        {/* Baju Kuning Balita */}
        <path
          d="M54 260 L58 195 C64 192, 76 192, 82 195 L86 260 Z"
          fill="#FDE68A"
          stroke="#D97706"
          strokeWidth="1.8"
        />
        {/* Tangan Balita Menggenggam Tangan Ibu */}
        <path
          d="M78 205 Q92 215 98 208"
          stroke="#FDE2C8"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>

      {/* Daun Melati & Aksen Bunga Tradisional */}
      <path d="M280 230 Q305 205 315 230 Q295 245 280 230 Z" fill="#5EEAD4" fillOpacity="0.7" stroke="#0F766E" strokeWidth="1.4" />
      <path d="M305 220 Q325 195 330 220 Q315 235 305 220 Z" fill="#A7F3D0" fillOpacity="0.8" stroke="#0F766E" strokeWidth="1.4" />
      <circle cx="300" cy="215" r="5" fill="#FFFFFF" stroke="#0F766E" strokeWidth="1.2" />
      <circle cx="300" cy="215" r="2" fill="#F59E0B" />
    </svg>
  );
}

/**
 * Fallback SVG Ilustrasi Step 2: Desain Object Posyandu Terpadu
 */
function Step2FallbackIllustration() {
  return (
    <svg
      viewBox="0 0 340 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full object-cover select-none"
      role="img"
      aria-label="Ilustrasi posyandu dan kesehatan balita"
    >
      <rect width="340" height="140" fill="#F0FDFA" />
      <circle cx="80" cy="70" r="50" fill="#99F6E4" fillOpacity="0.5" />
      <circle cx="260" cy="70" r="50" fill="#FDE68A" fillOpacity="0.5" />
      <circle cx="170" cy="70" r="40" fill="#FECDD3" fillOpacity="0.4" />

      {/* Siluet Pendopo & Balita */}
      <path d="M135 45 L170 25 L205 45 Z" fill="#CCFBF1" stroke="#0F766E" strokeWidth="1.5" />
      <line x1="140" y1="45" x2="200" y2="45" stroke="#0F766E" strokeWidth="1.5" />
      <line x1="170" y1="45" x2="170" y2="60" stroke="#0F766E" strokeWidth="1.4" />
      <path d="M162 60 Q170 80 178 60 Z" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.4" />

      {/* Hati Posyandu */}
      <circle cx="170" cy="98" r="14" fill="#FFFFFF" stroke="#10B981" strokeWidth="1.5" />
      <path
        d="M170 104 C170 104 163 99.5 163 95.5 C163 93.5 164.5 92 166.5 92 C168 92 169.3 92.8 170 94.2 C170.7 92.8 172 92 173.5 92 C175.5 92 177 93.5 177 95.5 C177 99.5 170 104 170 104 Z"
        fill="#F43F5E"
      />
    </svg>
  );
}

export default function EnterPage({
  initialStep = 1,
  posyanduList = DEFAULT_TENANTS,
  defaultSelectedId,
  onEnterPosyandu,
  onRegisterPosyandu,
  onOpenLogin,
  onBackToWelcome,
}) {
  // 2-Step Flow State: 1 = Welcome Screen, 2 = Tenant Selector Dashboard
  const [step, setStep] = useState(initialStep);
  const [activeTab, setActiveTab] = useState('pilih'); // 'pilih' | 'panduan'
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedId, setSelectedId] = useState(
    defaultSelectedId || (posyanduList[0]?.id ?? 'posyandu-arca')
  );

  // Modal Register Tenant Baru
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNama, setNewNama] = useState('');
  const [newAlamat, setNewAlamat] = useState('');
  const [formError, setFormError] = useState('');

  // Image load fallback states
  const [step1ImgFailed, setStep1ImgFailed] = useState(false);
  const [step2ImgFailed, setStep2ImgFailed] = useState(false);

  const selectedPosyandu = useMemo(() => {
    return posyanduList.find((item) => item.id === selectedId) || posyanduList[0];
  }, [posyanduList, selectedId]);

  const filteredPosyandu = useMemo(() => {
    if (!searchQuery.trim()) return posyanduList;
    const q = searchQuery.toLowerCase();
    return posyanduList.filter(
      (item) =>
        item.nama?.toLowerCase().includes(q) ||
        item.alamat?.toLowerCase().includes(q)
    );
  }, [posyanduList, searchQuery]);

  const handleEnter = () => {
    if (onEnterPosyandu && selectedPosyandu) {
      onEnterPosyandu(selectedPosyandu);
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newNama.trim() || !newAlamat.trim()) {
      setFormError('Mohon isi nama Posyandu dan alamat kelurahan/kecamatan.');
      return;
    }
    const created = {
      id: `posyandu-${Date.now()}`,
      kode: `POS-${newNama.trim().substring(0, 4).toUpperCase()}`,
      nama: newNama.trim(),
      alamat: newAlamat.trim(),
      jumlahBalita: 0,
    };
    if (onRegisterPosyandu) {
      onRegisterPosyandu(created);
    }
    setSelectedId(created.id);
    setNewNama('');
    setNewAlamat('');
    setFormError('');
    setIsModalOpen(false);
  };

  // =========================================================================
  // STEP 1: WELCOME SCREEN (WARM PAPER, EDITORIAL TYPO, CROPPED BLEED HERO)
  // =========================================================================
  if (step === 1) {
    return (
      <div className="min-h-screen w-full bg-[#FCF9F4] text-slate-800 flex flex-col justify-between relative overflow-hidden select-none">
        {/* Soft Background Washes menyatu sampai bawah */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-teal-200/40 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-40 -right-20 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-teal-100/60 via-amber-100/30 to-transparent blur-2xl"
        />

        {/* Ilustrasi Mentok Pojok Kiri Bawah Nempel Bawah */}
        <div className="absolute left-0 bottom-0 w-[420px] sm:w-[460px] h-[520px] sm:h-[580px] pointer-events-none z-0 overflow-hidden rounded-tr-[200px]">
          {!step1ImgFailed ? (
            <img
              src="/ilustrasi-first-enter-page.jpg"
              alt="Ilustrasi Ibu Kader dan Balita Posyandu"
              onError={() => setStep1ImgFailed(true)}
              className="w-full h-full object-cover object-left-bottom opacity-95 scale-110"
            />
          ) : (
            <Step1FallbackIllustration />
          )}
          {/* Halus fade ke kanan dan atas agar teks header dan tombol tetap kontras & terbaca jelas */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#FCF9F4]/10 to-[#FCF9F4]/75" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#FCF9F4]/80 via-transparent to-transparent" />
        </div>

        {/* Kontainer Utama Mobile-First */}
        <div className="relative z-10 mx-auto w-full max-w-[430px] flex-1 flex flex-col justify-between px-5 pt-8 pb-6">
          {/* BAGIAN ATAS: Rata Kiri, Editorial & Humanist - Dibuat Lebih ke Bawah & Teks Lebih Besar */}
          <header className="text-left pt-2 sm:pt-4">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-700/15 bg-teal-50/90 px-3.5 py-1 text-xs font-bold tracking-wider text-teal-800 uppercase shadow-xs mb-3.5">
              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
              <span>Posyandu Digital • Purwokerto</span>
            </div>

            {/* Sub-header & Judul Utama Fraunces - Lebih Besar */}
            <p className="text-base font-semibold text-teal-700 tracking-wide uppercase">
              Selamat Datang di
            </p>
            <h1 className="font-serif text-[34px] sm:text-[38px] leading-[1.12] font-bold text-teal-950 mt-1">
              ERP Posyandu Terpadu
            </h1>

            {/* Deskripsi Sistem - Sedikit Lebih Besar & Geser ke Bawah Sedikit */}
            <p className="mt-3 text-[15px] sm:text-[16px] leading-relaxed text-slate-600 max-w-sm">
              Sistem terintegrasi multi-posyandu dengan isolasi data aman per tenant.
            </p>
          </header>

          {/* Spacer Tengah */}
          <div className="flex-1 min-h-[140px]" />

          {/* BAGIAN BAWAH: Tombol Pill Penuh "Mulai Sekarang →" (Di Depan Ilustrasi) */}
          <footer className="space-y-3 pt-3 relative z-10">
            <button
              type="button"
              onClick={() => {
                if (onOpenLogin) {
                  onOpenLogin();
                } else {
                  setStep(2);
                }
              }}
              className="w-full min-h-[56px] rounded-full bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-500 hover:from-teal-800 hover:to-emerald-600 active:scale-[0.99] text-white font-bold text-[17px] px-6 py-3.5 shadow-teal-cta transition-all flex items-center justify-center gap-2.5 group backdrop-blur-xs"
            >
              <span>Mulai Sekarang</span>
              <ArrowRight className="h-5 w-5 stroke-[2.75] transition-transform group-hover:translate-x-1" />
            </button>

            <p className="text-center text-[12px] font-medium text-slate-500">
              Teknologi Multi-Tenant ERP Cloud • Sains Data Telkom University
            </p>
          </footer>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STEP 2: TENANT SELECTOR DASHBOARD (CURVED TEAL DESIGN OBJECT HEADER)
  // =========================================================================
  return (
    <div className="min-h-screen w-full bg-[#FCF9F4] text-slate-800 flex flex-col justify-between relative overflow-x-hidden select-none">
      {/* Kontainer Mobile Frame Maks 430px */}
      <div className="mx-auto w-full max-w-[430px] flex-1 flex flex-col justify-between">
        {/* DESAIN OBJECT MELENGKUNG (CURVED TEAL HEADER) */}
        <section className="relative bg-gradient-to-b from-teal-800 via-teal-700 to-teal-600 text-white pt-5 pb-7 px-5 rounded-b-[42px] shadow-xl overflow-hidden">
          {/* Subtle Decorative Pattern */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-emerald-400/20 blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-teal-400/20 blur-xl"
          />

          {/* Top Bar: Tombol Kembali (←) & Tombol (+ Posyandu Baru) */}
          <div className="relative z-10 flex items-center justify-between gap-2 mb-4">
            <button
              type="button"
              onClick={() => {
                if (onBackToWelcome) {
                  onBackToWelcome();
                } else {
                  setStep(1);
                }
              }}
              className="h-10 w-10 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center border border-white/25 transition shadow-xs"
              title="Kembali ke Menu Login"
              aria-label="Kembali ke Menu Login"
            >
              <ArrowLeft className="h-5 w-5 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="h-9 px-3.5 rounded-full bg-white text-teal-800 hover:bg-teal-50 active:scale-95 font-bold text-xs transition flex items-center gap-1.5 shadow-md"
            >
              <Plus className="h-4 w-4 text-teal-600 stroke-[3]" />
              <span>Posyandu Baru</span>
            </button>
          </div>

          {/* Hero Content di Atas Desain Object */}
          <div className="relative z-10 space-y-3 pt-1">
            {/* Area Ilustrasi Bersih Tanpa Efek Blur */}
            <div className="relative mx-auto w-full max-w-[340px] h-40 overflow-hidden rounded-2xl shadow-sm">
              {!step2ImgFailed ? (
                <img
                  src="/ilustrasi-step2.png"
                  alt="Ilustrasi Layanan Posyandu"
                  onError={() => setStep2ImgFailed(true)}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <Step2FallbackIllustration />
              )}
            </div>

            {/* Judul & Info Terpusat */}
            <div className="text-center pt-0.5">
              <h2 className="font-serif text-[24px] font-bold text-white leading-tight">
                ERP Posyandu Terpadu
              </h2>
              <p className="text-xs text-teal-100/90 mt-0.5">
                Sistem Terpadu Pendataan Balita & Rekam Timbangan
              </p>
            </div>

            {/* Kotak Info Lokasi & RLS */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-2.5 text-xs text-teal-50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin className="h-4 w-4 text-amber-300 flex-shrink-0" />
                <span className="truncate">Wilayah: Purwokerto, Banyumas</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 bg-emerald-500/25 border border-emerald-300/40 text-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                <span>RLS Aktif</span>
              </div>
            </div>
          </div>
        </section>

        {/* BAGIAN BAWAH (KONTEN SELECTION & PANDUAN) */}
        <main className="relative z-10 flex-1 px-5 pt-4 pb-6 flex flex-col justify-between">
          <div className="space-y-3.5">
            {/* Tabs: Pilih Posyandu vs Panduan Kader */}
            <div className="flex border-b border-[#E8E2D5] text-sm font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('pilih')}
                className={`flex-1 pb-2.5 text-center transition flex items-center justify-center gap-2 border-b-2 ${
                  activeTab === 'pilih'
                    ? 'border-teal-600 text-teal-950 font-extrabold'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Pilih Posyandu</span>
                <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200">
                  {posyanduList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('panduan')}
                className={`flex-1 pb-2.5 text-center transition flex items-center justify-center gap-2 border-b-2 ${
                  activeTab === 'panduan'
                    ? 'border-teal-600 text-teal-950 font-extrabold'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Panduan Kader</span>
              </button>
            </div>

            {/* TAB CONTENT 1: PILIH POSYANDU */}
            {activeTab === 'pilih' && (
              <div className="space-y-3">
                {/* Search Input Box */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama posyandu atau wilayah..."
                    className="w-full h-11 pl-10 pr-3.5 bg-white border border-[#E8E2D5] rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-600 shadow-2xs placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Sub-label Daftar */}
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
                  <span>Pilih Posyandu Tempat Bertugas:</span>
                  <span>{filteredPosyandu.length} Ditemukan</span>
                </div>

                {/* Daftar Kartu Tenant Posyandu */}
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 no-scrollbar" role="radiogroup">
                  {filteredPosyandu.map((item) => {
                    const isSelected = item.id === selectedPosyandu?.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelectedId(item.id)}
                        className={`w-full text-left rounded-2xl p-3 transition-all duration-150 flex items-center justify-between gap-3 min-h-[66px] ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#F0FDFA] to-[#CCFBF1]/45 border-2 border-teal-600 shadow-sm'
                            : 'bg-white hover:bg-[#FAF6EE] border border-[#E8E2D5]'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div
                            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                              isSelected
                                ? 'bg-teal-600 text-white shadow-xs'
                                : 'bg-slate-50 text-slate-500 border border-slate-200/80'
                            }`}
                          >
                            <HeartHandshake className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <p
                              className={`text-[15px] font-bold truncate ${
                                isSelected ? 'text-teal-950' : 'text-slate-800'
                              }`}
                            >
                              {item.nama}
                            </p>
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 truncate">
                              <MapPin className="h-3 w-3 shrink-0 text-teal-600/80" />
                              <span className="truncate">{item.alamat}</span>
                            </p>
                          </div>
                        </div>

                        {/* Indikator Centang Bulat */}
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all ${
                            isSelected
                              ? 'bg-teal-600 text-white scale-100 shadow-xs'
                              : 'border-2 border-slate-300 bg-white text-transparent scale-90'
                          }`}
                        >
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                      </button>
                    );
                  })}

                  {filteredPosyandu.length === 0 && (
                    <div className="text-center py-6 px-4 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                      Tidak ada posyandu yang cocok dengan pencarian "{searchQuery}".
                    </div>
                  )}
                </div>

                {/* Tombol Utama Masuk ke Posyandu Terpilih */}
                <button
                  type="button"
                  onClick={handleEnter}
                  className="w-full min-h-[54px] rounded-2xl bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 active:scale-[0.99] text-white font-bold text-[16px] px-4 py-3.5 shadow-teal-cta transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <span className="truncate flex-1">Masuk ke {selectedPosyandu?.nama}</span>
                  <ArrowRight className="h-5 w-5 stroke-[2.75] flex-shrink-0" />
                </button>

                {/* Tombol Sekunder Garis Putus-putus */}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full min-h-[48px] rounded-2xl border-2 border-dashed border-[#D5CBB8] bg-[#FAF5EC]/80 hover:bg-[#F3ECE0] hover:border-teal-600/50 active:scale-[0.99] text-teal-900 font-bold text-xs px-4 py-2.5 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4 text-teal-700 stroke-[2.5]" />
                  <span>+ Daftarkan Posyandu Baru</span>
                </button>
              </div>
            )}

            {/* TAB CONTENT 2: PANDUAN KADER */}
            {activeTab === 'panduan' && (
              <div className="bg-white rounded-2xl border border-[#E8E2D5] p-4 text-xs space-y-3 text-slate-600 shadow-2xs">
                <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
                  <Info className="w-4 h-4 text-teal-600" />
                  <span>Petunjuk Operasional Kader (35+ Tahun)</span>
                </div>
                <div className="space-y-2 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p>
                      <strong>Pilih Posyandu:</strong> Pastikan memilih posyandu tempat bertugas sebelum mencatat penimbangan.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p>
                      <strong>Isolasi Data:</strong> Data anak balita di posyandu Anda tidak akan tercampur dengan posyandu lain.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p>
                      <strong>Input Cepat:</strong> Gunakan menu <em>Input Ukur</em> di bagian bawah setelah masuk ke sistem.
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Dukungan Teknis: Tim Sains Data</span>
                  <span className="font-semibold text-teal-700">Arcawinangun 2026</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Atribusi */}
          <footer className="mt-5 text-center">
            <p className="text-[12px] font-medium text-slate-500">
              Teknologi Multi-Tenant ERP Cloud • Sains Data Telkom University
            </p>
          </footer>
        </main>
      </div>

      {/* MODAL / BOTTOM SHEET: DAFTARKAN POSYANDU BARU */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/45 backdrop-blur-xs p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-register-title"
        >
          <div className="w-full max-w-[430px] rounded-t-3xl sm:rounded-3xl bg-[#FCF9F4] border border-[#E8E2D5] p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 id="modal-register-title" className="text-lg font-extrabold text-teal-950 font-serif">
                    Daftarkan Posyandu Baru
                  </h2>
                  <p className="text-xs text-slate-600">
                    Ruang kerja baru dengan isolasi data otomatis
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 hover:text-slate-800 border border-slate-200"
                aria-label="Tutup formulir"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nama Posyandu
                </label>
                <input
                  type="text"
                  value={newNama}
                  onChange={(e) => {
                    setNewNama(e.target.value);
                    setFormError('');
                  }}
                  placeholder="Contoh: Posyandu Mawar 02"
                  className="w-full min-h-[48px] rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] text-slate-800 focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Wilayah Kelurahan / Kecamatan
                </label>
                <input
                  type="text"
                  value={newAlamat}
                  onChange={(e) => {
                    setNewAlamat(e.target.value);
                    setFormError('');
                  }}
                  placeholder="Contoh: Kelurahan Sokanegara, Purwokerto Timur"
                  className="w-full min-h-[48px] rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] text-slate-800 focus:border-teal-600 focus:outline-none"
                />
              </div>

              {formError && (
                <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                  {formError}
                </p>
              )}

              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 min-h-[48px] rounded-xl border border-slate-300 bg-white font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[48px] rounded-xl bg-teal-600 hover:bg-teal-700 font-bold text-white shadow-sm"
                >
                  Simpan & Pilih
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}