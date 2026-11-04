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
  FileDown
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function BukuData({ onSelectChild }) {
  const { getTenantData, exportToCSV, importChildren } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL');

  // State Modal Import Excel
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPreview, setImportPreview] = useState([]);
  const [importError, setImportError] = useState('');
  const [importSuccessMsg, setImportSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  const tenant = getTenantData();

  const filteredChildren = useMemo(() => {
    if (!tenant?.children) return [];
    return tenant.children.filter((child) => {
      const matchQuery =
        child.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (child.nik || '').includes(searchQuery);
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

  // Unduh Template Excel Standar
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'NIK': '3302192004240009',
        'Nama Anak': 'Rizky Pratama',
        'Jenis Kelamin': 'L',
        'Tanggal Lahir': '2024-05-10',
        'Nama Orang Tua': 'Ibu Nurul Hidayah',
        'No HP': '081234567899',
        'Alamat': 'RT 03 / RW 02',
        'BB (kg)': 9.5,
        'TB (cm)': 74.0,
        'LK (cm)': 44.0,
        'LiLA (cm)': 14.0
      },
      {
        'NIK': '3302196508240010',
        'Nama Anak': 'Salma Zafira',
        'Jenis Kelamin': 'P',
        'Tanggal Lahir': '2024-08-15',
        'Nama Orang Tua': 'Ibu Dewi Sartika',
        'No HP': '081399887766',
        'Alamat': 'RT 01 / RW 04',
        'BB (kg)': 8.2,
        'TB (cm)': 71.5,
        'LK (cm)': 43.0,
        'LiLA (cm)': 13.5
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Balita');
    XLSX.writeFile(wb, 'Template_Import_Balita_Posyandu.xlsx');
  };

  // Parsing File Excel yang Diupload
  const handleFileChange = (e) => {
    setImportError('');
    setImportSuccessMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          setImportError('File Excel kosong atau format tidak sesuai.');
          return;
        }

        // Normalisasi Kolom & Pemetaan Data
        const parsedList = [];
        const todayStr = new Date().toISOString().slice(0, 10);

        rawJson.forEach((row, idx) => {
          // Cari nama anak
          const nama = row['Nama Anak'] || row['Nama'] || row['nama_anak'] || row['nama'] || '';
          if (!nama.toString().trim()) return;

          // Cari NIK
          const nik = (row['NIK'] || row['nik'] || `3302${Date.now().toString().slice(-12)}`).toString().trim();

          // Cari Jenis Kelamin
          let gender = (row['Jenis Kelamin'] || row['Gender'] || row['JK'] || 'L').toString().toUpperCase().trim();
          if (gender.startsWith('P') || gender === 'PEREMPUAN') gender = 'P';
          else gender = 'L';

          // Tanggal Lahir & Usia Bulan
          let tglLahir = (row['Tanggal Lahir'] || row['Tgl Lahir'] || row['tgl_lahir'] || '').toString().trim();
          // Jika Excel serial date number
          if (typeof row['Tanggal Lahir'] === 'number') {
            const excelDate = new Date((row['Tanggal Lahir'] - (25567 + 2)) * 86400 * 1000);
            tglLahir = excelDate.toISOString().slice(0, 10);
          }
          if (!tglLahir) tglLahir = '2024-01-01';

          // Hitung usia bulan
          const birth = new Date(tglLahir);
          const now = new Date();
          let usiaBulan = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
          if (isNaN(usiaBulan) || usiaBulan < 0) usiaBulan = 12;

          // Parameter Fisik
          const bb = parseFloat(row['BB (kg)'] || row['BB'] || row['Berat Badan'] || 9.0) || 9.0;
          const tb = parseFloat(row['TB (cm)'] || row['TB'] || row['Tinggi Badan'] || 73.0) || 73.0;
          const lk = parseFloat(row['LK (cm)'] || row['LK'] || row['Lingkar Kepala'] || 44.0) || 44.0;
          const lila = parseFloat(row['LiLA (cm)'] || row['LiLA'] || row['LILA'] || 14.0) || 14.0;

          const namaOrtu = (row['Nama Orang Tua'] || row['Orang Tua'] || row['Ibu'] || row['nama_ortu'] || 'Ibu Balita').toString().trim();
          const telp = (row['No HP'] || row['Telp'] || row['Telepon'] || '').toString().trim();
          const alamat = (row['Alamat'] || row['RT/RW'] || 'RT 01 / RW 01').toString().trim();

          parsedList.push({
            nik,
            nama: nama.toString().trim(),
            gender,
            tglLahir,
            usiaBulan,
            namaOrtu,
            telp,
            alamat,
            bb,
            tb,
            lk,
            lila,
            history: [
              {
                tgl: todayStr,
                usia: usiaBulan,
                bb,
                tb,
                lk,
                lila
              }
            ]
          });
        });

        if (parsedList.length === 0) {
          setImportError('Tidak ditemukan baris data balita yang valid dalam file Excel.');
        } else {
          setImportPreview(parsedList);
        }
      } catch (err) {
        setImportError('Gagal membaca file Excel. Pastikan format file .xlsx atau .xls yang valid.');
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Simpan Data Terimpor ke Context
  const handleConfirmImport = () => {
    if (importPreview.length === 0) return;
    const addedCount = importChildren(importPreview);
    setImportSuccessMsg(`Berhasil mengimpor ${addedCount} data balita ke ${tenant?.title || 'Posyandu'}.`);
    setImportPreview([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setTimeout(() => {
      setShowImportModal(false);
      setImportSuccessMsg('');
    }, 1500);
  };

  return (
    <section className="p-3 space-y-3" id="buku-data">
      {/* Title & Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base font-black text-slate-900 leading-tight">Buku Data Balita</h2>
          <p className="text-[11px] text-slate-500">Stored data fisik tersimpan ala Excel</p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
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
            className="h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition"
            title="Export CSV / Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
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
                    <p className="text-[11px] text-slate-500 truncate">
                      NIK: {child.nik ? child.nik.slice(-4) : '-'} • Ortu: {child.namaOrtu}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-600">
                      <span className="font-bold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded">
                        BB: {latest.bb || child.bb || '-'} kg
                      </span>
                      <span className="font-bold text-blue-800 bg-blue-50 px-1.5 py-0.2 rounded">
                        TB: {latest.tb || child.tb || '-'} cm
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-black text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
                    {child.usiaBulan} bln
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
                  setShowImportModal(false);
                  setImportPreview([]);
                  setImportError('');
                }}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
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
                Kolom wajib: <code>Nama Anak</code>, <code>Jenis Kelamin (L/P)</code>, <code>Tanggal Lahir</code>, <code>Nama Orang Tua</code>, <code>BB (kg)</code>, <code>TB (cm)</code>, <code>LK (cm)</code>, <code>LiLA (cm)</code>.
              </p>
            </div>

            {/* File Upload Input */}
            <div className="bg-white p-4 rounded-2xl border border-dashed border-teal-300 text-center space-y-2">
              <Upload className="w-8 h-8 text-teal-600 mx-auto" />
              <div>
                <p className="text-xs font-bold text-slate-800">Pilih File Excel (.xlsx / .xls / .csv)</p>
                <p className="text-[11px] text-slate-400">Pastikan file sesuai dengan format template posyandu</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-700 file:text-white hover:file:bg-teal-800 cursor-pointer block mx-auto pt-1"
              />
            </div>

            {/* Error Message */}
            {importError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{importError}</span>
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
    </section>
  );
}
