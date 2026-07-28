A multi-tenant database schema used in a Supabase PostgreSQL database.

## Architecture

- One Supabase Project
- One PostgreSQL Database
- One `public` schema, shared tables
- **Tenant isolation via `organization_id` on every tenant-scoped table**, enforced by **PostgreSQL Row Level Security (RLS)** — not deferred, RLS is required from day one because every table below is shared across organizations.
- Supabase Auth (`auth.users`) is the source of truth for credentials. `public.users` is a 1:1 profile row keyed to `auth.users.id` — **no `passwordHash` column lives in `public`.**
- Each authenticated request carries the caller's `organization_id` as a custom claim in the Supabase JWT (`app_metadata.organization_id`), set when the user is added to an org. RLS policies read this via `auth.jwt() -> 'app_metadata' ->> 'organization_id'`.
- A Postgres trigger on `auth.users` insert/update provisions the matching `public.users` row **once an `organization_id` claim is present** — this closes the "401 on first sign-in, no `public.users` row yet" gap. At signup time no claim exists yet (the request is `PENDING`); the claim is set, and the row provisioned, only when a Super Admin approves the corresponding `OrganizationSignupRequest` (see below).

## Tenancy model

- A user belongs to **exactly one organization** in the MVP (no cross-org membership). This keeps RLS policies simple: every policy is `organization_id = current_org_id()`.
- `current_org_id()` is a `SECURITY DEFINER` SQL function wrapping the JWT claim lookup, used consistently in every policy so isolation logic lives in one place.
- Uniqueness that used to be global (SOW numbers, template names, etc.) is now **scoped per organization** via compound unique constraints — a global unique constraint across tenants is a tenant-isolation bug, not a feature.

### Org-wide role vs. project-level role
- `User.role` (`Role` enum: `ADMIN` / `MEMBER`) is the **only** org-wide role. `ADMIN` can invite/deactivate users, manage templates and workflows, and view everything in the org; `MEMBER` is an ordinary org user whose capabilities on any given project are determined entirely by that project's `ProjectMember` row (see below) — there is no org-wide Creator/Approver/Viewer anymore.
- `CREATOR` / `APPROVER` / `VIEWER` (`ProjectRole` enum) are assigned **per project, per user**, via the `ProjectMember` join table below — a user can be `CREATOR` on Project 1, `APPROVER` on Project 2, and `VIEWER` on Project 3 simultaneously. A user holds **at most one** `ProjectRole` on a given project — assigning a new role replaces the old one (upsert), it never adds a second row.
- A user with **no** `ProjectMember` row for a project has **implicit `VIEWER` access** to that project (read-only) — this is an authorization default at the application layer, not an RLS default; RLS still requires `organization_id = current_org_id()` regardless of project role.
- **The project's creator is that project's admin.** When a `Project` is created, the Route Handler inserts a `ProjectMember` row for the owner with role `CREATOR` in the same transaction as the `Project` insert — the person who creates the project can create/edit its SOWs, use it in workflows, and assign `APPROVER`/`VIEWER` roles to other org members on that project.
- This is an **authorization layer within the tenant boundary**, additional to (not a replacement for) the org-wide RLS tenant isolation above — project-role checks only decide what a user can do *within* their own organization's data.

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

`public.project_member` gets this same standard policy shape (it carries its own `organization_id`, denormalized, so no join is needed):

```sql
alter table public.project_member enable row level security;

create policy tenant_isolation_select on public.project_member
  for select using (organization_id = current_org_id());

create policy tenant_isolation_write on public.project_member
  for all using (organization_id = current_org_id())
  with check (organization_id = current_org_id());
```

Note that this RLS policy only enforces *tenant* isolation (can't read/write another org's project memberships) — it does not know or care about `ProjectRole`. Deciding whether the caller is allowed to *change* a given `project_member` row (e.g. only that project's `CREATOR` or an org `ADMIN` may reassign roles) is an application-layer check in the Route Handler, same as every other project-role authorization decision.

## Enums

```
enum Role {
  ADMIN
  MEMBER
}
enum ProjectRole {
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
enum SignupRequestStatus {
  PENDING
  APPROVED
  REJECTED
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
  projectMembers ProjectMember[]
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
  ownedProjects     Project[]        @relation("ProjectOwner")
  createdTemplates  Template[]
  createdWorkflows  Workflow[]
  createdSows       Sow[]
  approvalSteps     ApprovalStep[]   @relation("ApprovalActor")
  auditLogs         AuditLog[]
  projectMemberships ProjectMember[] // this user's role (Creator/Approver/Viewer) on each project

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
  members      ProjectMember[]

  @@index([organizationId])
  @@index([clientId])
  @@index([ownerId])
}

model ProjectMember {
  id              String      @id @default(cuid())
  organizationId  String
  projectId       String
  userId          String
  role            ProjectRole
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Restrict)
  project      Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  // A user holds exactly one ProjectRole per project (CREATOR, APPROVER, or
  // VIEWER) — @@unique enforces this as an upsert target, never a second row.
  // A user with no row here for a given project has implicit VIEWER access
  // (enforced in the data-access layer, not by RLS).
  //
  // organizationId is denormalized here (same pattern as AuditLog) so the
  // RLS policy and project-scoped role checks don't need a join through
  // Project just to prove tenancy.
  @@unique([projectId, userId])
  @@index([organizationId])
  @@index([userId])
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
  //
  // approverUserId only needs to name an org member at workflow-definition
  // time (see schema note below) — Workflow is a reusable, org-scoped
  // template, not tied to one project, so a step's approver can't be
  // validated against a ProjectRole until the workflow is actually
  // attached to a specific SOW (and therefore a specific project) at
  // submit time.
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

### Approver validation at submit time
Because `Workflow`/`WorkflowStep` are org-scoped templates reusable across many projects, `POST /api/sows/[id]/submit` (not workflow save/update) is where each step's `approverUserId` is checked against `ProjectMember` for the SOW's `projectId`: the approver must hold `APPROVER` or `CREATOR` `ProjectRole` on that project. A step whose approver lacks that role on this particular project fails the submit with `422`, even though the same workflow may submit successfully against a different project where that approver *is* assigned.

## Super Admin & Signup Requests (outside the tenant model)

These tables carry no `organization_id` and are deliberately **not** governed by `current_org_id()` / the tenant RLS policies above — an `Organization` may not exist yet when a request row is written, and the whole point of this persona is that it must never gain a query path into tenant data. They get their own, much narrower RLS policies (service-role-only writes; reads scoped to `auth.uid() = super_admin.id` where applicable).

```prisma
model OrganizationSignupRequest {
  id                String              @id @default(cuid())
  organizationName  String
  organizationSlug  String              @unique
  adminAuthUserId   String              @unique // == auth.users.id created at signup, before any org_id claim exists
  adminName         String
  adminEmail        String              @unique
  adminPhone        String?
  status            SignupRequestStatus @default(PENDING)
  reviewedById       String?
  reviewedAt         DateTime?
  rejectionReason    String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  reviewedBy SuperAdmin? @relation(fields: [reviewedById], references: [id], onDelete: SetNull)

  // organizationSlug/adminEmail uniqueness spans both this table and
  // Organization/User respectively at the application layer, so two
  // pending requests (or a pending request and a live org) can't collide.
  @@index([status, createdAt])
}

model SuperAdmin {
  id        String   @id // == auth.users.id, seeded at deploy time, no signup path
  email     String   @unique
  name      String
  createdAt DateTime @default(now())

  reviewedRequests OrganizationSignupRequest[]
  auditLogs        SuperAdminAuditLog[]
}

model SuperAdminAuditLog {
  id           String   @id @default(cuid())
  superAdminId String?
  action       String   // ORGANIZATION_SIGNUP_REQUESTED / ORGANIZATION_APPROVED / ORGANIZATION_REJECTED
  requestId    String
  details      Json?
  createdAt    DateTime @default(now())

  superAdmin SuperAdmin? @relation(fields: [superAdminId], references: [id], onDelete: SetNull)

  @@index([requestId, createdAt])
}
```

`ORGANIZATION_SIGNUP_REQUESTED` is logged here (with `superAdminId` null — no one has reviewed it yet); `ORGANIZATION_APPROVED`/`_REJECTED` are logged here with the acting `superAdminId`. This keeps pre-provisioning events out of the tenant `AuditLog` table, which requires a real `organization_id` on every row. Once a request is approved and the `Organization` row exists, an `ORGANIZATION_CREATED` entry is additionally written to the tenant `AuditLog` (see below) — that one *does* have an `organization_id`, since the org exists by the time it's written.

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

This avoids denormalization drift on the child tables while still fully scoping access. `AuditLog` and `ProjectMember` are the deliberate exceptions: `AuditLog` denormalizes `organization_id` because audit rows must remain queryable and tenant-scoped even after the referenced entity or user is gone; `ProjectMember` denormalizes it because it's on the hot path of nearly every project/SOW authorization check (who can create, approve, or view on this project), and a join through `Project` on every one of those checks isn't worth avoiding a single extra column.

## Provisioning trigger (fixes the "no `public.users` row on first sign-in" gap)

Unlike the original single-step signup, `organization_id` is **not** present in `app_metadata` at the moment `auth.users` gets a new row — the user just submitted a signup request and hasn't been approved yet. So the trigger is a no-op until an `organization_id` claim exists; it fires again (effectively) once the superadmin approval step sets that claim via `supabase.auth.admin.updateUserById`, which re-triggers `on_auth_user_created`... in practice this is a plain `AFTER UPDATE OF raw_app_meta_data` trigger, not just `AFTER INSERT`:

```sql
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Skip entirely until an organization_id claim exists — true at initial
  -- signup (still PENDING, no org yet) and only becomes false once a
  -- Super Admin approves the OrganizationSignupRequest and sets the claim.
  if new.raw_app_meta_data ->> 'organization_id' is null then
    return new;
  end if;

  -- Skip if already provisioned (claim set more than once is a no-op).
  if exists (select 1 from public.users where id = new.id) then
    return new;
  end if;

  insert into public.users (id, organization_id, email, name, role)
  values (
    new.id,
    new.raw_app_meta_data ->> 'organization_id',
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce((new.raw_app_meta_data ->> 'role')::"Role", 'ADMIN')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert or update of raw_app_meta_data on auth.users
  for each row execute function public.handle_new_auth_user();
```

The approval flow itself (service-role only): create `Organization` → `supabase.auth.admin.updateUserById(adminAuthUserId, { app_metadata: { organization_id, role: 'ADMIN' } })` → the trigger above fires and inserts the `public.users` row → mark `OrganizationSignupRequest.status = APPROVED`. If any step after `Organization` creation fails, the request stays `PENDING` and the org is orphaned without an admin user — the approval handler must run these as one transaction (Postgres side) plus a compensating check that the auth-metadata update actually succeeded before marking `APPROVED`.
