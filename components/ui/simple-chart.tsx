import { cn } from "@/lib/utils";

interface DataPoint {
  date: string;
  value: number;
  goal?: number;
}

interface SimpleChartProps {
  data: DataPoint[];
  height?: number;
  className?: string;
  color?: string;
  goalColor?: string;
}

export function SimpleChart({ 
  data, 
  height = 200, 
  className,
  color = "bg-blue-500",
  goalColor = "border-red-400"
}: SimpleChartProps) {
  if (data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center text-muted-foreground", className)} style={{ height }}>
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => Math.max(d.value, d.goal || 0)));
  const minValue = 0;
  const range = maxValue - minValue;

  return (
    <div className={cn("relative", className)} style={{ height }}>
      {/* Chart area */}
      <div className="flex items-end justify-between h-full px-2 pb-8">
        {data.map((point, index) => {
          const barHeight = range > 0 ? ((point.value - minValue) / range) * (height - 40) : 0;
          const goalHeight = point.goal && range > 0 ? ((point.goal - minValue) / range) * (height - 40) : 0;
          
          return (
            <div key={index} className="relative flex-1 flex flex-col items-center">
              {/* Goal line */}
              {point.goal && goalHeight > 0 && (
                <div 
                  className={cn("absolute w-full border-t-2 border-dashed", goalColor)}
                  style={{ bottom: `${goalHeight + 32}px` }}
                />
              )}
              
              {/* Bar */}
              <div className="relative w-full max-w-8 mx-1">
                <div
                  className={cn("w-full rounded-t-sm transition-all duration-300", color)}
                  style={{ height: `${Math.max(barHeight, 2)}px` }}
                />
                
                {/* Value label */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                  {Math.round(point.value)}
                </div>
              </div>
              
              {/* Date label */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
                {point.date}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className={cn("w-3 h-3 rounded", color)} />
          <span>Actual</span>
        </div>
        {data.some(d => d.goal) && (
          <div className="flex items-center gap-1">
            <div className={cn("w-3 h-1 border-t-2 border-dashed", goalColor)} />
            <span>Goal</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showValue?: boolean;
  unit?: string;
  color?: string;
}

export function ProgressRing({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  className,
  showValue = true,
  unit = "",
  color = "text-blue-500"
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min((value / max) * 100, 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted/20"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn("transition-all duration-500", color)}
        />
      </svg>
      
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">
            {Math.round(value)}{unit}
          </span>
          <span className="text-sm text-muted-foreground">
            of {max}{unit}
          </span>
        </div>
      )}
    </div>
  );
}