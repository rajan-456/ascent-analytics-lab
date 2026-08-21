import { createFileRoute } from "@tanstack/react-router";
import { Lightbulb, TrendingUp, Sparkles } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/AppShell";
import { useGrowthData } from "@/lib/useGrowthData";
import type { InsightKind } from "@/lib/growth";

export const Route = createFileRoute("/_authenticated/insights")({
  head: () => ({
    meta: [
      { title: "Insights — GrowthOS" },
      {
        name: "description",
        content:
          "Automated observations, trends and projections generated from your daily growth data.",
      },
      { property: "og:title", content: "Insights — GrowthOS" },
      {
        property: "og:description",
        content: "Data-driven observations and projections from your check-ins.",
      },
    ],
  }),
  component: Insights,
});

const ICONS: Record<InsightKind, typeof Lightbulb> = {
  observation: Lightbulb,
  trend: TrendingUp,
  prediction: Sparkles,
};

const LABELS: Record<InsightKind, string> = {
  observation: "Observation",
  trend: "Trend",
  prediction: "Projection",
};

function Insights() {
  const d = useGrowthData();

  return (
    <>
      <PageHeader
        title="Insights"
        description="Patterns detected in your logged days — no guesswork, just your own data."
      />

      {d.insights.length === 0 ? (
        <EmptyState
          title="Not enough data yet"
          description="Log a few more daily check-ins and GrowthOS will surface trends, weak spots and projections here."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {d.insights.map((insight, i) => {
            const Icon = ICONS[insight.kind];
            return (
              <article key={i} className="surface p-6">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Icon className="size-4 text-primary" />
                  {LABELS[insight.kind]}
                </div>
                <h2 className="mt-3 text-base font-semibold">{insight.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{insight.detail}</p>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
