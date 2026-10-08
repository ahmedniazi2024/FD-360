
"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function LeaveActions({ requestId }: { requestId: string }) {
  const supabase = createClient();
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = async (status: "approved" | "rejected") => {
    setLoading(true);
    await supabase.from("leave_requests").update({ status }).eq("id", requestId);
    toast.success(`Request ${status}`);
    setDone(true);
    setLoading(false);
  };

  if (done) return null;
  return (
    <div className="flex gap-2">
      <Button size="sm" variant="success" disabled={loading} onClick={() => update("approved")}>Approve</Button>
      <Button size="sm" variant="destructive" disabled={loading} onClick={() => update("rejected")}>Reject</Button>
    </div>
  );
}
