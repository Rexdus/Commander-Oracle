# Commander-Oracle

## Run locally

```sh
npm ci
npm run dev
```

## Deploy to GitHub Pages

The `Deploy to GitHub Pages` workflow builds the app and publishes it whenever
changes are pushed to `main` (or when started manually from the Actions tab).
In the repository's **Settings → Pages**, set the build and deployment source
to **GitHub Actions**. After the workflow succeeds, the app is available at
https://rexdus.github.io/Commander-Oracle/.