
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { LeaveActions } from "@/components/owner/LeaveActions";

export default async function OwnerLeavePage() {
  const supabase = await createClient();
  const { data: requests } = await supabase.from("leave_requests").select("*, profiles(full_name)").order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Leave Requests</h2>
      <div className="space-y-3">
        {requests?.map((r) => {
          const p = r.profiles as { full_name: string } | null;
          return (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{p?.full_name}</p>
                    <p className="text-sm text-gray-600 capitalize">{r.type} Leave</p>
                    <p className="text-sm text-gray-500">{formatDate(r.start_date)} — {formatDate(r.end_date)}</p>
                    {r.reason && <p className="text-xs text-gray-400 mt-1">{r.reason}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={r.status === "approved" ? "success" : r.status === "rejected" ? "destructive" : "warning"}>{r.status}</Badge>
                    {r.status === "pending" && <LeaveActions requestId={r.id} />}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
