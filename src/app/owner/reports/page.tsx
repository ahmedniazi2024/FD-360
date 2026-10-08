// @ts-nocheck

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { ReportStatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
export const dynamic = 'force-dynamic';

export default async function OwnerReportsPage() {
  const supabase = await createClient();
  const { data: reports } = await supabase.from("work_reports").select("*, profiles(full_name, avatar_url)").order("date", { ascending: false }).limit(50);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Work Reports</h2>
      <div className="space-y-4">
        {reports?.map((r) => {
          const p = r.profiles as { full_name: string; avatar_url: string | null } | null;
          return (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      {p?.avatar_url ? <img src={p.avatar_url} className="w-9 h-9 rounded-full object-cover" alt="" /> : p?.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{p?.full_name}</p>
                      <p className="text-xs text-gray-500">{formatDate(r.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ReportStatusBadge status={r.status} />
                    <Link href={`/owner/employees/${r.user_id}`} className="text-xs text-blue-600 hover:underline">View profile</Link>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <p><span className="font-medium text-gray-700">Worked on: </span><span className="text-gray-600">{r.worked_on}</span></p>
                  {r.tasks_completed && <p><span className="font-medium text-gray-700">Completed: </span><span className="text-gray-600">{r.tasks_completed}</span></p>}
                  {r.blockers && <p><span className="font-medium text-red-700">Blockers: </span><span className="text-red-600">{r.blockers}</span></p>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
