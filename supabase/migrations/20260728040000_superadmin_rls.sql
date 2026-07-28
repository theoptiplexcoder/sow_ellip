-- RLS policies for SuperAdmin tables + updated auth trigger
-- Applied after initial RLS migration

-- 1. Update auth trigger to handle signup flow (no org_id at signup time)

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

-- Replace trigger to fire on both insert and update of raw_app_meta_data
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of raw_app_meta_data on auth.users
  for each row execute function public.handle_new_auth_user();

-- 2. SuperAdmin: self-row only
alter table public."SuperAdmin" enable row level security;

create policy superadmin_self_select on public."SuperAdmin"
  for select using (auth.uid()::text = id);

-- 3. OrganizationSignupRequest: superadmin reads; service-role writes (no policy = service-role only for writes)
alter table public."OrganizationSignupRequest" enable row level security;

create policy signup_request_superadmin_select on public."OrganizationSignupRequest"
  for select using (
    exists (
      select 1 from public."SuperAdmin" sa where sa.id = auth.uid()::text
    )
  );

-- 4. SuperAdminAuditLog: self-row only
alter table public."SuperAdminAuditLog" enable row level security;

create policy superadmin_audit_self_select on public."SuperAdminAuditLog"
  for select using (
    exists (
      select 1 from public."SuperAdmin" sa
      where sa.id = auth.uid()::text
        and sa.id = "SuperAdminAuditLog"."superAdminId"
    )
  );
