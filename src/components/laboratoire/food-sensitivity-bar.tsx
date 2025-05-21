interface HorizontalBarProps {
  value: number;
  max: number;
  color?: string;
  height?: number;
  className?: string;
}

export function HorizontalBar({
  value,
  max,
  color = "#3b82f6",
  height = 8,
  className = ""
}: HorizontalBarProps) {
  // Calculate the percentage
  const percentage = (value / max) * 100;

  return (
    <div className={`w-full bg-muted rounded-full overflow-hidden ${className}`} style={{ height: `${height}px` }}>
      <div
        className="h-full rounded-full transition-all duration-300 ease-in-out"
        style={{
          width: `${percentage}%`,
          backgroundColor: color
        }}
      />
    </div>
  );
}
