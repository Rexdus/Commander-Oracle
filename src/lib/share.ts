import type {
  ArchKey,
  BudgetLevel,
  ColorKey,
  ComplexityLevel,
  Option,
  Preferences,
} from "../types";
import { DEFAULT_PREFERENCES } from "../types";
import { encodingDeckFor, type QuizMode } from "./questions";
import { ARCHES, COLORS } from "./scoring";

export type ShareMode = QuizMode;
// v2 changes the question bank and adaptive deck encoding; old links are not
// compatible and are intentionally ignored.
const VERSION = "v2";

export interface SharedResult {
  mode: ShareMode;
  picks: Record<string, Option>;
  preferences: Preferences;
}

export interface ResultShareState extends SharedResult {
  answerCount?: number;
  questionCount?: number;
}

function deckFor(mode: ShareMode) {
  return encodingDeckFor(mode);
}

function base64UrlEncode(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return atob(padded + padding);
}

function encodeAnswers(
  mode: ShareMode,
  picks: Record<string, Option>,
): string {
  return deckFor(mode)
    .map((question) => {
      const selected = picks[question.id];
      const index = selected
        ? question.options.findIndex((option) => option.id === selected.id)
        : -1;
      return index >= 0 ? index.toString(36) : "-";
    })
    .join("");
}

type CompactPreferences = {
  mh?: ArchKey[];
  av?: ArchKey[];
  mc?: ColorKey[];
  ac?: ColorKey[];
  b?: BudgetLevel;
  c?: ComplexityLevel;
};

function encodePreferences(preferences: Preferences): string {
  const compact: CompactPreferences = {
    mh: preferences.mustHaveArches,
    av: preferences.avoidArches,
    mc: preferences.mustHaveColors,
    ac: preferences.avoidColors,
    b: preferences.maxBudget,
    c: preferences.maxComplexity,
  };
  return base64UrlEncode(JSON.stringify(compact));
}

function decodePreferences(raw: string | null): Preferences {
  if (!raw) return { ...DEFAULT_PREFERENCES };
  try {
    const compact = JSON.parse(base64UrlDecode(raw)) as CompactPreferences;
    const budget = Number(compact.b);
    const complexity = Number(compact.c);
    return {
      mustHaveArches: (compact.mh ?? []).filter((a) =>
        ARCHES.includes(a),
      ),
      avoidArches: (compact.av ?? []).filter((a) => ARCHES.includes(a)),
      mustHaveColors: (compact.mc ?? []).filter((c) =>
        COLORS.includes(c),
      ),
      avoidColors: (compact.ac ?? []).filter((c) => COLORS.includes(c)),
      maxBudget: [1, 2, 3].includes(budget)
        ? (budget as BudgetLevel)
        : undefined,
      maxComplexity: [1, 2, 3, 4, 5].includes(complexity)
        ? (complexity as ComplexityLevel)
        : undefined,
    };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function buildResultHash(state: ResultShareState): string {
  const params = new URLSearchParams();
  params.set("r", VERSION);
  params.set("m", state.mode);
  params.set("a", encodeAnswers(state.mode, state.picks));
  params.set("p", encodePreferences(state.preferences));
  return `#${params.toString()}`;
}

export function parseResultHash(hash: string): SharedResult | null {
  try {
    const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
    if (params.get("r") !== VERSION) return null;

    const mode: ShareMode = params.get("m") === "quick" ? "quick" : "full";
    const answerString = params.get("a") ?? "";
    const deck = deckFor(mode);
    const picks: Record<string, Option> = {};

    for (let i = 0; i < Math.min(answerString.length, deck.length); i += 1) {
      const character = answerString[i];
      if (character === "-") continue;
      const optionIndex = Number.parseInt(character, 36);
      if (
        Number.isNaN(optionIndex) ||
        optionIndex < 0 ||
        optionIndex >= deck[i].options.length
      ) {
        continue;
      }
      picks[deck[i].id] = deck[i].options[optionIndex];
    }

    if (Object.keys(picks).length === 0) return null;
    return {
      mode,
      picks,
      preferences: decodePreferences(params.get("p")),
    };
  } catch {
    return null;
  }
}

export function buildShareUrl(
  state: ResultShareState,
  baseHref?: string,
): string {
  const href =
    baseHref ??
    (typeof window !== "undefined" ? window.location.href : "https://example.com/");
  const url = new URL(href);
  url.hash = buildResultHash(state).slice(1);
  return url.toString();
}

export function clearResultHash(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.hash = "";
  window.history.replaceState(null, "", url.toString());
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy copy path.
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}

export async function shareOrCopy(
  url: string,
  title: string,
  text: string,
): Promise<"shared" | "copied" | "cancelled" | "failed"> {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
      // Fall through to copying the link.
    }
  }
  return (await copyText(url)) ? "copied" : "failed";
}

export function resultSummary(
  commanderName: string,
  identity: string,
  match: number,
  primaryArch: string,
  secondaryArch: string,
): string {
  return `My Magic commander is ${commanderName} (${identity}) — ${match}% relative fit. ${primaryArch} / ${secondaryArch}. Find yours in the Commander Oracle.`;
}
