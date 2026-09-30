// Global client state: HUD stats, prefs, toasts.
"use client";

import { create } from "zustand";

export type HudStats = {
  xpTotal: number;
  weeklyXp: number;
  hearts: number;
  heartsMax: number;
  nextRefillAt: string | null;
  gems: number;
  streak: number;
  goalXp: number;
  goalProgress: number;
  activeLanguageId: string | null;
  courseCount: number;
};

type Toast = { id: number; title: string; body?: string; icon?: string };

type State = {
  stats: HudStats | null;
  showReadingAid: boolean;
  soundEnabled: boolean;
  toasts: Toast[];
  setStats: (s: HudStats | null) => void;
  patchStats: (p: Partial<HudStats>) => void;
  setPrefs: (p: { showReadingAid?: boolean; soundEnabled?: boolean }) => void;
  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: number) => void;
  refreshMe: () => Promise<void>;
};

let toastId = 1;

export const useAppStore = create<State>((set, get) => ({
  stats: null,
  showReadingAid: true,
  soundEnabled: true,
  toasts: [],
  setStats: (stats) => set({ stats }),
  patchStats: (p) => set((s) => (s.stats ? { stats: { ...s.stats, ...p } } : s)),
  setPrefs: (p) => set(p),
  pushToast: (t) => {
    const id = toastId++;
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(() => get().dismissToast(id), 4200);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  refreshMe: async () => {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      set({ stats: data.stats, showReadingAid: data.prefs.showReadingAid, soundEnabled: data.prefs.soundEnabled });
    } catch {
      /* offline — keep stale stats */
    }
  },
}));
