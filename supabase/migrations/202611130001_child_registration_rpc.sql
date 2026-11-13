-- Deployment candidate only; requires reviewed public.users/posyandu/balita/pengukuran.
-- Does not provision accounts, change roles/policies, or enable frontend cloud mode.
BEGIN;

-- Fail closed if baseline tables are absent. Existing objects are never replaced.
DO $$
BEGIN
  IF to_regclass('public.users') IS NULL
     OR to_regclass('public.posyandu') IS NULL
     OR to_regclass('public.balita') IS NULL
     OR to_regclass('public.pengukuran') IS NULL THEN
    RAISE EXCEPTION 'Reviewed Posyandu baseline schema required before child registration RPC';
  END IF;
END;
$$;

CREATE FUNCTION public.register_child_v1(
  p_posyandu_id uuid,
  p_nik text,
  p_nama text,
  p_tanggal_lahir date,
  p_jenis_kelamin text,
  p_nama_orang_tua text,
  p_no_telepon text DEFAULT NULL,
  p_alamat_rt_rw text DEFAULT NULL,
  p_first_measurement jsonb DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  child public.balita%ROWTYPE;
  measurement public.pengukuran%ROWTYPE;
  measured_on date;
  weight numeric;
  height numeric;
  head numeric;
  arm numeric;
  months integer;
BEGIN
  -- Server-owned profile, never user_metadata/localStorage role or tenant key.
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.users AS u
    JOIN public.posyandu AS p ON p.id = p_posyandu_id AND p.is_active IS TRUE
    WHERE u.id = auth.uid() AND u.is_active IS TRUE
      AND (u.role = 'super_admin' OR
        (u.role = 'admin_posyandu' AND u.posyandu_id = p_posyandu_id))
  ) THEN
    RAISE EXCEPTION 'Child registration not authorized' USING ERRCODE = '42501';
  END IF;

  -- Existing baseline requires NIK and limits address to 100 characters.
  -- Reject incompatible local input; never invent NIK or silently truncate PII.
  IF p_nik IS NULL OR p_nik !~ '^[0-9]{16}$'
     OR p_nama IS NULL OR char_length(btrim(p_nama)) NOT BETWEEN 2 AND 150
     OR p_nama_orang_tua IS NULL OR char_length(btrim(p_nama_orang_tua)) NOT BETWEEN 2 AND 150
     OR p_tanggal_lahir IS NULL OR NOT isfinite(p_tanggal_lahir)
     OR p_tanggal_lahir > CURRENT_DATE
     OR p_jenis_kelamin IS NULL OR p_jenis_kelamin NOT IN ('L', 'P')
     OR (p_no_telepon IS NOT NULL AND p_no_telepon <> '' AND p_no_telepon !~ '^\+?[0-9 -]{8,20}$')
     OR char_length(p_alamat_rt_rw) > 100 THEN
    RAISE EXCEPTION 'Invalid child identity or baseline field length' USING ERRCODE = '22023';
  END IF;

  IF p_first_measurement IS NOT NULL THEN
    IF jsonb_typeof(p_first_measurement) <> 'object'
       OR NOT (p_first_measurement ?& ARRAY['tgl', 'bb', 'tb', 'lk', 'lila']) THEN
      RAISE EXCEPTION 'Incomplete first measurement' USING ERRCODE = '22023';
    END IF;
    IF (p_first_measurement->>'tgl') IS NULL
       OR (p_first_measurement->>'tgl') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN
      RAISE EXCEPTION 'Invalid measurement date' USING ERRCODE = '22023';
    END IF;
    measured_on := (p_first_measurement->>'tgl')::date;
    weight := (p_first_measurement->>'bb')::numeric;
    height := (p_first_measurement->>'tb')::numeric;
    head := (p_first_measurement->>'lk')::numeric;
    arm := (p_first_measurement->>'lila')::numeric;
    IF NOT isfinite(measured_on) OR measured_on < p_tanggal_lahir OR measured_on > CURRENT_DATE
       OR weight IS NULL OR weight NOT BETWEEN 1 AND 40
       OR height IS NULL OR height NOT BETWEEN 30 AND 150
       OR head IS NULL OR head NOT BETWEEN 20 AND 65
       OR arm IS NULL OR arm NOT BETWEEN 5 AND 35 THEN
      RAISE EXCEPTION 'Invalid first measurement values' USING ERRCODE = '22023';
    END IF;
    months := (extract(year FROM measured_on)::integer - extract(year FROM p_tanggal_lahir)::integer) * 12
      + extract(month FROM measured_on)::integer - extract(month FROM p_tanggal_lahir)::integer
      - CASE WHEN extract(day FROM measured_on) < extract(day FROM p_tanggal_lahir) THEN 1 ELSE 0 END;
  END IF;

  -- Existing UNIQUE(posyandu_id, nik) remains authoritative under concurrency.
  -- No upsert: duplicate identity must not overwrite another child's record.
  INSERT INTO public.balita (
    posyandu_id, nik, nama, tanggal_lahir, jenis_kelamin,
    nama_orang_tua, no_telepon, alamat_rt_rw
  ) VALUES (
    p_posyandu_id, p_nik, btrim(p_nama), p_tanggal_lahir, p_jenis_kelamin,
    btrim(p_nama_orang_tua), nullif(p_no_telepon, ''), nullif(p_alamat_rt_rw, '')
  ) RETURNING * INTO child;

  IF p_first_measurement IS NOT NULL THEN
    INSERT INTO public.pengukuran (
      posyandu_id, balita_id, tanggal_periksa, usia_bulan,
      berat_badan, tinggi_badan, lingkar_kepala, lingkar_lengan, dicatat_oleh
    ) VALUES (
      p_posyandu_id, child.id, measured_on, months,
      weight, height, head, arm, auth.uid()
    ) RETURNING * INTO measurement;
  END IF;
  -- Both inserts share one RPC transaction; any error rolls back both.
  RETURN jsonb_build_object('child', to_jsonb(child), 'measurement',
    CASE WHEN p_first_measurement IS NULL THEN NULL ELSE to_jsonb(measurement) END);
END;
$$;

REVOKE ALL ON FUNCTION public.register_child_v1(uuid, text, text, date, text, text, text, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.register_child_v1(uuid, text, text, date, text, text, text, text, jsonb) TO authenticated;

COMMIT;
