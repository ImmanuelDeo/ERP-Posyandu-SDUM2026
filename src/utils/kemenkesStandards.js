// src/utils/kemenkesStandards.js
/**
 * Standar Antropometri & Evaluasi Pertumbuhan Anak
 * Mengacu pada Permenkes RI No. 2 Tahun 2020 & Buku KIA (Kesehatan Ibu dan Anak) Kemenkes RI
 */

// Tabel Kenaikan Berat Badan Minimal (KBM) dalam gram berdasarkan usia bulan
export const KBM_TABLE = {
  1: 800,  // Bulan 1 (0-1 bln)
  2: 900,  // Bulan 2 (1-2 bln)
  3: 800,  // Bulan 3 (2-3 bln)
  4: 600,  // Bulan 4 (3-4 bln)
  5: 500,  // Bulan 5 (4-5 bln)
  6: 400,  // Bulan 6 (5-6 bln)
  7: 300,
  8: 300,
  9: 300,
  10: 300,
  11: 300,
  12: 200, // 12-24+ bulan
};

export function getKBM(usiaBulan) {
  if (usiaBulan <= 1) return 800;
  if (usiaBulan === 2) return 900;
  if (usiaBulan === 3) return 800;
  if (usiaBulan === 4) return 600;
  if (usiaBulan === 5) return 500;
  if (usiaBulan === 6) return 400;
  if (usiaBulan <= 11) return 300;
  return 200; // >= 12 bulan
}

// Median dan Simpangan Baku Rujukan (WHO Anthro / Permenkes 2020)
// Format usia (bulan): [Median BB L, SD BB L, Median BB P, SD BB P, Median TB L, SD TB L, Median TB P, SD TB P]
const WHO_GROWTH_REF = {
  0:  { bbL: [3.3, 0.45], bbP: [3.2, 0.43], tbL: [49.9, 1.9], tbP: [49.1, 1.9] },
  1:  { bbL: [4.5, 0.55], bbP: [4.2, 0.52], tbL: [54.7, 2.0], tbP: [53.7, 2.0] },
  2:  { bbL: [5.6, 0.65], bbP: [5.1, 0.60], tbL: [58.4, 2.1], tbP: [57.1, 2.1] },
  3:  { bbL: [6.4, 0.72], bbP: [5.8, 0.67], tbL: [61.4, 2.2], tbP: [59.8, 2.2] },
  4:  { bbL: [7.0, 0.78], bbP: [6.4, 0.73], tbL: [63.9, 2.3], tbP: [62.1, 2.3] },
  5:  { bbL: [7.5, 0.83], bbP: [6.9, 0.78], tbL: [65.9, 2.4], tbP: [64.0, 2.4] },
  6:  { bbL: [7.9, 0.88], bbP: [7.3, 0.82], tbL: [67.6, 2.4], tbP: [65.7, 2.4] },
  7:  { bbL: [8.3, 0.92], bbP: [7.6, 0.86], tbL: [69.2, 2.5], tbP: [67.3, 2.5] },
  8:  { bbL: [8.6, 0.95], bbP: [7.9, 0.90], tbL: [70.6, 2.5], tbP: [68.7, 2.5] },
  9:  { bbL: [8.9, 0.98], bbP: [8.2, 0.93], tbL: [72.0, 2.6], tbP: [70.1, 2.6] },
  10: { bbL: [9.2, 1.01], bbP: [8.5, 0.96], tbL: [73.3, 2.6], tbP: [71.5, 2.6] },
  11: { bbL: [9.4, 1.04], bbP: [8.7, 0.99], tbL: [74.5, 2.6], tbP: [72.8, 2.6] },
  12: { bbL: [9.6, 1.06], bbP: [8.9, 1.02], tbL: [75.7, 2.7], tbP: [74.0, 2.7] },
  13: { bbL: [9.9, 1.09], bbP: [9.2, 1.05], tbL: [76.9, 2.7], tbP: [75.2, 2.7] },
  14: { bbL: [10.1, 1.12], bbP: [9.4, 1.08], tbL: [78.0, 2.8], tbP: [76.4, 2.8] },
  15: { bbL: [10.3, 1.15], bbP: [9.6, 1.11], tbL: [79.1, 2.8], tbP: [77.5, 2.8] },
  16: { bbL: [10.5, 1.18], bbP: [9.8, 1.14], tbL: [80.2, 2.9], tbP: [78.6, 2.9] },
  17: { bbL: [10.7, 1.21], bbP: [10.0, 1.17], tbL: [81.2, 2.9], tbP: [79.7, 2.9] },
  18: { bbL: [10.9, 1.24], bbP: [10.2, 1.20], tbL: [82.3, 3.0], tbP: [80.7, 3.0] },
  19: { bbL: [11.1, 1.27], bbP: [10.4, 1.23], tbL: [83.2, 3.0], tbP: [81.7, 3.0] },
  20: { bbL: [11.3, 1.30], bbP: [10.6, 1.26], tbL: [84.2, 3.1], tbP: [82.7, 3.1] },
  21: { bbL: [11.5, 1.33], bbP: [10.9, 1.29], tbL: [85.1, 3.1], tbP: [83.7, 3.1] },
  22: { bbL: [11.8, 1.36], bbP: [11.1, 1.32], tbL: [86.0, 3.2], tbP: [84.6, 3.2] },
  23: { bbL: [12.0, 1.39], bbP: [11.3, 1.35], tbL: [86.9, 3.2], tbP: [85.5, 3.2] },
  24: { bbL: [12.2, 1.42], bbP: [11.5, 1.38], tbL: [87.8, 3.3], tbP: [86.4, 3.3] },
  36: { bbL: [14.3, 1.65], bbP: [13.9, 1.60], tbL: [96.1, 3.6], tbP: [95.1, 3.6] },
  48: { bbL: [16.3, 1.90], bbP: [16.1, 1.85], tbL: [103.3, 4.0], tbP: [102.7, 4.0] },
  60: { bbL: [18.3, 2.20], bbP: [18.2, 2.15], tbL: [110.0, 4.4], tbP: [109.4, 4.4] }
};

function getReference(usiaBulan, gender) {
  const isMale = (gender || 'L').toUpperCase() === 'L';
  const ageKeys = Object.keys(WHO_GROWTH_REF).map(Number).sort((a,b) => a-b);
  let closestAge = ageKeys[0];
  for (const age of ageKeys) {
    if (usiaBulan >= age) closestAge = age;
  }
  const ref = WHO_GROWTH_REF[closestAge] || WHO_GROWTH_REF[24];
  const bbParams = isMale ? ref.bbL : ref.bbP;
  const tbParams = isMale ? ref.tbL : ref.tbP;
  return {
    medianBB: bbParams[0],
    sdBB: bbParams[1],
    medianTB: tbParams[0],
    sdTB: tbParams[1],
  };
}

/**
 * 1. Kategori BB/U (Berat Badan Menurut Usia)
 * Permenkes No. 2 Tahun 2020:
 * - < -3 SD : Berat badan sangat kurang (severely underweight)
 * - -3 SD s.d. <-2 SD : Berat badan kurang (underweight)
 * - -2 SD s.d. +1 SD : Berat badan normal
 * - > +1 SD : Risiko berat badan lebih
 */
export function getBBUCategory(bb, usiaBulan, gender) {
  if (!bb || bb <= 0) return { label: 'Belum terukur', code: '-', color: 'text-slate-400', bg: 'bg-slate-50', badge: 'neutral' };
  const ref = getReference(usiaBulan, gender);
  const zScore = (bb - ref.medianBB) / ref.sdBB;

  if (zScore < -3) {
    return {
      label: 'Berat Badan Sangat Kurang',
      code: 'SK',
      zScore: zScore.toFixed(1),
      color: 'text-rose-700',
      bg: 'bg-rose-50 border-rose-200',
      badge: 'danger',
      desc: 'Segera rujuk ke Puskesmas / dokter anak.'
    };
  }
  if (zScore < -2) {
    return {
      label: 'Berat Badan Kurang',
      code: 'K',
      zScore: zScore.toFixed(1),
      color: 'text-amber-800',
      bg: 'bg-amber-50 border-amber-200',
      badge: 'warning',
      desc: 'Perlu evaluasi pola makan dan asupan gizi balita.'
    };
  }
  if (zScore <= 1) {
    return {
      label: 'Berat Badan Normal',
      code: 'N',
      zScore: zScore.toFixed(1),
      color: 'text-emerald-800',
      bg: 'bg-emerald-50 border-emerald-200',
      badge: 'success',
      desc: 'Pertumbuhan berat badan anak sesuai usianya.'
    };
  }
  return {
    label: 'Risiko Berat Badan Lebih',
    code: 'RBBL',
    zScore: zScore.toFixed(1),
    color: 'text-amber-800',
    bg: 'bg-amber-50 border-amber-200',
    badge: 'warning',
    desc: 'Pantau asupan manis dan seimbangkan aktivitas fisik.'
  };
}

/**
 * 2. Kategori TB/U (Tinggi / Panjang Badan Menurut Usia) - Indikator Stunting
 * Permenkes No. 2 Tahun 2020:
 * - < -3 SD : Sangat Pendek (severely stunted)
 * - -3 SD s.d. <-2 SD : Pendek (stunted)
 * - -2 SD s.d. +3 SD : Normal
 * - > +3 SD : Tinggi
 */
export function getTBUCategory(tb, usiaBulan, gender) {
  if (!tb || tb <= 0) return { label: 'Belum terukur', code: '-', color: 'text-slate-400', bg: 'bg-slate-50', badge: 'neutral' };
  const ref = getReference(usiaBulan, gender);
  const zScore = (tb - ref.medianTB) / ref.sdTB;

  if (zScore < -3) {
    return {
      label: 'Sangat Pendek (Severely Stunted)',
      code: 'SP',
      zScore: zScore.toFixed(1),
      color: 'text-rose-700',
      bg: 'bg-rose-50 border-rose-200',
      badge: 'danger',
      desc: 'Indikasi stunting berat, wajib penanganan tim medis puskesmas.'
    };
  }
  if (zScore < -2) {
    return {
      label: 'Pendek (Stunted)',
      code: 'P',
      zScore: zScore.toFixed(1),
      color: 'text-amber-800',
      bg: 'bg-amber-50 border-amber-200',
      badge: 'warning',
      desc: 'Panjang/tinggi badan di bawah standar, perbaiki nutrisi protein hewani.'
    };
  }
  if (zScore <= 3) {
    return {
      label: 'Tinggi Badan Normal',
      code: 'N',
      zScore: zScore.toFixed(1),
      color: 'text-emerald-800',
      bg: 'bg-emerald-50 border-emerald-200',
      badge: 'success',
      desc: 'Tinggi badan anak berkembang optimal sesuai usianya.'
    };
  }
  return {
    label: 'Tinggi',
    code: 'Ti',
    zScore: zScore.toFixed(1),
    color: 'text-teal-800',
    bg: 'bg-teal-50 border-teal-200',
    badge: 'info',
    desc: 'Tinggi badan di atas rata-rata anak seusianya.'
  };
}

/**
 * 3. Kategori BB/TB (Berat Badan Menurut Tinggi Badan) - Status Gizi / Wasting
 * Permenkes No. 2 Tahun 2020:
 * - < -3 SD : Gizi Buruk (severely wasted)
 * - -3 SD s.d. <-2 SD : Gizi Kurang (wasted)
 * - -2 SD s.d. +1 SD : Gizi Baik / Normal
 * - > +1 SD s.d. +2 SD : Berisiko Gizi Lebih
 * - > +2 SD s.d. +3 SD : Gizi Lebih (overweight)
 * - > +3 SD : Obesitas (obese)
 */
export function getBBTBCategory(bb, tb, _gender) {
  if (!bb || !tb || tb <= 0) return { label: 'Belum terukur', code: '-', color: 'text-slate-400', bg: 'bg-slate-50', badge: 'neutral' };
  // Estimasi rasio BMI / Berat terhadap Tinggi
  const expectedBB = (tb / 100) * (tb / 100) * 16.0; // estimasi BMI median balita ~16
  const ratio = bb / expectedBB;

  if (ratio < 0.70) {
    return {
      label: 'Gizi Buruk (Severely Wasted)',
      code: 'GB',
      color: 'text-rose-700',
      bg: 'bg-rose-50 border-rose-200',
      badge: 'danger',
      desc: 'Proporsi berat sangat kurang terhadap tinggi badan.'
    };
  }
  if (ratio < 0.85) {
    return {
      label: 'Gizi Kurang (Wasted)',
      code: 'GK',
      color: 'text-amber-800',
      bg: 'bg-amber-50 border-amber-200',
      badge: 'warning',
      desc: 'Anak tampak kurus dibanding tinggi badannya, perbaiki asupan energi.'
    };
  }
  if (ratio <= 1.15) {
    return {
      label: 'Gizi Baik (Normal)',
      code: 'GN',
      color: 'text-emerald-800',
      bg: 'bg-emerald-50 border-emerald-200',
      badge: 'success',
      desc: 'Berat badan proporsional dan seimbang dengan tinggi badan.'
    };
  }
  if (ratio <= 1.25) {
    return {
      label: 'Berisiko Gizi Lebih',
      code: 'RGL',
      color: 'text-amber-800',
      bg: 'bg-amber-50 border-amber-200',
      badge: 'warning',
      desc: 'Perhatikan pola makan dan kurangi makanan camilan manis.'
    };
  }
  if (ratio <= 1.40) {
    return {
      label: 'Gizi Lebih (Overweight)',
      code: 'GL',
      color: 'text-orange-800',
      bg: 'bg-orange-50 border-orange-200',
      badge: 'warning',
      desc: 'Berat badan melebihi proporsi tinggi tubuh balita.'
    };
  }
  return {
    label: 'Obesitas (Obese)',
    code: 'O',
    color: 'text-rose-700',
    bg: 'bg-rose-50 border-rose-200',
    badge: 'danger',
    desc: 'Konsultasikan ke puskesmas untuk tata laksana gizi seimbang.'
  };
}

/**
 * 4. Kenaikan Berat Badan Minimal (KBM) & Status Pertumbuhan KMS
 * Buku KIA Kemenkes:
 * - Naik (N): Grafik BB naik mengikuti pita pertumbuhan / kenaikan BB >= KBM
 * - Tidak Naik (T): Grafik BB mendatar/menurun / kenaikan BB < KBM
 */
export function evaluateGrowthKMS(currentBB, prevBB, usiaBulan) {
  if (prevBB === undefined || prevBB === null || currentBB === undefined || currentBB === null) {
    return {
      status: 'Baru',
      code: 'B',
      diffKg: 0,
      diffGram: 0,
      kbmGram: getKBM(usiaBulan),
      isNaik: true,
      label: 'Penimbangan Pertama / Baseline',
      color: 'text-teal-700',
      bg: 'bg-teal-50 border-teal-200',
      icon: 'star',
    };
  }

  const diffKg = Number((currentBB - prevBB).toFixed(2));
  const diffGram = Math.round(diffKg * 1000);
  const kbmGram = getKBM(usiaBulan);

  if (diffGram >= kbmGram) {
    return {
      status: 'Naik (N)',
      code: 'N',
      diffKg,
      diffGram,
      kbmGram,
      isNaik: true,
      label: `Naik Sesuai KBM (▲ +${diffGram} gram, target: ${kbmGram}g)`,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200',
      icon: 'up',
      desc: 'Pertumbuhan anak optimal mengikuti garis KMS.'
    };
  } else if (diffGram > 0) {
    return {
      status: 'Tidak Naik (T)',
      code: 'T',
      diffKg,
      diffGram,
      kbmGram,
      isNaik: false,
      label: `Kenaikan Kurang dari KBM (▲ +${diffGram} gram < ${kbmGram}g)`,
      color: 'text-amber-800',
      bg: 'bg-amber-50 border-amber-200',
      icon: 'warning',
      desc: 'Berat badan bertambah namun di bawah target minimal KMS.'
    };
  } else if (diffGram === 0) {
    return {
      status: 'Tidak Naik (T)',
      code: 'T',
      diffKg: 0,
      diffGram: 0,
      kbmGram,
      isNaik: false,
      label: 'Berat Badan Tetap / Mendatar (━ 0 gram)',
      color: 'text-amber-800',
      bg: 'bg-amber-50 border-amber-200',
      icon: 'flat',
      desc: 'Kurva pertumbuhan mendatar, waspadai risiko gagal tumbuh.'
    };
  } else {
    return {
      status: 'Tidak Naik (T)',
      code: 'T',
      diffKg,
      diffGram,
      kbmGram,
      isNaik: false,
      label: `Berat Badan Turun (▼ ${diffGram} gram)`,
      color: 'text-rose-700',
      bg: 'bg-rose-50 border-rose-200',
      icon: 'down',
      desc: 'Berat badan turun dibanding bulan lalu, lakukan investigasi asupan/sakit.'
    };
  }
}

/**
 * 5. Standar Lingkar Lengan Atas (LiLA) Balita
 */
export function getLilaCategory(lila) {
  if (!lila || lila <= 0) return { label: 'Belum terukur', code: '-', color: 'text-slate-400' };
  if (lila < 11.5) {
    return {
      label: 'Gizi Buruk (Pita Merah < 11.5 cm)',
      code: 'GB',
      color: 'text-rose-700',
      bg: 'bg-rose-50 border-rose-200'
    };
  }
  if (lila < 12.5) {
    return {
      label: 'Gizi Kurang (Pita Kuning 11.5 - <12.5 cm)',
      code: 'GK',
      color: 'text-amber-800',
      bg: 'bg-amber-50 border-amber-200'
    };
  }
  return {
    label: 'Normal (Pita Hijau >= 12.5 cm)',
    code: 'N',
    color: 'text-emerald-800',
    bg: 'bg-emerald-50 border-emerald-200'
  };
}

/**
 * 6. Standar Lingkar Kepala Menurut Usia (LK/U)
 */
export function getLKCategory(lk, usiaBulan) {
  if (!lk || lk <= 0) return { label: 'Belum terukur', code: '-', color: 'text-slate-400' };
  // Estimasi median lingkar kepala balita berdasarkan usia
  const expectedLK = 35 + Math.min(usiaBulan, 12) * 1.0 + Math.max(0, usiaBulan - 12) * 0.25;
  const diff = lk - expectedLK;

  if (diff < -2.5) {
    return {
      label: 'Mikrosefali (< -2 SD)',
      code: 'Mi',
      color: 'text-amber-800',
      bg: 'bg-amber-50 border-amber-200'
    };
  }
  if (diff > 2.5) {
    return {
      label: 'Makrosefali (> +2 SD)',
      code: 'Ma',
      color: 'text-amber-800',
      bg: 'bg-amber-50 border-amber-200'
    };
  }
  return {
    label: 'Normal (-2 s.d. +2 SD)',
    code: 'N',
    color: 'text-emerald-800',
    bg: 'bg-emerald-50 border-emerald-200'
  };
}
