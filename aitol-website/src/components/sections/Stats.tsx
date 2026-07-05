"use client";

import { useEffect, useState } from "react";
import RevealSection from "../RevealSection";

type StatsData = {
  cacheHitRate: number;
  costSaved: number;
  requestsProcessed: number;
  avgResponseTimeMs: number;
};

export default function Stats() {
  const [data, setData] = useState<StatsData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3000/stats")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setError(true));
  }, []);

  const stats = [
    { value: data ? `${data.cacheHitRate}%` : "—", label: "Cache hit rate" },
    { value: data ? `$${data.costSaved.toFixed(2)}` : "—", label: "Cost saved" },
    { value: data ? data.requestsProcessed.toLocaleString() : "—", label: "Requests processed" },
    { value: data ? `${data.avgResponseTimeMs}ms` : "—", label: "Avg response time" },
  ];

  return (
    <RevealSection>
      <section className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-[--border]">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-3xl font-semibold gradient-text">{s.value}</div>
            <div className="text-sm text-[--text-secondary] mt-2">{s.label}</div>
          </div>
        ))}
      </section>
      {error && (
        <p className="text-center text-sm text-[--text-secondary] -mt-8 mb-8">
          Live stats unavailable — make sure the AITOL backend is running on localhost:3000.
        </p>
      )}
    </RevealSection>
  );
}