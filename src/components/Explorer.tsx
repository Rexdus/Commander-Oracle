import { useEffect, useMemo, useState } from "react";
import type {
  ArchKey,
  CatalogMeta,
  CatalogStatus,
  ColorKey,
  Commander,
  Franchise,
  Preferences,
  ScoredCommander,
} from "../types";
import type { Profile } from "../lib/scoring";
import {
  ARCHES,
  ARCH_META,
  BUDGET_LEVEL,
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
import { CardArt, ManaPip, PipRow } from "./ui";
import CatalogStatusBadge from "./CatalogStatus";
import PreferencesPanel from "./PreferencesPanel";

type Budget = Commander["budget"];
type BudgetFilter = Budget | "any";
type FranchiseFilter = Franchise | "crossover" | "any";
type SortKey = "match" | "rank" | "simple" | "budget" | "name";
type ColorMode = "contains" | "exact";

const BUDGETS: Budget[] = ["$", "$$", "$$$"];
const BUDGET_BY_LEVEL: Record<number, Budget> = {
  1: "$",
  2: "$$",
  3: "$$$",
};
const FRANCHISES: Franchise[] = [
  "mtg",
  "ff",
  "lotr",
  "avatar",
  "fallout",
  "marvel",
  "40k",
];
const PAGE_SIZE = 12;

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-white/10 bg-[#16131c] px-3 py-2 text-sm text-amber-50 outline-none transition focus:border-amber-200/50 focus:ring-2 focus:ring-amber-200/15";

function searchableText(cmd: Commander): string {
  const archetypes = ARCHES.filter((a) => (cmd.arch[a] ?? 0) > 0).flatMap(
    (a) => [a, ARCH_META[a].name],
  );
  const universe = cmd.franchise ?? "mtg";
  return [
    cmd.name,
    cmd.tagline,
    cmd.blurb,
    cmd.plan,
    cmd.youAre,
    guildName(cmd.colors),
    bracketLabel(cmd.bracketEstimate),
    cmd.typeLine,
    cmd.oracleText,
    ...cmd.colors.map((c) => COLOR_META[c].name),
    ...cmd.tags,
    ...cmd.media,
    ...archetypes,
    cmd.dataQuality,
    FRANCHISE_META[universe],
    universe,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function CommanderTile({
  commander,
  scored,
  isFavorite,
  isSelectedForCompare,
  onToggleFavorite,
  onToggleCompare,
}: {
  commander: Commander;
  scored?: ScoredCommander;
  isFavorite: boolean;
  isSelectedForCompare: boolean;
  onToggleFavorite: (name: string) => void;
  onToggleCompare: (name: string) => void;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur transition hover:border-amber-200/30 hover:bg-white/[0.06]">
      <div className="relative h-40 shrink-0">
        <CardArt name={commander.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b12] via-transparent to-black/20" />
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
          {scored && (
            <span className="rounded-full border border-amber-200/30 bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-amber-100 backdrop-blur">
              {scored.match}% fit
            </span>
          )}
          {scored && !scored.eligible && (
            <span className="rounded-full border border-rose-300/40 bg-black/70 px-2.5 py-1 text-[10px] text-rose-100 backdrop-blur">
              dealbreaker
            </span>
          )}
          <span className="rounded-full border border-white/15 bg-black/60 px-2.5 py-1 text-[10px] text-amber-100/75 backdrop-blur">
            EDHREC #{commander.rank}
          </span>
        </div>
        <div className="absolute bottom-3 left-3">
          <PipRow colors={commander.colors} size={20} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-serif text-lg leading-tight text-amber-50">
              {commander.name}
            </h3>
            <p className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-amber-100/40">
              {guildName(commander.colors)}
              {commander.dataQuality === "generated" && " · inferred"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onToggleFavorite(commander.name)}
            aria-pressed={isFavorite}
            aria-label={`${isFavorite ? "Remove" : "Add"} ${commander.name} ${isFavorite ? "from" : "to"} favorites`}
            className={`shrink-0 rounded-full border px-2 py-1 text-sm transition ${
              isFavorite
                ? "border-rose-300/40 bg-rose-300/15 text-rose-100"
                : "border-white/10 bg-white/5 text-amber-100/55 hover:text-amber-100"
            }`}
          >
            {isFavorite ? "♥" : "♡"}
          </button>
        </div>

        <p className="mt-2 text-sm italic text-amber-100/75">
          {commander.tagline}
        </p>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-amber-100/55">
          {commander.plan}
        </p>

        {scored && scored.reasons.length > 0 && (
          <p className="mt-2 text-[11px] leading-relaxed text-amber-200/60">
            ✓ {scored.reasons.slice(0, 2).join(" · ")}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {commander.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[10px] text-amber-100/65"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 space-y-1.5 border-t border-white/10 pt-3 text-[11px] text-amber-100/55">
          <div className="flex items-center justify-between gap-2">
            <span title={`Complexity ${commander.difficulty} out of 5`}>
              {"●".repeat(commander.difficulty)}
              <span className="text-amber-100/25">
                {"○".repeat(5 - commander.difficulty)}
              </span>{" "}
              complexity
            </span>
            <span className="shrink-0">Budget {commander.budget}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span>{bracketLabel(commander.bracketEstimate).split(" · ")[0]}</span>
            <span>card ≈ {formatPrice(commander.priceUsd)}</span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1.5">
          <a
            href={scryfallPage(commander.name)}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-center text-[11px] font-medium text-amber-100/80 transition hover:bg-white/10"
          >
            Card ↗
          </a>
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
        </div>

        <button
          type="button"
          onClick={() => onToggleCompare(commander.name)}
          aria-pressed={isSelectedForCompare}
          className={`mt-2 w-full rounded-lg border px-3 py-2 text-[11px] font-medium transition ${
            isSelectedForCompare
              ? "border-amber-200/50 bg-amber-200/15 text-amber-50"
              : "border-white/10 bg-white/5 text-amber-100/70 hover:bg-white/10"
          }`}
        >
          {isSelectedForCompare ? "✓ In comparison" : "＋ Add to compare"}
        </button>
      </div>
    </article>
  );
}

export default function Explorer({
  commanders,
  ranked,
  profile,
  catalogMeta,
  catalogStatus,
  catalogError,
  onRefreshCatalog,
  preferences,
  onPreferencesChange,
  favorites,
  onToggleFavorite,
  compareNames,
  onToggleCompare,
  onBack,
  onTakeQuiz,
}: {
  commanders: Commander[];
  ranked?: ScoredCommander[];
  profile?: Profile;
  catalogMeta: CatalogMeta;
  catalogStatus: CatalogStatus;
  catalogError?: string | null;
  onRefreshCatalog: () => void;
  preferences: Preferences;
  onPreferencesChange: (preferences: Preferences) => void;
  favorites: string[];
  onToggleFavorite: (name: string) => void;
  compareNames: string[];
  onToggleCompare: (name: string) => void;
  onBack: () => void;
  onTakeQuiz?: () => void;
}) {
  const personalized = Boolean(ranked?.length);
  const [query, setQuery] = useState("");
  const [selectedColors, setSelectedColors] = useState<ColorKey[]>([]);
  const [colorMode, setColorMode] = useState<ColorMode>("contains");
  const [archFilter, setArchFilter] = useState<ArchKey | "any">("any");
  const [budgetFilter, setBudgetFilter] = useState<BudgetFilter>("any");
  const [difficultyFilter, setDifficultyFilter] = useState<number | "any">(
    "any",
  );
  const [franchiseFilter, setFranchiseFilter] =
    useState<FranchiseFilter>("any");
  const [savedOnly, setSavedOnly] = useState(false);
  const [eligibleOnly, setEligibleOnly] = useState(
    hasActivePreferences(preferences),
  );
  const [sort, setSort] = useState<SortKey>(personalized ? "match" : "rank");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const searchIndex = useMemo(
    () =>
      new Map(commanders.map((cmd) => [cmd.name, searchableText(cmd)])),
    [commanders],
  );
  const rankedMap = useMemo(
    () => new Map((ranked ?? []).map((item) => [item.commander.name, item])),
    [ranked],
  );

  const filtered = useMemo(() => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const candidates = commanders.filter((cmd) => {
      if (
        tokens.length > 0 &&
        !tokens.every((token) => searchIndex.get(cmd.name)?.includes(token))
      ) {
        return false;
      }

      if (selectedColors.length > 0) {
        const containsAll = selectedColors.every((c) =>
          cmd.colors.includes(c),
        );
        if (!containsAll) return false;
        if (
          colorMode === "exact" &&
          cmd.colors.length !== selectedColors.length
        ) {
          return false;
        }
      }

      if (archFilter !== "any" && !(cmd.arch[archFilter] ?? 0)) return false;
      if (
        budgetFilter !== "any" &&
        BUDGET_LEVEL[cmd.budget] > BUDGET_LEVEL[budgetFilter]
      ) {
        return false;
      }
      if (difficultyFilter !== "any" && cmd.difficulty > difficultyFilter) {
        return false;
      }

      const universe = cmd.franchise ?? "mtg";
      if (franchiseFilter === "crossover" && universe === "mtg") return false;
      if (
        franchiseFilter !== "any" &&
        franchiseFilter !== "crossover" &&
        universe !== franchiseFilter
      ) {
        return false;
      }
      if (savedOnly && !favorites.includes(cmd.name)) return false;
      if (
        eligibleOnly &&
        rankedMap.size > 0 &&
        rankedMap.get(cmd.name)?.eligible === false
      ) {
        return false;
      }

      return true;
    });

    return candidates.sort((a, b) => {
      const byRank = a.rank - b.rank;
      switch (sort) {
        case "match":
          return (
            (rankedMap.get(b.name)?.score ?? -1) -
              (rankedMap.get(a.name)?.score ?? -1) ||
            byRank
          );
        case "simple":
          return a.difficulty - b.difficulty || byRank;
        case "budget":
          return BUDGET_LEVEL[a.budget] - BUDGET_LEVEL[b.budget] || byRank;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return byRank;
      }
    });
  }, [
    commanders,
    query,
    searchIndex,
    selectedColors,
    colorMode,
    archFilter,
    budgetFilter,
    difficultyFilter,
    franchiseFilter,
    savedOnly,
    eligibleOnly,
    sort,
    rankedMap,
    favorites,
  ]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [
    query,
    selectedColors,
    colorMode,
    archFilter,
    budgetFilter,
    difficultyFilter,
    franchiseFilter,
    savedOnly,
    eligibleOnly,
    sort,
  ]);

  const activeFilterCount = [
    query.trim() !== "",
    selectedColors.length > 0,
    archFilter !== "any",
    budgetFilter !== "any",
    difficultyFilter !== "any",
    franchiseFilter !== "any",
    savedOnly,
    eligibleOnly,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setQuery("");
    setSelectedColors([]);
    setColorMode("contains");
    setArchFilter("any");
    setBudgetFilter("any");
    setDifficultyFilter("any");
    setFranchiseFilter("any");
    setSavedOnly(false);
    setEligibleOnly(false);
    setSort(personalized ? "match" : "rank");
  };

  const applyProfile = () => {
    if (!profile) return;
    const strongestArch = profile.topArch[0];
    setQuery("");
    setSelectedColors([]);
    setColorMode("contains");
    setArchFilter(profile.arch[strongestArch] > 0 ? strongestArch : "any");
    setBudgetFilter(
      profile.budgetExplicit ? BUDGET_BY_LEVEL[profile.budget] : "any",
    );
    setDifficultyFilter(
      profile.complexityExplicit
        ? Math.max(1, Math.min(5, Math.ceil(profile.complexity)))
        : "any",
    );
    setFranchiseFilter(profile.franchise ?? "any");
    setSavedOnly(false);
    setEligibleOnly(hasActivePreferences(preferences));
    setSort(personalized ? "match" : "rank");
  };

  const toggleColor = (color: ColorKey) => {
    setSelectedColors((current) => {
      const next = current.includes(color)
        ? current.filter((c) => c !== color)
        : [...current, color];
      return COLORS.filter((c) => next.includes(c));
    });
  };

  const presets = [
    {
      label: "💸 Budget brews",
      active: budgetFilter === "$",
      apply: () => setBudgetFilter("$"),
    },
    {
      label: "🎓 Easy to pilot",
      active: difficultyFilter === 2,
      apply: () => setDifficultyFilter(2),
    },
    {
      label: "🐺 Tribal decks",
      active: archFilter === "kindred",
      apply: () => setArchFilter("kindred"),
    },
    {
      label: "✨ Spellslinger",
      active: archFilter === "spells",
      apply: () => setArchFilter("spells"),
    },
    {
      label: "🎬 Crossovers",
      active: franchiseFilter === "crossover",
      apply: () => setFranchiseFilter("crossover"),
    },
    {
      label: "♥ Saved only",
      active: savedOnly,
      apply: () => setSavedOnly((value) => !value),
    },
  ];

  const shown = filtered.slice(0, visible);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-8 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-amber-100/55 transition hover:text-amber-100"
        >
          ← Back
        </button>
        {onTakeQuiz && (
          <button
            type="button"
            onClick={onTakeQuiz}
            className="text-sm text-amber-200/75 transition hover:text-amber-100"
          >
            Prefer a personality quiz? Quick reading →
          </button>
        )}
      </div>

      <header className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-200/50">
          {personalized ? "Your reading, your rules" : "Skip the quiz"}
        </p>
        <h1 className="mt-3 font-serif text-3xl leading-tight text-amber-50 sm:text-5xl">
          {personalized ? "Explore all your matches" : "Find your commander"}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-amber-100/65">
          Search the current catalog by name, theme, color identity, strategy,
          budget, complexity and estimated table power.
          {personalized &&
            " Personalized results stay ranked by your quiz fit until you change the sort."}
        </p>
      </header>

      <div className="mt-6">
        <CatalogStatusBadge
          meta={catalogMeta}
          status={catalogStatus}
          error={catalogError}
          onRefresh={onRefreshCatalog}
          compact
        />
      </div>

      <section
        aria-label="Commander filters"
        className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:p-5"
      >
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <label className="block text-xs font-medium uppercase tracking-[0.16em] text-amber-100/55">
            Search
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Dragons, graveyard, goblins, politics…"
              className={fieldClass}
            />
          </label>
          <label className="block text-xs font-medium uppercase tracking-[0.16em] text-amber-100/55">
            Sort by
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className={fieldClass}
            >
              {personalized && <option value="match">Best match for you</option>}
              <option value="rank">EDHREC popularity</option>
              <option value="simple">Easiest to pilot</option>
              <option value="budget">Cheapest first</option>
              <option value="name">Commander name</option>
            </select>
          </label>
        </div>

        <div className="mt-5 border-t border-white/10 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-amber-50">
                Color identity
              </h2>
              <p className="mt-0.5 text-xs text-amber-100/45">
                Pick one or more colors, then choose how strictly to match.
              </p>
            </div>
            <div
              className="flex rounded-full border border-white/10 bg-black/30 p-0.5"
              role="group"
              aria-label="Color match mode"
            >
              {(
                [
                  ["contains", "Includes"],
                  ["exact", "Exactly"],
                ] as const
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={colorMode === mode}
                  onClick={() => setColorMode(mode)}
                  className={`rounded-full px-3 py-1.5 text-xs transition ${
                    colorMode === mode
                      ? "bg-amber-200/20 text-amber-50"
                      : "text-amber-100/50 hover:text-amber-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {COLORS.map((color) => {
              const active = selectedColors.includes(color);
              return (
                <button
                  key={color}
                  type="button"
                  aria-pressed={active}
                  aria-label={`${active ? "Remove" : "Add"} ${COLOR_META[color].name} ${active ? "from" : "to"} color filter`}
                  onClick={() => toggleColor(color)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
                    active
                      ? "border-amber-200/60 bg-amber-200/15 text-amber-50"
                      : "border-white/10 bg-white/5 text-amber-100/60 hover:border-white/25 hover:text-amber-100"
                  }`}
                >
                  <ManaPip color={color} size={22} />
                  {COLOR_META[color].name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-xs font-medium uppercase tracking-[0.16em] text-amber-100/55">
            Strategy
            <select
              value={archFilter}
              onChange={(e) =>
                setArchFilter(e.target.value as ArchKey | "any")
              }
              className={fieldClass}
            >
              <option value="any">Any strategy</option>
              {ARCHES.map((arch) => (
                <option key={arch} value={arch}>
                  {ARCH_META[arch].emoji} {ARCH_META[arch].name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-medium uppercase tracking-[0.16em] text-amber-100/55">
            Max budget
            <select
              value={budgetFilter}
              onChange={(e) =>
                setBudgetFilter(e.target.value as BudgetFilter)
              }
              className={fieldClass}
            >
              <option value="any">Any budget</option>
              {BUDGETS.map((budget) => (
                <option key={budget} value={budget}>
                  {budget} or less
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-medium uppercase tracking-[0.16em] text-amber-100/55">
            Max complexity
            <select
              value={difficultyFilter}
              onChange={(e) =>
                setDifficultyFilter(
                  e.target.value === "any" ? "any" : Number(e.target.value),
                )
              }
              className={fieldClass}
            >
              <option value="any">Any complexity</option>
              {[1, 2, 3, 4, 5].map((level) => (
                <option key={level} value={level}>
                  {level} / 5 or less
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-medium uppercase tracking-[0.16em] text-amber-100/55">
            Universe
            <select
              value={franchiseFilter}
              onChange={(e) =>
                setFranchiseFilter(e.target.value as FranchiseFilter)
              }
              className={fieldClass}
            >
              <option value="any">Any universe</option>
              <option value="mtg">Original Magic worlds</option>
              <option value="crossover">Any crossover</option>
              {FRANCHISES.filter((franchise) => franchise !== "mtg").map(
                (franchise) => (
                  <option key={franchise} value={franchise}>
                    {FRANCHISE_META[franchise]}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-5">
          <span className="mr-1 text-xs text-amber-100/40">Quick starts:</span>
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              aria-pressed={preset.active}
              onClick={preset.apply}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                preset.active
                  ? "border-amber-200/50 bg-amber-200/15 text-amber-50"
                  : "border-white/10 bg-white/5 text-amber-100/65 hover:border-white/25 hover:text-amber-100"
              }`}
            >
              {preset.label}
            </button>
          ))}
          {profile && (
            <button
              type="button"
              onClick={applyProfile}
              className="rounded-full border border-amber-200/35 bg-amber-200/10 px-3 py-1.5 text-xs text-amber-100 transition hover:bg-amber-200/20"
            >
              ✨ Apply my reading
            </button>
          )}
          {personalized && hasActivePreferences(preferences) && (
            <button
              type="button"
              aria-pressed={eligibleOnly}
              onClick={() => setEligibleOnly((value) => !value)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                eligibleOnly
                  ? "border-emerald-200/40 bg-emerald-200/10 text-emerald-100"
                  : "border-white/10 bg-white/5 text-amber-100/65 hover:border-white/25"
              }`}
            >
              {eligibleOnly ? "✓ Hiding dealbreakers" : "Show dealbreakers"}
            </button>
          )}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto text-xs text-amber-100/50 underline underline-offset-4 transition hover:text-amber-100"
            >
              Clear {activeFilterCount} filter{activeFilterCount === 1 ? "" : "s"}
            </button>
          )}
        </div>
      </section>

      <div className="mt-5">
        <PreferencesPanel
          preferences={preferences}
          onChange={onPreferencesChange}
          compact
        />
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-amber-50">
            {personalized ? "Matching commanders" : "Commander library"}
          </h2>
          <p aria-live="polite" className="mt-1 text-xs text-amber-100/50">
            {filtered.length} of {commanders.length} commanders
            {activeFilterCount > 0 ? " match your filters" : " available"}
          </p>
        </div>
        {filtered.length > 0 && (
          <p className="text-xs text-amber-100/40">
            Showing {shown.length} of {filtered.length}
          </p>
        )}
      </div>

      {filtered.length > 0 ? (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((commander) => (
              <CommanderTile
                key={commander.name}
                commander={commander}
                scored={rankedMap.get(commander.name)}
                isFavorite={favorites.includes(commander.name)}
                isSelectedForCompare={compareNames.includes(commander.name)}
                onToggleFavorite={onToggleFavorite}
                onToggleCompare={onToggleCompare}
              />
            ))}
          </div>
          {visible < filtered.length && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setVisible((count) => count + PAGE_SIZE)}
                className="rounded-full border border-amber-200/30 bg-amber-200/10 px-6 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-200/20"
              >
                Show {Math.min(PAGE_SIZE, filtered.length - visible)} more
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center">
          <div className="text-3xl">🔮</div>
          <h3 className="mt-3 font-serif text-xl text-amber-50">
            No commander matches every filter
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-amber-100/55">
            Try allowing a higher budget or complexity, switching from exact to
            included colors, or clearing one of the filters.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-5 rounded-full border border-amber-200/30 bg-amber-200/10 px-5 py-2.5 text-sm font-semibold text-amber-100 transition hover:bg-amber-200/20"
          >
            Clear filters
          </button>
        </div>
      )}
    </main>
  );
}
