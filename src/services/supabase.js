// Supabase Client and Multi-Tenant Storage Layer
import { createClient } from '@supabase/supabase-js';

// Environment variables or fallback to local demo/offline mode
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Initial Seeds for Offline / Standalone Demo Mode (Multi-Tenant)
const INITIAL_TENANTS = {
  arca: {
    id: "arca",
    title: "Posyandu Arca",
    district: "Kelurahan Arcawinangun, Purwokerto Timur",
    children: [
      {
        id: "arca-001",
        nik: "DEMO-0001",
        nama: "Anak Demo 01",
        gender: "L",
        tglLahir: "2024-04-14",
        usiaBulan: 18,
        namaOrtu: "Orang Tua Demo 01",
        telp: "",
        alamat: "Alamat contoh (bukan data pasien)",
        history: [
          { tgl: "2024-05-14", usia: 1, bb: 4.1, tb: 54.0, lk: 37.0, lila: 11.0 },
          { tgl: "2024-07-14", usia: 3, bb: 5.8, tb: 60.5, lk: 40.2, lila: 12.2 },
          { tgl: "2024-10-14", usia: 6, bb: 7.6, tb: 67.2, lk: 42.8, lila: 13.5 },
          { tgl: "2025-02-14", usia: 10, bb: 8.9, tb: 73.0, lk: 44.5, lila: 14.1 },
          { tgl: "2026-09-14", usia: 17, bb: 10.0, tb: 80.0, lk: 46.0, lila: 14.7 },
          { tgl: "2026-10-17", usia: 18, bb: 10.4, tb: 81.5, lk: 46.2, lila: 15.0 },
        ]
      },
      {
        id: "arca-002",
        nik: "DEMO-0002",
        nama: "Anak Demo 02",
        gender: "P",
        tglLahir: "2024-08-25",
        usiaBulan: 14,
        namaOrtu: "Orang Tua Demo 02",
        telp: "",
        alamat: "RT 01 / RW 04",
        history: [
          { tgl: "2024-09-25", usia: 1, bb: 3.8, tb: 52.0, lk: 36.5, lila: 10.8 },
          { tgl: "2024-12-25", usia: 4, bb: 5.9, tb: 61.0, lk: 40.0, lila: 12.5 },
          { tgl: "2025-06-25", usia: 10, bb: 8.0, tb: 71.5, lk: 43.8, lila: 13.8 },
          { tgl: "2026-09-17", usia: 13, bb: 8.8, tb: 75.0, lk: 44.8, lila: 14.2 },
          { tgl: "2026-10-17", usia: 14, bb: 9.1, tb: 76.2, lk: 45.1, lila: 14.5 },
        ]
      },
      {
        id: "arca-003",
        nik: "DEMO-0003",
        nama: "Anak Demo 03",
        gender: "L",
        tglLahir: "2025-01-10",
        usiaBulan: 9,
        namaOrtu: "Orang Tua Demo 03",
        telp: "",
        alamat: "RT 03 / RW 04",
        history: [
          { tgl: "2025-02-10", usia: 1, bb: 4.2, tb: 53.5, lk: 37.2, lila: 11.2 },
          { tgl: "2025-05-10", usia: 4, bb: 6.4, tb: 63.0, lk: 41.0, lila: 13.0 },
          { tgl: "2025-08-10", usia: 7, bb: 7.9, tb: 69.0, lk: 43.2, lila: 13.9 },
          { tgl: "2026-10-17", usia: 9, bb: 8.5, tb: 72.0, lk: 44.2, lila: 14.2 },
        ]
      },
      {
        id: "arca-004",
        nik: "DEMO-0004",
        nama: "Anak Demo 04",
        gender: "P",
        tglLahir: "2024-11-05",
        usiaBulan: 11,
        namaOrtu: "Orang Tua Demo 04",
        telp: "",
        alamat: "Alamat contoh (bukan data pasien)",
        history: [
          { tgl: "2024-12-05", usia: 1, bb: 3.9, tb: 52.8, lk: 36.8, lila: 11.0 },
          { tgl: "2025-03-05", usia: 4, bb: 6.1, tb: 62.0, lk: 40.5, lila: 12.8 },
          { tgl: "2026-10-17", usia: 11, bb: 8.4, tb: 71.5, lk: 43.5, lila: 13.8 },
        ]
      }
    ]
  },
  melati: {
    id: "melati",
    title: "Posyandu Melati 01",
    district: "Kecamatan Purwokerto Barat",
    children: [
      {
        id: "melati-001",
        nik: "DEMO-0005",
        nama: "Anak Demo 05",
        gender: "L",
        tglLahir: "2024-03-12",
        usiaBulan: 19,
        namaOrtu: "Orang Tua Demo 05",
        telp: "",
        alamat: "RT 01 / RW 02",
        history: [
          { tgl: "2024-04-12", usia: 1, bb: 4.0, tb: 53.0, lk: 37.0, lila: 11.0 },
          { tgl: "2024-07-12", usia: 4, bb: 6.3, tb: 63.5, lk: 41.2, lila: 13.1 },
          { tgl: "2024-12-12", usia: 9, bb: 8.6, tb: 72.0, lk: 44.0, lila: 14.3 },
          { tgl: "2026-10-17", usia: 19, bb: 11.0, tb: 83.0, lk: 47.0, lila: 15.5 },
        ]
      },
      {
        id: "melati-002",
        nik: "DEMO-0006",
        nama: "Anak Demo 06",
        gender: "P",
        tglLahir: "2024-09-15",
        usiaBulan: 13,
        namaOrtu: "Orang Tua Demo 06",
        telp: "",
        alamat: "RT 04 / RW 02",
        history: [
          { tgl: "2024-10-15", usia: 1, bb: 3.7, tb: 51.5, lk: 36.0, lila: 10.7 },
          { tgl: "2025-01-15", usia: 4, bb: 5.8, tb: 60.5, lk: 39.8, lila: 12.4 },
          { tgl: "2026-10-17", usia: 13, bb: 8.7, tb: 74.0, lk: 44.3, lila: 14.1 },
        ]
      }
    ]
  }
};

const STORAGE_KEY = 'erp_posyandu_multi_tenant_data_v1';

export function loadLocalDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Data lokal tidak dapat dibaca; salinan lama tidak ditimpa.', err);
    throw new Error('Data tersimpan tidak dapat dibaca. Hubungi pengelola sebelum melanjutkan.');
  }
  saveLocalDB(INITIAL_TENANTS);
  return INITIAL_TENANTS;
}

export function saveLocalDB(data) {
  // Throw on quota/permission errors so callers never report a false success.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
