
export type UserRole = "super_admin" | "owner" | "employee";
export type SessionStatus = "working" | "break" | "ended";
export type TaskStatus = "todo" | "in_progress" | "waiting" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type ReportStatus = "pending" | "approved" | "rejected";
export type EmployeeStatus = "active" | "inactive" | "deactivated";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  job_title: string | null;
  department_id: string | null;
  phone: string | null;
  bio: string | null;
  skills: string[] | null;
  status: EmployeeStatus;
  manager_id: string | null;
  joining_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  created_at: string;
}

export interface WorkSession {
  id: string;
  user_id: string;
  date: string;
  clock_in: string;
  clock_out: string | null;
  status: SessionStatus;
  net_working_seconds: number;
  total_break_seconds: number;
  notes: string | null;
  created_at: string;
}

export interface Break {
  id: string;
  session_id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  duration_seconds: number | null;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to: string | null;
  assigned_by: string;
  department_id: string | null;
  due_date: string | null;
  completed_at: string | null;
  attachments: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface WorkReport {
  id: string;
  user_id: string;
  session_id: string | null;
  date: string;
  worked_on: string;
  tasks_completed: string;
  tasks_pending: string;
  blockers: string | null;
  notes: string | null;
  links: string[] | null;
  status: ReportStatus;
  reviewer_id: string | null;
  reviewer_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Channel {
  id: string;
  name: string;
  description: string | null;
  is_private: boolean;
  created_by: string;
  created_at: string;
}

export interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  reply_to: string | null;
  attachments: string[] | null;
  edited_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

export interface Announcement {
  id: string;
  created_by: string;
  title: string;
  content: string;
  is_pinned: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  author_id: string;
  published: boolean;
  published_at: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface SeoSettings {
  id: string;
  page_slug: string;
  seo_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  noindex: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebsitePage {
  id: string;
  slug: string;
  title: string;
  content: Record<string, unknown>;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  type: string;
  reason: string | null;
  status: "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

export type ProfileWithDepartment = Profile & { departments?: Department | null };
export type TaskWithProfiles = Task & { assignee?: Profile | null; assigner?: Profile | null };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;
