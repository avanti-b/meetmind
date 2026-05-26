"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Plus, Search, Trash2, ArrowUpRight, Brain, FileText } from "lucide-react";
import { meetingsApi } from "@/lib/api/meetings";
import { CreateMeetingModal } from "@/components/meetings/CreateMeetingModal";
import { formatRelative } from "@/utils";
import type { Meeting, MeetingStatus } from "@/types";

const STATUS_LABEL: Record<MeetingStatus, string> = {
  uploaded: "Ready",
  processing: "Analyzing",
  completed: "Analyzed",
  failed: "Failed",
};
const STATUS_DOT: Record<MeetingStatus, string> = {
  uploaded: "bg-ember",
  processing: "bg-ember animate-pulse",
  completed: "bg-emerald-500",
  failed: "bg-red-500",
};

const FILTERS: { label: string; value: MeetingStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Analyzed", value: "completed" },
  { label: "Ready", value: "uploaded" },
  { label: "Processing", value: "processing" },
];

export default function MeetingsPage() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<MeetingStatus | "all">("all");

  const { data, isLoading } = useQuery({ queryKey: ["meetings"], queryFn: meetingsApi.list });
  const createMut = useMutation({ mutationFn: meetingsApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: ["meetings"] }) });
  const deleteMut = useMutation({ mutationFn: meetingsApi.delete, onSuccess: () => qc.invalidateQueries({ queryKey: ["meetings"] }) });

  const meetings = (data?.meetings || []).filter((m) => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || m.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-full bg-black font-body">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="border-b border-ash/40 px-10 py-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30"
          style={{ background: "radial-gradient(ellipse 40% 100% at 100% 50%, rgba(196,112,42,0.05), transparent)" }}
        />
        <div className="relative flex items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="label-caps">Meeting workspace</p>
            <h1 className="display-md text-cream">
              {data?.total || 0} meeting{data?.total !== 1 ? "s" : ""}{" "}
              <span className="text-mist font-display font-normal">in memory</span>
            </h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 bg-ember text-white px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0"
          >
            <Plus className="w-4 h-4" />
            New meeting
          </motion.button>
        </div>
      </div>

      {/* ── Controls ───────────────────────────────────────── */}
      <div className="px-10 py-5 border-b border-ash/40 flex items-center gap-5 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ash pointer-events-none" />
          <input
            placeholder="Search meetings…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-graphite border border-ash/60 rounded-xl pl-9 pr-4 py-2 text-sm text-cream placeholder:text-mist focus:outline-none focus:border-ember/50 transition-colors w-56 font-body"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`mono text-[11px] px-3 py-1.5 rounded-lg transition-all ${
                filter === f.value
                  ? "bg-carbon border border-ash text-cream"
                  : "text-mist hover:text-cream"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Meeting list — editorial table ─────────────────── */}
      <div className="px-10 py-8">
        {isLoading ? (
          <div className="space-y-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-6 py-5 border-b border-ash/20">
                <div className="w-6 h-3 bg-carbon rounded" />
                <div className="flex-1 h-4 bg-carbon rounded w-2/3" />
                <div className="w-20 h-3 bg-carbon rounded" />
              </div>
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center space-y-4">
            <Brain className="w-10 h-10 text-ash mx-auto" />
            <p className="text-mist text-sm">
              {search ? `No results for "${search}"` : "No meetings match this filter."}
            </p>
            {!search && filter === "all" && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setCreateOpen(true)}
                className="mt-2 px-5 py-2.5 bg-ember/10 border border-ember/30 rounded-xl text-sm text-ember"
              >
                Create first meeting
              </motion.button>
            )}
          </motion.div>
        ) : (
          <>
            {/* Column headers */}
            <div className="flex items-center gap-6 pb-3 border-b border-ash/60 mb-1">
              <span className="mono text-[10px] text-ash w-6">#</span>
              <span className="mono text-[10px] text-ash flex-1">Meeting title</span>
              <span className="mono text-[10px] text-ash w-28">Status</span>
              <span className="mono text-[10px] text-ash w-24">Created</span>
              <span className="mono text-[10px] text-ash w-16">Actions</span>
              <div className="w-8" />
            </div>

            <AnimatePresence>
              {meetings.map((m: Meeting, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group flex items-center gap-6 py-4 border-b border-ash/30 hover:border-ash/60 transition-colors"
                >
                  <span className="mono text-[11px] text-ash w-6">{String(i + 1).padStart(2, "0")}</span>

                  <div className="flex-1 min-w-0">
                    <Link href={`/meetings/${m.id}`}>
                      <div className="flex items-center gap-2 group/link">
                        <span className="text-sm text-cream group-hover/link:text-white font-medium truncate">
                          {m.title}
                        </span>
                        <ArrowUpRight className="w-3 h-3 text-ash group-hover/link:text-ember transition-colors shrink-0" />
                      </div>
                      {m.summary && (
                        <p className="text-xs text-mist mt-0.5 truncate">{m.summary}</p>
                      )}
                    </Link>
                  </div>

                  <div className="flex items-center gap-2 w-28">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[m.status]}`} />
                    <span className="mono text-[11px] text-mist">{STATUS_LABEL[m.status]}</span>
                  </div>

                  <span className="mono text-[11px] text-ash w-24">{formatRelative(m.created_at)}</span>

                  <span className="mono text-[11px] text-mist w-16">
                    {m.status === "completed"
                      ? `${m.action_items?.split("\n").filter(Boolean).length || 0} items`
                      : "—"}
                  </span>

                  <button
                    onClick={() => deleteMut.mutate(m.id)}
                    className="w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 text-ash hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </>
        )}
      </div>

      <CreateMeetingModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={async (title) => { await createMut.mutateAsync({ title }); }}
      />
    </div>
  );
}
