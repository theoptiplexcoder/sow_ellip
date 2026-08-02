# Tech Stack: Statement of Work (SOW) Platform

**Source:** PRD.md (MVP Specification, v1.0), reconciled with a proposed expanded stack
**Target scale:** 10–50 tenants (first 6–12 months)

---

## 0. Review Notes — how this version differs from the raw proposal

Before adopting the expanded proposal wholesale, four points needed reconciling against the PRD:

1. **Missing DOCX → PDF conversion step.** The proposal's DOCX section (docxtemplater/PizZip/Mammoth) only covers _populating_ a DOCX from placeholders — it never addresses converting that DOCX to PDF. The PRD's Inngest pipeline (§5.10, step 4) explicitly requires this, and it's the entire reason a self-hosted LibreOffice/Gotenberg container exists in the architecture. **Reinstated** in this version.
2. **Email/notifications are out of scope for MVP.** The proposal includes Resend + React Email as first-class stack items. The PRD explicitly lists "Email/Slack/Teams notifications" under §10 _Explicitly Out of Scope for MVP_. **Moved to a "Deferred to v2" section**, not the MVP stack.
3. **Generic multi-provider Postgres vs. Supabase-specific.** The proposal genericizes the database to "any PostgreSQL provider" and storage to "any S3-compatible provider." This is good hygiene (no vendor lock-in, provider swapped behind one interface), but the PRD's concrete MVP choice is Supabase Postgres + Supabase Storage. **Kept Supabase as the MVP choice**, with the abstraction layer preserved underneath so a future swap stays cheap.
4. **Trigger.dev offered as an alternative to Inngest.** The PRD already locks in Inngest specifically (§2, §8). **Kept Inngest as the committed choice**; Trigger.dev noted only as a documented alternative, not an open decision.

Everything else in the proposal (Prisma, docx-editor.dev/RJSF/dnd-kit, TanStack Table/Query, Zustand, Recharts, Pino, Sentry, Vitest/Testing Library/Playwright, pnpm, GitHub Actions) is additive detail that doesn't conflict with the PRD and has been folded in below.

---

## 1. Application Layer

| Component        | Choice                      | Why                                                      |
| ---------------- | --------------------------- | -------------------------------------------------------- |
| Framework        | **Next.js 16 (App Router)** | Full-stack React: SSR, Server Actions, Route Handlers    |
| UI library       | **React 19**                | Modern React ecosystem                                   |
| Language         | **TypeScript**              | End-to-end type safety, client + server                  |
| Monorepo tooling | **Nx**                      | Shared libraries, scalable workspace organization        |
| Package manager  | **pnpm**                    | Fast installs, strong workspace/monorepo support with Nx |
| Hosting          | **Vercel**                  | Serverless deployment target for the Next.js app         |

**Backend layer:** No separate Express/NestJS service. The app is full-stack via Next.js Route Handlers, Server Actions, and React Server Components — sufficient for MVP scope.

### Nx monorepo layout

```
apps/
  web/                  # The Next.js application

libs/
  auth/                 # Better Auth integration
  permissions/          # RBAC / permission definitions
  database/             # Prisma client, query layer
  storage/              # Storage-provider abstraction
  tenants/              # Tenant management
  users/                # Users & RBAC
  clients/              # Client records
  projects/             # Project records
  templates/             # Structured + DOCX templates
  sow/                  # SOW authoring & revisions
  workflow/             # Workflow builder & execution
  audit/                # Audit logging
  dashboard/            # Role-tailored dashboards
  validation/           # Shared Zod schemas
  ui/                   # Shared UI components (shadcn/ui-based)
  shared/               # Cross-cutting utilities/types

prisma/
  schema.prisma
  migrations/
  seed.ts
```

**Rationale:** Vercel's serverless functions have no persistent binary environment, which rules out running LibreOffice (or any long-lived native binary) directly in the app tier — this is the reason DOCX→PDF conversion is pushed out to a separate always-on service (see §6).

---

## 2. Styling & UI

| Component                | Choice                                                           | Why                                                                                                                                                         |
| ------------------------ | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Styling                  | **Tailwind CSS v4**                                              | Fast, utility-first UI development                                                                                                                          |
| Component library        | **shadcn/ui**                                                    | Accessible, customizable, not overly opinionated                                                                                                            |
| Primitives               | **Radix UI**                                                     | Accessibility foundation used by shadcn/ui                                                                                                                  |
| Icons                    | **Lucide React**                                                 | Lightweight, consistent icon set                                                                                                                            |
| Forms                    | **React Hook Form**                                              | High-performance form state                                                                                                                                 |
| Validation               | **Zod**                                                          | Shared client/server validation, also feeds OpenAPI generation                                                                                              |
| Tables                   | **TanStack Table**                                               | Sorting, filtering, pagination, virtualization — for SOW lists, users, clients, audit logs                                                                  |
| Drag & drop              | **dnd-kit**                                                      | Reordering workflow steps and structured-form fields                                                                                                        |
| Charts                   | **Recharts**                                                     | Dashboard visuals: approval counts, status breakdowns, workflow duration                                                                                    |
| Workflow diagram preview | **@xyflow/react** (React Flow)                                   | Read-only node/edge diagram rendering of a workflow template's ordered steps, so Tenant Admins can visually preview the approval sequence while building it |
| Client state             | **TanStack Query** (server cache) + **Zustand** (local UI state) | Avoids Redux; clear split between server-derived and UI-only state                                                                                          |
| Dates                    | **date-fns**                                                     | Avoid Moment.js                                                                                                                                             |

### Structured document editing

SOWs are structured data, not free-form Word documents, so rich-text tooling is scoped narrowly:

| Component                                      | Purpose                                                                                                 |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **docx-editor.dev** (`@docx-editor.dev/react`) | In-app live editing of rich text only within specific sections that need it (Scope, Assumptions, Notes) |
| **react-jsonschema-form (RJSF)**               | Dynamic structured forms driven by template field/placeholder definitions                               |

docx-editor.dev is deliberately _not_ used for the whole document — structured fields stay structured, matching the PRD's principle that "structured SOW data is always the source of truth." It's an open-source (Apache 2.0), client-side WYSIWYG editor that parses OOXML directly and edits round-trip back to `.docx` — no server-side conversion needed for the live editing experience itself, and it ships tracked-changes/comment primitives (ProseMirror-based under the hood) that Tiptap would have required bespoke work to build.

**Integration note:** docx-editor.dev's `DocxEditor` component takes a `.docx` file as an `ArrayBuffer`, not raw HTML/JSON, since it operates on the canonical OOXML document rather than a plain rich-text tree. For the scoped free-text sections (Scope, Assumptions, Notes), each field's content is persisted as its own small `.docx` buffer (stored as a `bytea`/base64 blob alongside the structured SOW row, not as a separate file in Supabase Storage) rather than as ProseMirror JSON. This keeps the "structured data is the source of truth" principle intact — the buffer is opaque rich-text content for one field, not the SOW's canonical representation — while giving format-accurate round-tripping if that content is ever pulled into the generated DOCX output.

---

## 3. Data Layer

| Component           | Choice                                                                                      | Details                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Database            | **PostgreSQL**, via **Supabase Postgres** for MVP                                           | Single source of persistence for all application data                                   |
| ORM                 | **Prisma**                                                                                  | Strong TypeScript support, mature migration tooling, provider-agnostic Postgres support |
| Connection strategy | **Pooled connections (transaction mode)**                                                   | Used for all app-level queries                                                          |
| Migrations          | **Direct connection** (via Prisma Migrate)                                                  | Kept separate from the pooled runtime path                                              |
| File/object storage | **Storage abstracted behind one interface**; **Supabase Storage** as the MVP implementation | Attachments, uploaded DOCX templates, generated DOCX/PDF outputs                        |

**Provider portability:** Because Prisma targets plain PostgreSQL (no database-specific SQL), the same schema runs against Supabase, Neon, Amazon RDS, Railway, Azure Database for PostgreSQL, or Google Cloud SQL without rewrites — Supabase is simply the concrete MVP choice from the PRD. Storage follows the same pattern: PostgreSQL only ever holds storage _metadata_, never file bytes, and the storage interface can point at Supabase Storage, S3, Cloudflare R2, or MinIO without touching application code.

**Rationale for pooling:** Serverless functions open a new DB connection per invocation, so pooling isn't optional at this architecture — Supabase's built-in pooler absorbs this without requiring separate pooling infrastructure (e.g., PgBouncer) to be stood up by hand.

### Postgres extensions

| Extension                      | Purpose                                         |
| ------------------------------ | ----------------------------------------------- |
| `uuid-ossp`                    | UUID generation                                 |
| `pgcrypto`                     | Cryptographic functions                         |
| `citext`                       | Case-insensitive text (e.g., emails)            |
| `pg_trgm`                      | Trigram indexing for `ILIKE` search performance |
| `unaccent` _(optional, later)_ | Accent-insensitive search                       |

### Multi-tenancy in the data layer

- Every business table carries a `tenant_id`.
- Tenant scoping is enforced at the Prisma/query-builder layer — never left to UI-level filtering alone — so cross-tenant access isn't possible even by omission.

### Database modules

```
core        tenants, users, roles, permissions
crm         clients, projects
templates   templates, template_versions
sow         sows, sow_revisions
workflow    workflows, workflow_versions, workflow_steps,
            workflow_instances, workflow_instance_steps
audit       audit_logs
storage     attachments
```

### Search

Basic `ILIKE` queries backed by `pg_trgm`/GIN indexes are sufficient at this scale — no Elasticsearch, no Meilisearch (matches PRD §10 explicitly excluding Elasticsearch-based search).

---

## 4. Authentication & Authorization

| Component           | Choice                                                     | Details                                                        |
| ------------------- | ---------------------------------------------------------- | -------------------------------------------------------------- |
| Auth library        | **Better Auth**                                            | Session-based, first-class Next.js support, PostgreSQL adapter |
| Session model       | Session-based                                              | Protected routes, session expiry, seeded demo users            |
| Auth features       | Email/password, password reset, invite users, role support |                                                                |
| Authorization model | **Permission-based RBAC**                                  | Not hardcoded role checks                                      |

### Authorization flow

```
Role → Permissions → Middleware → Server Action → Database mutation
```

Example permissions: `client:create`, `client:update`, `project:create`, `template:create`, `workflow:create`, `workflow:approve`, `workflow:reject`, `audit:view`, `user:manage`.

**Design principle:** Roles are flexible collections of permissions. Application logic should never contain a literal `if role == Admin` check — authorization is enforced on every mutation, not just at the route level.

---

## 5. DOCX Processing

| Component                             | Purpose                                                                                      |
| ------------------------------------- | -------------------------------------------------------------------------------------------- |
| **docxtemplater** (or docx-templates) | Read placeholders from uploaded DOCX templates; populate a new DOCX from structured SOW data |
| **PizZip**                            | Underlying ZIP/XML handling used internally by docxtemplater                                 |
| **Mammoth** _(optional)_              | DOCX → HTML preview, for showing an approximate rendering in-app                             |

This layer only produces a populated `.docx` file — it does **not** produce a PDF. PDF conversion is handled separately (§6), since no JS-only library reliably reproduces Word's layout engine for print-accurate output.

---

## 6. Background Jobs & Document Pipeline

| Component                 | Choice                                           | Details                                                           |
| ------------------------- | ------------------------------------------------ | ----------------------------------------------------------------- |
| Job orchestration         | **Inngest**                                      | Durable, retryable multi-step workflows                           |
| DOCX → PDF conversion     | **Self-hosted LibreOffice via Gotenberg**        | Deployed on **Fly.io or Render** as an always-on container        |
| Structured SOW PDF export | **Print-optimized HTML + browser "Save as PDF"** | No server-side rendering needed; independent of Inngest/Gotenberg |

**Alternative considered:** Trigger.dev offers similar durable-job semantics; Inngest is the committed choice per the PRD's locked architecture, not an open decision.

### Why Inngest

The DOCX pipeline is multi-step, and each step can fail independently (e.g., the conversion service times out mid-request). Inngest provides durable, independently retryable steps instead of hand-rolled retry logic inside a single request/response cycle. A failure at the PDF-conversion step does not require re-running the extract/populate/generate-DOCX steps.

### Workflow diagram preview

When a Tenant Admin builds or reviews a Workflow template, the ordered sequence of steps is rendered as a read-only flow diagram (linear chain of step nodes, in order) using **@xyflow/react** (React Flow), rather than only a list/table view. This is purely a presentation layer over the existing `Workflow → Workflow Version → Workflow Steps` model — no new persistence is introduced; node positions and edges are derived on the client from step order each render, not stored. Lives alongside the dnd-kit-based reorder UI in `libs/workflow`, reusing shared UI primitives from `libs/ui`.

### Document generation pipeline steps

1. **Extract** — read structured SOW revision data
2. **Populate** — fill DOCX placeholders (if a DOCX template is attached) using structured data, via docxtemplater
3. **Generate DOCX** — produce the filled `.docx`, store in Supabase Storage
4. **Convert to PDF** — call the self-hosted LibreOffice/Gotenberg service over HTTP; store resulting PDF in Supabase Storage
5. **Audit log** — record each step's completion/failure with metadata

### Why LibreOffice/Gotenberg is a separate service

Vercel's serverless functions cannot run LibreOffice natively — it requires a persistent container, not a stateless function invocation. This is deployed independently (Fly.io/Render, Dockerized) and reached over HTTP from the Inngest-orchestrated job.

### Independent print path

The structured SOW can always be exported via a print-optimized HTML page (`/sows/[id]/print`) using the browser's native "Save as PDF." This path has **no dependency** on Inngest, Gotenberg, or LibreOffice, and remains available even if the DOCX pipeline is degraded or down.

### Non-notification uses of background jobs

Scoped to document generation and housekeeping for MVP: exports, nightly cleanup. (Reminder/notification emails are deferred — see §10.)

---

## 7. Audit Logging

Append-only. Every state-changing mutation creates an immutable record.

Fields captured: `actor`, `entity`, `before` state, `after` state, `timestamp`, `metadata` (stored as **PostgreSQL JSONB**).

---

## 8. Observability, Logging & Error Tracking

| Component           | Choice                            | Details                                                                                     |
| ------------------- | --------------------------------- | ------------------------------------------------------------------------------------------- |
| Application logging | **Pino** (+ `pino-pretty` in dev) | Structured logs                                                                             |
| Platform logging    | **Vercel's built-in logging**     | Request/function-level visibility                                                           |
| Error tracking      | **Sentry**                        | Surfaces failures inside Inngest steps and the conversion service, not just app-tier errors |

---

## 9. Testing & Quality

| Layer            | Tool                                                                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Unit             | **Vitest**                                                                                                                                                         |
| Component        | **Testing Library**                                                                                                                                                |
| E2E              | **Playwright** — prioritized for login, the approval workflow, the print/PDF page, and audit trail, since the approval workflow is the highest-risk business logic |
| Formatting       | **Prettier**                                                                                                                                                       |
| Linting          | **ESLint**                                                                                                                                                         |
| Pre-commit hooks | **Husky** — run lint, typecheck, and tests before commit                                                                                                           |
| API docs         | **zod-openapi** — generate OpenAPI spec from existing Zod schemas                                                                                                  |

---

## 10. Deferred to v2 (Explicitly Out of Scope for MVP)

Per PRD §10, these are **not** part of the MVP stack, even though they appear in the broader proposal:

- **Email/notifications** — Resend + React Email are reasonable choices _when this lands_, but are deferred; no notification infrastructure ships in MVP.
- Digital/e-signatures
- OCR, contract comparison
- Real-time collaboration
- External (non-authenticated) approval links
- Elasticsearch/Meilisearch-based search
- AI-generated SOWs

---

## 11. External Services Summary

| Service                     | Purpose                                                   | Deployment Model                                      |
| --------------------------- | --------------------------------------------------------- | ----------------------------------------------------- |
| **Vercel**                  | Hosting for the Next.js application                       | Managed/serverless                                    |
| **Supabase**                | Postgres (via Prisma), connection pooling, object storage | Managed                                               |
| **Better Auth**             | Authentication                                            | Runs in-app (Next.js)                                 |
| **Inngest**                 | Durable background job orchestration                      | Managed, webhook-triggered from Vercel                |
| **LibreOffice / Gotenberg** | DOCX → PDF conversion                                     | Self-hosted, Dockerized container on Fly.io or Render |
| **Sentry**                  | Error tracking                                            | Managed                                               |

---

## 12. Architectural Principles Driving Stack Choices

- **Single source of persistence:** PostgreSQL holds all data; structured SOW data is canonical, and DOCX is strictly an import/export/presentation format, never the primary editing surface.
- **Two independent export paths:** the HTML→browser-PDF path is deliberately decoupled from the DOCX/Inngest/Gotenberg pipeline so a conversion-service outage doesn't block all document export.
- **Provider abstraction where it's cheap, concrete choices where the PRD locks them:** database and storage are accessed through an interface that could point at other providers, but Supabase and Inngest are the committed MVP choices, not open decisions.
- **Serverless-aware data access:** pooled connections are mandatory (not optional) because of how serverless functions manage DB connections.
- **Durability over hand-rolled retries:** any multi-step process with independent failure modes (the DOCX pipeline) is orchestrated through Inngest rather than manual retry logic.
- **Tenant isolation at the data layer:** `tenant_id` scoping enforced at the Prisma/query-builder layer, not the UI.
- **Permission-based authorization:** avoids brittle role-string checks scattered through application logic.
- **Append-only audit logging:** every state-changing action produces an immutable audit entry.
- **Versioned, immutable workflow execution:** workflow _definitions_ are reusable/versioned; workflow _instances_ are immutable once started, so editing a workflow never affects in-flight approvals.
- **Structured editing over rich-text editing:** docx-editor.dev is scoped to specific free-text sections, not the whole document — even though it's a Word-like WYSIWYG surface, it's deliberately confined to a handful of fields rather than promoted to the primary editing experience, keeping the PRD's structured-data-first principle intact.

---

## 13. Open Decisions (Not Yet Locked)

These don't change the core stack above but affect implementation details:

- **Tenant onboarding model:** self-serve signup vs. Superadmin-provisioned only.
- **Notifications:** confirmed deferred to v2 (including in-app badges) — no notification infra in MVP stack.
- **Optimistic locking:** a version/`updated_at` check to prevent concurrent-edit overwrites on SOW drafts.
- **Soft deletes:** `deleted_at` columns on Clients, Projects, and Templates to preserve referential history.

---

## 14. Overall Technology Stack (Summary Table)

| Layer                       | Technology                                                                                         |
| --------------------------- | -------------------------------------------------------------------------------------------------- |
| Language                    | TypeScript                                                                                         |
| Frontend                    | Next.js 16 (App Router), React 19                                                                  |
| Styling                     | Tailwind CSS v4, shadcn/ui, Radix UI                                                               |
| Forms & validation          | React Hook Form, Zod                                                                               |
| Structured document editing | docx-editor.dev, RJSF                                                                              |
| Tables                      | TanStack Table                                                                                     |
| Drag & drop                 | dnd-kit                                                                                            |
| Charts                      | Recharts                                                                                           |
| Workflow diagram preview    | @xyflow/react (React Flow)                                                                         |
| Client state                | TanStack Query, Zustand                                                                            |
| Dates                       | date-fns                                                                                           |
| ORM                         | Prisma                                                                                             |
| Database                    | PostgreSQL (Supabase for MVP; portable to Neon/RDS/etc.)                                           |
| Storage                     | Storage interface → Supabase Storage for MVP (portable to S3/R2/MinIO)                             |
| Authentication              | Better Auth                                                                                        |
| Authorization               | Permission-based RBAC                                                                              |
| DOCX generation             | docxtemplater, PizZip, Mammoth (optional preview)                                                  |
| DOCX → PDF                  | Self-hosted LibreOffice via Gotenberg                                                              |
| Structured PDF export       | Print-optimized HTML + browser "Save as PDF"                                                       |
| Background jobs             | Inngest                                                                                            |
| Logging                     | Pino                                                                                               |
| Error tracking              | Sentry                                                                                             |
| Testing                     | Vitest, Testing Library, Playwright                                                                |
| API docs                    | zod-openapi                                                                                        |
| Monorepo                    | Nx + pnpm                                                                                          |
| Deployment                  | Vercel (app) + Dockerized Fly.io/Render (conversion service)                                       |
| CI/CD                       | GitHub Actions: install → lint → typecheck → unit tests → build → Prisma generate/migrate → deploy |

This stack stays conservative and PostgreSQL-first: every technology is mature and well-supported, and the two PRD-critical pieces the original proposal underspecified — DOCX→PDF conversion and the MVP's explicit non-scope for notifications — are restored to match the locked architecture.
