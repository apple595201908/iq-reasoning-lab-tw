import type { ReactNode } from "react";

type VisualStimulusProps = {
  visualKey: string;
  compact?: boolean;
  label?: string;
};

const ink = "#10253f";
const blue = "#4267df";
const coral = "#e9664a";
const cream = "#fffaf0";

function Frame({ children, compact, label }: { children: ReactNode; compact?: boolean; label?: string }) {
  return (
    <svg
      aria-label={label}
      className={compact ? "option-svg" : "stimulus-svg"}
      role="img"
      viewBox="0 0 320 170"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
}

const Question = ({ x, y }: { x: number; y: number }) => (
  <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="28" fontWeight="800" fill={blue}>?</text>
);

function MatrixFill() {
  return <>
    <rect x="78" y="15" width="72" height="62" rx="10" fill={cream} stroke={ink} strokeWidth="3" />
    <circle cx="114" cy="46" r="17" fill="none" stroke={ink} strokeWidth="4" />
    <rect x="170" y="15" width="72" height="62" rx="10" fill={cream} stroke={ink} strokeWidth="3" />
    <circle cx="206" cy="46" r="17" fill={ink} />
    <rect x="78" y="94" width="72" height="62" rx="10" fill={cream} stroke={ink} strokeWidth="3" />
    <rect x="98" y="111" width="32" height="32" rx="3" fill="none" stroke={ink} strokeWidth="4" />
    <rect x="170" y="94" width="72" height="62" rx="10" fill="#eef2ff" stroke={blue} strokeWidth="3" strokeDasharray="7 6" />
    <Question x={206} y={125} />
  </>;
}

function PracticeAlternation() {
  return <>
    {[55, 125, 195].map((x, index) => index === 1
      ? <rect key={x} x={x - 20} y="65" width="40" height="40" rx="4" fill="none" stroke={ink} strokeWidth="5" />
      : <circle key={x} cx={x} cy="85" r="20" fill="none" stroke={ink} strokeWidth="5" />)}
    <rect x="235" y="56" width="58" height="58" rx="10" fill="#eef2ff" stroke={blue} strokeWidth="3" strokeDasharray="7 6" />
    <Question x={264} y={85} />
  </>;
}

function MirrorL() {
  return <>
    <path d="M55 45v72h48" fill="none" stroke={ink} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="45" cy="38" r="8" fill={coral} stroke={ink} strokeWidth="3" />
    <line x1="160" y1="21" x2="160" y2="149" stroke={blue} strokeWidth="3" strokeDasharray="7 7" />
    <path d="M148 32l12-13 12 13M148 138l12 13 12-13" fill="none" stroke={blue} strokeWidth="3" />
    <Question x={235} y={84} />
  </>;
}

function GapCircle({ x, y, rotation = 0, dot = false }: { x: number; y: number; rotation?: number; dot?: boolean }) {
  return <g transform={`translate(${x} ${y}) rotate(${rotation})`}>
    <path d="M5 -8 A10 10 0 1 1 -5 -8" fill="none" stroke={ink} strokeWidth="2.8" strokeLinecap="round" />
    {dot ? <circle cx="6" cy="6" r="2.7" fill={coral} /> : null}
  </g>;
}

function SearchPair() {
  const rotations = [0, 45, 90, 135, 180, 225, 270, 315, 0, 45, 90, 135, 180, 225, 180, 315];
  return <>
    {rotations.map((rotation, index) => <GapCircle key={index} x={100 + (index % 4) * 40} y={28 + Math.floor(index / 4) * 38} rotation={rotation} dot={index >= 8 && index !== 14} />)}
  </>;
}

function MatrixCount() {
  return <>
    {[0, 1, 2].flatMap((row) => [0, 1].map((column) => {
      const x = 78 + column * 92;
      const y = 10 + row * 52;
      const missing = row === 2 && column === 1;
      return <g key={`${row}-${column}`}>
        <rect x={x} y={y} width="74" height="42" rx="8" fill={missing ? "#eef2ff" : cream} stroke={missing ? blue : ink} strokeWidth="2.5" strokeDasharray={missing ? "6 5" : undefined} />
        {missing ? <Question x={x + 37} y={y + 21} /> : Array.from({ length: row + 1 }, (_, dot) => <circle key={dot} cx={x + 37 + (dot - row / 2) * 18} cy={y + 21} r="6" fill="none" stroke={ink} strokeWidth="3" />)}
      </g>;
    }))}
  </>;
}

function RotateHook() {
  return <>
    <path d="M65 120V48h70v35h-30" fill="none" stroke={ink} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="55" cy="41" r="8" fill={coral} stroke={ink} strokeWidth="3" />
    <path d="M179 56a55 55 0 0 1 55 55" fill="none" stroke={blue} strokeWidth="4" strokeLinecap="round" />
    <path d="M224 101l12 12 6-16" fill="none" stroke={blue} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <text x="208" y="42" textAnchor="middle" fontSize="17" fontWeight="800" fill={blue}>90°</text>
  </>;
}

function ShapeFillCycle() {
  const shapes = ["circle-o", "circle-f", "tri-o", "tri-f", "square-o", "question"];
  return <>
    {shapes.map((shape, index) => {
      const x = 38 + index * 49;
      if (shape === "circle-o") return <circle key={shape} cx={x} cy="85" r="17" fill="none" stroke={ink} strokeWidth="4" />;
      if (shape === "circle-f") return <circle key={shape} cx={x} cy="85" r="17" fill={ink} />;
      if (shape === "tri-o") return <polygon key={shape} points={`${x},66 ${x - 19},103 ${x + 19},103`} fill="none" stroke={ink} strokeWidth="4" strokeLinejoin="round" />;
      if (shape === "tri-f") return <polygon key={shape} points={`${x},66 ${x - 19},103 ${x + 19},103`} fill={ink} />;
      if (shape === "square-o") return <rect key={shape} x={x - 17} y="68" width="34" height="34" fill="none" stroke={ink} strokeWidth="4" />;
      return <g key={shape}><rect x={x - 22} y="63" width="44" height="44" rx="8" fill="#eef2ff" stroke={blue} strokeWidth="2.5" strokeDasharray="6 5" /><Question x={x} y={85} /></g>;
    })}
  </>;
}

function ArrowSearch() {
  const values = ["↗", "↑", "↘", "←", "↗", "↓", "↗", "→", "↙", "↑", "→", "↓", "↗", "←", "↘", "↙", "→", "↑", "↓", "↗", "↑", "↘", "←", "↓", "→"];
  return <>{values.map((value, index) => <text key={index} x={72 + (index % 5) * 44} y={28 + Math.floor(index / 5) * 30} textAnchor="middle" dominantBaseline="middle" fontSize="22" fontWeight="800" fill={ink}>{value}</text>)}</>;
}

function CubeNet() {
  const faces = [
    [124, 12, "A"], [124, 52, "D"], [84, 92, "E"], [124, 92, "C"], [164, 92, "F"], [124, 132, "B"],
  ];
  return <>{faces.map(([x, y, label]) => <g key={label}>
    <rect x={x} y={y} width="40" height="38" fill={label === "A" ? "#eef2ff" : cream} stroke={ink} strokeWidth="2.5" />
    <text x={Number(x) + 20} y={Number(y) + 20} dominantBaseline="middle" textAnchor="middle" fontWeight="800" fontSize="16" fill={ink}>{label}</text>
  </g>)}</>;
}

function MatrixOverlay({ xor = false }: { xor?: boolean }) {
  const cell = (x: number, y: number, lines: string[], missing = false) => <g key={`${x}-${y}`}>
    <rect x={x} y={y} width="66" height="62" rx="8" fill={missing ? "#eef2ff" : cream} stroke={missing ? blue : ink} strokeWidth="2.3" strokeDasharray={missing ? "6 5" : undefined} />
    {missing ? <Question x={x + 33} y={y + 31} /> : lines.map((line) => {
      const paths: Record<string, string> = {
        h: `M${x + 15} ${y + 31}h36`, v: `M${x + 33} ${y + 13}v36`, d1: `M${x + 17} ${y + 15}l32 32`, d2: `M${x + 49} ${y + 15}l-32 32`,
      };
      return <path key={line} d={paths[line]} stroke={ink} strokeWidth="4" strokeLinecap="round" />;
    })}
  </g>;
  return <>
    {xor ? <>
      {cell(48, 18, ["h", "v", "d1"])}{cell(127, 18, ["v", "d1", "d2"])}{cell(206, 18, ["h", "d2"])}
      {cell(48, 92, ["h", "v", "d2"])}{cell(127, 92, ["v", "d1", "d2"])}{cell(206, 92, [], true)}
    </> : <>
      {cell(48, 18, ["h"])}{cell(127, 18, ["v"])}{cell(206, 18, ["h", "v"])}
      {cell(48, 92, ["d1"])}{cell(127, 92, ["d2"])}{cell(206, 92, [], true)}
    </>}
  </>;
}

function PaperFold() {
  return <>
    <g transform="translate(15 34)"><rect width="68" height="92" fill={cream} stroke={ink} strokeWidth="3"/><line x1="34" y1="0" x2="34" y2="92" stroke={blue} strokeWidth="2" strokeDasharray="5 4"/><path d="M59 46H39m0 0 9-8m-9 8 9 8" fill="none" stroke={coral} strokeWidth="4"/></g>
    <path d="M91 80h22m-8-8 8 8-8 8" fill="none" stroke={ink} strokeWidth="3"/>
    <g transform="translate(122 34)"><rect width="46" height="92" fill={cream} stroke={ink} strokeWidth="3"/><line x1="0" y1="46" x2="46" y2="46" stroke={blue} strokeWidth="2" strokeDasharray="5 4"/><path d="M23 17v24m0 0-8-9m8 9 8-9" fill="none" stroke={coral} strokeWidth="4"/></g>
    <path d="M176 80h22m-8-8 8 8-8 8" fill="none" stroke={ink} strokeWidth="3"/>
    <g transform="translate(208 80)"><rect width="46" height="46" fill={cream} stroke={ink} strokeWidth="3"/><circle cx="34" cy="13" r="5" fill={ink}/></g>
    <text x="283" y="103" textAnchor="middle" fontSize="15" fontWeight="800" fill={blue}>展開後？</text>
  </>;
}

function ArrowDots() {
  const directions = [0, 90, 180, 270, 0];
  const dots = [1, 1, 2, 2, 3];
  return <>{directions.map((rotation, index) => {
    const x = 42 + index * 55;
    return <g key={index} transform={`translate(${x} 72)`}>
      <path d="M0 20V-18m0 0-10 12m10-12L10-6" transform={`rotate(${rotation})`} fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {Array.from({ length: dots[index] }, (_, dot) => <circle key={dot} cx={(dot - (dots[index] - 1) / 2) * 10} cy="48" r="3.7" fill={coral} />)}
    </g>;
  })}<Question x={307} y={84} /></>;
}

function TransformTwo() {
  return <>
    <path d="M38 117V52h58v28h37" fill="none" stroke={ink} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="29" cy="44" r="7" fill={coral} stroke={ink} strokeWidth="3" />
    <text x="171" y="57" textAnchor="middle" fontSize="17" fontWeight="800" fill={blue}>① ↻ 90°</text>
    <text x="171" y="101" textAnchor="middle" fontSize="17" fontWeight="800" fill={blue}>② 上下翻面</text>
    <Question x={265} y={84} />
  </>;
}

function Polygon({ cx, cy, sides, dotAt = 0, line = "none", size = 18 }: { cx: number; cy: number; sides: number; dotAt?: number; line?: "none" | "slash" | "backslash" | "horizontal"; size?: number }) {
  const points = Array.from({ length: sides }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / sides;
    return `${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`;
  }).join(" ");
  const dots = [[-10, -10], [10, -10], [10, 10], [-10, 10]];
  const [dx, dy] = dots[dotAt % 4];
  return <g>
    <polygon points={points} fill="none" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
    {line === "slash" ? <line x1={cx - 10} y1={cy + 10} x2={cx + 10} y2={cy - 10} stroke={ink} strokeWidth="3" /> : null}
    {line === "backslash" ? <line x1={cx - 10} y1={cy - 10} x2={cx + 10} y2={cy + 10} stroke={ink} strokeWidth="3" /> : null}
    {line === "horizontal" ? <line x1={cx - 12} y1={cy} x2={cx + 12} y2={cy} stroke={ink} strokeWidth="3" /> : null}
    <circle cx={cx + dx} cy={cy + dy} r="3.5" fill={coral} />
  </g>;
}

function PolygonMatrix({ triple = false }: { triple?: boolean }) {
  const positions = triple
    ? [
        [3, 0, "horizontal"], [4, 1, "slash"], [5, 2, "backslash"],
        [4, 3, "slash"], [5, 0, "backslash"], [6, 1, "horizontal"],
        [5, 2, "backslash"], [6, 3, "horizontal"], [0, 0, "none"],
      ] as const
    : [
        [3, 0, "none"], [4, 1, "none"], [5, 2, "none"],
        [5, 2, "none"], [6, 3, "none"], [0, 0, "none"],
      ] as const;
  const columns = 3;
  return <>{positions.map(([sides, dotAt, line], index) => {
    const x = 90 + (index % columns) * 70;
    const y = (triple ? 35 : 53) + Math.floor(index / columns) * (triple ? 50 : 68);
    return sides === 0
      ? <g key={index}><rect x={x - 23} y={y - 22} width="46" height="44" rx="8" fill="#eef2ff" stroke={blue} strokeWidth="2.5" strokeDasharray="6 5"/><Question x={x} y={y}/></g>
      : <Polygon key={index} cx={x} cy={y} sides={sides} dotAt={dotAt} line={line} size={triple ? 17 : 21} />;
  })}</>;
}

function TransformThree() {
  return <>
    <path d="M34 119V92h35V65h35V38h35" fill="none" stroke={ink} strokeWidth="7" strokeLinejoin="round" />
    <circle cx="29" cy="124" r="6" fill={ink}/><circle cx="145" cy="33" r="7" fill={cream} stroke={ink} strokeWidth="3"/>
    <text x="207" y="44" fontSize="16" fontWeight="800" fill={blue}>① ↻ 90°</text>
    <text x="207" y="82" fontSize="16" fontWeight="800" fill={blue}>② 上下翻面</text>
    <text x="207" y="120" fontSize="16" fontWeight="800" fill={blue}>③ ↻ 180°</text>
  </>;
}

function TargetSearch() {
  const targetIndices = new Set([1, 6, 14, 20, 27, 34]);
  return <>
    <text x="45" y="25" fontSize="13" fontWeight="800" fill={blue}>目標</text>
    <GapCircle x={91} y={21} rotation={0} dot />
    <line x1="118" y1="8" x2="118" y2="35" stroke="#ccd4df" strokeWidth="2"/>
    {Array.from({ length: 36 }, (_, index) => {
      const target = targetIndices.has(index);
      return <GapCircle key={index} x={72 + (index % 6) * 34} y={52 + Math.floor(index / 6) * 22} rotation={target ? 0 : [45, 90, 135, 180, 225, 270, 315][index % 7]} dot={target || index % 3 === 0} />;
    })}
  </>;
}

function SearchGapLeftEasy() {
  const rotations = [0, 90, 180, 45, 90, 180, 270, 0, 45, 180, 90, 135, 180, 90, 0, 45];
  return <>
    {rotations.map((rotation, index) => (
      <GapCircle key={index} x={100 + (index % 4) * 40} y={28 + Math.floor(index / 4) * 38} rotation={rotation} />
    ))}
  </>;
}

function MatrixLinesMedium() {
  return <>
    <rect x="78" y="15" width="72" height="62" rx="10" fill={cream} stroke={ink} strokeWidth="3" />
    <line x1="90" y1="46" x2="138" y2="46" stroke={ink} strokeWidth="4" strokeLinecap="round" />
    <rect x="170" y="15" width="72" height="62" rx="10" fill={cream} stroke={ink} strokeWidth="3" />
    <line x1="182" y1="38" x2="230" y2="38" stroke={ink} strokeWidth="4" strokeLinecap="round" />
    <line x1="182" y1="54" x2="230" y2="54" stroke={ink} strokeWidth="4" strokeLinecap="round" />
    <rect x="78" y="94" width="72" height="62" rx="10" fill={cream} stroke={ink} strokeWidth="3" />
    <line x1="114" y1="106" x2="114" y2="144" stroke={ink} strokeWidth="4" strokeLinecap="round" />
    <rect x="170" y="94" width="72" height="62" rx="10" fill="#eef2ff" stroke={blue} strokeWidth="3" strokeDasharray="7 6" />
    <Question x={206} y={125} />
  </>;
}

function SearchStarMedium() {
  const starIndices = new Set([2, 7, 11, 16, 21, 24]);
  return <>
    {Array.from({ length: 25 }, (_, index) => {
      const x = 80 + (index % 5) * 40;
      const y = 25 + Math.floor(index / 5) * 28;
      const isStar = starIndices.has(index);
      return isStar ? (
        <text key={index} x={x} y={y} fontSize="20" textAnchor="middle" dominantBaseline="central" fill={ink}>★</text>
      ) : (
        <text key={index} x={x} y={y} fontSize="18" textAnchor="middle" dominantBaseline="central" fill="#627083">
          {["▲", "■", "●", "◆"][index % 4]}
        </text>
      );
    })}
  </>;
}

function SearchDotOffset() {
  return <>
    {Array.from({ length: 36 }, (_, index) => {
      const x = 70 + (index % 6) * 36;
      const y = 22 + Math.floor(index / 6) * 24;
      const isOffset = index === 22;
      return (
        <g key={index}>
          <circle cx={x} cy={y} r="8" fill="none" stroke={ink} strokeWidth="2.5" />
          <circle cx={x + (isOffset ? -4.5 : 0)} cy={y} r="2.8" fill={coral} />
        </g>
      );
    })}
  </>;
}

function MatrixLatinTriple() {
  const items = [
    { shape: "circle", fill: "hollow", dot: "top" },
    { shape: "square", fill: "stripe", dot: "center" },
    { shape: "triangle", fill: "solid", dot: "bottom" },
    { shape: "square", fill: "solid", dot: "bottom" },
    { shape: "triangle", fill: "hollow", dot: "top" },
    { shape: "circle", fill: "stripe", dot: "center" },
    { shape: "triangle", fill: "stripe", dot: "center" },
    { shape: "circle", fill: "solid", dot: "bottom" },
    { missing: true },
  ];
  return <>
    {items.map((it, index) => {
      const x = 90 + (index % 3) * 70;
      const y = 30 + Math.floor(index / 3) * 48;
      if (it.missing) {
        return (
          <g key={index}>
            <rect x={x - 24} y={y - 20} width="48" height="40" rx="8" fill="#eef2ff" stroke={blue} strokeWidth="2.5" strokeDasharray="6 5" />
            <Question x={x} y={y} />
          </g>
        );
      }
      return (
        <g key={index} transform={`translate(${x} ${y})`}>
          {it.shape === "circle" ? (
            <circle cx="0" cy="0" r="14" fill={it.fill === "solid" ? ink : it.fill === "stripe" ? "#d0d7e2" : "none"} stroke={ink} strokeWidth="2.5" />
          ) : it.shape === "square" ? (
            <rect x="-13" y="-13" width="26" height="26" rx="3" fill={it.fill === "solid" ? ink : it.fill === "stripe" ? "#d0d7e2" : "none"} stroke={ink} strokeWidth="2.5" />
          ) : (
            <polygon points="0,-14 -14,12 14,12" fill={it.fill === "solid" ? ink : it.fill === "stripe" ? "#d0d7e2" : "none"} stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
          )}
          <circle cx="0" cy={it.dot === "top" ? -6 : it.dot === "bottom" ? 6 : 0} r="2.5" fill={coral} />
        </g>
      );
    })}
  </>;
}

function OptionVisual({ visualKey }: { visualKey: string }) {
  if (visualKey.includes("square-filled")) return <rect x="128" y="53" width="64" height="64" rx="5" fill={ink}/>;
  if (visualKey.includes("square-outline")) return <rect x="128" y="53" width="64" height="64" rx="5" fill="none" stroke={ink} strokeWidth="7"/>;
  if (visualKey.includes("circle-filled")) return <circle cx="160" cy="85" r="34" fill={ink}/>;
  if (visualKey.includes("circle-outline")) return <circle cx="160" cy="85" r="34" fill="none" stroke={ink} strokeWidth="7"/>;
  if (visualKey.includes("triangle-outline")) return <polygon points="160,45 119,121 201,121" fill="none" stroke={ink} strokeWidth="7" strokeLinejoin="round"/>;
  if (visualKey.includes("triangle-filled")) return <polygon points="160,45 119,121 201,121" fill={ink}/>;
  if (visualKey === "mirror-l-correct") return <><path d="M224 46v73h-50" fill="none" stroke={ink} strokeWidth="11" strokeLinecap="round"/><circle cx="235" cy="38" r="9" fill={coral} stroke={ink} strokeWidth="3"/></>;
  if (visualKey === "mirror-l-wrong") return <><path d="M95 46v73h50" fill="none" stroke={ink} strokeWidth="11" strokeLinecap="round"/><circle cx="84" cy="126" r="9" fill={coral} stroke={ink} strokeWidth="3"/></>;
  if (visualKey === "mirror-l-unchanged") return <><path d="M95 46v73h50" fill="none" stroke={ink} strokeWidth="11" strokeLinecap="round"/><circle cx="84" cy="38" r="9" fill={coral} stroke={ink} strokeWidth="3"/></>;
  if (visualKey === "mirror-l-horizontal") return <><path d="M95 124V51h50" fill="none" stroke={ink} strokeWidth="11" strokeLinecap="round"/><circle cx="84" cy="132" r="9" fill={coral} stroke={ink} strokeWidth="3"/></>;
  if (visualKey.startsWith("dots-")) {
    const vertical = visualKey.endsWith("vertical");
    const count = visualKey.includes("two") ? 2 : visualKey.includes("four") ? 4 : 3;
    return <>{Array.from({length:count},(_,index)=>index-(count-1)/2).map((value) => <circle key={value} cx={160 + (vertical ? 0 : value * 31)} cy={85 + (vertical ? value * 31 : 0)} r="10" fill="none" stroke={ink} strokeWidth="5"/>)}</>;
  }
  if (visualKey.includes("hook-rotate")) {
    const angle = visualKey === "hook-rotate-counter" ? -90 : visualKey === "hook-rotate-half" ? 180 : visualKey.endsWith("wrong") ? -90 : 90;
    return <g transform={`rotate(${angle} 100 84)`}>
      <path d="M65 120V48h70v35h-30" fill="none" stroke={ink} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="55" cy="41" r="8" fill={coral} stroke={ink} strokeWidth="3"/>
    </g>;
  }
  if (visualKey === "overlay-both" || visualKey.startsWith("xor-") || visualKey === "overlay-cross" || visualKey === "overlay-diagonal" || visualKey === "overlay-empty") {
    const lineSets: Record<string,string[]> = {
      "overlay-cross": ["M110 85h100", "M160 35v100"],
      "overlay-diagonal": ["M120 45l80 80", "M200 45l-80 80"],
      "overlay-empty": [],
      "xor-correct": ["M105 85h110", "M125 45l70 80"],
      "xor-vertical-slash": ["M160 35v100", "M125 45l70 80"],
      "xor-horizontal-back": ["M105 85h110", "M125 125l70-80"],
      "xor-wrong": ["M105 85h110", "M160 35v100", "M120 45l80 80", "M200 45l-80 80"],
      "overlay-both": ["M105 85h110", "M160 35v100", "M120 45l80 80", "M200 45l-80 80"],
    };
    const lines = lineSets[visualKey] ?? [];
    return <>{lines.map((d) => <path key={d} d={d} stroke={ink} strokeWidth="7" strokeLinecap="round"/>)}</>;
  }
  if (visualKey.startsWith("paper-fold")) {
    const points = visualKey.endsWith("four") ? [[132,58],[188,58],[132,112],[188,112]]
      : visualKey.endsWith("eight") ? [[124,50],[160,50],[196,50],[124,120],[160,120],[196,120],[124,85],[196,85]]
      : visualKey.endsWith("four-diagonal") ? [[128,53],[145,70],[175,100],[192,117]]
      : [[132,58],[188,112]];
    return <><rect x="105" y="31" width="110" height="108" fill={cream} stroke={ink} strokeWidth="5"/>{points.map(([x,y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="7" fill={coral} stroke={ink} strokeWidth="2"/>)}</>;
  }
  if (visualKey.startsWith("arrow-")) {
    const rotation = visualKey.includes("down") ? 180 : visualKey.includes("up") ? 0 : 90;
    const count = visualKey.includes("two") ? 2 : 3;
    return <><path d="M160 108V52m0 0-17 20m17-20 17 20" transform={`rotate(${rotation} 160 85)`} fill="none" stroke={ink} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>{Array.from({length:count},(_,index)=>index-(count-1)/2).map((value) => <circle key={value} cx={160+value*22} cy="133" r="6" fill={coral}/>)}</>;
  }
  if (visualKey.startsWith("transform-two")) {
    const shape = <><path d="M38 117V52h58v28h37" fill="none" stroke={ink} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/><circle cx="29" cy="44" r="9" fill={coral} stroke={ink} strokeWidth="3"/></>;
    if (visualKey === "transform-two-correct") {
      return <g transform="matrix(1 0 0 -1 0 170)"><g transform="rotate(90 85 85)">{shape}</g></g>;
    }
    if (visualKey === "transform-two-wrong") return <g transform="rotate(90 85 85)">{shape}</g>;
    if (visualKey === "transform-two-flip") return <g transform="matrix(1 0 0 -1 0 170)">{shape}</g>;
    return <g transform="rotate(90 85 85)"><g transform="matrix(1 0 0 -1 0 170)">{shape}</g></g>;
  }
  if (visualKey.startsWith("polygon-")) {
    const sides = visualKey.includes("eight") ? 8 : visualKey.includes("seven") ? 7 : 6;
    const dotAt = visualKey.includes("-br") ? 2 : 0;
    return <Polygon cx={160} cy={85} sides={sides} dotAt={dotAt} size={48}/>;
  }
  if (visualKey.startsWith("transform-three")) {
    const correct = visualKey.endsWith("correct");
    const bothTop = visualKey.endsWith("both-top");
    const swapped = visualKey.endsWith("swapped");
    const filled = correct ? [217,31] : bothTop ? [99,31] : swapped ? [99,132] : [99,31];
    const hollow = correct ? [99,132] : bothTop ? [217,31] : swapped ? [217,31] : [217,132];
    return <><path d="M106 125V95h35V65h35V35h35" fill="none" stroke={ink} strokeWidth="8"/><circle cx={filled[0]} cy={filled[1]} r="7" fill={ink}/><circle cx={hollow[0]} cy={hollow[1]} r="8" fill={cream} stroke={ink} strokeWidth="3"/></>;
  }
  if (visualKey.startsWith("matrix-triple")) {
    const correct = visualKey.endsWith("correct");
    const sides = visualKey.endsWith("six") ? 6 : 7;
    const dotAt = visualKey.endsWith("dot") ? 1 : 0;
    return <Polygon cx={160} cy={85} sides={sides} dotAt={dotAt} line={correct || visualKey.endsWith("six") || visualKey.endsWith("dot") ? "slash" : "backslash"} size={50}/>;
  }
  return <Question x={160} y={85}/>;
}

export function VisualStimulus({ visualKey, compact = false, label }: VisualStimulusProps) {
  let content: ReactNode;
  switch (visualKey) {
    case "practice-alternation": content = <PracticeAlternation />; break;
    case "matrix-fill": content = <MatrixFill />; break;
    case "mirror-l-easy": content = <MirrorL />; break;
    case "search-pair-easy": content = <SearchPair />; break;
    case "matrix-count": content = <MatrixCount />; break;
    case "rotate-hook-medium": content = <RotateHook />; break;
    case "shape-fill-cycle": content = <ShapeFillCycle />; break;
    case "search-arrows-medium": content = <ArrowSearch />; break;
    case "cube-net-medium": content = <CubeNet />; break;
    case "matrix-overlay": content = <MatrixOverlay />; break;
    case "paper-fold-hard": content = <PaperFold />; break;
    case "arrow-dots-hard": content = <ArrowDots />; break;
    case "matrix-xor-hard": content = <MatrixOverlay xor />; break;
    case "transform-two-step": content = <TransformTwo />; break;
    case "polygon-matrix-hard": content = <PolygonMatrix />; break;
    case "transform-three-step": content = <TransformThree />; break;
    case "search-target-extreme": content = <TargetSearch />; break;
    case "matrix-triple-extreme": content = <PolygonMatrix triple />; break;
    case "search-gap-left-easy": content = <SearchGapLeftEasy />; break;
    case "matrix-lines-medium": content = <MatrixLinesMedium />; break;
    case "search-star-medium": content = <SearchStarMedium />; break;
    case "search-dot-offset": content = <SearchDotOffset />; break;
    case "matrix-latin-triple": content = <MatrixLatinTriple />; break;
    default: content = <OptionVisual visualKey={visualKey} />;
  }
  return <Frame compact={compact} label={label}>{content}</Frame>;
}
