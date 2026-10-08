
"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

export function EmployeeReportReview({ reportId }: { reportId: string }) {
  const supabase = createClient();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const review = async (status: "approved" | "rejected") => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("work_reports").update({ status, reviewer_id: user?.id, reviewer_notes: notes || null }).eq("id", reportId);
    toast.success(`Report ${status}!`);
    setDone(true);
    setLoading(false);
  };

  if (done) return null;

  return (
    <div className="mt-3 space-y-2">
      <Textarea placeholder="Review notes (optional)..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="text-sm" />
      <div className="flex gap-2">
        <Button size="sm" variant="success" disabled={loading} onClick={() => review("approved")}>
          <Check className="w-3 h-3" /> Approve
        </Button>
        <Button size="sm" variant="destructive" disabled={loading} onClick={() => review("rejected")}>
          <X className="w-3 h-3" /> Reject
        </Button>
      </div>
    </div>
  );
}
