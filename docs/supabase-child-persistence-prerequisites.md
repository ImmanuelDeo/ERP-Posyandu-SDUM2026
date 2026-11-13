# Child persistence: deployment prerequisites, not active integration

## Verified scope

Runtime inspected: `AuthContext.addChild` calls `prepareChild`, optional `validateMeasurement`, then `saveLocalDB`. `src/services/supabase.js` constructs a client only when configured; this alone does not persist child records. Local success must say **saved on this device**, not saved to Supabase.

Configuration presence inspection found only `.env.example`, with no populated Supabase variables. Relevant process variables were absent. No secret values were printed. No project credentials, database connection, deployed schema, Auth users, or live policies were verified. Docker CLI exists but its engine was unavailable; no live Supabase or frontend-to-cloud test ran.

New candidate: `supabase/migrations/202611130001_child_registration_rpc.sql`. New rollback-only test: `supabase/tests/child_registration_rpc.sql`. No existing source, SQL, or README changed by this work.

## Baseline compatibility and blockers

`supabase_schema.sql` is design input, not evidence of deployment:

- Its first two `#` lines are not valid PostgreSQL comments. Operator must prepare a reviewed baseline using `--` comments; do not blindly run the README setup command.
- Baseline has UUID tenant/child IDs; local demo uses tenant keys such as `arca`. Resolve tenant UUID from trusted server profile, never cast demo keys or invent mappings.
- Baseline requires non-null NIK, unique per tenant. Candidate additionally requires exactly 16 digits; local registration permits empty NIK. Empty-NIK registrations remain local until product/schema decision provides a reviewed nullable-NIK migration. Never fabricate NIK.
- Baseline address limit is 100 characters; local validator permits 500. Candidate rejects overlong addresses, never truncates silently. Field mismatch must be shown before cloud submission or separately migrated.
- Baseline `users.role` permits only `super_admin`, `admin_posyandu`, `kader`; it has no parent account or guardian-child relationship.
- Baseline grants are unspecified. Candidate is `SECURITY INVOKER`; it needs reviewed authenticated SELECT permissions on profile/tenant/child/measurement and INSERT permissions on child/measurement, plus existing working RLS. It does not grant table access.
- Existing tenant-wide SELECT policies, inactive-user handling, helper functions with unpinned search paths, and cross-tenant measurement/child linkage require separate hardening. Existing policies can authorize direct table requests independently of this RPC. Candidate is not blanket database hardening.

Candidate creates one new function (no replacement, table changes, policy changes, or automatic account provisioning). Missing baseline tables abort transaction. Existing function name/signature collision also aborts rather than overwriting unknown deployment. Other schema drift must be reviewed and compilation tested on staging. Migration is one-time, not rerunnable.

## RPC contract for integration owner

Authenticated administrator calls `supabase.rpc('register_child_v1', payload)`:

| Argument | Source |
| --- | --- |
| `p_posyandu_id` | Trusted authorized tenant UUID |
| `p_nik`, `p_nama` | `nik`, `nama` |
| `p_tanggal_lahir`, `p_jenis_kelamin` | `tglLahir`, `gender` |
| `p_nama_orang_tua` | `namaOrtu` |
| `p_no_telepon`, `p_alamat_rt_rw` | `telp`, `alamat`, or null |
| `p_first_measurement` | `{tgl, bb, tb, lk, lila}` or null |

Function checks `auth.uid()`, active server profile, active target tenant, and administrator role; preserves RLS. It computes measurement age server-side. Optional first measurement and child INSERT share one transaction; duplicate NIK fails, never upserts another child's data. Response is `{child, measurement}`, using baseline SQL field names, not local camelCase. IDs come from database defaults. Successful response requires frontend mapping, authorized SELECT readback, and reload from server before claiming cloud persistence.

Await RPC before success notification/state mutation. Surface errors without PII or credentials. Do not silently fall back to localStorage after remote failure. Retry uncertainty needs reconciliation by tenant/NIK before another insert; duplicate errors are not proof previous request belonged to caller. Do not automatically upload local demo data, old records, or seed children. Cloud mode must not load demo seeds, mix datasets, or reuse local pseudo-auth roles.

## Parent account design: coordinated prerequisite

Do **not** add a `parent` role and reuse existing tenant-wide SELECT policies: those policies expose every child in same posyandu. Do not use NIK, child's name, birth date, or phone as password/ownership proof.

Before parent cloud access:

1. Use Supabase Auth identities with verified, administrator-approved invitation/claim flow and approved account recovery. Keep credentials out of local child rows. Local demo login is not Supabase Auth.
2. Add separately reviewed guardian-to-child relation referencing `auth.users(id)` and `balita(id)`. Only trusted administrative provisioning may create, change, or revoke relationships; parent cannot self-link by guessing ID/NIK.
3. Redesign all applicable SELECT policies on `balita`, `pengukuran`, `users`, and `posyandu`. PostgreSQL permissive policies combine with OR; adding restrictive-looking parent policy does not cancel existing tenant-wide grant. Parent sees only linked children and related measurements, not other parents/staff directory.
4. Deny parent child/measurement writes unless separately approved; staff retain scoped permissions. Server owns role, tenant, active status, and relation; never trust browser role switcher, localStorage, or editable `user_metadata`.
5. Test two tenants, two unrelated families in same tenant, multi-child family, revoked relationship, inactive accounts, anonymous access, and forged JWT/client tenant values through direct REST/RPC as well as UI.

This candidate deliberately provisions no parent accounts and grants parents no RPC permission through profile roles. Auth worker should not represent local parent registration as cloud registration.

## Deployment gate

1. Obtain authorized Supabase staging access through approved secret handling; never put service-role key in Vite variables, browser code, repository, logs, or chat. Public URL/anon key are not authorization.
2. Back up database; inspect actual tables, columns, constraints, grants, function owners, RLS, and policies against reviewed baseline. Resolve NIK/address/parent and staff-role requirements first. Confirm tenant provisioning and profile active checks.
3. Apply reviewed baseline then candidate to disposable staging. Run `supabase/tests/child_registration_rpc.sql` as postgres using a trusted SQL client with stop-on-error enabled; fixtures/privilege changes roll back. Never run test against production.
4. Run real Supabase Auth/REST checks for admin A, admin B, kader, inactive profile, inactive tenant, unauthenticated caller, and future parent identities. Check denied requests leave no rows and responses leak no other tenant data. Verify duplicate concurrent requests cannot overwrite children.
5. Implement frontend repository mapping and awaited RPC only in explicitly selected cloud mode; remove reliance on local roles/demo tenant keys. Test successful fresh-browser reload/readback and simulated network/measurement failures without false success or orphan child.
6. Agree consent, retention, backup/restore, access audit, and deletion rules before real child data. Only after staging acceptance deploy with operator approval; record deployed migration and tests, not secret values.

## Actual test evidence and limits

Candidate compiled and rollback-only SQL tests passed in temporary `@electric-sql/pglite` embedded PostgreSQL. Tests exercised inserted child/measurement readback, duplicate NIK, cross-tenant denial, missing NIK, NaN measurement denial, missing session, measurement-insert failure rollback, inactive user, and anonymous EXECUTE denial.

Harness was outside repository. It removed invalid baseline `#` lines, skipped unavailable pgcrypto extension (UUID generation built in), and supplied synthetic `auth.users` / `auth.uid()` / roles. These substitutions test SQL behavior, **not deployed Supabase Auth, actual grants/policies, network behavior, or frontend integration**. No cloud persistence claim is verified. Committed SQL test can be rerun on reviewed disposable Supabase staging; remaining gate tests above are still required.
