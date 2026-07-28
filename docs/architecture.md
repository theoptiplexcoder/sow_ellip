# Architecture

## Why this shape
Next.js supports full-stack apps with Route Handlers, so one deployable app replaces a split frontend/backend. Nx keeps the codebase organized with shared libs and affected-only CI even at small scale. Supabase Postgres gives constraints, foreign keys, and row-level locking needed for approvals and auditability, **plus Row Level Security as the enforcement layer for tenant isolation** — application-code checks alone aren't sufficient in a shared-schema multi-tenant design, since one missed `WHERE organization_id = …` would leak data across tenants.

## Tenancy Model
- **Shared schema, shared database, one Supabase project.** Every tenant-scoped table carries `organization_id` (see `schema.md`).
- **One (organization) user belongs to exactly one organization.** No membership table, no org-switching UI in the MVP.
- **Signup creates a pending request, not an organization.** The `Organization` row (and its first `ADMIN` user) is only provisioned when a Super Admin approves the corresponding `OrganizationSignupRequest`; all later users are invited by an existing Admin — there is no self-serve "join an existing org" path.
- **Tenant resolution:** the caller's `organization_id` lives in the Supabase JWT (`app_metadata.organization_id`), set by the approval step (not at signup) and read server-side on every request — never trusted from the request body or query string.
- **Isolation is enforced twice:** Postgres RLS at the database layer (the hard boundary) and `organization_id` scoping in the data-access layer (defense in depth, and needed regardless for correct joins).

## Project-Level Roles (within a tenant)
- `User.role` is now just `ADMIN` / `MEMBER` — an org-wide distinction for user/org administration. `CREATOR` / `APPROVER` / `VIEWER` are no longer global: they're assigned **per project, per user** via the `ProjectMember` table (see `schema.md`), so the same person can be `CREATOR` on one project and `APPROVER` or `VIEWER` on another.
- A project's creator (its `ownerId`) is auto-assigned `CREATOR` on that project at creation time — that role functions as the project's own admin: managing its SOWs/workflows and assigning `APPROVER`/`VIEWER` to other org members on that project specifically.
- A user with no `ProjectMember` row for a project defaults to `VIEWER` there — an application-layer default, not something RLS enforces.
- This is a second, narrower authorization layer *inside* the tenant boundary, not a replacement for it: RLS still governs whether a query can see another organization's rows at all; `ProjectRole` only governs what a member can do within their own org's projects.
- Because `Workflow` is a reusable, org-scoped template (not tied to a single project), a step's approver is only checked against `ProjectMember` at `POST /api/sows/[id]/submit` — the point where a workflow is actually attached to a SOW, and therefore to a concrete project.

## Super Admin Model (outside the tenant model)
- **Not a `User`, not tied to any `organization_id`.** Modeled as its own `SuperAdmin` table (see `schema.md`) so the "one user belongs to exactly one organization" invariant above never has an exception to carve out.
- **Seeded, not self-registered.** Provisioned once at deploy time from env vars (`SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD`); no signup UI, no invite flow.
- **Scope is deliberately narrow:** read/write access only to `OrganizationSignupRequest` and its own `SuperAdminAuditLog`, plus read access to `Organization.name`/`slug`/`createdAt` for a post-approval org list. No policy, role, or route grants it access to any tenant-scoped table (`clients`, `projects`, `sows`, etc.) — approving an org is an identity decision, not an operational one, and the MVP's tenant-isolation guarantee must hold against this persona too.
- **Separate auth surface:** logs in through its own route, distinct from the org login page, so org-user session handling never has to branch on "is this a super admin."

## Approval as the Trigger for Provisioning
```
Signup form → OrganizationSignupRequest (PENDING) + Supabase Auth user (no org claim)
Super Admin approve → Organization row created
                     → app_metadata.organization_id set on the pending auth user (service role)
                     → public.users row created (role ADMIN)
                     → OrganizationSignupRequest marked APPROVED
Super Admin reject  → OrganizationSignupRequest marked REJECTED (auth user retained, never gains an org claim)
```

## Request Flow
```
Browser
  → proxy.ts            (1. confirm session exists, 2. resolve organizationId + role onto request context)
  → Route Handler        (business authorization: role check + organization check)
  → libs/db Prisma client (session-scoped, so Postgres RLS applies)
  → Postgres              (RLS policy re-verifies organization_id — the hard backstop)
```
`proxy.ts` deliberately does *not* perform business authorization itself — that stays in the data-access layer, so authorization logic lives in one place regardless of which route hits it.

## Folder Layout
```
repo/
├─ apps/
│  └─ web/
│     ├─ app/
│     │  ├─ (auth)/                 # login, signup (submits OrganizationSignupRequest)
│     │  ├─ (onboarding)/           # post-approval org setup, invite teammates
│     │  ├─ (dashboard)/
│     │  ├─ (superadmin)/           # super admin login + signup-request queue, separate shell
│     │  ├─ api/
│     │  │  ├─ organizations/       # /me (org-scoped)
│     │  │  ├─ superadmin/          # superadmin auth, signup-requests list/approve/reject
│     │  │  ├─ auth/
│     │  │  ├─ users/
│     │  │  ├─ clients/
│     │  │  ├─ projects/           # includes /[id]/members for CREATOR/APPROVER/VIEWER assignment
│     │  │  ├─ templates/
│     │  │  ├─ workflows/
│     │  │  ├─ sows/
│     │  │  ├─ approvals/
│     │  │  ├─ audit-logs/
│     │  │  ├─ healthz/
│     │  │  └─ readyz/
│     │  ├─ clients/
│     │  ├─ projects/
│     │  ├─ sows/
│     │  ├─ workflows/
│     │  └─ dashboard/
│     ├─ proxy.ts                    # session check + tenant context resolution
│     ├─ next.config.ts
│     └─ project.json
├─ libs/
│  ├─ ui/
│  ├─ auth/                         # Supabase Auth helpers, session/org claim parsing
│  ├─ db/                           # Prisma client factory, ALWAYS session-scoped
│  ├─ validation/
│  ├─ api-types/
│  ├─ organizations/                 # signup-request creation, approval/rejection provisioning
│  ├─ superadmin/                    # superadmin session/auth, restricted to signup-request scope
│  ├─ clients/
│  ├─ projects/                     # project CRUD + ProjectMember role assignment (Creator/Approver/Viewer)
│  ├─ templates/
│  ├─ sows/
│  ├─ workflows/
│  └─ audit/
├─ prisma/
│  ├─ schema.prisma
│  └─ migrations/                   # includes RLS policy SQL, not just table DDL
├─ supabase/
│  └─ migrations/                   # auth trigger, RLS policies, current_org_id()
├─ nx.json
├─ package.json
└─ tsconfig.base.json
```

### Notes
- **`libs/db`** always attaches the caller's Supabase session to the Prisma client, so every query runs under RLS. The service-role key (which bypasses RLS) is isolated to a narrow module used only by the auth trigger, the signup-approval provisioning step, and admin maintenance scripts — application code never imports it directly.
- **`libs/organizations`** owns signup-request creation and approval/rejection provisioning, separate from `libs/auth` (session/claim handling only) and `libs/superadmin` (superadmin session handling only).
- **`supabase/migrations`** holds the `handle_new_auth_user` trigger and RLS policy definitions, kept distinct from `prisma/migrations` so tenant-isolation SQL is easy to audit as its own unit in review.

## Security Model
- DB access only from Server Components/Route Handlers, never the client.
- `proxy.ts` checks session presence and resolves tenant context; authorization enforced in the data access layer.
- Secure session cookies (HttpOnly, Secure, SameSite); same-origin by default, no permissive CORS.
- Least-privilege DB user, parameterized/Prisma queries, DB constraints.
- **Postgres RLS enforced from the first migration** — the load-bearing tenant boundary, not deferred hardening.
- Direct object reference to another org's resource returns **404**, not 403, to avoid confirming existence.
- **Superadmin session is a distinct cookie/session from org-user sessions** — `proxy.ts` never resolves a `SuperAdmin` session into an `organization_id`, so a superadmin session can never accidentally satisfy an org-scoped authorization check. Superadmin routes run their own, separate session check.
- `OrganizationSignupRequest` and `SuperAdmin` tables carry no `organization_id` and are **not** covered by the tenant RLS policies — they're locked down instead to: (a) the service-role-backed superadmin route handlers, and (b) the owning `SuperAdmin` row via a superadmin-specific RLS policy, never by `current_org_id()`.

## Deployment & Ops
- **Host:** Vercel (Next.js) + Supabase (Postgres + Auth).
- **CI/CD:** GitHub Actions running `nx affected -t lint/test/build`; PR → preview deploy; merge to main → production deploy; `prisma migrate deploy` on release. A dedicated cross-tenant RLS test job runs separately from general `test` so a regression here is loud.
- **Env vars:** see `supabase-setup.md`.
- **Health checks:** `/api/healthz` (liveness), `/api/readyz` (DB check).
