"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { LayoutGrid, FileText, Brain, BarChart2, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { extractInitials } from "@/utils";

const NAV = [
  { href: "/dashboard",     label: "Hub",        icon: LayoutGrid,  index: "01" },
  { href: "/meetings",      label: "Workspace",  icon: FileText,    index: "02" },
  { href: "/intelligence",  label: "Memory",     icon: Brain,       index: "03" },
  { href: "/analytics",     label: "Analytics",  icon: BarChart2,   index: "04" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <div className="flex h-screen bg-black overflow-hidden font-body">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-ash/40 bg-graphite/30 relative">
        {/* Top scan line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ember/30 to-transparent" />

        {/* Wordmark */}
        <div className="h-14 flex items-center px-5 border-b border-ash/40">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 border border-ash rounded-md flex items-center justify-center">
              <div className="intel-node" style={{ width: 6, height: 6 }} />
            </div>
            <span className="font-display text-sm font-semibold text-cream tracking-tight">MeetMind</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 px-3 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon, index }) => {
            const active = pathname.startsWith(href);
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.15 }}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${
                    active
                      ? "bg-carbon border border-ash/60 text-cream"
                      : "text-mist hover:text-cream hover:bg-carbon/60"
                  }`}
                >
                  {/* Active ember indicator */}
                  {active && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-ember"
                      style={{ boxShadow: "0 0 8px rgba(196,112,42,0.6)" }}
                    />
                  )}
                  <span className="mono text-[10px] text-ash w-5 shrink-0 group-hover:text-mist transition-colors">
                    {index}
                  </span>
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-sm font-medium">{label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom rule + user */}
        <div className="border-t border-ash/40 p-4 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-carbon border border-ash flex items-center justify-center text-[11px] font-semibold text-ember font-mono">
              {user ? extractInitials(user.full_name) : "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-cream truncate">{user?.full_name}</p>
              <p className="mono text-[10px] text-ash truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); router.push("/auth/login"); }}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-mist hover:text-ember hover:bg-ember/5 transition-all duration-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto relative">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
