// src/App.jsx
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Beranda from './components/Beranda';
import BukuData from './components/BukuData';
import Perkembangan from './components/Perkembangan';
import InputUkur from './components/InputUkur';
import EnterPage from './components/EnterPage';
import LoginPage from './components/LoginPage';
import PortalOrtu from './components/PortalOrtu';
import { Home, BookOpen, TrendingUp, PlusCircle, LogOut } from 'lucide-react';

function AppContent() {
  const {
    initialized,
    switchTenant,
    currentTenant,
    db,
    addTenant
  } = useAuth();

  const [activeTab, setActiveTab] = useState('beranda');
  const [childIdForPerkembangan, setChildIdForPerkembangan] = useState(null);

  // Alur Autentikasi & Routing:
  // 1. 'welcome'       : Halaman Awal Sambutan (Hanya ada tombol Mulai Sekarang)
  // 2. 'login'         : Pilihan Login Admin vs Login Orang Tua
  // 3. 'tenant_select' : Khusus Admin -> Pemilihan Stand/Cabang Posyandu
  // 4. 'app'           : Khusus Admin -> Dashboard Operasional Posyandu
  // 5. 'ortu'          : Khusus Ortu  -> Langsung ke Interface Data Anaknya (Sinkron Real-Time)
  const [screen, setScreen] = useState('welcome');
  const [ortuSession, setOrtuSession] = useState(null); // { childId, tenantId, fallbackChild, fallbackTenant }

  const tenant = db?.[currentTenant];

  const handleSelectChild = (childId) => {
    setChildIdForPerkembangan(childId);
    setActiveTab('perkembangan');
  };

  const handleAddNewChild = () => {
    setActiveTab('input-ukur');
  };

  const handleInputSuccess = (childId) => {
    setChildIdForPerkembangan(childId);
    setActiveTab('perkembangan');
  };

  // 1. Callback Login Admin Berhasil -> Arahkan ke Pemilihan Posyandu / Stand
  const handleAdminLoginSuccess = () => {
    setScreen('tenant_select');
  };

  // 2. Callback Login Orang Tua Berhasil -> Langsung ke Interface Data Anaknya (Sinkron ke DB)
  const handleOrtuLoginSuccess = (matchedChild, matchedTenant) => {
    setOrtuSession({
      childId: matchedChild.id,
      tenantId: matchedTenant.id,
      fallbackChild: matchedChild,
      fallbackTenant: matchedTenant
    });
    setScreen('ortu');
  };

  const handleLogout = () => {
    setScreen('welcome');
    setOrtuSession(null);
  };

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <div className="w-10 h-10 border-4 border-posyandu-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Memuat sistem ERP Posyandu...</span>
        </div>
      </div>
    );
  }

  // TAMPILAN A: PORTAL KHUSUS ORANG TUA (SINKRON TERHUBUNG DENGAN DATA ADMIN)
  if (screen === 'ortu' && ortuSession) {
    // Ambil data reaktif teranyar dari db agar perubahan timbangan oleh admin otomatis sinkron
    const liveTenant = db?.[ortuSession.tenantId] || ortuSession.fallbackTenant;
    const liveChild =
      liveTenant?.children?.find((c) => c.id === ortuSession.childId) ||
      ortuSession.fallbackChild;

    return (
      <PortalOrtu
        child={liveChild}
        tenant={liveTenant}
        onLogout={handleLogout}
      />
    );
  }

  // TAMPILAN B: HALAMAN LOGIN TERPADU (ADMIN VS ORANG TUA)
  if (screen === 'login') {
    return (
      <LoginPage
        onAdminLoginSuccess={handleAdminLoginSuccess}
        onOrtuLoginSuccess={handleOrtuLoginSuccess}
        onBackToWelcome={() => setScreen('welcome')}
      />
    );
  }

  // TAMPILAN C1: WELCOME SCREEN (STEP 1 - HANYA TOMBOL MULAI SEKARANG)
  if (screen === 'welcome') {
    return (
      <EnterPage
        posyanduList={[]}
        onOpenLogin={() => setScreen('login')}
      />
    );
  }

  // TAMPILAN C2: PEMILIHAN POSYANDU / STAND (KHUSUS ADMIN SETELAH LOGIN)
  if (screen === 'tenant_select') {
    const posyanduList = db
      ? Object.entries(db).map(([key, item]) => ({
          id: key,
          kode: `POS-${key.toUpperCase().slice(0, 4)}`,
          nama: item.title,
          alamat: item.district || 'Kabupaten Banyumas',
          jumlahBalita: item.children?.length || 0,
        }))
      : [];

    const handleEnterPosyandu = (selectedItem) => {
      if (selectedItem?.id) {
        switchTenant(selectedItem.id);
      }
      setScreen('app');
    };

    const handleRegisterPosyandu = (createdItem) => {
      const key = createdItem.nama.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20) || `pos-${Date.now()}`;
      const createdKey = addTenant({
        id: key,
        title: createdItem.nama,
        district: createdItem.alamat || 'Kabupaten Banyumas',
        children: []
      });
      switchTenant(createdKey);
      setScreen('app');
    };

    return (
      <EnterPage
        initialStep={2}
        posyanduList={posyanduList}
        defaultSelectedId={currentTenant}
        onEnterPosyandu={handleEnterPosyandu}
        onRegisterPosyandu={handleRegisterPosyandu}
        onBackToWelcome={() => setScreen('login')}
      />
    );
  }

  // TAMPILAN D: DASHBOARD UTAMA OPERASIONAL POSYANDU (ADMIN / KADER)
  const navItems = [
    { id: 'beranda', label: 'Beranda', icon: Home },
    { id: 'buku-data', label: 'Buku Data', icon: BookOpen },
    { id: 'perkembangan', label: 'Perkembangan', icon: TrendingUp },
    { id: 'input-ukur', label: 'Input Ukur', icon: PlusCircle },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800 flex flex-col overflow-x-hidden antialiased">
      {/* Top Header - Responsif Melebar di Tablet & Desktop */}
      <header className="sticky top-0 z-40 bg-posyandu-700 text-white shadow-md w-full">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 sm:gap-6">
          {/* Posyandu Active & Switch Stand Button */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setScreen('tenant_select')}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-teal-200 transition flex-shrink-0"
              title="Ganti Stand Posyandu"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-xs sm:text-sm tracking-tight truncate leading-tight">
                  {tenant?.title || 'Posyandu ERP'}
                </h1>
                <span className="bg-teal-500/30 text-teal-100 text-[8px] font-extrabold px-1.5 py-0.2 rounded border border-white/20 flex-shrink-0">
                  ERP
                </span>
              </div>
              <p className="text-[10px] text-teal-100/80 truncate leading-none mt-0.5">
                {tenant?.district || 'Kabupaten Banyumas'}
              </p>
            </div>
          </div>

          {/* Badge Petugas & Tombol Logout ke Layar Awal */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-teal-100 bg-white/10 border border-white/20 px-2.5 py-1 rounded-lg">
              Admin Posyandu
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-teal-100 text-xs font-bold transition flex items-center gap-1"
              title="Keluar / Logout Akun"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="appMainScroll" className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 pb-32 overflow-y-auto no-scrollbar">
        {activeTab === 'beranda' && <Beranda />}
        {activeTab === 'buku-data' && (
          <BukuData
            onSelectChild={handleSelectChild}
            onAddNewChild={handleAddNewChild}
          />
        )}
        {activeTab === 'perkembangan' && (
          <Perkembangan initialChildId={childIdForPerkembangan} />
        )}
        {activeTab === 'input-ukur' && (
          <InputUkur onSuccess={handleInputSuccess} />
        )}
      </main>

      {/* Bottom Navigation Bar - Full Width di Mobile, Floating Capsule Elegan di Tablet & Laptop */}
      <nav className="fixed bottom-0 sm:bottom-5 left-0 right-0 sm:left-auto sm:right-auto sm:inset-x-0 sm:max-w-lg sm:mx-auto h-16 sm:h-15 bg-white/95 sm:bg-white/90 backdrop-blur-md border-t sm:border border-slate-200/90 sm:rounded-2xl z-40 shadow-lg sm:shadow-xl w-full flex items-center">
        <div className="w-full h-full flex items-center justify-around px-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex-1 h-full flex flex-col items-center justify-center transition-all ${
                  isActive ? 'text-posyandu-700 font-bold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className={`p-1 rounded-xl transition ${isActive ? 'bg-teal-50 text-posyandu-700' : ''}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 leading-none">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
