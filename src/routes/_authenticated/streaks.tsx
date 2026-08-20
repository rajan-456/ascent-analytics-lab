import { createFileRoute } from "@tanstack/react-router";
import { Flame, Trophy } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { StatCard } from "@/components/stats";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useGrowthData } from "@/lib/useGrowthData";
import { useUpdateSettings } from "@/lib/queries";
import { categoryStreak } from "@/lib/growth";

export const Route = createFileRoute("/_authenticated/streaks")({
  head: () => ({
    meta: [
      { title: "Streaks — GrowthOS" },
      {
        name: "description",
        content:
          "Track overall, study, exercise, coding and reading streaks, plus your best and worst days.",
      },
      { property: "og:title", content: "Streaks — GrowthOS" },
      { property: "og:description", content: "Consistency tracking across every category." },
    ],
  }),
  component: Streaks,
});

function Streaks() {
  const d = useGrowthData();
  const updateSettings = useUpdateSettings();

  const g = d.settings.goals;
  const streaks = [
    { label: "Overall improvement", ...d.streak, icon: "🔥" },
    {
      label: "Study",
      ...categoryStreak(d.entries, (e) => Number(e.study_hours) >= g.study_hours),
      icon: "📚",
    },
    {
      label: "Exercise",
      ...categoryStreak(d.entries, (e) => Number(e.exercise_minutes) >= g.exercise_minutes),
      icon: "🏋️",
    },
    {
      label: "Coding",
      ...categoryStreak(d.entries, (e) => Number(e.coding_hours) >= g.coding_hours),
      icon: "💻",
    },
    {
      label: "Reading",
      ...categoryStreak(d.entries, (e) => Number(e.pages_read) >= g.reading_pages),
      icon: "📖",
    },
    {
      label: "Habit completion",
      ...categoryStreak(d.entries, (e) => (d.byDate.get(e.entry_date)?.habitPct ?? 0) >= 80),
      icon: "✅",
    },
  ];

  return (
    <>
      <PageHeader
        title="Streaks"
        description="A day only counts when it meets the success rule you define below."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {streaks.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={`${s.icon} ${s.current} ${s.current === 1 ? "day" : "days"}`}
            sub={
              <span className="inline-flex items-center gap-1">
                <Trophy className="size-3.5" /> Longest: {s.longest} days
              </span>
            }
          />
        ))}
      </div>

      <section className="surface mt-6 p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Flame className="size-4 text-primary" /> Success rule
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Your overall streak grows on any day where your growth score reaches this minimum.
        </p>
        <div className="mt-6 max-w-md space-y-2">
          <div className="flex items-center justify-between">
            <Label>Minimum growth score</Label>
            <span className="stat-number text-sm">{d.settings.streak_min_score}</span>
          </div>
          <Slider
            min={30}
            max={95}
            step={5}
            value={[d.settings.streak_min_score]}
            onValueChange={([v]) =>
              updateSettings.mutate({ streak_min_score: v ?? 60 } as never)
            }
          />
        </div>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="surface p-6">
          <h2 className="text-sm font-semibold">🏆 Best day</h2>
          {d.best ? (
            <>
              <p className="stat-number mt-3 text-2xl font-semibold">
                {d.best.date} — {d.best.score}/100
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {d.best.habitPct}% of habits completed. Strongest categories:{" "}
                {topCategories(d.best.categories, 3).join(", ")}.
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No entries yet.</p>
          )}
        </div>
        <div className="surface p-6">
          <h2 className="text-sm font-semibold">Lowest day</h2>
          {d.worst ? (
            <>
              <p className="stat-number mt-3 text-2xl font-semibold">
                {d.worst.date} — {d.worst.score}/100
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Held back by: {bottomCategories(d.worst.categories, 3).join(", ")}. Use this as a
                pattern signal, not a punishment.
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No entries yet.</p>
          )}
        </div>
      </div>
    </>
  );
}

function topCategories(cats: Record<string, number>, n: number) {
  return Object.entries(cats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k, v]) => `${k} (${v})`);
}

function bottomCategories(cats: Record<string, number>, n: number) {
  return Object.entries(cats)
    .sort((a, b) => a[1] - b[1])
    .slice(0, n)
    .map(([k, v]) => `${k} (${v})`);
}
