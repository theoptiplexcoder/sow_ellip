# shadcn/ui Component Requirements — SOW Platform

**Source:** PRD1.md (MVP Specification, v1.1), tech_stack.md, scaffold.md
**Purpose:** Enumerate every shadcn/ui component the MVP UI needs, and why, so `pnpm dlx shadcn@latest add ...` can be run once against a complete list instead of piecemeal.

Per `scaffold.md` §9, components land in `libs/ui/src/components` and are re-exported from `libs/ui/src/index.ts` for use across `apps/web`.

---

## 1. Install command

```bash
pnpm dlx shadcn@latest add \
  button input label textarea select checkbox radio-group switch \
  form combobox command calendar date-picker \
  table badge card avatar separator tooltip popover \
  dialog alert-dialog sheet drawer dropdown-menu \
  tabs accordion collapsible breadcrumb pagination \
  progress skeleton sonner alert \
  navigation-menu scroll-area hover-card toggle toggle-group chart
```

(shadcn/ui has no dedicated "toast" package anymore — `sonner` is the current recommended toast/notification primitive and is included above for that purpose.)

---

## 2. Component-by-feature mapping

### 2.1 Authentication (PRD §5.1)

| Component        | Use                                                       |
| ---------------- | --------------------------------------------------------- |
| `form`           | Login form (email/password), react-hook-form + Zod wiring |
| `input`, `label` | Email/password fields                                     |
| `button`         | Submit, logout                                            |
| `alert`          | Invalid credentials / session-expired messaging           |
| `card`           | Login page container                                      |

### 2.2 Users, RBAC & Project Role Assignment (PRD §5.2, §4.1)

| Component              | Use                                                                            |
| ---------------------- | ------------------------------------------------------------------------------ |
| `table`                | User list (Tenant Admin view)                                                  |
| `badge`                | Persona badge (Superadmin/Tenant Admin/Participant), Active/Inactive status    |
| `dialog`               | Create user / edit user modals                                                 |
| `alert-dialog`         | Confirm "Deactivate user" (destructive, irreversible-feeling action)           |
| `dropdown-menu`        | Row-level actions (edit, deactivate, view assignments)                         |
| `checkbox`             | Multi-select project roles (Creator / Approver / Executive Viewer) per project |
| `combobox` / `command` | Searchable project picker when assigning a Participant to N projects           |
| `select`               | Single-role dropdowns where only one role applies                              |
| `avatar`               | User identity in lists, assignment pickers, approval step assignees            |
| `sheet`                | Side panel showing a Participant's full per-project role matrix                |

### 2.3 Clients & Projects (PRD §5.3)

| Component                             | Use                                                     |
| ------------------------------------- | ------------------------------------------------------- |
| `table`                               | Clients list, Projects list                             |
| `breadcrumb`                          | Tenant → Client → Project → SOW hierarchy navigation    |
| `dialog`                              | Create/edit Client, Create/edit Project                 |
| `form`, `input`, `textarea`, `select` | Client/Project fields                                   |
| `badge`                               | Project status if tracked                               |
| `avatar` (stacked)                    | Project membership — participants assigned to a project |

### 2.4 Templates — Structured & DOCX (PRD §5.4)

| Component                   | Use                                                                         |
| --------------------------- | --------------------------------------------------------------------------- |
| `tabs`                      | Switch between "Structured Templates" and "DOCX Templates" management views |
| `table`                     | Template list with version column                                           |
| `dialog`                    | Create/edit structured template; upload DOCX template                       |
| `card`                      | Template detail/preview panel                                               |
| `badge`                     | Template version indicator, Active/Archived state                           |
| `accordion` / `collapsible` | Field/placeholder definition editor (structured templates)                  |
| `switch`                    | Toggle default values per field                                             |
| `alert`                     | Placeholder-validation errors on DOCX upload                                |
| `skeleton`                  | Loading state while placeholders are extracted post-upload                  |

### 2.5 Workflow Templates (PRD §5.5)

| Component             | Use                                                        |
| --------------------- | ---------------------------------------------------------- |
| `table` / `card` list | Workflow templates list (name, version, status)            |
| `dialog`              | Create/edit workflow template                              |
| `combobox`            | Assign Participant(s) holding Approver role, per step      |
| `badge`               | Active / Deactivated / Archived state                      |
| `dropdown-menu`       | Activate / deactivate / archive actions                    |
| `separator`           | Visual divider between ordered steps                       |
| `toggle`              | Reorder-mode toggle if used alongside dnd-kit drag handles |
| `alert-dialog`        | Confirm archiving a workflow template                      |

> Note: actual step reordering uses **dnd-kit** (per tech*stack §2), not a shadcn component — shadcn primitives here wrap the \_chrome* around each step (card/badge/dropdown), while dnd-kit handles the drag mechanics.

### 2.6 SOW Builder (PRD §5.6)

| Component                             | Use                                                                                                                                                                                                                   |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tabs` or `accordion`                 | Structured sections: Title, Client, Project, Background, Objectives, Scope, Deliverables, Milestones, Period of Performance, Acceptance Criteria, Performance Requirements, Assumptions, Dependencies, Risks, Pricing |
| `form`, `input`, `textarea`, `select` | Field-level inputs per section (RJSF-driven, but shadcn supplies the rendered primitives)                                                                                                                             |
| `date-picker`, `calendar`, `popover`  | Period of Performance, Milestone dates                                                                                                                                                                                |
| `card`                                | Draft container, preview panel                                                                                                                                                                                        |
| `button`                              | Save draft, Preview, Submit for approval                                                                                                                                                                              |
| `badge`                               | SOW state indicator (Draft/Submitted/etc., shared with §2.8)                                                                                                                                                          |
| `combobox`                            | Template selection when generating from a template                                                                                                                                                                    |
| `sonner`                              | "Draft saved" / "Submitted for approval" confirmations                                                                                                                                                                |

### 2.7 SOW Revisions (PRD §5.7)

| Component           | Use                                                               |
| ------------------- | ----------------------------------------------------------------- |
| `table`             | Revision history list per SOW                                     |
| `badge`             | Revision status per entry                                         |
| `separator`         | Divide revision entries in a timeline view                        |
| `sheet` or `dialog` | View a prior revision's snapshot without leaving the current page |

### 2.8 Workflow Execution (PRD §5.8, §5.9)

| Component      | Use                                                                                          |
| -------------- | -------------------------------------------------------------------------------------------- |
| `card`         | Each Workflow Instance Step in the approval timeline                                         |
| `badge`        | Step/SOW state: Draft, Submitted, In Review, Approved, Rejected, Changes Requested, Archived |
| `button`       | Approve / Reject / Request Changes actions                                                   |
| `dialog`       | Comment-entry modal (comments are mandatory on Reject/Request Changes)                       |
| `textarea`     | Comment body                                                                                 |
| `alert-dialog` | Confirm Reject (destructive-leaning, workflow-altering action)                               |
| `avatar`       | Approver identity per step                                                                   |
| `tooltip`      | Explain why an action is disabled (e.g., not the assigned Approver)                          |

### 2.9 Document Generation Pipeline (PRD §5.10, tech_stack §6)

| Component  | Use                                                                                             |
| ---------- | ----------------------------------------------------------------------------------------------- |
| `progress` | Visualize the 5-step pipeline (Extract → Populate → Generate DOCX → Convert to PDF → Audit log) |
| `badge`    | Per-step status: pending/running/succeeded/failed                                               |
| `alert`    | Surface a failed step (e.g., Gotenberg conversion timeout) without blocking the rest            |
| `button`   | Retry a failed step, download DOCX/PDF, "Save as PDF" trigger on the independent print path     |
| `skeleton` | Loading state while a document is being generated                                               |

### 2.10 Audit Log (PRD §5.11)

| Component                 | Use                                                                 |
| ------------------------- | ------------------------------------------------------------------- |
| `table`                   | Append-only audit log list (actor, entity, before/after, timestamp) |
| `badge`                   | Action-type indicator (created/updated/approved/rejected/etc.)      |
| `popover` or `hover-card` | Show JSONB metadata diff on hover/click without leaving the table   |
| `pagination`              | Paging through potentially large audit histories                    |
| `select`                  | Filter by entity type / action / date range                         |

### 2.11 Dashboard (PRD §5.12)

| Component     | Use                                                                            |
| ------------- | ------------------------------------------------------------------------------ |
| `card`        | Stat tiles: Total Tenants, Active Users, My Drafts, Pending Approval, etc.     |
| `tabs`        | Switch between dashboard views when a Participant holds multiple project roles |
| `chart`       | Wraps Recharts per tech_stack §2 (status breakdowns, approval-time trends)     |
| `badge`       | Quick status counts within cards                                               |
| `scroll-area` | Recent Activity / Audit History feed                                           |
| `hover-card`  | Preview a SOW/tenant on hover from a dashboard list                            |

### 2.12 Global navigation & app shell

| Component         | Use                                                                         |
| ----------------- | --------------------------------------------------------------------------- |
| `navigation-menu` | Top-level nav across Tenants/Clients/Projects/Templates/Workflows/Dashboard |
| `dropdown-menu`   | User account menu (profile, logout)                                         |
| `breadcrumb`      | Deep-hierarchy pages (already noted in §2.3)                                |
| `sheet`           | Mobile/collapsed nav drawer                                                 |
| `separator`       | Section dividers in the app shell                                           |
| `tooltip`         | Icon-only nav item labels                                                   |

### 2.13 Cross-cutting / infrastructure

| Component      | Use                                                                                                                                                                                                                                                                                      |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sonner`       | App-wide toast notifications (save, submit, error, retry) — note: notifications-as-a-feature are deferred to v2 (tech_stack §10), but in-session UI toasts for the current user's own actions are still needed and are distinct from that deferred email/Slack/Teams notification system |
| `skeleton`     | Loading states across tables, cards, and detail panels while TanStack Query fetches resolve                                                                                                                                                                                              |
| `alert-dialog` | Any destructive/irreversible confirm (deactivate user, reject SOW, archive workflow/template)                                                                                                                                                                                            |
| `form`         | Every React Hook Form + Zod-backed form in the app (shared wrapper)                                                                                                                                                                                                                      |

---

## 3. Components evaluated and intentionally excluded

| Component      | Why not needed                                                                                              |
| -------------- | ----------------------------------------------------------------------------------------------------------- |
| `carousel`     | No image/media galleries in scope                                                                           |
| `aspect-ratio` | No media embeds requiring fixed ratios                                                                      |
| `input-otp`    | No 2FA/OTP flow — Better Auth email/password only (PRD §5.1)                                                |
| `menubar`      | `navigation-menu` + `dropdown-menu` cover app navigation needs; a desktop-app-style menu bar is unnecessary |
| `resizable`    | No split-pane/resizable-panel UI in the MVP scope                                                           |
| `context-menu` | Right-click menus aren't part of any described interaction; `dropdown-menu` covers row/item actions         |

---

## 4. Notes on adjacent (non-shadcn) UI libraries already locked in

These are **not** shadcn components but work alongside them, per tech_stack §2 — listed here only to avoid duplicating effort:

- **Tiptap / ProseMirror** — rich text within Scope/Assumptions/Notes sections only (not shadcn)
- **react-jsonschema-form (RJSF)** — drives dynamic structured forms; renders into shadcn `input`/`select`/`textarea` primitives via custom RJSF theme
- **TanStack Table** — headless table logic; shadcn `table` supplies the styled markup it renders into
- **dnd-kit** — drag-and-drop mechanics for workflow-step and structured-field reordering; shadcn components provide the visual chrome, not the drag logic
- **Recharts** — underlying chart engine; shadcn's `chart` component is a styling wrapper around it, not a replacement

---

## 5. Summary install list (flat)

```
button, input, label, textarea, select, checkbox, radio-group, switch,
form, combobox, command, calendar, date-picker,
table, badge, card, avatar, separator, tooltip, popover,
dialog, alert-dialog, sheet, drawer, dropdown-menu,
tabs, accordion, collapsible, breadcrumb, pagination,
progress, skeleton, sonner, alert,
navigation-menu, scroll-area, hover-card, toggle, toggle-group, chart
```
