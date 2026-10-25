import { copyFile, mkdir } from "node:fs/promises";

const source = new URL("../src/data/commanders.catalog.json", import.meta.url);
const destination = new URL("../dist/commanders.catalog.json", import.meta.url);

await mkdir(new URL("../dist/", import.meta.url), { recursive: true });
await copyFile(source, destination);
console.log("Copied commander catalog into dist");
