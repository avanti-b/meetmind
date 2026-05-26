"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { authApi } from "@/lib/api/auth";
import { getApiError } from "@/utils";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authApi.register(form);
      setAuth(data.user, data.access_token, data.refresh_token);
      router.push("/dashboard");
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "full_name" as const, label: "Full name", type: "text", placeholder: "Alex Johnson" },
    { key: "email" as const, label: "Work email", type: "email", placeholder: "you@company.com" },
    { key: "password" as const, label: "Password", type: "password", placeholder: "8+ chars, 1 uppercase, 1 number" },
  ];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(196,112,42,0.06), transparent)" }}
      />
      <div className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(var(--cream) 1px, transparent 1px), linear-gradient(90deg, var(--cream) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Back link */}
        <Link href="/auth/login" className="inline-flex items-center gap-1.5 label-caps text-mist hover:text-cream transition-colors mb-10">
          ← Back to sign in
        </Link>

        {/* Header */}
        <div className="mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-ash/60 bg-graphite/50 mb-2">
            <div className="intel-node" style={{ width: 6, height: 6 }} />
            <span className="mono text-[11px] text-mist">MeetMind Intelligence</span>
          </div>
          <h1 className="display-md text-cream">Begin building<br />organizational memory</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {fields.map(({ key, label, type, placeholder }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className="space-y-1.5"
            >
              <label className="label-caps">{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                value={form[key]}
                onChange={set(key)}
                required
                className="w-full bg-graphite border border-ash rounded-xl px-4 py-3 text-sm text-cream placeholder:text-mist focus:outline-none focus:border-ember/60 focus:bg-carbon transition-all duration-200 font-body"
              />
            </motion.div>
          ))}

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-ember-bright bg-ember/8 border border-ember/20 rounded-xl px-3.5 py-2.5"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2.5 bg-ember text-white rounded-xl px-5 py-3.5 text-sm font-semibold disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create workspace <ArrowRight className="w-4 h-4" /></>}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
