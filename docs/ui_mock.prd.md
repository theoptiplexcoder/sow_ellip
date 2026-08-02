# UI Mock PRD: Statement of Work (SOW) Platform

**Status:** UI Specification (v2 — corrected against PRD1.md / tech_stack.md)
**Supersedes:** initial UI mock draft
**Design references:** Linear (layout, nav, shortcuts) · Notion (document editing, sidebar hierarchy) · PandaDoc (template/workflow authoring) · GitHub (audit timeline, activity feed, versioning) · Vercel Dashboard (analytics cards, admin screens) · Figma (right-side inspector panels)

---

## 0. Changes from the initial draft, and why

| #   | Issue in original draft                                                           | Fix applied here                                                                                                                                                                                                                                                                                                                                              |
| --- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Notification Center appeared in Tenant Admin sidebar and Global Components        | Removed from all MVP screens. PRD §10 excludes notifications entirely; §11 leaves even in-app badges undecided. No notification affordance ships in this version.                                                                                                                                                                                             |
| 2   | Superadmin built around a signup-request/approval queue                           | PRD §11 lists tenant onboarding model (self-serve vs. Superadmin-provisioned) as an **open, non-blocking decision**. This version specs the **Superadmin-provisioned** flow as the MVP default (direct "+ New Organization" creation, no requester/approval concept), and calls out the self-serve variant as a documented alternative, not a shipped screen. |
| 3   | Superadmin dashboard cards were request-queue metrics                             | Replaced with the PRD §5.12 spec exactly: Total Tenants, Active Tenants, Disabled Tenants, Total Users.                                                                                                                                                                                                                                                       |
| 4   | Workflow tab showed one linear timeline conflating SOW status with approval steps | Split into two visual layers: the **SOW state machine** (§5.9) as a top-level status strip, and **workflow instance steps** (§5.8) as a nested approval timeline underneath it.                                                                                                                                                                               |
| 5   | SOW Builder implied one big rich-text surface                                     | Corrected to structured, typed fields per section (RJSF-style), with the Notion-style block editor scoped **only** to Scope / Assumptions / Notes, per tech_stack §2. Notion-style editing is kept, just bounded to where the PRD says free text belongs.                                                                                                     |
| 6   | Independent print/PDF path was buried as one "Export" button                      | Given a distinct, always-visible affordance separate from the DOCX/Inngest/Gotenberg pipeline export, so users can see there are two independent paths (§5.10).                                                                                                                                                                                               |
| 7   | "API Keys" in Tenant Admin Settings had no backing spec                           | Removed. No public API/integration surface is in scope for MVP.                                                                                                                                                                                                                                                                                               |
| 8   | No UI state for concurrent-edit conflicts                                         | Added a reserved conflict-state affordance in the SOW Builder, tied to the optimistic-locking open decision (§11).                                                                                                                                                                                                                                            |

---

## 1. Super Admin UI

Separate application shell. Platform-wide only — **no visibility into any tenant's clients, projects, SOWs, templates, or workflows**, per PRD §4.

### 1.1 Layout

```
-------------------------------------------------------
Logo

Organizations
Platform Analytics
Audit Logs

-----------------------
Super Admin
Logout
-------------------------------------------------------
            Main Content
```

No Clients. No Projects. No SOWs. No Templates. No Workflows. No Notifications.

### 1.2 Dashboard

Cards (per PRD §5.12, exact):

- Total Tenants
- Active Tenants
- Disabled Tenants
- Total Users

Below: **Organizations table**

- Organization / Slug / Admin / Users / Created / Status / Actions
- Actions: Enable, Disable, View Details

### 1.3 Create Organization (MVP default: Superadmin-provisioned)

Per PRD §11, tenant onboarding is an open decision. This spec ships the **Superadmin-provisioned** path as MVP default:

- `+ New Organization` button on the Organizations screen opens a form:
  - Organization name, slug, initial Tenant Admin name/email
  - On submit: creates tenant + seeds one Tenant Admin, sends no notification (out of scope), Tenant Admin receives credentials via the auth flow's existing invite/reset mechanism only.
- No "requested by," no approval/reject queue, no rejection-reason field — these only apply if the platform later adopts self-serve signup.

**Documented alternative (not built for MVP):** if self-serve signup is chosen instead, this screen becomes a request queue (Organization, Slug, Requested By, Email, Date, Status, Approve/Reject) with the org only provisioned on approval. Flag this as a decision to confirm before implementation, not a resolved default.

### 1.4 Organization Detail

- Name, slug, Tenant Admin, created date, status
- Actions: Enable / Disable
- No SOW/template/workflow content visible — Superadmin scope stops at tenant existence, per §4.

### 1.5 Organizations (list/search)

- Search, filter by status/date/name
- Table: Organization / Users / Created / Status
- View → name, created date, admin, user count only. No tenant data.

### 1.6 Platform Analytics

Charts: Organizations Growth, New Organizations Over Time, Enabled vs. Disabled. (No signup-approval charts, since approval flow isn't the MVP default.)

### 1.7 Platform Audit

Timeline: Organization Created, Organization Enabled/Disabled, Tenant Admin Assigned, Superadmin Login. Platform-level events only — no tenant-internal audit content.

---

## 2. Tenant Admin UI

Where most configuration work happens. Single-tenant scope throughout.

### 2.1 Sidebar

```
Dashboard
Clients
Projects
Templates
DOCX Templates
Workflow Templates
SOWs
Users
Audit
Settings

-----------------------
Organization
Profile
```

(No Notifications item — removed per §0.1.)

### 2.2 Dashboard

Cards (PRD §5.12, exact): Active Users, Active Templates, Active Workflow Templates, Status Summary, Recent Activity.

Below: SOW Status chart, Approval Time chart, Recent Activity feed, Project Progress.

### 2.3 Clients

- Search, `+ New Client`
- Table/cards: Company, Projects, Created, Owner, Status
- Client Detail tabs: Overview, Projects, Contacts, Documents, Audit

### 2.4 Projects

- Table/grid: Project, Client, Owner, Members, Status, Actions
- Project Detail tabs: Overview, SOWs, Members, Workflow, Files, Audit

**Members tab:** drag-and-drop assignment interface

- Left: Available Users
- Right: Project Members, each showing Avatar, Name, and toggleable role chips (Creator / Approver / Executive Viewer)
- A user can hold multiple role chips at once on the same project, matching `project_role_assignments` (§6 of PRD).

### 2.5 Users

- Table: Avatar, Name, Email, Status, Project count, Actions
- Actions: Invite, Deactivate, Reset Password
- No project-role editing here — role assignment lives on the Project → Members tab, since roles are per-project, not global.

### 2.6 Templates

Two tabs, kept separate per PRD §5.4:

**Structured Templates**

- Card: Template Name, Version, Field count, Updated, Status
- Click → Visual Schema Builder (field/placeholder definitions with default values)
- Editing a template never retroactively changes an already-generated SOW.

**DOCX Templates**

- Upload zone (drag `.docx`)
- On upload: Extract Placeholders → show detected placeholders (e.g. `{{client}}`, `{{scope}}`, `{{pricing}}`, `{{milestones}}`) → validate → Preview (Mammoth DOCX→HTML) → Version History
- A generated SOW stores which template _version_ it came from — not a live link.

### 2.7 Workflow Templates

- Cards: workflow name, step count, status (e.g. "Standard Workflow," "Finance Approval," "3-Step Legal Review")
- Click → Workflow Builder: vertical step list, drag-reorder, assign Participants holding the Approver role on the relevant project, per step
- Activate / Deactivate / Archive controls
- Editing a workflow template **never affects in-flight approvals** — already-started instances continue on the version they began with (§5.5).

### 2.8 SOW List

- Search, filters, `+ Create`
- Table: Number, Title, Client, Project, Status, Version, Updated, Actions

### 2.9 SOW Detail

Tabs: Overview, Builder, Workflow, Versions, Files, Audit

**Builder** — structured, not free-text:

- Left nav: Objectives, Scope, Deliverables, Milestones, Pricing, Acceptance Criteria, Dependencies, Risks, Assumptions
- Right pane: each section renders its **native structured input** (text fields, dates, tables, numeric pricing rows, milestone lists) — RJSF-driven from the structured template's field definitions.
- **Notion-style block editor is used only inside Scope, Assumptions, and Notes** — the sections tech_stack §2 marks as needing free text (Tiptap/ProseMirror). All other sections stay strictly structured, since "structured SOW data is always the source of truth."
- **Concurrent-edit state (reserved):** if optimistic locking is adopted (§11 open decision), the Builder reserves a banner state — "This draft was updated elsewhere. Reload to see the latest version before continuing." — shown when a stale `updatedAt` is detected on save.
- **Two independent export actions, visually distinct:**
  - `Export via Print View` — opens `/sows/[id]/print`, browser-native "Save as PDF." Always available, no dependency on Inngest/Gotenberg.
  - `Generate DOCX/PDF` — triggers the Inngest-orchestrated pipeline (populate DOCX template → convert via Gotenberg). Shows pipeline step status (Extract → Populate → Generate DOCX → Convert to PDF → Logged) and can fail/retry independently at any step.

**Workflow tab — two nested layers, not one timeline:**

1. **SOW state strip** (top, PRD §5.9): `Draft → Submitted → In Review → Approved`, with branches to `Rejected`, `Changes Requested`, `Archived`. Only these transitions are shown as reachable; the system enforces them, not the user.
2. **Workflow instance steps** (nested underneath, visible only while status is "In Review," PRD §5.8): vertical timeline of the specific approvers for this instance (e.g. Creator submitted → Manager approved → Legal pending → Finance not yet reached), each step showing actor, decision, and mandatory comment if Rejected/Changes-Requested. This nested timeline is what actually drives the top strip from "In Review" to its next state — it isn't a duplicate progress bar.

**Versions tab:** V1 / V2 / V3, revision compare view. Each revision retains its own submission date, workflow instance, and generated outputs (§5.7).

**Audit tab:** GitHub-style timeline — Created, Updated, Submitted, Workflow Attached, Approved/Rejected, filterable.

### 2.10 Settings

- Organization: name, branding, logo, theme
- Users: link to Users screen
- Storage: usage summary

(API Keys removed — no public API/integration surface is defined for MVP.)

---

## 3. Participant UI

Interface adapts to whichever project role(s) the Participant holds, scoped per project (PRD §4.1, §5.12).

### 3.1 Sidebar

```
Dashboard
Projects
My SOWs
Approvals
Activity
```

### 3.2 Creator Dashboard

Cards: Drafts, Submitted, Returned for Changes, Recently Updated
Below: recent projects, recent edits

**Creator Project view:** tabs Overview, SOWs, Files only — no user management, no templates (tenant-admin-exclusive per §5.4).

**Creator SOW Builder:** same structured-fields-plus-scoped-Notion-editor pattern as §2.9, minus Tenant-Admin-only actions (no template editing). Includes: auto-save, inline comments, Preview, the same two independent export affordances, and the workflow status strip (read + submit only, no step-approval controls).

### 3.3 Approver Dashboard

Cards: Pending, Approved Today, Rejected, Average Review Time
Queue table: SOW, Project, Requester, Deadline, Open

**Approver Screen** — split layout:

- Left: document (read-only structured view + rendered free-text sections)
- Right: Workflow instance steps (this SOW's approval history so far), Comments, Decision panel
- Decision buttons: Approve / Reject / Request Changes — comment required on Reject/Request Changes (§5.8)

### 3.4 Executive Viewer Dashboard

Charts only, no editing: Pipeline by Status, Average Approval Time, Blocked SOWs, Recent Approvals, Audit History — scoped to their assigned project(s).

### 3.5 Mobile UI

- Bottom navigation: Home, Projects, Approvals, Profile
- SOW editor: collapsible sections (same structured/Notion-scoped split as desktop)
- Approvals: swipeable Approve / Reject / Comment

---

## 4. Global UI Components

Shared across all personas (Notifications intentionally **excluded** — see §0.1):

- Universal Command Palette (Ctrl+K)
- Global Search (Clients, Projects, SOWs, Templates)
- Activity Feed
- Breadcrumb Navigation
- Recent Items
- Keyboard Shortcuts
- Version History Drawer
- Audit Timeline component
- Right-side Details Drawer (Figma-style inspector)
- Floating Quick Create button
- User Mention & Comments (within SOW free-text sections and approval comments)
- Dark/Light Mode
- Responsive Tables with column customization
- Saved filters and views

---

## 5. Open items to confirm before build

Carried from PRD §11, surfaced here because they affect specific screens above:

1. **Tenant onboarding model** — this spec defaults to Superadmin-provisioned (§1.3). If self-serve is chosen instead, the Superadmin Organizations section needs the request/approval variant reinstated.
2. **Optimistic locking** — the Builder's conflict banner (§2.9) is reserved but not required; confirm whether it ships in MVP.
3. **Soft deletes** — if adopted, Clients/Projects/Templates list screens need an "Archived" filter state, not currently specced.
4. **Project role assignment UX** — confirm whether Tenant Admins assign roles per-project only (as specced in §2.4) or need a bulk "add participant to N projects with role X" flow added alongside it.
