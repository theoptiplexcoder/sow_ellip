The recommended architecture is one Next.js App Router application inside an Nx
workspace, with Route Handlers under app/api/*, shared libraries for domain/UI/dataaccess code, and PostgreSQL as the single system of record. This follows official guidance
closely

repo/
├─ apps/
│ └─ web/
│ ├─ app/
│ │ ├─ (auth)/
│ │ ├─ (dashboard)/
│ │ ├─ api/
│ │ │ ├─ auth/
│ │ │ ├─ users/
│ │ │ ├─ clients/
│ │ │ ├─ projects/
│ │ │ ├─ templates/
│ │ │ ├─ workflows/
│ │ │ ├─ sows/
│ │ │ ├─ approvals/
│ │ │ └─ healthz/
│ │ ├─ clients/
│ │ ├─ projects/
│ │ ├─ sows/
│ │ ├─ workflows/
│ │ └─ dashboard/
│ ├─ proxy.ts
│ ├─ next.config.ts
│ └─ project.json
├─ libs/
│ ├─ ui/
│ ├─ auth/
│ ├─ db/
│ ├─ validation/
│ ├─ api-types/
│ ├─ clients/
│ ├─ projects/
│ ├─ templates/
│ ├─ sows/
│ ├─ workflows/
│ └─ audit/
├─ prisma/
│ ├─ schema.prisma
│ └─ migrations/
├─ nx.json
├─ package.json
└─ tsconfig.base.json