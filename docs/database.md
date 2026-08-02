# Database Schema: Statement of Work (SOW) Platform

**Source documents:** `PRD1.md` (v1.1), `tech_stack.md`, `scaffold.md`, plus the client/project/SOW-builder/workflow-builder field spec below (§4–§7)
**ORM:** Prisma (`libs/database`) targeting **PostgreSQL** (Supabase for MVP)
**Format:** Prisma schema (`schema.prisma`), organized by module per PRD §6 / tech_stack §3

---

## 0. Conventions used throughout this schema

These conventions are pulled directly from the source docs, not invented here:

1. **Every business table carries `tenantId`** (PRD §3), except `Tenant` itself and the platform-wide `Superadmin`-managed tables. Tenant scoping is enforced at the Prisma query layer in application code, never left to schema constraints alone — but every FK relevant to tenant data still carries the column so that layer has something to filter on, and so a composite index/constraint can catch cross-tenant bugs.
2. **UUIDs as primary keys** (`uuid-ossp` / `gen_random_uuid()` via `pgcrypto`), matching tech_stack §3's extension list.
3. **Soft deletes** (`deletedAt`) on `Client`, `Project`, and `Template`-family tables, per PRD §11 open decision — included here as nullable columns so the decision is structurally supported without being forced on at the application layer.
4. **Optimistic locking** (`version` column, incremented on write) on `SowRevision` specifically, since that's the concurrent-edit-risk entity called out in PRD §11.
5. **Immutability where the PRD requires it:**
   - `SowRevision` rows are never edited after submission — "Request Changes" creates a new revision (PRD §5.7).
   - `WorkflowInstance` / `WorkflowInstanceStep` reference a specific `WorkflowVersion` and are never repointed if the template changes later (PRD §5.5, §5.8).
   - `AuditLog` is append-only — no update/delete path exists in application code, and there's intentionally no `updatedAt` on it.
6. **JSONB for flexible/structured payloads**: SOW structured section data, template field/placeholder definitions, audit before/after snapshots, and audit metadata all use `Json` (Postgres `JSONB`), per tech_stack §7 and PRD §5.11.
7. **Enums over free-text strings** for state machines and roles, so Postgres itself rejects invalid values — this backs up (doesn't replace) the "no hardcoded persona/role-string checks in application logic" principle (PRD §4, §9): the enum defines the closed set of values, but authorization logic still resolves permissions from assignments, never `if role === 'X'`.
8. **No cascading deletes on tenant-scoped data** by default (`onDelete: Restrict` unless stated) — a tenant is disabled, not hard-deleted, and audit history must survive.

---

## 1. Datasource & generator

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // pooled, transaction mode, port 6543
  directUrl = env("DIRECT_URL")     // direct connection, port 5432 — migrations only
}

generator client {
  provider = "prisma-client-js"
}
```

Required Postgres extensions (tech_stack §3), enabled via a raw-SQL migration:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
-- CREATE EXTENSION IF NOT EXISTS "unaccent"; -- optional, later
```

---

## 2. Shared enums

```prisma
// ---- Platform-wide personas (exactly 3 — PRD §4) ----
enum Persona {
  SUPERADMIN
  TENANT_ADMIN
  PARTICIPANT
}

// ---- Tenant lifecycle ----
enum TenantStatus {
  ACTIVE
  DISABLED
}

// ---- Project-level roles held by a Participant (PRD §4.1) ----
enum ProjectRole {
  CREATOR
  APPROVER
  EXECUTIVE_VIEWER
}

// ---- Project status (project intake required field) ----
enum ProjectStatus {
  PLANNED
  ACTIVE
  ON_HOLD
  COMPLETED
  CANCELLED
}

// ---- Template kinds (PRD §5.4 — two separate concepts) ----
enum TemplateKind {
  STRUCTURED
  DOCX
}

// ---- SOW state machine (PRD §5.9) ----
enum SowState {
  DRAFT
  SUBMITTED
  IN_REVIEW
  CHANGES_REQUESTED
  APPROVED
  REJECTED
  ARCHIVED
}

// ---- Workflow template lifecycle (PRD §5.5) ----
enum WorkflowTemplateStatus {
  ACTIVE
  INACTIVE
  ARCHIVED
}

// ---- Workflow instance / step execution (PRD §5.8) ----
enum WorkflowInstanceStatus {
  IN_PROGRESS
  COMPLETED
  REJECTED
}

enum WorkflowStepAction {
  APPROVE
  REJECT
  REQUEST_CHANGES
}

enum WorkflowInstanceStepStatus {
  PENDING
  APPROVED
  REJECTED
  CHANGES_REQUESTED
  SKIPPED
}

// ---- Document generation pipeline (tech_stack §6, PRD §5.10) ----
enum DocGenStepStatus {
  PENDING
  RUNNING
  SUCCEEDED
  FAILED
}

// ---- Attachment provenance ----
enum AttachmentKind {
  DOCX_TEMPLATE_SOURCE
  GENERATED_DOCX
  GENERATED_PDF
  USER_UPLOAD
}
```

---

## 3. Module: `core` — tenants, users, permissions

> PRD §6 lists this module as `tenants, users, personas, permissions`. Personas are modeled as an enum on `User` (closed 3-value set), not a separate lookup table, since the PRD is explicit there are only three and they're platform-wide, not tenant-configurable. Permissions are modeled as a static, code-defined set (tech_stack §4 / scaffold §8: `PERMISSIONS` const), resolved at runtime from persona + project-role assignment rather than stored per-user — so there is no `Permission` or `Role` table below. If per-tenant custom roles are ever needed, that's a v2 change, not part of this MVP schema.

```prisma
model Tenant {
  id        String       @id @default(uuid())
  name      String
  status    TenantStatus @default(ACTIVE)
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  users               User[]
  clients             Client[]
  projects            Project[]
  structuredTemplates StructuredTemplate[]
  docxTemplates       DocxTemplate[]
  workflowTemplates   WorkflowTemplate[]
  sows                Sow[]
  auditLogs           AuditLog[]
  attachments         Attachment[]

  @@map("tenants")
}

model User {
  id        String    @id @default(uuid())
  // Nullable: a Superadmin is platform-wide and has no tenant (PRD §4).
  tenantId  String?
  tenant    Tenant?   @relation(fields: [tenantId], references: [id], onDelete: Restrict)

  email        String   @unique @db.Citext
  name         String
  persona      Persona
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Better Auth adapter relations (scaffold §7)
  sessions Session[]
  accounts Account[]

  projectRoleAssignments ProjectRoleAssignment[]
  createdClients         Client[]                @relation("ClientCreatedBy")
  createdProjects        Project[]                @relation("ProjectCreatedBy")
  ownedProjects          Project[]                @relation("ProjectOwner")
  createdSows            Sow[]                    @relation("SowCreatedBy")
  submittedRevisions     SowRevision[]             @relation("RevisionSubmittedBy")
  workflowInstanceSteps  WorkflowInstanceStep[]    @relation("StepActedBy")
  snapshotAssignedSteps  WorkflowInstanceStep[]    @relation("SnapshotAssignedUser")
  auditLogs              AuditLog[]               @relation("AuditActor")
  uploadedAttachments    Attachment[]              @relation("AttachmentUploadedBy")

  @@index([tenantId])
  @@map("users")
}

// --- Better Auth required tables (session-based auth, scaffold §7) ---

model Session {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@map("sessions")
}

model Account {
  id                    String    @id @default(uuid())
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  providerId            String
  accountId             String
  passwordHash          String?
  accessToken           String?
  refreshToken          String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@unique([providerId, accountId])
  @@index([userId])
  @@map("accounts")
}

model Verification {
  id         String   @id @default(uuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())

  @@index([identifier])
  @@map("verifications")
}
```

---

## 4. Module: `crm` — clients, projects, project role assignments

```prisma
model Client {
  id       String @id @default(uuid())
  tenantId String
  tenant   Tenant @relation(fields: [tenantId], references: [id], onDelete: Restrict)

  /// Client name — the individual/organization record's display name.
  name String

  /// Company name — may differ from `name` (e.g. a named contact record
  /// vs. the company they represent); kept as a separate field rather
  /// than folded into `name`.
  companyName String?

  /// Primary contact — the main point of contact at the client, distinct
  /// from `createdBy` (which is the internal user who created the record).
  primaryContact String?
  email          String?
  phone          String?
  billingAddress String?
  notes          String?

  createdById String
  createdBy   User     @relation("ClientCreatedBy", fields: [createdById], references: [id])

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime? // soft delete — PRD §11

  projects Project[]

  @@index([tenantId])
  @@map("clients")
}

model Project {
  id       String @id @default(uuid())
  tenantId String
  tenant   Tenant @relation(fields: [tenantId], references: [id], onDelete: Restrict)

  clientId String
  client   Client @relation(fields: [clientId], references: [id], onDelete: Restrict)

  name             String
  /// Short description — a brief summary, distinct from any longer-form
  /// notes that might live on individual SOWs under the project.
  shortDescription String?

  /// Owner — the internally-accountable user for this project. This is
  /// separate from `createdBy` (who happened to create the record) and
  /// separate from `ProjectRoleAssignment` (which governs SOW/workflow
  /// permissions) — the Owner is a single point of accountability shown
  /// on project lists/dashboards, not itself an authorization grant.
  ownerId String
  owner   User   @relation("ProjectOwner", fields: [ownerId], references: [id])

  expectedStartDate DateTime?
  expectedEndDate   DateTime?
  status            ProjectStatus @default(PLANNED)

  createdById String
  createdBy   User     @relation("ProjectCreatedBy", fields: [createdById], references: [id])

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime? // soft delete — PRD §11

  roleAssignments ProjectRoleAssignment[]
  sows            Sow[]

  @@index([tenantId])
  @@index([clientId])
  @@index([ownerId])
  @@map("projects")
}

/// Join table capturing (tenantId, projectId, userId, projectRole).
/// A user may have multiple rows: multiple roles on one project,
/// and/or roles on multiple projects (PRD §6, §4.1).
model ProjectRoleAssignment {
  id          String      @id @default(uuid())
  tenantId    String
  tenant      Tenant      @relation(fields: [tenantId], references: [id], onDelete: Restrict)

  projectId   String
  project     Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)

  userId      String
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  projectRole ProjectRole

  assignedAt  DateTime    @default(now())

  // Same user cannot hold the same role twice on the same project.
  @@unique([projectId, userId, projectRole])
  @@index([tenantId])
  @@index([userId])
  @@map("project_role_assignments")
}
```

> Note: `ProjectRoleAssignment` also needs a `tenant` relation field back on `Tenant`; add `projectRoleAssignments ProjectRoleAssignment[]` to the `Tenant` model above when wiring the final schema file (omitted from the `Tenant` block for readability — Prisma requires the back-relation on both sides).

---

## 5. Module: `templates` — structured templates & DOCX templates

> PRD §5.4 is explicit these are **two separate concepts**, both managed exclusively by Tenant Admin, tenant-wide, both versioned so a generated SOW records which version it came from rather than a live link.

```prisma
model StructuredTemplate {
  id        String   @id @default(uuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Restrict)

  name      String
  isActive  Boolean  @default(true)

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime? // soft delete — PRD §11

  versions StructuredTemplateVersion[]
  sows     Sow[]

  @@index([tenantId])
  @@map("structured_templates")
}

model StructuredTemplateVersion {
  id                   String             @id @default(uuid())
  structuredTemplateId String
  structuredTemplate   StructuredTemplate @relation(fields: [structuredTemplateId], references: [id], onDelete: Cascade)

  version           Int
  /// Field/placeholder definitions + default values (PRD §5.4).
  fieldDefinitions  Json
  defaultValues     Json?

  createdAt DateTime @default(now())

  sowRevisions SowRevision[]

  @@unique([structuredTemplateId, version])
  @@map("structured_template_versions")
}

model DocxTemplate {
  id        String   @id @default(uuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Restrict)

  name      String
  isActive  Boolean  @default(true)

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime? // soft delete — PRD §11

  versions DocxTemplateVersion[]
  sows     Sow[]

  @@index([tenantId])
  @@map("docx_templates")
}

model DocxTemplateVersion {
  id             String       @id @default(uuid())
  docxTemplateId String
  docxTemplate   DocxTemplate @relation(fields: [docxTemplateId], references: [id], onDelete: Cascade)

  version Int

  /// The originally uploaded .docx (tech_stack §5: extract → validate → persist).
  sourceAttachmentId String
  sourceAttachment   Attachment @relation("DocxTemplateSource", fields: [sourceAttachmentId], references: [id])

  /// Extracted, validated placeholder definitions.
  placeholderDefinitions Json

  createdAt DateTime @default(now())

  sowRevisions SowRevision[]

  @@unique([docxTemplateId, version])
  @@map("docx_template_versions")
}
```

---

## 6. Module: `sow` — SOWs & revisions

> Structured SOW data is always the source of truth (PRD §9). A `Sow` is the durable identity; `SowRevision` rows are the immutable, append-only history of every submission (PRD §5.7). The required-field list and behaviors below reflect the SOW builder spec directly (Title, SOW number, Overview, Objectives, In scope, Out of scope, Deliverables, Milestones, Assumptions, Dependencies, Acceptance criteria, Pricing, Payment terms, Terms and conditions), consistent with authoritative procurement guidance that a work statement include a description of work, period of performance, deliverable schedule, applicable standards, and special requirements.[2]

```prisma
model Sow {
  id        String   @id @default(uuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Restrict)

  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Restrict)

  title String

  /// SOW number — required, human-readable identifier shown alongside
  /// Title on lists/exports. Kept as its own column (not buried in the
  /// JSON `data` blob) so it can be indexed/searched and enforced unique
  /// per tenant.
  sowNumber String

  // Optional: which templates this SOW is using (PRD §5.4 — a template
  // is not required; a SOW can be pure structured data with no DOCX output).
  // Supports "Create blank or from template": leaving both null means
  // the Creator started blank; setting either means it was created from
  // that template.
  structuredTemplateId String?
  structuredTemplate   StructuredTemplate? @relation(fields: [structuredTemplateId], references: [id], onDelete: SetNull)

  docxTemplateId String?
  docxTemplate   DocxTemplate? @relation(fields: [docxTemplateId], references: [id], onDelete: SetNull)

  /// Denormalized pointer to the latest revision, for fast list/dashboard
  /// queries — the revisions table remains the source of truth.
  currentState SowState @default(DRAFT)

  createdById String
  createdBy   User     @relation("SowCreatedBy", fields: [createdById], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  revisions SowRevision[]

  @@unique([tenantId, sowNumber])
  @@index([tenantId])
  @@index([projectId])
  @@map("sows")
}

model SowRevision {
  id    String @id @default(uuid())
  sowId String
  sow   Sow    @relation(fields: [sowId], references: [id], onDelete: Restrict)

  // Denormalized for query convenience / tenant-scoping enforcement (PRD §3).
  tenantId String

  /// Also doubles as the "resubmission version number" behavior: this
  /// increments each time a CHANGES_REQUESTED revision is resubmitted
  /// (a new SowRevision row, revisionNumber + 1), so the DB naturally
  /// tracks "version increments on resubmission after changes requested."
  revisionNumber Int
  state          SowState @default(DRAFT)

  /// Structured section data — required SOW builder sections:
  /// Overview, Objectives, In Scope, Out of Scope, Deliverables,
  /// Milestones, Assumptions, Dependencies, Acceptance Criteria,
  /// Pricing, Payment Terms, Terms and Conditions. (Title and SOW
  /// Number live as first-class columns on `Sow`, not in this blob,
  /// since they need to be indexed/unique and shown in lists.)
  ///
  /// Kept as JSONB rather than one column per section because (a) it
  /// matches "structured SOW data is the source of truth" without
  /// forcing a schema migration for every section tweak, and (b) it
  /// lets a DOCX-template-backed SOW store exactly the placeholder
  /// values a Creator edited — whether those values were entered
  /// directly in the platform's structured form, or by editing the
  /// placeholders extracted from an uploaded `.docx` template
  /// (`DocxTemplateVersion.placeholderDefinitions`) — the same `data`
  /// shape covers both editing paths.
  data Json

  structuredTemplateVersionId String?
  structuredTemplateVersion  StructuredTemplateVersion? @relation(fields: [structuredTemplateVersionId], references: [id], onDelete: SetNull)

  docxTemplateVersionId String?
  docxTemplateVersion  DocxTemplateVersion? @relation(fields: [docxTemplateVersionId], references: [id], onDelete: SetNull)

  submittedById String?
  submittedBy   User?    @relation("RevisionSubmittedBy", fields: [submittedById], references: [id])
  submittedAt   DateTime?

  // One workflow instance per revision (PRD §5.7: "retains its own ... workflow instance").
  workflowInstance WorkflowInstance?

  // Generated outputs for this specific revision (PRD §5.10).
  generatedDocxAttachmentId String?
  generatedDocxAttachment  Attachment? @relation("RevisionGeneratedDocx", fields: [generatedDocxAttachmentId], references: [id])

  generatedPdfAttachmentId String?
  generatedPdfAttachment  Attachment? @relation("RevisionGeneratedPdf", fields: [generatedPdfAttachmentId], references: [id])

  /// Optimistic-locking counter — incremented on every write to guard
  /// against concurrent-edit overwrites on drafts (PRD §11).
  version Int @default(1)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  docGenSteps DocumentGenerationStep[]

  @@unique([sowId, revisionNumber])
  @@index([tenantId])
  @@map("sow_revisions")
}
```

### 6.1 SOW builder — required behaviors, mapped to schema

| Behavior                                                                      | How the schema supports it                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create blank or from template                                                 | `Sow.structuredTemplateId` / `Sow.docxTemplateId` are both nullable — null on both means "blank"; set means "from template."                                                                                                                                                                                                                                        |
| Save as draft                                                                 | `SowRevision.state = DRAFT` with no `submittedAt` — a draft is just a revision that hasn't been submitted yet.                                                                                                                                                                                                                                                      |
| Edit while in `DRAFT` or `CHANGES_REQUESTED`                                  | Enforced in the Server Action layer against `SowRevision.state`, not a DB constraint (state alone doesn't stop a write; application logic must check it before allowing a mutation).                                                                                                                                                                                |
| Preview document                                                              | Read-only rendering of `SowRevision.data`; no separate schema entity — this is a view concern, not a persisted preview record.                                                                                                                                                                                                                                      |
| Lock core fields after submit, unless returned for changes                    | Enforced in application logic against `SowRevision.state` (locked once `state` moves past `DRAFT`/`CHANGES_REQUESTED`); not a DB-level lock.                                                                                                                                                                                                                        |
| Version increments on resubmission after changes requested                    | Modeled as a **new** `SowRevision` row with `revisionNumber = previous + 1` (PRD §5.7's "Request Changes produces a new revision rather than editing history in place") — distinct from the `SowRevision.version` optimistic-locking counter, which only guards against concurrent writes to the _same_ draft revision.                                             |
| Upload `.docx` with placeholders (Tenant Admin) → edit placeholders (Creator) | `DocxTemplate` / `DocxTemplateVersion.placeholderDefinitions` hold what the Tenant Admin uploaded; the Creator's edited values land in `SowRevision.data`, keyed to match those placeholder definitions — whether the Creator fills them in via the platform's structured form or edits them directly, the same `data` JSONB is the single place those values live. |
| Export as PDF or DOCX                                                         | `SowRevision.generatedDocxAttachmentId` / `generatedPdfAttachmentId`, produced by the `DocumentGenerationStep` pipeline (§9) or the independent HTML→browser-PDF print path (PRD §5.10).                                                                                                                                                                            |

---

## 7. Module: `workflow` — templates, versions, steps, instances

> Workflow _templates_ are reusable and versioned; workflow _instances_ are immutable once started, so editing a template never affects in-flight approvals (PRD §5.5, §9).

```prisma
model WorkflowTemplate {
  id          String                 @id @default(uuid())
  tenantId    String
  tenant      Tenant                 @relation(fields: [tenantId], references: [id], onDelete: Restrict)

  name        String
  description String?

  /// `status` (ACTIVE/INACTIVE/ARCHIVED) is the source of truth and is
  /// what satisfies the required "Active flag" field — INACTIVE and
  /// ARCHIVED both read as "not active" in the builder UI. A separate
  /// boolean isn't stored, since that would let `isActive` and `status`
  /// disagree with each other.
  status      WorkflowTemplateStatus @default(ACTIVE)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  versions WorkflowVersion[]

  @@index([tenantId])
  @@map("workflow_templates")
}

model WorkflowVersion {
  id                 String           @id @default(uuid())
  workflowTemplateId String
  workflowTemplate   WorkflowTemplate @relation(fields: [workflowTemplateId], references: [id], onDelete: Cascade)

  version   Int
  createdAt DateTime @default(now())

  steps     WorkflowStep[]
  instances WorkflowInstance[]

  @@unique([workflowTemplateId, version])
  @@map("workflow_versions")
}

model WorkflowStep {
  id                String          @id @default(uuid())
  workflowVersionId String
  workflowVersion   WorkflowVersion @relation(fields: [workflowVersionId], references: [id], onDelete: Cascade)

  /// Ordering for drag/button reorder (dnd-kit, tech_stack §2).
  /// Unlimited step count: no max enforced by the schema, only by
  /// whatever the UI/application layer chooses to allow.
  order Int
  name  String

  /// Optional role/label for display (e.g. "Legal Review", "Finance
  /// Sign-off") — purely presentational, not an authorization construct;
  /// authorization still resolves from `assignedApprovers`.
  label String?

  /// Assigned user(s) per step (PRD §5.5, §5.8). Modeled as a join table
  /// rather than a single FK so a step can name more than one eligible
  /// approver, while the common case of "one assigned user per step" is
  /// simply a join table with exactly one row.
  assignedApprovers WorkflowStepApprover[]

  instanceSteps WorkflowInstanceStep[]

  @@unique([workflowVersionId, order])
  @@map("workflow_steps")
}

/// Join table: which users are eligible approvers for a given step.
model WorkflowStepApprover {
  id             String       @id @default(uuid())
  workflowStepId String
  workflowStep   WorkflowStep @relation(fields: [workflowStepId], references: [id], onDelete: Cascade)

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([workflowStepId, userId])
  @@map("workflow_step_approvers")
}

model WorkflowInstance {
  id                String                 @id @default(uuid())
  tenantId          String
  tenant            Tenant                 @relation(fields: [tenantId], references: [id], onDelete: Restrict)

  sowRevisionId     String                 @unique
  sowRevision       SowRevision            @relation(fields: [sowRevisionId], references: [id], onDelete: Restrict)

  workflowVersionId String
  workflowVersion   WorkflowVersion        @relation(fields: [workflowVersionId], references: [id], onDelete: Restrict)

  status    WorkflowInstanceStatus @default(IN_PROGRESS)
  startedAt DateTime               @default(now())
  completedAt DateTime?

  instanceSteps WorkflowInstanceStep[]

  @@index([tenantId])
  @@map("workflow_instances")
}

model WorkflowInstanceStep {
  id                 String                     @id @default(uuid())
  workflowInstanceId String
  workflowInstance   WorkflowInstance           @relation(fields: [workflowInstanceId], references: [id], onDelete: Cascade)

  /// Traceability link back to the definition this step came from.
  /// Kept for reference/reporting, but NOT what execution relies on —
  /// see the snapshot fields below.
  workflowStepId String
  workflowStep   WorkflowStep @relation(fields: [workflowStepId], references: [id], onDelete: Restrict)

  /// --- Snapshotted at submit time ---
  /// PRD requirement: "Snapshot workflow steps into the SOW at submit
  /// time so later edits do not mutate in-flight approvals." Copying
  /// `order`/`name`/`label`/`assignedUserId` onto the instance step
  /// itself (rather than only relying on `WorkflowVersion` immutability
  /// via `workflowStepId`) means an in-flight approval reads back
  /// exactly what existed when the SOW was submitted, even in the edge
  /// case where a step row is ever corrected/relabeled for data-hygiene
  /// reasons after the fact.
  order          Int
  name           String
  label          String?
  assignedUserId String?
  assignedUser   User?   @relation("SnapshotAssignedUser", fields: [assignedUserId], references: [id])

  status  WorkflowInstanceStepStatus @default(PENDING)

  actedById String?
  actedBy   User?    @relation("StepActedBy", fields: [actedById], references: [id])
  action    WorkflowStepAction?

  /// Mandatory on Reject / Request Changes (PRD §5.8); enforced in
  /// application logic, not a DB constraint, since it's conditional
  /// on `action`.
  comment String?

  actedAt DateTime?

  @@map("workflow_instance_steps")
}
```

### 7.1 Workflow builder — required behaviors, mapped to schema

| Behavior                                            | How the schema supports it                                                                                                                                                                                                                                             |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unlimited step count                                | No max on `WorkflowStep` rows per `WorkflowVersion` — only `@@unique([workflowVersionId, order])` to keep ordering unambiguous.                                                                                                                                        |
| Drag or button reorder                              | `WorkflowStep.order` is a plain integer the UI rewrites on reorder (dnd-kit, tech_stack §2); no separate ordering table needed.                                                                                                                                        |
| Validate at least one step                          | Enforced in application logic before a `WorkflowTemplate`/`WorkflowVersion` can be activated — not a DB constraint, since Prisma/Postgres can't easily express "at least one child row" at the schema level.                                                           |
| Reuse workflow across multiple SOWs                 | `WorkflowVersion` has a one-to-many `instances WorkflowInstance[]` — the same version is referenced by as many `WorkflowInstance` rows (i.e. SOW revisions) as needed.                                                                                                 |
| Snapshot workflow steps into the SOW at submit time | `WorkflowInstanceStep` carries its own `order`/`name`/`label`/`assignedUserId` copied at creation time, in addition to the `workflowStepId` traceability link — later edits to `WorkflowStep` never mutate rows that already exist on an in-flight `WorkflowInstance`. |

---

## 8. Module: `audit` — append-only audit log

```prisma
model AuditLog {
  id       String  @id @default(uuid())
  tenantId String
  tenant   Tenant  @relation(fields: [tenantId], references: [id], onDelete: Restrict)

  actorId String?
  actor   User?   @relation("AuditActor", fields: [actorId], references: [id])

  entityType String  // e.g. "Sow", "WorkflowInstanceStep", "Template"
  entityId   String

  action String  // e.g. "created", "submitted", "approved", "rejected"

  previousState Json?
  newState      Json?
  metadata      Json?

  timestamp DateTime @default(now())

  // Intentionally no updatedAt — append-only, never mutated.

  @@index([tenantId])
  @@index([entityType, entityId])
  @@index([timestamp])
  @@map("audit_logs")
}
```

---

## 9. Module: `storage` — attachments & the document-generation pipeline

> PostgreSQL only ever holds storage _metadata_; file bytes live in the storage provider (Supabase Storage for MVP, per tech_stack §3). `DocumentGenerationStep` tracks the five-step Inngest pipeline (PRD §5.10) so each step's success/failure is queryable independent of the audit log's generic entries.

```prisma
model Attachment {
  id       String @id @default(uuid())
  tenantId String
  tenant   Tenant @relation(fields: [tenantId], references: [id], onDelete: Restrict)

  kind        AttachmentKind
  bucket      String
  path        String
  filename    String
  contentType String
  sizeBytes   Int

  uploadedById String?
  uploadedBy   User?   @relation("AttachmentUploadedBy", fields: [uploadedById], references: [id])

  createdAt DateTime @default(now())

  // Back-relations for the specific FKs that point at Attachment elsewhere.
  asDocxTemplateSource   DocxTemplateVersion[] @relation("DocxTemplateSource")
  asRevisionGeneratedDocx SowRevision[]        @relation("RevisionGeneratedDocx")
  asRevisionGeneratedPdf  SowRevision[]        @relation("RevisionGeneratedPdf")

  @@index([tenantId])
  @@map("attachments")
}

/// One row per step of the Inngest document-generation pipeline
/// (extract → populate → generate-docx → convert-to-pdf → audit-log),
/// so a failure at "convert-to-pdf" doesn't require re-deriving whether
/// earlier steps already succeeded (tech_stack §6, PRD §5.10).
model DocumentGenerationStep {
  id            String   @id @default(uuid())
  sowRevisionId String
  sowRevision   SowRevision @relation(fields: [sowRevisionId], references: [id], onDelete: Cascade)

  stepName String   // "extract" | "populate" | "generate-docx" | "convert-to-pdf" | "audit-log"
  status   DocGenStepStatus @default(PENDING)

  errorMessage String?

  startedAt   DateTime?
  completedAt DateTime?

  @@index([sowRevisionId])
  @@map("document_generation_steps")
}
```

---

## 10. Entity relationship summary

```
Tenant 1---* User
Tenant 1---* Client 1---* Project
Project *---1 User (owner)
Project 1---* ProjectRoleAssignment *---1 User

Tenant 1---* StructuredTemplate 1---* StructuredTemplateVersion
Tenant 1---* DocxTemplate 1---* DocxTemplateVersion *---1 Attachment (source)

Project 1---* Sow 1---* SowRevision
SowRevision *---1 StructuredTemplateVersion (optional)
SowRevision *---1 DocxTemplateVersion (optional)
SowRevision 1---1 WorkflowInstance
SowRevision 1---* DocumentGenerationStep
SowRevision *---1 Attachment (generated docx)
SowRevision *---1 Attachment (generated pdf)

Tenant 1---* WorkflowTemplate 1---* WorkflowVersion 1---* WorkflowStep
WorkflowStep 1---* WorkflowStepApprover *---1 User
WorkflowVersion 1---* WorkflowInstance 1---* WorkflowInstanceStep *---1 WorkflowStep
WorkflowInstanceStep *---1 User (actedBy)
WorkflowInstanceStep *---1 User (snapshotted assignedUser)

Tenant 1---* AuditLog *---1 User (actor, optional)
Tenant 1---* Attachment
```

---

## 11. Indexing & query-pattern notes

- Every `tenantId` column that appears on a frequently-listed table has a plain B-tree index (`@@index([tenantId])`) — this is the column every query filters on first, per the tenant-scoping requirement (PRD §3).
- `SowRevision` and `Sow` are indexed on `tenantId` and `projectId` separately, since dashboards filter by project-role-scoped project sets (PRD §5.12), not just tenant.
- `AuditLog` adds a compound `(entityType, entityId)` index for "show audit history for this SOW/workflow" views, and a `timestamp` index for "Recent Activity" / "Approved Today" dashboard widgets (PRD §5.12).
- Free-text search (client/project/user name lookups) relies on `pg_trgm` GIN indexes over the relevant `Citext`/`String` columns rather than a search engine, per tech_stack §3 ("no Elasticsearch, no Meilisearch"). Example migration addition:

```sql
CREATE INDEX clients_name_trgm_idx ON clients USING gin (name gin_trgm_ops);
CREATE INDEX clients_company_name_trgm_idx ON clients USING gin ("companyName" gin_trgm_ops);
CREATE INDEX projects_name_trgm_idx ON projects USING gin (name gin_trgm_ops);
CREATE INDEX sows_sow_number_trgm_idx ON sows USING gin ("sowNumber" gin_trgm_ops);
```

- `Sow.sowNumber` also has a plain `@@unique([tenantId, sowNumber])` constraint (not just the trgm index above) — SOW number is a required, tenant-unique identifier, not just a searchable label.

---

## 12. Explicitly not modeled (out of scope for MVP)

Per PRD §10, no tables exist for: e-signatures, OCR/contract comparison, real-time collaboration (e.g., CRDT/presence tables), external non-authenticated approval links, or AI-generated-SOW provenance. Per tech_stack §10, notification/email tables (e.g., a `Notification` or `NotificationPreference` model) are deferred to v2 and intentionally absent — adding them later is additive (new tables + FKs to `User`/`Sow`) and doesn't require changes to the schema above.

---

## 13. Open items this schema deliberately leaves flexible

Matching PRD §11 / tech_stack §13, these are structurally supported but not fully decided:

- **Tenant onboarding model** — no schema impact either way (self-serve vs. Superadmin-provisioned changes application flow, not tables).
- **Soft deletes** — `deletedAt` is present on `Client`, `Project`, `StructuredTemplate`, `DocxTemplate`; application-layer queries must filter `deletedAt: null` explicitly since Prisma does not do this automatically.
- **Optimistic locking** — `SowRevision.version` is present; the increment-and-check needs to happen in the Server Action layer (e.g., `WHERE id = ? AND version = ?`), not in the schema.
- **Project role assignment UX** (per-project vs. bulk) — no schema impact; both flows write the same `ProjectRoleAssignment` rows.
