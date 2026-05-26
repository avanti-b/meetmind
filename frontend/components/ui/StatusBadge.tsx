import { cn } from "@/utils";
import type { MeetingStatus } from "@/types";

const config: Record<MeetingStatus, { label: string; class: string; dot: string }> = {
  uploaded: {
    label: "Transcript Ready",
    class: "bg-warning/10 text-warning border border-warning/20",
    dot: "bg-warning",
  },
  processing: {
    label: "Analyzing",
    class: "bg-intelligence-muted text-intelligence-glow border border-intelligence/20",
    dot: "bg-intelligence animate-pulse",
  },
  completed: {
    label: "Intelligence Ready",
    class: "bg-success/10 text-success border border-success/20",
    dot: "bg-success",
  },
  failed: {
    label: "Analysis Failed",
    class: "bg-danger/10 text-danger border border-danger/20",
    dot: "bg-danger",
  },
};

export function StatusBadge({ status }: { status: MeetingStatus }) {
  const { label, class: cls, dot } = config[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium", cls)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
}
