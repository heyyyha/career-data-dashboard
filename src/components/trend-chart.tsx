"use client";

interface TrendPoint {
  date: string;
  count: number;
}

interface TrendChartProps {
  title: string;
  data: TrendPoint[];
}

/** 纯 CSS 趋势条 —— 用竖线 + 数字替代 SVG 折线图 */
export function TrendChart({ title, data }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h3 className="mb-4 text-[13px] font-semibold text-foreground">{title}</h3>
        <p className="text-center text-[12px] text-muted-foreground py-6">
          暂无趋势数据（需积累多天采集结果）
        </p>
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <h3 className="mb-4 text-[13px] font-semibold text-foreground">{title}</h3>

      {data.length === 1 ? (
        <p className="text-center text-[12px] text-muted-foreground py-4">
          仅有一次采集数据（{data[0].date}：{data[0].count.toLocaleString()} 条），持续积累中
        </p>
      ) : (
        <div className="flex items-end gap-1 h-[180px] px-1">
          {data.map((point, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-[24px]">
              <span className="text-[10px] text-muted-foreground font-medium">
                {point.count.toLocaleString()}
              </span>
              <div
                className="w-full rounded-t-sm transition-all duration-500"
                style={{
                  height: `${Math.max(4, (point.count / maxVal) * 140)}px`,
                  backgroundColor: "#1a56db",
                  opacity: 0.8,
                }}
                title={`${point.date}: ${point.count} 条`}
              />
              <span className="text-[9px] text-muted-foreground text-center leading-tight">
                {point.date.slice(5) || point.date}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
