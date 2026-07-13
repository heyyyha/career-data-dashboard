import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: "up" | "down";
  className?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5 shadow-card", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[13px] text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{value}</span>
            {trend && (
              <span className={cn(
                "text-[11px] font-medium",
                trend === "up" ? "text-emerald-600" : "text-red-500"
              )}>
                {trend === "up" ? "↑" : "↓"}
              </span>
            )}
          </div>
          {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
          {icon}
        </div>
      </div>
    </div>
  );
}
