"use client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { meetingsApi } from "@/lib/api/meetings";
import { formatDate } from "@/utils";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-carbon border border-ash rounded-xl px-3 py-2 font-mono text-xs text-cream shadow-xl">
      <p className="text-mist mb-1">{label}</p>
      <p>{payload[0]?.value} meeting{payload[0]?.value !== 1 ? "s" : ""}</p>
    </div>
  );
};

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["meetings"], queryFn: meetingsApi.list });
  const meetings = data?.meetings || [];
  const completed = meetings.filter((m) => m.status === "completed");

  const byDate = meetings.reduce<Record<string, number>>((acc, m) => {
    const d = formatDate(m.created_at).slice(0, 6);
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(byDate).slice(-10).map(([date, count]) => ({ date, count }));

  const metrics = [
    { label: "Total meetings", value: meetings.length, index: "01" },
    { label: "Intelligence reports", value: completed.length, index: "02" },
    {
      label: "Analysis coverage",
      value: meetings.length ? `${Math.round((completed.length / meetings.length) * 100)}%` : "—",
      index: "03",
    },
    {
      label: "Action items extracted",
      value: meetings.reduce((a, m) => a + (m.action_items?.split("\n").filter(Boolean).length || 0), 0),
      index: "04",
    },
    {
      label: "Decisions logged",
      value: meetings.reduce((a, m) => a + (m.decisions?.split("\n").filter(Boolean).length || 0), 0),
      index: "05",
    },
  ];

  return (
    <div className="min-h-full bg-black font-body">
      {/* Header */}
      <div className="border-b border-ash/40 px-10 py-10">
        <p className="label-caps mb-2">System analytics</p>
        <h1 className="display-md text-cream">
          Pipeline <span className="ember-text">metrics.</span>
        </h1>
      </div>

      <div className="flex divide-x divide-ash/40 min-h-[calc(100vh-140px)]">
        {/* Left: chart */}
        <div className="flex-1 px-10 py-10 space-y-8">
          <div className="space-y-4">
            <p className="label-caps">Meeting creation timeline</p>

            {isLoading ? (
              <div className="h-48 bg-carbon/40 rounded-xl animate-pulse" />
            ) : chartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center border border-ash/30 rounded-xl">
                <p className="text-xs text-ash mono">No data yet</p>
              </div>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barSize={16} margin={{ left: -20 }}>
                    <XAxis dataKey="date" tick={{ fill: "#6b6560", fontSize: 10, fontFamily: "JetBrains Mono" }}
                      axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#6b6560", fontSize: 10, fontFamily: "JetBrains Mono" }}
                      axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(196,112,42,0.04)" }} />
                    <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={i === chartData.length - 1 ? "#c4702a" : "#3d3935"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Status breakdown */}
          <div className="space-y-4">
            <p className="label-caps">Status breakdown</p>
            <div className="space-y-2">
              {[
                { label: "Analyzed", value: completed.length, color: "#10b981" },
                { label: "Ready for analysis", value: meetings.filter(m => m.status === "uploaded").length, color: "#c4702a" },
                { label: "Failed", value: meetings.filter(m => m.status === "failed").length, color: "#ef4444" },
              ].map(({ label, value, color }) => {
                const pct = meetings.length ? (value / meetings.length) * 100 : 0;
                return (
                  <div key={label} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="mono text-[11px] text-mist">{label}</span>
                      <span className="mono text-[11px] text-cream">{value}</span>
                    </div>
                    <div className="h-1 bg-carbon rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                        className="h-full rounded-full"
                        style={{ background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: key numbers, editorial */}
        <div className="w-72 shrink-0 px-8 py-10 space-y-0">
          <p className="label-caps mb-8">Key numbers</p>
          {metrics.map(({ label, value, index }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className="border-b border-ash/30 py-6 flex items-baseline justify-between gap-4"
            >
              <div className="space-y-0.5">
                <span className="mono text-[10px] text-ash">{index}</span>
                <p className="text-xs text-mist mt-1">{label}</p>
              </div>
              <span className="font-display text-3xl font-bold text-cream tabular-nums">{value}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
