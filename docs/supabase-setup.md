# Supabase Setup

Concrete steps to stand up the Supabase project this platform depends on for Postgres, Auth, and tenant-isolation via RLS. See `schema.md` for the full policy/trigger SQL this doc references.

## 1. Create the project
1. Create one Supabase project (one project serves all organizations/tenants — do not create a project per org).
2. Note the project URL and keys from Project Settings → API:
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, never shipped to the client, never used for tenant-scoped reads — see below)
3. Note the connection strings from Project Settings → Database:
   - pooled connection → `DATABASE_URL`
   - direct connection → `DIRECT_URL` (used by `prisma migrate`)

## 2. Configure Auth
1. Auth → Providers: enable Email provider (password-based).
2. Auth → Settings: disable public signups if you want invite-only user creation to be the *only* path for non-admin users (Admins are still created via the app's own `/api/organizations/signup`, which uses the service-role key server-side to create the Supabase Auth user).
3. Auth → Settings → Custom Access Token Hook (or `app_metadata` on user creation): confirm `organization_id` and `role` will be attached to `app_metadata` when a user is created — this is what the JWT claim `auth.jwt() -> 'app_metadata' ->> 'organization_id'` reads at query time.

## 3. Apply the tenant-isolation SQL
Run (via `supabase/migrations`, in order):
1. `current_org_id()` function definition (see `schema.md`).
2. `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + policy creation for every tenant-scoped table: `organizations` (self-row only), `users`, `clients`, `projects`, `templates`, `workflows`, `sows`, `audit_logs`, and the join-through tables (`workflow_step`, `sow_deliverable`, `sow_milestone`, `sow_workflow`, `approval_step`) whose policies join to their parent's `organization_id`.
3. The `handle_new_auth_user` trigger on `auth.users` insert, which provisions the matching `public.users` row using the `organization_id`/`role` already present in `app_metadata`.

Verify with a smoke test: sign up two organizations, confirm each Admin's session can only query their own org's rows even when directly guessing another org's row ID.

## 4. Apply the Prisma schema
1. `npx prisma migrate deploy` (table DDL only — RLS policies live in `supabase/migrations`, not in Prisma migrations, so they're reviewed as their own auditable unit).
2. Confirm `prisma/schema.prisma` matches `schema.md`.

## 5. Env vars

**Server-only:**
- `DATABASE_URL`
- `DIRECT_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` — restricted to: the org-signup Route Handler (creates the Auth user), the auth trigger, and admin maintenance scripts. Never used for ordinary tenant-scoped reads/writes, since it bypasses RLS.
- `SESSION_SECRET`
- `APP_BASE_URL`
- `NODE_ENV`

**Client-safe:**
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_SUPPORT_EMAIL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 6. Session-scoped Prisma client
`libs/db` must construct its Prisma client using the caller's Supabase session (so Postgres evaluates RLS as that user), not the service-role connection. A single shared, unscoped connection pool that always queries as `service_role` would silently disable tenant isolation for every request — this is the most common way multi-tenant RLS setups fail in practice, so treat it as a required code-review check, not an implementation detail.

## 7. Verification checklist before shipping
- [ ] RLS is `ENABLE`d (not just policies defined — a table with policies but RLS disabled still allows unrestricted access) on every tenant-scoped table.
- [ ] `current_org_id()` returns `null` (not a stale value) for an unauthenticated/service-role connection.
- [ ] Two seeded demo orgs exist; cross-tenant integration tests pass in CI as their own job.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` does not appear in any client-side bundle or in `libs/db`'s default export path.
- [ ] Direct-ID access to another org's resource returns 404 end-to-end (API + RLS both agree — don't rely on the API layer alone to produce that behavior).
