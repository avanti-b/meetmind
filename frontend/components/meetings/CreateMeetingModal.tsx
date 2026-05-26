"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface Props { open: boolean; onClose: () => void; onCreate: (title: string) => Promise<void>; }

export function CreateMeetingModal({ open, onClose, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true); setError("");
    try { await onCreate(title.trim()); setTitle(""); onClose(); }
    catch { setError("Failed to create. Try again."); }
    finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 font-body"
          >
            <div className="bg-graphite border border-ash/70 rounded-2xl w-full max-w-md p-7 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="label-caps mb-1">New meeting</p>
                  <h2 className="font-display text-lg font-semibold text-cream">Name this workspace</h2>
                </div>
                <button onClick={onClose} className="text-mist hover:text-cream transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="label-caps">Meeting title</label>
                  <input
                    placeholder="e.g. Q4 Product Strategy Review"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus required
                    className="w-full bg-carbon border border-ash rounded-xl px-4 py-3 text-sm text-cream placeholder:text-mist focus:outline-none focus:border-ember/60 transition-all"
                  />
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={onClose}
                    className="px-4 py-2 text-sm text-mist hover:text-cream transition-colors rounded-xl">
                    Cancel
                  </button>
                  <motion.button
                    type="submit" disabled={loading}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="px-5 py-2 bg-ember text-white rounded-xl text-sm font-semibold disabled:opacity-50"
                  >
                    {loading ? "Creating…" : "Create meeting"}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
