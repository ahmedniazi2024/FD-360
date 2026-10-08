// @ts-nocheck

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDuration, formatDate } from "@/lib/utils";
export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [{ data: employees }, { data: sessions7d }, { data: sessions30d }, { data: tasks }, { data: reports }] = await Promise.all([
    supabase.from("profiles").select("id,full_name,job_title").eq("role", "employee").eq("status", "active"),
    supabase.from("work_sessions").select("*").gte("date", sevenDaysAgo.toISOString().split("T")[0]).eq("status", "ended"),
    supabase.from("work_sessions").select("user_id,net_working_seconds,date").gte("date", thirtyDaysAgo.toISOString().split("T")[0]),
    supabase.from("tasks").select("status,assigned_to"),
    supabase.from("work_reports").select("status,user_id").gte("created_at", thirtyDaysAgo.toISOString()),
  ]);

  const totalHours7d = (sessions7d ?? []).reduce((a, s) => a + s.net_working_seconds, 0);
  const totalHours30d = (sessions30d ?? []).reduce((a, s) => a + s.net_working_seconds, 0);
  const completedTasks = (tasks ?? []).filter((t) => t.status === "completed").length;
  const totalTasks = (tasks ?? []).length;
  const approvedReports = (reports ?? []).filter((r) => r.status === "approved").length;

  const employeeStats = (employees ?? []).map((emp) => {
    const empSessions = (sessions30d ?? []).filter((s) => s.user_id === emp.id);
    const hours = empSessions.reduce((a, s) => a + s.net_working_seconds, 0);
    const empTasks = (tasks ?? []).filter((t) => t.assigned_to === emp.id);
    const completed = empTasks.filter((t) => t.status === "completed").length;
    const empReports = (reports ?? []).filter((r) => r.user_id === emp.id).length;
    return { ...emp, hours, sessions: empSessions.length, completed, total: empTasks.length, reports: empReports };
  }).sort((a, b) => b.hours - a.hours);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Analytics & Productivity</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Hours (7d)", value: formatDuration(totalHours7d) },
          { label: "Total Hours (30d)", value: formatDuration(totalHours30d) },
          { label: "Task Completion Rate", value: totalTasks ? `${Math.round(completedTasks / totalTasks * 100)}%` : "N/A" },
          { label: "Reports Approved (30d)", value: approvedReports },
        ].map(({ label, value }) => (
          <Card key={label}><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{value}</p><p className="text-xs text-gray-500">{label}</p></CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Employee Productivity (Last 30 Days)</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="pb-3 font-medium">Employee</th>
                  <th className="pb-3 font-medium">Working Days</th>
                  <th className="pb-3 font-medium">Total Hours</th>
                  <th className="pb-3 font-medium">Avg/Day</th>
                  <th className="pb-3 font-medium">Tasks Done</th>
                  <th className="pb-3 font-medium">Reports</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employeeStats.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <p className="font-medium">{e.full_name}</p>
                      <p className="text-xs text-gray-400">{e.job_title}</p>
                    </td>
                    <td className="py-3">{e.sessions}</td>
                    <td className="py-3">{formatDuration(e.hours)}</td>
                    <td className="py-3">{e.sessions ? formatDuration(Math.round(e.hours / e.sessions)) : "N/A"}</td>
                    <td className="py-3">{e.completed}/{e.total}</td>
                    <td className="py-3">{e.reports}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
