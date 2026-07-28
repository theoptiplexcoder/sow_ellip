The recommended architecture is one Next.js App Router application inside an Nx
workspace, with Route Handlers under app/api/*, shared libraries for domain/UI/data-
access code, Prisma migrations for table DDL, a separate `supabase/migrations` tree
for RLS policies and the auth-provisioning trigger (kept distinct so tenant-isolation
SQL is easy to audit as its own unit), and PostgreSQL as the single system of record.
This follows official guidance closely.

```
repo/
├─ apps/
│  └─ web/
│     ├─ app/
│     │  ├─ (auth)/
│     │  │  ├─ signup/
│     │  │  │  └─ page.tsx                       # org name/slug, admin name/email/phone/password → OrganizationSignupRequest
│     │  │  └─ login/
│     │  │     └─ page.tsx                       # org-user login; surfaces pending/rejected message
│     │  │
│     │  ├─ (onboarding)/
│     │  │  ├─ layout.tsx                        # shown only to a brand-new org with no data yet
│     │  │  ├─ page.tsx                          # confirm org details
│     │  │  └─ invite/
│     │  │     └─ page.tsx                       # invite teammates by email + role
│     │  │
│     │  ├─ (dashboard)/
│     │  │  ├─ layout.tsx                        # org app shell (nav, session/org context)
│     │  │  └─ dashboard/
│     │  │     └─ page.tsx                       # counts: Drafts, Pending My Approval, Submitted, Approved, Rejected, Recently Updated
│     │  │
│     │  ├─ (superadmin)/
│     │  │  ├─ layout.tsx                        # separate, unlisted shell — never shares session logic with (dashboard)
│     │  │  ├─ login/
│     │  │  │  └─ page.tsx                       # superadmin-only login, own credential set
│     │  │  └─ signup-requests/
│     │  │     ├─ page.tsx                       # queue: Pending / Approved / Rejected, filterable
│     │  │     └─ [id]/
│     │  │        └─ page.tsx                    # request detail + Approve / Reject actions
│     │  │
│     │  ├─ clients/
│     │  │  ├─ page.tsx                          # list / create
│     │  │  └─ [id]/
│     │  │     └─ page.tsx                       # detail / edit
│     │  │
│     │  ├─ projects/
│     │  │  ├─ page.tsx                          # list / create (owner auto-assigned CREATOR project role)
│     │  │  └─ [id]/
│     │  │     ├─ page.tsx                       # detail / edit
│     │  │     └─ members/
│     │  │        └─ page.tsx                    # Members tab: assign CREATOR/APPROVER/VIEWER per user; unassigned users shown as implicit VIEWER
│     │  │
│     │  ├─ templates/
│     │  │  ├─ page.tsx                          # list / create / duplicate / archive
│     │  │  └─ [id]/
│     │  │     └─ page.tsx                       # edit default section text
│     │  │
│     │  ├─ workflows/
│     │  │  ├─ page.tsx                          # list / create
│     │  │  └─ [id]/
│     │  │     └─ page.tsx                       # ordered steps, assign approver (same org), reorder, activate
│     │  │
│     │  ├─ sows/
│     │  │  ├─ page.tsx                          # list
│     │  │  ├─ new/
│     │  │  │  └─ page.tsx                       # draft from template or blank
│     │  │  └─ [id]/
│     │  │     ├─ page.tsx                       # SOW builder / detail — editable only in DRAFT/CHANGES_REQUESTED
│     │  │     └─ print/
│     │  │        └─ page.tsx                    # print CSS + browser Save as PDF; re-verifies org before rendering
│     │  │
│     │  ├─ approvals/
│     │  │  ├─ page.tsx                          # pending queue (scoped to approver's org + assignment)
│     │  │  └─ [id]/
│     │  │     └─ page.tsx                       # step detail: Approve / Reject / Request Changes (comment required)
│     │  │
│     │  ├─ audit-logs/
│     │  │  └─ page.tsx                          # append-only, filterable, scoped to caller's org
│     │  │
│     │  └─ api/
│     │     ├─ organizations/
│     │     │  ├─ signup/
│     │     │  │  └─ route.ts                    # POST — creates Auth user + PENDING OrganizationSignupRequest
│     │     │  └─ me/
│     │     │     └─ route.ts                    # GET — current user's organization details
│     │     │
│     │     ├─ auth/
│     │     │  ├─ login/
│     │     │  │  └─ route.ts                    # POST
│     │     │  ├─ logout/
│     │     │  │  └─ route.ts                    # POST
│     │     │  └─ me/
│     │     │     └─ route.ts                    # GET — includes organizationId, role
│     │     │
│     │     ├─ superadmin/
│     │     │  ├─ auth/
│     │     │  │  ├─ login/
│     │     │  │  │  └─ route.ts                 # POST — separate credential set, separate session
│     │     │  │  └─ logout/
│     │     │  │     └─ route.ts                 # POST
│     │     │  └─ signup-requests/
│     │     │     ├─ route.ts                    # GET — list, optional status filter
│     │     │     └─ [id]/
│     │     │        ├─ route.ts                 # GET — detail
│     │     │        ├─ approve/
│     │     │        │  └─ route.ts              # POST — provisions Organization + Admin user (service role, one transaction)
│     │     │        └─ reject/
│     │     │           └─ route.ts              # POST — requires reason
│     │     │
│     │     ├─ users/
│     │     │  ├─ route.ts                       # GET list / POST invite (caller's org only, admin-only)
│     │     │  └─ [id]/
│     │     │     └─ route.ts                    # PATCH — update/deactivate, must belong to caller's org
│     │     │
│     │     ├─ clients/
│     │     │  ├─ route.ts                       # GET list / POST create
│     │     │  └─ [id]/
│     │     │     └─ route.ts                    # GET / PATCH — 404 if not caller's org
│     │     │
│     │     ├─ projects/
│     │     │  ├─ route.ts                       # GET list / POST create (client + owner must be same org; owner auto-assigned CREATOR)
│     │     │  └─ [id]/
│     │     │     ├─ route.ts                    # GET / PATCH
│     │     │     └─ members/
│     │     │        ├─ route.ts                 # GET list / POST upsert a user's CREATOR/APPROVER/VIEWER role (one per user per project)
│     │     │        └─ [userId]/
│     │     │           └─ route.ts              # DELETE — remove explicit role, user reverts to implicit VIEWER
│     │     │
│     │     ├─ templates/
│     │     │  ├─ route.ts                       # GET list / POST create
│     │     │  └─ [id]/
│     │     │     └─ route.ts                    # PATCH
│     │     │
│     │     ├─ workflows/
│     │     │  ├─ route.ts                       # GET list / POST create (approvers must be same org)
│     │     │  └─ [id]/
│     │     │     └─ route.ts                    # GET / PATCH
│     │     │
│     │     ├─ sows/
│     │     │  ├─ route.ts                       # GET list / POST create
│     │     │  └─ [id]/
│     │     │     ├─ route.ts                    # GET detail / PATCH update (draft or changes-requested only)
│     │     │     └─ submit/
│     │     │        └─ route.ts                 # POST — snapshot workflow, begin approval
│     │     │
│     │     ├─ approvals/
│     │     │  ├─ my-pending/
│     │     │  │  └─ route.ts                    # GET — current user's pending approvals, own org only
│     │     │  └─ [id]/
│     │     │     └─ action/
│     │     │        └─ route.ts                 # POST — approve / reject / request changes
│     │     │
│     │     ├─ audit-logs/
│     │     │  └─ route.ts                       # GET — query, caller's org only
│     │     │
│     │     ├─ healthz/
│     │     │  └─ route.ts                       # GET — liveness, no tenant context required
│     │     │
│     │     └─ readyz/
│     │        └─ route.ts                       # GET — readiness / DB connectivity check
│     │
│     ├─ proxy.ts                                 # confirms session, resolves organizationId + role onto request context (no business authz)
│     ├─ next.config.ts
│     └─ project.json
│
├─ libs/
│  ├─ ui/                                        # shared presentational components
│  │  └─ src/
│  │
│  ├─ auth/                                       # Supabase Auth helpers, session/org-claim parsing (org users only)
│  │  └─ src/
│  │     ├─ session.ts
│  │     └─ claims.ts
│  │
│  ├─ db/                                         # Prisma client factory — ALWAYS session-scoped, never service-role by default
│  │  └─ src/
│  │     ├─ client.ts                             # constructs Prisma client bound to caller's Supabase session
│  │     └─ service-role.ts                       # narrow, explicitly-imported module used only where service role is required
│  │
│  ├─ validation/                                 # shared zod/schema validation
│  │  └─ src/
│  │
│  ├─ api-types/                                  # shared request/response types across Route Handlers
│  │  └─ src/
│  │
│  ├─ organizations/                              # signup-request creation, approval/rejection provisioning
│  │  └─ src/
│  │     ├─ signup.ts
│  │     └─ approval.ts
│  │
│  ├─ superadmin/                                 # superadmin session/auth, restricted to signup-request scope only
│  │  └─ src/
│  │     └─ session.ts
│  │
│  ├─ clients/
│  │  └─ src/
│  │
│  ├─ projects/                                    # project CRUD + ProjectMember role assignment (Creator/Approver/Viewer, implicit-Viewer default)
│  │  └─ src/
│  │
│  ├─ templates/
│  │  └─ src/
│  │
│  ├─ sows/
│  │  └─ src/
│  │
│  ├─ workflows/
│  │  └─ src/
│  │
│  └─ audit/                                      # audit-log writer, used by every state-changing action
│     └─ src/
│
├─ prisma/
│  ├─ schema.prisma                               # table DDL only — RLS lives in supabase/migrations, not here
│  └─ migrations/
│
├─ supabase/
│  └─ migrations/
│     ├─ 0001_current_org_id_function.sql
│     ├─ 0002_rls_organizations.sql
│     ├─ 0003_rls_users.sql
│     ├─ 0004_rls_clients.sql
│     ├─ 0005_rls_projects.sql
│     ├─ 0006_rls_templates.sql
│     ├─ 0007_rls_workflows.sql
│     ├─ 0008_rls_workflow_step.sql               # joins to parent workflow's organization_id
│     ├─ 0009_rls_sows.sql
│     ├─ 0010_rls_sow_deliverable.sql             # joins to parent sow's organization_id
│     ├─ 0011_rls_sow_milestone.sql               # joins to parent sow's organization_id
│     ├─ 0012_rls_sow_workflow.sql                # joins to parent sow's organization_id
│     ├─ 0013_rls_approval_step.sql               # joins to parent sow_workflow → sow's organization_id
│     ├─ 0014_rls_audit_logs.sql
│     ├─ 0015_rls_project_member.sql              # standard organization_id = current_org_id() policy (denormalized column, no join)
│     ├─ 0016_rls_signup_requests_superadmin.sql  # service-role writes; superadmin-self-row read policy; no current_org_id()
│     └─ 0017_handle_new_auth_user_trigger.sql    # claim-gated public.users provisioning trigger
│
├─ nx.json
├─ package.json
└─ tsconfig.base.json
```
