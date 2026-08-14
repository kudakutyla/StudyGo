"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(form);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f3ee] px-4 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-[#eadcca] bg-white p-8 shadow-soft">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8d7c1] text-lg font-bold text-[#3f312b]">S</div>
          <h1 className="text-3xl font-semibold text-[#1f1a17]">Welcome back</h1>
          <p className="mt-2 text-sm text-[#65554d]">Log in to continue with StudyGo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#2d241f]">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full rounded-xl border border-[#d9cab8] bg-[#f9f5f2] px-3 py-2.5 text-[#1f1a17] outline-none ring-0 transition focus:border-[#b7835a]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#2d241f]">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="w-full rounded-xl border border-[#d9cab8] bg-[#f9f5f2] px-3 py-2.5 pr-11 text-[#1f1a17] outline-none transition focus:border-[#b7835a]"
                placeholder="Enter your password"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-3 flex items-center text-[#5f4b42]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-xl bg-[#3f312b] px-4 py-3 font-medium text-white transition hover:bg-[#2c231f] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Logging in...</> : "Login"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#65554d]">
          Don’t have an account? <Link href="/register" className="font-medium text-[#3f312b]">Create one</Link>
        </p>
      </div>
    </main>
  );
}
