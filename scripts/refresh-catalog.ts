import { readFile, writeFile } from "node:fs/promises";
import type { Commander } from "../src/types.ts";
import {
  buildLiveCatalog,
  DEFAULT_CATALOG_PAGES,
  MAX_CATALOG_PAGES,
} from "../src/lib/catalog.ts";

const seedPath = new URL("../src/data/commanders.seed.json", import.meta.url);
const outputPath = new URL(
  "../src/data/commanders.catalog.json",
  import.meta.url,
);

async function main(): Promise<void> {
  const seed = JSON.parse(await readFile(seedPath, "utf8")) as Commander[];
  const requestedPages = Number.parseInt(
    process.env.CATALOG_PAGES ?? String(DEFAULT_CATALOG_PAGES),
    10,
  );
  const pages = Math.max(
    1,
    Math.min(
      MAX_CATALOG_PAGES,
      Number.isFinite(requestedPages)
        ? requestedPages
        : DEFAULT_CATALOG_PAGES,
    ),
  );

  const result = await buildLiveCatalog({
    seed,
    pages,
    userAgent:
      "Commander-Oracle/1.0 (https://github.com/Rexdus/Commander-Oracle; data refresh)",
  });

  const minimum = Math.max(100, Math.floor(pages * 100 * 0.99));
  if (result.commanders.length < minimum) {
    throw new Error(
      `Refusing to write a partial catalog: expected at least ${minimum} commanders, got ${result.commanders.length}`,
    );
  }

  await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  console.log(
    `Wrote ${result.commanders.length} commanders (${result.meta.curated} curated, ${result.meta.generated} generated) from ${pages} EDHREC page(s).`,
  );
  console.log(`Popularity snapshot: ${result.meta.popularityDate}`);
}

main().catch((error: unknown) => {
  console.error(
    "Catalog refresh failed:",
    error instanceof Error ? error.message : error,
  );
  process.exitCode = 1;
});
