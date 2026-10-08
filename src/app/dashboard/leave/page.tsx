
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import type { LeaveRequest } from "@/types/database";
import { Plus, X } from "lucide-react";

export default function LeavePage() {
  const supabase = createClient();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ start_date: "", end_date: "", type: "annual", reason: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("leave_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => setRequests(data ?? []));
    });
  }, []);

  const submit = async () => {
    if (!form.start_date || !form.end_date) { toast.error("Please select dates"); return; }
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from("leave_requests").insert({ user_id: user.id, ...form, status: "pending" }).select().single();
    if (error) { toast.error("Failed to submit"); setSubmitting(false); return; }
    setRequests([data, ...requests]);
    setShowForm(false);
    setForm({ start_date: "", end_date: "", type: "annual", reason: "" });
    toast.success("Leave request submitted!");
    setSubmitting(false);
  };

  const statusColor = (s: string) => s === "approved" ? "success" : s === "rejected" ? "destructive" : "warning";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Leave Requests</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="w-4 h-4" />Cancel</> : <><Plus className="w-4 h-4" />Request Leave</>}
        </Button>
      </div>
      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">New Leave Request</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="mt-1" /></div>
              <div><Label>End Date</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="mt-1" /></div>
            </div>
            <div>
              <Label>Leave Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Annual Leave</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="personal">Personal Leave</SelectItem>
                  <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reason</Label>
              <Textarea placeholder="Reason for leave..." value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="mt-1" />
            </div>
            <Button onClick={submit} disabled={submitting} className="w-full">{submitting ? "Submitting..." : "Submit Request"}</Button>
          </CardContent>
        </Card>
      )}
      <div className="space-y-3">
        {requests.length === 0 && <p className="text-center text-gray-500 py-16">No leave requests yet</p>}
        {requests.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{r.type.charAt(0).toUpperCase() + r.type.slice(1)} Leave</p>
                <p className="text-sm text-gray-500">{formatDate(r.start_date)} — {formatDate(r.end_date)}</p>
                {r.reason && <p className="text-xs text-gray-400 mt-1">{r.reason}</p>}
              </div>
              <Badge variant={statusColor(r.status)}>{r.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
