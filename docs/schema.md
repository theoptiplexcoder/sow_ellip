A multi-tenant database schema used in a Supabase PostgreSQL database.

## Architecture

- One Supabase Project
- One PostgreSQL Database
- One `public` schema, shared tables
- **Tenant isolation via `organization_id` on every tenant-scoped table**, enforced by **PostgreSQL Row Level Security (RLS)** — not deferred, RLS is required from day one because every table below is shared across organizations.
- Supabase Auth (`auth.users`) is the source of truth for credentials. `public.users` is a 1:1 profile row keyed to `auth.users.id` — **no `passwordHash` column lives in `public`.**
- Each authenticated request carries the caller's `organization_id` as a custom claim in the Supabase JWT (`app_metadata.organization_id`), set when the user is added to an org. RLS policies read this via `auth.jwt() -> 'app_metadata' ->> 'organization_id'`.
- A Postgres trigger on `auth.users` insert provisions the matching `public.users` row (and, for the first user of a new org, the `Organization` row) — this closes the "401 on first sign-in, no `public.users` row yet" gap.

## Tenancy model

- A user belongs to **exactly one organization** in the MVP (no cross-org membership). This keeps RLS policies simple: every policy is `organization_id = current_org_id()`.
- `current_org_id()` is a `SECURITY DEFINER` SQL function wrapping the JWT claim lookup, used consistently in every policy so isolation logic lives in one place.
- Uniqueness that used to be global (SOW numbers, template names, etc.) is now **scoped per organization** via compound unique constraints — a global unique constraint across tenants is a tenant-isolation bug, not a feature.

```sql
create or replace function current_org_id() returns text
language sql stable
as $$
  select nullif(auth.jwt() -> 'app_metadata' ->> 'organization_id', '')
$$;
```

Every tenant-scoped table gets a policy of this shape:

```sql
alter table public.sows enable row level security;

create policy tenant_isolation_select on public.sows
  for select using (organization_id = current_org_id());

create policy tenant_isolation_write on public.sows
  for all using (organization_id = current_org_id())
  with check (organization_id = current_org_id());
```

## Enums

```
enum Role {
  ADMIN
  CREATOR
  APPROVER
  VIEWER
}
enum SowStatus {
  DRAFT
  SUBMITTED
  IN_REVIEW
  CHANGES_REQUESTED
  REJECTED
  APPROVED
}
enum ApprovalStatus {
  WAITING
  PENDING
  APPROVED
  REJECTED
  CHANGES_REQUESTED
  SKIPPED
}
```

## Models

```prisma
model Organization {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  users         User[]
  clients       Client[]
  projects      Project[]
  templates     Template[]
  workflows     Workflow[]
  sows          Sow[]
  auditLogs     AuditLog[]
}

model User {
  id               String   @id // == auth.users.id, no default: assigned by the auth trigger
  organizationId   String
  email            String   @unique
  name             String
  role             Role
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  organization      Organization @relation(fields: [organizationId], references: [id], onDelete: Restrict)
  ownedProjects     Project[]      @relation("ProjectOwner")
  createdTemplates  Template[]
  createdWorkflows  Workflow[]
  createdSows       Sow[]
  approvalSteps     ApprovalStep[] @relation("ApprovalActor")
  auditLogs         AuditLog[]

  @@index([organizationId])
}

model Client {
  id              String   @id @default(cuid())
  organizationId  String
  name            String
  companyName     String
  primaryContact  String?
  email           String?
  phone           String?
  billingAddress  String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Restrict)
  projects     Project[]

  @@index([organizationId])
}

model Project {
  id              String    @id @default(cuid())
  organizationId  String
  clientId        String
  ownerId         String
  name            String
  description     String?
  status          String    @default("ACTIVE")
  startDate       DateTime?
  endDate         DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Restrict)
  client       Client       @relation(fields: [clientId], references: [id], onDelete: Restrict)
  owner        User         @relation("ProjectOwner", fields: [ownerId], references: [id], onDelete: Restrict)
  sows         Sow[]

  @@index([organizationId])
  @@index([clientId])
  @@index([ownerId])
}

model Template {
  id                  String   @id @default(cuid())
  organizationId      String
  createdById         String
  name                String
  description         String?
  overviewDefault     String?
  objectivesDefault   String?
  scopeDefault        String?
  outOfScopeDefault   String?
  assumptionsDefault  String?
  termsDefault        String?
  isActive            Boolean  @default(true)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Restrict)
  createdBy    User         @relation(fields: [createdById], references: [id], onDelete: Restrict)
  sows         Sow[]

  @@index([organizationId])
  @@unique([organizationId, name])
}

model Workflow {
  id              String   @id @default(cuid())
  organizationId  String
  createdById     String
  name            String
  description     String?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  organization Organization   @relation(fields: [organizationId], references: [id], onDelete: Restrict)
  createdBy    User           @relation(fields: [createdById], references: [id], onDelete: Restrict)
  steps        WorkflowStep[]

  @@index([organizationId])
  @@unique([organizationId, name])
}

model WorkflowStep {
  id               String  @id @default(cuid())
  workflowId       String
  stepOrder        Int
  label            String
  approverUserId   String
  isRequired       Boolean @default(true)

  workflow  Workflow @relation(fields: [workflowId], references: [id], onDelete: Cascade)
  approver  User     @relation(fields: [approverUserId], references: [id], onDelete: Restrict)

  // No organizationId column here: tenancy is inherited via workflowId.
  // RLS policy joins to the parent workflow's organization_id (see below).
  @@unique([workflowId, stepOrder])
  @@index([approverUserId])
}

model Sow {
  id                  String    @id @default(cuid())
  organizationId      String
  projectId           String
  templateId          String?
  createdById         String
  sowNumber           String
  title               String
  status              SowStatus @default(DRAFT)
  version             Int       @default(1)
  overview            String?
  objectives          String?
  scope               String?
  outOfScope          String?
  assumptions         String?
  dependencies        String?
  acceptanceCriteria  String?
  pricing             String?
  paymentTerms        String?
  termsAndConditions  String?
  submittedAt         DateTime?
  approvedAt          DateTime?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  organization  Organization      @relation(fields: [organizationId], references: [id], onDelete: Restrict)
  project       Project           @relation(fields: [projectId], references: [id], onDelete: Restrict)
  template      Template?         @relation(fields: [templateId], references: [id], onDelete: SetNull)
  createdBy     User              @relation(fields: [createdById], references: [id], onDelete: Restrict)
  deliverables  SowDeliverable[]
  milestones    SowMilestone[]
  workflow      SowWorkflow?

  // Audit trail for a SOW is queried via AuditLog.entityType/entityId
  // (polymorphic), not a Prisma relation — AuditLog has no sowId FK.

  // sowNumber is human-facing (e.g. "SOW-2026-0012") and only needs to be
  // unique *within* an org, not globally.
  @@unique([organizationId, sowNumber])
  @@index([organizationId])
  @@index([projectId])
  @@index([createdById])
  @@index([organizationId, status, updatedAt])
}

model SowDeliverable {
  id          String    @id @default(cuid())
  sowId       String
  sortOrder   Int
  title       String
  description String?
  dueDate     DateTime?

  sow Sow @relation(fields: [sowId], references: [id], onDelete: Cascade)

  @@unique([sowId, sortOrder])
  @@index([sowId])
}

model SowMilestone {
  id          String    @id @default(cuid())
  sowId       String
  sortOrder   Int
  title       String
  description String?
  dueDate     DateTime?
  amount      Decimal?  @db.Decimal(12, 2)

  sow Sow @relation(fields: [sowId], references: [id], onDelete: Cascade)

  @@unique([sowId, sortOrder])
  @@index([sowId])
}

model SowWorkflow {
  id                    String    @id @default(cuid())
  sowId                 String    @unique
  workflowNameSnapshot  String
  currentStepOrder      Int
  status                String
  startedAt             DateTime  @default(now())
  completedAt           DateTime?

  sow   Sow            @relation(fields: [sowId], references: [id], onDelete: Cascade)
  steps ApprovalStep[]

  @@index([status, currentStepOrder])
}

model ApprovalStep {
  id              String         @id @default(cuid())
  sowWorkflowId   String
  stepOrder       Int
  label           String
  approverUserId  String
  status          ApprovalStatus @default(WAITING)
  comment         String?
  actedAt         DateTime?

  sowWorkflow SowWorkflow @relation(fields: [sowWorkflowId], references: [id], onDelete: Cascade)
  approver    User        @relation("ApprovalActor", fields: [approverUserId], references: [id], onDelete: Restrict)

  @@unique([sowWorkflowId, stepOrder])
  @@index([approverUserId, status])
}

model AuditLog {
  id          String   @id @default(cuid())
  // Denormalized (not just derivable through userId/entity) so audit
  // queries and RLS don't need a join to prove tenancy, and so audit
  // rows survive a user being removed (userId is nullable on delete).
  organizationId  String
  userId          String?
  entityType      String
  entityId        String
  action          String
  details         Json?
  createdAt       DateTime @default(now())

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Restrict)
  user         User?        @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([organizationId, entityType, entityId, createdAt])
  @@index([organizationId, userId, createdAt])
}
```

## Notes on tables without their own `organization_id`

`WorkflowStep`, `SowDeliverable`, `SowMilestone`, `SowWorkflow`, and `ApprovalStep` don't carry their own `organization_id` column — they inherit tenancy through their parent (`Workflow`, `Sow`, `SowWorkflow`). Their RLS policies join to the parent, e.g.:

```sql
create policy tenant_isolation_select on public.workflow_step
  for select using (
    exists (
      select 1 from public.workflow w
      where w.id = workflow_step.workflow_id
        and w.organization_id = current_org_id()
    )
  );
```

This avoids denormalization drift on the child tables while still fully scoping access. `AuditLog` is the deliberate exception: it denormalizes `organization_id` directly because audit rows must remain queryable and tenant-scoped even after the referenced entity or user is gone.

## Provisioning trigger (fixes the "no `public.users` row on first sign-in" gap)

```sql
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (id, organization_id, email, name, role)
  values (
    new.id,
    new.raw_app_meta_data ->> 'organization_id',
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce((new.raw_app_meta_data ->> 'role')::"Role", 'CREATOR')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
```

`organization_id` must already be present in `app_metadata` at signup time (set during the org-creation step in the signup flow — see `requirements.md` and `api-specification.md`), otherwise this trigger fails closed rather than creating an unscoped user.
