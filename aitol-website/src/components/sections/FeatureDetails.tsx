"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import RevealSection from "../RevealSection";

type ChartRow = Record<string, number | string>;

function DetailBlock({
  tag,
  title,
  desc,
  data,
  beforeKey,
  afterKey,
  beforeLabel,
  afterLabel,
  xKey,
  note,
}: {
  tag: string;
  title: string;
  desc: string;
  data: ChartRow[];
  beforeKey: string;
  afterKey: string;
  beforeLabel: string;
  afterLabel: string;
  xKey: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-[--border] bg-[--surface] p-8 mb-8">
      <span className="inline-block text-xs font-mono text-[--text-secondary] bg-white border border-[--border] rounded-full px-3 py-1 mb-4">
        {tag}
      </span>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-[--text-secondary] mb-6 max-w-xl">{desc}</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey={xKey} stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB" }} />
            <Legend />
            <Line type="monotone" dataKey={beforeKey} name={beforeLabel} stroke="#FF7285" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey={afterKey} name={afterLabel} stroke="#22D3EE" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-[--text-tertiary] mt-4">{note}</p>
    </div>
  );
}

const mrlData = [
  { req: "1", before: 1180, after: 590 },
  { req: "2", before: 1320, after: 640 },
  { req: "3", before: 1050, after: 510 },
  { req: "4", before: 1400, after: 700 },
  { req: "5", before: 1220, after: 600 },
  { req: "6", before: 980, after: 470 },
  { req: "7", before: 1500, after: 760 },
  { req: "8", before: 1100, after: 540 },
];

const cceData = [
  { req: "1", before: 820, after: 500 },
  { req: "2", before: 950, after: 580 },
  { req: "3", before: 700, after: 430 },
  { req: "4", before: 1100, after: 660 },
  { req: "5", before: 860, after: 520 },
  { req: "6", before: 780, after: 470 },
  { req: "7", before: 990, after: 600 },
  { req: "8", before: 840, after: 510 },
];

const cacheData = [
  { day: "Mon", withoutCache: 1200, withCache: 480 },
  { day: "Tue", withoutCache: 1900, withCache: 760 },
  { day: "Wed", withoutCache: 1500, withCache: 600 },
  { day: "Thu", withoutCache: 1700, withCache: 680 },
  { day: "Fri", withoutCache: 2100, withCache: 840 },
  { day: "Sat", withoutCache: 900, withCache: 360 },
  { day: "Sun", withoutCache: 800, withCache: 320 },
];

const routerData = [
  { req: "1", singleModel: 0.42, routed: 0.11 },
  { req: "2", singleModel: 0.38, routed: 0.09 },
  { req: "3", singleModel: 0.45, routed: 0.14 },
  { req: "4", singleModel: 0.40, routed: 0.10 },
  { req: "5", singleModel: 0.50, routed: 0.16 },
  { req: "6", singleModel: 0.36, routed: 0.08 },
  { req: "7", singleModel: 0.47, routed: 0.13 },
  { req: "8", singleModel: 0.41, routed: 0.10 },
];

export default function FeatureDetails() {
  return (
    <RevealSection>
      <section className="max-w-4xl mx-auto px-6 py-24">
        <div className="mb-12">
          <h2 className="text-3xl font-semibold tracking-tight mb-2">Inside each engine.</h2>
          <p className="text-[--text-secondary]">
            Illustrative examples based on measured compression and savings ranges from local testing.
          </p>
        </div>

        <DetailBlock
          tag="MRL"
          title="Machine-Readable Language compressor"
          desc="Natural-language prompts compiled into structured tokens across six ordered layers, before the request ever reaches a model."
          data={mrlData}
          xKey="req"
          beforeKey="before"
          afterKey="after"
          beforeLabel="Raw tokens"
          afterLabel="Compiled tokens"
          note="Example requests — reflects the 45–56% compression range measured in local testing."
        />

        <DetailBlock
          tag="CCE"
          title="Code Compressor Engine"
          desc="A two-pass orchestrator builds a shared symbol map across code blocks so repeated identifiers and boilerplate collapse safely."
          data={cceData}
          xKey="req"
          beforeKey="before"
          afterKey="after"
          beforeLabel="Raw tokens"
          afterLabel="Compiled tokens"
          note="Example code-heavy requests — reflects the 34–44% compression range measured in local testing."
        />

        <DetailBlock
          tag="CACHE"
          title="Semantic response cache"
          desc="Exact and near-duplicate requests are served from cache instead of hitting the model at all."
          data={cacheData}
          xKey="day"
          beforeKey="withoutCache"
          afterKey="withCache"
          beforeLabel="Tokens sent (no cache)"
          afterLabel="Tokens sent (with cache)"
          note="Example weekly traffic — reflects the 60%+ cache hit rate measured in local testing."
        />

        <DetailBlock
          tag="ROUTER"
          title="Smart model router"
          desc="Each request is scored for what it actually needs, then routed to the cheapest capable model instead of a single default."
          data={routerData}
          xKey="req"
          beforeKey="singleModel"
          afterKey="routed"
          beforeLabel="Cost — single premium model"
          afterLabel="Cost — smart routed"
          note="Example cost per request in USD — illustrative, based on relative model pricing tiers."
        />
      </section>
    </RevealSection>
  );
}