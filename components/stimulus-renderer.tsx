"use client";

import { useEffect, useState } from "react";
import type { Stimulus } from "../lib/assessment/types";
import { VisualStimulus } from "./visual-stimulus";

type StimulusRendererProps = {
  stimulus: Stimulus;
  accessibilityAlt: string;
  memoryCycle?: number;
  onMemoryReady?: () => void;
};

function MemoryStimulus({ values, durationMs, memoryCycle, onReady }: { values: string[]; durationMs: number; memoryCycle: number; onReady?: () => void }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(false);
      onReady?.();
    }, durationMs);
    return () => window.clearTimeout(timer);
  }, [durationMs, memoryCycle, onReady]);
  return (
    <div className="memory-stage" aria-live="polite">
      {visible ? (
        <div className="memory-values" aria-label={`請記住：${values.join("、")}`}>
          {values.map((value, index) => <span key={`${value}-${index}`}>{value}</span>)}
        </div>
      ) : (
        <div className="memory-hidden"><span aria-hidden="true">✓</span><strong>已隱藏</strong><small>請依題意操作</small></div>
      )}
    </div>
  );
}

export function StimulusRenderer({ stimulus, accessibilityAlt, memoryCycle = 0, onMemoryReady }: StimulusRendererProps) {
  if (stimulus.kind === "none") return <div className="stimulus-spacer" aria-hidden="true" />;
  if (stimulus.kind === "visual") {
    return <div className="visual-stage"><VisualStimulus visualKey={stimulus.visualKey} label={accessibilityAlt} /></div>;
  }
  if (stimulus.kind === "sequence") {
    return <div className="symbol-row" aria-label={accessibilityAlt}>{stimulus.values.map((value, index) => <span key={`${value}-${index}`}>{value}</span>)}</div>;
  }
  if (stimulus.kind === "mapping") {
    return <div className="mapping-grid" aria-label={accessibilityAlt}>{stimulus.pairs.map((pair) => <span key={pair}>{pair}</span>)}</div>;
  }
  if (stimulus.kind === "logic") {
    return <div className="logic-card" aria-label={accessibilityAlt}>{stimulus.lines.map((line, index) => <p key={index}>{line.map((segment, segmentIndex) => <span className="semantic-segment" key={segmentIndex}>{segment}</span>)}</p>)}</div>;
  }
  if (stimulus.kind === "textRows") {
    return <div className="code-rows" aria-label={accessibilityAlt}>{stimulus.rows.map((row) => <code key={row}>{row}</code>)}</div>;
  }
  return <MemoryStimulus key={`${stimulus.values.join("-")}-${memoryCycle}`} values={stimulus.values} durationMs={stimulus.durationMs} memoryCycle={memoryCycle} onReady={onMemoryReady} />;
}
