"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Plus, Minus, ArrowUpRight, MapPin } from "lucide-react";

interface JobRow {
  jobId: string;
  jobName: string;
  recName?: string;
  areaCodeName?: string;
  city?: string;
  degreeName?: string;
  lowMonthPay?: number;
  highMonthPay?: number;
  recProperty?: string;
}

interface Props {
  todayDate: string;
  yesterdayDate: string;
  todayCount: number;
  yesterdayCount: number;
  newJobs: JobRow[];
  removedJobs: JobRow[];
  newByCity: [string, number][];
}

const SHOW_LIMIT = 20;

export function DailyReport({
  todayDate,
  yesterdayDate,
  todayCount,
  yesterdayCount,
  newJobs,
  removedJobs,
  newByCity,
}: Props) {
  const [showAllNew, setShowAllNew] = useState(false);
  const [showAllRemoved, setShowAllRemoved] = useState(false);

  const diff = todayCount - yesterdayCount;
  const displayedNew = showAllNew ? newJobs : newJobs.slice(0, SHOW_LIMIT);
  const displayedRemoved = showAllRemoved ? removedJobs : removedJobs.slice(0, SHOW_LIMIT);

  return (
    <div className="space-y-5">
      {/* 概览卡片 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <p className="text-[13px] text-muted-foreground">今日岗位总数</p>
          <p className="text-2xl font-bold text-foreground">{todayCount.toLocaleString()}</p>
          <p className="text-[11px] text-muted-foreground">{todayDate}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <p className="text-[13px] text-muted-foreground">昨日岗位总数</p>
          <p className="text-2xl font-bold text-foreground">{yesterdayCount.toLocaleString()}</p>
          <p className="text-[11px] text-muted-foreground">{yesterdayDate}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-card">
          <div className="flex items-center gap-1.5">
            <Plus className="h-4 w-4 text-emerald-600" />
            <p className="text-[13px] text-emerald-700">今日新增</p>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{newJobs.length.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-600">条岗位</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-5 shadow-card">
          <div className="flex items-center gap-1.5">
            <Minus className="h-4 w-4 text-red-500" />
            <p className="text-[13px] text-red-600">已下架</p>
          </div>
          <p className="text-2xl font-bold text-red-600">{removedJobs.length.toLocaleString()}</p>
          <p className="text-[11px] text-red-500">条岗位</p>
        </div>
      </div>

      {/* 变化趋势 */}
      {diff !== 0 && (
        <div className="rounded-xl border border-border bg-card p-4 shadow-card flex items-center gap-3">
          {diff > 0 ? (
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          ) : (
            <TrendingDown className="h-5 w-5 text-red-500" />
          )}
          <div>
            <span className="text-sm font-medium text-foreground">
              相比昨日，
              {diff > 0 ? "增加" : "减少"}了{" "}
              <span className={diff > 0 ? "text-emerald-600" : "text-red-500"}>
                {Math.abs(diff).toLocaleString()}
              </span>{" "}
              条岗位
            </span>
            <p className="text-[11px] text-muted-foreground">
              净变化 = 新增 {newJobs.length} - 下架 {removedJobs.length}
            </p>
          </div>
        </div>
      )}

      {/* 新增岗位按城市 */}
      {newByCity.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-foreground">
            <MapPin className="h-4 w-4 text-brand-blue" />
            新增岗位城市分布
          </h3>
          <div className="flex flex-wrap gap-2">
            {newByCity.map(([city, count]) => (
              <span
                key={city}
                className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-[12px] font-medium text-accent-foreground"
              >
                {city}
                <span className="text-emerald-600">+{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 新增岗位列表 */}
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="text-[13px] font-semibold text-foreground flex items-center gap-2">
            <Plus className="h-4 w-4 text-emerald-600" />
            今日新增岗位
          </h3>
          <span className="text-[11px] text-muted-foreground">共 {newJobs.length} 条</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">岗位</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">公司</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">城市</th>
              </tr>
            </thead>
            <tbody>
              {displayedNew.length === 0 && (
                <tr><td colSpan={3} className="text-center py-8 text-muted-foreground">无新增岗位</td></tr>
              )}
              {displayedNew.map((j) => (
                <tr key={j.jobId} className="border-b border-border hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium text-foreground">{j.jobName}</td>
                  <td className="px-3 py-2 text-muted-foreground max-w-[180px] truncate">{j.recName || ""}</td>
                  <td className="px-3 py-2 text-muted-foreground">{j.city || j.areaCodeName || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {newJobs.length > SHOW_LIMIT && (
          <button
            onClick={() => setShowAllNew(!showAllNew)}
            className="w-full py-2 text-[12px] text-primary hover:bg-accent/50 transition-colors"
          >
            {showAllNew ? "收起" : `查看全部 ${newJobs.length} 条新增岗位 →`}
          </button>
        )}
      </div>

      {/* 下架岗位 */}
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="text-[13px] font-semibold text-foreground flex items-center gap-2">
            <Minus className="h-4 w-4 text-red-500" />
            已下架岗位
          </h3>
          <span className="text-[11px] text-muted-foreground">共 {removedJobs.length} 条</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">岗位</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">公司</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">城市</th>
              </tr>
            </thead>
            <tbody>
              {displayedRemoved.length === 0 && (
                <tr><td colSpan={3} className="text-center py-8 text-muted-foreground">无下架岗位</td></tr>
              )}
              {displayedRemoved.map((j) => (
                <tr key={j.jobId} className="border-b border-border hover:bg-muted/30 opacity-60">
                  <td className="px-3 py-2 font-medium text-foreground">{j.jobName}</td>
                  <td className="px-3 py-2 text-muted-foreground max-w-[180px] truncate">{j.recName || ""}</td>
                  <td className="px-3 py-2 text-muted-foreground">{j.city || j.areaCodeName || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {removedJobs.length > SHOW_LIMIT && (
          <button
            onClick={() => setShowAllRemoved(!showAllRemoved)}
            className="w-full py-2 text-[12px] text-primary hover:bg-accent/50 transition-colors"
          >
            {showAllRemoved ? "收起" : `查看全部 ${removedJobs.length} 条下架岗位 →`}
          </button>
        )}
      </div>
    </div>
  );
}
