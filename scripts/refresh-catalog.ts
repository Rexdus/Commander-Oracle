import { readFile, writeFile } from "node:fs/promises";
import type { Commander } from "../src/types.ts";
import { buildLiveCatalog } from "../src/lib/catalog.ts";

const seedPath = new URL("../src/data/commanders.seed.json", import.meta.url);
const outputPath = new URL(
  "../src/data/commanders.catalog.json",
  import.meta.url,
);

async function main(): Promise<void> {
  const seed = JSON.parse(await readFile(seedPath, "utf8")) as Commander[];
  const pages = Math.max(
    1,
    Math.min(10, Number.parseInt(process.env.CATALOG_PAGES ?? "5", 10) || 5),
  );

  const result = await buildLiveCatalog({
    seed,
    pages,
    userAgent:
      "Commander-Oracle/1.0 (https://github.com/Rexdus/Commander-Oracle; data refresh)",
  });

  if (result.commanders.length < 100) {
    throw new Error(
      `Refusing to write a catalog with only ${result.commanders.length} commanders`,
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
