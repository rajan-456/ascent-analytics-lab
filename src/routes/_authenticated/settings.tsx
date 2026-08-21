import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useGrowthData } from "@/lib/useGrowthData";
import { useUpdateSettings } from "@/lib/queries";
import { CATEGORY_LABELS, CATEGORY_ORDER, type Goals } from "@/lib/growth";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — GrowthOS" },
      {
        name: "description",
        content:
          "Customize your daily goals, category weights and which areas count toward your growth score.",
      },
      { property: "og:title", content: "Settings — GrowthOS" },
      {
        property: "og:description",
        content: "Tune daily targets and scoring weights for your growth system.",
      },
    ],
  }),
  component: Settings,
});

const GOAL_FIELDS: { key: keyof Goals; label: string; step: number; unit: string }[] = [
  { key: "study_hours", label: "Study", step: 0.5, unit: "hours / day" },
  { key: "coding_hours", label: "Coding", step: 0.5, unit: "hours / day" },
  { key: "exercise_minutes", label: "Exercise", step: 5, unit: "minutes / day" },
  { key: "sleep_hours", label: "Sleep", step: 0.5, unit: "hours / night" },
  { key: "reading_pages", label: "Reading", step: 5, unit: "pages / day" },
  { key: "water_liters", label: "Water", step: 0.25, unit: "liters / day" },
];

function Settings() {
  const d = useGrowthData();
  const updateSettings = useUpdateSettings();
  const [goals, setGoals] = useState<Goals | null>(null);
  const current = goals ?? d.settings.goals;

  const saveGoals = () => {
    updateSettings.mutate(
      { goals: current },
      { onSuccess: () => toast.success("Daily goals updated.") },
    );
  };

  const setWeight = (key: (typeof CATEGORY_ORDER)[number], value: number) => {
    updateSettings.mutate({ weights: { ...d.settings.weights, [key]: value } });
  };

  const toggleCategory = (key: (typeof CATEGORY_ORDER)[number], on: boolean) => {
    updateSettings.mutate({ enabled: { ...d.settings.enabled, [key]: on } });
  };

  const totalWeight = CATEGORY_ORDER.filter((k) => d.settings.enabled[k]).reduce(
    (sum, k) => sum + d.settings.weights[k],
    0,
  );

  return (
    <>
      <PageHeader
        title="Settings"
        description="Your goals and weights define how the 0–100 growth score is calculated."
      />

      <section className="surface p-6">
        <h2 className="text-sm font-semibold">Daily goals</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Hitting a goal scores 100 in that category for the day.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GOAL_FIELDS.map((f) => (
            <div key={f.key} className="space-y-2">
              <Label htmlFor={f.key}>
                {f.label} <span className="text-muted-foreground">({f.unit})</span>
              </Label>
              <Input
                id={f.key}
                type="number"
                min={0}
                step={f.step}
                value={current[f.key]}
                onChange={(e) =>
                  setGoals({ ...current, [f.key]: Number(e.target.value) })
                }
              />
            </div>
          ))}
        </div>
        <Button className="mt-6" onClick={saveGoals} disabled={updateSettings.isPending}>
          Save goals
        </Button>
      </section>

      <section className="surface mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Category weights</h2>
          <span className="text-xs text-muted-foreground">
            Active total: {totalWeight} (normalized automatically)
          </span>
        </div>
        <div className="mt-6 space-y-6">
          {CATEGORY_ORDER.map((key) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <Label className="flex items-center gap-3">
                  <Switch
                    checked={d.settings.enabled[key]}
                    onCheckedChange={(on) => toggleCategory(key, on)}
                  />
                  {CATEGORY_LABELS[key]}
                </Label>
                <span className="stat-number text-sm">{d.settings.weights[key]}</span>
              </div>
              <Slider
                min={0}
                max={40}
                step={1}
                disabled={!d.settings.enabled[key]}
                value={[d.settings.weights[key]]}
                onValueChange={([v]) => setWeight(key, v ?? 0)}
              />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
