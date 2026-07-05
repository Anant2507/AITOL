"use client";

import { motion } from "motion/react";

export default function GradientOrb() {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, #6366F1, transparent 70%)" }}
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[5%] right-[5%] w-[450px] h-[450px] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, #22D3EE, transparent 70%)" }}
      />
      <motion.div
        animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[30%] left-[35%] w-[400px] h-[400px] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #A855F7, transparent 70%)" }}
      />
    </div>
  );
}