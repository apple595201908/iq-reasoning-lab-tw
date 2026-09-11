import { ASSESSMENT_ITEMS, CATEGORY_LABELS, PRACTICE_ITEMS, itemById } from "./items.server";
import type { AssessmentItem, Choice, PracticeItem, PublicItem } from "./types";

const TOKEN_PATTERN = /^[a-f0-9]{32}$/;

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed: string) {
  let state = hashSeed(seed) || 0x9e3779b9;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function longestRun(values: Choice[]): number {
  let longest = 0;
  let current = 0;
  let previous: Choice | undefined;
  for (const value of values) {
    current = value === previous ? current + 1 : 1;
    previous = value;
    longest = Math.max(longest, current);
  }
  return longest;
}

function longestAlternatingRun(values: Choice[]): number {
  let longest = values.length ? 1 : 0;
  let current = longest;
  for (let index = 1; index < values.length; index += 1) {
    if (index >= 2 && values[index] === values[index - 2] && values[index] !== values[index - 1]) {
      current += 1;
    } else {
      current = values[index] !== values[index - 1] ? 2 : 1;
    }
    longest = Math.max(longest, current);
  }
  return longest;
}

export function createBalancedAnswerPattern(seed: string): Choice[] {
  const random = seededRandom(seed);
  const base: Choice[] = [
    ...Array<Choice>(20).fill("A"),
    ...Array<Choice>(20).fill("B"),
    ...Array<Choice>(20).fill("C"),
    ...Array<Choice>(20).fill("D"),
  ];

  for (let attempt = 0; attempt < 500; attempt += 1) {
    const candidate = [...base];
    for (let index = candidate.length - 1; index > 0; index -= 1) {
      const swapWith = Math.floor(random() * (index + 1));
      [candidate[index], candidate[swapWith]] = [candidate[swapWith], candidate[index]];
    }
    if (longestRun(candidate) <= 2 && longestAlternatingRun(candidate) <= 5) return candidate;
  }

  return ("ACBDABDCBACDDBACABDCBCADDCABADCBBCADACBD" + "BDACBACDDBACABDCBCADDCABADCBBCADACBDACBD").slice(0, 80).split("") as Choice[];
}

function toPublicItem(item: AssessmentItem, correctPosition: Choice, seed: string): PublicItem {
  const correct = item.options.find((option) => option.id === item.correctOptionId);
  const distractors = item.options.filter((option) => option.id !== item.correctOptionId);
  if (!correct || distractors.length !== 3) throw new Error(`Invalid option key for ${item.id}`);
  const random = seededRandom(`${seed}-${item.id}`);
  for (let index = distractors.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(random() * (index + 1));
    [distractors[index], distractors[swapWith]] = [distractors[swapWith], distractors[index]];
  }

  const optionFor = (choice: Choice, source: typeof correct) => ({
    id: choice,
    alt: source.alt,
    ...(source.semanticSegments ? { semanticSegments: source.semanticSegments } : {}),
    ...(source.visualKey ? { visualKey: source.visualKey } : {}),
  });

  const choices: Choice[] = ["A", "B", "C", "D"];
  let distractorIndex = 0;
  const publicOptions = choices.map((choice) =>
    optionFor(choice, choice === correctPosition ? correct : distractors[distractorIndex++]),
  ) as PublicItem["options"];

  return {
    id: item.id,
    category: item.category,
    categoryLabel: CATEGORY_LABELS[item.category],
    difficulty: item.difficulty,
    semanticSegments: item.semanticSegments,
    stimulus: item.stimulus,
    options: publicOptions,
    suggestedTimeSeconds: item.suggestedTimeSeconds,
    accessibilityAlt: item.accessibilityAlt,
  };
}

export function isValidSessionToken(token: string): boolean {
  return TOKEN_PATTERN.test(token);
}

export function answerPatternForToken(token: string): Choice[] {
  if (!isValidSessionToken(token)) throw new Error("Invalid session token");
  return createBalancedAnswerPattern(token);
}

export function publicAssessmentForToken(token: string): PublicItem[] {
  const pattern = answerPatternForToken(token);
  return ASSESSMENT_ITEMS.map((item, index) => toPublicItem(item, pattern[index], token));
}

export function publicPracticeItems(): PracticeItem[] {
  return PRACTICE_ITEMS.map((item, index) => ({
    ...toPublicItem(item, index === 0 ? "A" : "C", `practice-${index}`),
    explanation: item.internalExplanation,
  }));
}

export function correctChoiceFor(token: string, itemId: string): Choice | undefined {
  const index = ASSESSMENT_ITEMS.findIndex((item) => item.id === itemId);
  if (index < 0 || !itemById.has(itemId)) return undefined;
  return answerPatternForToken(token)[index];
}

export function createSession(seed?: string) {
  const token = seed && isValidSessionToken(seed)
    ? seed
    : crypto.randomUUID().replaceAll("-", "").slice(0, 32);
  return {
    version: "TW-BETA-0.2" as const,
    token,
    practice: publicPracticeItems(),
    items: publicAssessmentForToken(token),
  };
}

export const answerSequenceStats = (values: Choice[]) => ({
  a: values.filter((value) => value === "A").length,
  b: values.filter((value) => value === "B").length,
  c: values.filter((value) => value === "C").length,
  d: values.filter((value) => value === "D").length,
  longestSame: longestRun(values),
  longestAlternating: longestAlternatingRun(values),
});
