-- Patch 1: Fix profiles_update_admin to include WITH CHECK
-- This prevents privilege escalation (owners cannot set role to super_admin)
drop policy if exists "profiles_update_admin" on profiles;
create policy "profiles_update_admin" on profiles
  for update
  using (get_my_role() in ('owner', 'super_admin'))
  with check (
    get_my_role() in ('owner', 'super_admin')
    -- Prevent setting role to super_admin unless caller is super_admin
    and (new.role != 'super_admin' or get_my_role() = 'super_admin')
  );

-- Patch 2: The handle_new_user trigger is SECURITY DEFINER and bypasses RLS.
-- The profiles_insert_admin policy is correct — it blocks direct inserts from non-admins,
-- while the trigger (security definer) can still insert freely.
-- No change needed here.

-- Patch 3: Ensure the get_my_role() function handles the case where
-- the calling user doesn't have a profile yet (e.g., during profile creation trigger)
create or replace function get_my_role()
returns text as $$
  select coalesce(
    (select role from profiles where id = auth.uid()),
    'employee'
  )
$$ language sql security definer stable;
