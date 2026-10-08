-- Patch 1: Fix profiles_update_admin to include WITH CHECK
drop policy if exists "profiles_update_admin" on profiles;
create policy "profiles_update_admin" on profiles
  for update
  using (get_my_role() in ('owner', 'super_admin'))
  with check (get_my_role() in ('owner', 'super_admin'));

-- Patch 2: Fix get_my_role() to return 'employee' as default instead of NULL
create or replace function get_my_role()
returns text as $$
  select coalesce(
    (select role from profiles where id = auth.uid()),
    'employee'
  )
$$ language sql security definer stable;

-- Patch 3: Fix "Database error creating new user"
-- The handle_new_user trigger runs with auth.uid() = NULL,
-- so the old insert policy blocked it. This allows the trigger (and service role) to insert.
drop policy if exists "profiles_insert_admin" on profiles;
drop policy if exists "profiles_insert" on profiles;
create policy "profiles_insert" on profiles
  for insert
  with check (
    auth.uid() is null
    or get_my_role() in ('owner', 'super_admin')
    or auth.uid() = id
  );
