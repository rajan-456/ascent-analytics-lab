import type { ReactNode } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  icon,
  footer,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="surface p-5 transition-shadow hover:shadow-[var(--shadow-lift)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        {icon ? <div className="text-muted-foreground">{icon}</div> : null}
      </div>
      <div className="stat-number mt-3 text-3xl font-semibold">{value}</div>
      {sub ? <div className="mt-1 text-sm text-muted-foreground">{sub}</div> : null}
      {footer ? <div className="mt-4">{footer}</div> : null}
    </div>
  );
}

export function TrendBadge({ delta }: { delta: number | null }) {
  if (delta === null)
    return <span className="text-xs text-muted-foreground">No comparison data yet</span>;
  const dir = delta > 0.5 ? "up" : delta < -0.5 ? "down" : "flat";
  const Icon = dir === "up" ? ArrowUpRight : dir === "down" ? ArrowDownRight : ArrowRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        dir === "up" && "bg-success/12 text-success",
        dir === "down" && "bg-destructive/12 text-destructive",
        dir === "flat" && "bg-muted text-muted-foreground",
      )}
    >
      <Icon className="size-3" />
      {dir === "up" ? "Improving" : dir === "down" ? "Declining" : "Stable"}
      {dir !== "flat" ? ` ${delta > 0 ? "+" : ""}${Math.round(delta)}` : ""}
    </span>
  );
}

export function Meter({
  label,
  value,
  detail,
  tone = "primary",
}: {
  label: string;
  value: number;
  detail?: string;
  tone?: "primary" | "info" | "warning";
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-medium">{label}</span>
        <span className="stat-number text-muted-foreground">
          {detail ?? `${Math.round(value)}%`}
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            tone === "primary" && "bg-primary",
            tone === "info" && "bg-info",
            tone === "warning" && "bg-warning",
          )}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

export function ScoreRing({ score, size = 148 }: { score: number; size?: number }) {
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, score)) / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={10}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="stroke-primary transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="stat-number text-4xl font-semibold">{Math.round(score)}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}
