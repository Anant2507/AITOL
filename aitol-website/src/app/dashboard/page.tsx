"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

type StatsData = {
  cacheHitRate: number;
  costSaved: number;
  requestsProcessed: number;
  avgResponseTimeMs: number;
};

function parseJwt(token: string): { email?: string } | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("aitol_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const payload = parseJwt(token);
    if (!payload?.email) {
      router.push("/login");
      return;
    }

    setEmail(payload.email);
    setChecked(true);

    fetch("http://localhost:3000/stats")
      .then((res) => res.json())
      .then((json) => setStats(json))
      .catch(() => setStats(null));
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("aitol_token");
    router.push("/login");
  }

  if (!checked) return null;

  const cards = [
    { value: stats ? `${stats.cacheHitRate}%` : "—", label: "Cache hit rate" },
    { value: stats ? `$${stats.costSaved.toFixed(2)}` : "—", label: "Cost saved" },
    { value: stats ? stats.requestsProcessed.toLocaleString() : "—", label: "Requests processed" },
    { value: stats ? `${stats.avgResponseTimeMs}ms` : "—", label: "Avg response time" },
  ];

  return (
    <main className="min-h-screen px-6 py-16 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-[--text-secondary]">{email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-full border border-[--border] text-sm font-medium hover:bg-white transition-colors"
          >
            Log out
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {cards.map((c) => (
            <div key={c.label} className="rounded-2xl border border-[--border] bg-[--surface] p-6 text-center">
              <div className="text-2xl font-semibold gradient-text">{c.value}</div>
              <div className="text-xs text-[--text-secondary] mt-2">{c.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </main>
  );
}