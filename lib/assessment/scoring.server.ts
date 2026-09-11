import { ASSESSMENT_ITEMS, CATEGORY_LABELS, itemById } from "./items.server";
import { correctChoiceFor, isValidSessionToken } from "./session.server";
import type {
  CognitiveDimension,
  DimensionResult,
  QualityRecord,
  ResponseRecord,
  ScoreResult,
} from "./types";

const GRID_MIN = -4.5;
const GRID_MAX = 4.5;
const GRID_STEP = 0.02;
const CENTRAL_INTERVAL_Z = 1.645;

export function probability3pl(theta: number, a: number, b: number, c = 0.25) {
  return c + (1 - c) / (1 + Math.exp(-a * (theta - b)));
}

const normalDensity = (theta: number) => Math.exp(-0.5 * theta * theta) / Math.sqrt(2 * Math.PI);

export function estimateEap(correctness: boolean[]) {
  if (correctness.length !== ASSESSMENT_ITEMS.length) throw new Error("Expected 80 scored responses");
  const points: { theta: number; weight: number }[] = [];
  let weightSum = 0;

  for (let theta = GRID_MIN; theta <= GRID_MAX + GRID_STEP / 2; theta += GRID_STEP) {
    let logLikelihood = Math.log(normalDensity(theta));
    for (let index = 0; index < ASSESSMENT_ITEMS.length; index += 1) {
      const item = ASSESSMENT_ITEMS[index];
      const probability = probability3pl(theta, item.provisionalA, item.provisionalB, item.provisionalC);
      logLikelihood += Math.log(correctness[index] ? probability : 1 - probability);
    }
    points.push({ theta, weight: logLikelihood });
  }

  const maxLogWeight = Math.max(...points.map((point) => point.weight));
  for (const point of points) {
    point.weight = Math.exp(point.weight - maxLogWeight);
    weightSum += point.weight;
  }

  const mean = points.reduce((sum, point) => sum + point.theta * point.weight, 0) / weightSum;
  const variance = points.reduce(
    (sum, point) => sum + (point.theta - mean) ** 2 * point.weight,
    0,
  ) / weightSum;

  return { theta: mean, posteriorSd: Math.sqrt(Math.max(variance, 0)) };
}

function erf(value: number) {
  const sign = value < 0 ? -1 : 1;
  const x = Math.abs(value);
  const t = 1 / (1 + 0.3275911 * x);
  const coefficients = [0.254829592, -0.284496736, 1.421413741, -1.453152027, 1.061405429];
  const polynomial = coefficients.reduceRight((acc, coefficient) => coefficient + t * acc, 0);
  return sign * (1 - polynomial * t * Math.exp(-x * x));
}

export const thetaToPercentile = (theta: number) =>
  Math.max(1, Math.min(99, Math.round(100 * 0.5 * (1 + erf(theta / Math.sqrt(2))))));

const formatBoundary = (value: number, boundary: "lower" | "upper") => {
  const rounded = Math.round(value);
  if (rounded < 70) return "低於 70";
  if (rounded > 145) return "145 以上";
  if (boundary === "lower" && rounded === 145) return "145";
  return String(rounded);
};

function makeDimensionResults(correctness: boolean[], responses: ResponseRecord[]): DimensionResult[] {
  const categories = Object.keys(CATEGORY_LABELS) as CognitiveDimension[];
  return categories.map((category) => {
    const indices = ASSESSMENT_ITEMS
      .map((item, index) => (item.category === category ? index : -1))
      .filter((index) => index >= 0);
    const correct = indices.filter((index) => correctness[index]).length;
    const total = indices.length;
    let score = Math.round(((correct + 0.5) / (total + 1)) * 100);

    if (category === "processingSpeed") {
      const correctIndices = indices.filter((index) => correctness[index]);
      const efficiency = correctIndices.length
        ? correctIndices.reduce((sum, index) => {
            const response = responses[index];
            const targetMs = ASSESSMENT_ITEMS[index].suggestedTimeSeconds * 1000;
            return sum + Math.max(0, Math.min(1, (targetMs * 1.15 - response.responseTimeMs) / (targetMs * 0.9)));
          }, 0) / correctIndices.length
        : 0;
      const accuracyIndex = (correct + 0.5) / (total + 1);
      score = Math.round(100 * (accuracyIndex * 0.8 + efficiency * 0.2));
    }

    return { category, label: CATEGORY_LABELS[category], score, correct, total };
  });
}

export function validateResponses(responses: ResponseRecord[]) {
  if (responses.length !== ASSESSMENT_ITEMS.length) return false;
  const ids = new Set<string>();
  for (const response of responses) {
    if (!itemById.has(response.id) || ids.has(response.id)) return false;
    if (!["A", "B", "C", "D"].includes(response.choice)) return false;
    if (!Number.isFinite(response.responseTimeMs) || response.responseTimeMs < 0) return false;
    ids.add(response.id);
  }
  return ASSESSMENT_ITEMS.every((item) => ids.has(item.id));
}

export function scoreAssessment(
  token: string,
  unorderedResponses: ResponseRecord[],
  quality: QualityRecord,
): ScoreResult {
  if (!isValidSessionToken(token) || !validateResponses(unorderedResponses)) {
    throw new Error("Invalid assessment submission");
  }

  const byId = new Map(unorderedResponses.map((response) => [response.id, response]));
  const responses = ASSESSMENT_ITEMS.map((item) => byId.get(item.id)!);
  const correctness = responses.map(
    (response) => response.choice === correctChoiceFor(token, response.id),
  );
  const correct = correctness.filter(Boolean).length;
  const { theta, posteriorSd } = estimateEap(correctness);
  const rawIq = Math.round(100 + 15 * theta);

  const serverShortResponses = responses.filter((response, index) => {
    const threshold = ASSESSMENT_ITEMS[index].category === "processingSpeed" ? 450 : 800;
    return response.responseTimeMs < threshold;
  }).length;
  const unstable = Boolean(
    quality.restored ||
      quality.interrupted ||
      quality.hiddenEvents >= 3 ||
      quality.hiddenMs > 60_000 ||
      Math.max(quality.shortResponses, serverShortResponses) >= 10,
  );
  const intervalSd = posteriorSd * (unstable ? 1.25 : 1);
  const lowerIq = 100 + 15 * (theta - CENTRAL_INTERVAL_Z * intervalSd);
  const upperIq = 100 + 15 * (theta + CENTRAL_INTERVAL_Z * intervalSd);

  const displayIq = correct <= 10 || rawIq < 70 ? "低於 70" : correct >= 77 || rawIq > 145 ? "145 以上" : String(Math.max(70, Math.min(145, rawIq)));

  return {
    status: "ok",
    beta: true,
    theta: Number(theta.toFixed(3)),
    posteriorSd: Number(posteriorSd.toFixed(3)),
    rawIq,
    displayIq,
    interval: {
      lower: formatBoundary(lowerIq, "lower"),
      upper: formatBoundary(upperIq, "upper"),
    },
    percentile: thetaToPercentile(theta),
    correct,
    total: 80,
    unstable,
    dimensions: makeDimensionResults(correctness, responses),
    normVersion: "TW-BETA-0.2",
  };
}
