
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
export const dynamic = 'force-dynamic';

export default async function AnnouncementsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("announcements").select("*, profiles(full_name)").order("is_pinned", { ascending: false }).order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Company Announcements</h2>
      <div className="space-y-4">
        {(!data || data.length === 0) && <p className="text-gray-500 text-center py-16">No announcements</p>}
        {data?.map((a) => (
          <Card key={a.id} className={a.is_pinned ? "border-blue-300 bg-blue-50" : ""}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{a.title}</h3>
                    {a.is_pinned && <Badge variant="info">Pinned</Badge>}
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{a.content}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Posted by {(a.profiles as { full_name: string } | null)?.full_name ?? "Management"} · {formatDate(a.created_at)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
