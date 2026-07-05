"use client";

import * as Tabs from "@radix-ui/react-tabs";
import RevealSection from "../RevealSection";

const features = [
  { id: "mrl", tag: "MRL", title: "Machine-Readable Language compressor", desc: "Compiles natural-language prompts into structured tokens across six ordered layers.", meta: "45–56% smaller" },
  { id: "cce", tag: "CCE", title: "Code Compressor Engine", desc: "Two-pass orchestrator with a shared symbol map across code blocks.", meta: "34–44% smaller" },
  { id: "cache", tag: "CACHE", title: "Semantic response cache", desc: "Exact + embedding-based cosine-similarity matching over prior responses.", meta: "60%+ hit rate" },
  { id: "router", tag: "ROUTER", title: "Smart model router", desc: "Routes each request to the cheapest capable model via OpenRouter.", meta: "Multi-provider" },
];

export default function Features() {
  return (
    <RevealSection>
      <section id="product" className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-semibold tracking-tight mb-2">Four systems, one proxy call.</h2>
        <p className="text-[--text-secondary] mb-10">Each engine handles a different source of waste.</p>

        <Tabs.Root defaultValue="mrl">
          <Tabs.List className="flex gap-2 mb-8 flex-wrap">
            {features.map((f) => (
              <Tabs.Trigger
                key={f.id}
                value={f.id}
                className="px-4 py-2 rounded-full text-sm font-medium border border-[--border] data-[state=active]:text-white data-[state=active]:border-transparent transition-colors"
                style={{}}
              >
                <span
                  className="data-[state=active]:inline hidden absolute"
                />
                {f.tag}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {features.map((f) => (
            <Tabs.Content key={f.id} value={f.id}>
              <div className="rounded-2xl border border-[--border] bg-[--surface] p-10">
                <h3 className="text-2xl font-semibold mb-3">{f.title}</h3>
                <p className="text-[--text-secondary] mb-6 max-w-xl">{f.desc}</p>
                <span className="inline-block text-sm font-medium gradient-text">{f.meta}</span>
              </div>
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </section>
    </RevealSection>
  );
}