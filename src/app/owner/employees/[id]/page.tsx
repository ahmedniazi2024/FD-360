// @ts-nocheck

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SessionStatusBadge, TaskStatusBadge, ReportStatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatDuration, formatTime } from "@/lib/utils";
import { Mail, Phone, Calendar, Briefcase, Building2 } from "lucide-react";
import Link from "next/link";
import { EmployeeReportReview } from "@/components/owner/EmployeeReportReview";

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const [{ data: profile }, { data: sessions }, { data: tasks }, { data: reports }] = await Promise.all([
    supabase.from("profiles").select("*, departments(name, color)").eq("id", id).single(),
    supabase.from("work_sessions").select("*").eq("user_id", id).order("date", { ascending: false }).limit(30),
    supabase.from("tasks").select("*").eq("assigned_to", id).order("created_at", { ascending: false }).limit(20),
    supabase.from("work_reports").select("*").eq("user_id", id).order("date", { ascending: false }).limit(10),
  ]);

  if (!profile) notFound();

  const todaySession = sessions?.find((s) => s.date === today);
  const totalHoursThisWeek = sessions?.filter((s) => {
    const d = new Date(s.date);
    const now = new Date();
    const weekAgo = new Date(now.setDate(now.getDate() - 7));
    return d >= weekAgo;
  }).reduce((a, s) => a + s.net_working_seconds, 0) ?? 0;

  const dept = profile.departments as { name: string; color: string } | null;
  const completedTasks = tasks?.filter((t) => t.status === "completed").length ?? 0;
  const pendingTasks = tasks?.filter((t) => t.status !== "completed" && t.status !== "cancelled").length ?? 0;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
              {profile.avatar_url ? <img src={profile.avatar_url} className="w-20 h-20 rounded-full object-cover" alt="" /> : profile.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold">{profile.full_name}</h1>
                <Badge variant={profile.status === "active" ? "success" : "destructive"} className="capitalize">{profile.status}</Badge>
                {todaySession && <SessionStatusBadge status={todaySession.status} />}
              </div>
              <p className="text-gray-600">{profile.job_title ?? "Employee"}</p>
              {dept && <span className="text-sm px-2 py-0.5 rounded-full" style={{ backgroundColor: dept.color + "20", color: dept.color }}>{dept.name}</span>}
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{profile.email}</span>
                {profile.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{profile.phone}</span>}
                {profile.joining_date && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Joined {formatDate(profile.joining_date)}</span>}
              </div>
              {profile.bio && <p className="mt-2 text-sm text-gray-600 italic">{profile.bio}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Hours This Week", value: formatDuration(totalHoursThisWeek) },
          { label: "Today Hours", value: todaySession ? formatDuration(todaySession.net_working_seconds) : "N/A" },
          { label: "Tasks Completed", value: completedTasks },
          { label: "Tasks Pending", value: pendingTasks },
        ].map(({ label, value }) => (
          <Card key={label}><CardContent className="p-4 text-center"><p className="text-xl font-bold">{value}</p><p className="text-xs text-gray-500">{label}</p></CardContent></Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance History */}
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Attendance</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {sessions?.slice(0, 10).map((s) => (
              <div key={s.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{formatDate(s.date)}</p>
                  <p className="text-xs text-gray-500">{formatTime(s.clock_in)}{s.clock_out ? ` — ${formatTime(s.clock_out)}` : " — ongoing"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatDuration(s.net_working_seconds)}</p>
                  <SessionStatusBadge status={s.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card>
          <CardHeader><CardTitle className="text-base">Tasks</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {tasks?.slice(0, 8).map((t) => (
              <div key={t.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <p className="text-sm truncate flex-1 mr-2">{t.title}</p>
                <TaskStatusBadge status={t.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Work Reports */}
      <Card>
        <CardHeader><CardTitle className="text-base">Work Reports</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {reports?.length === 0 && <p className="text-gray-500 text-sm">No reports submitted</p>}
          {reports?.map((r) => (
            <div key={r.id} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">{formatDate(r.date)}</p>
                <ReportStatusBadge status={r.status} />
              </div>
              <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Worked on:</span> {r.worked_on}</p>
              {r.tasks_completed && <p className="text-sm text-gray-600"><span className="font-medium">Completed:</span> {r.tasks_completed}</p>}
              {r.blockers && <p className="text-sm text-red-600"><span className="font-medium">Blockers:</span> {r.blockers}</p>}
              {r.status === "pending" && <EmployeeReportReview reportId={r.id} />}
              {r.reviewer_notes && <p className="text-sm text-blue-700 mt-2 bg-blue-50 p-2 rounded"><span className="font-medium">Review Notes:</span> {r.reviewer_notes}</p>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
