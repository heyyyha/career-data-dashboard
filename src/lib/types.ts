// 单条岗位记录
export interface JobRecord {
  jobName: string;
  highMonthPay: number;
  lowMonthPay: number;
  updateDate: number;
  headCount: number;
  recruitType: string;
  publishDate: number;
  degreeName: string;
  recName: string;
  areaCodeName: string;
  jobId: string;
  recScale: string;
  recProperty: string;
  major: string;
  recTags: string;
  city?: string; // 从所属查询关联的城市
  categoryName?: string; // 从所属查询关联的职位类别
}

// 每日采集数据的完整结构
export interface DailySnapshot {
  fetchTime: string;
  areaCode: string;
  areaCodeName: string;
  totalCount: number;
  list: JobRecord[];
  queryLog: QueryLogEntry[];
}

export interface QueryLogEntry {
  city: string;
  areaCode: string;
  categoryCode: string;
  categoryName: string;
  rawCount: number;
  hitCap: boolean;
}

// 聚合统计
export interface CityStat {
  city: string;
  count: number;
  avgPayLow: number;
  avgPayHigh: number;
}

export interface CategoryStat {
  category: string;
  count: number;
}

export interface TrendPoint {
  date: string;
  count: number;
}

export interface DashboardData {
  totalJobs: number;
  cityCount: number;
  categoryCount: number;
  latestFetch: string;
  cityStats: CityStat[];
  categoryStats: CategoryStat[];
  trend: TrendPoint[];
  degreeDist: { name: string; count: number }[];
  topCompanies: { name: string; count: number }[];
}
