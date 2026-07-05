"use client";
import { Accordion } from "@base-ui/react/accordion";
import RevealSection from "../RevealSection";

const stages = [
  { title: "01 · Request in", desc: "OpenAI-compatible payload hits your AITOL endpoint." },
  { title: "02 · Cache check", desc: "Exact + semantic match against prior responses." },
  { title: "03 · Compress", desc: "MRL or CCE compiles the prompt down before it's sent anywhere." },
  { title: "04 · Route", desc: "Smart Router picks the cheapest model that meets the task." },
  { title: "05 · Response out", desc: "Result returns to you and is written back to cache." },
];

export default function HowItWorks() {
  return (
    <RevealSection>
      <section id="how-it-works" className="max-w-3xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-semibold tracking-tight mb-2">Request lifecycle</h2>
        <p className="text-[--text-secondary] mb-10">Most repeat traffic never leaves stage two.</p>

        <Accordion.Root className="space-y-3">
          {stages.map((s) => (
            <Accordion.Item key={s.title} value={s.title} className="border border-[--border] rounded-xl overflow-hidden">
              <Accordion.Header>
                <Accordion.Trigger className="w-full text-left px-5 py-4 font-medium flex justify-between items-center">
                  {s.title}
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Panel className="px-5 pb-4 text-[--text-secondary] text-sm">
                {s.desc}
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </section>
    </RevealSection>
  );
}