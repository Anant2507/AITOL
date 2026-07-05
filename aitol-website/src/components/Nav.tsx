"use client";

import { motion } from "motion/react";

const links = ["Product", "How it works", "Pricing", "Docs"];

export default function Nav() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-[--border]"
    >
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
        <span className="font-semibold text-lg tracking-tight">AITOL</span>
        <div className="hidden md:flex gap-8 text-sm text-[--text-secondary]">
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase().replace(/\s/g, "-")}`} className="hover:text-black transition-colors">
              {l}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/Anant2507/AITOL"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[--text-secondary] hover:text-black transition-colors"
          >
            GitHub
          </a>
          <a
            href="/login"
            className="text-sm font-medium px-4 py-2 rounded-full text-white"
            style={{ background: "linear-gradient(90deg, #6366F1, #A855F7)" }}
          >
            Get early access
          </a>
        </div>
      </nav>
    </motion.header>
  );
}