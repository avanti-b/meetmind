"use client";
import { useState, use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Upload, Loader2, RefreshCcw } from "lucide-react";
import { meetingsApi } from "@/lib/api/meetings";
import { formatDate, formatRelative } from "@/utils";

// ─── Intelligence section ──────────────────────────────────────────────────────
function IntelSection({
  label, index, content, delay = 0
}: { label: string; index: string; content: string | null; delay?: number }) {
  const lines = content?.split("\n").filter(Boolean) || [];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="border-t border-ash/40 pt-8 space-y-5"
    >
      <div className="flex items-baseline gap-4">
        <span className="mono text-[11px] text-ash">{index}</span>
        <span className="label-caps">{label}</span>
      </div>

      {!content ? (
        <p className="text-sm text-mist italic pl-9">Run analysis to generate {label.toLowerCase()}.</p>
      ) : lines.length > 1 ? (
        <ul className="space-y-3 pl-9">
          {lines.map((line, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + i * 0.06 }}
              className="flex items-start gap-3"
            >
              <div className="w-1 h-1 rounded-full bg-ember mt-2 shrink-0" style={{ boxShadow: "0 0 4px rgba(196,112,42,0.5)" }} />
              <span className="text-sm text-cream/80 leading-relaxed font-body">
                {line.replace(/^[-•]\s*/, "")}
              </span>
            </motion.li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-cream/80 leading-relaxed pl-9 font-body">{content}</p>
      )}
    </motion.div>
  );
}

// ─── Transcript upload ─────────────────────────────────────────────────────────
function TranscriptUpload({ meetingId }: { meetingId: string }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const qc = useQueryClient();

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".txt")) { setError("Only .txt files accepted."); return; }
    setUploading(true); setError("");
    try {
      await meetingsApi.uploadTranscript(meetingId, file);
      qc.invalidateQueries({ queryKey: ["meeting", meetingId] });
    } catch { setError("Upload failed. Try again."); }
    finally { setUploading(false); }
  };

  return (
    <div className="border-t border-ash/40 pt-8 space-y-4">
      <div className="flex items-baseline gap-4">
        <span className="mono text-[11px] text-ash">T</span>
        <span className="label-caps">Transcript</span>
      </div>
      <motion.label
        htmlFor="file-upload"
        animate={{ borderColor: dragging ? "rgba(196,112,42,0.5)" : "rgba(61,57,53,0.4)" }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        className="flex flex-col items-center gap-3 py-10 border border-dashed rounded-2xl cursor-pointer transition-all hover:border-ember/30 hover:bg-ember/[0.02] ml-9"
      >
        <Upload className="w-6 h-6 text-mist" />
        <div className="text-center space-y-1">
          <p className="text-sm text-cream">{uploading ? "Uploading…" : "Drop transcript"}</p>
          <p className="mono text-[11px] text-ash">.txt · max 5MB</p>
        </div>
        <input id="file-upload" type="file" accept=".txt" hidden
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          disabled={uploading}
        />
      </motion.label>
      {error && <p className="text-xs text-red-400 pl-9">{error}</p>}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function MeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const [analyzing, setAnalyzing] = useState(false);

  const { data: m, isLoading } = useQuery({
    queryKey: ["meeting", id],
    queryFn: () => meetingsApi.get(id),
    refetchInterval: (q) => q.state.data?.status === "processing" ? 2000 : false,
  });

  const analyzeMut = useMutation({
    mutationFn: () => meetingsApi.analyze(id),
    onMutate: () => setAnalyzing(true),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["meeting", id] }); qc.invalidateQueries({ queryKey: ["meetings"] }); },
    onSettled: () => setAnalyzing(false),
  });

  if (isLoading) {
    return (
      <div className="p-10 space-y-6 max-w-3xl">
        <div className="h-6 bg-carbon rounded w-1/3 animate-pulse" />
        <div className="h-10 bg-carbon rounded w-2/3 animate-pulse" />
        <div className="space-y-4 pt-8">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-carbon rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }
  if (!m) return null;

  const isProcessing = m.status === "processing";
  const isAnalyzed = m.status === "completed";

  return (
    <div className="min-h-full bg-black font-body">

      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="border-b border-ash/40 px-10 py-5 flex items-center justify-between gap-6">
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs text-mist hover:text-cream transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Workspace
        </button>

        <div className="flex items-center gap-3">
          {/* Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-ash/50 bg-carbon/60">
            <div className={`w-1.5 h-1.5 rounded-full ${
              isProcessing ? "bg-ember animate-pulse" :
              isAnalyzed ? "bg-emerald-500" :
              "bg-ember"
            }`} />
            <span className="mono text-[11px] text-mist">
              {isProcessing ? "Analyzing…" : isAnalyzed ? "Intelligence ready" : "Transcript ready"}
            </span>
          </div>

          {/* Analyze button */}
          {m.transcript && !isProcessing && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => analyzeMut.mutate()}
              disabled={analyzing}
              className="flex items-center gap-2 bg-ember text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-60"
            >
              {analyzing || isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isAnalyzed ? (
                <RefreshCcw className="w-3.5 h-3.5" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {isAnalyzed ? "Re-analyze" : "Run analysis"}
            </motion.button>
          )}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="max-w-3xl px-10 py-12 space-y-0">

        {/* Meeting title + meta */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 mb-12">
          <p className="label-caps">Meeting intelligence</p>
          <h1 className="display-md text-cream">{m.title}</h1>
          <div className="flex items-center gap-4 text-xs text-mist font-mono">
            <span>{formatDate(m.created_at)}</span>
            {m.original_filename && <><span>·</span><span>{m.original_filename}</span></>}
            {m.analyzed_at && <><span>·</span><span>Analyzed {formatRelative(m.analyzed_at)}</span></>}
          </div>
        </motion.div>

        {/* Processing state */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 p-4 border border-ember/20 bg-ember/[0.04] rounded-xl mb-8"
            >
              <div className="intel-node" />
              <span className="text-sm text-cream/80">
                AI intelligence pipeline running — extracting insights from transcript…
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload if no transcript */}
        {!m.transcript && <TranscriptUpload meetingId={id} />}

        {/* Intelligence sections */}
        <IntelSection label="Summary" index="01" content={m.summary} delay={0.1} />
        <IntelSection label="Action Items" index="02" content={m.action_items} delay={0.2} />
        <IntelSection label="Key Decisions" index="03" content={m.decisions} delay={0.3} />

        {/* Raw transcript */}
        {m.transcript && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="border-t border-ash/40 pt-8 space-y-5"
          >
            <div className="flex items-baseline gap-4">
              <span className="mono text-[11px] text-ash">SRC</span>
              <span className="label-caps">Source transcript</span>
            </div>
            <div className="ml-9 bg-graphite/40 border border-ash/40 rounded-xl p-5 max-h-56 overflow-y-auto">
              <pre className="mono text-[12px] text-mist leading-relaxed whitespace-pre-wrap">{m.transcript}</pre>
            </div>
          </motion.div>
        )}

        {/* Bottom breathing room */}
        <div className="pt-16" />
      </div>
    </div>
  );
}
