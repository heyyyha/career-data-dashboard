/**
 * 广西岗位数据每日采集脚本
 *
 * 用法：
 *   node scripts/collect-jobs.mjs
 *
 * GitHub Actions 每天自动跑 → 结果存 data/daily/YYYY-MM-DD.json → 自动 commit
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data", "daily");

// ============ API 配置 ============
// 国家大学生就业服务平台，无需鉴权
const BASE_URL = "https://job.ncss.cn/student/jobs/jobslist/ajax/";

// 广西 14 个地级市
const CITIES = [
  { name: "南宁市", code: "450100" },
  { name: "柳州市", code: "450200" },
  { name: "桂林市", code: "450300" },
  { name: "梧州市", code: "450400" },
  { name: "北海市", code: "450500" },
  { name: "防城港市", code: "450600" },
  { name: "钦州市", code: "450700" },
  { name: "贵港市", code: "450800" },
  { name: "玉林市", code: "450900" },
  { name: "百色市", code: "451000" },
  { name: "贺州市", code: "451100" },
  { name: "河池市", code: "451200" },
  { name: "来宾市", code: "451300" },
  { name: "崇左市", code: "451400" },
];

// 29 个标准职位类别
const CATEGORIES = [
  { code: "01", name: "计算机/网络/技术类" },
  { code: "02", name: "电子/电器/通信技术类" },
  { code: "03", name: "行政/后勤类" },
  { code: "04", name: "翻译类" },
  { code: "05", name: "财务/审计/统计类" },
  { code: "06", name: "法律类" },
  { code: "07", name: "教育培训类" },
  { code: "08", name: "销售/客服类" },
  { code: "09", name: "市场/媒介/公关类" },
  { code: "10", name: "设计/创意类" },
  { code: "11", name: "金融/保险类" },
  { code: "12", name: "建筑/房地产类" },
  { code: "13", name: "机械/设备类" },
  { code: "14", name: "化工/制药类" },
  { code: "15", name: "物流/仓储类" },
  { code: "16", name: "医疗/护理类" },
  { code: "17", name: "环境/安全类" },
  { code: "18", name: "生产/制造类" },
  { code: "19", name: "酒店/餐饮/旅游类" },
  { code: "20", name: "农林牧渔类" },
  { code: "21", name: "人力资源类" },
  { code: "22", name: "管理/高管类" },
  { code: "23", name: "文体/影视类" },
  { code: "24", name: "能源/矿产类" },
  { code: "25", name: "生物/医药类" },
  { code: "26", name: "咨询/顾问类" },
  { code: "27", name: "质量管理类" },
  { code: "28", name: "采购/贸易类" },
  { code: "29", name: "其他类" },
];

const PAGE_SIZE = 500;
const DELAY_MS = 800; // 请求间隔，礼貌爬取

// ============ 工具函数 ============

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

/** 调用真实 API */
async function fetchJobs(cityCode, categoryCode = "", offset = 1) {
  const params = new URLSearchParams({
    jobType: "",
    areaCode: cityCode,
    jobName: "",
    monthPay: "",
    industrySectors: "",
    property: "",
    categoryCode: categoryCode,
    memberLevel: "",
    recruitType: "",
    offset: String(offset),
    limit: String(PAGE_SIZE),
    keyUnits: "",
    degreeCode: "",
    sourcesName: "0",
    sourcesType: "",
  });

  const url = `${BASE_URL}?${params.toString()}`;

  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 CareerDataMonitor/1.0",
        Accept: "application/json",
        Referer: "https://job.ncss.cn/",
      },
    });

    if (!resp.ok) {
      console.error(`  HTTP ${resp.status} for ${cityCode}`);
      return null;
    }

    const text = await resp.text();
    try {
      return JSON.parse(text);
    } catch {
      console.error(`  JSON parse error for ${cityCode}`);
      return null;
    }
  } catch (e) {
    console.error(`  Request failed for ${cityCode}: ${e.message}`);
    return null;
  }
}

/** 解析 API 返回，提取岗位列表 */
function extractJobs(data) {
  if (!data) return { list: [], total: 0 };
  // ncss.cn 实际返回格式：{ flag, data: { list, pagenation: { count, total, limit, offset } } }
  if (data.data?.list && Array.isArray(data.data.list)) {
    return {
      list: data.data.list,
      total: data.data.pagenation?.count || data.data.list.length,
    };
  }
  if (data.list && Array.isArray(data.list)) return { list: data.list, total: data.total || data.list.length };
  if (Array.isArray(data)) return { list: data, total: data.length };
  return { list: [], total: 0 };
}

// ============ 主流程 ============

async function collect() {
  const startTime = new Date();
  console.log(`[${startTime.toLocaleString("zh-CN")}] 开始采集广西 14 市岗位数据…`);
  console.log(`API: ${BASE_URL}\n`);

  const allJobs = [];
  const seen = new Set();
  const queryLog = [];

  for (const city of CITIES) {
    console.log(`📡 ${city.name}…`);
    await sleep(DELAY_MS);

    const data = await fetchJobs(city.code);
    const { list: jobs, total } = extractJobs(data);
    const hitCap = jobs.length >= PAGE_SIZE;

    let newAdded = 0;
    for (const job of jobs) {
      if (!seen.has(job.jobId)) {
        seen.add(job.jobId);
        job.city = city.name;
        allJobs.push(job);
        newAdded++;
      }
    }

    queryLog.push({
      city: city.name,
      areaCode: city.code,
      categoryCode: "",
      categoryName: "全部",
      rawCount: jobs.length,
      uniqueInQuery: jobs.length,
      newAdded,
      hitCap,
      total,
    });

    console.log(`  → ${jobs.length} 条 (新增 ${newAdded}) / 总计 ${total}` + (hitCap ? " ⚠️触发上限" : ""));

    // 触发上限时按类别细分
    if (hitCap) {
      for (const cat of CATEGORIES) {
        await sleep(DELAY_MS);
        const catData = await fetchJobs(city.code, cat.code);
        const { list: catJobs } = extractJobs(catData);

        let catNew = 0;
        for (const job of catJobs) {
          if (!seen.has(job.jobId)) {
            seen.add(job.jobId);
            job.city = city.name;
            job.categoryName = cat.name;
            allJobs.push(job);
            catNew++;
          }
        }

        const catHitCap = catJobs.length >= PAGE_SIZE;
        queryLog.push({
          city: city.name,
          areaCode: city.code,
          categoryCode: cat.code,
          categoryName: cat.name,
          rawCount: catJobs.length,
          uniqueInQuery: catJobs.length,
          newAdded: catNew,
          hitCap: catHitCap,
        });

        if (catJobs.length > 0) {
          console.log(`    ${cat.name}: ${catJobs.length} 条 (新增 ${catNew})` + (catHitCap ? " ⚠️" : ""));
        }
      }
    }
  }

  const elapsed = Math.round((Date.now() - startTime.getTime()) / 600) / 100;

  const snapshot = {
    areaCode: "45",
    areaCodeName: "广西",
    strategy: "14市 + 超限自动按29类细分",
    filterConditions: {
      city: "广西（14个地级市分别查询）",
      industry: "全部",
      companyProperty: "全部",
      jobCategory: "全部（超限城市自动按29类细分）",
      jobSource: "全部",
      companyType: "全部",
      recruitType: "全部",
    },
    pagination: {
      fetchedCount: allJobs.length,
      cappedCities: queryLog.filter((q) => q.hitCap && !q.categoryCode).map((q) => q.city),
      queryCount: queryLog.length,
      elapsedMinutes: elapsed,
    },
    queryLog,
    fetchTime: new Date().toLocaleString("zh-CN", { hour12: false }),
    list: allJobs,
  };

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const filename = `${formatDate(startTime)}.json`;
  const filepath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2), "utf-8");

  console.log(`\n✅ 采集完成: ${allJobs.length} 条岗位 (去重)`);
  console.log(`   耗时 ${elapsed} 分钟, ${queryLog.length} 次查询`);
  console.log(`   → data/daily/${filename}`);
}

collect().catch((e) => {
  console.error("采集失败:", e.message);
  process.exit(1);
});
