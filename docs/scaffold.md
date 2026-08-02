# Setup Instructions: SOW Platform — Repository & Project Scaffold

These instructions stand up the repository structure, tooling, and empty-but-wired
scaffold described in `PRD.md` and `tech_stack.md`. They stop at "the project boots,
the DB connects, the pipeline skeleton exists" — not full feature implementation.

---

## 0. Prerequisites

Install/confirm before starting:

- **Node.js** 20 LTS or newer
- **pnpm** 9+ (`npm install -g pnpm`)
- **Git**
- **Docker** (to run Gotenberg locally, and optionally Postgres locally)
- **Supabase CLI** (`npm install -g supabase`) — optional but recommended for local dev
- Accounts: **Supabase**, **Vercel**, **Inngest**, **Fly.io or Render**, **Sentry**, **GitHub**

---

## 1. Initialize the repository

```bash
mkdir sow-platform && cd sow-platform
git init
pnpm init
```

Create a `.gitignore`:

```bash
cat > .gitignore << 'EOF'
node_modules/
.next/
dist/
.env
.env.local
.env.*.local
.nx/cache
.nx/workspace-data
*.log
.DS_Store
coverage/
EOF
```

---

## 2. Scaffold the Nx monorepo with Next.js

```bash
npx create-nx-workspace@latest sow-platform \
  --preset=next \
  --appName=web \
  --style=css \
  --nxCloud=skip \
  --packageManager=pnpm
```

When prompted, choose the **App Router** and **TypeScript**. This produces:

```
apps/
  web/
libs/
```

Move into the generated workspace if `create-nx-workspace` created a nested folder,
so `sow-platform/` is the repo root.

Confirm Next.js 16 / React 19 versions in `apps/web/package.json` and bump if the
generator scaffolded older majors:

```bash
pnpm add next@16 react@19 react-dom@19 --filter web
```

---

## 3. Generate the libs structure

Per PRD §7 / tech_stack §1, generate each library as an Nx TypeScript library
(buildable, not publishable):

```bash
for lib in auth permissions database storage tenants users clients projects \
           templates sow workflow audit dashboard validation ui shared; do
  npx nx g @nx/js:lib "libs/$lib" --unitTestRunner=vitest --bundler=none
done
```

Resulting structure:

```
apps/
  web/
libs/
  auth/
  permissions/
  database/
  storage/
  tenants/
  users/
  clients/
  projects/
  templates/
  sow/
  workflow/
  audit/
  dashboard/
  validation/
  ui/
  shared/
```

Add path aliases for each lib in the root `tsconfig.base.json` (Nx does this
automatically on generation — verify):

```jsonc
"paths": {
  "@sow-platform/auth": ["libs/auth/src/index.ts"],
  "@sow-platform/permissions": ["libs/permissions/src/index.ts"],
  "@sow-platform/database": ["libs/database/src/index.ts"],
  "@sow-platform/storage": ["libs/storage/src/index.ts"],
  "@sow-platform/tenants": ["libs/tenants/src/index.ts"],
  "@sow-platform/users": ["libs/users/src/index.ts"],
  "@sow-platform/clients": ["libs/clients/src/index.ts"],
  "@sow-platform/projects": ["libs/projects/src/index.ts"],
  "@sow-platform/templates": ["libs/templates/src/index.ts"],
  "@sow-platform/sow": ["libs/sow/src/index.ts"],
  "@sow-platform/workflow": ["libs/workflow/src/index.ts"],
  "@sow-platform/audit": ["libs/audit/src/index.ts"],
  "@sow-platform/dashboard": ["libs/dashboard/src/index.ts"],
  "@sow-platform/validation": ["libs/validation/src/index.ts"],
  "@sow-platform/ui": ["libs/ui/src/index.ts"],
  "@sow-platform/shared": ["libs/shared/src/index.ts"]
}
```

---

## 4. Install core dependencies

### Styling & UI

```bash
pnpm add -D tailwindcss@4 postcss autoprefixer
pnpm dlx shadcn@latest init
pnpm add lucide-react
```

### Forms & validation

```bash
pnpm add react-hook-form zod @hookform/resolvers
pnpm add zod-openapi
```

### Structured document editing

```bash
pnpm add @tiptap/react @tiptap/pm @tiptap/starter-kit
pnpm add @rjsf/core @rjsf/validator-ajv8 @rjsf/utils
```

### Tables, drag-and-drop, charts, diagrams, state

```bash
pnpm add @tanstack/react-table @tanstack/react-query
pnpm add @dnd-kit/core @dnd-kit/sortable
pnpm add recharts
pnpm add @xyflow/react
pnpm add zustand
pnpm add date-fns
```

### Data layer

```bash
pnpm add @prisma/client
pnpm add -D prisma
pnpm add @supabase/supabase-js
```

### Auth

```bash
pnpm add better-auth
```

### DOCX processing

```bash
pnpm add docxtemplater pizzip
pnpm add mammoth   # optional preview
```

### Background jobs

```bash
pnpm add inngest
```

### Logging & error tracking

```bash
pnpm add pino pino-pretty
pnpm add @sentry/nextjs
```

### Testing & quality

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
pnpm add -D @playwright/test
pnpm add -D prettier eslint husky lint-staged
```

---

## 5. Configure Prisma against Supabase Postgres

```bash
npx prisma init --datasource-provider postgresql
```

This creates:

```
prisma/
  schema.prisma
  migrations/
  seed.ts   (add manually)
```

Set the datasource block in `prisma/schema.prisma` to use **two** connection
strings — pooled for runtime, direct for migrations (PRD §2, tech_stack §3):

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")       // pooled, transaction mode, port 6543
  directUrl = env("DIRECT_URL")         // direct connection, port 5432, migrations only
}

generator client {
  provider = "prisma-client-js"
}
```

Enable the required extensions (add to `schema.prisma` or a raw migration):

```prisma
// schema.prisma (Prisma 5+ preview feature) or via raw SQL migration:
// CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
// CREATE EXTENSION IF NOT EXISTS "pgcrypto";
// CREATE EXTENSION IF NOT EXISTS "citext";
// CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

Stub the seven database modules as empty models to confirm the pipeline works
end-to-end before real schema design (PRD §6):

```prisma
// core
model Tenant { id String @id @default(uuid()) name String }

// Add tenants, users, roles, permissions, clients, projects, templates,
// template_versions, sows, sow_revisions, workflows, workflow_versions,
// workflow_steps, workflow_instances, workflow_instance_steps, audit_logs,
// attachments incrementally — every table gets a `tenantId String` column
// (except `tenants` itself) per PRD §3.
```

Run the first migration:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Wire the Prisma client through `libs/database` (single shared instance, not
instantiated per-route, to avoid connection exhaustion under serverless):

```ts
// libs/database/src/index.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ['warn', 'error'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## 6. Set up the storage abstraction

```ts
// libs/storage/src/storage-provider.interface.ts
export interface StorageProvider {
  upload(bucket: string, path: string, file: Buffer, contentType: string): Promise<string>;
  download(bucket: string, path: string): Promise<Buffer>;
  getSignedUrl(bucket: string, path: string, expiresIn?: number): Promise<string>;
  delete(bucket: string, path: string): Promise<void>;
}
```

```ts
// libs/storage/src/supabase-storage-provider.ts
import { createClient } from '@supabase/supabase-js';
import type { StorageProvider } from './storage-provider.interface';

export class SupabaseStorageProvider implements StorageProvider {
  private client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  // implement upload/download/getSignedUrl/delete against Supabase Storage
}
```

Export the concrete MVP instance from `libs/storage/src/index.ts` so callers
depend on the interface, not the provider (keeps the S3/R2/MinIO swap cheap
later, per tech_stack §3).

---

## 7. Set up Better Auth

```bash
pnpm add better-auth
```

```ts
// libs/auth/src/auth.ts
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@sow-platform/database';

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: { enabled: true },
  session: { expiresIn: 60 * 60 * 24 * 7 }, // 7 days
});
```

Mount the handler in the Next.js app:

```ts
// apps/web/app/api/auth/[...all]/route.ts
import { auth } from '@sow-platform/auth/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { GET, POST } = toNextJsHandler(auth);
```

Add route protection middleware at `apps/web/middleware.ts` referencing the
session cookie, and a seed script for demo users per persona (Superadmin,
Tenant Admin, Participant — PRD §4). Creator/Approver/Executive Viewer are
per-project roles held by a Participant, not separate personas (PRD §4.1).

---

## 8. Set up permission-based RBAC

```ts
// libs/permissions/src/permissions.ts
export const PERMISSIONS = ['client:create', 'client:update', 'project:create', 'template:create', 'workflow:create', 'workflow:approve', 'workflow:reject', 'audit:view', 'user:manage'] as const;

export type Permission = (typeof PERMISSIONS)[number];
```

```ts
// libs/permissions/src/check-permission.ts
export function hasPermission(userPermissions: Permission[], required: Permission) {
  return userPermissions.includes(required);
}
```

Enforce this at the Server Action layer, never as `if (role === 'Admin')` in
application logic (PRD §4, tech_stack §4).

---

## 9. Set up Tailwind + shadcn/ui

Confirm `apps/web/tailwind.config.ts` and `apps/web/app/globals.css` are wired
from the `shadcn init` step. Add first primitives:

```bash
pnpm dlx shadcn@latest add button input table dialog form dropdown-menu
```

Place generated components under `libs/ui/src/components` and re-export from
`libs/ui/src/index.ts` so both routes and future apps share them.

Stub the workflow diagram preview component using React Flow (`@xyflow/react`),
which renders the ordered `Workflow Steps` of a template as a read-only chain
of nodes — derived client-side from step order, no diagram-specific persistence:

```tsx
// libs/workflow/src/components/workflow-diagram-preview.tsx
'use client';

import { ReactFlow, Background, Controls, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export interface WorkflowStepPreview {
  id: string;
  name: string;
  order: number;
}

export function WorkflowDiagramPreview({ steps }: { steps: WorkflowStepPreview[] }) {
  const ordered = [...steps].sort((a, b) => a.order - b.order);

  const nodes: Node[] = ordered.map((step, i) => ({
    id: step.id,
    position: { x: i * 220, y: 0 },
    data: { label: step.name },
    draggable: false,
  }));

  const edges: Edge[] = ordered.slice(1).map((step, i) => ({
    id: `${ordered[i].id}-${step.id}`,
    source: ordered[i].id,
    target: step.id,
  }));

  return (
    <div style={{ height: 240 }}>
      <ReactFlow nodes={nodes} edges={edges} fitView nodesConnectable={false} edgesFocusable={false}>
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
```

Re-export from `libs/workflow/src/index.ts` so both the workflow-template
builder and the workflow-instance/approval views can render the same preview.

---

## 10. Set up Inngest

```bash
pnpm add inngest
```

```ts
// libs/workflow/src/inngest/client.ts
import { Inngest } from 'inngest';

export const inngest = new Inngest({ id: 'sow-platform' });
```

```ts
// apps/web/app/api/inngest/route.ts
import { serve } from 'inngest/next';
import { inngest } from '@sow-platform/workflow/inngest/client';
import { generateSowDocument } from '@sow-platform/workflow/inngest/functions/generate-sow-document';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateSowDocument],
});
```

Stub the five-step document pipeline function (PRD §5.10):

```ts
// libs/workflow/src/inngest/functions/generate-sow-document.ts
import { inngest } from '../client';

export const generateSowDocument = inngest.createFunction({ id: 'generate-sow-document' }, { event: 'sow/approved' }, async ({ event, step }) => {
  const revision = await step.run('extract', async () => {
    /* ... */
  });
  const populated = await step.run('populate', async () => {
    /* ... */
  });
  const docxUrl = await step.run('generate-docx', async () => {
    /* ... */
  });
  const pdfUrl = await step.run('convert-to-pdf', async () => {
    /* ... */
  });
  await step.run('audit-log', async () => {
    /* ... */
  });
  return { docxUrl, pdfUrl };
});
```

Run the local Inngest dev server alongside `next dev`:

```bash
npx inngest-cli@latest dev
```

---

## 11. Scaffold the Gotenberg (LibreOffice) conversion service

This runs **outside** the Next.js/Vercel app, per PRD §2 and §5.10.

```bash
mkdir -p services/gotenberg
cd services/gotenberg
```

```dockerfile
# services/gotenberg/Dockerfile
FROM gotenberg/gotenberg:8
```

```bash
# local test
docker run --rm -p 3005:3000 gotenberg/gotenberg:8
```

Add a thin client in the workflow lib to call it over HTTP:

```ts
// libs/workflow/src/conversion/gotenberg-client.ts
export async function convertDocxToPdf(docxBuffer: Buffer): Promise<Buffer> {
  const formData = new FormData();
  formData.append('files', new Blob([docxBuffer]), 'document.docx');

  const response = await fetch(`${process.env.GOTENBERG_URL}/forms/libreoffice/convert`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error(`Gotenberg conversion failed: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}
```

Add `services/gotenberg/fly.toml` (or Render equivalent) for deployment — deploy
this independently of the Vercel app:

```toml
app = "sow-platform-gotenberg"
[build]
  image = "gotenberg/gotenberg:8"
[http_service]
  internal_port = 3000
  force_https = true
```

```bash
fly launch --config services/gotenberg/fly.toml
fly deploy --config services/gotenberg/fly.toml
```

---

## 12. Set up the independent HTML→PDF print path

Scaffold the print route so it has zero dependency on Inngest/Gotenberg (PRD
§5.10, §9):

```
apps/web/app/sows/[id]/print/page.tsx
```

```tsx
// apps/web/app/sows/[id]/print/page.tsx
export default function SowPrintPage({ params }: { params: { id: string } }) {
  // fetch structured SOW revision directly, render print-optimized HTML
  return <article className="print:p-0 p-8">{/* structured SOW layout */}</article>;
}
```

Add a `print.css` (or Tailwind `print:` variants) so `window.print()` /
"Save as PDF" produces clean output without app chrome.

---

## 13. Environment variables

```bash
cat > .env.example << 'EOF'
# Database (Supabase)
DATABASE_URL=postgresql://...pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://...supabase.co:5432/postgres

# Supabase Storage
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=

# Better Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

# Inngest
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Gotenberg / conversion service
GOTENBERG_URL=http://localhost:3005

# Sentry
SENTRY_DSN=
EOF

cp .env.example .env.local
```

Fill `.env.local` with real Supabase/Inngest/Sentry values from each dashboard.
Never commit `.env.local`.

---

## 14. Testing setup

```bash
npx nx g @nx/vite:configuration --project=web --uiFramework=react
```

Configure Playwright:

```bash
npx playwright install --with-deps
npx nx g @nx/playwright:configuration --project=web
```

Prioritize E2E specs for (tech_stack §9):

```
e2e/
  auth-login.spec.ts
  approval-workflow.spec.ts
  print-pdf-export.spec.ts
  audit-trail.spec.ts
```

---

## 15. Linting, formatting, pre-commit hooks

```bash
pnpm dlx husky init
```

```bash
# .husky/pre-commit
pnpm exec lint-staged
```

```json
// package.json
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,css}": ["prettier --write"]
}
```

---

## 16. CI/CD (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec eslint .
      - run: pnpm exec tsc --noEmit
      - run: pnpm exec vitest run
      - run: pnpm exec nx build web
      - run: pnpm exec prisma generate
      - run: pnpm exec prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          DIRECT_URL: ${{ secrets.DIRECT_URL }}
      # deploy step (Vercel) handled by Vercel's own GitHub integration
```

---

## 17. Sentry

```bash
pnpm dlx @sentry/wizard@latest -i nextjs
```

Confirm it wraps both the app tier and can be invoked manually from Inngest
step failures, per tech_stack §8 (Sentry should surface Inngest/Gotenberg
failures, not just app-tier errors).

---

## 18. Verify the scaffold boots end-to-end

```bash
# terminal 1
npx nx dev web

# terminal 2
npx inngest-cli@latest dev

# terminal 3 (local conversion service)
docker run --rm -p 3005:3000 gotenberg/gotenberg:8
```

Checklist before moving to feature work:

- [ ] `http://localhost:3000` loads the Next.js app
- [ ] Login page renders (Better Auth wired, seeded demo user works)
- [ ] `prisma studio` shows the stub tenant-scoped tables
- [ ] Inngest dev server shows the `generate-sow-document` function registered
- [ ] A manual POST to Gotenberg on `localhost:3005` converts a test `.docx`
- [ ] `/sows/[id]/print` renders independent of Inngest/Gotenberg being up
- [ ] `pnpm exec vitest run` and `pnpm exec playwright test` both pass on stub tests
- [ ] Pre-commit hook runs lint + format on a dummy commit

---

## 19. Next steps (not covered here)

Once the scaffold above is confirmed working, proceed to (per PRD §11 open
decisions, before deeper feature build):

1. Finalize the full Prisma schema for all modules in PRD §6
2. Decide tenant onboarding model (self-serve vs. Superadmin-provisioned)
3. Add optimistic locking (`updatedAt` check) on SOW draft mutations
4. Add `deletedAt` soft-delete columns to Clients, Projects, Templates
5. Build out the SOW state machine (PRD §5.9) as an explicit, testable module
   rather than ad hoc status updates
