"use client";

import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";

interface JobRow {
  jobId: string;
  jobName: string;
  _city: string;
  _category: string;
  _degree: string;
  _company: string;
  _pay: string;
  _property: string;
  _scale: string;
  _date: string;
  _fetchDate: string;
}

const PAGE_SIZE = 30;

export function JobTable({
  jobs,
  cities,
  degrees,
  properties,
}: {
  jobs: JobRow[];
  cities: string[];
  degrees: string[];
  properties: string[];
}) {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [degree, setDegree] = useState("");
  const [property, setProperty] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let result = jobs;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.jobName.toLowerCase().includes(q) ||
          j._company.toLowerCase().includes(q) ||
          (j._category && j._category.includes(q))
      );
    }
    if (city) result = result.filter((j) => j._city === city);
    if (degree) result = result.filter((j) => j._degree === degree);
    if (property) result = result.filter((j) => j._property === property);
    return result;
  }, [jobs, search, city, degree, property]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function clearFilters() {
    setSearch("");
    setCity("");
    setDegree("");
    setProperty("");
    setPage(0);
  }

  const hasFilters = search || city || degree || property;

  return (
    <div className="space-y-4">
      {/* 筛选栏 */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="flex flex-wrap gap-3 items-end">
          {/* 搜索框 */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] text-muted-foreground mb-1">关键词搜索</label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                placeholder="岗位名、公司名…"
                className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* 城市筛选 */}
          <div>
            <label className="block text-[11px] text-muted-foreground mb-1">城市</label>
            <select
              value={city}
              onChange={(e) => { setCity(e.target.value); setPage(0); }}
              className="h-9 rounded-md border border-input bg-background px-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring min-w-[100px]"
            >
              <option value="">全部</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* 学历筛选 */}
          <div>
            <label className="block text-[11px] text-muted-foreground mb-1">学历</label>
            <select
              value={degree}
              onChange={(e) => { setDegree(e.target.value); setPage(0); }}
              className="h-9 rounded-md border border-input bg-background px-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring min-w-[100px]"
            >
              <option value="">全部</option>
              {degrees.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* 公司性质筛选 */}
          <div>
            <label className="block text-[11px] text-muted-foreground mb-1">公司性质</label>
            <select
              value={property}
              onChange={(e) => { setProperty(e.target.value); setPage(0); }}
              className="h-9 rounded-md border border-input bg-background px-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring min-w-[100px]"
            >
              <option value="">全部</option>
              {properties.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 h-9 px-3 text-[12px] text-muted-foreground hover:text-foreground rounded-md border border-border"
            >
              <X className="h-3 w-3" /> 清除
            </button>
          )}
        </div>
      </div>

      {/* 结果数 */}
      <div className="flex items-center justify-between text-[12px] text-muted-foreground">
        <span>
          {hasFilters ? `筛选结果：${filtered.length.toLocaleString()} 条` : `共 ${filtered.length.toLocaleString()} 条`}
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="p-1 rounded hover:bg-muted disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span>
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="p-1 rounded hover:bg-muted disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* 表格 */}
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground whitespace-nowrap">岗位名称</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground whitespace-nowrap">公司</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground whitespace-nowrap">城市</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground whitespace-nowrap hidden sm:table-cell">学历</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground whitespace-nowrap">薪资</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground whitespace-nowrap hidden md:table-cell">公司性质</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground whitespace-nowrap hidden md:table-cell">规模</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground whitespace-nowrap hidden lg:table-cell">发布日期</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground">
                    没有匹配的岗位
                  </td>
                </tr>
              )}
              {paged.map((job) => (
                <tr key={job.jobId} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2 font-medium text-foreground max-w-[160px] truncate" title={job.jobName}>
                    {job.jobName}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground max-w-[180px] truncate" title={job._company}>
                    {job._company}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{job._city}</td>
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap hidden sm:table-cell">{job._degree}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="text-emerald-600 font-medium">{job._pay}</span>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap hidden md:table-cell">{job._property}</td>
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap hidden md:table-cell">{job._scale}</td>
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap hidden lg:table-cell">{job._date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
