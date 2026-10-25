import type { Option, Question } from "../types";
import {
  ADAPTIVE_QUESTIONS,
  CONSTRAINT_QUESTIONS,
  CORE_QUESTIONS,
  QUESTIONS,
  STRATEGY_QUESTIONS,
} from "../data/questions";
import { buildProfile, type Profile } from "./scoring";

export type QuizMode = "quick" | "full";

export const QUICK_ADAPTIVE_LIMIT = 1;
export const FULL_ADAPTIVE_LIMIT = 2;

export const QUICK_QUIZ_LENGTH =
  CORE_QUESTIONS.length + CONSTRAINT_QUESTIONS.length + QUICK_ADAPTIVE_LIMIT;
export const FULL_QUIZ_LENGTH =
  CORE_QUESTIONS.length +
  CONSTRAINT_QUESTIONS.length +
  STRATEGY_QUESTIONS.length +
  FULL_ADAPTIVE_LIMIT;

/** Non-adaptive questions that must be answered before tie-breakers appear. */
export function baseQuestionsFor(mode: QuizMode): Question[] {
  return mode === "quick"
    ? [...CORE_QUESTIONS, ...CONSTRAINT_QUESTIONS]
    : [...CORE_QUESTIONS, ...CONSTRAINT_QUESTIONS, ...STRATEGY_QUESTIONS];
}

/**
 * A fixed deck used only for URL encoding. Adaptive questions that were not
 * asked are encoded as skipped, so a shared link can be decoded without
 * recomputing the quiz path.
 */
export function encodingDeckFor(mode: QuizMode): Question[] {
  return mode === "quick"
    ? [...CORE_QUESTIONS, ...CONSTRAINT_QUESTIONS, ...ADAPTIVE_QUESTIONS]
    : QUESTIONS;
}

export function adaptiveLimitFor(mode: QuizMode): number {
  return mode === "quick" ? QUICK_ADAPTIVE_LIMIT : FULL_ADAPTIVE_LIMIT;
}

export function answersForBaseQuestions(
  mode: QuizMode,
  picks: Record<string, Option>,
): Option[] {
  return baseQuestionsFor(mode)
    .map((question) => picks[question.id])
    .filter((option): option is Option => Boolean(option));
}

export function adaptiveIdsFromPicks(
  picks: Record<string, Option>,
): string[] {
  return ADAPTIVE_QUESTIONS.filter((question) => picks[question.id]).map(
    (question) => question.id,
  );
}

interface ScoredAdaptiveQuestion {
  question: Question;
  relevance: number;
}

/**
 * Pick tie-breakers whose target archetypes are both strong in the partial
 * profile. `min` rewards questions where the pair is genuinely ambiguous
 * rather than one target being dominant.
 */
export function selectAdaptiveQuestions(
  profile: Profile,
  limit: number,
): Question[] {
  const scored: ScoredAdaptiveQuestion[] = ADAPTIVE_QUESTIONS.map(
    (question) => {
      const values = (question.targets ?? []).map(
        (target) => profile.arch[target] ?? 0,
      );
      const sum = values.reduce((total, value) => total + value, 0);
      const average = values.length > 0 ? sum / values.length : 0;
      const minimum = values.length > 0 ? Math.min(...values) : 0;
      return {
        question,
        relevance: average + minimum * 0.5,
      };
    },
  );

  return scored
    .sort(
      (a, b) =>
        b.relevance - a.relevance ||
        a.question.id.localeCompare(b.question.id),
    )
    .slice(0, Math.max(0, limit))
    .map((entry) => entry.question);
}

export function buildActiveDeck(
  mode: QuizMode,
  picks: Record<string, Option>,
  adaptiveIds?: string[],
): Question[] {
  const base = baseQuestionsFor(mode);
  const selectedIds =
    adaptiveIds ??
    selectAdaptiveQuestions(
      buildProfile(answersForBaseQuestions(mode, picks)),
      adaptiveLimitFor(mode),
    ).map((question) => question.id);
  const selected = ADAPTIVE_QUESTIONS.filter((question) =>
    selectedIds.includes(question.id),
  );
  return [...base, ...selected];
}

export function quizLengthFor(mode: QuizMode): number {
  return mode === "quick" ? QUICK_QUIZ_LENGTH : FULL_QUIZ_LENGTH;
}
