
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskStatusBadge, PriorityBadge } from "@/components/ui/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types/database";

export default function TasksPage() {
  const supabase = createClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("tasks").select("*").eq("assigned_to", user.id).order("due_date").order("created_at", { ascending: false });
    setTasks(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: TaskStatus) => {
    const { error } = await supabase.from("tasks").update({ status, ...(status === "completed" ? { completed_at: new Date().toISOString() } : {}) }).eq("id", id);
    if (error) { toast.error("Failed to update"); return; }
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
    toast.success("Task updated!");
  };

  const grouped = {
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    waiting: tasks.filter((t) => t.status === "waiting"),
    completed: tasks.filter((t) => t.status === "completed"),
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map((i) => <div key={i} className="h-20 bg-gray-200 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Tasks</h2>
        <div className="text-sm text-gray-500">{tasks.length} total tasks</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {Object.entries(grouped).map(([status, items]) => (
          <div key={status} className="space-y-3">
            <div className="flex items-center gap-2">
              <TaskStatusBadge status={status} />
              <span className="text-sm text-gray-500">({items.length})</span>
            </div>
            {items.map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <p className="font-medium text-sm mb-2">{task.title}</p>
                  {task.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{task.description}</p>}
                  <div className="flex items-center justify-between mb-3">
                    <PriorityBadge priority={task.priority} />
                    {task.due_date && (
                      <span className={`text-xs ${
                        new Date(task.due_date) < new Date() && task.status !== "completed" ? "text-red-600 font-medium" : "text-gray-500"
                      }`}>{formatDate(task.due_date)}</span>
                    )}
                  </div>
                  <Select value={task.status} onValueChange={(v) => updateStatus(task.id, v as TaskStatus)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="waiting">Waiting</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            ))}
            {items.length === 0 && (
              <div className="text-center py-8 text-sm text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed">
                No tasks here
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
