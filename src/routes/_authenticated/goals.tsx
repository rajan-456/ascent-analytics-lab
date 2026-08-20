import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pause, Play, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, PageHeader } from "@/components/AppShell";
import { Meter } from "@/components/stats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGoalMutations, useGoals, type GoalRow } from "@/lib/queries";
import { useGrowthData } from "@/lib/useGrowthData";
import { toISODate, type DailyEntry } from "@/lib/growth";

export const Route = createFileRoute("/_authenticated/goals")({
  head: () => ({
    meta: [
      { title: "Goals — GrowthOS" },
      {
        name: "description",
        content:
          "Set daily, weekly and monthly goals for study, sleep, exercise, coding and reading, and track live progress.",
      },
      { property: "og:title", content: "Goals — GrowthOS" },
      {
        property: "og:description",
        content: "Daily, weekly and monthly targets with live progress bars.",
      },
    ],
  }),
  component: GoalsPage,
});

const METRICS = [
  { value: "study_hours", label: "Study hours", unit: "hours" },
  { value: "coding_hours", label: "Coding hours", unit: "hours" },
  { value: "exercise_minutes", label: "Exercise minutes", unit: "minutes" },
  { value: "sleep_hours", label: "Sleep hours", unit: "hours" },
  { value: "pages_read", label: "Pages read", unit: "pages" },
  { value: "water_liters", label: "Water", unit: "litres" },
] as const;

function periodStart(period: GoalRow["period"]) {
  const now = new Date();
  if (period === "daily") return toISODate(now);
  if (period === "weekly") {
    const start = new Date(now);
    start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    return toISODate(start);
  }
  return toISODate(new Date(now.getFullYear(), now.getMonth(), 1));
}

function progressFor(goal: GoalRow, entries: DailyEntry[]) {
  const start = periodStart(goal.period);
  const today = toISODate(new Date());
  return entries
    .filter((e) => e.entry_date >= start && e.entry_date <= today)
    .reduce((sum, e) => sum + Number((e as unknown as Record<string, number>)[goal.metric] ?? 0), 0);
}

function GoalsPage() {
  const goalsQ = useGoals();
  const d = useGrowthData();
  const { create, update, remove } = useGoalMutations();
  const [form, setForm] = useState({
    title: "",
    metric: "study_hours",
    period: "weekly" as GoalRow["period"],
    target: 28,
    target_date: "",
  });

  const goals = goalsQ.data ?? [];

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const metric = METRICS.find((m) => m.value === form.metric)!;
    try {
      await create.mutateAsync({
        title: form.title.trim() || `${metric.label} ${form.period}`,
        metric: form.metric,
        category: form.metric.split("_")[0]!,
        period: form.period,
        target: Number(form.target),
        unit: metric.unit,
        target_date: form.target_date || null,
      });
      setForm({ ...form, title: "" });
      toast.success("Goal created");
    } catch {
      toast.error("Could not create goal");
    }
  };

  return (
    <>
      <PageHeader
        title="Goals"
        description="Your daily targets live in Settings. Here you can add richer weekly and monthly goals."
      />

      <section className="surface mb-6 p-6">
        <h2 className="text-sm font-semibold">Daily defaults</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(d.settings.goals).map(([key, value]) => {
            const todayEntry = d.entryByDate.get(d.today);
            const metricKey = key === "water_liters" ? "water_liters" : key;
            const current = todayEntry
              ? Number((todayEntry as unknown as Record<string, number>)[metricKey] ?? 0)
              : 0;
            return (
              <Meter
                key={key}
                label={key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                value={(current / Number(value)) * 100}
                detail={`${current} / ${value}`}
              />
            );
          })}
        </div>
      </section>

      <form onSubmit={add} className="surface mb-6 grid gap-4 p-5 lg:grid-cols-6">
        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="goal-title">Goal title</Label>
          <Input
            id="goal-title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Study this week"
          />
        </div>
        <div className="space-y-2">
          <Label>Metric</Label>
          <Select value={form.metric} onValueChange={(v) => setForm({ ...form, metric: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {METRICS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Period</Label>
          <Select
            value={form.period}
            onValueChange={(v) => setForm({ ...form, period: v as GoalRow["period"] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="goal-target">Target</Label>
          <Input
            id="goal-target"
            type="number"
            min={0}
            step={0.5}
            value={form.target}
            onChange={(e) => setForm({ ...form, target: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="goal-date">Target date</Label>
          <Input
            id="goal-date"
            type="date"
            value={form.target_date}
            onChange={(e) => setForm({ ...form, target_date: e.target.value })}
          />
        </div>
        <div className="flex items-end lg:col-span-6">
          <Button type="submit" disabled={create.isPending}>
            <Plus className="size-4" /> Add goal
          </Button>
        </div>
      </form>

      {goals.length === 0 ? (
        <EmptyState
          title="No custom goals yet"
          description="Add a weekly or monthly goal above — progress is calculated automatically from your check-ins."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((g) => {
            const current = progressFor(g, d.entries);
            const pct = g.target > 0 ? (current / g.target) * 100 : 0;
            return (
              <div key={g.id} className="surface p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium">{g.title}</h3>
                    <p className="text-xs capitalize text-muted-foreground">
                      {g.period} · {g.target} {g.unit}
                      {g.target_date ? ` · by ${g.target_date}` : ""}
                    </p>
                  </div>
                  <Badge variant={g.status === "active" ? "default" : "secondary"} className="capitalize">
                    {g.status}
                  </Badge>
                </div>
                <div className="mt-4">
                  <Meter
                    label="Progress"
                    value={pct}
                    detail={`${Math.round(current * 10) / 10} / ${g.target} ${g.unit} · ${Math.round(pct)}%`}
                  />
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      update.mutate({
                        id: g.id,
                        status: g.status === "active" ? "paused" : "active",
                      })
                    }
                  >
                    {g.status === "active" ? (
                      <>
                        <Pause className="size-4" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="size-4" /> Resume
                      </>
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => remove.mutate(g.id)}>
                    <Trash2 className="size-4" /> Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
