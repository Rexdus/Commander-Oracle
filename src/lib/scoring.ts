import type {
  ArchKey,
  ColorKey,
  Commander,
  Franchise,
  MatchPenalty,
  Option,
  Preferences,
  ScoredCommander,
} from "../types";
import { DEFAULT_PREFERENCES } from "../types";
import { COMMANDERS } from "../data/commanders";

export const COLORS: ColorKey[] = ["W", "U", "B", "R", "G"];

export const ARCHES: ArchKey[] = [
  "aggro",
  "control",
  "combo",
  "value",
  "politics",
  "chaos",
  "kindred",
  "voltron",
  "tokens",
  "graveyard",
  "artifacts",
  "spells",
  "lands",
  "counters",
  "sacrifice",
  "lifegain",
  "stax",
  "theft",
  "bigstuff",
  "enchant",
];

export const COLOR_META: Record<
  ColorKey,
  { name: string; hex: string; text: string; vibe: string }
> = {
  W: {
    name: "White",
    hex: "#f6efd6",
    text: "#3c3524",
    vibe: "Order, community, protection. You win together or not at all.",
  },
  U: {
    name: "Blue",
    hex: "#aedbf5",
    text: "#123246",
    vibe: "Knowledge, control, perfection. You'd rather be prepared than fast.",
  },
  B: {
    name: "Black",
    hex: "#b6aab3",
    text: "#211b21",
    vibe: "Ambition, pragmatism, cost. Anything is worth it at the right price.",
  },
  R: {
    name: "Red",
    hex: "#f2a08a",
    text: "#4a1a10",
    vibe: "Impulse, passion, freedom. Act now, feel great, ask later.",
  },
  G: {
    name: "Green",
    hex: "#a7cfa0",
    text: "#1c3418",
    vibe: "Growth, instinct, tradition. Bigger, older, stronger wins.",
  },
};

export const ARCH_META: Record<
  ArchKey,
  { name: string; desc: string; emoji: string }
> = {
  aggro: {
    name: "The Aggressor",
    emoji: "⚔️",
    desc: "You apply pressure early and ask questions never. Games end because you ended them.",
  },
  control: {
    name: "The Warden",
    emoji: "🛡️",
    desc: "You'd rather hold the answer than take the risk. Everything happens on your schedule.",
  },
  combo: {
    name: "The Engineer",
    emoji: "⚙️",
    desc: "You want a turn where all the pieces click and the board does something absurd.",
  },
  value: {
    name: "The Accumulator",
    emoji: "📈",
    desc: "You win by simply having more. More cards, more bodies, more options, forever.",
  },
  politics: {
    name: "The Diplomat",
    emoji: "👑",
    desc: "Half your deck is other people. Deals, threats and favours are real resources.",
  },
  chaos: {
    name: "The Wildcard",
    emoji: "🎲",
    desc: "You optimize for the story. If the table gasps, you already won something.",
  },
  kindred: {
    name: "The Warlord",
    emoji: "🐺",
    desc: "One theme, many bodies. You want a squad that loves each other and hates everyone else.",
  },
  voltron: {
    name: "The Champion",
    emoji: "🗡️",
    desc: "One hero, fully equipped. All your eggs in a beautiful, heavily armoured basket.",
  },
  tokens: {
    name: "The Swarm",
    emoji: "🐜",
    desc: "Quantity is its own quality. You'd rather have twenty small things than one big one.",
  },
  graveyard: {
    name: "The Reclaimer",
    emoji: "⚰️",
    desc: "Nothing is ever really gone. Your discard pile is just a slower hand.",
  },
  artifacts: {
    name: "The Machinist",
    emoji: "⚙",
    desc: "You build the apparatus first. The win is an output of the system.",
  },
  spells: {
    name: "The Caster",
    emoji: "✨",
    desc: "You want a hand full of instants and a reason to use all of them this turn.",
  },
  lands: {
    name: "The Cultivator",
    emoji: "🌍",
    desc: "You grow the foundation first. By turn eight nobody can keep up with you.",
  },
  counters: {
    name: "The Amplifier",
    emoji: "➕",
    desc: "You love a number that climbs. Small increments, compounded relentlessly.",
  },
  sacrifice: {
    name: "The Undertaker",
    emoji: "🔪",
    desc: "Your own things are resources. Every death should pay you something.",
  },
  lifegain: {
    name: "The Caretaker",
    emoji: "💖",
    desc: "You win by being impossible to kill, then quietly turning that into a weapon.",
  },
  stax: {
    name: "The Gatekeeper",
    emoji: "🔒",
    desc: "You'd rather the game be played at your speed, under your rules, thanks.",
  },
  theft: {
    name: "The Opportunist",
    emoji: "🫳",
    desc: "Other people's decks are a resource. Why build it when you can borrow it?",
  },
  bigstuff: {
    name: "The Colossus",
    emoji: "🦖",
    desc: "You're here to cast the biggest thing on the table and point it at someone.",
  },
  enchant: {
    name: "The Enchanter",
    emoji: "🔮",
    desc: "You like permanent, quiet effects that change the rules of the whole game.",
  },
};

export const FRANCHISE_META: Record<Franchise, string> = {
  ff: "Final Fantasy",
  lotr: "The Lord of the Rings",
  avatar: "Avatar: The Last Airbender",
  fallout: "Fallout",
  marvel: "Marvel",
  "40k": "Warhammer 40,000",
  mtg: "original Magic worlds",
};

export const GUILD_NAMES: Record<string, string> = {
  "": "Colorless",
  W: "Mono-White",
  U: "Mono-Blue",
  B: "Mono-Black",
  R: "Mono-Red",
  G: "Mono-Green",
  WU: "Azorius",
  UB: "Dimir",
  BR: "Rakdos",
  RG: "Gruul",
  WG: "Selesnya",
  WB: "Orzhov",
  UR: "Izzet",
  BG: "Golgari",
  WR: "Boros",
  UG: "Simic",
  WUB: "Esper",
  UBR: "Grixis",
  BRG: "Jund",
  WRG: "Naya",
  WUG: "Bant",
  WBR: "Mardu",
  UBG: "Sultai",
  WUR: "Jeskai",
  WBG: "Abzan",
  URG: "Temur",
  WUBR: "Yore-Tiller",
  WUBG: "Witch-Maw",
  WURG: "Ink-Treader",
  WBRG: "Dune-Brood",
  UBRG: "Glint-Eye",
  WUBRG: "Five-Color",
};

export function guildName(colors: ColorKey[]): string {
  const key = COLORS.filter((c) => colors.includes(c)).join("");
  return GUILD_NAMES[key] ?? key;
}

export interface Profile {
  colors: Record<ColorKey, number>;
  arch: Record<ArchKey, number>;
  colorPct: Record<ColorKey, number>;
  archPct: Record<ArchKey, number>;
  topColors: ColorKey[];
  topArch: ArchKey[];
  complexity: number;
  budget: number;
  /** Whether the user answered the dedicated complexity/budget questions. */
  complexityExplicit: boolean;
  budgetExplicit: boolean;
  franchise?: Franchise;
}

function emptyColors(): Record<ColorKey, number> {
  return { W: 0, U: 0, B: 0, R: 0, G: 0 };
}

function emptyArch(): Record<ArchKey, number> {
  return ARCHES.reduce(
    (acc, k) => {
      acc[k] = 0;
      return acc;
    },
    {} as Record<ArchKey, number>,
  );
}

export function buildProfile(answers: Option[]): Profile {
  const colors = emptyColors();
  const arch = emptyArch();
  const cxs: number[] = [];
  let budget = 2;
  let franchise: Franchise | undefined;

  for (const opt of answers) {
    if (opt.w) {
      for (const c of COLORS) {
        const v = opt.w[c];
        if (v) colors[c] = Math.max(0, colors[c] + v);
      }
      for (const a of ARCHES) {
        const v = opt.w[a];
        if (v) arch[a] = Math.max(0, arch[a] + v);
      }
    }
    if (opt.cx) cxs.push(opt.cx);
    if (opt.bg) budget = opt.bg;
    if (opt.fr) franchise = opt.fr;
  }

  const colorSum = COLORS.reduce((s, c) => s + colors[c], 0) || 1;
  const archSum = ARCHES.reduce((s, a) => s + arch[a], 0) || 1;

  const colorPct = emptyColors();
  COLORS.forEach((c) => (colorPct[c] = (colors[c] / colorSum) * 100));
  const archPct = emptyArch();
  ARCHES.forEach((a) => (archPct[a] = (arch[a] / archSum) * 100));

  const topColors = [...COLORS].sort((a, b) => colors[b] - colors[a]);
  const topArch = [...ARCHES].sort((a, b) => arch[b] - arch[a]);

  const complexity = cxs.length
    ? cxs.reduce((s, v) => s + v, 0) / cxs.length
    : 3;

  return {
    colors,
    arch,
    colorPct,
    archPct,
    topColors,
    topArch,
    complexity,
    budget,
    complexityExplicit: cxs.length > 0,
    budgetExplicit: answers.some((opt) => opt.bg !== undefined),
    franchise,
  };
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export const BUDGET_LEVEL: Record<Commander["budget"], number> = {
  $: 1,
  $$: 2,
  $$$: 3,
};

export interface ScoringOptions {
  commanders?: Commander[];
  preferences?: Preferences;
  dismissed?: string[];
  favorites?: string[];
  answerCount?: number;
  questionCount?: number;
}

function normalizePreferences(input?: Preferences): Preferences {
  return {
    mustHaveArches: Array.isArray(input?.mustHaveArches)
      ? input!.mustHaveArches.filter((a) => ARCHES.includes(a))
      : [...DEFAULT_PREFERENCES.mustHaveArches],
    avoidArches: Array.isArray(input?.avoidArches)
      ? input!.avoidArches.filter((a) => ARCHES.includes(a))
      : [...DEFAULT_PREFERENCES.avoidArches],
    mustHaveColors: Array.isArray(input?.mustHaveColors)
      ? input!.mustHaveColors.filter((c) => COLORS.includes(c))
      : [...DEFAULT_PREFERENCES.mustHaveColors],
    avoidColors: Array.isArray(input?.avoidColors)
      ? input!.avoidColors.filter((c) => COLORS.includes(c))
      : [...DEFAULT_PREFERENCES.avoidColors],
    maxBudget: input?.maxBudget,
    maxComplexity: input?.maxComplexity,
  };
}

interface PreferenceEvaluation {
  violations: string[];
  penalties: MatchPenalty[];
  penalty: number;
  eligible: boolean;
}

function evaluatePreferences(
  cmd: Commander,
  preferences: Preferences,
): PreferenceEvaluation {
  const violations: string[] = [];
  const penalties: MatchPenalty[] = [];
  let penalty = 0;

  const add = (label: string, amount: number) => {
    violations.push(label);
    penalties.push({ label, amount });
    penalty += amount;
  };

  for (const arch of preferences.mustHaveArches) {
    if ((cmd.arch[arch] ?? 0) <= 0) {
      add(`Missing must-have: ${ARCH_META[arch].name.replace("The ", "")}`, 0.24);
    }
  }
  for (const arch of preferences.avoidArches) {
    if ((cmd.arch[arch] ?? 0) > 0) {
      add(`Contains dealbreaker: ${ARCH_META[arch].name.replace("The ", "")}`, 0.3);
    }
  }
  for (const color of preferences.mustHaveColors) {
    if (!cmd.colors.includes(color)) {
      add(`Missing required ${COLOR_META[color].name}`, 0.22);
    }
  }
  for (const color of preferences.avoidColors) {
    if (cmd.colors.includes(color)) {
      add(`Uses avoided ${COLOR_META[color].name}`, 0.26);
    }
  }
  if (
    preferences.maxBudget &&
    BUDGET_LEVEL[cmd.budget] > preferences.maxBudget
  ) {
    add("Over your maximum budget", 0.25);
  }
  if (
    preferences.maxComplexity &&
    cmd.difficulty > preferences.maxComplexity
  ) {
    add("More complex than you requested", 0.22);
  }

  return {
    violations,
    penalties,
    penalty: Math.min(1.1, penalty),
    eligible: violations.length === 0,
  };
}

interface FeedbackAdjustment {
  colorDelta: Record<ColorKey, number>;
  archDelta: Record<ArchKey, number>;
  favoriteVectors: number[][];
  dismissedVectors: number[][];
  favoriteNames: Set<string>;
}

function emptyColorDelta(): Record<ColorKey, number> {
  return { W: 0, U: 0, B: 0, R: 0, G: 0 };
}

function clampDelta(value: number): number {
  return Math.max(-2, Math.min(2, value));
}

function buildFeedbackAdjustment(
  commanders: Commander[],
  favorites: string[],
  dismissed: string[],
): FeedbackAdjustment {
  const byName = new Map(commanders.map((cmd) => [cmd.name, cmd]));
  const colorDelta = emptyColorDelta();
  const archDelta = ARCHES.reduce(
    (acc, key) => {
      acc[key] = 0;
      return acc;
    },
    {} as Record<ArchKey, number>,
  );
  const favoriteVectors: number[][] = [];
  const dismissedVectors: number[][] = [];

  const apply = (name: string, direction: 1 | -1) => {
    const cmd = byName.get(name);
    if (!cmd) return;
    const vector = ARCHES.map((a) => cmd.arch[a] ?? 0);
    const peak = Math.max(1, ...vector);
    for (let i = 0; i < ARCHES.length; i += 1) {
      if (vector[i] > 0) {
        archDelta[ARCHES[i]] += direction * 0.4 * (vector[i] / peak);
      }
    }
    for (const color of cmd.colors) {
      colorDelta[color] += direction * 0.45;
    }
    if (direction > 0) favoriteVectors.push(vector);
    else dismissedVectors.push(vector);
  };

  for (const name of favorites) apply(name, 1);
  for (const name of dismissed) apply(name, -1);

  for (const color of COLORS) colorDelta[color] = clampDelta(colorDelta[color]);
  for (const arch of ARCHES) archDelta[arch] = clampDelta(archDelta[arch]);

  return {
    colorDelta,
    archDelta,
    favoriteVectors,
    dismissedVectors,
    favoriteNames: new Set(favorites),
  };
}

function maxSimilarity(candidate: number[], others: number[][]): number {
  return others.reduce((max, other) => Math.max(max, cosine(candidate, other)), 0);
}

export function scoreCommanders(
  profile: Profile,
  options: ScoringOptions = {},
): ScoredCommander[] {
  const allCommanders = options.commanders ?? COMMANDERS;
  const preferences = normalizePreferences(options.preferences);
  const favorites = options.favorites ?? [];
  const dismissed = options.dismissed ?? [];
  const answerCount = options.answerCount ?? 0;
  const questionCount = options.questionCount ?? 0;
  const feedback = buildFeedbackAdjustment(allCommanders, favorites, dismissed);

  const dismissedSet = new Set(dismissed);
  const pool =
    allCommanders.length - dismissedSet.size >= 10
      ? allCommanders.filter((cmd) => !dismissedSet.has(cmd.name))
      : allCommanders;
  const commanders = pool.length > 0 ? pool : allCommanders;

  const userColorVec = COLORS.map((c, i) =>
    Math.max(0, profile.colors[c] + feedback.colorDelta[COLORS[i]]),
  );
  const userArchVec = ARCHES.map((a) =>
    Math.max(0, profile.arch[a] + feedback.archDelta[a]),
  );
  const archTotal = userArchVec.reduce((sum, value) => sum + value, 0) || 1;
  const rankedColors = COLORS.map((color, i) => ({
    color,
    value: userColorVec[i],
  })).sort((a, b) => b.value - a.value);
  const primary = rankedColors[0].color;
  const secondary = rankedColors[1].color;
  const dump = rankedColors[4].color;

  const scored = commanders.map((cmd) => {
    const reasons: string[] = [];
    const penalties: MatchPenalty[] = [];

    let colorFit: number;
    if (cmd.colors.length === 0) {
      colorFit = 0.55; // colorless commanders are neutral on color
    } else {
      const cColorVec = COLORS.map((c) =>
        cmd.colors.includes(c) ? 1 / cmd.colors.length : 0,
      );
      colorFit = cosine(userColorVec, cColorVec);
    }

    const cArchVec = ARCHES.map((a) => cmd.arch[a] ?? 0);
    const archFit = cosine(userArchVec, cArchVec);
    const prefEvaluation = evaluatePreferences(cmd, preferences);
    penalties.push(...prefEvaluation.penalties);

    let bonus = 0;
    if (cmd.colors.includes(primary)) bonus += 0.06;
    if (cmd.colors.includes(secondary)) bonus += 0.025;
    if (cmd.colors.includes(dump)) bonus -= 0.055;

    const cxGap = Math.abs(profile.complexity - cmd.difficulty);
    const cxFit = 1 - Math.min(cxGap, 3) / 3;

    const budgetOver = profile.budgetExplicit
      ? Math.max(0, BUDGET_LEVEL[cmd.budget] - profile.budget)
      : 0;
    const bgFit = 1 - budgetOver * 0.5;

    const complexityOver = profile.complexityExplicit
      ? Math.max(0, cmd.difficulty - profile.complexity)
      : 0;
    if (budgetOver > 0) {
      penalties.push({
        label: "Over the budget you chose in the quiz",
        amount: budgetOver * 0.2,
      });
    }
    if (complexityOver > 0) {
      penalties.push({
        label: "More complex than your quiz answer",
        amount: complexityOver * 0.05,
      });
    }

    let frBonus = 0;
    if (profile.franchise) {
      if (profile.franchise === "mtg") {
        frBonus = cmd.franchise ? -0.05 : 0.05;
      } else if (cmd.franchise === profile.franchise) {
        frBonus = 0.12;
      } else if (cmd.franchise) {
        frBonus = -0.03;
      }
    }

    const favoriteBonus = feedback.favoriteNames.has(cmd.name) ? 0.035 : 0;
    const similarityBonus =
      maxSimilarity(cArchVec, feedback.favoriteVectors) * 0.045;
    const dismissedSimilarity = maxSimilarity(cArchVec, feedback.dismissedVectors);
    const feedbackPenalty =
      dismissedSimilarity > 0.82 ? (dismissedSimilarity - 0.82) * 0.22 : 0;
    if (feedbackPenalty > 0) {
      penalties.push({
        label: "Similar to a commander you skipped",
        amount: feedbackPenalty,
      });
    }

    const explicitPenalty = budgetOver * 0.2 + complexityOver * 0.05;
    const totalPenalty =
      explicitPenalty + prefEvaluation.penalty + feedbackPenalty;
    const score =
      colorFit * 0.4 +
      archFit * 0.4 +
      cxFit * 0.07 +
      bgFit * 0.05 +
      bonus +
      frBonus +
      favoriteBonus +
      similarityBonus -
      totalPenalty;

    const sharedArch = ARCHES.map((a, i) => ({
      a,
      v: (cmd.arch[a] ?? 0) * (userArchVec[i] / archTotal),
    }))
      .sort((x, y) => y.v - x.v)
      .filter((x) => x.v > 0)
      .slice(0, 2);
    for (const item of sharedArch) {
      reasons.push(ARCH_META[item.a].name.replace("The ", "") + " instincts");
    }
    if (cmd.colors.includes(primary)) {
      reasons.push(`${COLOR_META[primary].name} core`);
    }
    if (profile.budgetExplicit && budgetOver === 0 && profile.budget < 3) {
      reasons.push("fits your quiz budget");
    }
    if (profile.franchise && cmd.franchise === profile.franchise) {
      reasons.push(`${FRANCHISE_META[cmd.franchise]} fan`);
    }
    if (cxGap <= 0.5) reasons.push("right complexity");
    if (feedback.favoriteNames.has(cmd.name)) reasons.push("saved by you");
    if (prefEvaluation.eligible && hasActivePreferences(preferences)) {
      reasons.push("respects your dealbreakers");
    }

    const violations = [...prefEvaluation.violations];
    if (budgetOver > 0) violations.push("Over quiz budget");
    if (complexityOver > 0) violations.push("Over quiz complexity");

    const breakdown = {
      colors: Math.round(colorFit * 100),
      strategy: Math.round(archFit * 100),
      complexity: Math.round(cxFit * 100),
      budget: Math.round(bgFit * 100),
      affinity: Math.round(
        (bonus + frBonus + favoriteBonus + similarityBonus) * 100,
      ),
      penalties,
      violations,
      rawScore: score,
      confidence: questionCount > 0 ? answerCount / questionCount : 1,
      answerCount,
      questionCount,
    };

    return {
      commander: cmd,
      score,
      match: 0,
      reasons: reasons.slice(0, 5),
      breakdown,
      eligible: violations.length === 0,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((entry) => ({
    ...entry,
    match: Math.max(12, Math.min(98, Math.round(20 + entry.score * 76))),
  }));
}

export function hasActivePreferences(preferences: Preferences): boolean {
  return (
    preferences.mustHaveArches.length > 0 ||
    preferences.avoidArches.length > 0 ||
    preferences.mustHaveColors.length > 0 ||
    preferences.avoidColors.length > 0 ||
    preferences.maxBudget !== undefined ||
    preferences.maxComplexity !== undefined
  );
}

export function artUrl(name: string, version: "art_crop" | "normal") {
  return `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(
    name,
  )}&format=image&version=${version}`;
}

export function scryfallPage(name: string) {
  return `https://scryfall.com/search?q=${encodeURIComponent(`!"${name}"`)}`;
}

export function edhrecPage(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[,'’".]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `https://edhrec.com/commanders/${slug}`;
}
