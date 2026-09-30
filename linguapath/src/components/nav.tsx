// Desktop sidebar + mobile bottom tab bar.
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Dumbbell, Trophy, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/practice", label: "Practice", icon: Dumbbell },
  { href: "/leaderboard", label: "League", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
];

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href={compact ? "/learn" : "/"} className="flex items-center gap-2" aria-label="LinguaPath home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-lg shadow-chunky-sm" aria-hidden>
        🦊
      </span>
      {!compact && (
        <span className="text-xl font-black tracking-tight text-brand-600 dark:text-brand-400">
          Lingua<span className="text-sun-500">Path</span>
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-2 border-r-2 border-slate-200 p-5 dark:border-slate-800 md:flex" aria-label="Main navigation">
      <div className="px-2 py-3">
        <Logo />
      </div>
      <nav className="flex flex-col gap-1.5">
        {ITEMS.map((it) => {
          const active = path === it.href || (it.href === "/learn" && path.startsWith("/lesson"));
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-sm font-extrabold uppercase tracking-wide transition",
                active
                  ? "border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300"
                  : "border-transparent text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              )}
            >
              <Icon className="h-5 w-5" />
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto">
        <Link href="/settings" className="flex items-center gap-3 rounded-2xl border-2 border-transparent px-4 py-3 text-sm font-extrabold uppercase tracking-wide text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
          <Settings className="h-5 w-5" /> Settings
        </Link>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 md:hidden" aria-label="Main navigation">
      <div className="grid grid-cols-4">
        {ITEMS.map((it) => {
          const active = path === it.href || (it.href === "/learn" && path.startsWith("/lesson"));
          const Icon = it.icon;
          return (
            <Link key={it.href} href={it.href} aria-current={active ? "page" : undefined} className={cn("flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-extrabold uppercase tracking-wide", active ? "text-brand-600 dark:text-brand-400" : "text-slate-400")}>
              <Icon className="h-6 w-6" />
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
