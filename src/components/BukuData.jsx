// src/components/BukuData.jsx
import React, { useState, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Download,
  Upload,
  ChevronRight,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  FileDown,
  UserPlus
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { examinationRows, createWorkbook, parseWorkbook, MAX_FILE_BYTES } from '../utils/spreadsheet';

export default function BukuData({ onSelectChild }) {
  const { getTenantData, importChildren, addChild } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [monthFilter, setMonthFilter] = useState('');
  const importRequest = useRef(0);
  const importTenant = useRef(null);

  // State Modal Import Excel
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPreview, setImportPreview] = useState([]);
  const [importError, setImportError] = useState('');
  const [importSuccessMsg, setImportSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  // State Modal Registrasi Balita Baru (Identitas Tanpa Pengukuran)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIdentity, setNewIdentity] = useState({ nama: '', namaOrtu: '', tglLahir: '', gender: 'L', nik: '', telp: '', alamat: '' });
  const [addError, setAddError] = useState('');

  const tenant = getTenantData();

  const filteredRows = useMemo(() => examinationRows(tenant?.children || [], monthFilter, searchQuery, genderFilter),
    [tenant, monthFilter, searchQuery, genderFilter]);

  // Daftar balita terdaftar (satu kartu per anak), termasuk yang belum pernah ditimbang
  const childRows = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();
    return (tenant?.children || [])
      .filter(child => (genderFilter === 'ALL' || child.gender === genderFilter) &&
        (String(child.nama || '').toLowerCase().includes(search) || String(child.nik || '').includes(search)))
      .map(child => {
        const measurements = (child.history || []).filter(measurement => /^\d{4}-\d{2}-\d{2}$/.test(measurement.tgl) &&
          (!monthFilter || measurement.tgl.slice(0, 7) === monthFilter));
        return { child, measurement: measurements.at(-1) || null };
      })
      .sort((a, b) => (b.measurement?.tgl || '').localeCompare(a.measurement?.tgl || ''));
  }, [tenant, monthFilter, searchQuery, genderFilter]);

  const handleExport = () => {
    XLSX.writeFile(createWorkbook(filteredRows), `Data_Posyandu_${tenant?.id || 'data'}_${monthFilter || 'semua'}.xlsx`);
  };

  const handleDownloadTemplate = () => {
    XLSX.writeFile(createWorkbook([]), 'Template_Import_Balita_Posyandu.xlsx');
  };

  const handleAddChild = (e) => {
    e.preventDefault();
    setAddError('');
    try {
      addChild(newIdentity, null);
      setShowAddModal(false);
      setImportSuccessMsg(`Berhasil mendaftarkan ${newIdentity.nama.trim()} ke ${tenant?.title || 'Posyandu'}. Pengukuran pertama bisa diisi lewat menu Input Ukur.`);
      setNewIdentity({ nama: '', namaOrtu: '', tglLahir: '', gender: 'L', nik: '', telp: '', alamat: '' });
    } catch (error) {
      setAddError(error.message || 'Registrasi gagal. Data tidak disimpan.');
    }
  };

  const handleFileChange = async (e) => {
    setImportError('');
    setImportSuccessMsg('');
    setImportPreview([]);
    const file = e.target.files?.[0];
    const request = ++importRequest.current;
    if (!file) return;
    try {
      if (file.size > MAX_FILE_BYTES) throw new Error('Ukuran file maksimal 5 MB.');
      if (!/\.(xlsx|xls)$/i.test(file.name)) throw new Error('Pilih file .xlsx atau .xls.');
      const bytes = await file.arrayBuffer();
      if (request !== importRequest.current) return;
      const parsed = parseWorkbook(bytes, tenant?.children || []);
      setImportPreview(parsed);
      importTenant.current = tenant?.id;
    } catch (error) {
      if (request === importRequest.current) setImportError(error.message || 'Gagal membaca file Excel.');
    }
  };

  const handleConfirmImport = () => {
    if (!importPreview.length) return;
    setImportError('');
    try {
      if (importTenant.current !== tenant?.id) throw new Error('Posyandu berubah. Pilih ulang file.');
      const currentChildren = tenant?.children || [];
      if (importPreview.some(child => currentChildren.some(c => c.nik === child.nik ||
        (c.nama?.toLowerCase() === child.nama.toLowerCase() && c.tglLahir === child.tglLahir && c.namaOrtu?.toLowerCase() === child.namaOrtu.toLowerCase())))) {
        throw new Error('Data anak sudah terdaftar. Pilih ulang file; tidak ada data disimpan.');
      }
      const addedCount = importChildren(importPreview);
      if (addedCount !== importPreview.length) throw new Error('Impor gagal. Data tidak disimpan.');
      setImportSuccessMsg(`Berhasil mengimpor ${addedCount} data balita ke ${tenant?.title || 'Posyandu'}.`);
      setImportPreview([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      setImportError(error.message || 'Impor gagal. Data tidak disimpan.');
    }
  };
  return (
    <section className="p-3 space-y-3" id="buku-data">
      {/* Title & Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base font-black text-slate-900 leading-tight">Buku Data Balita</h2>
          <p className="text-[11px] text-slate-500">Riwayat pemeriksaan per bulan, dapat diekspor ke Excel</p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => { setShowAddModal(true); setAddError(''); }}
            className="h-9 px-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition"
            title="Daftarkan balita baru (identitas saja, tanpa pengukuran)"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tambah Balita</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="h-9 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs active:scale-95 transition"
            title="Import Data dari File Excel"
          >
            <Upload className="w-3.5 h-3.5 text-teal-700" />
            <span>Import Excel</span>
          </button>

          <button
            onClick={handleExport}
            disabled={!filteredRows.length}
            className="h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition"
            title="Export data pemeriksaan sesuai filter ke Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Large Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Cari nama balita atau NIK"
          placeholder="Cari Nama Balita atau NIK..."
          className="w-full h-11 pl-10 pr-3 bg-white border border-slate-200 focus:border-posyandu-600 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none shadow-xs transition"
        />
        <div className="absolute left-3 top-3 text-slate-400 pointer-events-none">
          <Search className="w-4 h-4" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <label htmlFor="examination-month" className="font-bold">Bulan pemeriksaan</label>
        <input id="examination-month" type="month" value={monthFilter} onChange={e => setMonthFilter(e.target.value)} className="border border-slate-200 rounded-lg p-2 bg-white" />
        <button type="button" onClick={() => setMonthFilter('')} className="underline">Semua bulan</button>
        <span>{filteredRows.length} pemeriksaan • {childRows.length} balita</span>
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

      {/* Child Cards List - Responsive Grid 1 / 2 / 3 Kolom */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
        {childRows.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            Tidak ada balita yang sesuai dengan filter.
          </div>
        ) : (
          childRows.map(({ child, measurement: latest }) => {
            return (
              <div
                key={child.id}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectChild?.(child.id); } }}
                onClick={() => onSelectChild && onSelectChild(child.id)}
                className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-posyandu-500 hover:shadow-sm transition cursor-pointer flex items-center justify-between gap-3 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                      child.gender === 'L'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-pink-100 text-pink-700'
                    }`}
                  >
                    {child.gender}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm text-slate-900 truncate">
                      {child.nama}
                    </h3>
                    {latest ? (
                      <p className="text-[11px] font-bold text-teal-800">{latest.tgl}</p>
                    ) : (
                      <p className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.2 inline-block mt-0.5">
                        Belum ada pemeriksaan
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500 truncate">
                      NIK: {child.nik ? child.nik.slice(-4) : '-'} • Ortu: {child.namaOrtu}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-600">
                      <span className="font-bold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded">
                        BB: {latest?.bb ?? '-'} kg
                      </span>
                      <span className="font-bold text-blue-800 bg-blue-50 px-1.5 py-0.2 rounded">
                        TB: {latest?.tb ?? '-'} cm
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-black text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
                    {child.usiaBulan ?? latest?.usia ?? '-'} bln
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL IMPORT EXCEL YANG AMAN */}
      {showImportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#FCF9F4] rounded-3xl max-w-lg w-full p-4 sm:p-5 border border-[#E8E2D5] shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-teal-950">
                    Import Data Balita dari Excel
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Tujuan: <strong>{tenant?.title || 'Posyandu Terpilih'}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  importRequest.current++;
                  setShowImportModal(false);
                  setImportPreview([]);
                  setImportError('');
                }}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center"
              >
                <X aria-label="Tutup impor" className="w-4 h-4" />
              </button>
            </div>

            {/* Panduan & Tombol Download Template */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">1. Unduh Format Template Standar:</span>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 rounded-lg font-bold text-[11px] flex items-center gap-1 transition"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download Template</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Maksimal 5 MB / 5000 baris. NIK dan No HP wajib format teks. Tanggal gunakan YYYY-MM-DD atau tanggal Excel. NIK terdaftar dan pemeriksaan duplikat ditolak; seluruh file batal bila ada kesalahan. Semua kolom template wajib (Usia Bulan opsional), termasuk <code>NIK</code>, <code>Tanggal Pemeriksaan</code>, <code>Nama Anak</code>, <code>Jenis Kelamin (L/P)</code>, <code>Tanggal Lahir</code>, <code>Nama Orang Tua</code>, <code>BB (kg)</code>, <code>TB (cm)</code>, <code>LK (cm)</code>, <code>LiLA (cm)</code>.
              </p>
            </div>

            {/* File Upload Input */}
            <div className="bg-white p-4 rounded-2xl border border-dashed border-teal-300 text-center space-y-2">
              <Upload className="w-8 h-8 text-teal-600 mx-auto" />
              <div>
                <p className="text-xs font-bold text-slate-800">Pilih File Excel (.xlsx / .xls)</p>
                <p className="text-[11px] text-slate-400">Pastikan file sesuai dengan format template posyandu</p>
              </div>
              <input
                aria-label="File Excel untuk impor"
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-700 file:text-white hover:file:bg-teal-800 cursor-pointer block mx-auto pt-1"
              />
            </div>

            {/* Error Message */}
            {importError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle aria-hidden="true" className="w-4 h-4 flex-shrink-0" />
                <span role="alert">{importError}</span>
              </div>
            )}

            {/* Success Message */}
            {importSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{importSuccessMsg}</span>
              </div>
            )}

            {/* Pratinjau Data yang Siap Diimpor */}
            {importPreview.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="font-bold text-slate-800">
                    Pratinjau Data ({importPreview.length} Balita Valid):
                  </span>
                  <span className="text-emerald-700 font-bold text-[11px]">Siap Diimpor</span>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
                  {importPreview.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-2 rounded-xl border border-slate-200 text-xs flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{item.nama}</p>
                        <p className="text-[10px] text-slate-500">
                          {item.gender === 'L' ? 'L' : 'P'} • Ortu: {item.namaOrtu} • BB: {item.bb}kg • TB: {item.tb}cm
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded">
                        {item.usiaBulan} bln
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="w-full min-h-[46px] rounded-xl bg-teal-700 hover:bg-teal-800 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition mt-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Konfirmasi & Simpan {importPreview.length} Balita ke Sistem</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL REGISTRASI BALITA BARU (IDENTITAS SAJA) */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#FCF9F4] rounded-3xl max-w-lg w-full p-4 sm:p-5 border border-[#E8E2D5] shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-teal-950">
                    Daftarkan Balita Baru
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Tujuan: <strong>{tenant?.title || 'Posyandu Terpilih'}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setShowAddModal(false); setAddError(''); }}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center"
              >
                <X aria-label="Tutup registrasi balita" className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Isi identitas balita tanpa pengukuran. Setelah terdaftar, pengukuran pertama bisa dilakukan lewat menu <strong>Input Ukur</strong>.
            </p>

            <form onSubmit={handleAddChild} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                ['nama', 'Nama lengkap anak *', 'text'],
                ['namaOrtu', 'Nama ibu / orang tua *', 'text'],
                ['tglLahir', 'Tanggal lahir *', 'date'],
                ['nik', 'NIK anak (opsional)', 'text'],
                ['telp', 'Telepon orang tua (opsional)', 'tel'],
                ['alamat', 'Alamat (opsional)', 'text']
              ].map(([key, label, type]) => (
                <label key={key} className="text-xs font-semibold space-y-1.5">
                  <span className="text-slate-700">{label}</span>
                  <input
                    type={type}
                    required={['nama', 'namaOrtu', 'tglLahir'].includes(key)}
                    maxLength={key === 'nik' ? 16 : key === 'alamat' ? 500 : 120}
                    value={newIdentity[key]}
                    onChange={(e) => setNewIdentity({ ...newIdentity, [key]: e.target.value })}
                    className="block w-full min-h-11 px-3 border border-slate-200 rounded-xl bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-posyandu-600"
                  />
                </label>
              ))}

              <label className="text-xs font-semibold space-y-1.5">
                <span className="text-slate-700">Jenis kelamin</span>
                <select
                  value={newIdentity.gender}
                  onChange={(e) => setNewIdentity({ ...newIdentity, gender: e.target.value })}
                  className="block w-full min-h-11 px-3 border border-slate-200 rounded-xl bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-posyandu-600"
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </label>

              {addError && (
                <div className="col-span-full p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle aria-hidden="true" className="w-4 h-4 flex-shrink-0" />
                  <span role="alert">{addError}</span>
                </div>
              )}

              <button
                type="submit"
                className="col-span-full w-full min-h-[46px] rounded-xl bg-teal-700 hover:bg-teal-800 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Daftarkan Balita ke Sistem</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
