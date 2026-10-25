import type {
  ArchKey,
  BracketEstimate,
  CatalogMeta,
  ColorKey,
  Commander,
  CommanderCatalog,
  ComplexityLevel,
  Franchise,
} from "../types";
import { ARCH_META, guildName } from "./scoring";

const EDHREC_PAGES_BASE = "https://json.edhrec.com/pages/";
const SCRYFALL_COLLECTION_URL = "https://api.scryfall.com/cards/collection";
const COLOR_ORDER: ColorKey[] = ["W", "U", "B", "R", "G"];
const SCRYFALL_BATCH_SIZE = 75;
const DEFAULT_PAGES = 3;

type FetchLike = typeof fetch;

interface EdhrecCardRef {
  name?: string;
  url?: string;
}

interface EdhrecRow {
  id?: string;
  name: string;
  sanitized?: string;
  slug?: string;
  url?: string;
  num_decks?: number;
  rank?: number;
  trend_zscore?: number | null;
  cards?: EdhrecCardRef[];
  names?: string[];
  is_partner?: boolean;
}

interface EdhrecPage {
  cardviews?: EdhrecRow[];
  more?: string;
  container?: {
    json_dict?: {
      cardlists?: Array<{
        cardviews?: EdhrecRow[];
        more?: string;
      }>;
    };
  };
}

interface ScryfallFace {
  name?: string;
  type_line?: string;
  oracle_text?: string;
  color_identity?: string[];
}

interface ScryfallCard {
  id?: string;
  oracle_id?: string;
  name?: string;
  type_line?: string;
  oracle_text?: string;
  color_identity?: string[];
  card_faces?: ScryfallFace[];
  legalities?: Record<string, string>;
  prices?: Record<string, string | null>;
  released_at?: string;
  set_name?: string;
  keywords?: string[];
}

interface ScryfallCollectionResponse {
  data?: ScryfallCard[];
  not_found?: Array<Record<string, string>>;
}

type Identifier = { id: string } | { name: string };

interface ScryfallLookup {
  byId: Map<string, ScryfallCard>;
  byName: Map<string, ScryfallCard>;
}

export interface BuildCatalogOptions {
  seed: Commander[];
  pages?: number;
  signal?: AbortSignal;
  fetchImpl?: FetchLike;
  userAgent?: string;
  generatedAt?: string;
  status?: CatalogMeta["status"];
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function edhrecSlug(name: string): string {
  const front = name.split("//")[0];
  return front
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’.,:!?"()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function baseHeaders(userAgent?: string): Record<string, string> {
  const headers: Record<string, string> = { Accept: "application/json" };
  // Browsers forbid setting User-Agent; only the Node refresh script passes it.
  if (userAgent) headers["User-Agent"] = userAgent;
  return headers;
}

async function fetchJson<T>(
  url: string,
  init: RequestInit | undefined,
  fetchImpl: FetchLike,
  userAgent?: string,
): Promise<T> {
  const response = await fetchImpl(url, {
    ...init,
    headers: { ...baseHeaders(userAgent), ...(init?.headers as Record<string, string>) },
  });
  if (!response.ok) {
    throw new Error(`${new URL(url).hostname} returned ${response.status}`);
  }
  return (await response.json()) as T;
}

function extractEdhrecPage(payload: EdhrecPage): {
  rows: EdhrecRow[];
  more?: string;
} {
  const firstList = payload.container?.json_dict?.cardlists?.[0];
  const rows = payload.cardviews ?? firstList?.cardviews ?? [];
  const more = payload.more ?? firstList?.more;
  return { rows, more };
}

async function fetchEdhrecRows(
  pages: number,
  options: BuildCatalogOptions,
): Promise<EdhrecRow[]> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const rows: EdhrecRow[] = [];
  const seen = new Set<string>();
  let path = "commanders/year.json";
  let rankFallback = 1;

  for (let pageIndex = 0; pageIndex < pages; pageIndex += 1) {
    const payload = await fetchJson<EdhrecPage>(
      `${EDHREC_PAGES_BASE}${path}`,
      { signal: options.signal },
      fetchImpl,
      options.userAgent,
    );
    const extracted = extractEdhrecPage(payload);
    if (extracted.rows.length === 0) break;

    for (const row of extracted.rows) {
      const key = normalizeName(row.name);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      rows.push({ ...row, rank: row.rank ?? rankFallback });
      rankFallback += 1;
    }

    if (!extracted.more || pageIndex === pages - 1) break;
    path = extracted.more.replace(/^\/+/, "");
  }

  if (rows.length === 0) throw new Error("EDHREC returned no commanders");
  return rows;
}

function rowNames(row: EdhrecRow): string[] {
  const front = row.name.split("//")[0].trim();
  if (row.cards?.length) {
    return row.cards
      .map((card) => card.name?.trim())
      .filter((name): name is string => Boolean(name));
  }
  return [front];
}

function buildIdentifiers(rows: EdhrecRow[]): Identifier[] {
  const identifiers: Identifier[] = [];
  const seen = new Set<string>();

  for (const row of rows) {
    if (row.id) {
      const key = `id:${row.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        identifiers.push({ id: row.id });
      }
      continue;
    }
    for (const name of rowNames(row)) {
      const key = `name:${normalizeName(name)}`;
      if (!seen.has(key)) {
        seen.add(key);
        identifiers.push({ name });
      }
    }
  }

  return identifiers;
}

async function fetchScryfallCards(
  rows: EdhrecRow[],
  options: BuildCatalogOptions,
): Promise<ScryfallLookup> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const identifiers = buildIdentifiers(rows);
  const cards: ScryfallCard[] = [];

  for (let i = 0; i < identifiers.length; i += SCRYFALL_BATCH_SIZE) {
    const batch = identifiers.slice(i, i + SCRYFALL_BATCH_SIZE);
    const payload = await fetchJson<ScryfallCollectionResponse>(
      SCRYFALL_COLLECTION_URL,
      {
        method: "POST",
        body: JSON.stringify({ identifiers: batch }),
        signal: options.signal,
        headers: { "Content-Type": "application/json" },
      },
      fetchImpl,
      options.userAgent,
    );
    cards.push(...(payload.data ?? []));
  }

  const byId = new Map<string, ScryfallCard>();
  const byName = new Map<string, ScryfallCard>();
  const register = (card: ScryfallCard, name?: string) => {
    if (card.id) byId.set(card.id, card);
    if (card.oracle_id) byId.set(card.oracle_id, card);
    if (name) byName.set(normalizeName(name), card);
  };

  for (const card of cards) {
    register(card, card.name);
    for (const face of card.card_faces ?? []) {
      register(card, face.name);
    }
  }

  return { byId, byName };
}

function cardsForRow(row: EdhrecRow, lookup: ScryfallLookup): ScryfallCard[] {
  const found: ScryfallCard[] = [];
  const seen = new Set<string>();
  const add = (card?: ScryfallCard) => {
    if (!card || seen.has(card.id ?? card.name ?? "")) return;
    seen.add(card.id ?? card.name ?? "");
    found.push(card);
  };

  if (row.id) add(lookup.byId.get(row.id));
  const oracleId = row.id && !lookup.byId.has(row.id) ? row.id : undefined;
  if (oracleId) add(lookup.byId.get(oracleId));

  for (const name of rowNames(row)) {
    add(lookup.byName.get(normalizeName(name)));
  }

  return found;
}

function colorIdentity(cards: ScryfallCard[], curated?: Commander): ColorKey[] {
  if (curated?.colors?.length) return curated.colors;
  const set = new Set<ColorKey>();
  for (const card of cards) {
    const identities = [
      ...(card.color_identity ?? []),
      ...(card.card_faces ?? []).flatMap((face) => face.color_identity ?? []),
    ];
    for (const color of identities) {
      const upper = color.toUpperCase() as ColorKey;
      if (COLOR_ORDER.includes(upper)) set.add(upper);
    }
  }
  return COLOR_ORDER.filter((color) => set.has(color));
}

function oracleText(cards: ScryfallCard[]): string {
  return cards
    .flatMap((card) => [
      card.oracle_text ?? "",
      ...(card.card_faces ?? []).map((face) => face.oracle_text ?? ""),
    ])
    .filter(Boolean)
    .join("\n")
    .trim();
}

function typeLine(cards: ScryfallCard[]): string {
  return cards
    .flatMap((card) => [
      card.type_line ?? "",
      ...(card.card_faces ?? []).map((face) => face.type_line ?? ""),
    ])
    .filter(Boolean)
    .join(" // ");
}

function priceUsd(cards: ScryfallCard[]): number | null {
  for (const card of cards) {
    const raw = card.prices?.usd ?? card.prices?.usd_foil ?? null;
    if (raw) {
      const value = Number.parseFloat(raw);
      if (Number.isFinite(value)) return value;
    }
  }
  return null;
}

function franchiseFromSet(cards: ScryfallCard[]): Franchise | undefined {
  const names = cards
    .map((card) => card.set_name ?? "")
    .join(" ")
    .toLowerCase();
  if (/final fantasy/.test(names)) return "ff";
  if (/lord of the rings|middle-earth/.test(names)) return "lotr";
  if (/avatar/.test(names)) return "avatar";
  if (/fallout/.test(names)) return "fallout";
  if (/marvel|spider-man/.test(names)) return "marvel";
  if (/warhammer|40,000|40000/.test(names)) return "40k";
  return undefined;
}

function inferArch(
  text: string,
  types: string,
  keywords: string[],
): Partial<Record<ArchKey, number>> {
  const value = `${text}\n${types}\n${keywords.join(" ")}`.toLowerCase();
  const arch: Partial<Record<ArchKey, number>> = {};
  const add = (key: ArchKey, amount: number) => {
    arch[key] = Math.max(arch[key] ?? 0, amount);
  };
  const has = (pattern: RegExp) => pattern.test(value);

  if (has(/token|create .*creature|populate/)) add("tokens", 3);
  if (has(/graveyard|dies|death|return .*from your graveyard|flashback|reanimate/))
    add("graveyard", 3);
  if (has(/sacrifice/)) add("sacrifice", 3);
  if (has(/\+1\/\+1 counter|\-1\/\-1 counter|proliferate|loyalty counter|counter on/))
    add("counters", 3);
  if (has(/landfall|search your library for a land|lands you control|add \{[wubrg]\}/))
    add("lands", 3);
  if (has(/artifact|treasure|clue|food|equipment|vehicle/)) add("artifacts", 3);
  if (has(/instant or sorcery|noncreature spell|magecraft|copy target instant|copy target sorcery/))
    add("spells", 3);
  if (has(/enchantment|constellation|aura/)) add("enchant", 3);
  if (has(/gain life|lifelink/)) add("lifegain", 3);
  if (has(/equipment|aura|attach|commander creature/)) add("voltron", 2);
  if (has(/counter target spell|prevent damage|hexproof|ward|can't attack|opponents can't/))
    add("control", 3);
  if (has(/players can't|opponents can't|can't untap|can't cast|tax/)) add("stax", 3);
  if (has(/gain control|steal|exile .*from an opponent|play .*from their graveyard/))
    add("theft", 3);
  if (has(/coin flip|random|roll (a |the )?d|die|chaos/)) add("chaos", 3);
  if (has(/untap|infinite|storm|copy|combo/)) add("combo", 2);
  if (has(/draw (a|cards)|whenever .* enters|card advantage/)) add("value", 2);
  if (has(/haste|attack|combat damage|menace|trample/)) add("aggro", 2);
  if (has(/each player|choose a player|monarch|goad|opponent/)) add("politics", 2);
  if (
    has(
      /dragon|dinosaur|elf|goblin|zombie|vampire|merfolk|sliver|angel|beast|bird|cat|dog|rat|squirrel|human|warrior|wizard|creatures you control/,
    )
  )
    add("kindred", 3);
  if (has(/power (4|5|6|7) or greater|mana value (6|7|8)|largest|colossal/))
    add("bigstuff", 3);
  if (/planeswalker/.test(types.toLowerCase())) {
    add("control", 2);
    add("value", 2);
  }

  if (Object.keys(arch).length === 0) {
    add("value", 2);
    add("kindred", 1);
  }

  // Keep generated vectors focused; too many tiny axes flatten the cosine fit.
  return Object.fromEntries(
    Object.entries(arch)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5),
  ) as Partial<Record<ArchKey, number>>;
}

function inferDifficulty(
  text: string,
  colors: ColorKey[],
  arch: Partial<Record<ArchKey, number>>,
): ComplexityLevel {
  let difficulty = 2;
  if (text.length > 360) difficulty += 1;
  if (colors.length >= 4) difficulty += 1;
  if ((arch.combo ?? 0) >= 2 || (arch.stax ?? 0) >= 2 || (arch.control ?? 0) >= 3)
    difficulty += 1;
  return Math.max(1, Math.min(5, difficulty)) as ComplexityLevel;
}

function inferBudget(
  price: number | null,
  colors: ColorKey[],
  rank: number,
): Commander["budget"] {
  if ((price ?? 0) > 20 || colors.length >= 5 || rank <= 25) return "$$$";
  if ((price ?? 0) > 5 || colors.length >= 3 || rank <= 100) return "$$";
  return "$";
}

function inferBracket(
  price: number | null,
  colors: ColorKey[],
  arch: Partial<Record<ArchKey, number>>,
): BracketEstimate {
  const highPower =
    (arch.combo ?? 0) + (arch.stax ?? 0) + (arch.control ?? 0) + (arch.theft ?? 0);
  if (highPower >= 7 || (price ?? 0) > 40) return 4;
  if (highPower >= 4 || (price ?? 0) > 15 || colors.length >= 4) return 3;
  return 2;
}

function firstSentence(text: string): string {
  const sentence = text.split(/[.!?]\s+/)[0]?.trim();
  return sentence && sentence.length > 20 ? sentence : "";
}

function creatureTags(types: string): string[] {
  const parts = types.split("—")[1]?.trim();
  if (!parts) return [];
  return parts
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .slice(0, 4)
    .map((word) => word.replace(/\b\w/g, (letter) => letter.toUpperCase()));
}

function topArchKeys(arch: Partial<Record<ArchKey, number>>): ArchKey[] {
  return (Object.entries(arch) as Array<[ArchKey, number]>)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([key]) => key);
}

function generatedCopy(
  colors: ColorKey[],
  arch: Partial<Record<ArchKey, number>>,
  text: string,
  types: string,
): Pick<Commander, "tagline" | "blurb" | "plan" | "youAre" | "media" | "tags"> {
  const keys = topArchKeys(arch);
  const primary = keys[0] ?? "value";
  const primaryName = ARCH_META[primary].name.replace("The ", "");
  const identity = guildName(colors);
  const sentence = firstSentence(text.replace(/\n/g, " "));
  const tags = Array.from(
    new Set([
      ...keys.map((key) => ARCH_META[key].name.replace("The ", "")),
      ...creatureTags(types),
    ]),
  );

  return {
    tagline: `${primaryName} energy in ${identity}`,
    blurb: sentence
      ? `${sentence}. Strategy labels are inferred from card text and current EDHREC popularity.`
      : `A ${identity} commander whose strategy labels are inferred from card text and current EDHREC popularity. Treat them as a starting point for exploration.`,
    plan: ARCH_META[primary].desc.split(".")[0] + ".",
    youAre: `Curious about ${primaryName.toLowerCase()} plans and comfortable with a ${identity.toLowerCase()} mana base.`,
    media: [],
    tags: tags.length > 0 ? tags : [primaryName, identity],
  };
}

function buildCommander(
  row: EdhrecRow,
  rank: number,
  cards: ScryfallCard[],
  curated: Commander | undefined,
  seedBySlug: Map<string, Commander>,
  seedByName: Map<string, Commander>,
): Commander {
  const rowSlug = row.sanitized ?? row.slug ?? edhrecSlug(row.name);
  const foundCurated =
    curated ??
    seedBySlug.get(rowSlug) ??
    seedBySlug.get(edhrecSlug(row.name)) ??
    seedByName.get(normalizeName(row.name));
  const colors = colorIdentity(cards, foundCurated);
  const text = foundCurated ? "" : oracleText(cards);
  const types = typeLine(cards);
  const keywords = cards.flatMap((card) => card.keywords ?? []);
  const generatedArch = foundCurated ? foundCurated.arch : inferArch(text, types, keywords);
  const price = priceUsd(cards);
  const inferredDifficulty = foundCurated
    ? foundCurated.difficulty
    : inferDifficulty(text, colors, generatedArch);
  const inferredBudget = foundCurated
    ? foundCurated.budget
    : inferBudget(price, colors, rank);
  const copy = foundCurated
    ? {
        tagline: foundCurated.tagline,
        blurb: foundCurated.blurb,
        plan: foundCurated.plan,
        youAre: foundCurated.youAre,
        media: foundCurated.media,
        tags: foundCurated.tags,
      }
    : generatedCopy(colors, generatedArch, text, types);
  const primaryCard = cards[0];
  const partner = Boolean(
    row.is_partner ||
      row.name.includes("//") ||
      /partner|choose a background|background/.test(text.toLowerCase()),
  );

  return {
    ...foundCurated,
    name: foundCurated?.name ?? row.name,
    rank,
    colors,
    arch: generatedArch,
    ...copy,
    franchise: foundCurated?.franchise ?? franchiseFromSet(cards),
    difficulty: inferredDifficulty,
    budget: inferredBudget,
    dataQuality: foundCurated ? "curated" : "generated",
    edhrecSlug: rowSlug,
    scryfallId: primaryCard?.id ?? foundCurated?.scryfallId,
    oracleId: primaryCard?.oracle_id ?? foundCurated?.oracleId,
    oracleText: text || foundCurated?.oracleText,
    typeLine: types || foundCurated?.typeLine,
    releasedAt: primaryCard?.released_at ?? foundCurated?.releasedAt,
    priceUsd: price ?? foundCurated?.priceUsd ?? null,
    deckCount: row.num_decks ?? foundCurated?.deckCount,
    trend: row.trend_zscore ?? foundCurated?.trend ?? null,
    bracketEstimate:
      foundCurated?.bracketEstimate ?? inferBracket(price, colors, generatedArch),
    partner: partner || foundCurated?.partner,
    background: /choose a background|background/.test(text.toLowerCase()),
  };
}

export async function buildLiveCatalog(
  options: BuildCatalogOptions,
): Promise<CommanderCatalog> {
  const pages = Math.max(1, Math.min(options.pages ?? DEFAULT_PAGES, 10));
  const rows = await fetchEdhrecRows(pages, options);
  const lookup = await fetchScryfallCards(rows, options);
  const generatedAt = options.generatedAt ?? new Date().toISOString();

  const seedBySlug = new Map<string, Commander>();
  const seedByName = new Map<string, Commander>();
  for (const commander of options.seed) {
    seedBySlug.set(edhrecSlug(commander.name), commander);
    seedByName.set(normalizeName(commander.name), commander);
  }

  const commanders = rows.map((row, index) =>
    buildCommander(
      row,
      row.rank ?? index + 1,
      cardsForRow(row, lookup),
      undefined,
      seedBySlug,
      seedByName,
    ),
  );

  const curated = commanders.filter((cmd) => cmd.dataQuality === "curated").length;
  const meta: CatalogMeta = {
    schema: 1,
    generatedAt,
    popularityDate: generatedAt.slice(0, 10),
    window: "EDHREC top commanders · past 2 years",
    sources: ["EDHREC public ranking JSON", "Scryfall card collection API"],
    total: commanders.length,
    curated,
    generated: commanders.length - curated,
    status: options.status ?? "live",
    note:
      "Generated entries infer strategy, complexity, budget and bracket from card text, price and popularity. Curated top-100 annotations are preserved.",
  };

  return { meta, commanders };
}

export function budgetDecklistUrl(name: string): string {
  return `https://moxfield.com/decks/public?q=${encodeURIComponent(`"${name}" budget`)}`;
}

export function archidektDecklistUrl(name: string): string {
  return `https://archidekt.com/search/decks?q=${encodeURIComponent(name)}`;
}

export function edhrecCommanderUrl(commander: Commander): string {
  const slug =
    commander.edhrecSlug ??
    edhrecSlug(commander.name.split("//")[0].trim());
  return `https://edhrec.com/commanders/${slug}`;
}

export function bracketLabel(bracket?: BracketEstimate): string {
  switch (bracket) {
    case 1:
      return "Bracket 1 · exhibition";
    case 2:
      return "Brackets 1–2 · casual";
    case 3:
      return "Brackets 2–3 · focused";
    case 4:
      return "Brackets 3–4 · high power";
    default:
      return "Not estimated";
  }
}

export function formatPrice(price?: number | null): string {
  if (price === null || price === undefined) return "Unavailable";
  if (price < 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(price < 10 ? 2 : 0)}`;
}
