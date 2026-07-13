import { computeDashboard, getAvailableDates } from "@/lib/data";
import { StatCard } from "@/components/stat-card";
import { BarChart } from "@/components/bar-chart";
import { TrendChart } from "@/components/trend-chart";
import { Briefcase, Folders, Calendar, TrendingUp, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const d = computeDashboard();
  const dates = getAvailableDates();

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-blue to-brand-teal text-white shadow-sm">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-[15px] font-semibold text-foreground">
              广西岗位数据监测平台
            </h1>
            <p className="truncate text-[11px] text-muted-foreground">
              招培就一体化 · 产业需求与人才供给数据闭环
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/story"
              className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-[12px] font-medium text-accent-foreground transition-colors hover:bg-accent/70"
            >
              数据闭环叙事
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-5">
        {/* 关键数字卡片 */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            title="监测岗位总数"
            value={d.totalJobs.toLocaleString()}
            subtitle="去重后有效岗位"
            icon={<Briefcase className="h-5 w-5 text-brand-blue" />}
          />
          <StatCard
            title="覆盖城市"
            value={d.cityCount}
            subtitle="广西 14 个地级市"
            icon={<MapPin className="h-5 w-5 text-brand-teal" />}
          />
          <StatCard
            title="岗位类别"
            value={d.categoryCount}
            subtitle="自动归类统计"
            icon={<Folders className="h-5 w-5 text-brand-orange" />}
          />
          <StatCard
            title="最新采集"
            value={d.latestFetch}
            subtitle={`共 ${dates.length} 次采集`}
            icon={<Calendar className="h-5 w-5 text-brand-green" />}
          />
        </div>

        {/* 趋势图 */}
        <TrendChart title="岗位数量趋势（按采集日期）" data={d.trend} />

        {/* 城市分布 + 岗位类别 */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <BarChart
            title="各城市岗位数量分布"
            data={d.cityStats.map((c) => ({ label: c.city, value: c.count }))}
            barColor="#1a56db"
          />
          <BarChart
            title="岗位类别 Top 14"
            data={d.categoryStats.map((c) => ({ label: c.category, value: c.count }))}
            barColor="#0d9488"
          />
        </div>

        {/* 学历分布 + 热招公司 */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <BarChart
            title="学历要求分布"
            data={d.degreeDist.map((x) => ({ label: x.name, value: x.count }))}
            barColor="#ea580c"
          />
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="mb-4 text-[13px] font-semibold text-foreground">
              热招公司 Top 20
            </h3>
            <div className="max-h-[360px] overflow-y-auto space-y-1">
              {d.topCompanies.map((c, i) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-[12px] hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-muted text-[10px] font-medium text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="text-foreground">{c.name}</span>
                  </div>
                  <span className="font-medium text-muted-foreground">
                    {c.count} 个岗位
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
