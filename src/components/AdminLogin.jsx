import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiLock, FiMail } from "react-icons/fi";
import { supabase } from "../lib/supabase";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) throw loginError;

      if (data.user?.app_metadata?.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("This account does not have admin access.");
      }

      navigate("/admin", { replace: true });
    } catch (err) {
      setError(
        err.message === "Invalid login credentials"
          ? "Incorrect email or password."
          : err.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08090b] px-5 py-12 text-white">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <FiArrowLeft />
          Back to website
        </Link>

        <div className="rounded-2xl border border-white/10 bg-[#0d0e12] p-6 sm:p-9">
          <div className="mb-8">
            <p className="text-xs font-bold tracking-[3px] text-[#e32636]">
              M&G AUTO REPAIR
            </p>

            <h1 className="mt-4 text-3xl font-bold tracking-tight">
              Admin sign in
            </h1>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Sign in to manage repair requests and appointments.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block text-sm text-zinc-300">
              Email address
              <span className="mt-2 flex items-center gap-3 rounded-lg border border-white/10 bg-[#08090b] px-4 focus-within:border-[#e32636]">
                <FiMail className="shrink-0 text-zinc-500" />
                <input
                  className="w-full bg-transparent py-3 text-white outline-none placeholder:text-zinc-600"
                  type="email"
                  autoComplete="username"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </span>
            </label>

            <label className="block text-sm text-zinc-300">
              Password
              <span className="mt-2 flex items-center gap-3 rounded-lg border border-white/10 bg-[#08090b] px-4 focus-within:border-[#e32636]">
                <FiLock className="shrink-0 text-zinc-500" />
                <input
                  className="w-full bg-transparent py-3 text-white outline-none placeholder:text-zinc-600"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </span>
            </label>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#e32636] px-5 py-3.5 text-sm font-bold transition hover:bg-[#c91d2c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-xs leading-5 text-zinc-600">
            Authorized staff only.
          </p>
        </div>
      </div>
    </main>
  );
}