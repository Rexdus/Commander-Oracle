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

export interface Option {
  id: string;
  label: string;
  emoji: string;
  /** color + archetype weights */
  w?: Weights;
  /** preferred rules complexity, 1 (simple) – 5 (intricate) */
  cx?: number;
  /** budget tolerance: 1 = cheap, 2 = mid, 3 = anything */
  bg?: 1 | 2 | 3;
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
  difficulty: 1 | 2 | 3 | 4 | 5;
  budget: "$" | "$$" | "$$$";
  tags: string[];
}

export interface ScoredCommander {
  commander: Commander;
  score: number;
  match: number;
  reasons: string[];
}
