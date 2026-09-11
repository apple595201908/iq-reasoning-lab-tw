
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { ASSESSMENT_ITEMS, PRACTICE_ITEMS } from "../lib/assessment/items.server";
import { estimateEap, probability3pl, scoreAssessment, thetaToPercentile, validateResponses } from "../lib/assessment/scoring.server";
import { answerSequenceStats, createBalancedAnswerPattern, createSession } from "../lib/assessment/session.server";
import type { Choice, QualityRecord, ResponseRecord } from "../lib/assessment/types";

const token = "0123456789abcdef0123456789abcdef";
const pattern = createBalancedAnswerPattern(token);
const stableQuality: QualityRecord = { hiddenEvents: 0, hiddenMs: 0, shortResponses: 0, restored: false, interrupted: false };
const choices: Choice[] = ["A", "B", "C", "D"];

const responsesFor = (isCorrect: (index: number) => boolean, responseTimeMs = 5000): ResponseRecord[] =>
  ASSESSMENT_ITEMS.map((item, index) => ({
    id: item.id,
    choice: isCorrect(index) ? pattern[index] : choices[(choices.indexOf(pattern[index]) + 1) % choices.length],
    responseTimeMs,
  }));

test("blueprint has 2 practice items and exactly 80 scored items", () => {
  assert.equal(PRACTICE_ITEMS.length, 2);
  assert.equal(ASSESSMENT_ITEMS.length, 80);
  assert.deepEqual(
    Object.fromEntries(Object.entries(Object.groupBy(ASSESSMENT_ITEMS, (item) => item.category)).map(([key, items]) => [key, items?.length])),
    { abstract: 16, verbal: 10, quantitative: 12, spatial: 10, logic: 14, processingSpeed: 8, workingMemory: 10 },
  );
  assert.deepEqual(
    Object.fromEntries(Object.entries(Object.groupBy(ASSESSMENT_ITEMS, (item) => item.difficulty)).map(([key, items]) => [key, items?.length])),
    { easy: 16, medium: 32, hard: 22, extreme: 10 },
  );
});

test("question order alternates cognitive activity and final ten are extreme", () => {
  let repeated = 1;
  let longest = 1;
  for (let index = 1; index < ASSESSMENT_ITEMS.length; index += 1) {
    repeated = ASSESSMENT_ITEMS[index].category === ASSESSMENT_ITEMS[index - 1].category ? repeated + 1 : 1;
    longest = Math.max(longest, repeated);
  }
  assert.ok(longest <= 2, `Longest repeated category is ${longest}, expected <= 2`);
  assert.ok(ASSESSMENT_ITEMS.slice(-10).every((item) => item.difficulty === "extreme"));
});

test("every scored item has one unique key and complete internal metadata", () => {
  const ids = new Set<string>();
  const stems = new Set<string>();
  for (let i = 0; i < ASSESSMENT_ITEMS.length; i++) {
    const item = ASSESSMENT_ITEMS[i];
    const expectedId = `q${String(i + 1).padStart(2, "0")}`;
    assert.equal(item.id, expectedId, `Item id should be ${expectedId}, got ${item.id}`);
    assert.ok(!ids.has(item.id));
    ids.add(item.id);
    assert.ok(!stems.has(item.stem), `Duplicate stem: ${item.stem}`);
    stems.add(item.stem);

    assert.equal(item.options.length, 4);
    assert.equal(item.options.filter((option) => option.id === item.correctOptionId).length, 1);
    assert.equal(new Set(item.options.map((option) => option.id)).size, 4);
    assert.equal(new Set(item.options.map((option) => option.alt)).size, 4);
    assert.ok(item.semanticSegments.length > 0);
    assert.ok(item.semanticSegments.every((segment) => segment.trim().length > 0));
    assert.ok(item.distractorRationale.length > 5);
    assert.ok(item.measurementTarget.length > 5);
    assert.ok(item.internalExplanation.length > 5);
    assert.ok(item.suggestedTimeSeconds >= 8);
    assert.ok(item.provisionalA > 0);
    assert.ok(Number.isFinite(item.provisionalB));
    assert.equal(item.provisionalC, 0.25);
    assert.ok(item.accessibilityAlt.length > 4);

    if (item.stimulus.kind === "memory") {
      const dur = item.stimulus.durationMs;
      if (item.difficulty === "easy") assert.ok(dur >= 7000, `${item.id} easy memory timer must be >= 7s`);
      if (item.difficulty === "medium") assert.ok(dur >= 9000, `${item.id} medium memory timer must be >= 9s`);
      if (item.difficulty === "hard" || item.difficulty === "extreme") assert.ok(dur >= 12000, `${item.id} hard memory timer must be >= 12s`);
    }
  }
});

test("seeded answer positions are balanced and do not form long runs", () => {
  for (let index = 0; index < 80; index += 1) {
    const seed = index.toString(16).padStart(32, "0");
    const candidate = createBalancedAnswerPattern(seed);
    const stats = answerSequenceStats(candidate);
    assert.deepEqual({ a: stats.a, b: stats.b, c: stats.c, d: stats.d }, { a: 20, b: 20, c: 20, d: 20 });
    assert.ok(stats.longestSame <= 2, `Longest same is ${stats.longestSame}, expected <= 2`);
    assert.ok(stats.longestAlternating <= 5, `Longest alternating is ${stats.longestAlternating}, expected <= 5`);
    assert.deepEqual(candidate, createBalancedAnswerPattern(seed));
  }
});

test("public session contains no formal answer key or internal analysis", () => {
  const publicSession = createSession(token);
  const serializedItems = JSON.stringify(publicSession.items);
  for (const privateField of ["correctOptionId", "internalExplanation", "distractorRationale", "measurementTarget", "provisionalA", "provisionalB", "provisionalC"]) {
    assert.ok(!serializedItems.includes(privateField));
  }
  assert.equal(publicSession.items.length, 80);
  assert.equal(publicSession.practice.length, 2);
  assert.ok(publicSession.practice.every((item) => item.explanation.length > 0));
});

test("3PL probability obeys the four-choice guessing floor and item discrimination", () => {
  assert.ok(Math.abs(probability3pl(-100, 1.5, 0.5, 0.25) - 0.25) < 1e-8);
  assert.ok(probability3pl(2, 1.5, 0.5, 0.25) > probability3pl(0, 1.5, 0.5, 0.25));
  assert.ok(probability3pl(1, 2, 0, 0.25) > probability3pl(1, 0.5, 0, 0.25));
});

test("EAP output is finite, stable, and monotonic as responses improve", () => {
  const first = estimateEap(Array(80).fill(false));
  const again = estimateEap(Array(80).fill(false));
  assert.deepEqual(first, again);
  assert.ok(Number.isFinite(first.theta) && first.posteriorSd > 0);
  let previous = -Infinity;
  for (const correctCount of [0, 10, 20, 30, 40, 50, 60, 70, 80]) {
    const result = scoreAssessment(token, responsesFor((index) => index < correctCount), stableQuality);
    assert.ok(result.theta > previous, `Theta not monotonic at count ${correctCount}: ${result.theta} <= ${previous}`);
    previous = result.theta;
  }
});

test("all-correct, all-wrong, and mixed flows yield ordered results without false precision", () => {
  const low = scoreAssessment(token, responsesFor(() => false), stableQuality);
  const mixed = scoreAssessment(token, responsesFor((index) => index < 40), stableQuality);
  const high = scoreAssessment(token, responsesFor(() => true), stableQuality);
  assert.equal(low.displayIq, "低於 70");
  assert.equal(high.displayIq, "145 以上");
  assert.match(mixed.displayIq, /^\d+$/);
  assert.ok(low.theta < mixed.theta && mixed.theta < high.theta);
  assert.equal(low.total, 80);
  assert.equal(high.total, 80);
});

test("high-difficulty final block adds high-end separation", () => {
  const throughHard = scoreAssessment(token, responsesFor((index) => index < 70), stableQuality);
  const complete = scoreAssessment(token, responsesFor(() => true), stableQuality);
  assert.ok(complete.theta - throughHard.theta > 0.4);
  assert.notEqual(complete.displayIq, throughHard.displayIq);
});

test("model interval follows posterior error and widens for unstable response state", () => {
  const responses = responsesFor((index) => index < 45);
  const stable = scoreAssessment(token, responses, stableQuality);
  const unstable = scoreAssessment(token, responses, { ...stableQuality, hiddenMs: 61_000 });
  assert.equal(stable.unstable, false);
  assert.equal(unstable.unstable, true);
  const width = (value: typeof stable) => Number(value.interval.upper) - Number(value.interval.lower);
  assert.ok(width(unstable) > width(stable));
});

test("response time affects processing-speed profile only, not IQ EAP", () => {
  const quick = scoreAssessment(token, responsesFor(() => true, 1800), stableQuality);
  const deliberate = scoreAssessment(token, responsesFor(() => true, 12_000), stableQuality);
  assert.equal(quick.theta, deliberate.theta);
  assert.equal(quick.rawIq, deliberate.rawIq);
  const quickSpeed = quick.dimensions.find((dimension) => dimension.category === "processingSpeed")!;
  const slowSpeed = deliberate.dimensions.find((dimension) => dimension.category === "processingSpeed")!;
  assert.ok(quickSpeed.score > slowSpeed.score);
  for (const dimension of quick.dimensions.filter((entry) => entry.category !== "processingSpeed")) {
    assert.equal(dimension.score, deliberate.dimensions.find((entry) => entry.category === dimension.category)?.score);
  }
});

test("invalid or practice responses cannot enter the scored set", () => {
  const valid = responsesFor(() => true);
  assert.equal(validateResponses(valid), true);
  assert.equal(validateResponses(valid.slice(0, 79)), false);
  assert.equal(validateResponses([...valid.slice(0, 79), { id: "p01", choice: "A", responseTimeMs: 1000 }]), false);
  assert.equal(validateResponses([...valid.slice(0, 79), valid[0]]), false);
  assert.equal(validateResponses(valid.map((response, index) => index === 0 ? { ...response, choice: "D" } : response)), true);
});

test("percentile stays bounded and extreme theta values remain finite", () => {
  assert.equal(thetaToPercentile(-100), 1);
  assert.equal(thetaToPercentile(100), 99);
  assert.ok(Number.isFinite(probability3pl(100, 2, 4)));
  assert.ok(Number.isFinite(probability3pl(-100, 2, -4)));
});

test("client timing starts after render and shared image code has no answer-key dependency", async () => {
  const source = await readFile(new URL("../components/assessment-app.tsx", import.meta.url), "utf8");
  assert.match(source, /requestAnimationFrame\(\(\) => \{\s*frameTwo = requestAnimationFrame/);
  assert.match(source, /performance\.now\(\) - questionStart\.current - hiddenAccumulated\.current/);
  assert.match(source, /document\.hidden/);
  assert.match(source, /localStorage\.setItem\(STORAGE_KEY/);
  const shareSection = source.slice(source.indexOf("const share = async"), source.indexOf("return (", source.indexOf("const share = async")));
  assert.ok(!shareSection.includes("correctChoice"));
  assert.ok(!shareSection.includes("correctOption"));
  assert.ok(!shareSection.includes("responses"));
});

test("semantic segments never isolate punctuation and preserve critical phrases", () => {
  const punctuationOnly = /^[，。？！、；：）】』」]$/u;
  const all = [...PRACTICE_ITEMS, ...ASSESSMENT_ITEMS];
  for (const item of all) {
    assert.ok(item.semanticSegments.every((segment) => !punctuationOnly.test(segment)));
  }
  for (const protectedPhrase of ["至少", "不相符"] as const) {
    const occurrences = all.filter((item) => item.stem.includes(protectedPhrase));
    assert.ok(occurrences.every((item) => item.semanticSegments.some((segment) => segment.includes(protectedPhrase))));
  }
});

test("visual rule anchors keep their answer geometry aligned", () => {
  const q27 = ASSESSMENT_ITEMS.find((item) => item.id === "q27")!;
  assert.equal(q27.correctOptionId, "diagonal");
  assert.equal(q27.options.find((option) => option.id === q27.correctOptionId)?.visualKey, "overlay-diagonal");
  
  const q18 = ASSESSMENT_ITEMS.find((item) => item.id === "q18")!;
  assert.equal(q18.options.find((option) => option.id === q18.correctOptionId)?.visualKey, "hook-rotate-correct");
  
  const q57 = ASSESSMENT_ITEMS.find((item) => item.id === "q57")!;
  assert.equal(q57.options.find((option) => option.id === q57.correctOptionId)?.visualKey, "transform-two-correct");

  const q72 = ASSESSMENT_ITEMS.find((item) => item.id === "q72")!;
  assert.equal(q72.correctOptionId, "rightDiagonal");
  assert.equal(q72.options.find((option) => option.id === q72.correctOptionId)?.visualKey, "transform-three-correct");
});
