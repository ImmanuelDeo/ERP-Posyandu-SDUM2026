# Skema Database PostgreSQL + Multi-Tenant RLS (Supabase)
# Project: ERP Posyandu Arca & Multi-Tenant

-- 1. Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Master Table: Posyandu (Tenant)
CREATE TABLE IF NOT EXISTS public.posyandu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode VARCHAR(30) UNIQUE NOT NULL,
  nama VARCHAR(150) NOT NULL,
  alamat TEXT,
  kelurahan VARCHAR(100),
  kecamatan VARCHAR(100),
  kabupaten VARCHAR(100) DEFAULT 'Banyumas',
  telepon_kordinator VARCHAR(30),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Users Table (Linked to Auth & Posyandu Tenant)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  posyandu_id UUID REFERENCES public.posyandu(id) ON DELETE CASCADE,
  username VARCHAR(60) UNIQUE NOT NULL,
  nama_lengkap VARCHAR(150) NOT NULL,
  role VARCHAR(30) NOT NULL CHECK (role IN ('super_admin', 'admin_posyandu', 'kader')),
  no_hp VARCHAR(30),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Balita Master Table (Excel-like stored data)
CREATE TABLE IF NOT EXISTS public.balita (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  posyandu_id UUID NOT NULL REFERENCES public.posyandu(id) ON DELETE CASCADE,
  nik VARCHAR(16) NOT NULL,
  nama VARCHAR(150) NOT NULL,
  tanggal_lahir DATE NOT NULL,
  jenis_kelamin CHAR(1) NOT NULL CHECK (jenis_kelamin IN ('L', 'P')),
  nama_orang_tua VARCHAR(150) NOT NULL,
  no_telepon VARCHAR(30),
  alamat_rt_rw VARCHAR(100),
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(posyandu_id, nik)
);

-- 5. Pengukuran Table (Automated physical records)
CREATE TABLE IF NOT EXISTS public.pengukuran (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  posyandu_id UUID NOT NULL REFERENCES public.posyandu(id) ON DELETE CASCADE,
  balita_id UUID NOT NULL REFERENCES public.balita(id) ON DELETE CASCADE,
  tanggal_periksa DATE NOT NULL DEFAULT CURRENT_DATE,
  usia_bulan INT NOT NULL,
  berat_badan NUMERIC(5,2) NOT NULL,     -- kg
  tinggi_badan NUMERIC(5,2) NOT NULL,    -- cm
  lingkar_kepala NUMERIC(5,2) NOT NULL,  -- cm
  lingkar_lengan NUMERIC(5,2) NOT NULL,  -- cm
  catatan TEXT,
  dicatat_oleh UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for Fast Query on Mobile
CREATE INDEX IF NOT EXISTS idx_balita_posyandu ON public.balita(posyandu_id);
CREATE INDEX IF NOT EXISTS idx_balita_nama ON public.balita(posyandu_id, nama);
CREATE INDEX IF NOT EXISTS idx_balita_nik ON public.balita(posyandu_id, nik);
CREATE INDEX IF NOT EXISTS idx_pengukuran_balita ON public.pengukuran(balita_id, tanggal_periksa DESC);
CREATE INDEX IF NOT EXISTS idx_pengukuran_posyandu ON public.pengukuran(posyandu_id, tanggal_periksa DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.posyandu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balita ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengukuran ENABLE ROW LEVEL SECURITY;

-- Helper Function: Get Active User Posyandu ID
CREATE OR REPLACE FUNCTION public.get_auth_posyandu_id()
RETURNS UUID AS $$
  SELECT posyandu_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper Function: Get Active User Role
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS VARCHAR AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- RLS POLICIES FOR POSYANDU
CREATE POLICY "Super admin can view all posyandu" ON public.posyandu
  FOR ALL USING (public.get_auth_user_role() = 'super_admin');

CREATE POLICY "Users can view their own posyandu" ON public.posyandu
  FOR SELECT USING (id = public.get_auth_posyandu_id());

-- RLS POLICIES FOR USERS
CREATE POLICY "Users view profile in same posyandu" ON public.users
  FOR SELECT USING (
    public.get_auth_user_role() = 'super_admin' OR
    posyandu_id = public.get_auth_posyandu_id()
  );

-- RLS POLICIES FOR BALITA (Strict Isolation)
CREATE POLICY "Select balita within tenant" ON public.balita
  FOR SELECT USING (
    public.get_auth_user_role() = 'super_admin' OR
    posyandu_id = public.get_auth_posyandu_id()
  );

CREATE POLICY "Admin write balita within tenant" ON public.balita
  FOR INSERT WITH CHECK (
    public.get_auth_user_role() IN ('super_admin', 'admin_posyandu') AND
    (posyandu_id = public.get_auth_posyandu_id() OR public.get_auth_user_role() = 'super_admin')
  );

CREATE POLICY "Admin update balita within tenant" ON public.balita
  FOR UPDATE USING (
    public.get_auth_user_role() IN ('super_admin', 'admin_posyandu') AND
    posyandu_id = public.get_auth_posyandu_id()
  );

CREATE POLICY "Admin delete balita within tenant" ON public.balita
  FOR DELETE USING (
    public.get_auth_user_role() IN ('super_admin', 'admin_posyandu') AND
    posyandu_id = public.get_auth_posyandu_id()
  );

-- RLS POLICIES FOR PENGUKURAN
CREATE POLICY "Select pengukuran within tenant" ON public.pengukuran
  FOR SELECT USING (
    public.get_auth_user_role() = 'super_admin' OR
    posyandu_id = public.get_auth_posyandu_id()
  );

CREATE POLICY "Admin insert pengukuran within tenant" ON public.pengukuran
  FOR INSERT WITH CHECK (
    public.get_auth_user_role() IN ('super_admin', 'admin_posyandu') AND
    posyandu_id = public.get_auth_posyandu_id()
  );

CREATE POLICY "Admin update pengukuran within tenant" ON public.pengukuran
  FOR UPDATE USING (
    public.get_auth_user_role() IN ('super_admin', 'admin_posyandu') AND
    posyandu_id = public.get_auth_posyandu_id()
  );

CREATE POLICY "Admin delete pengukuran within tenant" ON public.pengukuran
  FOR DELETE USING (
    public.get_auth_user_role() IN ('super_admin', 'admin_posyandu') AND
    posyandu_id = public.get_auth_posyandu_id()
  );
