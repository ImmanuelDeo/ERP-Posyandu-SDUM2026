import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save, AlertCircle } from 'lucide-react';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedChildId || !bb || !tb || !lk || !lila) {
      alert('Mohon isi semua field pengukuran fisik.');
      return;
    }

    const success = addMeasurement(selectedChildId, {
      tgl: examDate,
      bb: parseFloat(bb),
      tb: parseFloat(tb),
      lk: parseFloat(lk),
      lila: parseFloat(lila),
    });

    if (success) {
      setBb('');
      setTb('');
      setLk('');
      setLila('');
      if (onSuccess) onSuccess(selectedChildId);
    }
  };

  return (
    <section className="space-y-3" id="input-ukur">
      {/* Banner Informasi Kader */}
      <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-3 flex items-center gap-2 text-xs text-emerald-900 shadow-xs">
        <AlertCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <span>
          <strong>Layanan Input Timbangan Aktif:</strong> Masukkan data pengukuran fisik balita. Data langsung tersimpan dan otomatis memperbarui grafik serta komparasi perkembangan.
        </span>
      </div>

      {/* Form Input Selalu Aktif untuk Kader */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Child Selection */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
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
                {c.nama} (NIK: {c.nik.slice(-4)})
              </option>
            ))}
          </select>
        </div>

        {/* Exam Date */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
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

        {/* 4 Physical Variables (Numeric Keypad on mobile) */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
            Input Data Fisik (Keypad Numeric):
          </h3>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
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
          className="w-full h-12 bg-posyandu-700 hover:bg-posyandu-800 active:scale-[0.99] text-white font-extrabold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4 text-teal-200" />
          <span>Simpan Data Timbangan</span>
        </button>
      </form>
    </section>
  );
}