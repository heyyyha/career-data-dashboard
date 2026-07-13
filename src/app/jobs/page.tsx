import { loadAllSnapshots } from "@/lib/data";
import { JobTable } from "./job-table";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default function JobsPage() {
  const snapshots = loadAllSnapshots();
  // 把所有岗位 flatten，带上采集日期
  const allJobs = snapshots.flatMap((s) =>
    (s.list || []).map((j) => ({
      ...j,
      _fetchDate: (s.fetchTime || "").slice(0, 10),
      _city: (j as any).city || j.areaCodeName || "未知",
      _category: (j as any).categoryName || "",
      _degree: j.degreeName || "不限",
      _company: j.recName || "",
      _pay: j.lowMonthPay && j.highMonthPay
        ? `${j.lowMonthPay}K-${j.highMonthPay}K`
        : j.lowMonthPay
        ? `${j.lowMonthPay}K起`
        : j.highMonthPay
        ? `最高${j.highMonthPay}K`
        : "面议",
      _property: j.recProperty || "",
      _scale: j.recScale || "",
      _date: j.publishDate ? new Date(j.publishDate).toLocaleDateString("zh-CN") : "",
    }))
  );

  // 去重（同 jobId 取最新）
  const seen = new Map<string, any>();
  for (const j of allJobs) {
    const existing = seen.get(j.jobId);
    if (!existing || j.publishDate > existing.publishDate) {
      seen.set(j.jobId, j);
    }
  }
  const jobs = Array.from(seen.values());

  // 提取所有可选值用于筛选下拉
  const cities = Array.from(new Set(jobs.map((j) => j._city))).sort();
  const degrees = Array.from(new Set(jobs.map((j) => j._degree))).sort();
  const properties = Array.from(new Set(jobs.map((j) => j._property).filter(Boolean))).sort();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> 返回仪表盘
          </Link>
          <span className="text-sm font-semibold text-foreground">岗位明细查询</span>
          <span className="ml-auto text-[11px] text-muted-foreground">
            共 {jobs.length.toLocaleString()} 条岗位
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <JobTable jobs={jobs} cities={cities} degrees={degrees} properties={properties} />
      </main>
    </div>
  );
}
