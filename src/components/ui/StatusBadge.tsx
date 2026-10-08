
import { Badge } from "@/components/ui/badge";

const sessionColors: Record<string, "success" | "warning" | "secondary" | "destructive"> = {
  working: "success",
  break: "warning",
  ended: "secondary",
  offline: "secondary",
};

const sessionLabels: Record<string, string> = {
  working: "🟢 Working",
  break: "🟡 On Break",
  ended: "⚪ Ended",
  offline: "🔴 Offline",
};

export function SessionStatusBadge({ status }: { status: string }) {
  return <Badge variant={sessionColors[status] ?? "secondary"}>{sessionLabels[status] ?? status}</Badge>;
}

const taskColors: Record<string, "info" | "warning" | "secondary" | "success" | "destructive"> = {
  todo: "secondary",
  in_progress: "info",
  waiting: "warning",
  completed: "success",
  cancelled: "destructive",
};

export function TaskStatusBadge({ status }: { status: string }) {
  return <Badge variant={taskColors[status] ?? "secondary"}>{status.replace("_", " ")}</Badge>;
}

const priorityColors: Record<string, "secondary" | "info" | "warning" | "destructive"> = {
  low: "secondary",
  medium: "info",
  high: "warning",
  urgent: "destructive",
};

export function PriorityBadge({ priority }: { priority: string }) {
  return <Badge variant={priorityColors[priority] ?? "secondary"}>{priority}</Badge>;
}

const reportColors: Record<string, "warning" | "success" | "destructive"> = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
};

export function ReportStatusBadge({ status }: { status: string }) {
  return <Badge variant={reportColors[status] ?? "secondary"}>{status}</Badge>;
}
