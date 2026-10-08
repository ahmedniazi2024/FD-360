// @ts-nocheck

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TimeTracker } from "@/components/dashboard/TimeTracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskStatusBadge, ReportStatusBadge } from "@/components/ui/StatusBadge";
import { CheckSquare, FileText, Megaphone, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: tasks }, { data: reports }, { data: announcements }, { data: todaySession }] = await Promise.all([
    supabase.from("tasks").select("id,title,status,priority,due_date").eq("assigned_to", user.id).neq("status", "completed").neq("status", "cancelled").order("due_date").limit(5),
    supabase.from("work_reports").select("id,date,status,worked_on").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("announcements").select("id,title,content,created_at,is_pinned").order("is_pinned", { ascending: false }).order("created_at", { ascending: false }).limit(5),
    supabase.from("work_sessions").select("*").eq("user_id", user.id).eq("date", new Date().toISOString().split("T")[0]).order("created_at", { ascending: false }).limit(1).single(),
  ]);

  const pendingTasks = tasks?.filter((t) => t.status !== "completed") ?? [];
  const todayReport = reports?.find((r) => r.date === new Date().toISOString().split("T")[0]);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingTasks.length}</p>
              <p className="text-xs text-gray-500">Pending Tasks</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{reports?.filter((r) => r.status === "approved").length ?? 0}</p>
              <p className="text-xs text-gray-500">Reports Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{todaySession.data ? "Active" : "Not In"}</p>
              <p className="text-xs text-gray-500">Today's Status</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{announcements?.length ?? 0}</p>
              <p className="text-xs text-gray-500">Announcements</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time Tracker */}
        <div className="lg:col-span-1">
          <TimeTracker userId={user.id} />
          {!todayReport && (
            <Card className="mt-4 border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-yellow-800">⚠️ Remember to submit your daily work report!</p>
                <Link href="/dashboard/reports" className="text-xs text-yellow-700 underline mt-1 block">Submit report →</Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tasks */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                My Tasks
                <Link href="/dashboard/tasks" className="text-xs text-blue-600 font-normal">View all</Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingTasks.length === 0 && <p className="text-sm text-gray-500">No pending tasks</p>}
              {pendingTasks.map((t) => (
                <div key={t.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.title}</p>
                    {t.due_date && <p className="text-xs text-gray-500">{formatDate(t.due_date)}</p>}
                  </div>
                  <TaskStatusBadge status={t.status} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Announcements */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Announcements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {announcements?.length === 0 && <p className="text-sm text-gray-500">No announcements</p>}
              {announcements?.map((a) => (
                <div key={a.id} className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">{a.title}</p>
                    {a.is_pinned && <Badge variant="info" className="text-xs">Pinned</Badge>}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{a.content}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(a.created_at)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
