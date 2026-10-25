import type { Commander, CommanderCatalog } from "../types";
import catalogJson from "./commanders.catalog.json";
import seedJson from "./commanders.seed.json";

/**
 * The curated top-100 annotations are the offline seed. The catalog is
 * refreshed from EDHREC + Scryfall by `npm run data:refresh` and can also be
 * expanded live in the browser.
 */
export const CURATED_COMMANDERS = seedJson as unknown as Commander[];

export const INITIAL_CATALOG = catalogJson as unknown as CommanderCatalog;

export const COMMANDERS: Commander[] = INITIAL_CATALOG.commanders.length
  ? INITIAL_CATALOG.commanders
  : CURATED_COMMANDERS;

export const INITIAL_CATALOG_META = INITIAL_CATALOG.meta;
