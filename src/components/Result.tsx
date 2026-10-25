import { useState, type ReactNode } from "react";
import type {
  CatalogMeta,
  CatalogStatus,
  Preferences,
  ScoredCommander,
} from "../types";
import type { Profile } from "../lib/scoring";
import {
  ARCHES,
  ARCH_META,
  COLORS,
  COLOR_META,
  FRANCHISE_META,
  guildName,
  hasActivePreferences,
  scryfallPage,
} from "../lib/scoring";
import {
  bracketLabel,
  budgetDecklistUrl,
  edhrecCommanderUrl,
  formatPrice,
} from "../lib/catalog";
import { copyText, resultSummary, shareOrCopy } from "../lib/share";
import { Bar, CardArt, ManaPip, PipRow } from "./ui";
import CatalogStatusBadge from "./CatalogStatus";
import PreferencesPanel from "./PreferencesPanel";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-amber-200/10 bg-black/30 px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.16em] text-amber-100/40">
        {label}
      </div>
      <div className="text-sm font-medium text-amber-50">{value}</div>
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-amber-200/25 bg-amber-200/10 px-2.5 py-0.5 text-[11px] text-amber-100/85">
      {children}
    </span>
  );
}

function confidenceLabel(confidence: number): string {
  if (confidence >= 0.9) return "High";
  if (confidence >= 0.6) return "Moderate";
  return "Low";
}

function ScoreBreakdown({ top }: { top: ScoredCommander }) {
  const { breakdown } = top;
  const confidence = confidenceLabel(breakdown.confidence);
  const affinity = breakdown.affinity;
  const penaltyTotal = breakdown.penalties.reduce(
    (sum, penalty) => sum + penalty.amount,
    0,
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl text-amber-50">
            How this fit was calculated
          </h3>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-amber-100/50">
            The percentage is a relative fit against this catalog and your
            answers, not a win-rate prediction or an official power rating.
            Component scores are 0–100 before weights and adjustments.
          </p>
        </div>
        <Chip>
          {confidence} confidence · {breakdown.answerCount}/
          {breakdown.questionCount} answers
        </Chip>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <Bar label="Color identity · 40% weight" pct={breakdown.colors} color="#e8c07d" />
          <Bar label="Strategy · 40% weight" pct={breakdown.strategy} color="#aedbf5" />
          <Bar label="Complexity · 7% weight" pct={breakdown.complexity} color="#a7cfa0" />
          <Bar label="Budget · 5% weight" pct={breakdown.budget} color="#f2a08a" />
        </div>
        <div className="rounded-xl border border-white/10 bg-black/25 p-4">
          <h4 className="text-sm font-semibold text-amber-50">
            Adjustments & penalties
          </h4>
          <p className="mt-2 text-xs text-amber-100/65">
            Color nudges, franchise affinity, saved-commanders feedback:{" "}
            <strong className={affinity >= 0 ? "text-emerald-200/80" : "text-rose-200/80"}>
              {affinity >= 0 ? "+" : ""}
              {affinity} pts
            </strong>
          </p>
          <p className="mt-1 text-xs text-amber-100/65">
            Total penalties:{" "}
            <strong className="text-rose-200/80">
              −{Math.round(penaltyTotal * 100)} pts
            </strong>
          </p>
          {breakdown.penalties.length > 0 ? (
            <ul className="mt-3 space-y-1 text-[11px] leading-relaxed text-amber-100/55">
              {breakdown.penalties.map((penalty) => (
                <li key={penalty.label}>
                  −{Math.round(penalty.amount * 100)} pts · {penalty.label}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[11px] text-amber-100/45">
              No budget, complexity or dealbreaker penalties applied.
            </p>
          )}
          {!top.eligible && (
            <p className="mt-3 rounded-lg border border-rose-300/20 bg-rose-300/[0.07] p-2 text-[11px] leading-relaxed text-rose-100/80">
              This result conflicts with: {breakdown.violations.join(" · ")}.
              Adjust your must-haves to see commanders that satisfy them.
            </p>
          )}
          <p className="mt-3 text-[11px] text-amber-100/40">
            Raw score {breakdown.rawScore.toFixed(2)} → displayed fit{" "}
            {top.match}%.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Result({
  ranked,
  profile,
  answeredCount,
  totalCount,
  onRestart,
  onExplore,
  preferences,
  onPreferencesChange,
  favorites,
  onToggleFavorite,
  dismissed,
  onDismiss,
  onUndoDismiss,
  onClearDismissed,
  compareNames,
  onToggleCompare,
  shareUrl,
  catalogMeta,
  catalogStatus,
  catalogError,
  onRefreshCatalog,
}: {
  ranked: ScoredCommander[];
  profile: Profile;
  answeredCount: number;
  totalCount: number;
  onRestart: () => void;
  onExplore: () => void;
  preferences: Preferences;
  onPreferencesChange: (preferences: Preferences) => void;
  favorites: string[];
  onToggleFavorite: (name: string) => void;
  dismissed: string[];
  onDismiss: (name: string) => void;
  onUndoDismiss: () => void;
  onClearDismissed: () => void;
  compareNames: string[];
  onToggleCompare: (name: string) => void;
  shareUrl: string;
  catalogMeta: CatalogMeta;
  catalogStatus: CatalogStatus;
  catalogError?: string | null;
  onRefreshCatalog: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [shareState, setShareState] = useState<string>("");
  const [showAll, setShowAll] = useState(false);

  const top = ranked[0];
  if (!top) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-20 text-center">
        <h1 className="font-serif text-3xl text-amber-50">No matches left</h1>
        <p className="mt-3 text-sm text-amber-100/60">
          You have skipped too many commanders. Restore some to continue.
        </p>
        <button
          type="button"
          onClick={onClearDismissed}
          className="mt-6 rounded-full border border-amber-200/30 bg-amber-200/10 px-5 py-2.5 text-sm text-amber-100"
        >
          Restore skipped commanders
        </button>
      </main>
    );
  }

  const alts = ranked.slice(1, 4);
  const more = ranked.slice(4, 10);
  const cmd = top.commander;
  const breakdown = top.breakdown;

  const identity = profile.topColors.filter((c) => profile.colors[c] > 0);
  const primary = profile.topColors[0];
  const archA = profile.topArch[0];
  const archB = profile.topArch[1];

  const shareText = resultSummary(
    cmd.name,
    guildName(cmd.colors),
    top.match,
    ARCH_META[archA].name.replace("The ", ""),
    ARCH_META[archB].name.replace("The ", ""),
  );

  const share = async () => {
    const result = await shareOrCopy(
      shareUrl,
      "The Commander Oracle",
      shareText,
    );
    if (result === "shared") setShareState("Shared!");
    else if (result === "copied") setShareState("Link copied!");
    else if (result === "failed") setShareState("Could not copy the link");
    else setShareState("Share cancelled");
    setTimeout(() => setShareState(""), 2400);
  };

  const copySummary = async () => {
    const success = await copyText(shareText);
    setCopied(success);
    setTimeout(() => setCopied(false), 2200);
  };

  const isFavorite = favorites.includes(cmd.name);
  const isCompared = compareNames.includes(cmd.name);
  const compareFull =
    compareNames.length >= 3 && !compareNames.includes(cmd.name);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 pb-28 pt-10">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-200/50">
          The oracle has spoken
        </p>
        <h1 className="mt-2 font-serif text-3xl text-amber-50 sm:text-4xl">
          You should play
        </h1>
        <p className="mt-2 text-xs text-amber-100/45">
          Read from {answeredCount} of {totalCount} answers, matched against{" "}
          {catalogMeta.total} commanders · {confidenceLabel(breakdown.confidence)}{" "}
          confidence.
        </p>
      </div>

      {dismissed.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl border border-amber-200/15 bg-amber-200/[0.06] px-4 py-3 text-center text-xs text-amber-100/70">
          <span>
            {dismissed.length} skipped commander
            {dismissed.length === 1 ? "" : "s"} are shaping your next matches.
          </span>
          <button
            type="button"
            onClick={onUndoDismiss}
            className="underline underline-offset-4 hover:text-amber-50"
          >
            Undo last
          </button>
          <button
            type="button"
            onClick={onClearDismissed}
            className="underline underline-offset-4 hover:text-amber-50"
          >
            Restore all
          </button>
        </div>
      )}

      {/* Hero card */}
      <div className="overflow-hidden rounded-2xl border border-amber-200/20 bg-gradient-to-b from-white/[0.08] to-white/[0.02] shadow-2xl shadow-black/60 backdrop-blur">
        <div className="relative h-56 w-full sm:h-72">
          <CardArt name={cmd.name} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b12] via-[#0d0b12]/30 to-transparent" />
          <div className="absolute right-4 top-4 flex flex-col items-end gap-1.5">
            <span className="rounded-full border border-amber-200/30 bg-black/60 px-3 py-1 text-xs font-semibold tracking-wide text-amber-100 backdrop-blur">
              {top.match}% relative fit
            </span>
            <span className="rounded-full border border-white/15 bg-black/50 px-2.5 py-0.5 text-[10px] text-amber-100/70 backdrop-blur">
              EDHREC #{cmd.rank}
              {cmd.deckCount
                ? ` · ${cmd.deckCount.toLocaleString("en-US")} decks`
                : ""}
            </span>
            {!top.eligible && (
              <span className="rounded-full border border-rose-300/40 bg-black/60 px-2.5 py-0.5 text-[10px] text-rose-100 backdrop-blur">
                conflicts with preferences
              </span>
            )}
          </div>
          <div className="absolute bottom-4 left-5 right-5">
            <div className="mb-2 flex items-center gap-2">
              <PipRow colors={cmd.colors} size={24} />
              <span className="text-xs uppercase tracking-[0.2em] text-amber-100/70">
                {guildName(cmd.colors)}
              </span>
            </div>
            <h2 className="font-serif text-3xl leading-tight text-white drop-shadow sm:text-4xl">
              {cmd.name}
            </h2>
            <p className="mt-1 text-sm italic text-amber-100/80">
              {cmd.tagline}
            </p>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-7">
          {top.reasons.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {top.reasons.map((reason) => (
                <Chip key={reason}>✓ {reason}</Chip>
              ))}
            </div>
          )}

          <p className="text-[15px] leading-relaxed text-amber-50/85">
            {cmd.blurb}
          </p>

          {cmd.dataQuality === "generated" && (
            <p className="rounded-lg border border-sky-200/15 bg-sky-200/[0.05] p-3 text-xs leading-relaxed text-sky-100/75">
              This commander was added by the live EDHREC/Scryfall catalog. Its
              strategy, budget and bracket labels are inferred estimates rather
              than curated annotations.
            </p>
          )}

          <div className="rounded-xl border border-amber-200/15 bg-amber-100/[0.04] p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-amber-200/60">
              Why you
            </div>
            <p className="mt-1 text-sm leading-relaxed text-amber-50/90">
              {cmd.youAre}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Game plan" value={cmd.plan} />
            <Stat
              label="Complexity"
              value={"●".repeat(cmd.difficulty) + "○".repeat(5 - cmd.difficulty)}
            />
            <Stat
              label="Budget"
              value={`${cmd.budget} · card ≈ ${formatPrice(cmd.priceUsd)}`}
            />
            <Stat
              label="Estimated table power"
              value={bracketLabel(cmd.bracketEstimate)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {cmd.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-amber-100/70"
              >
                {tag}
              </span>
            ))}
            {cmd.media.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-amber-100/70"
              >
                if you like {item}
              </span>
            ))}
            {cmd.franchise && cmd.franchise !== "mtg" && (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-amber-100/70">
                🎬 {FRANCHISE_META[cmd.franchise]} crossover
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <a
              href={scryfallPage(cmd.name)}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-amber-200/25 bg-amber-200/10 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-amber-200/20"
            >
              See the card ↗
            </a>
            <a
              href={budgetDecklistUrl(cmd.name)}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-amber-200/25 bg-amber-200/10 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-amber-200/20"
            >
              Budget decks ↗
            </a>
            <a
              href={edhrecCommanderUrl(cmd)}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-amber-100/80 transition hover:bg-white/10"
            >
              Browse decklists ↗
            </a>
            <button
              type="button"
              onClick={share}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-amber-100/80 transition hover:bg-white/10"
            >
              {shareState || "Share result"}
            </button>
            <button
              type="button"
              onClick={copySummary}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-amber-100/80 transition hover:bg-white/10"
            >
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button
              type="button"
              onClick={onExplore}
              className="rounded-lg border border-amber-200/30 bg-amber-200/10 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-amber-200/20"
            >
              Refine with filters →
            </button>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={() => onToggleFavorite(cmd.name)}
              aria-pressed={isFavorite}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                isFavorite
                  ? "border-rose-300/40 bg-rose-300/15 text-rose-100"
                  : "border-white/15 bg-white/5 text-amber-100/75 hover:bg-white/10"
              }`}
            >
              {isFavorite ? "♥ Saved" : "♡ Save this commander"}
            </button>
            <button
              type="button"
              onClick={() => onDismiss(cmd.name)}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-amber-100/75 transition hover:bg-white/10"
            >
              Not for me
            </button>
            <button
              type="button"
              onClick={() => onToggleCompare(cmd.name)}
              disabled={compareFull}
              aria-pressed={isCompared}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                isCompared
                  ? "border-amber-200/50 bg-amber-200/15 text-amber-50"
                  : "border-white/15 bg-white/5 text-amber-100/75 hover:bg-white/10"
              }`}
            >
              {isCompared ? "✓ In comparison" : "＋ Add to compare"}
            </button>
          </div>
        </div>
      </div>

      <PreferencesPanel
        preferences={preferences}
        onChange={onPreferencesChange}
        defaultOpen={hasActivePreferences(preferences)}
      />

      <ScoreBreakdown top={top} />

      {/* Profile breakdown */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
          <h3 className="font-serif text-xl text-amber-50">
            Your color identity
          </h3>
          <p className="mt-1 text-xs text-amber-100/50">
            Magic sorts personalities into five colors. Here's your mix.
          </p>
          <div className="mt-4 space-y-3">
            {COLORS.map((color) => (
              <div key={color} className="flex items-center gap-3">
                <ManaPip color={color} size={26} dim={profile.colorPct[color] < 8} />
                <div className="flex-1">
                  <Bar
                    label={COLOR_META[color].name}
                    pct={profile.colorPct[color]}
                    color={COLOR_META[color].hex}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-100">
              <PipRow
                colors={identity.slice(0, Math.max(1, cmd.colors.length))}
                size={18}
              />
              <span>Leaning {COLOR_META[primary].name}</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-amber-100/60">
              {COLOR_META[primary].vibe}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
          <h3 className="font-serif text-xl text-amber-50">Your playstyle</h3>
          <p className="mt-1 text-xs text-amber-100/50">
            Scored across {ARCHES.length} deck archetypes. Your strongest six:
          </p>
          <div className="mt-4 space-y-3">
            {ARCHES.slice()
              .sort((a, b) => profile.arch[b] - profile.arch[a])
              .slice(0, 6)
              .map((arch) => (
                <Bar
                  key={arch}
                  label={`${ARCH_META[arch].emoji} ${ARCH_META[arch].name}`}
                  pct={profile.archPct[arch]}
                  color="#e8c07d"
                />
              ))}
          </div>
          <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-3">
            <div className="text-sm font-semibold text-amber-100">
              {ARCH_META[archA].name} · {ARCH_META[archB].name}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-amber-100/60">
              {ARCH_META[archA].desc}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip>
              rules appetite {"●".repeat(Math.round(profile.complexity))}
            </Chip>
            <Chip>budget {"$".repeat(profile.budget)}</Chip>
            {profile.franchise && (
              <Chip>{FRANCHISE_META[profile.franchise]}</Chip>
            )}
          </div>
        </div>
      </div>

      {/* Runner ups */}
      <div>
        <h3 className="mb-3 font-serif text-xl text-amber-50">
          Also strong matches
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {alts.map(({ commander: alt, match, reasons, eligible }) => {
            const selected = compareNames.includes(alt.name);
            const favorite = favorites.includes(alt.name);
            return (
              <div
                key={alt.name}
                className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur transition hover:border-amber-200/30"
              >
                <div className="relative h-28">
                  <CardArt name={alt.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b12] to-transparent" />
                  <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-amber-100">
                    {match}% fit
                  </span>
                  {!eligible && (
                    <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-rose-100">
                      dealbreaker
                    </span>
                  )}
                </div>
                <div className="space-y-1.5 p-3">
                  <PipRow colors={alt.colors} size={16} />
                  <div className="font-serif text-base leading-tight text-amber-50">
                    {alt.name}
                  </div>
                  <p className="text-xs italic text-amber-100/60">{alt.tagline}</p>
                  <p className="pt-0.5 text-[11px] text-amber-200/50">
                    {reasons.slice(0, 2).join(" · ")}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(alt.name)}
                      aria-pressed={favorite}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-amber-100/70 hover:bg-white/10"
                    >
                      {favorite ? "♥ Saved" : "♡ Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleCompare(alt.name)}
                      disabled={compareNames.length >= 3 && !selected}
                      aria-pressed={selected}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-amber-100/70 hover:bg-white/10 disabled:opacity-40"
                    >
                      {selected ? "✓ Comparing" : "＋ Compare"}
                    </button>
                    <a
                      href={scryfallPage(alt.name)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-amber-100/70 hover:bg-white/10"
                    >
                      card ↗
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deeper list */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
        <button
          type="button"
          onClick={() => setShowAll((value) => !value)}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="font-serif text-lg text-amber-50">
            Your full top 10
          </span>
          <span className="text-sm text-amber-100/60">
            {showAll ? "hide ▲" : "show ▼"}
          </span>
        </button>
        {showAll && (
          <ul className="mt-4 divide-y divide-white/5">
            {[top, ...alts, ...more].map((scored, index) => (
              <li
                key={scored.commander.name}
                className="flex items-center gap-3 py-2.5"
              >
                <span className="w-5 shrink-0 text-right text-xs tabular-nums text-amber-100/35">
                  {index + 1}
                </span>
                <PipRow colors={scored.commander.colors} size={15} />
                <a
                  href={edhrecCommanderUrl(scored.commander)}
                  target="_blank"
                  rel="noreferrer"
                  className="min-w-0 flex-1 truncate text-sm text-amber-50/90 hover:text-amber-200"
                >
                  {scored.commander.name}
                  {favorites.includes(scored.commander.name) && (
                    <span className="ml-1 text-rose-200/80">♥</span>
                  )}
                </a>
                <span className="hidden shrink-0 text-[11px] text-amber-100/40 sm:block">
                  {scored.commander.tags[0]}
                </span>
                <span className="w-10 shrink-0 text-right text-xs tabular-nums text-amber-200/70">
                  {scored.match}%
                </span>
                <button
                  type="button"
                  onClick={() => onToggleCompare(scored.commander.name)}
                  disabled={
                    compareNames.length >= 3 &&
                    !compareNames.includes(scored.commander.name)
                  }
                  aria-label={`Add ${scored.commander.name} to comparison`}
                  className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-amber-100/55 hover:bg-white/10 disabled:opacity-40"
                >
                  {compareNames.includes(scored.commander.name) ? "✓" : "＋"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <CatalogStatusBadge
        meta={catalogMeta}
        status={catalogStatus}
        error={catalogError}
        onRefresh={onRefreshCatalog}
      />

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onExplore}
          className="rounded-full border border-amber-200/30 bg-amber-200/10 px-6 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-200/20"
        >
          Explore all {ranked.length} matches →
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-amber-100/80 transition hover:bg-white/10"
        >
          ↺ Take the quiz again
        </button>
      </div>

      <p className="pt-4 text-center text-[11px] leading-relaxed text-amber-100/30">
        Commander popularity data from EDHREC; card data and art via Scryfall.
        Bracket and budget labels for generated entries are estimates. Magic:
        The Gathering is a trademark of Wizards of the Coast. Unofficial fan
        tool.
      </p>
    </div>
  );
}
