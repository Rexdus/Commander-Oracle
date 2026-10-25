# Commander-Oracle

A fan-made tool for finding a Magic: The Gathering Commander. Take a playful
personality quiz, or skip it and explore a live commander catalog.

## What it does

- **Two quiz lengths.** A full reading or a quick reading maps taste and
  behavior onto the five colors and 20 playstyle axes.
- **Shareable result links.** Answers and post-quiz preferences are encoded in
  the URL hash, so a result can be reopened, copied or shared with Web Share.
- **Must-haves & dealbreakers.** Require or avoid colors and strategies, and
  cap budget or complexity. Violations are scored transparently rather than
  silently hidden.
- **Honest fit explanations.** Every result has a component breakdown, explicit
  penalties, confidence based on answers completed, and a clear note that fit
  is relative rather than a win-rate prediction.
- **Side-by-side comparison.** Save up to three finalists and compare fit
  components, game plan, complexity, budget, estimated table power, card price,
  EDHREC popularity, and budget decklist links.
- **Feedback loop.** “Not for me” removes a commander and nudges the profile
  away from its dominant styles; favorites nudge toward similar commanders.
  Favorites, skips and preferences persist locally.
- **Fresh, broader data.** The checked-in catalog contains 500 commanders:
  100 curated annotations plus 400 generated entries from EDHREC’s public
  top-commander pages and Scryfall’s card collection API. The app also
  refreshes live in the browser, never shrinking the catalog, and the build
  workflow can commit even more pages.
- **Direct discovery.** Search by name, theme, oracle text, color identity,
  strategy, budget, complexity, franchise and estimated bracket, with quick
  starts for budget, beginner, tribal, spellslinger and crossover decks.
- **Next-step links.** Every card links to Scryfall, EDHREC and a budget deck
  search on Moxfield.

## Run locally

```sh
npm ci
npm run dev
```

Other useful commands:

```sh
npm run typecheck
npm run test:smoke
npm run build
```

## Commander data

`src/data/commanders.seed.json` contains the curated top-100 annotations.
`src/data/commanders.catalog.json` is a checked-in 500-commander snapshot used
before a live refresh. The app tries to refresh EDHREC/Scryfall data on load,
requests at least as many ranking pages as the current catalog contains,
caches the last successful catalog in `localStorage`, and falls back to the
checked-in catalog when offline.

To regenerate the static catalog locally:

```sh
npm run data:refresh
# Read more EDHREC pages; each page contains about 100 commanders.
CATALOG_PAGES=5 npm run data:refresh
```

The refresh script follows EDHREC’s ranked “past 2 years” pages, resolves the
listed Scryfall IDs in batches, preserves curated annotations by name/slug,
and infers archetype vectors, difficulty, budget, tags and estimated table
power for new commanders from card text, price and popularity. Generated
labels are estimates and are marked as such in the UI.

A `Refresh commander catalog` GitHub Actions workflow runs weekly, on
data-pipeline changes, and can also be started manually. It runs the same
script, type-checks, and commits the generated catalog when it changes.
GitHub Pages builds also attempt a catalog refresh before bundling, while
local builds stay offline.

Data and images come from EDHREC and Scryfall. EDHREC’s JSON endpoints are
unofficial and may change; the app keeps the previous catalog when a refresh
fails. Magic: The Gathering is a trademark of Wizards of the Coast. This is an
unofficial fan tool.

## Deploy to GitHub Pages

The `Deploy to GitHub Pages` workflow builds the app and publishes it whenever
changes are pushed to `main` (or when started manually from the Actions tab).
In the repository's **Settings → Pages**, set the build and deployment source
to **GitHub Actions**. After the workflow succeeds, the app is available at
https://rexdus.github.io/Commander-Oracle/.
