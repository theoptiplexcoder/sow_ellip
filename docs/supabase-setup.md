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
2. Auth → Settings: disable public signups if you want invite-only user creation to be the *only* path for non-admin users. Org Admins are never created directly by `/api/organizations/signup` — that endpoint uses the service-role key server-side to create the Supabase Auth user and an `OrganizationSignupRequest` row (status `PENDING`, no `organization_id` claim); the `public.users` row and `Organization` are only created when a Super Admin approves the request via `/api/superadmin/signup-requests/[id]/approve`.
3. Auth → Settings → Custom Access Token Hook (or `app_metadata` on user creation): confirm `organization_id` and `role` will be attached to `app_metadata` when a user is created — this is what the JWT claim `auth.jwt() -> 'app_metadata' ->> 'organization_id'` reads at query time.

## 3. Apply the tenant-isolation SQL
Run (via `supabase/migrations`, in order):
1. `current_org_id()` function definition (see `schema.md`).
2. `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + policy creation for every tenant-scoped table: `organizations` (self-row only), `users`, `clients`, `projects`, `project_member`, `templates`, `workflows`, `sows`, `audit_logs`, and the join-through tables (`workflow_step`, `sow_deliverable`, `sow_milestone`, `sow_workflow`, `approval_step`) whose policies join to their parent's `organization_id`. `project_member` carries its own `organization_id` (denormalized, like `audit_logs`), so its policy is the standard shape, not a join.
3. RLS lockdown for `organization_signup_request`, `super_admin`, and `super_admin_audit_log`: no `current_org_id()` policy applies (these tables have no `organization_id`); restrict to service-role writes and a superadmin-self-row read policy, per `schema.md`.
4. The `handle_new_auth_user` trigger on `auth.users` insert/update, which provisions the matching `public.users` row only once an `organization_id`/`role` claim is present in `app_metadata` — a no-op at initial signup, firing for real when the Super Admin approval step sets that claim (see `schema.md`).

Verify with a smoke test: submit two org signup requests, approve them as Super Admin, confirm each Admin's session can only query their own org's rows even when directly guessing another org's row ID, and confirm the Super Admin session itself cannot query either org's tenant rows.

## 3a. Seed the Super Admin
The Super Admin has no signup UI. At deploy/setup time, create its Supabase Auth user via the service role (email/password from `SUPERADMIN_EMAIL`/`SUPERADMIN_PASSWORD` env vars, no `organization_id` claim) and insert the matching `public.super_admin` row. Do this once per environment; rotate the password directly in Supabase Auth afterward if needed.

## 4. Apply the Prisma schema
1. `npx prisma migrate deploy` (table DDL only — RLS policies live in `supabase/migrations`, not in Prisma migrations, so they're reviewed as their own auditable unit).
2. Confirm `prisma/schema.prisma` matches `schema.md`.

## 5. Env vars

**Server-only:**
- `DATABASE_URL`
- `DIRECT_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` — restricted to: the org-signup Route Handler (creates the Auth user), the superadmin approve/reject Route Handlers (sets the `organization_id` claim), the auth trigger, and admin maintenance scripts. Never used for ordinary tenant-scoped reads/writes, since it bypasses RLS.
- `SESSION_SECRET`
- `SUPERADMIN_EMAIL` — used only for the one-time seed step in 3a
- `SUPERADMIN_PASSWORD` — used only for the one-time seed step in 3a
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
- [ ] Two seeded demo orgs exist (both approved via the Super Admin flow); cross-tenant integration tests pass in CI as their own job.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` does not appear in any client-side bundle or in `libs/db`'s default export path.
- [ ] Direct-ID access to another org's resource returns 404 end-to-end (API + RLS both agree — don't rely on the API layer alone to produce that behavior).
- [ ] Super Admin session cannot query any tenant-scoped table, verified by a dedicated test (not just absence of a UI path to it).
- [ ] A `PENDING` or `REJECTED` signup request's auth credential cannot obtain a session with any `organization_id` claim.
- [ ] Creating a project inserts its owner's `ProjectMember` row (role `CREATOR`) in the same transaction — no project exists without an owner who can manage it.
- [ ] A user with no `ProjectMember` row for a project can view it (implicit `VIEWER`) but cannot create/edit its SOWs or act on approvals — verified by a dedicated test, not just UI absence.
