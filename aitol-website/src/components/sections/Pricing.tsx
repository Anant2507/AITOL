"use client";

import RevealSection from "../RevealSection";

const tiers = [
  { name: "Self-hosted", price: "$0", desc: "Run the core engine yourself.", featured: false },
  { name: "Hosted", price: "Usage-based", desc: "Managed proxy, no infra to run.", featured: true },
  { name: "Enterprise", price: "Custom", desc: "Private deployment, volume pricing.", featured: false },
];

export default function Pricing() {
  return (
    <RevealSection>
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-semibold tracking-tight mb-10 text-center">Open-core. Pay for what you route.</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`rounded-2xl p-8 border ${t.featured ? "gradient-border bg-[--surface]" : "border-[--border] bg-[--surface]"}`}
            >
              <h3 className="font-semibold text-lg mb-1">{t.name}</h3>
              <div className="text-2xl font-semibold my-4">{t.price}</div>
              <p className="text-sm text-[--text-secondary]">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </RevealSection>
  );
}