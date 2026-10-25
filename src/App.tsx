import { useCallback, useEffect, useMemo, useState } from "react";
import { CORE_QUESTIONS, QUESTIONS } from "./data/questions";
import { COMMANDERS } from "./data/commanders";
import type { Option, Question } from "./types";
import { ARCHES, buildProfile, scoreCommanders } from "./lib/scoring";
import { Backdrop, ManaPip } from "./components/ui";
import Result from "./components/Result";

type Stage = "intro" | "quiz" | "reading" | "result";
type Mode = "quick" | "full";

const LOADING_LINES = [
  "Shuffling 100 legendary creatures…",
  "Weighing your terrible movie opinions…",
  "Consulting the color pie…",
  "Cross-referencing EDHREC…",
  "Asking four strangers at a game store…",
  "Sleeving it up…",
];

export default function App() {
  const [stage, setStage] = useState<Stage>("intro");
  const [mode, setMode] = useState<Mode>("full");
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<Record<string, Option>>({});
  const [loadLine, setLoadLine] = useState(0);

  const deck: Question[] = useMemo(
    () => (mode === "quick" ? CORE_QUESTIONS : QUESTIONS),
    [mode],
  );
  const question = deck[Math.min(index, deck.length - 1)];
  const answered = deck.filter((q) => picks[q.id]).length;
  const progress = (answered / deck.length) * 100;

  const start = (m: Mode) => {
    setMode(m);
    setIndex(0);
    setPicks({});
    setStage("quiz");
  };

  const finish = useCallback(() => {
    setLoadLine(0);
    setStage("reading");
  }, []);

  const choose = useCallback(
    (opt: Option) => {
      setPicks((p) => ({ ...p, [question.id]: opt }));
      if (index + 1 < deck.length) {
        setTimeout(() => setIndex((i) => i + 1), 140);
      } else {
        finish();
      }
    },
    [question, index, deck.length, finish],
  );

  useEffect(() => {
    if (stage !== "reading") return;
    const t1 = setInterval(
      () => setLoadLine((l) => Math.min(l + 1, LOADING_LINES.length - 1)),
      380,
    );
    const t2 = setTimeout(() => setStage("result"), 2200);
    return () => {
      clearInterval(t1);
      clearTimeout(t2);
    };
  }, [stage]);

  useEffect(() => {
    if (stage !== "quiz") return;
    const onKey = (e: KeyboardEvent) => {
      const n = parseInt(e.key, 10);
      if (!Number.isNaN(n) && n >= 1 && n <= question.options.length) {
        choose(question.options[n - 1]);
      } else if (e.key === "Backspace" && index > 0) {
        setIndex(index - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage, question, choose, index]);

  const chosen = useMemo(
    () => deck.map((q) => picks[q.id]).filter(Boolean) as Option[],
    [deck, picks],
  );
  const profile = useMemo(() => buildProfile(chosen), [chosen]);
  const ranked = useMemo(() => scoreCommanders(profile), [profile]);

  const restart = () => {
    setPicks({});
    setIndex(0);
    setStage("intro");
  };

  return (
    <div className="min-h-screen font-sans text-amber-50 antialiased">
      <Backdrop />

      {stage === "intro" && (
        <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-5 py-16 text-center">
          <div className="mb-6 flex gap-2">
            {(["W", "U", "B", "R", "G"] as const).map((c, i) => (
              <span
                key={c}
                className="animate-[float_3s_ease-in-out_infinite]"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <ManaPip color={c} size={38} />
              </span>
            ))}
          </div>
          <p className="text-xs uppercase tracking-[0.4em] text-amber-200/50">
            The Commander Oracle
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight text-amber-50 sm:text-6xl">
            Which Magic commander
            <br />
            <span className="bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 bg-clip-text text-transparent">
              should you play?
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-amber-100/70">
            Questions about movies, games, villains and how you behave at board
            game night. Zero questions about Magic: The Gathering. Your answers
            get matched against the <strong className="text-amber-100">100
            most-built commanders on EDHREC</strong>.
          </p>

          <div className="mt-8 flex w-full max-w-lg flex-col gap-3 sm:flex-row">
            <button
              onClick={() => start("full")}
              className="group flex-1 rounded-2xl border border-amber-200/40 bg-gradient-to-b from-amber-200/25 to-amber-200/5 px-6 py-4 text-left shadow-lg shadow-black/40 transition hover:from-amber-200/40"
            >
              <div className="text-base font-semibold text-amber-50">
                Full reading
                <span className="ml-2 inline-block transition group-hover:translate-x-1">
                  →
                </span>
              </div>
              <div className="text-xs text-amber-100/60">
                {QUESTIONS.length} questions · most accurate
              </div>
            </button>
            <button
              onClick={() => start("quick")}
              className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-left transition hover:bg-white/10"
            >
              <div className="text-base font-semibold text-amber-50">
                Quick reading
              </div>
              <div className="text-xs text-amber-100/60">
                {CORE_QUESTIONS.length} questions · about 2 minutes
              </div>
            </button>
          </div>

          <div className="mt-10 grid w-full gap-3 text-left sm:grid-cols-3">
            {[
              [
                "🎬",
                "Built on taste",
                "Your media diet, villains and board-game manners map onto the color pie.",
              ],
              [
                "🧭",
                `${ARCHES.length} playstyle axes`,
                "Tokens, graveyard, politics, stax, landfall — scored separately, not guessed.",
              ],
              [
                "🃏",
                `${COMMANDERS.length} commanders`,
                "The EDHREC top 100, so there are real decklists waiting for your answer.",
              ],
            ].map(([emoji, title, body]) => (
              <div
                key={title}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur"
              >
                <div className="text-xl">{emoji}</div>
                <div className="mt-1 text-sm font-semibold text-amber-50">
                  {title}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-amber-100/55">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {stage === "quiz" && (
        <div className="mx-auto w-full max-w-2xl px-5 py-10">
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between text-xs text-amber-100/50">
              <span className="uppercase tracking-[0.25em]">
                Question {index + 1} / {deck.length}
              </span>
              <span>{Math.round(progress)}% read</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-black/50 ring-1 ring-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-100 transition-[width] duration-500"
                style={{ width: `${Math.max(3, progress)}%` }}
              />
            </div>
          </div>

          <div key={question.id} className="animate-[fadeUp_.35s_ease-out]">
            <h2 className="font-serif text-2xl leading-snug text-amber-50 sm:text-3xl">
              {question.prompt}
            </h2>
            {question.hint && (
              <p className="mt-2 text-sm text-amber-100/45">{question.hint}</p>
            )}

            <div className="mt-6 space-y-3">
              {question.options.map((opt, i) => {
                const selected = picks[question.id]?.id === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => choose(opt)}
                    className={`group flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                      selected
                        ? "border-amber-200/60 bg-amber-200/15"
                        : "border-white/10 bg-white/[0.04] hover:border-amber-200/35 hover:bg-white/[0.08]"
                    }`}
                  >
                    <span className="text-xl leading-none">{opt.emoji}</span>
                    <span className="flex-1 text-[15px] leading-snug text-amber-50/90">
                      {opt.label}
                    </span>
                    <span className="mt-0.5 hidden rounded border border-white/15 px-1.5 text-[10px] text-amber-100/40 sm:block">
                      {i + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-7 flex items-center justify-between gap-3">
            <button
              onClick={() =>
                index > 0 ? setIndex(index - 1) : setStage("intro")
              }
              className="text-sm text-amber-100/50 transition hover:text-amber-100"
            >
              ← Back
            </button>
            <span className="hidden text-[11px] text-amber-100/30 sm:block">
              press 1–{question.options.length}
            </span>
            <div className="flex items-center gap-3">
              {answered >= 8 && index + 1 < deck.length && (
                <button
                  onClick={finish}
                  className="text-sm text-amber-100/50 transition hover:text-amber-100"
                >
                  Read me now
                </button>
              )}
              {picks[question.id] && index + 1 < deck.length && (
                <button
                  onClick={() => setIndex(index + 1)}
                  className="text-sm text-amber-100/70 transition hover:text-amber-100"
                >
                  Next →
                </button>
              )}
              {picks[question.id] && index + 1 === deck.length && (
                <button
                  onClick={finish}
                  className="rounded-full border border-amber-200/40 bg-amber-200/15 px-4 py-2 text-sm font-semibold text-amber-50"
                >
                  Reveal my commander
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {stage === "reading" && (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="flex gap-3">
            {(["W", "U", "B", "R", "G"] as const).map((c, i) => (
              <span
                key={c}
                className="animate-[float_1.1s_ease-in-out_infinite]"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <ManaPip color={c} size={32} />
              </span>
            ))}
          </div>
          <p className="font-serif text-xl text-amber-100/80">
            {LOADING_LINES[loadLine]}
          </p>
        </div>
      )}

      {stage === "result" && (
        <Result
          ranked={ranked}
          profile={profile}
          answeredCount={chosen.length}
          totalCount={deck.length}
          onRestart={restart}
        />
      )}
    </div>
  );
}
