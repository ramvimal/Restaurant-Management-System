// All 9 exercise-type renderers + grading logic. Content-agnostic: everything
// comes from ExerciseDTO (seeded from content/*.json — never hardcoded).
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic, Volume2, Lightbulb, Delete } from "lucide-react";
import type { ExerciseDTO } from "@/lib/content";
import { normalizeAnswer, cn, isCjkLocale } from "@/lib/utils";
import { speak, createRecognizer, speechRecognitionSupported } from "@/lib/speech";
import { sfx } from "@/lib/sounds";

export type ExState = { value: unknown; complete: boolean };

export function gradeExercise(ex: ExerciseDTO, value: unknown): boolean {
  const norm = normalizeAnswer;
  switch (ex.type) {
    case "mc_text":
    case "mc_image":
    case "listening_choice":
    case "fill_blank":
      return norm(String(value ?? "")) === norm(ex.answer);
    case "type_answer":
    case "listening_type":
      return norm(String(value ?? "")) === norm(ex.answer);
    case "word_bank": {
      let expected: string[] = [];
      try { expected = JSON.parse(ex.answer); } catch { expected = [ex.answer]; }
      const got = Array.isArray(value) ? (value as string[]) : [];
      return norm(got.join(" ")) === norm(expected.join(" "));
    }
    case "match":
      return (value as { errors?: number } | null)?.errors === 0;
    case "speaking": {
      const t = norm(String(value ?? ""));
      const a = norm(ex.answer);
      return t.length > 0 && (t === a || t.includes(a) || (a.length > 3 && a.includes(t)));
    }
    default:
      return false;
  }
}

function QuestionText({ ex, showAid }: { ex: ExerciseDTO; showAid: boolean }) {
  if (ex.type === "listening_choice" || ex.type === "listening_type") return null;
  return (
    <div>
      <p className={cn("text-xl font-extrabold text-slate-800 dark:text-slate-100 sm:text-2xl", ex.questionLang === "target" && "cjk text-2xl sm:text-3xl")}>
        {ex.type === "fill_blank" ? <Blanked sentence={ex.question} /> : ex.question}
      </p>
      {showAid && ex.readingAid && (
        <p className="mt-1 text-base font-bold text-brand-600 dark:text-brand-400">({ex.readingAid})</p>
      )}
    </div>
  );
}

function Blanked({ sentence }: { sentence: string }) {
  const parts = sentence.split("___");
  return (
    <>
      {parts[0]}
      <span className="mx-1 inline-block min-w-[4rem] border-b-4 border-dashed border-brand-400 px-2 text-center text-brand-600">&nbsp;</span>
      {parts[1]}
    </>
  );
}

function Hint({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  return (
    <div className="mt-3">
      <button onClick={() => setOpen(!open)} className="inline-flex items-center gap-1 text-sm font-extrabold text-sky-500 hover:text-sky-400" aria-expanded={open}>
        <Lightbulb className="h-4 w-4" /> {open ? "Hide hint" : "Need a hint?"}
      </button>
      {open && <p className="mt-1 rounded-xl bg-sky-50 p-2 text-sm font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">💡 {text}</p>}
    </div>
  );
}

function SpeakerButton({ text, locale, big = false }: { text: string; locale: string; big?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const play = () => {
    setPlaying(true);
    speak(text, locale);
    setTimeout(() => setPlaying(false), 1200);
  };
  useEffect(() => { play(); /* autoplay listening prompts */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  return (
    <motion.button whileTap={{ scale: 0.9 }} onClick={play} aria-label="Play audio"
      className={cn("grid place-items-center rounded-2xl bg-sky-500 text-white shadow-chunky-sm hover:bg-sky-400", big ? "h-20 w-20" : "h-12 w-12")}>
      <Volume2 className={big ? "h-9 w-9" : "h-6 w-6"} />
      {playing && <span className="sr-only">Playing…</span>}
    </motion.button>
  );
}

// ── Multiple choice (text / image / listening) ────────────
function ChoiceExercise({ ex, onState }: { ex: ExerciseDTO; onState: (s: ExState) => void }) {
  const [sel, setSel] = useState<string | null>(null);
  useEffect(() => { onState({ value: sel ?? "", complete: sel !== null }); }, [sel]); // eslint-disable-line
  const isListening = ex.type === "listening_choice";
  return (
    <div className="flex flex-col gap-4">
      {isListening ? (
        <div className="flex items-center gap-4">
          <SpeakerButton text={ex.audioText} locale={ex.ttsLocale} big />
          <p className="text-lg font-bold text-slate-500 dark:text-slate-400">{ex.question}</p>
        </div>
      ) : (
        <>
          <QuestionText ex={ex} showAid={false} />
          {ex.type === "mc_image" && (
            <div className="grid h-28 w-28 place-items-center rounded-3xl border-2 border-slate-200 bg-slate-50 text-6xl dark:border-slate-600 dark:bg-slate-800" role="img" aria-label={ex.question}>
              {ex.image || "💬"}
            </div>
          )}
        </>
      )}
      <div className="grid gap-3" role="radiogroup" aria-label="Answer choices">
        {ex.options.map((opt, i) => {
          const active = sel === opt;
          return (
            <button key={`${opt}-${i}`} role="radio" aria-checked={active}
              onClick={() => { setSel(opt); sfx.click(); }}
              className={cn("rounded-2xl border-2 p-4 text-left text-lg font-bold transition",
                ex.questionLang === "target" || isCjkLocale(ex.ttsLocale) ? "cjk" : "",
                active
                  ? "border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700")}>
              {opt}
            </button>
          );
        })}
      </div>
      <Hint text={ex.hint} />
    </div>
  );
}

// ── Word bank (tap to build) ──────────────────────────────
function WordBankExercise({ ex, showAid, onState }: { ex: ExerciseDTO; showAid: boolean; onState: (s: ExState) => void }) {
  const [picked, setPicked] = useState<number[]>([]);
  const words = ex.wordBank;
  useEffect(() => {
    onState({ value: picked.map((i) => words[i]), complete: picked.length > 0 });
  }, [picked]); // eslint-disable-line
  return (
    <div className="flex flex-col gap-4">
      <QuestionText ex={ex} showAid={showAid} />
      <div className="min-h-[4rem] rounded-2xl border-2 border-slate-200 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-800" aria-live="polite" aria-label="Your sentence">
        {picked.length === 0 ? (
          <span className="text-sm font-bold text-slate-400">Tap the words below…</span>
        ) : (
          <span className={cn("flex flex-wrap gap-2", isCjkLocale(ex.ttsLocale) && "cjk text-lg")}>
            {picked.map((i) => (
              <button key={i} onClick={() => setPicked(picked.filter((p) => p !== i))}
                className="rounded-xl border-2 border-brand-300 bg-white px-3 py-1.5 font-bold text-slate-700 shadow-sm hover:border-red-300 dark:bg-slate-900 dark:text-slate-200">
                {words[i]}
              </button>
            ))}
          </span>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {words.map((w, i) =>
          picked.includes(i) ? null : (
            <motion.button key={i} whileTap={{ scale: 0.92 }} onClick={() => { setPicked([...picked, i]); sfx.click(); }}
              className={cn("rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-lg font-bold text-slate-700 shadow-chunky-sm hover:border-brand-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100", isCjkLocale(ex.ttsLocale) && "cjk")}>
              {w}
            </motion.button>
          )
        )}
      </div>
      <Hint text={ex.hint} />
    </div>
  );
}

// ── Type the translation / listening-type ─────────────────
function TypeExercise({ ex, showAid, onState }: { ex: ExerciseDTO; showAid: boolean; onState: (s: ExState) => void }) {
  const [val, setVal] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  const isListening = ex.type === "listening_type";
  useEffect(() => { onState({ value: val, complete: val.trim().length > 0 }); }, [val]); // eslint-disable-line
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div className="flex flex-col gap-4">
      {isListening ? (
        <div className="flex items-center gap-4">
          <SpeakerButton text={ex.audioText} locale={ex.ttsLocale} big />
          <p className="text-lg font-bold text-slate-500 dark:text-slate-400">{ex.question}</p>
        </div>
      ) : (
        <QuestionText ex={ex} showAid={showAid} />
      )}
      <input
        ref={ref}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={isListening ? "Type what you hear…" : "Type your answer…"}
        aria-label="Your answer"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        lang={ex.ttsLocale}
        enterKeyHint="done"
        className="cjk w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-4 text-xl font-bold text-slate-800 outline-none focus:border-brand-400 focus:bg-white dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      />
      <Hint text={ex.hint} />
    </div>
  );
}

// ── Match pairs ───────────────────────────────────────────
function MatchExercise({ ex, onState }: { ex: ExerciseDTO; onState: (s: ExState) => void }) {
  const left = useMemo(() => [...ex.pairs].sort(() => Math.random() - 0.5), [ex]);
  const right = useMemo(() => [...ex.pairs].sort(() => Math.random() - 0.5), [ex]);
  const [selL, setSelL] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [errors, setErrors] = useState(0);
  const [shake, setShake] = useState<string | null>(null);

  useEffect(() => {
    onState({ value: { errors }, complete: matched.length === ex.pairs.length && ex.pairs.length > 0 });
  }, [matched, errors]); // eslint-disable-line

  function tapRight(eng: string) {
    if (!selL || matched.includes(selL)) return;
    const pair = ex.pairs.find((p) => p[0] === selL);
    if (pair && pair[1] === eng) {
      sfx.pop();
      setMatched([...matched, selL]);
      setSelL(null);
    } else {
      sfx.wrong();
      setErrors((e) => e + 1);
      setShake(eng);
      setTimeout(() => setShake(null), 450);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-bold text-slate-500 dark:text-slate-400">{ex.question}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2" role="group" aria-label="Words">
          {left.map(([t]) => {
            const done = matched.includes(t);
            return (
              <button key={t} disabled={done} onClick={() => { setSelL(t); sfx.click(); }}
                className={cn("cjk rounded-2xl border-2 p-3 text-base font-bold transition sm:text-lg",
                  done ? "border-transparent bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600"
                    : selL === t ? "border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200")}>
                {t}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2" role="group" aria-label="Meanings">
          {right.map(([, e]) => {
            const pairT = ex.pairs.find((p) => p[1] === e)?.[0] ?? "";
            const done = matched.includes(pairT);
            return (
              <button key={e} disabled={done} onClick={() => tapRight(e)}
                className={cn("rounded-2xl border-2 p-3 text-base font-bold transition sm:text-lg",
                  shake === e && "animate-shake border-red-400",
                  done ? "border-transparent bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200")}>
                {e}
              </button>
            );
          })}
        </div>
      </div>
      <p className="text-center text-sm font-bold text-slate-400">Tap a card on each side to match · {matched.length}/{ex.pairs.length} matched</p>
    </div>
  );
}

// ── Fill in the blank ─────────────────────────────────────
function FillBlankExercise({ ex, showAid, onState }: { ex: ExerciseDTO; showAid: boolean; onState: (s: ExState) => void }) {
  const [sel, setSel] = useState<string | null>(null);
  useEffect(() => { onState({ value: sel ?? "", complete: sel !== null }); }, [sel]); // eslint-disable-line
  return (
    <div className="flex flex-col gap-4">
      <QuestionText ex={ex} showAid={showAid} />
      <div className="flex flex-wrap justify-center gap-2" role="radiogroup" aria-label="Choose the missing word">
        {ex.wordBank.map((w, i) => (
          <motion.button key={`${w}-${i}`} whileTap={{ scale: 0.92 }} role="radio" aria-checked={sel === w}
            onClick={() => { setSel(w); sfx.click(); }}
            className={cn("cjk rounded-xl border-2 px-5 py-2.5 text-lg font-bold shadow-chunky-sm",
              sel === w ? "border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                : "border-slate-200 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100")}>
            {w}
          </motion.button>
        ))}
      </div>
      <Hint text={ex.hint} />
    </div>
  );
}

// ── Speaking ──────────────────────────────────────────────
function SpeakingExercise({ ex, showAid, onState }: { ex: ExerciseDTO; showAid: boolean; onState: (s: ExState) => void }) {
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [err, setErr] = useState("");
  const recogRef = useRef<{ start: () => void; stop: () => void } | null>(null);
  const supported = speechRecognitionSupported();

  useEffect(() => { onState({ value: transcript, complete: transcript.trim().length > 0 }); }, [transcript]); // eslint-disable-line
  useEffect(() => () => recogRef.current?.stop(), []);

  function toggle() {
    if (listening) {
      recogRef.current?.stop();
      setListening(false);
      return;
    }
    setErr("");
    const r = createRecognizer(ex.ttsLocale, (t) => { setTranscript(t); setListening(false); }, () => setListening(false), () => { setErr("Couldn't hear that — try again."); setListening(false); });
    if (!r) { setErr("Voice input isn't supported in this browser."); return; }
    recogRef.current = r;
    r.start();
    setListening(true);
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="cjk text-3xl font-black text-slate-800 dark:text-slate-100">{ex.question}</p>
      {showAid && ex.readingAid && <p className="text-lg font-bold text-brand-600">({ex.readingAid})</p>}
      <div className="flex items-center gap-3">
        <button onClick={() => speak(ex.audioText || ex.question, ex.ttsLocale)} className="grid h-14 w-14 place-items-center rounded-2xl bg-sky-500 text-white shadow-chunky-sm hover:bg-sky-400" aria-label="Hear it first">
          <Volume2 className="h-7 w-7" />
        </button>
        <motion.button whileTap={{ scale: 0.92 }} onClick={toggle} disabled={!supported}
          className={cn("grid h-20 w-20 place-items-center rounded-full text-white shadow-chunky disabled:opacity-40", listening ? "animate-pulse bg-coral-500" : "bg-brand-500 hover:bg-brand-400")}
          aria-label={listening ? "Stop listening" : "Start speaking"}>
          <Mic className="h-9 w-9" />
        </motion.button>
      </div>
      <p className="text-sm font-bold text-slate-400">{listening ? "Listening… speak now!" : supported ? "Tap the mic and say it out loud" : "Mic not supported here"}</p>
      {transcript && (
        <div className="w-full rounded-2xl border-2 border-brand-200 bg-brand-50 p-3 text-lg font-bold text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300" aria-live="polite">
          “{transcript}”
        </div>
      )}
      {err && <p className="text-sm font-bold text-coral-500" role="alert">{err}</p>}
      <Hint text={ex.hint} />
    </div>
  );
}

// ── Dispatcher ────────────────────────────────────────────
export function ExerciseView({ ex, showAid, onState }: { ex: ExerciseDTO; showAid: boolean; onState: (s: ExState) => void }) {
  return (
    <div>
      <h2 className="mb-4 text-sm font-extrabold uppercase tracking-widest text-slate-400">{ex.prompt}</h2>
      {(ex.type === "mc_text" || ex.type === "mc_image" || ex.type === "listening_choice") && (
        <ChoiceExercise ex={ex} onState={onState} />
      )}
      {ex.type === "word_bank" && <WordBankExercise ex={ex} showAid={showAid} onState={onState} />}
      {(ex.type === "type_answer" || ex.type === "listening_type") && (
        <TypeExercise ex={ex} showAid={showAid} onState={onState} />
      )}
      {ex.type === "match" && <MatchExercise ex={ex} onState={onState} />}
      {ex.type === "fill_blank" && <FillBlankExercise ex={ex} showAid={showAid} onState={onState} />}
      {ex.type === "speaking" && <SpeakingExercise ex={ex} showAid={showAid} onState={onState} />}
    </div>
  );
}

export function ClearButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1 text-sm font-extrabold text-slate-400 hover:text-slate-600" aria-label="Clear answer">
      <Delete className="h-4 w-4" /> Clear
    </button>
  );
}
