# Architecture

## Why this shape
Next.js supports full-stack apps with Route Handlers, so one deployable app replaces a split frontend/backend. Nx keeps the codebase organized with shared libs and affected-only CI even at small scale. Supabase Postgres gives constraints, foreign keys, and row-level locking needed for approvals and auditability, **plus Row Level Security as the enforcement layer for tenant isolation** — application-code checks alone aren't sufficient in a shared-schema multi-tenant design, since one missed `WHERE organization_id = …` would leak data across tenants.

## Tenancy Model
- **Shared schema, shared database, one Supabase project.** Every tenant-scoped table carries `organization_id` (see `schema.md`).
- **One user belongs to exactly one organization.** No membership table, no org-switching UI in the MVP.
- **Signup creates an organization.** The first user becomes its `ADMIN`; all later users are invited by an existing Admin — there is no self-serve "join an existing org" path.
- **Tenant resolution:** the caller's `organization_id` lives in the Supabase JWT (`app_metadata.organization_id`), set at user-creation time and read server-side on every request — never trusted from the request body or query string.
- **Isolation is enforced twice:** Postgres RLS at the database layer (the hard boundary) and `organization_id` scoping in the data-access layer (defense in depth, and needed regardless for correct joins).

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
│     │  ├─ (auth)/                 # login, signup (org + admin creation)
│     │  ├─ (onboarding)/           # post-signup org setup, invite teammates
│     │  ├─ (dashboard)/
│     │  ├─ api/
│     │  │  ├─ organizations/       # signup, /me
│     │  │  ├─ auth/
│     │  │  ├─ users/
│     │  │  ├─ clients/
│     │  │  ├─ projects/
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
│  ├─ organizations/                 # org signup, provisioning logic
│  ├─ clients/
│  ├─ projects/
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
- **`libs/db`** always attaches the caller's Supabase session to the Prisma client, so every query runs under RLS. The service-role key (which bypasses RLS) is isolated to a narrow module used only by the auth trigger and admin maintenance scripts — application code never imports it directly.
- **`libs/organizations`** owns signup/provisioning, separate from `libs/auth` (session/claim handling only).
- **`supabase/migrations`** holds the `handle_new_auth_user` trigger and RLS policy definitions, kept distinct from `prisma/migrations` so tenant-isolation SQL is easy to audit as its own unit in review.

## Security Model
- DB access only from Server Components/Route Handlers, never the client.
- `proxy.ts` checks session presence and resolves tenant context; authorization enforced in the data access layer.
- Secure session cookies (HttpOnly, Secure, SameSite); same-origin by default, no permissive CORS.
- Least-privilege DB user, parameterized/Prisma queries, DB constraints.
- **Postgres RLS enforced from the first migration** — the load-bearing tenant boundary, not deferred hardening.
- Direct object reference to another org's resource returns **404**, not 403, to avoid confirming existence.

## Deployment & Ops
- **Host:** Vercel (Next.js) + Supabase (Postgres + Auth).
- **CI/CD:** GitHub Actions running `nx affected -t lint/test/build`; PR → preview deploy; merge to main → production deploy; `prisma migrate deploy` on release. A dedicated cross-tenant RLS test job runs separately from general `test` so a regression here is loud.
- **Env vars:** see `supabase-setup.md`.
- **Health checks:** `/api/healthz` (liveness), `/api/readyz` (DB check).
