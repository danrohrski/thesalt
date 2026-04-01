"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#f2f0eb" }}
    >
      <div className="w-full max-w-sm">
        <h1
          className="text-5xl text-center mb-2 font-[family-name:var(--font-display)]"
          style={{ color: "#232120" }}
        >
          The Salt
        </h1>
        <p
          className="text-center mb-12 text-lg font-[family-name:var(--font-display)] italic"
          style={{ color: "#232120", opacity: 0.6 }}
        >
          Admin
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-sm tracking-wide font-[family-name:var(--font-display)]"
              style={{ color: "#232120", opacity: 0.7 }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-3 text-base font-[family-name:var(--font-display)] bg-transparent outline-none"
              style={{
                border: "1px solid #232120",
                color: "#232120",
                borderRadius: 0,
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="text-sm tracking-wide font-[family-name:var(--font-display)]"
              style={{ color: "#232120", opacity: 0.7 }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 text-base font-[family-name:var(--font-display)] bg-transparent outline-none"
              style={{
                border: "1px solid #232120",
                color: "#232120",
                borderRadius: 0,
              }}
            />
          </div>

          {error && (
            <p
              className="text-sm font-[family-name:var(--font-display)]"
              style={{ color: "#c4622d" }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-base tracking-widest uppercase font-[family-name:var(--font-display)] transition-opacity"
            style={{
              backgroundColor: "#232120",
              color: "#f2f0eb",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
