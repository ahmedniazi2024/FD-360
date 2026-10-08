// @ts-nocheck

"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskStatusBadge, PriorityBadge } from "@/components/ui/StatusBadge";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import type { Task, Profile, Department } from "@/types/database";
import { Plus, X } from "lucide-react";

export default function OwnerTasksPage() {
  const supabase = createClient();
  const [tasks, setTasks] = useState<(Task & { assignee?: { full_name: string } | null })[]>([]);
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ title: "", description: "", priority: "medium", assigned_to: "", department_id: "", due_date: "" });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const [{ data: t }, { data: e }, { data: d }] = await Promise.all([
      supabase.from("tasks").select("*, assignee:assigned_to(full_name)").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id,full_name").eq("role", "employee").eq("status", "active").order("full_name"),
      supabase.from("departments").select("*").order("name"),
    ]);
    setTasks((t as typeof tasks) ?? []);
    setEmployees(e ?? []);
    setDepartments(d ?? []);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.title) { toast.error("Title required"); return; }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("tasks").insert({
      ...form,
      assigned_by: user.id,
      assigned_to: form.assigned_to || null,
      department_id: form.department_id || null,
      due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
    });
    if (error) { toast.error("Failed to create task"); setLoading(false); return; }
    toast.success("Task created!");
    setShowForm(false);
    setForm({ title: "", description: "", priority: "medium", assigned_to: "", department_id: "", due_date: "" });
    load();
    setLoading(false);
  };

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);
  const statuses = ["all", "todo", "in_progress", "waiting", "completed", "cancelled"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Task Management</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> New Task</>}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" /></div>
              <div className="md:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" rows={2} /></div>
              <div>
                <Label>Assign To</Label>
                <Select value={form.assigned_to} onValueChange={(v) => setForm({ ...form, assigned_to: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="mt-1" /></div>
              <div>
                <Label>Department</Label>
                <Select value={form.department_id} onValueChange={(v) => setForm({ ...form, department_id: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={create} disabled={loading} className="w-full">{loading ? "Creating..." : "Create Task"}</Button>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 flex-wrap">
        {statuses.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
              filter === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}>
            {s.replace("_", " ")} ({s === "all" ? tasks.length : tasks.filter((t) => t.status === s).length})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((t) => (
          <Card key={t.id}>
            <CardContent className="p-4 flex items-start gap-4">
              <div className="flex-1">
                <p className="font-medium">{t.title}</p>
                {t.description && <p className="text-sm text-gray-500 mt-1">{t.description}</p>}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <PriorityBadge priority={t.priority} />
                  {t.assignee && <span className="text-xs text-gray-500">→ {t.assignee.full_name}</span>}
                  {t.due_date && <span className={`text-xs ${ new Date(t.due_date) < new Date() && t.status !== "completed" ? "text-red-600 font-medium" : "text-gray-500" }`}>{formatDate(t.due_date)}</span>}
                </div>
              </div>
              <TaskStatusBadge status={t.status} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
