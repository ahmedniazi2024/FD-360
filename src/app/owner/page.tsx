// @ts-nocheck

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionStatusBadge } from "@/components/ui/StatusBadge";
import { formatDuration, formatTime, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Users, Clock, CheckSquare, FileText, TrendingUp, UserCheck, Coffee, UserX } from "lucide-react";
export const dynamic = 'force-dynamic';

export default async function OwnerDashboard() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const [{ data: employees }, { data: todaySessions }, { data: pendingTasks }, { data: pendingReports }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, job_title, avatar_url, department_id, departments(name, color)").eq("role", "employee").eq("status", "active"),
    supabase.from("work_sessions").select("*").eq("date", today),
    supabase.from("tasks").select("id").eq("status", "todo"),
    supabase.from("work_reports").select("id").eq("status", "pending"),
  ]);

  const sessionMap = new Map((todaySessions ?? []).map((s) => [s.user_id, s]));
  const working = (todaySessions ?? []).filter((s) => s.status === "working").length;
  const onBreak = (todaySessions ?? []).filter((s) => s.status === "break").length;
  const ended = (todaySessions ?? []).filter((s) => s.status === "ended").length;
  const notStarted = (employees ?? []).length - (todaySessions ?? []).length;
  const totalHoursToday = (todaySessions ?? []).reduce((acc, s) => acc + s.net_working_seconds, 0);

  const stats = [
    { label: "Total Employees", value: employees?.length ?? 0, icon: Users, color: "bg-blue-100 text-blue-600" },
    { label: "Currently Working", value: working, icon: UserCheck, color: "bg-green-100 text-green-600" },
    { label: "On Break", value: onBreak, icon: Coffee, color: "bg-yellow-100 text-yellow-600" },
    { label: "Not Checked In", value: notStarted, icon: UserX, color: "bg-gray-100 text-gray-600" },
    { label: "Completed Today", value: ended, icon: CheckSquare, color: "bg-purple-100 text-purple-600" },
    { label: "Total Hours Today", value: formatDuration(totalHoursToday), icon: Clock, color: "bg-indigo-100 text-indigo-600" },
    { label: "Pending Tasks", value: pendingTasks?.length ?? 0, icon: TrendingUp, color: "bg-orange-100 text-orange-600" },
    { label: "Pending Reports", value: pendingReports?.length ?? 0, icon: FileText, color: "bg-red-100 text-red-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Employee Status Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Employee Status — Today</h2>
          <Link href="/owner/employees" className="text-sm text-blue-600">View all employees</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {employees?.map((emp) => {
            const session = sessionMap.get(emp.id);
            const status = session?.status ?? "offline";
            const dept = emp.departments as { name: string; color: string } | null;
            return (
              <Link key={emp.id} href={`/owner/employees/${emp.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {emp.avatar_url ? (
                          <img src={emp.avatar_url} className="w-11 h-11 rounded-full object-cover" alt="" />
                        ) : emp.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{emp.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{emp.job_title ?? "Employee"}</p>
                        {dept && (
                          <span className="inline-block text-xs px-2 py-0.5 rounded-full mt-1" style={{ backgroundColor: dept.color + "20", color: dept.color }}>
                            {dept.name}
                          </span>
                        )}
                      </div>
                      <SessionStatusBadge status={status} />
                    </div>
                    {session && (
                      <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-500">
                        <div><span className="font-medium text-gray-700">In: </span>{formatTime(session.clock_in)}</div>
                        <div><span className="font-medium text-gray-700">Work: </span>{formatDuration(session.net_working_seconds)}</div>
                        <div><span className="font-medium text-gray-700">Break: </span>{formatDuration(session.total_break_seconds)}</div>
                        {session.clock_out && <div><span className="font-medium text-gray-700">Out: </span>{formatTime(session.clock_out)}</div>}
                      </div>
                    )}
                    {!session && (
                      <p className="mt-3 text-xs text-gray-400">Not checked in today</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
