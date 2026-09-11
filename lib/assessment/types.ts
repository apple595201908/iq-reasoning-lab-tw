export type Choice = "A" | "B" | "C" | "D";

export type CognitiveDimension =
  | "abstract"
  | "spatial"
  | "quantitative"
  | "logic"
  | "workingMemory"
  | "verbal"
  | "processingSpeed";

export type Difficulty = "easy" | "medium" | "hard" | "extreme";

export type Stimulus =
  | { kind: "none" }
  | { kind: "sequence"; values: string[] }
  | { kind: "mapping"; pairs: string[] }
  | { kind: "logic"; lines: string[][] }
  | { kind: "memory"; values: string[]; durationMs: number }
  | { kind: "textRows"; rows: string[] }
  | { kind: "visual"; visualKey: string };

export type InternalOption = {
  id: string;
  alt: string;
  semanticSegments?: string[];
  visualKey?: string;
};

export type AssessmentItem = {
  id: string;
  category: CognitiveDimension;
  difficulty: Difficulty;
  stem: string;
  semanticSegments: string[];
  stimulus: Stimulus;
  options: [InternalOption, InternalOption, InternalOption, InternalOption];
  correctOptionId: string;
  distractorRationale: string;
  measurementTarget: string;
  internalExplanation: string;
  suggestedTimeSeconds: number;
  provisionalA: number;
  provisionalB: number;
  provisionalC: 0.25;
  accessibilityAlt: string;
};

export type PublicOption = {
  id: Choice;
  alt: string;
  semanticSegments?: string[];
  visualKey?: string;
};

export type PublicItem = {
  id: string;
  category: CognitiveDimension;
  categoryLabel: string;
  difficulty: Difficulty;
  semanticSegments: string[];
  stimulus: Stimulus;
  options: [PublicOption, PublicOption, PublicOption, PublicOption];
  suggestedTimeSeconds: number;
  accessibilityAlt: string;
};

export type PracticeItem = PublicItem & { explanation: string };

export type ResponseRecord = { id: string; choice: Choice; responseTimeMs: number };

export type QualityRecord = {
  hiddenEvents: number;
  hiddenMs: number;
  shortResponses: number;
  restored: boolean;
  interrupted: boolean;
};

export type DimensionResult = {
  category: CognitiveDimension;
  label: string;
  score: number;
  correct: number;
  total: number;
};

export type ScoreResult = {
  status: "ok";
  beta: true;
  theta: number;
  posteriorSd: number;
  rawIq: number;
  displayIq: string;
  interval: { lower: string; upper: string };
  percentile: number;
  correct: number;
  total: 80;
  unstable: boolean;
  dimensions: DimensionResult[];
  normVersion: "TW-BETA-0.2";
};
