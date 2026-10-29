import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Download, ChevronRight, Plus } from 'lucide-react';

export default function BukuData({ onSelectChild, onAddNewChild }) {
  const { getTenantData, exportToCSV, currentRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL');

  const tenant = getTenantData();

  const filteredChildren = useMemo(() => {
    if (!tenant?.children) return [];
    return tenant.children.filter((child) => {
      const matchQuery =
        child.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        child.nik.includes(searchQuery);
      const matchGender =
        genderFilter === 'ALL' || child.gender === genderFilter;
      return matchQuery && matchGender;
    });
  }, [tenant, searchQuery, genderFilter]);

  const handleExport = () => {
    const csv = exportToCSV();
    if (!csv) return;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Data_Posyandu_${tenant?.id?.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <section className="p-3 space-y-3" id="buku-data">
      {/* Title & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-900 leading-tight">Buku Data Balita</h2>
          <p className="text-[11px] text-slate-500">Stored data fisik tersimpan ala Excel</p>
        </div>
        <div className="flex items-center gap-1.5">
          {currentRole === 'admin' && (
            <button
              onClick={onAddNewChild}
              className="h-9 px-2.5 bg-posyandu-700 hover:bg-posyandu-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          )}
          <button
            onClick={handleExport}
            className="h-9 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition"
            title="Export CSV / Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Large Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari Nama Balita atau NIK..."
          className="w-full h-11 pl-10 pr-3 bg-white border border-slate-200 focus:border-posyandu-600 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none shadow-xs transition"
        />
        <div className="absolute left-3 top-3 text-slate-400 pointer-events-none">
          <Search className="w-4 h-4" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs font-bold no-scrollbar">
        <button
          onClick={() => setGenderFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
            genderFilter === 'ALL'
              ? 'bg-posyandu-700 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Semua ({tenant?.children?.length || 0})
        </button>
        <button
          onClick={() => setGenderFilter('L')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
            genderFilter === 'L'
              ? 'bg-posyandu-700 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Laki-laki ({tenant?.children?.filter(c => c.gender === 'L').length || 0})
        </button>
        <button
          onClick={() => setGenderFilter('P')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
            genderFilter === 'P'
              ? 'bg-posyandu-700 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Perempuan ({tenant?.children?.filter(c => c.gender === 'P').length || 0})
        </button>
      </div>

      {/* Child Cards List */}
      <div className="space-y-2 pt-1">
        {filteredChildren.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            Tidak ada balita yang sesuai dengan pencarian.
          </div>
        ) : (
          filteredChildren.map((child) => {
            const latest = child.history[child.history.length - 1] || {};
            return (
              <div
                key={child.id}
                onClick={() => onSelectChild(child.id)}
                className="bg-white p-3 rounded-2xl border border-slate-200/90 hover:border-posyandu-600 active:scale-[0.99] transition shadow-xs cursor-pointer space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                          child.gender === 'L'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-pink-100 text-pink-700'
                        }`}
                      >
                        {child.gender}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                        {child.nama}
                      </h4>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      NIK: {child.nik}
                    </p>
                  </div>
                  <span className="text-[10px] font-black text-posyandu-700 bg-posyandu-50 px-2 py-0.5 rounded-lg border border-posyandu-100">
                    {child.usiaBulan} bln
                  </span>
                </div>

                {/* Physical Stored Data Preview */}
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 grid grid-cols-4 gap-1 text-center">
                  <div>
                    <span className="text-[9px] text-slate-400 block font-semibold">BB</span>
                    <span className="text-xs font-black text-slate-800">{latest.bb || '-'} kg</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block font-semibold">TB</span>
                    <span className="text-xs font-black text-slate-800">{latest.tb || '-'} cm</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block font-semibold">LK</span>
                    <span className="text-xs font-black text-slate-800">{latest.lk || '-'} cm</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block font-semibold">LiLA</span>
                    <span className="text-xs font-black text-slate-800">{latest.lila || '-'} cm</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                  <span>
                    Ortu: <strong className="text-slate-700">{child.namaOrtu}</strong>
                  </span>
                  <span className="text-posyandu-700 font-bold flex items-center gap-0.5">
                    Lihat Tren & Komparasi <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}