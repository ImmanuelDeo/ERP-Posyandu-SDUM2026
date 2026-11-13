-- DESTRUCTIVE TEST FIXTURES: disposable staging database only. Always rollback.
-- Run as postgres after reviewed baseline + candidate migration. Synthetic data only.
BEGIN;
INSERT INTO auth.users (id) VALUES ('10000000-0000-4000-8000-000000000001');
INSERT INTO public.posyandu (id, kode, nama) VALUES
  ('20000000-0000-4000-8000-000000000001', 'RPC-TEST-A', 'Test A'),
  ('20000000-0000-4000-8000-000000000002', 'RPC-TEST-B', 'Test B');
INSERT INTO public.users (id, posyandu_id, username, nama_lengkap, role) VALUES
  ('10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'rpc-test-admin', 'Test Admin', 'admin_posyandu');
-- Fixture privileges only. Deployment grants require independent review.
GRANT USAGE ON SCHEMA public, auth TO authenticated;
GRANT SELECT ON public.users, public.posyandu, public.balita, public.pengukuran TO authenticated;
GRANT INSERT ON public.balita, public.pengukuran TO authenticated;
SELECT set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
SET LOCAL ROLE authenticated;
DO $$
DECLARE
  result jsonb;
  count_before integer;
BEGIN
  result := public.register_child_v1('20000000-0000-4000-8000-000000000001', '0000000000000001', 'Test Child', CURRENT_DATE - 60, 'L', 'Test Parent', NULL, NULL,
    jsonb_build_object('tgl', CURRENT_DATE::text, 'bb', 5, 'tb', 60, 'lk', 38, 'lila', 12));
  IF result->'child'->>'id' IS NULL OR result->'measurement'->>'balita_id' <> result->'child'->>'id' THEN
    RAISE EXCEPTION 'FAIL: atomic child/measurement linkage';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.balita WHERE id = (result->'child'->>'id')::uuid)
     OR NOT EXISTS (SELECT 1 FROM public.pengukuran WHERE balita_id = (result->'child'->>'id')::uuid) THEN
    RAISE EXCEPTION 'FAIL: database readback';
  END IF;
  BEGIN
    PERFORM public.register_child_v1('20000000-0000-4000-8000-000000000001', '0000000000000001', 'Duplicate', CURRENT_DATE - 60, 'L', 'Test Parent');
    RAISE EXCEPTION 'FAIL: duplicate accepted';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
  BEGIN
    PERFORM public.register_child_v1('20000000-0000-4000-8000-000000000002', '0000000000000002', 'Other Tenant', CURRENT_DATE - 60, 'L', 'Test Parent');
    RAISE EXCEPTION 'FAIL: other tenant accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM public.register_child_v1('20000000-0000-4000-8000-000000000001', '', 'Missing NIK', CURRENT_DATE - 60, 'L', 'Test Parent');
    RAISE EXCEPTION 'FAIL: missing NIK accepted';
  EXCEPTION WHEN invalid_parameter_value THEN NULL;
  END;
  BEGIN
    PERFORM public.register_child_v1('20000000-0000-4000-8000-000000000001', '0000000000000003', 'Bad Measure', CURRENT_DATE - 60, 'L', 'Test Parent', NULL, NULL,
      jsonb_build_object('tgl', CURRENT_DATE::text, 'bb', 'NaN', 'tb', 60, 'lk', 38, 'lila', 12));
    RAISE EXCEPTION 'FAIL: invalid measurement accepted';
  EXCEPTION WHEN invalid_parameter_value THEN NULL;
  END;
  SELECT count(*) INTO count_before FROM public.balita;
  -- Caller profile stays admin, but empty JWT must deny the call.
  PERFORM set_config('request.jwt.claim.sub', '', true);
  BEGIN
    PERFORM public.register_child_v1('20000000-0000-4000-8000-000000000001', '0000000000000004', 'No Session', CURRENT_DATE - 60, 'L', 'Test Parent');
    RAISE EXCEPTION 'FAIL: missing session accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  IF (SELECT count(*) FROM public.balita) <> 0 THEN
    RAISE EXCEPTION 'FAIL: tenant RLS without session';
  END IF;
  PERFORM set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
  IF (SELECT count(*) FROM public.balita) <> count_before THEN
    RAISE EXCEPTION 'FAIL: denied calls changed child rows';
  END IF;
END;
$$;
RESET ROLE;
-- Deny measurement insert after child INSERT to prove transaction rollback.
REVOKE INSERT ON public.pengukuran FROM authenticated;
SET LOCAL ROLE authenticated;
DO $$
BEGIN
  BEGIN
    PERFORM public.register_child_v1('20000000-0000-4000-8000-000000000001', '0000000000000005', 'Rollback Child', CURRENT_DATE - 60, 'L', 'Test Parent', NULL, NULL,
      jsonb_build_object('tgl', CURRENT_DATE::text, 'bb', 5, 'tb', 60, 'lk', 38, 'lila', 12));
    RAISE EXCEPTION 'FAIL: denied measurement insert accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  IF EXISTS (SELECT 1 FROM public.balita WHERE nik = '0000000000000005') THEN
    RAISE EXCEPTION 'FAIL: orphan child after measurement failure';
  END IF;
END;
$$;
RESET ROLE;
UPDATE public.users SET is_active = false WHERE id = '10000000-0000-4000-8000-000000000001';
SET LOCAL ROLE authenticated;
DO $$
BEGIN
  BEGIN
    PERFORM public.register_child_v1('20000000-0000-4000-8000-000000000001', '0000000000000006', 'Inactive User', CURRENT_DATE - 60, 'L', 'Test Parent');
    RAISE EXCEPTION 'FAIL: inactive profile accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END;
$$;
RESET ROLE;
DO $$
BEGIN
  IF has_function_privilege('anon', 'public.register_child_v1(uuid,text,text,date,text,text,text,text,jsonb)', 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: anon has EXECUTE';
  END IF;
END;
$$;
ROLLBACK;
