"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = mode === "login" ? "/auth/login" : "/auth/register";

    try {
      const res = await fetch(`http://localhost:3000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      if (mode === "login") {
        localStorage.setItem("aitol_token", data.token);
        router.push("/dashboard");
      } else {
        setMode("login");
        setError("Account created — log in now");
      }
    } catch {
      setError("Could not reach the backend. Is it running on localhost:3000?");
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-[--bg]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm rounded-2xl border border-[--border] bg-[--surface] p-8"
      >
        <h1 className="text-2xl font-semibold tracking-tight mb-1">
          {mode === "login" ? "Log in" : "Create account"}
        </h1>
        <p className="text-sm text-[--text-secondary] mb-6">
          {mode === "login" ? "Welcome back to AITOL." : "Start optimizing your token usage."}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-4 py-3 rounded-lg border border-[--border] bg-white text-sm focus:outline-none focus:border-[--grad-start]"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="px-4 py-3 rounded-lg border border-[--border] bg-white text-sm focus:outline-none focus:border-[--grad-start]"
          />

          {error && <p className="text-sm text-[--rose]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 px-4 py-3 rounded-lg text-white font-medium disabled:opacity-50"
            style={{ background: "linear-gradient(90deg, #6366F1, #A855F7)" }}
          >
            {loading ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>

        <p className="text-sm text-[--text-secondary] mt-6 text-center">
          {mode === "login" ? "No account yet?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
            className="font-medium gradient-text"
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </motion.div>
    </main>
  );
}