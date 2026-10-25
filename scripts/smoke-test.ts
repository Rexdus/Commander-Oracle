import assert from "node:assert/strict";
import type { Option, Preferences } from "../src/types.ts";
import { DEFAULT_PREFERENCES } from "../src/types.ts";
import {
  ADAPTIVE_QUESTIONS,
  CONSTRAINT_QUESTIONS,
  CORE_QUESTIONS,
  QUESTIONS,
  STRATEGY_QUESTIONS,
} from "../src/data/questions.ts";
import { CURATED_COMMANDERS } from "../src/data/commanders.ts";
import {
  ARCHES,
  buildProfile,
  COLORS,
  scoreCommanders,
} from "../src/lib/scoring.ts";
import {
  buildActiveDeck,
  encodingDeckFor,
  FULL_QUIZ_LENGTH,
  QUICK_QUIZ_LENGTH,
  selectAdaptiveQuestions,
} from "../src/lib/questions.ts";
import {
  buildResultHash,
  buildShareUrl,
  parseResultHash,
} from "../src/lib/share.ts";
import {
  budgetDecklistUrl,
  buildLiveCatalog,
  DEFAULT_CATALOG_PAGES,
  edhrecSlug,
  inferArch,
  MAX_CATALOG_PAGES,
} from "../src/lib/catalog.ts";

// Shareable result links survive a round trip, including preferences.
const picks = {
  [QUESTIONS[0].id]: QUESTIONS[0].options[2],
  [QUESTIONS[1].id]: QUESTIONS[1].options[1],
};
const preferences: Preferences = {
  ...DEFAULT_PREFERENCES,
  avoidArches: ["stax"],
  mustHaveColors: ["G"],
  maxBudget: 2,
};
const hash = buildResultHash({ mode: "full", picks, preferences });
const parsed = parseResultHash(hash);
assert.ok(parsed, "shared result should parse");
assert.equal(parsed.mode, "full");
assert.equal(parsed.picks[QUESTIONS[0].id].id, QUESTIONS[0].options[2].id);
assert.deepEqual(parsed.preferences.avoidArches, ["stax"]);
assert.deepEqual(parsed.preferences.mustHaveColors, ["G"]);
assert.equal(parsed.preferences.maxBudget, 2);
assert.match(
  buildShareUrl({ mode: "full", picks, preferences }, "https://example.com/app/"),
  /#r=v2/,
);

// Scoring exposes a breakdown, applies dealbreakers, and respects feedback.
const answers = QUESTIONS.slice(0, 6).map((question) => question.options[0]);
const profile = buildProfile(answers);
const baseline = scoreCommanders(profile, {
  commanders: CURATED_COMMANDERS,
  answerCount: answers.length,
  questionCount: QUESTIONS.length,
});
assert.equal(baseline.length, CURATED_COMMANDERS.length);
assert.ok(baseline[0].breakdown.colors >= 0);
assert.ok(baseline[0].breakdown.colors <= 100);
assert.equal(baseline[0].breakdown.answerCount, answers.length);
assert.equal(baseline[0].breakdown.questionCount, QUESTIONS.length);

const constrained = scoreCommanders(profile, {
  commanders: CURATED_COMMANDERS,
  preferences,
  answerCount: answers.length,
  questionCount: QUESTIONS.length,
});
const penalized = constrained.find(
  (entry) => (entry.commander.arch.stax ?? 0) > 0,
);
assert.ok(penalized, "catalog should contain a stax commander for this test");
assert.ok(
  penalized.breakdown.violations.length > 0,
  "dealbreaker should appear in the breakdown",
);
assert.ok(
  penalized.score <
    (baseline.find(
      (entry) => entry.commander.name === penalized.commander.name,
    )?.score ?? 0),
  "dealbreaker should lower the score",
);

const skippedName = baseline[0].commander.name;
const afterFeedback = scoreCommanders(profile, {
  commanders: CURATED_COMMANDERS,
  dismissed: [skippedName],
  favorites: [baseline[1].commander.name],
  answerCount: answers.length,
  questionCount: QUESTIONS.length,
});
assert.ok(
  !afterFeedback.some((entry) => entry.commander.name === skippedName),
  "not-for-me should remove a commander from the ranking",
);
assert.equal(afterFeedback.length, CURATED_COMMANDERS.length - 1);

// Catalog URL helpers are deterministic.
assert.equal(
  edhrecSlug("Y'shtola, Night's Blessed"),
  "yshtola-nights-blessed",
);
assert.match(budgetDecklistUrl("Krenko, Mob Boss"), /moxfield\.com/);
assert.equal(DEFAULT_CATALOG_PAGES, 10);
assert.ok(MAX_CATALOG_PAGES >= 10);

// The EDHREC/Scryfall catalog builder works against mocked public payloads.
const curatedKrenko = CURATED_COMMANDERS.find(
  (commander) => commander.name === "Krenko, Mob Boss",
);
assert.ok(curatedKrenko, "seed should contain Krenko");

const edhrecFirstPage = {
  container: {
    json_dict: {
      cardlists: [
        {
          cardviews: [
            {
              id: "id-krenko",
              name: "Krenko, Mob Boss",
              sanitized: "krenko-mob-boss",
              num_decks: 44000,
              rank: 1,
              trend_zscore: 0.2,
            },
            {
              id: "id-test",
              name: "Test Commander",
              sanitized: "test-commander",
              num_decks: 12000,
              rank: 2,
              trend_zscore: -0.1,
            },
          ],
          more: "commanders/year-past2years-1.json",
        },
      ],
    },
  },
};
const edhrecSecondPage = {
  cardviews: [
    {
      id: "id-third",
      name: "Third Commander",
      sanitized: "third-commander",
      num_decks: 9000,
      rank: 3,
      trend_zscore: 0,
    },
  ],
};
const scryfallPayload = {
  data: [
    {
      id: "id-krenko",
      oracle_id: "oracle-krenko",
      name: "Krenko, Mob Boss",
      type_line: "Legendary Creature — Goblin Warrior",
      oracle_text: "Create a 1/1 red Goblin creature token.",
      color_identity: ["R"],
      prices: { usd: "3.50" },
      released_at: "2012-02-03",
      set_name: "Magic 2013",
    },
    {
      id: "id-test",
      oracle_id: "oracle-test",
      name: "Test Commander",
      type_line: "Legendary Creature — Elf Druid",
      oracle_text:
        "Create a 1/1 green Elf Warrior creature token. Whenever a creature dies, draw a card.",
      color_identity: ["G"],
      prices: { usd: "1.25" },
      released_at: "2026-01-01",
      set_name: "Test Set",
    },
    {
      id: "id-third",
      oracle_id: "oracle-third",
      name: "Third Commander",
      type_line: "Legendary Creature — Human Wizard",
      oracle_text: "Whenever you cast an instant or sorcery spell, scry 1.",
      color_identity: ["U", "R"],
      prices: { usd: "0.75" },
      released_at: "2025-01-01",
      set_name: "Test Set",
    },
  ],
};

const mockFetch = (async (input: RequestInfo | URL) => {
  const url = String(input);
  if (url.endsWith("commanders/year.json")) {
    return new Response(JSON.stringify(edhrecFirstPage), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (url.includes("year-past2years-1.json")) {
    return new Response(JSON.stringify(edhrecSecondPage), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (url.includes("cards/collection")) {
    return new Response(JSON.stringify(scryfallPayload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response("{}", { status: 404 });
}) as typeof fetch;

const liveCatalog = await buildLiveCatalog({
  seed: [curatedKrenko],
  pages: 2,
  fetchImpl: mockFetch,
  generatedAt: "2026-10-24T12:00:00.000Z",
});
assert.equal(liveCatalog.commanders.length, 3);
assert.equal(liveCatalog.meta.total, 3);
assert.equal(liveCatalog.meta.curated, 1);
assert.equal(liveCatalog.meta.generated, 2);
assert.equal(liveCatalog.meta.popularityDate, "2026-10-24");
const refreshedKrenko = liveCatalog.commanders.find(
  (commander) => commander.name === "Krenko, Mob Boss",
);
assert.equal(refreshedKrenko?.dataQuality, "curated");
assert.equal(refreshedKrenko?.tagline, curatedKrenko.tagline);
assert.equal(refreshedKrenko?.deckCount, 44000);
const generatedCommander = liveCatalog.commanders.find(
  (commander) => commander.name === "Test Commander",
);
assert.equal(generatedCommander?.dataQuality, "generated");
assert.deepEqual(generatedCommander?.colors, ["G"]);
assert.ok((generatedCommander?.arch.tokens ?? 0) > 0);
assert.ok((generatedCommander?.arch.graveyard ?? 0) > 0);
assert.equal(generatedCommander?.priceUsd, 1.25);
assert.ok(generatedCommander?.bracketEstimate);


// Ten EDHREC pages produce a complete top-1,000 catalog.
const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

const makeRankingRow = (rank: number) => ({
  id: `id-${rank}`,
  name: `Commander ${rank}`,
  sanitized: `commander-${rank}`,
  url: `/commanders/commander-${rank}`,
  num_decks: 10000 - rank,
  rank,
  trend_zscore: 0,
});

const makeRankingPage = (page: number) => {
  const start = page * 100 + 1;
  const cardviews = Array.from({ length: 100 }, (_, offset) =>
    makeRankingRow(start + offset),
  );
  if (page === 0) {
    return {
      container: {
        json_dict: {
          cardlists: [
            {
              cardviews,
              more: "commanders/year-past2years-1.json",
            },
          ],
        },
      },
    };
  }
  return {
    cardviews,
    ...(page < 9
      ? { more: `commanders/year-past2years-${page + 1}.json` }
      : {}),
  };
};

const thousandFetch = (async (
  input: RequestInfo | URL,
  init?: RequestInit,
) => {
  const url = String(input);
  if (url.endsWith("commanders/year.json")) {
    return jsonResponse(makeRankingPage(0));
  }
  const pageMatch = url.match(/year-past2years-(\d+)\.json/);
  if (pageMatch) {
    return jsonResponse(makeRankingPage(Number(pageMatch[1])));
  }
  if (url.includes("cards/collection")) {
    const body = JSON.parse(String(init?.body ?? "{}")) as {
      identifiers?: Array<{ id?: string; name?: string }>;
    };
    const data = (body.identifiers ?? []).map((identifier) => {
      const id = identifier.id ?? identifier.name ?? "unknown";
      const rank = Number(id.replace("id-", "")) || 1;
      return {
        id,
        oracle_id: `oracle-${rank}`,
        name: `Commander ${rank}`,
        type_line: "Legendary Creature — Elf Druid",
        oracle_text:
          "Create a 1/1 green Elf Warrior creature token. Whenever a creature dies, draw a card.",
        color_identity: ["G"],
        prices: { usd: "0.50" },
        released_at: "2026-01-01",
        set_name: "Test Set",
      };
    });
    return jsonResponse({ data });
  }
  return new Response("{}", { status: 404 });
}) as typeof fetch;

const thousandCatalog = await buildLiveCatalog({
  seed: [],
  pages: 10,
  fetchImpl: thousandFetch,
  generatedAt: "2026-10-24T12:00:00.000Z",
});
assert.equal(thousandCatalog.commanders.length, 1000);
assert.equal(thousandCatalog.meta.total, 1000);
assert.equal(thousandCatalog.meta.generated, 1000);
assert.equal(thousandCatalog.commanders[0].rank, 1);
assert.equal(thousandCatalog.commanders.at(-1)?.rank, 1000);
assert.ok(thousandCatalog.commanders.every((cmd) => cmd.colors.length > 0));
assert.ok(thousandCatalog.commanders.every((cmd) => Boolean(cmd.scryfallId)));


// Partner/background rows union color identities from both halves.
const partnerPage = {
  container: {
    json_dict: {
      cardlists: [
        {
          cardviews: [
            {
              id: "id-pair",
              name: "Partner A // Partner B",
              sanitized: "partner-a-partner-b",
              url: "/commanders/partner-a-partner-b",
              num_decks: 1000,
              rank: 1,
              trend_zscore: 0,
              cards: [
                { name: "Partner A", url: "partner-a" },
                { name: "Partner B", url: "partner-b" },
              ],
              is_partner: true,
            },
          ],
        },
      ],
    },
  },
};
const partnerScryfallCards = [
  {
    id: "id-pair",
    oracle_id: "oracle-pair",
    name: "Partner A // Partner B",
    type_line:
      "Legendary Creature — Human // Legendary Enchantment — Background",
    oracle_text: "Choose a Background. Whenever you cast an instant spell, scry 1.",
    color_identity: [],
    prices: { usd: "1.00" },
    released_at: "2026-01-01",
    set_name: "Test Set",
  },
  {
    id: "id-a",
    oracle_id: "oracle-a",
    name: "Partner A",
    type_line: "Legendary Creature — Human Soldier",
    oracle_text: "Whenever you attack, create a 1/1 white Soldier creature token.",
    color_identity: ["W"],
    prices: { usd: "0.50" },
    released_at: "2026-01-01",
    set_name: "Test Set",
  },
  {
    id: "id-b",
    oracle_id: "oracle-b",
    name: "Partner B",
    type_line: "Legendary Enchantment — Background",
    oracle_text: "Commander creatures you own have ward {1}.",
    color_identity: ["U"],
    prices: { usd: "0.75" },
    released_at: "2026-01-01",
    set_name: "Test Set",
  },
];
let partnerIdentifiers: Array<Record<string, string>> = [];
const partnerFetch = (async (
  input: RequestInfo | URL,
  init?: RequestInit,
) => {
  const url = String(input);
  if (url.endsWith("commanders/year.json")) {
    return jsonResponse(partnerPage);
  }
  if (url.includes("cards/collection")) {
    const body = JSON.parse(String(init?.body ?? "{}")) as {
      identifiers?: Array<Record<string, string>>;
    };
    partnerIdentifiers.push(...(body.identifiers ?? []));
    return jsonResponse({ data: partnerScryfallCards });
  }
  return new Response("{}", { status: 404 });
}) as typeof fetch;

const partnerCatalog = await buildLiveCatalog({
  seed: [],
  pages: 1,
  fetchImpl: partnerFetch,
  generatedAt: "2026-10-24T12:00:00.000Z",
});
assert.equal(partnerCatalog.commanders.length, 1);
assert.deepEqual(partnerCatalog.commanders[0].colors, ["W", "U"]);
assert.equal(partnerCatalog.commanders[0].partner, true);
assert.ok(
  partnerIdentifiers.some(
    (identifier) =>
      "name" in identifier && identifier.name === "Partner A",
  ),
);
assert.ok(
  partnerIdentifiers.some(
    (identifier) =>
      "name" in identifier && identifier.name === "Partner B",
  ),
);


// Question v2: balanced coverage, deterministic adaptive decks, and clamped
// negative dealbreaker weights.
assert.equal(CORE_QUESTIONS.length, 8);
assert.equal(CONSTRAINT_QUESTIONS.length, 4);
assert.equal(STRATEGY_QUESTIONS.length, 4);
assert.equal(ADAPTIVE_QUESTIONS.length, 8);
assert.equal(FULL_QUIZ_LENGTH, 18);
assert.equal(QUICK_QUIZ_LENGTH, 13);
assert.equal(new Set(QUESTIONS.map((question) => question.id)).size, QUESTIONS.length);
assert.equal(encodingDeckFor("full").length, QUESTIONS.length);
assert.equal(
  encodingDeckFor("quick").length,
  CORE_QUESTIONS.length + CONSTRAINT_QUESTIONS.length + ADAPTIVE_QUESTIONS.length,
);

for (const arch of ARCHES) {
  const total = QUESTIONS.reduce(
    (sum, question) =>
      sum +
      question.options.reduce(
        (optionSum, option) =>
          optionSum + Math.max(0, option.w?.[arch] ?? 0),
        0,
      ),
    0,
  );
  assert.ok(total >= 10, `${arch} has only ${total} total positive weight`);
}
const colorTotals = COLORS.map((color) =>
  QUESTIONS.reduce(
    (sum, question) =>
      sum +
      question.options.reduce(
        (optionSum, option) =>
          optionSum + Math.max(0, option.w?.[color] ?? 0),
        0,
      ),
    0,
  ),
);
assert.ok(Math.max(...colorTotals) - Math.min(...colorTotals) <= 15);

const dealbreakerOption = QUESTIONS.find(
  (question) => question.id === "dealbreaker",
)!.options.find((option) => option.id === "no_lockdown")!;
const clampedProfile = buildProfile([dealbreakerOption]);
assert.equal(clampedProfile.arch.stax, 0);
assert.ok(clampedProfile.arch.politics > 0);

const spellProfile = buildProfile([
  {
    id: "synthetic-spells",
    label: "Spells",
    emoji: "✨",
    w: { spells: 8, artifacts: 5, counters: 2 },
  },
] satisfies Option[]);
const adaptiveQuestions = selectAdaptiveQuestions(spellProfile, 2);
assert.equal(adaptiveQuestions.length, 2);
assert.ok(
  adaptiveQuestions.some(
    (question) =>
      question.targets?.includes("spells") ||
      question.targets?.includes("artifacts"),
  ),
);
const activeFullDeck = buildActiveDeck("full", {}, ["tie_spells", "tie_scale"]);
assert.equal(activeFullDeck.length, FULL_QUIZ_LENGTH);
assert.ok(activeFullDeck.slice(-2).some((question) => question.id === "tie_spells"));
assert.ok(activeFullDeck.slice(-2).some((question) => question.id === "tie_scale"));

// Improved generated-entry inference picks up spells, counters and type lines.
const spellInference = inferArch(
  "Whenever you cast an instant or sorcery spell, copy it. Prowess.",
  "Legendary Creature — Human Wizard",
  ["Prowess"],
  ["U", "R"],
  3,
);
assert.ok((spellInference.spells ?? 0) > 0);
const counterInference = inferArch(
  "Whenever a +1/+1 counter is put on a creature you control, proliferate. Partner.",
  "Legendary Creature — Elf Warrior",
  ["Partner"],
  ["G", "W"],
  3,
);
assert.ok((counterInference.counters ?? 0) > 0);
assert.ok((counterInference.kindred ?? 0) > 0);
const genericInference = inferArch(
  "Draw a card.",
  "Legendary Creature — Human Warrior",
  [],
  ["W"],
  3,
);
assert.equal(genericInference.kindred ?? 0, 0);
assert.ok((genericInference.value ?? 0) > 0);

console.log("Smoke tests passed");
