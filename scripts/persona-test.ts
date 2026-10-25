import assert from "node:assert/strict";
import type { ArchKey, Commander, Option } from "../src/types.ts";
import { QUESTIONS } from "../src/data/questions.ts";
import { ARCHES, buildProfile, scoreCommanders } from "../src/lib/scoring.ts";

function makeCommander(arch: ArchKey, index: number): Commander {
  return {
    name: `${arch} Commander`,
    rank: index + 1,
    colors: [],
    arch: { [arch]: 3 },
    tagline: `Pure ${arch}`,
    blurb: `A synthetic commander for the ${arch} archetype.`,
    plan: `Test ${arch}.`,
    youAre: `A test persona for ${arch}.`,
    media: [],
    difficulty: 2,
    budget: "$",
    tags: [arch],
    dataQuality: "curated",
  };
}

const mockCatalog: Commander[] = ARCHES.map(makeCommander);

function optionFor(questionId: string, optionId: string): Option {
  const question = QUESTIONS.find((candidate) => candidate.id === questionId);
  assert.ok(question, `Missing question ${questionId}`);
  const option = question.options.find((candidate) => candidate.id === optionId);
  assert.ok(option, `Missing option ${questionId}.${optionId}`);
  return option;
}

function answersFrom(selections: Record<string, string>): Option[] {
  return Object.entries(selections).map(([questionId, optionId]) =>
    optionFor(questionId, optionId),
  );
}

interface Persona {
  name: string;
  expected: ArchKey[];
  selections: Record<string, string>;
}

const personas: Persona[] = [
  {
    name: "swarm / kindred",
    expected: ["tokens", "kindred"],
    selections: {
      movie: "epic",
      game: "rts",
      win: "swarm",
      board: "many_small",
      theme: "creatures",
    },
  },
  {
    name: "voltron / bigstuff",
    expected: ["voltron", "bigstuff", "artifacts"],
    selections: {
      game: "souls",
      win: "tall",
      board: "one_hero",
      theme: "artifacts",
    },
  },
  {
    name: "spellslinger / control",
    expected: ["spells", "control", "combo"],
    selections: {
      movie: "heist",
      win: "spells",
      tempo: "reactive",
      theme: "instants",
      tie_spells: "flurry",
    },
  },
  {
    name: "artifacts / counters / value",
    expected: ["artifacts", "counters", "value"],
    selections: {
      game: "builder",
      win: "engine",
      board: "growing",
      theme: "artifacts",
      tie_spells: "machine",
    },
  },
  {
    name: "graveyard / sacrifice",
    expected: ["graveyard", "sacrifice"],
    selections: {
      movie: "noir",
      superpower: "undead",
      win: "recursion",
      board: "renewable",
      theme: "graveyards",
      tie_growth: "break_return",
    },
  },
  {
    name: "enchant / lifegain / stax",
    expected: ["enchant", "lifegain", "control", "stax"],
    selections: {
      superpower: "shield",
      win: "lock",
      board: "fortress",
      theme: "enchants",
      tie_life: "unkillable",
      tie_control: "set_rules",
    },
  },
  {
    name: "lands / bigstuff",
    expected: ["lands", "bigstuff"],
    selections: {
      movie: "ghibli",
      villain: "nature",
      tempo: "patient",
      theme: "lands",
      tie_scale: "giant",
    },
  },
  {
    name: "politics / theft / chaos",
    expected: ["politics", "theft", "chaos"],
    selections: {
      game: "social",
      friend: "manipulate",
      board: "borrowed",
      tempo: "political",
      theme: "instants",
      tie_chaos: "borrowed_surprise",
    },
  },
  {
    name: "fast aggro",
    expected: ["aggro", "tokens", "kindred"],
    selections: {
      movie: "boom",
      boardgame: "rush",
      tempo: "fast",
      theme: "creatures",
    },
  },
  {
    name: "combo / value",
    expected: ["combo", "value", "artifacts", "counters"],
    selections: {
      boardgame: "engine",
      win: "engine",
      tempo: "explosive",
      theme: "artifacts",
      tie_enchant_combo: "chain_reaction",
      tie_growth: "grow_numbers",
    },
  },
];

const coveredArchetypes = new Set<ArchKey>();

for (const persona of personas) {
  const answers = answersFrom(persona.selections);
  const profile = buildProfile(answers);
  const ranked = scoreCommanders(profile, {
    commanders: mockCatalog,
    answerCount: answers.length,
    questionCount: QUESTIONS.length,
  });
  const topThree = ranked
    .slice(0, 3)
    .map((entry) => entry.commander.tags[0] as ArchKey);
  const profileTopFive = profile.topArch.slice(0, 5);

  assert.ok(
    profileTopFive.some((arch) => persona.expected.includes(arch)),
    `${persona.name}: expected ${persona.expected.join("/")} in profile top five, got ${profileTopFive.join(", ")}`,
  );
  assert.ok(
    topThree.some((arch) => persona.expected.includes(arch)),
    `${persona.name}: expected ${persona.expected.join("/")} in result top three, got ${topThree.join(", ")}`,
  );

  for (const expected of persona.expected) coveredArchetypes.add(expected);
  console.log(
    `✓ ${persona.name.padEnd(30)} profile: ${profileTopFive.slice(0, 3).join(", ")} | result: ${topThree.join(", ")}`,
  );
}

assert.equal(
  coveredArchetypes.size,
  ARCHES.length,
  `Persona suite should cover all ${ARCHES.length} archetypes`,
);

console.log(`Persona tests passed · ${personas.length} personas · ${coveredArchetypes.size} archetypes`);
