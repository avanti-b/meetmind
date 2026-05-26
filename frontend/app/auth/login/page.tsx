"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { authApi } from "@/lib/api/auth";
import { getApiError } from "@/utils";

// ─── Rotating phrases ─────────────────────────────────────────────────────────
const PHRASES = [
  { line1: "Your meetings,", line2: "remembered.", em: false },
  { line1: "Every decision", line2: "becomes strategy.", em: true },
  { line1: "Organizational memory,", line2: "redefined.", em: false },
  { line1: "Turn conversations", line2: "into intelligence.", em: true },
  { line1: "The operating system", line2: "for team memory.", em: false },
];

// ─── Floating ambient nodes ────────────────────────────────────────────────────
const NODES = Array.from({ length: 9 }, (_, i) => ({
  id: i,
  x: [12, 28, 55, 70, 85, 20, 65, 40, 78][i],
  y: [18, 72, 30, 55, 20, 45, 75, 85, 48][i],
  delay: i * 0.4,
  size: [3, 5, 3, 4, 3, 5, 3, 4, 3][i],
  duration: [3, 4, 3.5, 4, 3, 4.5, 3, 3.5, 4][i],
}));

// ─── Fake intelligence stream ──────────────────────────────────────────────────
const STREAM_ITEMS = [
  "Q3 roadmap · 3 decisions extracted",
  "Design sync · 7 action items",
  "Board meeting · 12 insights captured",
  "Product review · strategic priorities mapped",
  "Engineering standup · blockers identified",
  "Client call · follow-ups generated",
];

function IntelligenceStream() {
  const [visibleIdx, setVisibleIdx] = useState([0, 1, 2]);
  useEffect(() => {
    const t = setInterval(() => {
      setVisibleIdx((prev) => {
        const next = (prev[prev.length - 1] + 1) % STREAM_ITEMS.length;
        return [...prev.slice(1), next];
      });
    }, 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-2.5 select-none">
      <AnimatePresence mode="popLayout">
        {visibleIdx.map((idx) => (
          <motion.div
            key={`${idx}-${STREAM_ITEMS[idx]}`}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: [0.3, 0.6, 0.4][visibleIdx.indexOf(idx)], y: 0, filter: "blur(0)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg border border-ash/40 bg-carbon/50"
          >
            <div
              className="intel-node shrink-0"
              style={{ animationDelay: `${idx * 0.3}s`, opacity: [1, 0.7, 0.4][visibleIdx.indexOf(idx)] }}
            />
            <span className="mono text-[11px] text-mist">{STREAM_ITEMS[idx]}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function RotatingHero() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setPhraseIdx((p) => (p + 1) % PHRASES.length);
        setIsTransitioning(false);
      }, 400);
    }, 3800);
    return () => clearInterval(t);
  }, []);

  const phrase = PHRASES[phraseIdx];

  return (
    <div className="select-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={phraseIdx}
          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
          exit={{ opacity: 0, y: -18, filter: "blur(6px)" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="display-xl text-cream leading-none">{phrase.line1}</div>
          <div className={`display-xl leading-none ${phrase.em ? "ember-text" : "text-cream"}`}>
            {phrase.line2}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Magnetic cursor tracking for hero panel
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(((e.clientX - rect.left) / rect.width - 0.5) * 20);
    mouseY.set(((e.clientY - rect.top) / rect.height - 0.5) * 20);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authApi.login(form);
      setAuth(data.user, data.access_token, data.refresh_token);
      router.push("/dashboard");
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-black overflow-hidden" ref={containerRef} onMouseMove={handleMouseMove}>

      {/* ── Left: cinematic hero ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[58%] relative flex-col p-14 overflow-hidden">

        {/* Ambient gradient spotlight */}
        <motion.div
          style={{ x: smoothX, y: smoothY, background: "radial-gradient(circle, rgba(196,112,42,0.08) 0%, transparent 65%)" }}
          className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full pointer-events-none"
        />

        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(var(--cream) 1px, transparent 1px), linear-gradient(90deg, var(--cream) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Floating orbital nodes */}
        {NODES.map((n) => (
          <motion.div
            key={n.id}
            className="absolute"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
            animate={{ y: [0, -n.size * 3, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: n.duration, delay: n.delay, repeat: Infinity, ease: "easeInOut" }}
          >
            <div
              className="rounded-full bg-ember"
              style={{
                width: n.size,
                height: n.size,
                boxShadow: `0 0 ${n.size * 3}px rgba(196,112,42,0.5)`,
              }}
            />
          </motion.div>
        ))}

        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 flex items-center gap-3 mb-auto"
        >
          <div className="w-8 h-8 rounded-lg border border-ash flex items-center justify-center">
            <div className="intel-node" style={{ width: 8, height: 8 }} />
          </div>
          <span className="font-display text-base font-semibold text-cream tracking-tight">MeetMind</span>
          <span className="mono text-[10px] text-mist border border-ash/60 px-1.5 py-0.5 rounded">v1.0</span>
        </motion.div>

        {/* Hero rotating text */}
        <div className="relative z-10 my-auto space-y-10">
          <RotatingHero />

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-mist text-base font-body max-w-sm leading-relaxed"
          >
            MeetMind transforms raw transcripts into persistent organizational intelligence.
            Every meeting becomes memory. Every decision becomes searchable.
          </motion.p>

          {/* Intelligence stream */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="space-y-3"
          >
            <p className="label-caps">Live intelligence feed</p>
            <div className="scan-container rounded-xl border border-ash/50 p-4 bg-graphite/40">
              <IntelligenceStream />
            </div>
          </motion.div>
        </div>

        {/* Bottom rule */}
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1, duration: 0.8 }} className="relative z-10 rule-h mt-auto mb-6 origin-left" />
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
          className="relative z-10 mono text-[11px] text-ash">
          Enterprise AI · Organizational Memory · Intelligence Pipeline
        </motion.p>
      </div>

      {/* ── Vertical divider ─────────────────────────────────── */}
      <div className="hidden lg:block relative w-px">
        <div className="absolute inset-0 rule-v" />
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="absolute inset-0 origin-top"
          style={{ background: "linear-gradient(180deg, transparent 0%, var(--ember) 40%, var(--ember-dim) 60%, transparent 100%)", opacity: 0.4 }}
        />
      </div>

      {/* ── Right: auth form ──────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-14 relative">
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className="w-full max-w-sm"
        >
          {/* Form header */}
          <div className="mb-10 space-y-2">
            <p className="label-caps">Welcome back</p>
            <h2 className="display-md text-cream">Sign in to your<br />intelligence workspace</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="label-caps">Email</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                autoComplete="email"
                className="w-full bg-graphite border border-ash rounded-xl px-4 py-3 text-sm text-cream placeholder:text-mist focus:outline-none focus:border-ember/60 focus:bg-carbon transition-all duration-200 font-body"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="label-caps">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                autoComplete="current-password"
                className="w-full bg-graphite border border-ash rounded-xl px-4 py-3 text-sm text-cream placeholder:text-mist focus:outline-none focus:border-ember/60 focus:bg-carbon transition-all duration-200 font-body"
              />
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs text-ember-bright bg-ember/8 border border-ember/20 rounded-xl px-3.5 py-2.5">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit — magnetic button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.015, backgroundColor: "#d4802f" }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="w-full flex items-center justify-center gap-2.5 bg-ember text-white rounded-xl px-5 py-3.5 text-sm font-semibold font-body disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Enter workspace
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="rule-h my-7" />

          <p className="text-center text-xs text-mist">
            No workspace yet?{" "}
            <Link href="/auth/register" className="text-cream hover:text-ember transition-colors">
              Create one →
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
