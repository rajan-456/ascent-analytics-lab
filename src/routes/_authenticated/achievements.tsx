import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { PageHeader } from "@/components/AppShell";
import { Meter, StatCard } from "@/components/stats";
import { Badge } from "@/components/ui/badge";
import { useGrowthData } from "@/lib/useGrowthData";
import { useRecordAchievements, useUnlockedAchievements } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements — GrowthOS" },
      {
        name: "description",
        content:
          "Unlock achievements for streaks, study hours, coding hours, pages read and perfect days.",
      },
      { property: "og:title", content: "Achievements — GrowthOS" },
      { property: "og:description", content: "Milestones earned from real logged progress." },
    ],
  }),
  component: Achievements,
});

function Achievements() {
  const d = useGrowthData();
  const unlockedQ = useUnlockedAchievements();
  const record = useRecordAchievements();

  const knownCodes = new Set((unlockedQ.data ?? []).map((a) => a.code));
  const newlyUnlocked = d.achievements
    .filter((a) => a.unlocked && !knownCodes.has(a.code))
    .map((a) => a.code);

  useEffect(() => {
    if (!d.loading && !unlockedQ.isLoading && newlyUnlocked.length && !record.isPending) {
      record.mutate(newlyUnlocked);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d.loading, unlockedQ.isLoading, newlyUnlocked.join(",")]);

  const unlockedAt = new Map((unlockedQ.data ?? []).map((a) => [a.code, a.unlocked_at]));
  const total = d.achievements.length;
  const done = d.achievements.filter((a) => a.unlocked).length;

  return (
    <>
      <PageHeader
        title="Achievements"
        description="Every achievement is earned from data you actually logged."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Unlocked" value={`${done} / ${total}`} />
        <StatCard label="Level" value={`${d.level.level} · ${d.level.title}`} />
        <StatCard label="Total XP" value={d.xp.toLocaleString()} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {d.achievements.map((a) => (
          <div
            key={a.code}
            className={cn(
              "surface p-5 transition-opacity",
              !a.unlocked && "opacity-70 saturate-0",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-2xl">{a.icon}</span>
              <Badge variant={a.unlocked ? "default" : "secondary"}>
                {a.unlocked ? "Unlocked" : "Locked"}
              </Badge>
            </div>
            <h3 className="mt-3 font-medium">{a.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
            <div className="mt-4">
              <Meter
                label="Progress"
                value={a.pct}
                detail={`${a.value} / ${a.target}`}
                tone={a.unlocked ? "primary" : "info"}
              />
            </div>
            {a.unlocked && unlockedAt.get(a.code) ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Unlocked {new Date(unlockedAt.get(a.code)!).toLocaleDateString()}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
}
