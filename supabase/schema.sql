
-- Enable UUID
create extension if not exists "uuid-ossp";

-- Departments
create table departments (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  color text default '#3B82F6',
  created_at timestamptz default now()
);

-- Profiles (extends auth.users)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  full_name text not null default '',
  avatar_url text,
  role text not null default 'employee' check (role in ('super_admin','owner','employee')),
  job_title text,
  department_id uuid references departments(id),
  phone text,
  bio text,
  skills text[],
  status text not null default 'active' check (status in ('active','inactive','deactivated')),
  manager_id uuid references profiles(id),
  joining_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Work sessions
create table work_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  date date not null default current_date,
  clock_in timestamptz not null default now(),
  clock_out timestamptz,
  status text not null default 'working' check (status in ('working','break','ended')),
  net_working_seconds integer not null default 0,
  total_break_seconds integer not null default 0,
  notes text,
  created_at timestamptz default now()
);

-- Breaks
create table breaks (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references work_sessions(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  start_time timestamptz not null default now(),
  end_time timestamptz,
  duration_seconds integer,
  created_at timestamptz default now()
);

-- Tasks
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo','in_progress','waiting','completed','cancelled')),
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  assigned_to uuid references profiles(id),
  assigned_by uuid not null references profiles(id),
  department_id uuid references departments(id),
  due_date timestamptz,
  completed_at timestamptz,
  attachments text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Task comments
create table task_comments (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid not null references tasks(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- Work reports
create table work_reports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  session_id uuid references work_sessions(id),
  date date not null default current_date,
  worked_on text not null,
  tasks_completed text not null default '',
  tasks_pending text not null default '',
  blockers text,
  notes text,
  links text[],
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewer_id uuid references profiles(id),
  reviewer_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Channels
create table channels (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  is_private boolean not null default false,
  created_by uuid not null references profiles(id),
  created_at timestamptz default now()
);

-- Channel members
create table channel_members (
  id uuid primary key default uuid_generate_v4(),
  channel_id uuid not null references channels(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  unique(channel_id, user_id)
);

-- Messages
create table messages (
  id uuid primary key default uuid_generate_v4(),
  channel_id uuid not null references channels(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  reply_to uuid references messages(id),
  attachments text[],
  edited_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Direct conversations
create table direct_conversations (
  id uuid primary key default uuid_generate_v4(),
  participant_1 uuid not null references profiles(id),
  participant_2 uuid not null references profiles(id),
  created_at timestamptz default now(),
  unique(participant_1, participant_2)
);

-- Direct messages
create table direct_messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references direct_conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id),
  content text not null,
  attachments text[],
  read_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Notifications
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz default now()
);

-- Announcements
create table announcements (
  id uuid primary key default uuid_generate_v4(),
  created_by uuid not null references profiles(id),
  title text not null,
  content text not null,
  is_pinned boolean not null default false,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Activity logs
create table activity_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id),
  action text not null,
  entity_type text,
  entity_id text,
  details jsonb,
  ip_address text,
  created_at timestamptz default now()
);

-- Blog posts
create table blog_posts (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null default '',
  cover_image text,
  author_id uuid not null references profiles(id),
  published boolean not null default false,
  published_at timestamptz,
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Website pages
create table website_pages (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title text not null,
  content jsonb not null default '{}',
  published boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- SEO settings
create table seo_settings (
  id uuid primary key default uuid_generate_v4(),
  page_slug text not null unique,
  seo_title text,
  meta_description text,
  og_title text,
  og_description text,
  og_image text,
  noindex boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Leave requests
create table leave_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  type text not null,
  reason text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Triggers: auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger trg_profiles_updated_at before update on profiles for each row execute procedure update_updated_at();
create trigger trg_tasks_updated_at before update on tasks for each row execute procedure update_updated_at();
create trigger trg_work_reports_updated_at before update on work_reports for each row execute procedure update_updated_at();
create trigger trg_messages_updated_at before update on messages for each row execute procedure update_updated_at();
create trigger trg_direct_messages_updated_at before update on direct_messages for each row execute procedure update_updated_at();
create trigger trg_announcements_updated_at before update on announcements for each row execute procedure update_updated_at();
create trigger trg_blog_posts_updated_at before update on blog_posts for each row execute procedure update_updated_at();
create trigger trg_website_pages_updated_at before update on website_pages for each row execute procedure update_updated_at();
create trigger trg_seo_settings_updated_at before update on seo_settings for each row execute procedure update_updated_at();
create trigger trg_leave_requests_updated_at before update on leave_requests for each row execute procedure update_updated_at();

-- Auto-create profile on user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'employee')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure handle_new_user();

-- RLS Policies
alter table profiles enable row level security;
alter table work_sessions enable row level security;
alter table breaks enable row level security;
alter table tasks enable row level security;
alter table task_comments enable row level security;
alter table work_reports enable row level security;
alter table channels enable row level security;
alter table channel_members enable row level security;
alter table messages enable row level security;
alter table direct_conversations enable row level security;
alter table direct_messages enable row level security;
alter table notifications enable row level security;
alter table announcements enable row level security;
alter table activity_logs enable row level security;
alter table blog_posts enable row level security;
alter table website_pages enable row level security;
alter table seo_settings enable row level security;
alter table leave_requests enable row level security;
alter table departments enable row level security;

-- Helper: get current user role
create or replace function get_my_role()
returns text as $$
  select role from profiles where id = auth.uid()
$$ language sql security definer stable;

-- Profiles policies
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_update_admin" on profiles for update using (get_my_role() in ('owner','super_admin'));
create policy "profiles_insert_admin" on profiles for insert with check (get_my_role() in ('owner','super_admin'));

-- Work sessions: own or owner/admin
create policy "sessions_own" on work_sessions for all using (auth.uid() = user_id or get_my_role() in ('owner','super_admin'));

-- Breaks
create policy "breaks_own" on breaks for all using (auth.uid() = user_id or get_my_role() in ('owner','super_admin'));

-- Tasks
create policy "tasks_select" on tasks for select using (auth.uid() = assigned_to or auth.uid() = assigned_by or get_my_role() in ('owner','super_admin'));
create policy "tasks_insert" on tasks for insert with check (get_my_role() in ('owner','super_admin'));
create policy "tasks_update_own" on tasks for update using (auth.uid() = assigned_to or get_my_role() in ('owner','super_admin'));
create policy "tasks_delete" on tasks for delete using (get_my_role() in ('owner','super_admin'));

-- Task comments
create policy "task_comments_select" on task_comments for select using (true);
create policy "task_comments_insert" on task_comments for insert with check (auth.uid() = user_id);
create policy "task_comments_delete" on task_comments for delete using (auth.uid() = user_id or get_my_role() in ('owner','super_admin'));

-- Work reports
create policy "reports_own" on work_reports for all using (auth.uid() = user_id or get_my_role() in ('owner','super_admin'));

-- Channels
create policy "channels_select" on channels for select using (true);
create policy "channels_manage" on channels for all using (get_my_role() in ('owner','super_admin'));

-- Channel members
create policy "channel_members_select" on channel_members for select using (true);
create policy "channel_members_manage" on channel_members for all using (get_my_role() in ('owner','super_admin') or auth.uid() = user_id);

-- Messages
create policy "messages_select" on messages for select using (
  exists (select 1 from channel_members where channel_id = messages.channel_id and user_id = auth.uid())
  or get_my_role() in ('owner','super_admin')
);
create policy "messages_insert" on messages for insert with check (
  auth.uid() = user_id and (
    exists (select 1 from channel_members where channel_id = messages.channel_id and user_id = auth.uid())
    or get_my_role() in ('owner','super_admin')
  )
);
create policy "messages_update" on messages for update using (auth.uid() = user_id or get_my_role() in ('owner','super_admin'));
create policy "messages_delete" on messages for delete using (auth.uid() = user_id or get_my_role() in ('owner','super_admin'));

-- Direct conversations
create policy "dm_conv_select" on direct_conversations for select using (auth.uid() = participant_1 or auth.uid() = participant_2);
create policy "dm_conv_insert" on direct_conversations for insert with check (auth.uid() = participant_1 or auth.uid() = participant_2);

-- Direct messages
create policy "dm_messages" on direct_messages for all using (
  exists (
    select 1 from direct_conversations
    where id = direct_messages.conversation_id
    and (participant_1 = auth.uid() or participant_2 = auth.uid())
  )
);

-- Notifications
create policy "notifications_own" on notifications for all using (auth.uid() = user_id);

-- Announcements
create policy "announcements_select" on announcements for select using (true);
create policy "announcements_manage" on announcements for all using (get_my_role() in ('owner','super_admin'));

-- Activity logs
create policy "activity_logs_owner" on activity_logs for select using (get_my_role() in ('owner','super_admin'));
create policy "activity_logs_insert" on activity_logs for insert with check (true);

-- Departments
create policy "departments_select" on departments for select using (true);
create policy "departments_manage" on departments for all using (get_my_role() in ('owner','super_admin'));

-- Blog posts
create policy "blog_select" on blog_posts for select using (published = true or get_my_role() in ('super_admin','owner'));
create policy "blog_manage" on blog_posts for all using (get_my_role() = 'super_admin');

-- Website pages
create policy "pages_select" on website_pages for select using (published = true or get_my_role() = 'super_admin');
create policy "pages_manage" on website_pages for all using (get_my_role() = 'super_admin');

-- SEO settings
create policy "seo_select" on seo_settings for select using (get_my_role() in ('super_admin','owner'));
create policy "seo_manage" on seo_settings for all using (get_my_role() = 'super_admin');

-- Leave requests
create policy "leave_own" on leave_requests for select using (auth.uid() = user_id or get_my_role() in ('owner','super_admin'));
create policy "leave_insert" on leave_requests for insert with check (auth.uid() = user_id);
create policy "leave_update" on leave_requests for update using (get_my_role() in ('owner','super_admin'));

-- Default channels
insert into departments (name, description, color) values
  ('Marketing', 'Digital marketing team', '#3B82F6'),
  ('SEO', 'Search engine optimization', '#10B981'),
  ('Development', 'Web development team', '#8B5CF6'),
  ('Design', 'Creative design team', '#F59E0B'),
  ('Management', 'Company management', '#EF4444');
