# SOW Platform

A multi-tenant SaaS MVP for creating structured Statements of Work (SOWs), routing them through configurable sequential approval workflows, exporting print-ready PDFs, and maintaining a full audit trail — with hard tenant isolation between organizations.

## Docs Index
- `requirements.md` — personas, flows, feature list by capability area, audit event catalog
- `appflow.md` — signup → org creation → core user journey, screen-by-screen
- `phase_scope.md` — in/out of scope, sprint plan, acceptance criteria, backlog
- `architecture.md` — system architecture, tenancy model, security model, folder layout
- `schema.md` — Prisma schema, RLS policies, auth-provisioning trigger
- `data_API.md` — Route Handler API surface and example payloads
- `supabase-setup.md` — concrete steps to stand up the Supabase project (Auth, RLS, custom claims, migrations)

## Tech Stack
Next.js (App Router) · Nx workspace · Tailwind CSS · Supabase (Postgres + Auth + Row Level Security) · Vercel

## Tenancy Model (short version)
One Supabase project, one shared schema, every tenant-scoped table carries `organization_id`. A user belongs to exactly one organization. Isolation is enforced by Postgres RLS (the hard boundary) plus `organization_id` scoping in the data-access layer (defense in depth) — never by route gating alone. See `architecture.md` and `schema.md` for details.

## Local Setup (quick start)
1. `npm install`
2. Follow `supabase-setup.md` to provision the Supabase project, run migrations (including RLS policies and the auth trigger), and set env vars.
3. `npx prisma migrate deploy`
4. `nx serve web`
5. Sign up to create your first organization (`/signup`), or seed two demo orgs per `phase_scope.md`'s demo script to see isolation in action.

## Health Checks
- `GET /api/healthz` — liveness
- `GET /api/readyz` — DB connectivity check

## Status
MVP in active development. See `phase_scope.md` for the current sprint and what's explicitly deferred to post-MVP.
