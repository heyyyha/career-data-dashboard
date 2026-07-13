/**
 * 广西岗位数据每日采集脚本
 *
 * 用法：
 *   node scripts/collect-jobs.mjs
 *
 * GitHub Actions 定时运行此脚本，将采集结果存入 data/daily/YYYY-MM-DD.json
 * 随后的 git commit + push 将数据持久化到仓库。
 *
 * ===== 请根据实际 API 配置以下参数 =====
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data", "daily");

// ============ API 配置 ============
// 国家大学生就业服务平台（或其他招聘平台）的搜索接口
// 根据实际采集来源修改 BASE_URL 和请求参数

const BASE_URL = process.env.JOB_API_URL || "https://job.ncss.cn/api/jobs/search";

// 广西 14 个地级市的 areaCode
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

// 29 个标准职位类别 code（当城市返回 500 条上限时按类别细分）
const CATEGORIES = [
  "01", "02", "03", "04", "05", "06", "07", "08", "09", "10",
  "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
  "21", "22", "23", "24", "25", "26", "27", "28", "29",
];

const PAGE_SIZE = 500;
const DELAY_MS = 800; // 请求间隔，避免被限流

// ============ 工具函数 ============

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

/** 调用 API 查询岗位 */
async function fetchJobs(cityCode, categoryCode = "", page = 1) {
  const params = new URLSearchParams({
    areaCode: cityCode,
    page: String(page),
    size: String(PAGE_SIZE),
  });
  if (categoryCode) params.set("jobCategory", categoryCode);

  const url = `${BASE_URL}?${params}`;
  const resp = await fetch(url, {
    headers: {
      "User-Agent": "CareerDataMonitor/1.0",
      Accept: "application/json",
    },
  });

  if (!resp.ok) {
    console.error(`  HTTP ${resp.status} for ${url}`);
    return null;
  }

  return resp.json();
}

// ============ 主流程 ============

async function collect() {
  const startTime = new Date();
  console.log(`[${startTime.toISOString()}] 开始采集广西 14 市岗位数据…\n`);

  const allJobs = [];
  const seen = new Set();
  const queryLog = [];

  for (const city of CITIES) {
    console.log(`📡 ${city.name}…`);
    await sleep(DELAY_MS);

    const data = await fetchJobs(city.code);
    if (!data) {
      queryLog.push({
        city: city.name,
        areaCode: city.code,
        categoryCode: "",
        categoryName: "全部",
        rawCount: 0,
        uniqueInQuery: 0,
        newAdded: 0,
        hitCap: false,
        error: true,
      });
      continue;
    }

    const jobs = data?.data?.list || data?.list || [];
    const total = data?.data?.total || data?.total || jobs.length;
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
    });

    console.log(`  → ${jobs.length} 条 (新增 ${newAdded})${hitCap ? " ⚠️触发上限" : ""}`);

    // 如果触发上限，按类别细分查询
    if (hitCap) {
      for (const cat of CATEGORIES) {
        await sleep(DELAY_MS);
        const catData = await fetchJobs(city.code, cat);
        if (!catData) continue;

        const catJobs = catData?.data?.list || catData?.list || [];
        let catNew = 0;
        for (const job of catJobs) {
          if (!seen.has(job.jobId)) {
            seen.add(job.jobId);
            job.city = city.name;
            job.categoryName = getCategoryName(cat);
            allJobs.push(job);
            catNew++;
          }
        }

        const catHitCap = catJobs.length >= PAGE_SIZE;
        queryLog.push({
          city: city.name,
          areaCode: city.code,
          categoryCode: cat,
          categoryName: getCategoryName(cat),
          rawCount: catJobs.length,
          uniqueInQuery: catJobs.length,
          newAdded: catNew,
          hitCap: catHitCap,
        });

        if (catJobs.length > 0) {
          console.log(`    ${getCategoryName(cat)}: ${catJobs.length} 条 (新增 ${catNew})${catHitCap ? " ⚠️" : ""}`);
        }
      }
    }
  }

  const elapsed = Math.round((Date.now() - startTime.getTime()) / 60000 * 10) / 10;

  // 组装输出
  const snapshot = {
    areaCode: "45",
    areaCodeName: "广西",
    strategy: "14市 + 超限自动按职位类别细分",
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
      cappedCities: queryLog.filter((q) => q.hitCap).map((q) => q.city),
      queryCount: queryLog.length,
      elapsedMinutes: elapsed,
    },
    queryLog,
    fetchTime: new Date().toLocaleString("zh-CN", { hour12: false }),
    list: allJobs,
  };

  // 写入文件
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const filename = `${formatDate(startTime)}.json`;
  const filepath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2), "utf-8");

  console.log(`\n✅ 采集完成: ${allJobs.length} 条岗位 (去重) → ${filename}`);
  console.log(`   耗时 ${elapsed} 分钟, ${queryLog.length} 次查询`);
}

function getCategoryName(code) {
  const map = {
    "01": "计算机/网络/技术类", "02": "电子/电器/通信技术类", "03": "行政/后勤类",
    "04": "翻译类", "05": "财务/审计/统计类", "06": "法律类", "07": "教育培训类",
    "08": "销售/客服类", "09": "市场/媒介/公关类", "10": "设计/创意类",
    "11": "金融/保险类", "12": "建筑/房地产类", "13": "机械/设备类",
    "14": "化工/制药类", "15": "物流/仓储类", "16": "医疗/护理类",
    "17": "环境/安全类", "18": "生产/制造类", "19": "酒店/餐饮/旅游类",
    "20": "农林牧渔类", "21": "人力资源类", "22": "管理/高管类",
    "23": "文体/影视类", "24": "能源/矿产类", "25": "生物/医药类",
    "26": "咨询/顾问类", "27": "质量管理类", "28": "采购/贸易类", "29": "其他类",
  };
  return map[code] || `类别${code}`;
}

collect().catch((e) => {
  console.error("采集失败:", e.message);
  process.exit(1);
});
