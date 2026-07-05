"use client";

import RevealSection from "../RevealSection";

export default function CTA() {
  return (
    <RevealSection>
      <section id="cta" className="max-w-2xl mx-auto px-6 py-32 text-center">
        <h2 className="text-3xl font-semibold tracking-tight mb-4">
          Stop paying full price for repeat tokens.
        </h2>
        <p className="text-[--text-secondary] mb-8">
          AITOL is in active development. Join early access to get an API key first.
        </p>
        <a
          href="#"
          className="inline-block px-6 py-3 rounded-full text-white font-medium"
          style={{ background: "linear-gradient(90deg, #6366F1, #A855F7, #22D3EE)" }}
        >
          Request early access
        </a>
      </section>
    </RevealSection>
  );
}