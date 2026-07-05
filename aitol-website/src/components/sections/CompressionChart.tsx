"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import RevealSection from "../RevealSection";

type DayData = { day: string; requests: number };

export default function CompressionChart() {
  const [data, setData] = useState<DayData[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/stats")
      .then((res) => res.json())
      .then((json) => setData(json.requestsLast7Days ?? []))
      .catch(() => setData([]));
  }, []);

  return (
    <RevealSection>
      <section className="max-w-3xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-semibold tracking-tight mb-2">Requests, last 7 days.</h2>
        <p className="text-[--text-secondary] mb-10">Live traffic pulled directly from your AITOL backend.</p>
        <div className="h-72 rounded-2xl border border-[--border] bg-[--surface] p-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB" }} />
              <Bar dataKey="requests" fill="#6366F1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </RevealSection>
  );
}