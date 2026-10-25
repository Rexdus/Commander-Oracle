import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CatalogStatus,
  Commander,
  CommanderCatalog,
  Option,
  Preferences,
  Question,
} from "./types";
import { DEFAULT_PREFERENCES } from "./types";
import { CORE_QUESTIONS, QUESTIONS } from "./data/questions";
import {
  CURATED_COMMANDERS,
  INITIAL_CATALOG,
} from "./data/commanders";
import { ARCHES, buildProfile, scoreCommanders } from "./lib/scoring";
import { buildLiveCatalog } from "./lib/catalog";
import {
  buildShareUrl,
  clearResultHash,
  parseResultHash,
} from "./lib/share";
import { loadJson, saveJson } from "./lib/storage";
import { Backdrop, ManaPip } from "./components/ui";
import CatalogStatusBadge from "./components/CatalogStatus";
import Compare, { CompareTray } from "./components/Compare";
import Explorer from "./components/Explorer";
import Result from "./components/Result";

type Stage = "intro" | "quiz" | "reading" | "result" | "explore";
type Mode = "quick" | "full";
type ExploreOrigin = "intro" | "result";

const LOADING_LINES = [
  "Shuffling the commander catalog…",
  "Weighing your terrible movie opinions…",
  "Consulting the color pie…",
  "Cross-referencing EDHREC and Scryfall…",
  "Asking four strangers at a game store…",
  "Sleeving it up…",
];

const CATALOG_CACHE_KEY = "commander-oracle-catalog-v1";
const FAVORITES_KEY = "commander-oracle-favorites-v1";
const DISMISSED_KEY = "commander-oracle-dismissed-v1";
const PREFERENCES_KEY = "commander-oracle-preferences-v1";

const SHARED_RESULT =
  typeof window !== "undefined" ? parseResultHash(window.location.hash) : null;
const INITIAL_MODE: Mode = SHARED_RESULT?.mode ?? "full";
const INITIAL_DECK: Question[] =
  INITIAL_MODE === "quick" ? CORE_QUESTIONS : QUESTIONS;

function loadInitialCatalog(): {
  catalog: CommanderCatalog;
  status: CatalogStatus;
} {
  const cached = loadJson<CommanderCatalog | null>(CATALOG_CACHE_KEY, null);
  if (
    cached &&
    Array.isArray(cached.commanders) &&
    cached.commanders.length > 0 &&
    cached.meta
  ) {
    return {
      catalog: {
        ...cached,
        meta: { ...cached.meta, status: "cached" },
      },
      status: "cached",
    };
  }
  return { catalog: INITIAL_CATALOG, status: "seed" };
}

function errorMessage(error: unknown): string {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "Live refresh timed out.";
  }
  if (error instanceof Error) return error.message;
  return "Unknown network error";
}

export default function App() {
  const [stage, setStage] = useState<Stage>(SHARED_RESULT ? "result" : "intro");
  const [mode, setMode] = useState<Mode>(INITIAL_MODE);
  const [index, setIndex] = useState(
    SHARED_RESULT ? Math.max(0, INITIAL_DECK.length - 1) : 0,
  );
  const [picks, setPicks] = useState<Record<string, Option>>(
    SHARED_RESULT?.picks ?? {},
  );
  const [loadLine, setLoadLine] = useState(0);
  const [exploreOrigin, setExploreOrigin] =
    useState<ExploreOrigin>("intro");
  const [preferences, setPreferences] = useState<Preferences>(
    SHARED_RESULT?.preferences ??
      loadJson<Preferences>(PREFERENCES_KEY, DEFAULT_PREFERENCES),
  );
  const [favorites, setFavorites] = useState<string[]>(() =>
    loadJson<string[]>(FAVORITES_KEY, []),
  );
  const [dismissed, setDismissed] = useState<string[]>(() =>
    loadJson<string[]>(DISMISSED_KEY, []),
  );
  const [compareNames, setCompareNames] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [catalog, setCatalog] = useState<CommanderCatalog>(
    () => loadInitialCatalog().catalog,
  );
  const [catalogStatus, setCatalogStatus] = useState<CatalogStatus>(
    () => loadInitialCatalog().status,
  );
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const catalogRef = useRef(catalog);
  const statusRef = useRef<CatalogStatus>(catalogStatus);
  const didInitialRefresh = useRef(false);

  const commanders = catalog.commanders;
  const deck: Question[] = useMemo(
    () => (mode === "quick" ? CORE_QUESTIONS : QUESTIONS),
    [mode],
  );
  const question = deck[Math.min(index, deck.length - 1)];
  const answered = deck.filter((q) => picks[q.id]).length;
  const progress = (answered / deck.length) * 100;

  const chosen = useMemo(
    () => deck.map((q) => picks[q.id]).filter(Boolean) as Option[],
    [deck, picks],
  );
  const profile = useMemo(() => buildProfile(chosen), [chosen]);
  const ranked = useMemo(
    () =>
      scoreCommanders(profile, {
        commanders,
        preferences,
        dismissed,
        favorites,
        answerCount: chosen.length,
        questionCount: deck.length,
      }),
    [profile, commanders, preferences, dismissed, favorites, chosen.length, deck.length],
  );
  const commanderByName = useMemo(
    () => new Map(commanders.map((cmd) => [cmd.name, cmd])),
    [commanders],
  );
  const compareCommanders = useMemo(
    () =>
      compareNames
        .map((name) => commanderByName.get(name))
        .filter((cmd): cmd is Commander => Boolean(cmd)),
    [compareNames, commanderByName],
  );

  const shareUrl = useMemo(() => {
    if (stage !== "result" || typeof window === "undefined") return "";
    return buildShareUrl({ mode, picks, preferences });
  }, [stage, mode, picks, preferences]);

  useEffect(() => {
    saveJson(PREFERENCES_KEY, preferences);
  }, [preferences]);

  useEffect(() => {
    saveJson(FAVORITES_KEY, favorites);
  }, [favorites]);

  useEffect(() => {
    saveJson(DISMISSED_KEY, dismissed);
  }, [dismissed]);

  useEffect(() => {
    catalogRef.current = catalog;
  }, [catalog]);

  useEffect(() => {
    statusRef.current = catalogStatus;
  }, [catalogStatus]);

  useEffect(() => {
    if (stage !== "result" || !shareUrl) {
      if (typeof window !== "undefined" && window.location.hash) {
        clearResultHash();
      }
      return;
    }
    const url = new URL(shareUrl);
    if (window.location.hash !== url.hash) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}${url.hash}`,
      );
    }
  }, [stage, shareUrl]);

  const refreshCatalog = useCallback(async () => {
    if (statusRef.current === "loading") return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      const fallback = catalogRef.current.meta.status === "seed" ? "error" : "cached";
      setCatalogError("You appear to be offline.");
      statusRef.current = fallback;
      setCatalogStatus(fallback);
      return;
    }

    statusRef.current = "loading";
    setCatalogStatus("loading");
    setCatalogError(null);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);

    try {
      const result = await buildLiveCatalog({
        seed: CURATED_COMMANDERS,
        pages: 3,
        signal: controller.signal,
      });
      setCatalog(result);
      saveJson(CATALOG_CACHE_KEY, result);
      statusRef.current = "live";
      setCatalogStatus("live");
    } catch (error) {
      const fallback =
        catalogRef.current.meta.status === "seed" ? "error" : "cached";
      setCatalogError(errorMessage(error));
      statusRef.current = fallback;
      setCatalogStatus(fallback);
    } finally {
      window.clearTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    if (didInitialRefresh.current) return;
    didInitialRefresh.current = true;
    void refreshCatalog();
  }, [refreshCatalog]);

  const handleRefreshCatalog = useCallback(() => {
    void refreshCatalog();
  }, [refreshCatalog]);

  const cancelAdvance = useCallback(() => {
    if (advanceTimer.current !== null) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  }, []);

  const start = (nextMode: Mode) => {
    cancelAdvance();
    clearResultHash();
    setMode(nextMode);
    setIndex(0);
    setPicks({});
    setShowCompare(false);
    setCompareNames([]);
    setStage("quiz");
  };

  const openExplore = (origin: ExploreOrigin) => {
    cancelAdvance();
    setExploreOrigin(origin);
    setStage("explore");
  };

  const finish = useCallback(() => {
    cancelAdvance();
    setLoadLine(0);
    setStage("reading");
  }, [cancelAdvance]);

  const choose = useCallback(
    (opt: Option) => {
      cancelAdvance();
      setPicks((current) => ({ ...current, [question.id]: opt }));
      // Keep the final answer on screen so it can be reviewed before reveal.
      if (index + 1 < deck.length) {
        advanceTimer.current = setTimeout(() => {
          setIndex((current) => current + 1);
          advanceTimer.current = null;
        }, 140);
      }
    },
    [cancelAdvance, question, index, deck.length],
  );

  useEffect(() => () => cancelAdvance(), [cancelAdvance]);

  useEffect(() => {
    if (stage !== "reading") return;
    const interval = setInterval(
      () => setLoadLine((line) => Math.min(line + 1, LOADING_LINES.length - 1)),
      380,
    );
    const timeout = setTimeout(() => setStage("result"), 2200);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [stage]);

  useEffect(() => {
    if (stage !== "quiz") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) {
        return;
      }
      const number = Number.parseInt(event.key, 10);
      if (!Number.isNaN(number) && number >= 1 && number <= question.options.length) {
        choose(question.options[number - 1]);
      } else if (event.key === "Backspace" && index > 0) {
        event.preventDefault();
        cancelAdvance();
        setIndex(index - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage, question, choose, index, cancelAdvance]);

  const toggleFavorite = useCallback((name: string) => {
    setFavorites((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );
  }, []);

  const dismiss = useCallback((name: string) => {
    setDismissed((current) =>
      current.includes(name) ? current : [...current, name].slice(-40),
    );
  }, []);

  const undoDismiss = useCallback(() => {
    setDismissed((current) => current.slice(0, -1));
  }, []);

  const clearDismissed = useCallback(() => setDismissed([]), []);

  const toggleCompare = useCallback((name: string) => {
    setCompareNames((current) => {
      if (current.includes(name)) {
        return current.filter((item) => item !== name);
      }
      if (current.length >= 3) return current;
      return [...current, name];
    });
  }, []);

  const openCompare = useCallback(() => {
    if (compareNames.length >= 2) setShowCompare(true);
  }, [compareNames.length]);

  const goBack = () => {
    cancelAdvance();
    if (index > 0) setIndex(index - 1);
    else setStage("intro");
  };

  const restart = () => {
    cancelAdvance();
    clearResultHash();
    setPicks({});
    setIndex(0);
    setStage("intro");
    setShowCompare(false);
    setCompareNames([]);
  };

  return (
    <div className="min-h-screen font-sans text-amber-50 antialiased">
      <Backdrop />

      {stage === "intro" && (
        <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-5 py-16 text-center">
          <div className="mb-6 flex gap-2">
            {(["W", "U", "B", "R", "G"] as const).map((color, i) => (
              <span
                key={color}
                className="animate-[float_3s_ease-in-out_infinite]"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <ManaPip color={color} size={38} />
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
            get matched against a live EDHREC/Scryfall commander catalog.
          </p>

          <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
            <button
              type="button"
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
              type="button"
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
            <button
              type="button"
              onClick={() => openExplore("intro")}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-white/15 bg-white/[0.03] px-6 py-4 text-left transition hover:border-amber-200/35 hover:bg-white/[0.07] sm:col-span-2"
            >
              <span>
                <span className="block text-base font-semibold text-amber-50">
                  Already have an idea? Browse all {commanders.length} commanders
                </span>
                <span className="mt-0.5 block text-xs text-amber-100/60">
                  Filter by color, strategy, budget, complexity and universe —
                  no quiz required.
                </span>
              </span>
              <span className="text-xl text-amber-200/70 transition group-hover:translate-x-1">
                →
              </span>
            </button>
          </div>

          <div className="mt-8 grid w-full gap-3 text-left sm:grid-cols-2 lg:grid-cols-4">
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
                `${commanders.length} commanders`,
                "Curated annotations plus a live EDHREC/Scryfall catalog with inferred entries.",
              ],
              [
                "🔗",
                "Share & compare",
                "Save favorites, skip bad matches, compare finalists and share a result link.",
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

          <div className="mt-6 w-full max-w-2xl text-left">
            <CatalogStatusBadge
              meta={catalog.meta}
              status={catalogStatus}
              error={catalogError}
              onRefresh={handleRefreshCatalog}
              compact
            />
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
                    type="button"
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
              type="button"
              onClick={goBack}
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
                  type="button"
                  onClick={finish}
                  className="text-sm text-amber-100/50 transition hover:text-amber-100"
                >
                  Read me now
                </button>
              )}
              {picks[question.id] && index + 1 < deck.length && (
                <button
                  type="button"
                  onClick={() => {
                    cancelAdvance();
                    setIndex(index + 1);
                  }}
                  className="text-sm text-amber-100/70 transition hover:text-amber-100"
                >
                  Next →
                </button>
              )}
              {picks[question.id] && index + 1 === deck.length && (
                <button
                  type="button"
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
            {(["W", "U", "B", "R", "G"] as const).map((color, i) => (
              <span
                key={color}
                className="animate-[float_1.1s_ease-in-out_infinite]"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <ManaPip color={color} size={32} />
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
          onExplore={() => openExplore("result")}
          preferences={preferences}
          onPreferencesChange={setPreferences}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          dismissed={dismissed}
          onDismiss={dismiss}
          onUndoDismiss={undoDismiss}
          onClearDismissed={clearDismissed}
          compareNames={compareNames}
          onToggleCompare={toggleCompare}
          shareUrl={shareUrl}
          catalogMeta={catalog.meta}
          catalogStatus={catalogStatus}
          catalogError={catalogError}
          onRefreshCatalog={handleRefreshCatalog}
        />
      )}

      {stage === "explore" && (
        <Explorer
          commanders={commanders}
          ranked={exploreOrigin === "result" ? ranked : undefined}
          profile={exploreOrigin === "result" ? profile : undefined}
          catalogMeta={catalog.meta}
          catalogStatus={catalogStatus}
          catalogError={catalogError}
          onRefreshCatalog={handleRefreshCatalog}
          preferences={preferences}
          onPreferencesChange={setPreferences}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          compareNames={compareNames}
          onToggleCompare={toggleCompare}
          onBack={() => setStage(exploreOrigin)}
          onTakeQuiz={
            exploreOrigin === "intro" ? () => start("quick") : undefined
          }
        />
      )}

      <CompareTray
        names={compareNames}
        onRemove={toggleCompare}
        onClear={() => setCompareNames([])}
        onOpen={openCompare}
      />

      {showCompare && compareCommanders.length >= 2 && (
        <Compare
          commanders={compareCommanders}
          ranked={ranked}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  );
}
