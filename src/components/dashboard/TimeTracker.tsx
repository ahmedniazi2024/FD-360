
"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTimer } from "@/hooks/useTimer";
import { formatDuration, formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Play, Pause, Square, Clock } from "lucide-react";
import type { WorkSession } from "@/types/database";

interface TimeTrackerProps { userId: string; }

export function TimeTracker({ userId }: TimeTrackerProps) {
  const supabase = createClient();
  const [session, setSession] = useState<WorkSession | null>(null);
  const [activeBreakId, setActiveBreakId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const isWorking = session?.status === "working";
  const isOnBreak = session?.status === "break";
  const isActive = isWorking || isOnBreak;

  const timer = useTimer(elapsed, isActive);

  const loadSession = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("work_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .neq("status", "ended")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    setSession(data ?? null);
    if (data) {
      const nowSec = Math.floor(Date.now() / 1000);
      const clockInSec = Math.floor(new Date(data.clock_in).getTime() / 1000);
      setElapsed(nowSec - clockInSec);
      if (data.status === "break") {
        const { data: br } = await supabase.from("breaks").select("id").eq("session_id", data.id).is("end_time", null).single();
        setActiveBreakId(br?.id ?? null);
      }
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { loadSession(); }, [loadSession]);

  const startWork = async () => {
    setActionLoading(true);
    const { data, error } = await supabase.from("work_sessions").insert({
      user_id: userId,
      date: new Date().toISOString().split("T")[0],
      clock_in: new Date().toISOString(),
      status: "working",
    }).select().single();
    if (error) { toast.error("Failed to start session"); setActionLoading(false); return; }
    setSession(data);
    setElapsed(0);
    toast.success("Work session started! Have a productive day 🚀");
    setActionLoading(false);
  };

  const startBreak = async () => {
    if (!session) return;
    setActionLoading(true);
    const now = new Date().toISOString();
    const { data: br } = await supabase.from("breaks").insert({ session_id: session.id, user_id: userId, start_time: now }).select().single();
    await supabase.from("work_sessions").update({ status: "break" }).eq("id", session.id);
    setSession({ ...session, status: "break" });
    setActiveBreakId(br?.id ?? null);
    toast.info("Enjoy your break! ☕");
    setActionLoading(false);
  };

  const resumeWork = async () => {
    if (!session || !activeBreakId) return;
    setActionLoading(true);
    const now = new Date().toISOString();
    const startTime = (await supabase.from("breaks").select("start_time").eq("id", activeBreakId).single()).data?.start_time;
    const dur = startTime ? Math.floor((Date.now() - new Date(startTime).getTime()) / 1000) : 0;
    await supabase.from("breaks").update({ end_time: now, duration_seconds: dur }).eq("id", activeBreakId);
    await supabase.from("work_sessions").update({ status: "working", total_break_seconds: session.total_break_seconds + dur }).eq("id", session.id);
    setSession({ ...session, status: "working", total_break_seconds: session.total_break_seconds + dur });
    setActiveBreakId(null);
    toast.success("Welcome back! Keep it up 💪");
    setActionLoading(false);
  };

  const endWork = async () => {
    if (!session) return;
    setActionLoading(true);
    const now = new Date().toISOString();
    const totalSec = Math.floor((Date.now() - new Date(session.clock_in).getTime()) / 1000);
    const net = totalSec - session.total_break_seconds;
    await supabase.from("work_sessions").update({ clock_out: now, status: "ended", net_working_seconds: net }).eq("id", session.id);
    // Notify create work report reminder
    await supabase.from("notifications").insert({ user_id: userId, type: "report_reminder", title: "Submit Your Work Report", body: "Don't forget to submit your daily work report!", link: "/dashboard/reports" });
    setSession(null);
    setElapsed(0);
    toast.success(`Great work! You worked for ${formatDuration(net)} today 🎉`);
    setActionLoading(false);
  };

  if (loading) {
    return <Card><CardContent className="p-6"><div className="animate-pulse h-32 bg-gray-100 rounded-xl" /></CardContent></Card>;
  }

  return (
    <Card className="overflow-hidden">
      <div className={`p-6 text-white ${
        isWorking ? "bg-gradient-to-br from-green-500 to-emerald-600" :
        isOnBreak ? "bg-gradient-to-br from-yellow-500 to-amber-600" :
        "bg-gradient-to-br from-slate-600 to-slate-700"
      }`}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5" />
          <span className="font-medium">
            {isWorking ? "🟢 Working" : isOnBreak ? "🟡 On Break" : "⚪ Not Started"}
          </span>
        </div>
        <div className="text-5xl font-mono font-bold tracking-tight">
          {formatDuration(isActive ? timer : 0)}
        </div>
        {session && (
          <div className="mt-3 text-sm opacity-80">
            <p>Clocked in: {formatTime(session.clock_in)}</p>
            <p>Break time: {formatDuration(session.total_break_seconds)}</p>
          </div>
        )}
      </div>
      <CardContent className="p-6">
        <div className="flex gap-3 flex-wrap">
          {!session && (
            <Button onClick={startWork} disabled={actionLoading} variant="success" className="flex-1">
              <Play className="w-4 h-4" /> Start Work
            </Button>
          )}
          {isWorking && (
            <>
              <Button onClick={startBreak} disabled={actionLoading} variant="warning" className="flex-1">
                <Pause className="w-4 h-4" /> Start Break
              </Button>
              <Button onClick={endWork} disabled={actionLoading} variant="destructive" className="flex-1">
                <Square className="w-4 h-4" /> End Workday
              </Button>
            </>
          )}
          {isOnBreak && (
            <Button onClick={resumeWork} disabled={actionLoading} className="flex-1">
              <Play className="w-4 h-4" /> Resume Work
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
