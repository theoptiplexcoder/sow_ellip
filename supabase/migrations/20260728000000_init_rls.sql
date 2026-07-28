-- Tenant-isolation setup for SOW platform
-- See docs/schema.md for rationale
-- Table/column names match Prisma conventions (PascalCase tables, camelCase columns)

-- 1. Helper function: extract organization_id from JWT
create or replace function current_org_id() returns text
language sql stable
as $$
  select nullif(auth.jwt() -> 'app_metadata' ->> 'organization_id', '')
$$;

-- 2. Direct tenant-scoped tables (have their own organizationId column)

-- Organization: self-row only
alter table public."Organization" enable row level security;

create policy tenant_isolation_select on public."Organization"
  for select using (id = current_org_id());

create policy tenant_isolation_write on public."Organization"
  for all using (id = current_org_id())
  with check (id = current_org_id());

-- User
alter table public."User" enable row level security;

create policy tenant_isolation_select on public."User"
  for select using ("organizationId" = current_org_id());

create policy tenant_isolation_write on public."User"
  for all using ("organizationId" = current_org_id())
  with check ("organizationId" = current_org_id());

-- Client
alter table public."Client" enable row level security;

create policy tenant_isolation_select on public."Client"
  for select using ("organizationId" = current_org_id());

create policy tenant_isolation_write on public."Client"
  for all using ("organizationId" = current_org_id())
  with check ("organizationId" = current_org_id());

-- Project
alter table public."Project" enable row level security;

create policy tenant_isolation_select on public."Project"
  for select using ("organizationId" = current_org_id());

create policy tenant_isolation_write on public."Project"
  for all using ("organizationId" = current_org_id())
  with check ("organizationId" = current_org_id());

-- Template
alter table public."Template" enable row level security;

create policy tenant_isolation_select on public."Template"
  for select using ("organizationId" = current_org_id());

create policy tenant_isolation_write on public."Template"
  for all using ("organizationId" = current_org_id())
  with check ("organizationId" = current_org_id());

-- Workflow
alter table public."Workflow" enable row level security;

create policy tenant_isolation_select on public."Workflow"
  for select using ("organizationId" = current_org_id());

create policy tenant_isolation_write on public."Workflow"
  for all using ("organizationId" = current_org_id())
  with check ("organizationId" = current_org_id());

-- Sow
alter table public."Sow" enable row level security;

create policy tenant_isolation_select on public."Sow"
  for select using ("organizationId" = current_org_id());

create policy tenant_isolation_write on public."Sow"
  for all using ("organizationId" = current_org_id())
  with check ("organizationId" = current_org_id());

-- AuditLog (denormalized organizationId — see schema.md notes)
alter table public."AuditLog" enable row level security;

create policy tenant_isolation_select on public."AuditLog"
  for select using ("organizationId" = current_org_id());

create policy tenant_isolation_write on public."AuditLog"
  for all using ("organizationId" = current_org_id())
  with check ("organizationId" = current_org_id());

-- 3. Child tables (inherit tenancy via parent join)

-- WorkflowStep → inherits from Workflow
alter table public."WorkflowStep" enable row level security;

create policy tenant_isolation_select on public."WorkflowStep"
  for select using (
    exists (
      select 1 from public."Workflow" w
      where w.id = "WorkflowStep"."workflowId"
        and w."organizationId" = current_org_id()
    )
  );

create policy tenant_isolation_write on public."WorkflowStep"
  for all using (
    exists (
      select 1 from public."Workflow" w
      where w.id = "WorkflowStep"."workflowId"
        and w."organizationId" = current_org_id()
    )
  )
  with check (
    exists (
      select 1 from public."Workflow" w
      where w.id = "WorkflowStep"."workflowId"
        and w."organizationId" = current_org_id()
    )
  );

-- SowDeliverable → inherits from Sow
alter table public."SowDeliverable" enable row level security;

create policy tenant_isolation_select on public."SowDeliverable"
  for select using (
    exists (
      select 1 from public."Sow" s
      where s.id = "SowDeliverable"."sowId"
        and s."organizationId" = current_org_id()
    )
  );

create policy tenant_isolation_write on public."SowDeliverable"
  for all using (
    exists (
      select 1 from public."Sow" s
      where s.id = "SowDeliverable"."sowId"
        and s."organizationId" = current_org_id()
    )
  )
  with check (
    exists (
      select 1 from public."Sow" s
      where s.id = "SowDeliverable"."sowId"
        and s."organizationId" = current_org_id()
    )
  );

-- SowMilestone → inherits from Sow
alter table public."SowMilestone" enable row level security;

create policy tenant_isolation_select on public."SowMilestone"
  for select using (
    exists (
      select 1 from public."Sow" s
      where s.id = "SowMilestone"."sowId"
        and s."organizationId" = current_org_id()
    )
  );

create policy tenant_isolation_write on public."SowMilestone"
  for all using (
    exists (
      select 1 from public."Sow" s
      where s.id = "SowMilestone"."sowId"
        and s."organizationId" = current_org_id()
    )
  )
  with check (
    exists (
      select 1 from public."Sow" s
      where s.id = "SowMilestone"."sowId"
        and s."organizationId" = current_org_id()
    )
  );

-- SowWorkflow → inherits from Sow (via sowId → Sow.id)
alter table public."SowWorkflow" enable row level security;

create policy tenant_isolation_select on public."SowWorkflow"
  for select using (
    exists (
      select 1 from public."Sow" s
      where s.id = "SowWorkflow"."sowId"
        and s."organizationId" = current_org_id()
    )
  );

create policy tenant_isolation_write on public."SowWorkflow"
  for all using (
    exists (
      select 1 from public."Sow" s
      where s.id = "SowWorkflow"."sowId"
        and s."organizationId" = current_org_id()
    )
  )
  with check (
    exists (
      select 1 from public."Sow" s
      where s.id = "SowWorkflow"."sowId"
        and s."organizationId" = current_org_id()
    )
  );

-- ApprovalStep → inherits from SowWorkflow → Sow
alter table public."ApprovalStep" enable row level security;

create policy tenant_isolation_select on public."ApprovalStep"
  for select using (
    exists (
      select 1 from public."SowWorkflow" sw
      join public."Sow" s on s.id = sw."sowId"
      where sw.id = "ApprovalStep"."sowWorkflowId"
        and s."organizationId" = current_org_id()
    )
  );

create policy tenant_isolation_write on public."ApprovalStep"
  for all using (
    exists (
      select 1 from public."SowWorkflow" sw
      join public."Sow" s on s.id = sw."sowId"
      where sw.id = "ApprovalStep"."sowWorkflowId"
        and s."organizationId" = current_org_id()
    )
  )
  with check (
    exists (
      select 1 from public."SowWorkflow" sw
      join public."Sow" s on s.id = sw."sowId"
      where sw.id = "ApprovalStep"."sowWorkflowId"
        and s."organizationId" = current_org_id()
    )
  );

-- 4. Auth trigger: provision public."User" row on auth.users insert/update

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Skip until an organization_id claim exists (signup time = no org yet)
  if new.raw_app_meta_data ->> 'organization_id' is null then
    return new;
  end if;

  -- Skip if already provisioned (idempotent on re-trigger)
  if exists (select 1 from public."User" where id = new.id) then
    return new;
  end if;

  insert into public."User" (id, "organizationId", email, name, role)
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

-- 5. SuperAdmin tables (outside tenant model — no organization_id)

-- SuperAdmin: self-row only
alter table public."SuperAdmin" enable row level security;

create policy superadmin_self_select on public."SuperAdmin"
  for select using (auth.uid() = id);

-- OrganizationSignupRequest: service-role writes; superadmin reads reviewed requests
alter table public."OrganizationSignupRequest" enable row level security;

create policy signup_request_superadmin_select on public."OrganizationSignupRequest"
  for select using (
    exists (
      select 1 from public."SuperAdmin" sa where sa.id = auth.uid()
    )
  );

-- SuperAdminAuditLog: self-row only
alter table public."SuperAdminAuditLog" enable row level security;

create policy superadmin_audit_self_select on public."SuperAdminAuditLog"
  for select using (
    exists (
      select 1 from public."SuperAdmin" sa
      where sa.id = auth.uid()
        and sa.id = "SuperAdminAuditLog"."superAdminId"
    )
  );
