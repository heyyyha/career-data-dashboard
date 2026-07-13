import { loadAllSnapshots } from "@/lib/data";
import { DailyReport } from "./daily-report";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default function DailyPage() {
  const snapshots = loadAllSnapshots();

  if (snapshots.length < 2) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
            <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> 返回仪表盘
            </Link>
            <span className="text-sm font-semibold text-foreground">每日发现</span>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-12 text-center">
          <p className="text-muted-foreground">需要至少两次采集数据才能对比。目前只有 {snapshots.length} 次采集记录，继续积累中。</p>
        </main>
      </div>
    );
  }

  // 取最近两次
  const today = snapshots[snapshots.length - 1];
  const yesterday = snapshots[snapshots.length - 2];

  const todayIds = new Set(today.list.map((j) => j.jobId));
  const yesterdayIds = new Set(yesterday.list.map((j) => j.jobId));

  // 新增岗位（今天有，昨天没有）
  const newJobs = today.list.filter((j) => !yesterdayIds.has(j.jobId));

  // 下架岗位（昨天有，今天没了）
  const removedJobs = yesterday.list.filter((j) => !todayIds.has(j.jobId));

  // 按城市统计新增
  const newByCity = new Map<string, number>();
  for (const j of newJobs) {
    const city = (j as any).city || j.areaCodeName || "未知";
    newByCity.set(city, (newByCity.get(city) || 0) + 1);
  }

  const todayDate = (today.fetchTime || "").slice(0, 10);
  const yesterdayDate = (yesterday.fetchTime || "").slice(0, 10);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> 返回仪表盘
          </Link>
          <span className="text-sm font-semibold text-foreground">每日发现</span>
          <span className="ml-auto text-[11px] text-muted-foreground">
            {todayDate} vs {yesterdayDate}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <DailyReport
          todayDate={todayDate}
          yesterdayDate={yesterdayDate}
          todayCount={today.list.length}
          yesterdayCount={yesterday.list.length}
          newJobs={newJobs}
          removedJobs={removedJobs}
          newByCity={Array.from(newByCity.entries()).sort((a, b) => b[1] - a[1])}
        />
      </main>
    </div>
  );
}
