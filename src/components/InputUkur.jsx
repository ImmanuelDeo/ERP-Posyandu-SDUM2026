// src/components/InputUkur.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save, AlertCircle, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { ageInMonths } from '../utils/childRecords';
import StandarKesehatanCard from './StandarKesehatanCard';

/**
 * Komponen Form Input Pemeriksaan Fisik Balita
 * - Setiap abis update data penimbangan dan pengecekan, memunculkan modal/section
 *   Grouping Kategori Standar Kesehatan Anak (Permenkes No. 2/2020) & indikator naik-turun.
 */
export default function InputUkur({ onSuccess }) {
  const { getTenantData, addMeasurement } = useAuth();
  const tenant = getTenantData();

  const [selectedChildId, setSelectedChildId] = useState(
    tenant?.children?.[0]?.id || ''
  );
  const [examDate, setExamDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [bb, setBb] = useState('');
  const [tb, setTb] = useState('');
  const [lk, setLk] = useState('');
  const [lila, setLila] = useState('');

  const [error, setError] = useState('');

  // State Modal Hasil Pemeriksaan Baru
  const [showResultModal, setShowResultModal] = useState(false);
  const [savedMeasurement, setSavedMeasurement] = useState(null);
  const [savedPrevMeasurement, setSavedPrevMeasurement] = useState(null);
  const [savedChild, setSavedChild] = useState(null);

  if (!tenant?.children?.length) {
    return (
      <section className="max-w-4xl w-full mx-auto space-y-4" id="input-ukur">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
          Belum ada balita terdaftar. Daftarkan balita baru terlebih dahulu lewat menu <strong className="text-teal-800">Buku Data</strong>.
        </div>
      </section>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    try {
    if (!selectedChildId || !bb || !tb || !lk || !lila) {
      alert('Mohon isi semua field pengukuran fisik.');
      return;
    }

    const currentChild = tenant?.children?.find((c) => c.id === selectedChildId);
    if (!currentChild) throw new Error('Balita tidak ditemukan.');
    const lastHistory = currentChild?.history?.[currentChild.history.length - 1] || null;

    const newMeas = {
      tgl: examDate,
      bb: parseFloat(bb),
      tb: parseFloat(tb),
      lk: parseFloat(lk),
      lila: parseFloat(lila),
      usia: ageInMonths(currentChild.tglLahir, examDate)
    };

    const success = addMeasurement(selectedChildId, newMeas);
    if (!success) throw new Error('Data tidak berhasil disimpan.');

    if (success) {
      setSavedChild(currentChild);
      setSelectedChildId(currentChild.id);
      setSavedMeasurement(newMeas);
      setSavedPrevMeasurement(lastHistory);
      setShowResultModal(true);

      // Reset form
      setBb('');
      setTb('');
      setLk('');
      setLila('');
    }
    } catch (err) { setError(err.message || 'Penyimpanan gagal. Data belum disimpan.'); }
  };

  const handleCloseModal = () => {
    setShowResultModal(false);
    if (onSuccess && savedChild) {
      onSuccess(savedChild.id);
    }
  };

  return (
    <section className="max-w-4xl w-full mx-auto space-y-4" id="input-ukur">
      {/* Banner Informasi Kader */}
      <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-3 flex items-center gap-2 text-xs text-emerald-900 shadow-xs">
        <AlertCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <span>
          <strong>Layanan Input Timbangan Aktif:</strong> Masukkan data pengukuran fisik balita. Sistem akan otomatis mengelompokkan kategori standar kesehatan anak sesuai Buku KIA Kemenkes RI.
        </span>
      </div>

      <div className="flex gap-3">
        <span className="min-h-12 px-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-sm font-bold flex items-center gap-2">
          Pemeriksaan Balita Terdaftar
        </span>
      </div>
      {error && <p role="alert" className="p-3 rounded-xl bg-rose-50 text-rose-800 text-sm">{error}</p>}
      {/* Form Input Selalu Aktif untuk Kader */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Child Selection & Exam Date - Responsive Grid 2 Kolom di Tablet/Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider">
              Pilih Nama Balita:
            </label>
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              required
              className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:outline-none focus:border-posyandu-600"
            >
              {tenant?.children?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nama} (NIK: {c.nik ? c.nik.slice(-4) : '-'}) • {c.gender === 'L' ? 'L' : 'P'}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Date */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider">
              Tanggal Penimbangan:
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              required
              className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:outline-none focus:border-posyandu-600"
            />
          </div>
        </div>

        {/* 4 Physical Variables (Numeric Keypad on mobile) */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
            Input Data Fisik (Keypad Numeric):
          </h3>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                Berat Badan (kg)
              </label>
              <input
                type="number"
                step="0.05"
                min="1"
                max="40"
                placeholder="Contoh: 10.4"
                inputMode="decimal"
                value={bb}
                onChange={(e) => setBb(e.target.value)}
                required
                className="w-full h-12 px-3 bg-slate-50 border border-slate-200 focus:border-posyandu-600 rounded-xl font-black text-lg text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                Tinggi Badan (cm)
              </label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="150"
                placeholder="Contoh: 81.5"
                inputMode="decimal"
                value={tb}
                onChange={(e) => setTb(e.target.value)}
                required
                className="w-full h-12 px-3 bg-slate-50 border border-slate-200 focus:border-posyandu-600 rounded-xl font-black text-lg text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                Lingkar Kepala (cm)
              </label>
              <input
                type="number"
                step="0.1"
                min="20"
                max="65"
                placeholder="Contoh: 46.2"
                inputMode="decimal"
                value={lk}
                onChange={(e) => setLk(e.target.value)}
                required
                className="w-full h-12 px-3 bg-slate-50 border border-slate-200 focus:border-posyandu-600 rounded-xl font-black text-lg text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                Lingkar Lengan (cm)
              </label>
              <input
                type="number"
                step="0.1"
                min="5"
                max="35"
                placeholder="Contoh: 15.0"
                inputMode="decimal"
                value={lila}
                onChange={(e) => setLila(e.target.value)}
                required
                className="w-full h-12 px-3 bg-slate-50 border border-slate-200 focus:border-posyandu-600 rounded-xl font-black text-lg text-slate-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full min-h-[50px] bg-posyandu-700 hover:bg-posyandu-800 active:scale-[0.99] text-white font-extrabold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4 text-teal-200" />
          <span>Simpan Data & Cek Standar Kesehatan</span>
        </button>
      </form>

      {/* MODAL HASIL CEK STANDAR KESEHATAN ANAK SETIAP ABIS UPDATE DATA */}
      {showResultModal && savedMeasurement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#FCF9F4] rounded-3xl max-w-lg w-full p-4 sm:p-5 border border-[#E8E2D5] shadow-2xl space-y-3.5 my-auto max-h-[90vh] overflow-y-auto no-scrollbar">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-teal-950">
                    Hasil Analisis Standar Kesehatan Anak
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Data tersimpan pada perangkat ini untuk ananda <strong>{savedChild?.nama}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Standar Kesehatan Card Component */}
            <StandarKesehatanCard
              child={savedChild}
              currentMeasurement={savedMeasurement}
              prevMeasurement={savedPrevMeasurement}
            />

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 min-h-[46px] rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <span>Lihat Grafik Perkembangan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
