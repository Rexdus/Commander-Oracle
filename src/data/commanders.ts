import type { Commander } from "../types";
import { PART1 } from "./commanders1";
import { PART2 } from "./commanders2";
import { PART3 } from "./commanders3";

/**
 * The 100 most-built Commander decks on EDHREC (past two years),
 * annotated with playstyle vectors for the quiz engine.
 */
export const COMMANDERS: Commander[] = [...PART1, ...PART2, ...PART3].sort(
  (a, b) => a.rank - b.rank,
);
