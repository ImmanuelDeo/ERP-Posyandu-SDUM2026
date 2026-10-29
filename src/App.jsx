import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Beranda from './components/Beranda';
import BukuData from './components/BukuData';
import Perkembangan from './components/Perkembangan';
import InputUkur from './components/InputUkur';
import EnterPage from './components/EnterPage';
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

  // Onboarding & Tenant Selection Gateway
  const [isTenantSelected, setIsTenantSelected] = useState(false);

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

  // FLOW 1: ONBOARDING / PILIH & DAFTARKAN POSYANDU (WARM HUMANIST SAAS)
  if (!isTenantSelected) {
    // Transform db object into array expected by EnterPage
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
      setIsTenantSelected(true);
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
      setIsTenantSelected(true);
    };

    return (
      <EnterPage
        posyanduList={posyanduList}
        defaultSelectedId={currentTenant}
        onEnterPosyandu={handleEnterPosyandu}
        onRegisterPosyandu={handleRegisterPosyandu}
      />
    );
  }

  // FLOW 2: MAIN APLIKASI POSYANDU (FULLY RESPONSIVE MOBILE S10 & ALL DEVICES)
  const navItems = [
    { id: 'beranda', label: 'Beranda', icon: Home },
    { id: 'buku-data', label: 'Buku Data', icon: BookOpen },
    { id: 'perkembangan', label: 'Perkembangan', icon: TrendingUp },
    { id: 'input-ukur', label: 'Input Ukur', icon: PlusCircle },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800 flex flex-col overflow-x-hidden antialiased">
      {/* Top Header - Compact, Fit to Screen, Never Overflow on S10 */}
      <header className="sticky top-0 z-40 bg-posyandu-700 text-white shadow-md w-full">
        <div className="w-full px-3 sm:px-6 py-2 flex items-center justify-between gap-2">
          {/* Posyandu Active & Exit Button */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setIsTenantSelected(false)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-teal-200 transition flex-shrink-0"
              title="Keluar / Ganti Posyandu Lain"
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

          {/* Placeholder for alignment */}
          <div className="w-10" />
        </div>
      </header>

      {/* Main Content Area - Fully Fluid, No Horizontal Overflow on Samsung S10 */}
      <main id="appMainScroll" className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-3 pb-24 overflow-y-auto no-scrollbar">
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

      {/* Bottom Navigation Bar - FIXED FULL WIDTH & PROPORTIONAL (No Offside / Overflow) */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 shadow-lg w-full">
        <div className="w-full max-w-md mx-auto h-full flex items-center justify-around px-1">
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
