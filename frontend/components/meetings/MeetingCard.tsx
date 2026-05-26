"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Brain, FileText, ArrowRight, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatRelative, formatDate } from "@/utils";
import type { Meeting } from "@/types";

interface MeetingCardProps {
  meeting: Meeting;
  onDelete: (id: string) => void;
  index: number;
}

export function MeetingCard({ meeting: m, onDelete, index }: MeetingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -1 }}
      className="group bg-surface-1 border border-border hover:border-border-bright rounded-2xl p-5 space-y-4 shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="font-medium text-sm text-ink truncate leading-snug">{m.title}</h3>
          <p className="text-[11px] text-ink-faint">{formatDate(m.created_at)}</p>
        </div>
        <StatusBadge status={m.status} />
      </div>

      {/* Summary preview */}
      {m.summary ? (
        <p className="text-xs text-ink-muted leading-relaxed line-clamp-2">{m.summary}</p>
      ) : m.transcript ? (
        <p className="text-xs text-ink-faint leading-relaxed line-clamp-2 italic">
          {m.transcript.slice(0, 120)}...
        </p>
      ) : (
        <div className="flex items-center gap-2 text-xs text-ink-faint">
          <FileText className="w-3.5 h-3.5" />
          No transcript uploaded
        </div>
      )}

      {/* AI insights count */}
      {m.status === "completed" && (
        <div className="flex items-center gap-3 text-[10px] text-ink-faint">
          <span className="flex items-center gap-1">
            <Brain className="w-3 h-3 text-intelligence-glow" />
            {m.action_items?.split("\n").filter(Boolean).length || 0} actions
          </span>
          <span>·</span>
          <span>{m.decisions?.split("\n").filter(Boolean).length || 0} decisions</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex gap-2">
          <Link href={`/meetings/${m.id}`}>
            <Button variant="secondary" size="sm" icon={<ArrowRight className="w-3 h-3" />}>
              Open
            </Button>
          </Link>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={<Trash2 className="w-3.5 h-3.5" />}
          className="opacity-0 group-hover:opacity-100 hover:text-danger hover:bg-danger/5"
          onClick={(e) => { e.preventDefault(); onDelete(m.id); }}
        />
      </div>
    </motion.div>
  );
}
