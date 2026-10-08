
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import type { Announcement } from "@/types/database";
import { Plus, X, Pin } from "lucide-react";

export default function OwnerAnnouncementsPage() {
  const supabase = createClient();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", is_pinned: false });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("announcements").select("*").order("is_pinned", { ascending: false }).order("created_at", { ascending: false });
    setAnnouncements(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.title || !form.content) { toast.error("Title and content required"); return; }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("announcements").insert({ ...form, created_by: user.id });
    if (error) { toast.error("Failed to create"); setLoading(false); return; }
    toast.success("Announcement published!");
    setShowForm(false);
    setForm({ title: "", content: "", is_pinned: false });
    load();
    setLoading(false);
  };

  const remove = async (id: string) => {
    await supabase.from("announcements").delete().eq("id", id);
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    toast.success("Announcement removed");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Announcements</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> New Announcement</>}
        </Button>
      </div>
      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">New Announcement</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" /></div>
            <div><Label>Content *</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} className="mt-1" /></div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_pinned} onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })} className="rounded" />
              <Pin className="w-4 h-4" /> Pin this announcement
            </label>
            <Button onClick={create} disabled={loading} className="w-full">{loading ? "Publishing..." : "Publish"}</Button>
          </CardContent>
        </Card>
      )}
      <div className="space-y-4">
        {announcements.map((a) => (
          <Card key={a.id} className={a.is_pinned ? "border-blue-300 bg-blue-50" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{a.title}</p>
                    {a.is_pinned && <Badge variant="info">Pinned</Badge>}
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{a.content}</p>
                  <p className="text-xs text-gray-400 mt-2">{formatDate(a.created_at)}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => remove(a.id)} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
