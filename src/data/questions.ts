import type { Question } from "../types";

/**
 * Question v2.
 *
 * The first eight questions keep the playful, zero-Magic-knowledge tone and
 * estimate color preference. Constraint questions capture hard preferences,
 * strategy questions deliberately cover all twenty archetypes, and adaptive
 * questions are selected from the partial profile as tie-breakers.
 */
export const QUESTIONS: Question[] = [
  // ---------------------------------------------------------------------------
  // Core profile questions (used in both quiz lengths)
  // ---------------------------------------------------------------------------
  {
    id: "movie",
    core: true,
    kind: "profile",
    prompt: "It's Friday. One movie. No arguing.",
    hint: "Whatever you'd actually press play on at 9pm.",
    options: [
      {
        id: "heist",
        emoji: "🎩",
        label: "A twisty heist where the real plan is revealed in the last five minutes",
        w: { U: 3, combo: 2, theft: 2, spells: 1 },
      },
      {
        id: "epic",
        emoji: "🛡️",
        label: "A sweeping epic where a ragtag army defends a kingdom at dawn",
        w: { W: 3, kindred: 2, tokens: 2, lifegain: 1 },
      },
      {
        id: "noir",
        emoji: "🩸",
        label: "A grim revenge story where nobody's hands stay clean",
        w: { B: 3, sacrifice: 2, graveyard: 1, voltron: 1, theft: 1 },
      },
      {
        id: "boom",
        emoji: "💥",
        label: "A loud, gorgeous action film with real stunts and zero subtext",
        w: { R: 3, aggro: 3, chaos: 1, bigstuff: 1 },
      },
      {
        id: "ghibli",
        emoji: "🌿",
        label: "A slow, beautiful story about people, places and growing things",
        w: { G: 3, lands: 2, value: 2, counters: 1, enchant: 1 },
      },
      {
        id: "weird",
        emoji: "🛸",
        label: "Something strange and dreamlike that you'll argue about afterwards",
        w: { U: 2, B: 1, G: 1, chaos: 2, graveyard: 1, spells: 1, enchant: 1 },
      },
    ],
  },
  {
    id: "game",
    core: true,
    kind: "profile",
    prompt: "Pick the game you've sunk the most shameful number of hours into.",
    options: [
      {
        id: "builder",
        emoji: "🏭",
        label: "Factorio / Civilization — the factory must grow",
        w: { U: 2, G: 1, combo: 2, artifacts: 2, value: 2, counters: 1 },
      },
      {
        id: "souls",
        emoji: "⚔️",
        label: "Dark Souls / Elden Ring — one perfect build, one perfect run",
        w: { B: 2, voltron: 3, aggro: 1, counters: 1, sacrifice: 1 },
      },
      {
        id: "cozy",
        emoji: "🐓",
        label: "Stardew Valley / Animal Crossing — gentle, endless accumulation",
        w: { G: 3, W: 1, lands: 2, value: 2, lifegain: 1 },
      },
      {
        id: "party",
        emoji: "🍌",
        label: "Mario Kart / Jackbox — friendship-ending nonsense",
        w: { R: 3, chaos: 3, politics: 1 },
      },
      {
        id: "social",
        emoji: "🕵️",
        label: "Among Us / Diplomacy / Werewolf — lying is the mechanic",
        w: { B: 2, U: 1, politics: 3, theft: 1, control: 1 },
      },
      {
        id: "rts",
        emoji: "🐺",
        label: "Total War / StarCraft — I want a horde and I want it now",
        w: { R: 1, W: 1, kindred: 3, tokens: 2, aggro: 1 },
      },
    ],
  },
  {
    id: "boardgame",
    core: true,
    kind: "profile",
    prompt: "At board game night, you are famously the person who…",
    options: [
      {
        id: "rules",
        emoji: "📖",
        label: "Read the whole rulebook before anyone arrived",
        w: { U: 3, control: 3, stax: 1 },
        cx: 5,
      },
      {
        id: "deals",
        emoji: "🤝",
        label: "Makes a heartfelt alliance in round two and breaks it in round four",
        w: { B: 2, politics: 3, theft: 1 },
      },
      {
        id: "engine",
        emoji: "⚙️",
        label: "Quietly builds something enormous while everyone fights",
        w: { G: 2, U: 1, value: 3, lands: 1, counters: 1 },
      },
      {
        id: "rush",
        emoji: "🏃",
        label: "Attacks on turn one just to see what happens",
        w: { R: 3, aggro: 3 },
        cx: 1,
      },
      {
        id: "wildcard",
        emoji: "🎲",
        label: "Plays the card that says 'all players swap everything'",
        w: { R: 2, U: 1, chaos: 3, spells: 1 },
      },
      {
        id: "collector",
        emoji: "🧺",
        label: "Hoards one resource all game and cashes it in at the end",
        w: { B: 1, G: 2, graveyard: 2, value: 2, enchant: 1 },
      },
    ],
  },
  {
    id: "villain",
    core: true,
    kind: "profile",
    prompt: "Which fictional villain do you secretly, slightly agree with?",
    options: [
      {
        id: "order",
        emoji: "⚖️",
        label: "The one who just wants everyone to follow the rules for once",
        w: { W: 3, stax: 2, control: 2, enchant: 1 },
      },
      {
        id: "genius",
        emoji: "🔮",
        label: "The chessmaster who saw it all twelve moves ago",
        w: { U: 3, control: 2, combo: 1, artifacts: 1 },
      },
      {
        id: "ambition",
        emoji: "👑",
        label: "The ambitious one who climbed over everybody and said so",
        w: { B: 3, sacrifice: 1, politics: 1, graveyard: 1 },
      },
      {
        id: "burn",
        emoji: "🌋",
        label: "The agent of chaos who mostly wants to watch it all burn",
        w: { R: 3, chaos: 3, aggro: 1 },
      },
      {
        id: "nature",
        emoji: "🐻",
        label: "The one defending their home from people who should've knocked",
        w: { G: 3, bigstuff: 1, lands: 1, kindred: 1 },
      },
    ],
  },
  {
    id: "superpower",
    core: true,
    kind: "profile",
    prompt: "Free superpower, no refunds:",
    options: [
      {
        id: "shield",
        emoji: "🛡️",
        label: "Nothing can hurt anyone standing near you",
        w: { W: 3, control: 1, stax: 1, lifegain: 2, enchant: 1 },
      },
      {
        id: "mind",
        emoji: "🧿",
        label: "You always know what the other person will do next",
        w: { U: 3, control: 3, spells: 1 },
      },
      {
        id: "undead",
        emoji: "💀",
        label: "Anything you lose eventually comes back to you",
        w: { B: 3, graveyard: 3, sacrifice: 1 },
      },
      {
        id: "strength",
        emoji: "🦍",
        label: "Absurd, uncomplicated physical power",
        w: { R: 2, G: 2, bigstuff: 2, voltron: 1, counters: 1 },
      },
      {
        id: "army",
        emoji: "🐜",
        label: "Every creature in the area decides you're the boss",
        w: { G: 2, B: 1, kindred: 3, tokens: 2 },
      },
      {
        id: "machines",
        emoji: "🔌",
        label: "Machines do whatever you ask, no questions",
        w: { U: 2, R: 1, artifacts: 3, combo: 1 },
      },
    ],
  },
  {
    id: "argue",
    core: true,
    kind: "profile",
    prompt: "How do you win an argument?",
    options: [
      {
        id: "principle",
        emoji: "📜",
        label: "Cite the agreed-upon principle. It's written down. Right there.",
        w: { W: 3, stax: 2, control: 1, enchant: 1 },
      },
      {
        id: "data",
        emoji: "📊",
        label: "Calmly produce the one fact that ends the conversation",
        w: { U: 3, control: 2, spells: 1 },
      },
      {
        id: "leverage",
        emoji: "🪤",
        label: "You already knew the thing they didn't want brought up",
        w: { B: 3, politics: 2, theft: 1 },
      },
      {
        id: "volume",
        emoji: "📣",
        label: "Passion. Momentum. Nobody remembers the premise, they remember me.",
        w: { R: 3, aggro: 2, chaos: 1 },
      },
      {
        id: "outlast",
        emoji: "🪨",
        label: "You don't. You just keep existing until they get tired.",
        w: { G: 3, value: 2, lifegain: 1, lands: 1 },
      },
    ],
  },
  {
    id: "friend",
    core: true,
    kind: "profile",
    prompt: "Your friend group is deciding where to eat. You:",
    options: [
      {
        id: "poll",
        emoji: "🗳️",
        label: "Set up a poll and enforce the result fairly",
        w: { W: 3, politics: 1, tokens: 1 },
      },
      {
        id: "veto",
        emoji: "🚫",
        label: "Say nothing until a bad option appears, then veto it",
        w: { U: 3, control: 3, stax: 1 },
      },
      {
        id: "manipulate",
        emoji: "🎭",
        label: "Gently steer everyone toward the place you already wanted",
        w: { B: 2, politics: 3, theft: 1 },
      },
      {
        id: "decide",
        emoji: "🚗",
        label: "Already left. Meet me there.",
        w: { R: 3, aggro: 2, chaos: 1 },
      },
      {
        id: "happy",
        emoji: "🧺",
        label: "Honestly thrilled either way — I brought snacks for the wait",
        w: { G: 2, W: 2, politics: 2, lifegain: 1, value: 1 },
      },
    ],
  },
  {
    id: "desk",
    core: true,
    kind: "profile",
    prompt: "Describe your desk / room right now.",
    options: [
      {
        id: "pristine",
        emoji: "✨",
        label: "Pristine. Everything has a home. Cable management is a hobby.",
        w: { W: 2, U: 2, control: 2, artifacts: 1, enchant: 1 },
      },
      {
        id: "layers",
        emoji: "🗂️",
        label: "Organized chaos — I know exactly which pile it's in",
        w: { B: 2, R: 1, graveyard: 2, value: 1, sacrifice: 1 },
      },
      {
        id: "plants",
        emoji: "🪴",
        label: "Plants, mugs, and a slow accumulation of objects I love",
        w: { G: 3, lands: 2, value: 1, counters: 1 },
      },
      {
        id: "project2",
        emoji: "🔧",
        label: "Mid-project. Three half-built things and a hot glue gun.",
        w: { R: 2, U: 1, artifacts: 2, combo: 2, spells: 1 },
      },
      {
        id: "collection",
        emoji: "🧸",
        label: "A shrine to one very specific thing I collect",
        w: { W: 1, B: 1, kindred: 3, enchant: 1, tokens: 1 },
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // Constraint questions (asked in both quiz lengths)
  // ---------------------------------------------------------------------------
  {
    id: "complexity",
    kind: "constraint",
    prompt: "A friend hands you a new board game. The rulebook is…",
    hint: "This is about how much mental bookkeeping you enjoy.",
    options: [
      {
        id: "thin",
        emoji: "📄",
        label: "Two pages. Great. Let's play.",
        w: { aggro: 1, kindred: 1 },
        cx: 1,
      },
      {
        id: "learnable",
        emoji: "📑",
        label: "A few pages, but one clever system ties it together",
        w: { value: 1, tokens: 1 },
        cx: 2,
      },
      {
        id: "normal",
        emoji: "📘",
        label: "A proper rulebook. I'll teach the table.",
        w: { control: 1, artifacts: 1 },
        cx: 3,
      },
      {
        id: "deep",
        emoji: "📚",
        label: "Dense, with interactions nobody will see until game three",
        w: { combo: 1, spells: 1 },
        cx: 4,
      },
      {
        id: "sprawling",
        emoji: "🗃️",
        label: "A binder. Four subsystems. I'm taking notes.",
        w: { combo: 2, control: 1, stax: 1 },
        cx: 5,
      },
    ],
  },
  {
    id: "budget",
    kind: "constraint",
    prompt: "How do you treat a hobby you actually love?",
    options: [
      {
        id: "bg1",
        emoji: "🪙",
        label: "Thrifty. Half the fun is doing it well on a tiny budget.",
        bg: 1,
      },
      {
        id: "bg2",
        emoji: "💳",
        label: "Reasonable. I'll spend real money on the things that matter.",
        bg: 2,
      },
      {
        id: "bg3",
        emoji: "💎",
        label: "I bought the nice version. I have no regrets and several receipts.",
        bg: 3,
      },
    ],
  },
  {
    id: "franchise",
    kind: "constraint",
    prompt: "Pick a universe you'd happily get lost in for 200 hours.",
    options: [
      {
        id: "mtg",
        emoji: "🌌",
        label: "Original Magic worlds — strange planes, old gods, endless lore",
        w: { kindred: 1, value: 1 },
        fr: "mtg",
      },
      {
        id: "ff",
        emoji: "⚔️",
        label: "Final Fantasy",
        w: { spells: 1, voltron: 1 },
        fr: "ff",
      },
      {
        id: "lotr",
        emoji: "💍",
        label: "The Lord of the Rings",
        w: { kindred: 1, politics: 1 },
        fr: "lotr",
      },
      {
        id: "avatar",
        emoji: "🌪️",
        label: "Avatar: The Last Airbender",
        w: { lands: 1, control: 1 },
        fr: "avatar",
      },
      {
        id: "fallout",
        emoji: "☢️",
        label: "Fallout",
        w: { artifacts: 1, chaos: 1 },
        fr: "fallout",
      },
      {
        id: "marvel",
        emoji: "🕸️",
        label: "Marvel",
        w: { voltron: 1, aggro: 1 },
        fr: "marvel",
      },
      {
        id: "40k",
        emoji: "🦾",
        label: "Warhammer 40,000",
        w: { kindred: 1, tokens: 1 },
        fr: "40k",
      },
    ],
  },
  {
    id: "dealbreaker",
    kind: "dealbreaker",
    prompt: "What should your commander never make the table feel like?",
    hint: "Pick the one experience you most want to avoid.",
    options: [
      {
        id: "no_lockdown",
        emoji: "🚫",
        label: "A rules lecture where nobody is allowed to do anything",
        w: { W: 1, stax: -8, control: -2, politics: 1 },
      },
      {
        id: "no_solitaire",
        emoji: "🧩",
        label: "Ten minutes of one player solving a puzzle alone",
        w: { U: 1, combo: -8, artifacts: -1, value: 1 },
      },
      {
        id: "no_random",
        emoji: "🎲",
        label: "Pure dice-roll nonsense where planning stops mattering",
        w: { R: 1, chaos: -8, politics: 1 },
      },
      {
        id: "no_tribal",
        emoji: "🐺",
        label: "The same creature type, over and over, forever",
        w: { G: 1, kindred: -8, value: 1 },
      },
      {
        id: "no_graveyard",
        emoji: "🪦",
        label: "Endless recycling of the same gloomy resources",
        w: { B: 1, graveyard: -6, sacrifice: -6, lifegain: -2, aggro: 1 },
      },
      {
        id: "no_voltron",
        emoji: "🗡️",
        label: "One enormous protected threat deciding every game",
        w: { W: 1, voltron: -6, bigstuff: -4, tokens: 1 },
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // Direct strategy questions (full quiz)
  // ---------------------------------------------------------------------------
  {
    id: "win",
    kind: "strategy",
    prompt: "A win feels best when…",
    hint: "No Magic words needed — pick the feeling.",
    options: [
      {
        id: "swarm",
        emoji: "🐜",
        label: "My side of the table is completely covered in little things",
        w: { G: 2, W: 1, tokens: 3, kindred: 2, aggro: 1 },
      },
      {
        id: "tall",
        emoji: "🦖",
        label: "One enormous, ridiculous thing ends the argument",
        w: { R: 1, G: 1, bigstuff: 3, voltron: 2, lands: 1 },
      },
      {
        id: "spells",
        emoji: "✨",
        label: "I chain a flurry of clever little actions into a big turn",
        w: { U: 2, R: 1, spells: 3, combo: 1, control: 1 },
      },
      {
        id: "recursion",
        emoji: "♻️",
        label: "Nothing stays lost; everything comes back around",
        w: { B: 2, G: 1, graveyard: 3, sacrifice: 2, value: 1 },
      },
      {
        id: "engine",
        emoji: "⚙️",
        label: "My little machine keeps producing more than anyone can handle",
        w: { U: 1, G: 1, artifacts: 3, counters: 2, value: 2 },
      },
      {
        id: "lock",
        emoji: "🧱",
        label: "Everyone has to play the game on my carefully prepared terms",
        w: { W: 2, U: 1, control: 2, stax: 2, enchant: 2, lifegain: 1 },
      },
    ],
  },
  {
    id: "board",
    kind: "strategy",
    prompt: "Pick the board state that looks like fun to you.",
    options: [
      {
        id: "many_small",
        emoji: "🌱",
        label: "Twenty small pieces, all growing together",
        w: { tokens: 3, kindred: 1, counters: 1 },
      },
      {
        id: "one_hero",
        emoji: "🗡️",
        label: "One hero, beautifully equipped and extremely hard to stop",
        w: { voltron: 3, enchant: 1, lifegain: 1 },
      },
      {
        id: "growing",
        emoji: "📈",
        label: "Numbers on everything quietly getting out of control",
        w: { counters: 3, lands: 1, value: 1 },
      },
      {
        id: "borrowed",
        emoji: "🫳",
        label: "Half my best things started on someone else's side",
        w: { theft: 3, politics: 1, chaos: 1 },
      },
      {
        id: "renewable",
        emoji: "🪦",
        label: "A messy pile of things that keep coming back",
        w: { graveyard: 3, sacrifice: 2, enchant: 1 },
      },
      {
        id: "fortress",
        emoji: "🏰",
        label: "A safe fortress while everyone else runs out of options",
        w: { control: 2, stax: 2, lifegain: 2, artifacts: 1 },
      },
    ],
  },
  {
    id: "tempo",
    kind: "strategy",
    prompt: "How do you like a game to unfold?",
    options: [
      {
        id: "fast",
        emoji: "🏁",
        label: "Fast and loud. Ask questions later.",
        w: { aggro: 3, chaos: 1, R: 1 },
      },
      {
        id: "patient",
        emoji: "🌳",
        label: "Slowly build a foundation nobody can catch",
        w: { lands: 3, value: 2, G: 1 },
      },
      {
        id: "reactive",
        emoji: "🛡️",
        label: "Wait, respond, and always have the answer",
        w: { control: 3, spells: 2, U: 1 },
      },
      {
        id: "explosive",
        emoji: "💥",
        label: "Quiet setup, then one enormous chain reaction",
        w: { combo: 3, artifacts: 1, spells: 1 },
      },
      {
        id: "political",
        emoji: "👑",
        label: "Keep everyone talking until I'm the last problem left",
        w: { politics: 3, theft: 1, lifegain: 1 },
      },
    ],
  },
  {
    id: "theme",
    kind: "strategy",
    prompt: "Which pile of cards would you happily sort through for hours?",
    options: [
      {
        id: "creatures",
        emoji: "🐾",
        label: "A whole family of creatures that belong together",
        w: { kindred: 3, tokens: 1, bigstuff: 1 },
      },
      {
        id: "artifacts",
        emoji: "🔩",
        label: "Shiny machines, gadgets and strange devices",
        w: { artifacts: 3, combo: 1, counters: 1 },
      },
      {
        id: "enchants",
        emoji: "🔮",
        label: "Quiet rules that permanently change how the world works",
        w: { enchant: 3, lifegain: 1, control: 1 },
      },
      {
        id: "lands",
        emoji: "🗺️",
        label: "Maps, terrain and places that make everything bigger",
        w: { lands: 3, bigstuff: 1, value: 1 },
      },
      {
        id: "instants",
        emoji: "📜",
        label: "Quick tricks, clever responses and surprise reversals",
        w: { spells: 3, chaos: 1, theft: 1 },
      },
      {
        id: "graveyards",
        emoji: "⚰️",
        label: "Old things, lost things and second chances",
        w: { graveyard: 3, sacrifice: 2 },
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // Adaptive tie-breakers (selected from the partial profile)
  // ---------------------------------------------------------------------------
  {
    id: "tie_growth",
    kind: "adaptive",
    targets: ["counters", "graveyard"],
    prompt: "Two plans are tied. Which sounds more like you?",
    options: [
      {
        id: "grow_numbers",
        emoji: "📈",
        label: "Keep adding small improvements until everything is enormous",
        w: { G: 1, counters: 4, lands: 1, value: 1 },
      },
      {
        id: "break_return",
        emoji: "♻️",
        label: "Let things break, then bring them back stronger",
        w: { B: 1, graveyard: 4, sacrifice: 1 },
      },
    ],
  },
  {
    id: "tie_spells",
    kind: "adaptive",
    targets: ["spells", "artifacts"],
    prompt: "Your perfect turn is…",
    options: [
      {
        id: "flurry",
        emoji: "✨",
        label: "A flurry of quick, clever actions in exactly the right order",
        w: { U: 1, spells: 4, combo: 1, chaos: 1 },
      },
      {
        id: "machine",
        emoji: "⚙️",
        label: "One elaborate machine clicking through every step",
        w: { U: 1, artifacts: 4, value: 1, counters: 1 },
      },
    ],
  },
  {
    id: "tie_control",
    kind: "adaptive",
    targets: ["stax", "politics", "theft"],
    prompt: "When a table gets too powerful, you…",
    options: [
      {
        id: "set_rules",
        emoji: "📏",
        label: "Set firm rules that slow everyone down",
        w: { W: 1, stax: 4, control: 1, enchant: 1 },
      },
      {
        id: "redirect",
        emoji: "🎭",
        label: "Redirect attention and borrow their best ideas",
        w: { B: 1, politics: 3, theft: 3 },
      },
    ],
  },
  {
    id: "tie_chaos",
    kind: "adaptive",
    targets: ["chaos", "theft", "spells"],
    prompt: "Pick your favourite kind of surprise.",
    options: [
      {
        id: "unexpected",
        emoji: "🎢",
        label: "Something wild happens and nobody knows what comes next",
        w: { R: 1, chaos: 4, spells: 1 },
      },
      {
        id: "borrowed_surprise",
        emoji: "🫳",
        label: "The best surprise is one I borrowed from someone else",
        w: { U: 1, B: 1, theft: 4, politics: 1 },
      },
    ],
  },
  {
    id: "tie_life",
    kind: "adaptive",
    targets: ["lifegain", "sacrifice", "enchant"],
    prompt: "You're offered a powerful bargain. Which do you take?",
    options: [
      {
        id: "unkillable",
        emoji: "💖",
        label: "I become almost impossible to knock down",
        w: { W: 1, lifegain: 4, control: 1, enchant: 1 },
      },
      {
        id: "pay_cost",
        emoji: "🩸",
        label: "I pay a real cost now for a much bigger payoff",
        w: { B: 1, sacrifice: 4, graveyard: 1, combo: 1 },
      },
    ],
  },
  {
    id: "tie_scale",
    kind: "adaptive",
    targets: ["lands", "bigstuff", "kindred", "voltron"],
    prompt: "Which scale feels most satisfying?",
    options: [
      {
        id: "world",
        emoji: "🗺️",
        label: "The whole world around me grows",
        w: { G: 1, lands: 4, value: 1 },
      },
      {
        id: "giant",
        emoji: "🦖",
        label: "One giant thing towers over everything",
        w: { R: 1, G: 1, bigstuff: 4, voltron: 1 },
      },
      {
        id: "family",
        emoji: "🐺",
        label: "A whole family of creatures arrives together",
        w: { G: 1, W: 1, kindred: 4, tokens: 1 },
      },
    ],
  },
  {
    id: "tie_enchant_combo",
    kind: "adaptive",
    targets: ["enchant", "combo", "control"],
    prompt: "Which kind of slow-burn plan appeals more?",
    options: [
      {
        id: "quiet_rules",
        emoji: "🔮",
        label: "Quietly change the rules until winning feels inevitable",
        w: { W: 1, enchant: 4, control: 1, lifegain: 1 },
      },
      {
        id: "chain_reaction",
        emoji: "⚙️",
        label: "Line up one perfect chain reaction",
        w: { U: 1, combo: 4, artifacts: 1, spells: 1 },
      },
    ],
  },
  {
    id: "vibe_cards",
    kind: "adaptive",
    targets: ["tokens", "bigstuff", "graveyard", "kindred", "value"],
    prompt: "Forget the words. Which of these feels most like you?",
    hint: "Pick the picture and name you like, even if you have no idea what the card does.",
    options: [
      {
        id: "vibe_swarm",
        emoji: "🐜",
        label: "A loud little crowd with one shared purpose",
        art: "Krenko, Mob Boss",
        w: { R: 1, tokens: 3, kindred: 2, aggro: 1 },
      },
      {
        id: "vibe_dragon",
        emoji: "🐲",
        label: "Something ancient, enormous and impossible to ignore",
        art: "The Ur-Dragon",
        w: { bigstuff: 3, kindred: 2, value: 1 },
      },
      {
        id: "vibe_return",
        emoji: "🪦",
        label: "Nothing is ever really finished or gone",
        art: "Muldrotha, the Gravetide",
        w: { B: 1, G: 1, graveyard: 3, value: 2, enchant: 1 },
      },
    ],
  },
];

export const CORE_QUESTIONS = QUESTIONS.filter((question) => question.core);
export const CONSTRAINT_QUESTIONS = QUESTIONS.filter(
  (question) =>
    question.kind === "constraint" || question.kind === "dealbreaker",
);
export const STRATEGY_QUESTIONS = QUESTIONS.filter(
  (question) => question.kind === "strategy",
);
export const ADAPTIVE_QUESTIONS = QUESTIONS.filter(
  (question) => question.kind === "adaptive",
);
