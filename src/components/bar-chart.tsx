"use client";

interface BarItem {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  title: string;
  data: BarItem[];
  maxBars?: number;
  barColor?: string;
  formatValue?: (v: number) => string;
}

/** 纯 CSS 水平条形图 */
export function BarChart({
  title,
  data,
  maxBars = 14,
  barColor = "#1a56db",
  formatValue = (v) => v.toString(),
}: BarChartProps) {
  const items = data.slice(0, maxBars);
  const maxVal = Math.max(...items.map((d) => d.value), 1);

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <h3 className="mb-4 text-[13px] font-semibold text-foreground">{title}</h3>
      <div className="space-y-1.5">
        {items.length === 0 && (
          <p className="text-center text-[12px] text-muted-foreground py-8">暂无数据</p>
        )}
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-[12px]">
            <span
              className="w-[100px] shrink-0 truncate text-right text-foreground"
              title={item.label}
            >
              {item.label}
            </span>
            <div className="flex-1 h-5 bg-muted rounded-sm overflow-hidden">
              <div
                className="h-full rounded-sm transition-all duration-500"
                style={{
                  width: `${Math.max(1, (item.value / maxVal) * 100)}%`,
                  backgroundColor: item.color ?? barColor,
                  opacity: 0.8,
                }}
              />
            </div>
            <span className="w-12 shrink-0 text-right text-muted-foreground font-medium">
              {formatValue(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
