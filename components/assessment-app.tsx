"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  Choice,
  PracticeItem,
  PublicItem,
  QualityRecord,
  ResponseRecord,
  ScoreResult,
} from "../lib/assessment/types";
import { SemanticText } from "./semantic-text";
import { StimulusRenderer } from "./stimulus-renderer";
import { VisualStimulus } from "./visual-stimulus";

const STORAGE_KEY = "iq-reasoning-tw-beta-v3";
const TRANSITION_MS = 190;

type SessionData = {
  version: "TW-BETA-0.2";
  token: string;
  practice: PracticeItem[];
  items: PublicItem[];
};

type Phase = "boot" | "home" | "practice" | "test" | "scoring" | "result" | "info" | "error";

type StoredProgress = {
  storageVersion: 1;
  phase: "home" | "practice" | "test" | "scoring" | "result";
  session: SessionData;
  practiceIndex: number;
  itemIndex: number;
  responses: ResponseRecord[];
  quality: QualityRecord;
  result?: ScoreResult;
};

const emptyQuality = (): QualityRecord => ({
  hiddenEvents: 0,
  hiddenMs: 0,
  shortResponses: 0,
  restored: false,
  interrupted: false,
});

const isStoredProgress = (value: unknown): value is StoredProgress => {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<StoredProgress>;
  return state.storageVersion === 1 && Boolean(state.session?.token) && Array.isArray(state.responses);
};

function DuckMark() {
  return <Image className="progress-duck" src="/ducks/progress.png" width={28} height={30} alt="" aria-hidden="true" priority />;
}

function HomeScreen({
  onStart,
  onResume,
  hasUnfinished,
  unfinishedNumber,
  onInfo,
  loading,
  error,
}: {
  onStart: () => void;
  onResume?: () => void;
  hasUnfinished?: boolean;
  unfinishedNumber?: number;
  onInfo: () => void;
  loading: boolean;
  error?: string;
}) {
  return (
    <main className="home-screen">
      <div className="home-card">
        <div className="beta-chip">🦆 Beta・非臨床</div>
        <h1><span>你的 IQ</span><span>有多高？</span></h1>
        <p className="home-lead">80 題，約 20～25 分鐘。<br />每題請選 A、B、C 或 D。</p>
        {hasUnfinished && onResume ? (
          <div className="home-btn-group">
            <button className="primary-button" type="button" onClick={onResume} disabled={loading}>
              {`繼續測驗（第 ${unfinishedNumber ?? 1}／80 題）`}
            </button>
            <button className="secondary-button" type="button" onClick={onStart} disabled={loading}>
              {loading ? "準備題目中…" : "重新開始新測驗"}
            </button>
          </div>
        ) : (
          <button className="primary-button" type="button" onClick={onStart} disabled={loading}>
            {loading ? "準備題目中…" : "開始測驗"}
          </button>
        )}
        {error ? <p className="inline-error" role="alert">{error}</p> : null}
        <button className="text-button" type="button" onClick={onInfo}>測驗方法與限制</button>
        <p className="home-note">這是非臨床的線上認知推理推估。<br />正式智力評估仍需由合格專業人員施測。</p>
        <Image className="home-duck" src="/ducks/peek.png" width={210} height={170} alt="一隻從卡片角落探頭的原創小鴨插畫" priority />
      </div>
    </main>
  );
}

function ProgressHeader({
  current,
  total,
  practice,
  onPause,
  onHome,
}: {
  current: number;
  total: number;
  practice?: boolean;
  onPause?: () => void;
  onHome?: () => void;
}) {
  const percentage = ((current - (practice ? 0 : 1)) / total) * 100;
  return (
    <header className="test-header">
      <div className="progress-meta">
        <DuckMark />
        <span>{practice ? "練習" : `${current}／${total}`}</span>
        {practice ? <span>{current}／${total}</span> : null}
        <div className="header-actions">
          {onPause ? (
            <button
              type="button"
              className="header-btn"
              onClick={onPause}
              title="暫停測驗"
              aria-label="暫停測驗"
            >
              <span className="btn-icon">⏸</span>
              <span className="btn-label">暫停</span>
            </button>
          ) : null}
          {onHome ? (
            <button
              type="button"
              className="header-btn"
              onClick={onHome}
              title="回到首頁（進度自動保存）"
              aria-label="回到首頁"
            >
              <span className="btn-icon">🏠</span>
              <span className="btn-label">首頁</span>
            </button>
          ) : null}
        </div>
      </div>
      <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={current - (practice ? 0 : 1)} aria-label={practice ? "練習進度" : "測驗進度"}>
        <span style={{ width: `${Math.max(3, percentage)}%` }} />
      </div>
    </header>
  );
}

function PauseModal({
  current,
  total,
  onResume,
  onHome,
  onRestart,
}: {
  current: number;
  total: number;
  onResume: () => void;
  onHome: () => void;
  onRestart: () => void;
}) {
  const [confirmRestart, setConfirmRestart] = useState(false);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="pause-title">
      <div className="pause-modal-card">
        <div className="pause-duck-wrapper">
          <Image
            src="/ducks/peek.png"
            width={100}
            height={82}
            alt="探頭小鴨"
            className="pause-duck-img"
            priority
          />
        </div>
        <span className="beta-chip">⏸ 測驗已暫停</span>
        <h2 id="pause-title">休息一下，隨時回來</h2>
        <div className="pause-progress-pill">
          目前進度：第 {current}／{total} 題
        </div>
        <p className="pause-desc">
          作答計時已暫停凍結，暫停期間<strong>不計入反應時間</strong>與評估指標，請放鬆休息。進度已為你妥善保存。
        </p>

        {confirmRestart ? (
          <div className="pause-confirm-box">
            <p>確定要重新開始？目前的作答紀錄將被清除，並重新隨機排列題序。</p>
            <div className="pause-confirm-actions">
              <button type="button" className="pause-btn-secondary" onClick={() => setConfirmRestart(false)}>
                返回
              </button>
              <button type="button" className="pause-btn-confirm-danger" onClick={onRestart}>
                確定重開
              </button>
            </div>
          </div>
        ) : (
          <div className="pause-actions">
            <button type="button" className="pause-btn-primary" onClick={onResume}>
              ▶ 繼續測驗
            </button>
            <button type="button" className="pause-btn-secondary" onClick={onHome}>
              🏠 回到首頁（保存進度）
            </button>
            <button
              type="button"
              className="pause-btn-danger"
              onClick={() => setConfirmRestart(true)}
            >
              ↺ 重新開始（隨機新題序）
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ChoiceButton({ item, choice, disabled, pressed, onChoose }: { item: PublicItem; choice: Choice; disabled: boolean; pressed: boolean; onChoose: (choice: Choice) => void }) {
  const option = item.options.find((candidate) => candidate.id === choice)!;
  return (
    <button
      aria-label={`${choice}：${option.alt}`}
      className={`choice-button choice-${choice.toLowerCase()}${pressed ? " is-pressed" : ""}`}
      disabled={disabled}
      onClick={() => onChoose(choice)}
      type="button"
    >
      <span className="choice-letter">{choice}</span>
      <span className="choice-content">
        {option.visualKey ? (
          <VisualStimulus visualKey={option.visualKey} compact label={option.alt} />
        ) : (
          <SemanticText segments={option.semanticSegments ?? [option.alt]} />
        )}
      </span>
    </button>
  );
}

function QuestionScreen({
  item,
  current,
  total,
  practice,
  locked,
  pressedChoice,
  memoryCycle,
  memoryReady,
  timingReady,
  explanation,
  isPaused,
  onChoose,
  onMemoryReady,
  onContinue,
  onPause,
  onResume,
  onHome,
  onRestart,
}: {
  item: PublicItem;
  current: number;
  total: number;
  practice?: boolean;
  locked: boolean;
  pressedChoice?: Choice;
  memoryCycle: number;
  memoryReady: boolean;
  timingReady: boolean;
  explanation?: string;
  isPaused?: boolean;
  onChoose: (choice: Choice) => void;
  onMemoryReady: () => void;
  onContinue?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onHome?: () => void;
  onRestart?: () => void;
}) {
  const isMemory = item.stimulus.kind === "memory";
  return (
    <main className="question-screen">
      <ProgressHeader current={current} total={total} practice={practice} onPause={onPause} onHome={onHome} />
      <section className="question-card" aria-labelledby="question-title">
        <h1 id="question-title"><SemanticText segments={item.semanticSegments} /></h1>
        <StimulusRenderer stimulus={item.stimulus} accessibilityAlt={item.accessibilityAlt} memoryCycle={memoryCycle} onMemoryReady={onMemoryReady} />
      </section>
      <div className={`choices${explanation ? " has-explanation" : ""}`}>
        {explanation ? (
          <div className="practice-explanation" aria-live="polite">
            <p><strong>練習說明</strong>{explanation}</p>
            <button type="button" onClick={onContinue}>{current === total ? "開始正式測驗" : "下一題"}</button>
          </div>
        ) : (
          <>
            {(["A", "B", "C", "D"] as Choice[]).map((choice) => (
              <ChoiceButton key={choice} item={item} choice={choice} disabled={locked || Boolean(isPaused) || !timingReady || (isMemory && !memoryReady)} pressed={pressedChoice === choice} onChoose={onChoose} />
            ))}
            {isMemory && !memoryReady ? <p className="memory-prompt" aria-live="polite">請先記住畫面中的項目</p> : null}
          </>
        )}
      </div>
      {isPaused && onResume && onHome && onRestart ? (
        <PauseModal current={current} total={total} onResume={onResume} onHome={onHome} onRestart={onRestart} />
      ) : null}
    </main>
  );
}

function ResultScreen({ result, onRetest, onHome, onInfo }: { result: ScoreResult; onRetest: () => void; onHome: () => void; onInfo: () => void }) {
  const [shareState, setShareState] = useState("分享結果");
  const [confirmRetest, setConfirmRetest] = useState(false);

  const share = async () => {
    setShareState("製作分享圖…");
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const context = canvas.getContext("2d");
    if (!context) return setShareState("無法建立分享圖");
    await document.fonts?.ready;
    context.fillStyle = "#f7f3e9";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#10253f";
    context.font = "700 46px system-ui, sans-serif";
    context.fillText("你的推估 IQ", 90, 120);
    context.fillStyle = "#3158c9";
    context.font = "800 152px system-ui, sans-serif";
    context.fillText(result.displayIq, 90, 310);
    context.fillStyle = "#10253f";
    context.font = "600 34px system-ui, sans-serif";
    context.fillText(`模型參考區間：${result.interval.lower}～${result.interval.upper}`, 90, 390);
    context.font = "500 30px system-ui, sans-serif";
    context.fillText(`推估百分等級：約高於 ${result.percentile}% 的參照分布`, 90, 448);
    context.fillStyle = "#718096";
    context.font = "700 25px system-ui, sans-serif";
    context.fillText("能力輪廓", 90, 548);
    result.dimensions.forEach((dimension, index) => {
      const y = 610 + index * 82;
      context.fillStyle = "#10253f";
      context.font = "600 27px system-ui, sans-serif";
      context.fillText(dimension.label, 90, y);
      context.fillStyle = "#dce3ee";
      context.fillRect(300, y - 23, 660, 26);
      context.fillStyle = index % 2 ? "#ba4a33" : "#3158c9";
      context.fillRect(300, y - 23, 660 * dimension.score / 100, 26);
    });
    context.fillStyle = "#64748b";
    context.font = "500 24px system-ui, sans-serif";
    context.fillText("Beta・非臨床認知推理推估", 90, 1260);
    canvas.toBlob(async (blob) => {
      if (!blob) return setShareState("無法建立分享圖");
      const file = new File([blob], "推估-IQ-結果.png", { type: "image/png" });
      try {
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ title: "我的推估 IQ", files: [file] });
          setShareState("已開啟分享");
        } else {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = file.name;
          link.click();
          URL.revokeObjectURL(link.href);
          setShareState("分享圖已下載");
        }
      } catch {
        setShareState("分享已取消");
      }
    }, "image/png");
  };

  return (
    <main className="result-screen">
      <section className="result-hero">
        <span className="beta-chip">Beta・暫定參數</span>
        <p className="result-kicker">你的推估 IQ</p>
        <h1>{result.displayIq}</h1>
        <div className="result-facts">
          <p><span>模型參考區間</span><strong>{result.interval.lower}～{result.interval.upper}</strong></p>
          <p><span>推估百分等級</span><strong>約高於 {result.percentile}% 的參照分布</strong></p>
        </div>
        <Image className="result-duck" src="/ducks/result.png" width={126} height={142} alt="戴圓框眼鏡、拿著小證書的原創小鴨插畫" />
      </section>
      {result.unstable ? <div className="quality-notice" role="status"><strong>作答狀態提醒</strong>本次作答狀態不穩定，結果參考區間較寬。</div> : null}
      <section className="profile-card" aria-labelledby="profile-title">
        <div className="section-heading"><h2 id="profile-title">能力輪廓</h2><span>描述性指標</span></div>
        <div className="profile-list">
          {result.dimensions.filter((dimension) => dimension.total >= 4).map((dimension, index) => (
            <div className="profile-row" key={dimension.category}>
              <div><span>{dimension.label}</span><small>{dimension.total} 題</small></div>
              <div className="profile-track" aria-label={`${dimension.label}表現指數 ${dimension.score}`}><span className={index % 2 ? "coral" : "blue"} style={{ width: `${dimension.score}%` }} /></div>
            </div>
          ))}
        </div>
        <p className="profile-note">向度題數有限，只適合觀察本次相對表現，不代表固定能力或人格特質。</p>
      </section>
      <section className="limits-card">
        <h2>如何理解這個結果</h2>
        <p>這是依 80 題暫定難度與鑑別度，以三參數 IRT 的 EAP 方法產生的模型推估。尚未建立台灣成人代表性常模，不等同正式 IQ 測驗。</p>
        <p>請勿用於醫療、教育安置、求職、鑑定或其他高風險決策。</p>
      </section>
      {confirmRetest ? (
        <div className="retest-note" role="dialog" aria-label="重測提醒">
          <p>使用相同題庫重測，練習效應可能讓結果偏高。</p>
          <div><button type="button" onClick={() => setConfirmRetest(false)}>取消</button><button type="button" onClick={onRetest}>仍要重測</button></div>
        </div>
      ) : null}
      <div className="result-actions">
        <button type="button" onClick={() => setConfirmRetest(true)}>再測一次</button>
        <button className="accent" type="button" onClick={share}>{shareState}</button>
        <button type="button" onClick={onHome}>回到首頁</button>
        <button type="button" onClick={onInfo}>查看測驗說明</button>
      </div>
    </main>
  );
}

function InfoScreen({ onBack }: { onBack: () => void }) {
  return (
    <main className="info-screen">
      <button className="back-button" type="button" onClick={onBack}>← 返回</button>
      <span className="beta-chip">🦆 TW-BETA-0.2</span>
      <h1>測驗方法與限制</h1>
      <section><h2>測量內容</h2><p>80 題交替涵蓋抽象、空間、數量、邏輯、工作記憶、語文概念與處理速度。另有 2 題不計分練習題。</p></section>
      <section><h2>如何計分</h2><p>以三參數試題反應模型的 EAP 能力估計計分，四選一猜測率暫設 0.25。題目難度與鑑別度目前都是編製階段的暫定參數；一般題不會因答得快而加分。</p></section>
      <section><h2>結果的界線</h2><p>「推估 IQ」與模型參考區間只描述本題庫下的模型結果。它沒有台灣成人代表性常模，也不是臨床 95% 信賴區間，不等同 WAIS、Stanford–Binet、Raven、Mensa 或心理師施測結果。</p></section>
      <section><h2>隱私</h2><p>不要求姓名、電話、電子郵件或精確生日。作答進度與結果預設只保存在你的裝置；網站目前不蒐集匿名校準資料。</p></section>
      <section><h2>使用限制</h2><p>不得以本結果進行醫療、教育安置、求職、鑑定或其他高風險決策。重測同一題庫可能因練習效應而偏高。</p></section>
    </main>
  );
}

export default function AssessmentApp() {
  const [phase, setPhase] = useState<Phase>("boot");
  const [session, setSession] = useState<SessionData>();
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const [responses, setResponses] = useState<ResponseRecord[]>([]);
  const [quality, setQuality] = useState<QualityRecord>(emptyQuality);
  const [result, setResult] = useState<ScoreResult>();
  const [locked, setLocked] = useState(false);
  const [pressedChoice, setPressedChoice] = useState<Choice>();
  const [practiceExplanation, setPracticeExplanation] = useState<string>();
  const [memoryReady, setMemoryReady] = useState(true);
  const [memoryCycle, setMemoryCycle] = useState(0);
  const [timingReady, setTimingReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [isPaused, setIsPaused] = useState(false);
  const infoOrigin = useRef<"home" | "result">("home");
  const questionStart = useRef(0);
  const pauseStart = useRef<number | undefined>(undefined);
  const hiddenStart = useRef<number | undefined>(undefined);
  const hiddenAccumulated = useRef(0);

  const currentItem = phase === "practice" ? session?.practice[practiceIndex] : session?.items[itemIndex];

  const submitScore = useCallback(async (activeSession: SessionData, scoredResponses: ResponseRecord[], scoredQuality: QualityRecord) => {
    setPhase("scoring");
    setError(undefined);
    try {
      const response = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: activeSession.token, responses: scoredResponses, quality: scoredQuality }),
      });
      if (!response.ok) throw new Error("score failed");
      const scored = await response.json() as ScoreResult;
      setResult(scored);
      setPhase("result");
    } catch {
      setError("結果計算暫時失敗，請保留此頁後再試一次。");
      setPhase("error");
    }
  }, []);

  const handlePause = useCallback(() => {
    if (isPaused) return;
    pauseStart.current = performance.now();
    setIsPaused(true);
  }, [isPaused]);

  const handleResume = useCallback(() => {
    if (!isPaused) return;
    if (pauseStart.current !== undefined) {
      const duration = Math.max(0, performance.now() - pauseStart.current);
      hiddenAccumulated.current += duration;
      pauseStart.current = undefined;
    }
    setIsPaused(false);
  }, [isPaused]);

  const handleReturnHome = useCallback(() => {
    if (isPaused && pauseStart.current !== undefined) {
      const duration = Math.max(0, performance.now() - pauseStart.current);
      hiddenAccumulated.current += duration;
      pauseStart.current = undefined;
    }
    setIsPaused(false);
    setPhase("home");
  }, [isPaused]);

  const handleRestart = useCallback(() => {
    setIsPaused(false);
    pauseStart.current = undefined;
    localStorage.removeItem(STORAGE_KEY);
    void start();
  }, []);

  const handleHomeFromResult = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(undefined);
    setResponses([]);
    setResult(undefined);
    setPhase("home");
  }, []);

  const resumeTest = useCallback(() => {
    if (session) {
      setPhase(practiceIndex < session.practice.length && responses.length === 0 ? "practice" : "test");
    }
  }, [session, practiceIndex, responses.length]);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return setPhase("home");
        const stored = JSON.parse(raw) as unknown;
        if (!isStoredProgress(stored)) {
          localStorage.removeItem(STORAGE_KEY);
          return setPhase("home");
        }
        const restoredQuality = { ...stored.quality, restored: stored.phase !== "result" || stored.quality.restored };
        setSession(stored.session);
        setPracticeIndex(stored.practiceIndex);
        setItemIndex(stored.itemIndex);
        setResponses(stored.responses);
        setQuality(restoredQuality);
        if (stored.phase === "result" && stored.result) {
          setResult(stored.result);
          setPhase("result");
        } else if (stored.phase === "scoring" && stored.responses.length === (stored.session?.items?.length ?? 80)) {
          void submitScore(stored.session, stored.responses, restoredQuality);
        } else if (stored.phase === "home") {
          setPhase("home");
        } else {
          setPhase(stored.phase === "practice" ? "practice" : "test");
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        setPhase("home");
      }
    });
  }, [submitScore]);

  useEffect(() => {
    if (!session || !["home", "practice", "test", "scoring", "result"].includes(phase)) return;
    const stored: StoredProgress = {
      storageVersion: 1,
      phase: phase as StoredProgress["phase"],
      session,
      practiceIndex,
      itemIndex,
      responses,
      quality,
      ...(result ? { result } : {}),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }, [phase, session, practiceIndex, itemIndex, responses, quality, result]);

  useEffect(() => {
    if (!currentItem || !["practice", "test"].includes(phase)) return;
    queueMicrotask(() => {
      setLocked(false);
      setPressedChoice(undefined);
      setPracticeExplanation(undefined);
      setTimingReady(false);
      setMemoryReady(currentItem.stimulus.kind !== "memory");
    });
    hiddenAccumulated.current = 0;
    hiddenStart.current = undefined;
    let frameTwo = 0;
    const frameOne = requestAnimationFrame(() => {
      frameTwo = requestAnimationFrame(() => {
        questionStart.current = performance.now();
        setTimingReady(true);
      });
    });
    return () => {
      cancelAnimationFrame(frameOne);
      cancelAnimationFrame(frameTwo);
    };
  }, [phase, practiceIndex, itemIndex, currentItem]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (phase !== "test" || isPaused) return;
      const now = performance.now();
      if (document.hidden) {
        hiddenStart.current = now;
        setQuality((value) => ({ ...value, hiddenEvents: value.hiddenEvents + 1 }));
        if (currentItem?.stimulus.kind === "memory") setMemoryReady(false);
      } else if (hiddenStart.current !== undefined) {
        const hiddenDuration = Math.max(0, now - hiddenStart.current);
        hiddenAccumulated.current += hiddenDuration;
        hiddenStart.current = undefined;
        setQuality((value) => ({
          ...value,
          hiddenMs: value.hiddenMs + hiddenDuration,
          interrupted: value.interrupted || hiddenDuration > 15_000,
        }));
        if (currentItem?.stimulus.kind === "memory") setMemoryCycle((value) => value + 1);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [phase, currentItem, isPaused]);

  const start = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch("/api/session", { method: "POST" });
      if (!response.ok) throw new Error("session failed");
      const created = await response.json() as SessionData;
      setSession(created);
      setPracticeIndex(0);
      setItemIndex(0);
      setResponses([]);
      setQuality(emptyQuality());
      setResult(undefined);
      setPhase("practice");
    } catch {
      setError("題目暫時無法載入，請稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  const choose = (choice: Choice) => {
    if (!currentItem || !session || locked || !timingReady || isPaused || (currentItem.stimulus.kind === "memory" && !memoryReady)) return;
    setLocked(true);
    setPressedChoice(choice);
    const elapsed = Math.max(0, performance.now() - questionStart.current - hiddenAccumulated.current);
    window.setTimeout(() => {
      if (phase === "practice") {
        setPracticeExplanation(session.practice[practiceIndex].explanation);
        return;
      }
      const newResponse = { id: currentItem.id, choice, responseTimeMs: Math.round(elapsed) };
      const nextResponses = [...responses, newResponse];
      const threshold = currentItem.category === "processingSpeed" ? 450 : 800;
      const nextQuality = elapsed < threshold ? { ...quality, shortResponses: quality.shortResponses + 1 } : quality;
      setResponses(nextResponses);
      setQuality(nextQuality);
      if (itemIndex === session.items.length - 1) {
        void submitScore(session, nextResponses, nextQuality);
      } else {
        setItemIndex((value) => value + 1);
      }
    }, TRANSITION_MS);
  };

  const continuePractice = () => {
    if (!session) return;
    if (practiceIndex < session.practice.length - 1) setPracticeIndex((value) => value + 1);
    else {
      setItemIndex(0);
      setPhase("test");
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && ["practice", "test"].includes(phase)) {
        if (isPaused) handleResume();
        else handlePause();
        return;
      }
      if (isPaused || !["practice", "test"].includes(phase) || practiceExplanation) return;
      if (event.key.toLowerCase() === "a") choose("A");
      if (event.key.toLowerCase() === "b") choose("B");
      if (event.key.toLowerCase() === "c") choose("C");
      if (event.key.toLowerCase() === "d") choose("D");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const onMemoryReady = useCallback(() => setMemoryReady(true), []);
  const openInfo = (origin: "home" | "result") => {
    infoOrigin.current = origin;
    setPhase("info");
  };
  const retest = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPhase("home");
    void start();
  };

  const hasUnfinished = Boolean(session && session.items.length > 0 && phase === "home" && responses.length > 0 && responses.length < session.items.length);
  const unfinishedNumber = responses.length + 1;

  const loadingMessage = useMemo(() => phase === "scoring" ? "正在估計能力與參考區間…" : "載入中…", [phase]);

  if (phase === "boot" || phase === "scoring") return <main className="status-screen"><DuckMark /><p>{loadingMessage}</p></main>;
  if (phase === "home") {
    return (
      <HomeScreen
        onStart={() => void start()}
        onResume={resumeTest}
        hasUnfinished={hasUnfinished}
        unfinishedNumber={unfinishedNumber}
        onInfo={() => openInfo("home")}
        loading={loading}
        error={error}
      />
    );
  }
  if (phase === "info") return <InfoScreen onBack={() => setPhase(infoOrigin.current === "result" ? "result" : "home")} />;
  if ((phase === "practice" || phase === "test") && currentItem && session) {
    return (
      <QuestionScreen
        item={currentItem}
        current={phase === "practice" ? practiceIndex + 1 : itemIndex + 1}
        total={phase === "practice" ? session.practice.length : session.items.length}
        practice={phase === "practice"}
        locked={locked}
        pressedChoice={pressedChoice}
        memoryCycle={memoryCycle}
        memoryReady={memoryReady}
        timingReady={timingReady}
        explanation={practiceExplanation}
        isPaused={isPaused}
        onChoose={choose}
        onMemoryReady={onMemoryReady}
        onContinue={continuePractice}
        onPause={handlePause}
        onResume={handleResume}
        onHome={handleReturnHome}
        onRestart={handleRestart}
      />
    );
  }
  if (phase === "result" && result) {
    return <ResultScreen result={result} onRetest={retest} onHome={handleHomeFromResult} onInfo={() => openInfo("result")} />;
  }
  return (
    <main className="status-screen error-screen">
      <h1>結果還沒有算完</h1>
      <p>{error ?? "請再試一次。"}</p>
      <button className="primary-button" type="button" onClick={() => session && void submitScore(session, responses, quality)}>重新計算</button>
    </main>
  );
}
