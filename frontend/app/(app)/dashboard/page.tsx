"use client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Brain } from "lucide-react";
import { meetingsApi } from "@/lib/api/meetings";
import { useAuthStore } from "@/store/auth.store";
import { formatRelative } from "@/utils";
import type { Meeting } from "@/types";

// ─── Intelligence timeline item ───────────────────────────────────────────────
function TimelineItem({ meeting, index }: { meeting: Meeting; index: number }) {
  const statusColor = {
    completed: "bg-emerald-500",
    uploaded: "bg-ember",
    processing: "bg-ember animate-pulse",
    failed: "bg-red-500",
  }[meeting.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link href={`/meetings/${meeting.id}`}>
        <div className="flex items-start gap-5 py-4 border-b border-ash/30 hover:border-ash/60 transition-colors cursor-pointer">
          {/* Index */}
          <span className="mono text-[11px] text-ash w-6 pt-0.5 shrink-0">
            {String(index + 1).padStart(2, "0")}
          </span>

          {/* Status dot */}
          <div className="pt-2 shrink-0">
            <div className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-medium text-cream group-hover:text-white transition-colors leading-snug">
                {meeting.title}
              </h3>
              <ArrowUpRight className="w-3.5 h-3.5 text-ash group-hover:text-ember shrink-0 mt-0.5 transition-colors" />
            </div>

            {meeting.summary ? (
              <p className="text-xs text-mist leading-relaxed line-clamp-2 font-body">{meeting.summary}</p>
            ) : (
              <p className="text-xs text-ash italic">No analysis yet</p>
            )}

            <div className="flex items-center gap-3 pt-0.5">
              <span className="mono text-[10px] text-ash">{formatRelative(meeting.created_at)}</span>
              {meeting.status === "completed" && (
                <>
                  <span className="text-ash text-[10px]">·</span>
                  <span className="mono text-[10px] text-mist">
                    {meeting.action_items?.split("\n").filter(Boolean).length || 0} actions ·{" "}
                    {meeting.decisions?.split("\n").filter(Boolean).length || 0} decisions
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Memory cluster visualization ─────────────────────────────────────────────
function MemoryConstellation({ meetings }: { meetings: Meeting[] }) {
  const completed = meetings.filter((m) => m.status === "completed");
  if (completed.length === 0) return null;

  // Place nodes in a loose organic grid
  const positions = completed.slice(0, 7).map((_, i) => ({
    x: [50, 25, 70, 15, 80, 40, 60][i] ?? 50,
    y: [50, 30, 25, 60, 55, 75, 15][i] ?? 50,
  }));

  return (
    <div className="relative w-full h-52 overflow-hidden">
      <svg className="absolute inset-0 w-full h-full opacity-20" style={{ fill: "none" }}>
        {positions.map((p, i) =>
          positions.slice(i + 1, i + 3).map((p2, j) => (
            <line
              key={`${i}-${j}`}
              x1={`${p.x}%`} y1={`${p.y}%`}
              x2={`${p2.x}%`} y2={`${p2.y}%`}
              stroke="#c4702a" strokeWidth="0.5"
            />
          ))
        )}
      </svg>
      {positions.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -50%)" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
        >
          <div
            className="rounded-full bg-ember"
            style={{
              width: 6 + (i === 0 ? 3 : 0),
              height: 6 + (i === 0 ? 3 : 0),
              boxShadow: "0 0 12px rgba(196,112,42,0.5)",
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({ queryKey: ["meetings"], queryFn: meetingsApi.list });

  const meetings = data?.meetings || [];
  const completed = meetings.filter((m) => m.status === "completed");
  const totalActions = completed.reduce((a, m) => a + (m.action_items?.split("\n").filter(Boolean).length || 0), 0);
  const firstName = user?.full_name.split(" ")[0] || "";

  return (
    <div className="min-h-full bg-black">
      {/* ── Hero header ─────────────────────────────────── */}
      <div className="relative border-b border-ash/40 overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{ background: "radial-gradient(ellipse 60% 100% at 0% 50%, rgba(196,112,42,0.06), transparent)" }}
        />
        <div className="relative px-10 py-12">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="label-caps mb-3">Intelligence Hub</p>
            <h1 className="display-lg text-cream">
              {firstName ? `${firstName}'s` : "Your"}{" "}
              <span className="ember-text">workspace.</span>
            </h1>
            <p className="text-mist text-sm mt-3 font-body">
              {meetings.length > 0
                ? `${completed.length} intelligence reports · ${totalActions} extracted actions · ${meetings.length} total meetings`
                : "No meetings yet. Upload a transcript to begin."}
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────── */}
      <div className="flex divide-x divide-ash/40">

        {/* Left: Intelligence timeline */}
        <div className="flex-1 px-10 py-8">
          <div className="flex items-center justify-between mb-6">
            <p className="label-caps">Intelligence timeline</p>
            <Link href="/meetings">
              <span className="mono text-[11px] text-mist hover:text-ember transition-colors">View all →</span>
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-5 py-4 border-b border-ash/20">
                  <div className="w-6 h-3 bg-carbon rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-carbon rounded w-2/3" />
                    <div className="h-3 bg-carbon rounded w-full" />
                    <div className="h-3 bg-carbon rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : meetings.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Brain className="w-8 h-8 text-ash mx-auto" />
              <p className="text-sm text-mist">Memory is empty.</p>
              <p className="text-xs text-ash">Create a meeting to begin capturing intelligence.</p>
              <Link href="/meetings">
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  className="inline-block mt-2 px-4 py-2 bg-ember/10 border border-ember/30 rounded-xl text-xs text-ember cursor-pointer"
                >
                  Open workspace →
                </motion.span>
              </Link>
            </div>
          ) : (
            <div>
              {meetings.slice(0, 8).map((m, i) => (
                <TimelineItem key={m.id} meeting={m} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Right: Constellation + raw metrics */}
        <div className="w-72 shrink-0 flex flex-col divide-y divide-ash/40">

          {/* Constellation */}
          <div className="p-6 space-y-4">
            <p className="label-caps">Memory constellation</p>
            {completed.length > 0 ? (
              <MemoryConstellation meetings={meetings} />
            ) : (
              <div className="h-52 flex items-center justify-center">
                <p className="text-xs text-ash text-center">
                  Constellation forms after<br />first analysis
                </p>
              </div>
            )}
          </div>

          {/* Raw numbers — editorial style, not cards */}
          <div className="p-6 space-y-5">
            <p className="label-caps">System state</p>
            {[
              { label: "Total meetings", value: meetings.length },
              { label: "Reports generated", value: completed.length },
              { label: "Actions extracted", value: totalActions },
              {
                label: "Analysis coverage",
                value: meetings.length ? `${Math.round((completed.length / meetings.length) * 100)}%` : "—",
              },
            ].map(({ label, value }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-baseline justify-between"
              >
                <span className="text-xs text-mist">{label}</span>
                <span className="font-display text-xl font-semibold text-cream tabular-nums">
                  {value}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Status indicators */}
          <div className="p-6 space-y-3">
            <p className="label-caps">Pipeline health</p>
            {[
              { label: "AI pipeline", active: true },
              { label: "Memory store", active: true },
              { label: "Auth service", active: true },
            ].map(({ label, active }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="mono text-[11px] text-mist">{label}</span>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-red-500"} ${active ? "animate-pulse" : ""}`} />
                  <span className="mono text-[10px] text-ash">{active ? "active" : "down"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
