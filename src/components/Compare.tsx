import { useEffect, useRef } from "react";
import type { Commander, ScoredCommander } from "../types";
import { scryfallPage } from "../lib/scoring";
import {
  archidektDecklistUrl,
  bracketLabel,
  budgetDecklistUrl,
  edhrecCommanderUrl,
  formatPrice,
} from "../lib/catalog";
import { Bar, CardArt, PipRow } from "./ui";

function DataRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-white/10 py-2.5">
      <div className="text-[10px] uppercase tracking-[0.16em] text-amber-100/35">
        {label}
      </div>
      <div className="mt-1 text-xs leading-relaxed text-amber-50/85">
        {children}
      </div>
    </div>
  );
}

function CommanderColumn({
  commander,
  scored,
  isFavorite,
  onToggleFavorite,
}: {
  commander: Commander;
  scored?: ScoredCommander;
  isFavorite: boolean;
  onToggleFavorite: (name: string) => void;
}) {
  const breakdown = scored?.breakdown;
  return (
    <article className="flex min-w-[220px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#100d16]/90">
      <div className="relative h-28 shrink-0">
        <CardArt name={commander.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#100d16] via-transparent to-black/20" />
        <div className="absolute left-3 top-3">
          <PipRow colors={commander.colors} size={18} />
        </div>
        {scored && (
          <span className="absolute right-3 top-3 rounded-full border border-amber-200/30 bg-black/70 px-2 py-1 text-[10px] font-semibold text-amber-100">
            {scored.match}% fit
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="font-serif text-base leading-tight text-amber-50">
          {commander.name}
        </h3>
        <p className="mt-1 text-xs italic text-amber-100/65">
          {commander.tagline}
        </p>

        {breakdown && (
          <div className="mt-3 space-y-2 rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="text-[10px] uppercase tracking-[0.16em] text-amber-200/60">
              Fit components
            </div>
            <Bar label="Colors · 40%" pct={breakdown.colors} color="#e8c07d" />
            <Bar label="Strategy · 40%" pct={breakdown.strategy} color="#aedbf5" />
            <Bar label="Complexity · 7%" pct={breakdown.complexity} color="#a7cfa0" />
            <Bar label="Budget · 5%" pct={breakdown.budget} color="#f2a08a" />
            {breakdown.penalties.length > 0 && (
              <div className="space-y-1 pt-1 text-[10px] leading-relaxed text-rose-200/75">
                {breakdown.penalties.map((penalty) => (
                  <div key={penalty.label}>
                    −{Math.round(penalty.amount * 100)} pts · {penalty.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <DataRow label="Game plan">{commander.plan}</DataRow>
        <DataRow label="Themes">{commander.tags.join(" · ")}</DataRow>
        <DataRow label="Complexity">
          {"●".repeat(commander.difficulty)}
          <span className="text-amber-100/25">
            {"○".repeat(5 - commander.difficulty)}
          </span>{" "}
          · {commander.difficulty}/5
        </DataRow>
        <DataRow label="Budget">
          {commander.budget} · commander card ≈ {formatPrice(commander.priceUsd)}
        </DataRow>
        <DataRow label="Estimated table power">
          {bracketLabel(commander.bracketEstimate)}
          <span className="block pt-0.5 text-[10px] text-amber-100/40">
            Heuristic estimate, not an official bracket rating.
          </span>
        </DataRow>
        <DataRow label="EDHREC">
          #{commander.rank}
          {commander.deckCount
            ? ` · ${commander.deckCount.toLocaleString("en-US")} decks`
            : ""}
          {commander.dataQuality === "generated" && (
            <span className="block pt-0.5 text-[10px] text-amber-100/40">
              Inferred catalog entry
            </span>
          )}
        </DataRow>
        {scored && scored.reasons.length > 0 && (
          <DataRow label="Why it matched">
            {scored.reasons.join(" · ")}
          </DataRow>
        )}
        {scored && !scored.eligible && (
          <DataRow label="Preference conflicts">
            <span className="text-rose-200/80">
              {scored.breakdown.violations.join(" · ")}
            </span>
          </DataRow>
        )}

        <div className="mt-auto space-y-2 pt-4">
          <div className="grid grid-cols-2 gap-2">
            <a
              href={budgetDecklistUrl(commander.name)}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-amber-200/25 bg-amber-200/10 px-2 py-2 text-center text-[11px] font-medium text-amber-100 transition hover:bg-amber-200/20"
            >
              Budget decks ↗
            </a>
            <a
              href={edhrecCommanderUrl(commander)}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-center text-[11px] font-medium text-amber-100/80 transition hover:bg-white/10"
            >
              EDHREC ↗
            </a>
            <a
              href={scryfallPage(commander.name)}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-center text-[11px] font-medium text-amber-100/80 transition hover:bg-white/10"
            >
              Card ↗
            </a>
            <a
              href={archidektDecklistUrl(commander.name)}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-center text-[11px] font-medium text-amber-100/80 transition hover:bg-white/10"
            >
              Archidekt ↗
            </a>
          </div>
          <button
            type="button"
            onClick={() => onToggleFavorite(commander.name)}
            aria-pressed={isFavorite}
            className={`w-full rounded-lg border px-3 py-2 text-[11px] font-medium transition ${
              isFavorite
                ? "border-rose-300/40 bg-rose-300/15 text-rose-100"
                : "border-white/10 bg-white/5 text-amber-100/70 hover:bg-white/10"
            }`}
          >
            {isFavorite ? "♥ Saved" : "♡ Save commander"}
          </button>
        </div>
      </div>
    </article>
  );
}

export function CompareTray({
  names,
  onRemove,
  onClear,
  onOpen,
}: {
  names: string[];
  onRemove: (name: string) => void;
  onClear: () => void;
  onOpen: () => void;
}) {
  if (names.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-3 sm:px-6 sm:pb-6">
      <div className="pointer-events-auto flex w-full max-w-3xl flex-wrap items-center gap-2 rounded-2xl border border-amber-200/20 bg-[#15111c]/95 p-3 shadow-2xl shadow-black/70 backdrop-blur">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-100/55">
          Compare
        </span>
        <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
          {names.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => onRemove(name)}
              className="max-w-[180px] truncate rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-amber-100/75 transition hover:bg-white/10"
              title={`Remove ${name}`}
            >
              {name} ✕
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-[11px] text-amber-100/45 underline underline-offset-4 transition hover:text-amber-100"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={onOpen}
          disabled={names.length < 2}
          className="rounded-full border border-amber-200/35 bg-amber-200/15 px-4 py-2 text-xs font-semibold text-amber-50 transition hover:bg-amber-200/25 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Compare {names.length}/3 →
        </button>
      </div>
    </div>
  );
}

export default function Compare({
  commanders,
  ranked,
  favorites,
  onToggleFavorite,
  onClose,
}: {
  commanders: Commander[];
  ranked: ScoredCommander[];
  favorites: string[];
  onToggleFavorite: (name: string) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const rankedMap = new Map(
    ranked.map((entry) => [entry.commander.name, entry]),
  );

  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm sm:p-8"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="compare-title"
        className="w-full max-w-6xl rounded-3xl border border-amber-200/20 bg-[#0d0b12] p-4 shadow-2xl shadow-black/80 sm:p-6"
      >
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-amber-200/50">
              Side by side
            </p>
            <h2 id="compare-title" className="mt-1 font-serif text-2xl text-amber-50">
              Compare your commanders
            </h2>
            <p className="mt-1 text-xs text-amber-100/50">
              Relative fit is a ranking against this catalog and your answers —
              not a prediction of win rate.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-amber-100/75 transition hover:bg-white/10"
          >
            Close ✕
          </button>
        </div>

        <div className="overflow-x-auto pb-2">
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${Math.max(commanders.length, 2)}, minmax(220px, 1fr))`,
            }}
          >
            {commanders.map((commander) => (
              <CommanderColumn
                key={commander.name}
                commander={commander}
                scored={rankedMap.get(commander.name)}
                isFavorite={favorites.includes(commander.name)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
