// Shared login / signup form with validation + error states.
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button, Input } from "./ui";
import { Mascot } from "./mascot";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(params.get("error") ? "Your session expired. Please log in again." : "");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [googleOn, setGoogleOn] = useState(false);

  useEffect(() => {
    fetch("/api/auth/providers").then((r) => r.json()).then((p) => setGoogleOn(Boolean(p?.google))).catch(() => {});
  }, []);

  function validate(): boolean {
    const e: typeof fieldErrors = {};
    if (mode === "signup" && name.trim().length < 2) e.name = "Tell us your name (2+ characters).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Enter a valid email address.";
    if (password.length < 8) e.password = "Password needs at least 8 characters.";
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === "signup") {
        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Couldn't create your account. Try again.");
          setLoading(false);
          return;
        }
      }
      const result = await signIn("credentials", { email: email.trim(), password, redirect: false });
      if (result?.error) {
        setError(mode === "signup" ? "Account created! But auto sign-in failed — please log in." : "Wrong email or password. Try again!");
        setLoading(false);
        return;
      }
      router.push(mode === "signup" ? "/languages" : "/learn");
      router.refresh();
    } catch {
      setError("Something went wrong. Check your connection and retry.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-10">
      <Mascot size={96} mood="happy" />
      <h1 className="mt-2 text-2xl font-black text-slate-800 dark:text-white">
        {mode === "signup" ? "Create your profile" : "Welcome back!"}
      </h1>
      <p className="mt-1 text-sm font-bold text-slate-400">
        {mode === "signup" ? "One account for all 5 languages." : "Your streak missed you. 🔥"}
      </p>

      <form onSubmit={submit} className="mt-6 flex w-full flex-col gap-3" noValidate>
        {mode === "signup" && (
          <div>
            <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} aria-label="Your name" autoComplete="name" />
            {fieldErrors.name && <p className="mt-1 text-xs font-bold text-coral-500" role="alert">{fieldErrors.name}</p>}
          </div>
        )}
        <div>
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" autoComplete="email" />
          {fieldErrors.email && <p className="mt-1 text-xs font-bold text-coral-500" role="alert">{fieldErrors.email}</p>}
        </div>
        <div>
          <Input type="password" placeholder="Password (8+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} aria-label="Password" autoComplete={mode === "signup" ? "new-password" : "current-password"} />
          {fieldErrors.password && <p className="mt-1 text-xs font-bold text-coral-500" role="alert">{fieldErrors.password}</p>}
        </div>
        {error && (
          <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-3 text-sm font-bold text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-300" role="alert">
            {error}
          </div>
        )}
        <Button type="submit" size="lg" disabled={loading} className="mt-1 w-full">
          {loading ? "One moment…" : mode === "signup" ? "Create account" : "Log in"}
        </Button>
      </form>

      {googleOn && (
        <>
          <div className="my-4 flex w-full items-center gap-3 text-xs font-extrabold uppercase tracking-widest text-slate-400">
            <span className="h-0.5 flex-1 rounded bg-slate-200 dark:bg-slate-700" /> or <span className="h-0.5 flex-1 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
          <Button variant="outline" className="w-full" onClick={() => signIn("google", { callbackUrl: "/learn" })}>
            <span aria-hidden>🔎</span> Continue with Google
          </Button>
        </>
      )}

      <p className="mt-6 text-sm font-bold text-slate-400">
        {mode === "signup" ? (
          <>Already learning? <a href="/login" className="text-brand-600 dark:text-brand-400">Log in</a></>
        ) : (
          <>New here? <a href="/signup" className="text-brand-600 dark:text-brand-400">Create an account</a></>
        )}
      </p>
      {mode === "login" && (
        <p className="mt-2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          Demo: demo@linguapath.app / linguapath123
        </p>
      )}
    </div>
  );
}
