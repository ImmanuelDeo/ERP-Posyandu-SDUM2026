# ERP Posyandu Terpadu — SDUM 2026

> **Status: prototipe pengembangan, bukan sistem produksi untuk data pasien.**
> Runtime saat ini menyimpan data di localStorage. Client Supabase dan SQL adalah rancangan integrasi; mengisi `.env` saja belum mengaktifkan sinkronisasi, autentikasi, atau RLS. Label RLS pada UI belum membuktikan perlindungan server.
> Kader dapat input pengukuran tanpa switch admin. Bagian role/arsitektur cloud di bawah adalah dokumentasi rencana lama, bukan fitur aktif.

## Mulai berkolaborasi

Gunakan Node.js **22.12+** (atau 24 LTS), kemudian:

```bash
git clone https://github.com/ImmanuelDeo/ERP-Posyandu-SDUM2026.git
cd ERP-Posyandu-SDUM2026
git switch develop
npm ci
npm run dev
```

- `main`: baseline yang telah lolos build; bukan jaminan aman untuk produksi.
- `develop`: integrasi tim.
- `feature/nama-fitur` dan `fix/nama-bug`: buat dari develop, lalu Pull Request ke develop.
- Review sebelum merge; jangan force-push atau commit langsung ke branch bersama.
- Sebelum PR: `npm run build` dan `npm run lint`. Lint saat baseline masih memiliki warning yang perlu diselesaikan.
- Jangan commit `.env`, token, private key, ekspor data anak, backup DB, `node_modules`, atau `dist`.
- Jangan masukkan data anak asli sebelum autentikasi, otorisasi tenant, RLS, dan backup diuji.
- Seed repository menggunakan identitas demo eksplisit. localStorage pengguna tidak ikut dipush.

## Catatan implementasi yang perlu ditinjau tim

Pendaftaran tenant dan pemilihan tenant baru perlu pengujian integrasi; perhitungan usia pengukuran, migrasi role SQL, validasi data, dan penyimpanan cloud belum siap produksi. Jangan menjalankan SQL pada database produksi tanpa review. Tes otomatis belum tersedia.

---

## Dokumentasi rancangan awal (sebagian belum diimplementasikan)


Sistem informasi posyandu berbasis web **mobile-first PWA** dengan arsitektur **multi-tenant ERP** yang memungkinkan banyak posyandu (Posyandu Arca, Melati, Mawar, dll.) beroperasi dalam satu platform terpusat dengan isolasi data ketat via **Row Level Security (RLS)** PostgreSQL.

## 🎯 Fitur Utama

### 📊 Dashboard Overview (Beranda)
- Total balita, sudah diperiksa, belum hadir, rata-rata usia
- **Donut chart perbandingan jenis kelamin** (Laki-laki/Perempuan) - **label di luar donut, tidak overlap**
- **Distribusi kelompok usia** (0-12, 13-24, 25-59 bulan) dengan progress bar horizontal
- Data updated real-time per tenant

### 📋 Buku Data Balita (Stored Data Excel-Style)
- List kartu balita rapi dengan 4 variabel fisik: **BB, TB, LK, LiLA**
- Pencarian instan (Nama / NIK) + filter gender (Semua/L/P)
- **Export CSV/Excel** 1 klik
- Tambah balita baru (khusus Admin)

### 📈 Perkembangan & Komparasi Individu (Fitur Inti)
- Profil lengkap: NIK, Nama, Tanggal Lahir, Usia, Orang Tua
- **Komparasi 2 bulan terakhir**: Selisih BB, TB, LK, LiLA dengan indikator ▲/▼
- **Grafik tren garis interaktif SVG** (BB/TB/LK/LiLA vs usia)
- Tabel riwayat pemeriksaan kronologis
- **Pilih balita via dropdown** untuk monitoring cepat

### ⚖️ Input Pengukuran Fisik (Admin Only)
- Form minimalis 4 variabel: BB (kg), TB (cm), LK (cm), LiLA (cm)
- **inputmode="decimal"** → keypad numerik otomatis di HP
- Validasi rentang fisik realistis
- Simpan → update otomatis ke grafik & komparasi

## 🔐 Multi-Tenant & Role-Based Access

| Role | Cakupan | Akses |
|------|---------|-------|
| **Super Admin** | Semua posyandu | CRUD posyandu, assign admin, monitoring global |
| **Admin Posyandu** | 1 posyandu | CRUD balita & pengukuran, kelola kader, export Excel |
| **Kader (Front Desk)** | 1 posyandu | Read-only: cari balita, lihat perkembangan, komparasi |

**Isolasi Data**: Row Level Security (RLS) PostgreSQL memastikan Posyandu A **tidak bisa melihat/akses data Posyandu B**.

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 + Vite 8 + Tailwind CSS 3 |
| **State/Auth** | React Context + localStorage (offline-first) / Supabase |
| **PWA** | vite-plugin-pwa (Workbox) - installable, offline cache |
| **Charts** | SVG Native (no heavy libs) |
| **Export** | SheetJS (xlsx) |
| **Database** | PostgreSQL (Supabase) + RLS |
| **Auth** | Supabase Auth / localStorage fallback |
| **Icons** | lucide-react |
| **Deploy** | Vercel / Netlify (static) + Supabase (DB) |

## 📱 Mobile-First UX (Kader 35+ tahun)
- Touch target **≥44px**, font **16px+**, angka **20-24px bold**
- Bottom navigation bar (4 tab) - jangkauan jempol
- **Keypad numerik otomatis** (`inputmode="decimal"`)
- Warna kontras tinggi (WCAG AA): Slate base, Teal brand, Biru (L), Pink (P)
- **PWA** → install ke homescreen tanpa Play Store, offline cache

## 🗄 Database Schema (PostgreSQL + RLS)

```sql
-- Tenant isolation via posyandu_id + RLS policies
posyandu (id, kode, nama, alamat, ...)
users (id, posyandu_id, role, ...)  -- roles: super_admin, admin_posyandu, kader
balita (id, posyandu_id, nik, nama, tgl_lahir, gender, ...)
pengukuran (id, posyandu_id, balita_id, tgl, usia, bb, tb, lk, lila, ...)

-- RLS: User hanya akses data posyandu_id miliknya
-- Super admin bypass RLS
```

## 🚀 Quick Start

### Development
```bash
git clone <repo-url>
cd erp-posyandu
npm install
npm run dev
```

### Production Build
```bash
npm run build
# Output di folder dist/ - siap deploy ke Vercel/Netlify
```

### Environment Variables (.env)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Database Setup (Supabase)
1. Jalankan `supabase_schema.sql` di Supabase SQL Editor
2. Enable RLS + Auth
3. Create users via Supabase Dashboard

## 📁 Structure
```
erp-posyandu/
├── src/
│   ├── components/
│   │   ├── Header.jsx       # Top bar + role switcher
│   │   ├── Beranda.jsx      # Dashboard + donut chart + age dist
│   │   ├── BukuData.jsx     # Excel-style list + search + export
│   │   ├── Perkembangan.jsx # Profil + komparasi + grafik SVG + log
│   │   └── InputUkur.jsx    # Admin form input fisik
│   ├── context/
│   │   └── AuthContext.jsx  # Multi-tenant state, role, CRUD
│   ├── services/
│   │   └── supabase.js      # Supabase client + localStorage fallback
│   ├── App.jsx              # Routing, tabs, frame
│   ├── main.jsx
│   └── index.css            # Tailwind + mobile frame
├── public/
│   ├── pwa-192x192.png      # PWA icons
│   └── pwa-512x512.png
├── supabase_schema.sql      # PostgreSQL DDL + RLS
├── vite.config.js           # Vite + PWA config
├── tailwind.config.js       # Custom colors (posyandu palette)
├── package.json
└── README.md
```

## 🎨 Design System (Mockup Reference)
- **Colors**: Slate base, Teal 600/700 (brand), Blue 500 (L), Pink 500 (P), Emerald (naik), Rose (turun)
- **Typography**: System UI, 16px base, numbers 20-24px bold
- **Touch targets**: min 44x44px, rounded-xl (12px)
- **Shadows**: subtle, cards elevated
- **Icons**: lucide-react (24x24 standard)

## 📦 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
# dist/ folder → Netlify drag-drop or Git integration
```

### Supabase (Production)
1. Create project → copy URL + anon key
2. Run `supabase_schema.sql` in SQL Editor
3. Enable Auth → Email/Password
4. Add users via Dashboard → assign posyandu_id + role

## 📊 Data Flow
```
Input (Admin) → addMeasurement()
    ↓
localStorage / Supabase
    ↓
AuthContext (state update)
    ↓
Perkembangan (auto-refresh grafik + komparasi)
BukuData (auto-refresh list)
Beranda (auto-refresh metrik)
```

## 🔧 Scripts
```bash
npm run dev      # Development server
npm run build    # Production build (dist/)
npm run preview  # Preview production build
npm run lint     # Oxlint
```

## 📝 License
MIT License - Open source untuk pengabdian masyarakat Posyandu Arca Purwokerto.

---

**Tim Pengembang**: Mahasiswa S1 Sains Data Universitas Telkom
**Dosen Pembimbing**: Dian Kartika Sari, S.Si., M.Pd.
**Mitra**: Posyandu Arca, Kelurahan Arcawinangun, Purwokerto Timur
