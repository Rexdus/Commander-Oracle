import { spawnSync } from "node:child_process";

// GitHub Pages builds have outbound network access, so they can refresh the
// catalog before bundling. Local/offline builds keep the checked-in catalog.
if (process.env.GITHUB_ACTIONS !== "true") {
  console.log("Skipping catalog refresh outside GitHub Actions.");
  process.exit(0);
}

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const result = spawnSync(npm, ["run", "data:refresh"], {
  stdio: "inherit",
  env: {
    ...process.env,
    CATALOG_PAGES: process.env.CATALOG_PAGES || "5",
  },
});

if (result.status !== 0) {
  console.warn("Catalog refresh failed; building with the checked-in catalog.");
}

process.exit(0);
