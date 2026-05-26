"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { meetingsApi } from "@/lib/api/meetings";
import { formatRelative } from "@/utils";

export default function IntelligencePage() {
  const [query, setQuery] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["meetings"], queryFn: meetingsApi.list });
  const analyzed = (data?.meetings || []).filter((m) => m.status === "completed");

  const filtered = analyzed.filter((m) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return m.title.toLowerCase().includes(q) ||
      m.summary?.toLowerCase().includes(q) ||
      m.action_items?.toLowerCase().includes(q) ||
      m.decisions?.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-full bg-black font-body">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="border-b border-ash/40 px-10 py-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-25"
          style={{ background: "radial-gradient(ellipse 60% 100% at 50% -30%, rgba(196,112,42,0.08), transparent)" }}
        />
        <div className="relative space-y-2">
          <p className="label-caps">Organizational memory</p>
          <h1 className="display-md text-cream">
            Intelligence <span className="ember-text">archive.</span>
          </h1>
          <p className="text-mist text-sm mt-1">
            {analyzed.length} analyzed meeting{analyzed.length !== 1 ? "s" : ""} stored in persistent memory
          </p>
        </div>
      </div>

      {/* ── Search ─────────────────────────────────────────── */}
      <div className="px-10 py-6 border-b border-ash/40">
        <div className="relative max-w-lg">
          <input
            placeholder="Search summaries, decisions, action items…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-graphite border border-ash/60 rounded-xl px-5 py-3 pr-24 text-sm text-cream placeholder:text-mist focus:outline-none focus:border-ember/50 transition-colors font-body"
          />
          {query && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 mono text-[11px] text-ash">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* ── Archive ─────────────────────────────────────────── */}
      <div className="px-10 py-8">
        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border-b border-ash/30 pb-6 space-y-3">
                <div className="h-5 bg-carbon rounded w-1/2 animate-pulse" />
                <div className="h-3 bg-carbon rounded w-full animate-pulse" />
                <div className="h-3 bg-carbon rounded w-3/4 animate-pulse" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center space-y-2">
            <p className="text-mist text-sm">
              {query ? `Nothing found for "${query}".` : "No analyzed meetings yet."}
            </p>
            {!query && <p className="mono text-[11px] text-ash">Run AI analysis on a meeting to populate organizational memory.</p>}
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="group border-b border-ash/30 hover:border-ash/60 transition-colors py-7 space-y-4"
              >
                {/* Title row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="mono text-[11px] text-ash">{String(i + 1).padStart(2, "0")}</span>
                      <Link href={`/meetings/${m.id}`}>
                        <div className="flex items-center gap-1.5 group/link cursor-pointer">
                          <h3 className="text-base font-medium text-cream group-hover/link:text-white transition-colors">
                            {m.title}
                          </h3>
                          <ArrowUpRight className="w-3.5 h-3.5 text-ash group-hover/link:text-ember transition-colors" />
                        </div>
                      </Link>
                    </div>
                    <div className="flex items-center gap-3 pl-9">
                      <span className="mono text-[10px] text-ash">
                        {m.analyzed_at ? formatRelative(m.analyzed_at) : ""}
                      </span>
                      <span className="mono text-[10px] text-ash">·</span>
                      <span className="mono text-[10px] text-mist">
                        {m.action_items?.split("\n").filter(Boolean).length || 0} actions ·{" "}
                        {m.decisions?.split("\n").filter(Boolean).length || 0} decisions
                      </span>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                {m.summary && (
                  <p className="text-sm text-mist leading-relaxed line-clamp-3 pl-9 font-body">{m.summary}</p>
                )}

                {/* Decision chips */}
                {m.decisions && (
                  <div className="flex flex-wrap gap-2 pl-9">
                    {m.decisions.split("\n").filter(Boolean).slice(0, 3).map((d, j) => (
                      <span key={j} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-carbon border border-ash/50 rounded-lg text-xs text-mist">
                        <div className="w-1 h-1 rounded-full bg-ember opacity-70" />
                        {d.replace(/^[-•]\s*/, "").slice(0, 50)}{d.length > 50 ? "…" : ""}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
