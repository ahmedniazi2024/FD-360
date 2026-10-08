
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ReportStatusBadge } from "@/components/ui/StatusBadge";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import type { WorkReport } from "@/types/database";
import { Plus, X } from "lucide-react";

export default function ReportsPage() {
  const supabase = createClient();
  const [reports, setReports] = useState<WorkReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ worked_on: "", tasks_completed: "", tasks_pending: "", blockers: "", notes: "" });

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("work_reports").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setReports(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.worked_on.trim()) { toast.error("Please describe what you worked on"); return; }
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const existing = reports.find((r) => r.date === today);
    if (existing) { toast.error("You already submitted a report for today"); setSubmitting(false); return; }
    const { data, error } = await supabase.from("work_reports").insert({ user_id: user.id, date: today, ...form, status: "pending" }).select().single();
    if (error) { toast.error("Failed to submit report"); setSubmitting(false); return; }
    setReports([data, ...reports]);
    setForm({ worked_on: "", tasks_completed: "", tasks_pending: "", blockers: "", notes: "" });
    setShowForm(false);
    toast.success("Report submitted successfully!");
    setSubmitting(false);
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map((i) => <div key={i} className="h-32 bg-gray-200 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Work Reports</h2>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Submit Report</>}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Today's Work Report</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>What did you work on today? *</Label>
              <Textarea placeholder="Describe your work activities..." value={form.worked_on} onChange={(e) => setForm({ ...form, worked_on: e.target.value })} className="mt-1" rows={3} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tasks Completed</Label>
                <Textarea placeholder="List completed tasks..." value={form.tasks_completed} onChange={(e) => setForm({ ...form, tasks_completed: e.target.value })} className="mt-1" rows={3} />
              </div>
              <div>
                <Label>Tasks Still Pending</Label>
                <Textarea placeholder="List pending tasks..." value={form.tasks_pending} onChange={(e) => setForm({ ...form, tasks_pending: e.target.value })} className="mt-1" rows={3} />
              </div>
            </div>
            <div>
              <Label>Blockers / Problems</Label>
              <Textarea placeholder="Any issues or blockers?" value={form.blockers} onChange={(e) => setForm({ ...form, blockers: e.target.value })} className="mt-1" rows={2} />
            </div>
            <div>
              <Label>Additional Notes</Label>
              <Textarea placeholder="Anything else to note?" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1" rows={2} />
            </div>
            <Button onClick={submit} disabled={submitting} className="w-full">
              {submitting ? "Submitting..." : "Submit Report"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {reports.length === 0 && <div className="text-center py-16 text-gray-500">No reports submitted yet</div>}
        {reports.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold">{formatDate(r.date)}</p>
                <ReportStatusBadge status={r.status} />
              </div>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium text-gray-700">Worked on: </span><span className="text-gray-600">{r.worked_on}</span></div>
                {r.tasks_completed && <div><span className="font-medium text-gray-700">Completed: </span><span className="text-gray-600">{r.tasks_completed}</span></div>}
                {r.tasks_pending && <div><span className="font-medium text-gray-700">Pending: </span><span className="text-gray-600">{r.tasks_pending}</span></div>}
                {r.blockers && <div><span className="font-medium text-gray-700">Blockers: </span><span className="text-gray-600">{r.blockers}</span></div>}
                {r.reviewer_notes && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium text-blue-700">Reviewer Notes: </span>
                    <span className="text-blue-600">{r.reviewer_notes}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
