export type ColorKey = "W" | "U" | "B" | "R" | "G";

export type ArchKey =
  | "aggro"
  | "control"
  | "combo"
  | "value"
  | "politics"
  | "chaos"
  | "kindred"
  | "voltron"
  | "tokens"
  | "graveyard"
  | "artifacts"
  | "spells"
  | "lands"
  | "counters"
  | "sacrifice"
  | "lifegain"
  | "stax"
  | "theft"
  | "bigstuff"
  | "enchant";

export type Franchise =
  | "ff"
  | "lotr"
  | "avatar"
  | "fallout"
  | "marvel"
  | "40k"
  | "mtg";

export type Weights = Partial<Record<ColorKey | ArchKey, number>>;
export type BudgetLevel = 1 | 2 | 3;
export type ComplexityLevel = 1 | 2 | 3 | 4 | 5;
export type BracketEstimate = 1 | 2 | 3 | 4;
export type DataQuality = "curated" | "generated";

export interface Option {
  id: string;
  label: string;
  emoji: string;
  /** color + archetype weights */
  w?: Weights;
  /** preferred rules complexity, 1 (simple) – 5 (intricate) */
  cx?: number;
  /** budget tolerance: 1 = cheap, 2 = mid, 3 = anything */
  bg?: BudgetLevel;
  /** favourite franchise */
  fr?: Franchise;
}

export interface Question {
  id: string;
  prompt: string;
  hint?: string;
  /** asked in the short "quick reading" too */
  core?: boolean;
  options: Option[];
}

export interface Commander {
  name: string;
  rank: number;
  colors: ColorKey[];
  arch: Partial<Record<ArchKey, number>>;
  tagline: string;
  blurb: string;
  plan: string;
  youAre: string;
  media: string[];
  franchise?: Franchise;
  difficulty: ComplexityLevel;
  budget: "$" | "$$" | "$$$";
  tags: string[];

  // Catalog metadata. Optional so the curated seed stays valid.
  dataQuality?: DataQuality;
  edhrecSlug?: string;
  scryfallId?: string;
  oracleId?: string;
  oracleText?: string;
  typeLine?: string;
  releasedAt?: string;
  priceUsd?: number | null;
  deckCount?: number;
  trend?: number | null;
  salt?: number | null;
  bracketEstimate?: BracketEstimate;
  bracketCounts?: Partial<Record<"1" | "2" | "3" | "4" | "5", number>>;
  partner?: boolean;
  background?: boolean;
}

export type CatalogStatus = "seed" | "cached" | "loading" | "live" | "error";

export interface CatalogMeta {
  schema: number;
  generatedAt: string;
  popularityDate: string;
  window: string;
  sources: string[];
  total: number;
  curated: number;
  generated: number;
  status: CatalogStatus | "offline";
  note?: string;
}

export interface CommanderCatalog {
  meta: CatalogMeta;
  commanders: Commander[];
}

/** Hard/soft constraints set by the user after seeing a reading. */
export interface Preferences {
  mustHaveArches: ArchKey[];
  avoidArches: ArchKey[];
  mustHaveColors: ColorKey[];
  avoidColors: ColorKey[];
  maxBudget?: BudgetLevel;
  maxComplexity?: ComplexityLevel;
}

export const DEFAULT_PREFERENCES: Preferences = {
  mustHaveArches: [],
  avoidArches: [],
  mustHaveColors: [],
  avoidColors: [],
  maxBudget: undefined,
  maxComplexity: undefined,
};

export interface MatchPenalty {
  label: string;
  amount: number;
}

/** Component scores are 0–100; penalty amounts are raw score points. */
export interface MatchBreakdown {
  colors: number;
  strategy: number;
  complexity: number;
  budget: number;
  affinity: number;
  penalties: MatchPenalty[];
  violations: string[];
  rawScore: number;
  confidence: number;
  answerCount: number;
  questionCount: number;
}

export interface ScoredCommander {
  commander: Commander;
  score: number;
  match: number;
  reasons: string[];
  breakdown: MatchBreakdown;
  eligible: boolean;
}
