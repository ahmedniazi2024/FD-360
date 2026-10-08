// @ts-nocheck

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
export const dynamic = 'force-dynamic';

export default async function AdminActivityPage() {
  const supabase = await createClient();
  const { data: logs } = await supabase.from("activity_logs").select("*, profiles(full_name)").order("created_at", { ascending: false }).limit(100);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Activity Logs</h2>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="p-4 font-medium">User</th>
                  <th className="p-4 font-medium">Action</th>
                  <th className="p-4 font-medium">Entity</th>
                  <th className="p-4 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs?.map((l) => {
                  const p = l.profiles as { full_name: string } | null;
                  return (
                    <tr key={l.id} className="hover:bg-gray-50">
                      <td className="p-4">{p?.full_name ?? "System"}</td>
                      <td className="p-4 font-mono text-xs bg-gray-50 rounded">{l.action}</td>
                      <td className="p-4 text-gray-500">{l.entity_type ? `${l.entity_type} (${l.entity_id?.slice(0, 8)}...)` : "—"}</td>
                      <td className="p-4 text-gray-400 text-xs">{new Date(l.created_at).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
