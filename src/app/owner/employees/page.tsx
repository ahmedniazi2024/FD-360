// @ts-nocheck

"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import { Plus, Search, X, Mail, Phone, Building2 } from "lucide-react";
import type { Profile, Department } from "@/types/database";

export default function EmployeesPage() {
  const supabase = createClient();
  const [employees, setEmployees] = useState<(Profile & { departments?: { name: string } | null })[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", job_title: "", department_id: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const [{ data: emps }, { data: depts }] = await Promise.all([
      supabase.from("profiles").select("*, departments(name)").eq("role", "employee").order("full_name"),
      supabase.from("departments").select("*").order("name"),
    ]);
    setEmployees((emps as typeof employees) ?? []);
    setDepartments(depts ?? []);
  };

  useEffect(() => { load(); }, []);

  const createEmployee = async () => {
    if (!form.full_name || !form.email || !form.password) { toast.error("Name, email and password are required"); return; }
    setLoading(true);
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (!res.ok) { toast.error(json.error ?? "Failed to create employee"); setLoading(false); return; }
    toast.success("Employee created successfully!");
    setShowForm(false);
    setForm({ full_name: "", email: "", job_title: "", department_id: "", phone: "", password: "" });
    load();
    setLoading(false);
  };

  const toggleStatus = async (id: string, current: string) => {
    const newStatus = current === "active" ? "deactivated" : "active";
    await supabase.from("profiles").update({ status: newStatus }).eq("id", id);
    setEmployees((prev) => prev.map((e) => e.id === id ? { ...e, status: newStatus as typeof e.status } : e));
    toast.success(`Employee ${newStatus === "active" ? "activated" : "deactivated"}`);
  };

  const filtered = employees.filter((e) =>
    e.full_name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    (e.job_title ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Employees ({employees.length})</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Add Employee</>}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <h3 className="font-semibold">New Employee</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Full Name *</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="mt-1" /></div>
              <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" /></div>
              <div><Label>Password *</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1" /></div>
              <div><Label>Job Title</Label><Input value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} className="mt-1" /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" /></div>
              <div>
                <Label>Department</Label>
                <Select value={form.department_id} onValueChange={(v) => setForm({ ...form, department_id: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={createEmployee} disabled={loading} className="w-full">{loading ? "Creating..." : "Create Employee"}</Button>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((emp) => (
          <Card key={emp.id} className={emp.status === "deactivated" ? "opacity-60" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {emp.avatar_url ? <img src={emp.avatar_url} className="w-12 h-12 rounded-full object-cover" alt="" /> : emp.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{emp.full_name}</p>
                  <p className="text-sm text-gray-500">{emp.job_title ?? "Employee"}</p>
                  {emp.departments && <p className="text-xs text-blue-600">{emp.departments.name}</p>}
                </div>
                <Badge variant={emp.status === "active" ? "success" : "destructive"} className="capitalize">{emp.status}</Badge>
              </div>
              <div className="space-y-1 text-xs text-gray-500 mb-3">
                <div className="flex items-center gap-1"><Mail className="w-3 h-3" />{emp.email}</div>
                {emp.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" />{emp.phone}</div>}
              </div>
              <div className="flex gap-2">
                <Link href={`/owner/employees/${emp.id}`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full">View Profile</Button>
                </Link>
                <Button size="sm" variant={emp.status === "active" ? "destructive" : "success"} onClick={() => toggleStatus(emp.id, emp.status)}>
                  {emp.status === "active" ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
