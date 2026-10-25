import type {
  ArchKey,
  ColorKey,
  Commander,
  Franchise,
  Option,
  ScoredCommander,
} from "../types";
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
        if (v) colors[c] += v;
      }
      for (const a of ARCHES) {
        const v = opt.w[a];
        if (v) arch[a] += v;
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

const BUDGET_LEVEL: Record<Commander["budget"], number> = {
  $: 1,
  $$: 2,
  $$$: 3,
};

export function scoreCommanders(profile: Profile): ScoredCommander[] {
  const userColorVec = COLORS.map((c) => profile.colors[c]);
  const userArchVec = ARCHES.map((a) => profile.arch[a]);
  const archTotal = userArchVec.reduce((s, v) => s + v, 0) || 1;

  const scored = COMMANDERS.map((cmd: Commander) => {
    const reasons: string[] = [];

    // --- colour identity fit -------------------------------------------
    let colorFit: number;
    if (cmd.colors.length === 0) {
      colorFit = 0.55; // colorless commanders are neutral on colour
    } else {
      const cColorVec = COLORS.map((c) =>
        cmd.colors.includes(c) ? 1 / cmd.colors.length : 0,
      );
      colorFit = cosine(userColorVec, cColorVec);
    }

    // --- strategy fit ---------------------------------------------------
    const cArchVec = ARCHES.map((a) => cmd.arch[a] ?? 0);
    const archFit = cosine(userArchVec, cArchVec);

    // --- nudges ----------------------------------------------------------
    const primary = profile.topColors[0];
    const secondary = profile.topColors[1];
    const dump = profile.topColors[4];
    let bonus = 0;
    if (cmd.colors.includes(primary)) bonus += 0.06;
    if (cmd.colors.includes(secondary)) bonus += 0.025;
    if (cmd.colors.includes(dump)) bonus -= 0.055;

    // complexity: how close the deck is to the rules appetite they described
    const cxGap = Math.abs(profile.complexity - cmd.difficulty);
    const cxFit = 1 - Math.min(cxGap, 3) / 3;

    // budget: only punished for being more expensive than they want
    const over = Math.max(0, BUDGET_LEVEL[cmd.budget] - profile.budget);
    const bgFit = 1 - over * 0.5;

    // franchise affinity
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

    const score =
      colorFit * 0.4 +
      archFit * 0.4 +
      cxFit * 0.07 +
      bgFit * 0.05 +
      bonus +
      frBonus;

    // --- human-readable reasons -----------------------------------------
    const sharedArch = ARCHES.map((a, i) => ({
      a,
      v: (cmd.arch[a] ?? 0) * (userArchVec[i] / archTotal),
    }))
      .sort((x, y) => y.v - x.v)
      .filter((x) => x.v > 0)
      .slice(0, 2);
    for (const s of sharedArch) {
      reasons.push(ARCH_META[s.a].name.replace("The ", "") + " instincts");
    }
    if (cmd.colors.includes(primary)) {
      reasons.push(`${COLOR_META[primary].name} core`);
    }
    if (profile.franchise && cmd.franchise === profile.franchise) {
      reasons.push(`${FRANCHISE_META[cmd.franchise]} fan`);
    }
    if (cxGap <= 0.5) reasons.push("right complexity");

    return { commander: cmd, score, match: 0, reasons: reasons.slice(0, 4) };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => ({
    ...s,
    match: Math.max(42, Math.min(98, Math.round(30 + s.score * 76))),
  }));
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
