// Client-side providers: session, theme, HUD sync, toasts.
"use client";

import { useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { setSoundEnabled } from "@/lib/sounds";
import { preloadVoices } from "@/lib/speech";

function MeSync() {
  const { status } = useSession();
  const refreshMe = useAppStore((s) => s.refreshMe);
  const soundEnabled = useAppStore((s) => s.soundEnabled);
  useEffect(() => {
    if (status === "authenticated") void refreshMe();
  }, [status, refreshMe]);
  useEffect(() => {
    setSoundEnabled(soundEnabled);
    preloadVoices();
  }, [soundEnabled]);
  return null;
}

function Toaster() {
  const toasts = useAppStore((s) => s.toasts);
  const dismiss = useAppStore((s) => s.dismissToast);
  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4 md:bottom-8" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            onClick={() => dismiss(t.id)}
            className="pointer-events-auto flex w-full items-center gap-3 rounded-2xl border-2 border-slate-800 bg-slate-900 p-3 text-left text-white shadow-chunky-lg dark:border-slate-600"
          >
            {t.icon && <span className="text-2xl">{t.icon}</span>}
            <span>
              <span className="block text-sm font-extrabold">{t.title}</span>
              {t.body && <span className="block text-xs font-medium text-slate-300">{t.body}</span>}
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <MeSync />
        {children}
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  );
}
