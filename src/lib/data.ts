import fs from "fs";
import path from "path";
import type { DailySnapshot, DashboardData, CityStat, CategoryStat, TrendPoint, JobRecord } from "./types";

/** 清洗文本中的损坏字符（Unicode 替换字符 �） */
function cleanText(s: string): string {
  if (!s) return s;
  return s.replace(/�/g, "").replace(/\?{2,}/g, "");
}

/** 递归清洗对象中所有字符串字段 */
function cleanJobData(obj: any): any {
  if (typeof obj === "string") return cleanText(obj);
  if (Array.isArray(obj)) return obj.map(cleanJobData);
  if (obj && typeof obj === "object") {
    const cleaned: any = {};
    for (const [k, v] of Object.entries(obj)) {
      cleaned[k] = cleanJobData(v);
    }
    return cleaned;
  }
  return obj;
}

const DATA_DIR = path.join(process.cwd(), "data", "daily");

/** 读取所有每日快照文件，返回按日期排序的列表 */
export function loadAllSnapshots(): DailySnapshot[] {
  if (!fs.existsSync(DATA_DIR)) return [];

  const files = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort(); // YYYY-MM-DD.json 自然排序就是时间序

  const snapshots: DailySnapshot[] = [];
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf-8");
      const data = cleanJobData(JSON.parse(raw));

      // 兼容两种数据格式：带 list 的完整快照 或 纯 list 数组
      if (data.list && Array.isArray(data.list)) {
        snapshots.push(data as DailySnapshot);
      } else if (Array.isArray(data)) {
        snapshots.push({
          fetchTime: file.replace(".json", ""),
          areaCode: "",
          areaCodeName: "广西",
          totalCount: data.length,
          list: data,
          queryLog: [],
        });
      }
    } catch {
      // 跳过损坏文件
    }
  }
  return snapshots;
}

/** 从所有快照提取全部岗位记录（去重，取最新 publishDate） */
export function getAllJobs(snapshots?: DailySnapshot[]): JobRecord[] {
  const ss = snapshots ?? loadAllSnapshots();
  const seen = new Map<string, JobRecord>();

  for (const s of ss) {
    for (const job of s.list) {
      const existing = seen.get(job.jobId);
      if (!existing || job.publishDate > existing.publishDate) {
        seen.set(job.jobId, job);
      }
    }
  }

  return Array.from(seen.values());
}

/** 生成仪表盘所需的全部统计数据 */
export function computeDashboard(): DashboardData {
  const snapshots = loadAllSnapshots();
  const jobs = getAllJobs(snapshots);

  // 城市统计：优先用 job.city，没有则用 queryLog 汇总数据
  const cityMap = new Map<string, { count: number; payLows: number[]; payHighs: number[] }>();
  const hasCityTag = jobs.some((j) => !!j.city);
  if (hasCityTag) {
    for (const j of jobs) {
      const city = j.city ?? j.areaCodeName ?? "未知";
      const entry = cityMap.get(city) || { count: 0, payLows: [], payHighs: [] };
      entry.count++;
      if (j.lowMonthPay > 0) entry.payLows.push(j.lowMonthPay);
      if (j.highMonthPay > 0) entry.payHighs.push(j.highMonthPay);
      cityMap.set(city, entry);
    }
  } else {
    // 回退：用 queryLog 中的城市级统计数据
    const logs = snapshots.flatMap((s) => s.queryLog || []);
    const cityLogs = logs.filter((l) => !l.categoryCode); // 只看"全部"类别的查询，避免重复
    for (const log of cityLogs) {
      const entry = cityMap.get(log.city) || { count: 0, payLows: [], payHighs: [] };
      entry.count += log.rawCount || 0;
      cityMap.set(log.city, entry);
    }
    // 如果 queryLog 也没有，回退到 areaCodeName
    if (cityMap.size === 0) {
      for (const j of jobs) {
        const city = j.areaCodeName || "未知";
        const entry = cityMap.get(city) || { count: 0, payLows: [], payHighs: [] };
        entry.count++;
        cityMap.set(city, entry);
      }
    }
  }

  const cityStats: CityStat[] = Array.from(cityMap.entries())
    .map(([city, v]) => ({
      city,
      count: v.count,
      avgPayLow: v.payLows.length ? Math.round(v.payLows.reduce((a, b) => a + b, 0) / v.payLows.length * 10) / 10 : 0,
      avgPayHigh: v.payHighs.length ? Math.round(v.payHighs.reduce((a, b) => a + b, 0) / v.payHighs.length * 10) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // 岗位类别统计（从 jobName 简单归类）
  const categoryMap = new Map<string, number>();
  for (const j of jobs) {
    const cat = j.categoryName ?? classifyJob(j.jobName);
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
  }
  const categoryStats: CategoryStat[] = Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  // 时间趋势
  const trend: TrendPoint[] = snapshots.map((s) => ({
    date: s.fetchTime ? s.fetchTime.slice(0, 10) : "",
    count: s.totalCount ?? s.list.length,
  }));

  // 学历分布
  const degreeMap = new Map<string, number>();
  for (const j of jobs) {
    const d = j.degreeName || "不限";
    degreeMap.set(d, (degreeMap.get(d) || 0) + 1);
  }
  const degreeDist = Array.from(degreeMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // 热门公司 Top 20
  const companyMap = new Map<string, number>();
  for (const j of jobs) {
    const c = j.recName || "未知";
    companyMap.set(c, (companyMap.get(c) || 0) + 1);
  }
  const topCompanies = Array.from(companyMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return {
    totalJobs: jobs.length,
    cityCount: cityMap.size,
    categoryCount: categoryMap.size,
    latestFetch: snapshots.length > 0
      ? (snapshots[snapshots.length - 1].fetchTime || "").slice(0, 10)
      : "暂无数据",
    cityStats,
    categoryStats: categoryStats.slice(0, 20),
    trend,
    degreeDist,
    topCompanies,
  };
}

/** 简单的岗位名→类别归类（当原始数据没有 categoryName 时用） */
function classifyJob(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("前端") || n.includes("web") || n.includes("ui") || n.includes("ux") || n.includes("美工") || n.includes("设计")) return "前端/UI/设计";
  if (n.includes("java") || n.includes("后端") || n.includes("python") || n.includes("php") || n.includes("c++") || n.includes("golang") || n.includes("开发") || n.includes("软件")) return "软件开发";
  if (n.includes("算法") || n.includes("数据") || n.includes("ai") || n.includes("机器学习") || n.includes("深度学习") || n.includes("nlp")) return "算法/数据/AI";
  if (n.includes("运维") || n.includes("devops") || n.includes("网络") || n.includes("安全") || n.includes("测试")) return "运维/测试/安全";
  if (n.includes("行政") || n.includes("人事") || n.includes("hr") || n.includes("招聘") || n.includes("前台") || n.includes("文员") || n.includes("秘书")) return "行政/人事";
  if (n.includes("财务") || n.includes("会计") || n.includes("审计") || n.includes("出纳")) return "财务/审计";
  if (n.includes("销售") || n.includes("客户") || n.includes("市场") || n.includes("商务") || n.includes("营销") || n.includes("运营") || n.includes("电商") || n.includes("短视频") || n.includes("直播")) return "销售/市场/运营";
  if (n.includes("培训") || n.includes("讲师") || n.includes("教师") || n.includes("教育")) return "教育/培训";
  if (n.includes("经理") || n.includes("主管") || n.includes("总监") || n.includes("管理")) return "管理岗";
  if (n.includes("护士") || n.includes("医生") || n.includes("护理") || n.includes("康复") || n.includes("医学")) return "医疗健康";
  if (n.includes("建筑") || n.includes("工程") || n.includes("施工") || n.includes("造价")) return "建筑/工程";
  if (n.includes("电子") || n.includes("电路") || n.includes("嵌入式") || n.includes("通信")) return "电子/通信";
  if (n.includes("物流") || n.includes("仓储") || n.includes("采购") || n.includes("供应链")) return "物流/供应链";
  if (n.includes("法务") || n.includes("律师") || n.includes("法律")) return "法务";
  if (n.includes("翻译") || n.includes("英语") || n.includes("日语")) return "翻译";
  if (n.includes("金融") || n.includes("银行") || n.includes("保险") || n.includes("证券") || n.includes("风控")) return "金融/保险";
  return "其他";
}

/** 获取当前存在的所有采集日期 */
export function getAvailableDates(): string[] {
  if (!fs.existsSync(DATA_DIR)) return [];
  return fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""))
    .sort();
}
