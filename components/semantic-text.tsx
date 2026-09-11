type SemanticTextProps = {
  segments: string[];
  className?: string;
};

export function SemanticText({ segments, className = "" }: SemanticTextProps) {
  return (
    <span className={`semantic-text ${className}`.trim()}>
      {segments.map((segment, index) => (
        <span className="semantic-segment" key={`${segment}-${index}`}>
          {segment}
        </span>
      ))}
    </span>
  );
}
