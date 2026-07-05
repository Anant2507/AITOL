"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import dynamic from "next/dynamic";

// 3D scene loaded client-side only — it uses WebGL, which doesn't exist on the server
const Scene3D = dynamic(() => import("../Scene3D"), { ssr: false });

export default function Hero() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [0, 12]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.9, 0.15]);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <motion.div
        style={{ scale, rotateX, opacity }}
        className="absolute inset-0 -z-10"
      >
        <Scene3D />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-3xl mx-auto text-center px-6"
      >
        <span className="inline-block text-xs font-medium tracking-wide text-[--text-secondary] border border-[--border] rounded-full px-3 py-1 mb-6 bg-white/70 backdrop-blur-sm">
          AI Token Optimization Layer
        </span>
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] mb-6">
          Same model. Same output.<br />
          <span className="gradient-text">Fewer tokens.</span>
        </h1>
        <p className="text-lg text-[--text-secondary] max-w-xl mx-auto mb-10">
          AITOL compresses prompts, caches near-duplicate requests, and routes
          to the cheapest capable model — with a one-line swap into your existing SDK.
        </p>
        <div className="flex items-center justify-center gap-4">
          <a
            href="#cta"
            className="px-6 py-3 rounded-full text-white font-medium"
            style={{ background: "linear-gradient(90deg, #6366F1, #A855F7)" }}
          >
            Get early access
          </a>
          <a href="#how-it-works" className="px-6 py-3 rounded-full border border-[--border] font-medium hover:bg-white transition-colors">
            See how it works
          </a>
        </div>
      </motion.div>
    </section>
  );
}