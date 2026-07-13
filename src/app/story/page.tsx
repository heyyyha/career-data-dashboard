import { computeDashboard } from "@/lib/data";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Database, Search, BarChart3, RefreshCw, Target, Users } from "lucide-react";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    icon: Users,
    title: "学生就业去向",
    desc: "基于老师提供的毕业生就业信息，梳理出学生主要的岗位去向和职业路径。这些真实数据是整个闭环的起点——只有知道学生去了哪里，才知道市场在要什么。",
    color: "#1a56db",
  },
  {
    icon: Search,
    title: "岗位需求监测",
    desc: "以学生实际去向为关键词，每日自动采集广西 14 个地级市的岗位发布数据。覆盖 29 个标准职位类别，单次采集 6700+ 条有效岗位，形成持续更新的区域岗位数据库。",
    color: "#0d9488",
  },
  {
    icon: Database,
    title: "数据沉淀与积累",
    desc: "每次采集结果以日期命名存储在数据仓库中。随着时间推移，形成按日、周、月、年粒度的岗位数量变化趋势。数据越积越多，洞察越来越准。",
    color: "#7c3aed",
  },
  {
    icon: BarChart3,
    title: "趋势分析与预警",
    desc: "通过对比不同时间段的岗位数量变化，识别哪些岗位在增长、哪些在萎缩。城市间的岗位分布差异、学历要求的变化趋势、薪资水平的波动，全部可视化呈现。",
    color: "#ea580c",
  },
  {
    icon: RefreshCw,
    title: "反馈培养方案",
    desc: "岗位需求的变化直接反馈到专业培养方案：热门岗位对应的能力要求是否被课程覆盖？萎缩岗位对应的专业是否需要调整方向？数据驱动的决策替代凭经验的猜测。",
    color: "#16a34a",
  },
  {
    icon: Target,
    title: "精准就业指导",
    desc: "学生可以看到自己目标岗位在广西的真实供需情况，知道需要什么技能、拿什么薪资，不再盲目投简历。就业指导从「老师觉得」变成「数据证明」。",
    color: "#dc2626",
  },
];

export default function StoryPage() {
  const d = computeDashboard();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回仪表盘
          </Link>
          <span className="text-[11px] text-muted-foreground">/</span>
          <span className="text-sm font-semibold text-foreground">数据闭环叙事</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-10">
        {/* Hero */}
        <section className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">
            招培就一体化 · 产业需求与人才供给的数据闭环
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground leading-relaxed">
            传统的就业工作往往是单向的：学校培养 → 学生毕业 → 找工作。这个系统试图建立一个
            双向循环——让市场的真实需求反向驱动培养方案的优化，让学生在入学之初就能看到四年后
            的岗位图景。
          </p>
        </section>

        {/* 当前数据概览 */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "监测岗位", value: d.totalJobs.toLocaleString() },
            { label: "覆盖城市", value: `${d.cityCount} 个` },
            { label: "岗位类别", value: `${d.categoryCount} 类` },
            { label: "累计采集", value: `${d.trend.length} 次` },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-border bg-card p-4 text-center shadow-card"
            >
              <p className="text-2xl font-bold text-foreground">{item.value}</p>
              <p className="text-[11px] text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </section>

        {/* 闭环六步 */}
        <section>
          <h2 className="mb-6 text-center text-lg font-semibold text-foreground">
            数据闭环的六个环节
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="group relative rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:shadow-md"
                >
                  {/* 步骤编号 */}
                  <span
                    className="absolute -top-2.5 -left-2.5 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white"
                    style={{ backgroundColor: step.color }}
                  >
                    {i + 1}
                  </span>

                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{ backgroundColor: step.color + "18" }}
                    >
                      <Icon className="h-5 w-5" style={{ color: step.color }} />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground">{step.title}</h3>
                  </div>
                  <p className="text-[12.5px] leading-relaxed text-muted-foreground">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 闭环图示 */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-6 text-center text-lg font-semibold text-foreground">
            闭环逻辑总览
          </h2>

          {/* SVG 循环图 */}
          <svg viewBox="0 0 800 340" className="w-full max-w-2xl mx-auto" role="img">
            {/* 外圈虚线 */}
            <circle cx="400" cy="170" r="150" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeDasharray="6,4" />

            {/* 四个节点 */}
            {[
              { x: 400, y: 20, label: "学生就业去向", sub: "老师提供", color: "#1a56db" },
              { x: 680, y: 170, label: "岗位需求监测", sub: "每日采集", color: "#0d9488" },
              { x: 400, y: 320, label: "趋势分析预警", sub: "数据沉淀", color: "#ea580c" },
              { x: 120, y: 170, label: "反馈培养方案", sub: "精准指导", color: "#16a34a" },
            ].map((node, i) => (
              <g key={node.label}>
                {/* 连接线 */}
                {i < 3 && (
                  <line
                    x1={node.x}
                    y1={node.y}
                    x2={[400, 680, 400, 120][i + 1]}
                    y2={[20, 170, 320, 170][i + 1]}
                    stroke="#d1d5db"
                    strokeWidth="1.5"
                  />
                )}
                {i === 3 && (
                  <line
                    x1={node.x}
                    y1={node.y}
                    x2={400}
                    y2={20}
                    stroke="#d1d5db"
                    strokeWidth="1.5"
                  />
                )}

                {/* 箭头 */}
                {i < 3 && (
                  <polygon
                    points={(() => {
                      const tx = [400, 680, 400, 120][i + 1];
                      const ty = [20, 170, 320, 170][i + 1];
                      const fx = node.x;
                      const fy = node.y;
                      const dx = tx - fx;
                      const dy = ty - fy;
                      const len = Math.sqrt(dx * dx + dy * dy);
                      const ux = dx / len;
                      const uy = dy / len;
                      const off = 30;
                      const ax = tx - ux * off;
                      const ay = ty - uy * off;
                      const nx = -uy * 6;
                      const ny = ux * 6;
                      return `${ax},${ay} ${ax + nx},${ay + ny} ${ax - nx},${ay - ny}`;
                    })()}
                    fill="#9ca3af"
                  />
                )}

                {/* 节点圆 */}
                <circle cx={node.x} cy={node.y} r={36} fill="white" stroke={node.color} strokeWidth="2" />
                <text x={node.x} y={node.y - 2} textAnchor="middle" fontSize={11} fontWeight="bold" fill={node.color}>
                  {node.label.length > 5 ? node.label.slice(0, 4) + "…" : node.label}
                </text>
                <text x={node.x} y={node.y + 13} textAnchor="middle" fontSize={9} fill="#9ca3af">
                  {node.sub}
                </text>
              </g>
            ))}

            {/* 中心文字 */}
            <text x={400} y={165} textAnchor="middle" fontSize={13} fontWeight="bold" fill="#374151">
              招培就
            </text>
            <text x={400} y={182} textAnchor="middle" fontSize={13} fontWeight="bold" fill="#374151">
              一体化
            </text>
          </svg>

          <p className="mt-6 text-center text-[12.5px] text-muted-foreground leading-relaxed max-w-xl mx-auto">
            四个节点构成持续运转的循环：学生去哪 → 市场要什么 → 趋势怎么变 → 我们怎么教。
            每一次循环都让培养方案更贴近产业需求，让学生的就业选择更有数据支撑。
          </p>
        </section>

        {/* 价值说明 */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              title: "对学校",
              items: [
                "专业设置有了数据依据，不再拍脑袋决定",
                "就业指导从经验驱动变成数据驱动",
                "培养质量用市场反馈来检验",
              ],
            },
            {
              title: "对学生",
              items: [
                "看到目标岗位在广西的真实供需",
                "知道需要什么技能、拿多少薪资",
                "大一就能规划四年后的职业路径",
              ],
            },
            {
              title: "对产业",
              items: [
                "高校培养更贴合用人需求",
                "缩短毕业生适应期",
                "区域人才供给结构优化",
              ],
            },
          ].map((col) => (
            <div key={col.title} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h3 className="mb-3 text-sm font-semibold text-foreground">{col.title}</h3>
              <ul className="space-y-2">
                {col.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[12.5px] text-muted-foreground">
                    <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* 返回 */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-brand-blueDark transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回数据仪表盘
          </Link>
        </div>
      </main>
    </div>
  );
}
