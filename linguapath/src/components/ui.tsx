// shadcn-style UI primitives with LinguaPath's chunky 3D look.
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/sounds";

// ── Button ────────────────────────────────────────────────
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline" | "sun";
  size?: "sm" | "md" | "lg";
};

export function Button({ variant = "primary", size = "md", className, onClick, ...props }: ButtonProps) {
  return (
    <button
      onClick={(e) => { sfx.click(); onClick?.(e); }}
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 rounded-2xl font-extrabold uppercase tracking-wide transition-all active:translate-y-[3px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-40 disabled:active:translate-y-0 disabled:active:shadow-chunky",
        size === "sm" && "px-4 py-2 text-xs shadow-chunky-sm",
        size === "md" && "px-6 py-3 text-sm shadow-chunky",
        size === "lg" && "px-8 py-4 text-base shadow-chunky-lg",
        variant === "primary" && "bg-brand-500 text-white shadow-brand-700/60 hover:bg-brand-400 dark:shadow-black/50",
        variant === "secondary" && "bg-slate-200 text-slate-700 shadow-slate-400/60 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-100 dark:shadow-black/50",
        variant === "danger" && "bg-coral-500 text-white shadow-rose-800/60 hover:bg-coral-400",
        variant === "sun" && "bg-sun-400 text-amber-950 shadow-amber-600/60 hover:bg-sun-300",
        variant === "ghost" && "bg-transparent text-slate-500 shadow-none hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
        variant === "outline" && "border-2 border-slate-200 bg-white text-slate-600 shadow-chunky-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
        className
      )}
      {...props}
    />
  );
}

// ── Card ──────────────────────────────────────────────────
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800",
        className
      )}
      {...props}
    />
  );
}

// ── Progress ──────────────────────────────────────────────
export function Progress({ value, className, barClassName }: { value: number; className?: string; barClassName?: string }) {
  return (
    <div className={cn("h-4 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700", className)} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("h-full rounded-full bg-brand-500 transition-all duration-500", barClassName)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────
export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-xs font-extrabold text-brand-700 dark:bg-brand-900 dark:text-brand-200", className)} {...props} />
  );
}

// ── Input ─────────────────────────────────────────────────
export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-800 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-brand-400 focus:bg-white dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:bg-slate-900",
        className
      )}
      {...props}
    />
  );
}

// ── Spinner ───────────────────────────────────────────────
export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center p-8", className)} role="status" aria-label="Loading">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500" />
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────
export function EmptyState({ icon = "📭", title, body, action }: { icon?: string; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-slate-300 p-10 text-center dark:border-slate-600">
      <div className="text-5xl">{icon}</div>
      <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{title}</h3>
      {body && <p className="max-w-sm text-sm font-medium text-slate-500 dark:text-slate-400">{body}</p>}
      {action}
    </div>
  );
}

// ── Stat pill (HUD) ───────────────────────────────────────
export function StatPill({ icon, value, label, tone }: { icon: string; value: string | number; label: string; tone?: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800" title={label} aria-label={`${label}: ${value}`}>
      <span className="text-base leading-none">{icon}</span>
      <span className={cn("text-sm font-extrabold text-slate-700 dark:text-slate-200", tone)}>{value}</span>
    </div>
  );
}
