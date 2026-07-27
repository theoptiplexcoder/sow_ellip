## API Specification (Multi-Tenant)

### Tenant scoping convention
Every endpoint below (except `/api/organizations/signup`, `/api/auth/*`, and `/api/healthz`) is **implicitly scoped to the caller's organization**. The organization ID comes from the caller's Supabase session (`app_metadata.organization_id`) and is:
- **never accepted as a request body/query field** — if a client sends `organizationId`, the server ignores it and uses the session's value instead,
- enforced twice: once by the data-access layer (adds `WHERE organization_id = :callerOrgId` to every query) and once by Postgres RLS as the hard backstop.

Requesting a resource ID that belongs to a different organization returns **404**, not 403 — this avoids confirming the resource exists to a caller who isn't a member of that org.

```
POST   /api/organizations/signup      Create a new organization + its first Admin user
GET    /api/organizations/me          Current user's organization details

POST   /api/auth/login                Log in and create session
POST   /api/auth/logout                Destroy session
GET    /api/auth/me                    Current user (includes organizationId, role)

GET    /api/users                      List users (caller's org only)
POST   /api/users                      Invite/create user (caller's org only, admin-only)
PATCH  /api/users/[id]                 Update/deactivate user (must belong to caller's org)

GET    /api/clients                    List clients (caller's org only)
POST   /api/clients                    Create client
GET    /api/clients/[id]               Client detail (404 if not caller's org)
PATCH  /api/clients/[id]               Update client

GET    /api/projects                   List projects (caller's org only)
POST   /api/projects                   Create project (client + owner must be same org)
GET    /api/projects/[id]              Project detail
PATCH  /api/projects/[id]              Update project

GET    /api/templates                  List templates (caller's org only)
POST   /api/templates                  Create template
PATCH  /api/templates/[id]             Update template

GET    /api/workflows                  List workflows (caller's org only)
POST   /api/workflows                  Create workflow (approvers must be same org)
GET    /api/workflows/[id]             Workflow detail
PATCH  /api/workflows/[id]             Update workflow

GET    /api/sows                       List SOWs (caller's org only)
POST   /api/sows                       Create SOW
GET    /api/sows/[id]                  SOW detail
PATCH  /api/sows/[id]                  Update draft or changes-requested SOW
POST   /api/sows/[id]/submit           Snapshot workflow and begin approval

GET    /api/approvals/my-pending       Pending approvals for current user (own org only)
POST   /api/approvals/[id]/action      Approve / reject / request changes

GET    /api/audit-logs                 Query audit logs (caller's org only)
GET    /api/healthz                    Liveness (no tenant context required)
GET    /api/readyz                     Readiness / DB check
```

---

### Organization signup
`POST /api/organizations/signup`

Creates the `Organization` row, the Supabase Auth user, and the `public.users` row (via the DB trigger) in one flow. The requesting user becomes `ADMIN` of the new org.

```json
{
  "organizationName": "Acme Consulting",
  "organizationSlug": "acme-consulting",
  "adminName": "Ava Shah",
  "adminEmail": "ava@acme-consulting.example",
  "password": "DemoPassword123!"
}
```

`201 Created`
```json
{
  "organization": { "id": "org_abc123", "name": "Acme Consulting", "slug": "acme-consulting" },
  "user": { "id": "usr_abc123", "name": "Ava Shah", "email": "ava@acme-consulting.example", "role": "ADMIN" }
}
```
`409 Conflict` if `organizationSlug` or `adminEmail` is already taken (slugs are unique platform-wide; emails are unique platform-wide since Auth is shared across one Supabase project).

Subsequent users are **not** self-service — they're created via `POST /api/users` by an existing Admin, which sets `app_metadata.organization_id` to the admin's own org (so an admin can never accidentally provision a user into someone else's org).

---

### Login
`POST /api/auth/login`
```json
{
  "email": "creator@acme-consulting.example",
  "password": "DemoPassword123!"
}
```
`200 OK`
```json
{
  "user": {
    "id": "usr_abc123",
    "name": "Ava Shah",
    "email": "creator@acme-consulting.example",
    "role": "CREATOR",
    "organizationId": "org_abc123"
  }
}
```

---

### Create SOW
`POST /api/sows`

Note `organizationId` is **absent** from the payload — it's derived server-side from the session, never client-supplied.

```json
{
  "projectId": "prj_123",
  "templateId": "tpl_software_dev",
  "title": "Website Redesign Phase 1",
  "overview": "Deliver a responsive marketing website.",
  "objectives": "Modernize site and improve lead capture.",
  "scope": "Design system, CMS pages, deployment.",
  "outOfScope": "Mobile app, multilingual support.",
  "assumptions": "Client provides content by Aug 5.",
  "dependencies": "Access to brand assets and DNS.",
  "acceptanceCriteria": "Pages render correctly on modern browsers.",
  "pricing": "Fixed fee: USD 18,000",
  "paymentTerms": "50% upfront, 50% on approval.",
  "termsAndConditions": "Standard services terms apply.",
  "deliverables": [
    { "title": "UI mockups", "description": "Homepage + 5 templates", "dueDate": "2026-08-04" }
  ],
  "milestones": [
    { "title": "Design sign-off", "description": "Client approval", "dueDate": "2026-08-06", "amount": 9000 }
  ]
}
```
`201 Created`
```json
{
  "id": "sow_123",
  "sowNumber": "SOW-2026-0012",
  "status": "DRAFT",
  "version": 1
}
```
The server validates `projectId` resolves to a project in the caller's org before creating the SOW (404 otherwise); `sowNumber` is generated unique **within the org**, so a different org's `SOW-2026-0012` can coexist without conflict.

---

### Submit SOW into workflow
`POST /api/sows/sow_123/submit`
```json
{ "workflowId": "wf_std_3_step" }
```
`200 OK`
```json
{
  "id": "sow_123",
  "status": "IN_REVIEW",
  "workflow": {
    "currentStepOrder": 1,
    "pendingApprover": { "id": "usr_pm_1", "name": "Rahul Menon" }
  }
}
```
`404` if `workflowId` doesn't resolve within the caller's org (rather than leaking that a workflow with that ID exists elsewhere).

---

### Approval action
`POST /api/approvals/apr_001/action`
```json
{
  "action": "REQUEST_CHANGES",
  "comment": "Clarify hosting responsibility and acceptance criteria."
}
```
`200 OK`
```json
{
  "approvalId": "apr_001",
  "status": "CHANGES_REQUESTED",
  "sow": { "id": "sow_123", "status": "CHANGES_REQUESTED" }
}
```
Server verifies the acting user is both the assigned approver **and** in the same organization as the SOW before applying the transition.
