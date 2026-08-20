import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Meter, ScoreRing } from "@/components/stats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useGrowthData } from "@/lib/useGrowthData";
import { useSaveEntry } from "@/lib/queries";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  growthScore,
  toISODate,
  type DailyEntry,
} from "@/lib/growth";

export const Route = createFileRoute("/_authenticated/checkin")({
  head: () => ({
    meta: [
      { title: "Daily Check-In — GrowthOS" },
      {
        name: "description",
        content:
          "Log study, exercise, coding, productivity, diet, sleep and reading for any day and see your score update live.",
      },
      { property: "og:title", content: "Daily Check-In — GrowthOS" },
      {
        property: "og:description",
        content: "Log your day in under a minute and watch your growth score recalculate.",
      },
    ],
  }),
  component: CheckIn,
});

const BLANK = {
  studied: false,
  study_hours: 0,
  study_subject: "",
  focus_rating: 5,
  exercised: false,
  exercise_minutes: 0,
  exercise_type: "",
  fitness_rating: 5,
  coded: false,
  coding_hours: 0,
  coding_skill: "",
  coding_rating: 5,
  productivity_rating: 5,
  distraction_rating: 5,
  ate_healthy: false,
  water_liters: 0,
  diet_rating: 5,
  sleep_hours: 0,
  sleep_quality: 5,
  pages_read: 0,
  notes: "",
};

type Form = typeof BLANK;

function CheckIn() {
  const d = useGrowthData();
  const save = useSaveEntry();
  const [date, setDate] = useState(toISODate(new Date()));
  const [form, setForm] = useState<Form>(BLANK);

  const existing = d.entryByDate.get(date);

  useEffect(() => {
    if (existing) {
      setForm({
        ...BLANK,
        ...Object.fromEntries(
          Object.keys(BLANK).map((k) => [
            k,
            (existing as unknown as Record<string, unknown>)[k] ?? BLANK[k as keyof Form],
          ]),
        ),
      } as Form);
    } else {
      setForm(BLANK);
    }
  }, [existing, date]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const preview = useMemo(
    () =>
      growthScore(
        { ...(form as unknown as DailyEntry), entry_date: date } as DailyEntry,
        d.settings,
        null,
      ),
    [form, date, d.settings],
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await save.mutateAsync({
        entry_date: date,
        ...form,
        study_subject: form.study_subject || null,
        exercise_type: form.exercise_type || null,
        coding_skill: form.coding_skill || null,
        notes: form.notes || null,
      } as never);
      toast.success(`Saved — growth score ${preview.score}/100 for ${date}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save your check-in");
    }
  };

  return (
    <form onSubmit={submit}>
      <PageHeader
        title="Daily Check-In"
        description="Log the day honestly. Percentages and scores are calculated automatically from your goals."
        action={
          <div className="flex items-end gap-3">
            <div>
              <Label htmlFor="entry-date" className="text-xs text-muted-foreground">
                Date
              </Label>
              <Input
                id="entry-date"
                type="date"
                value={date}
                max={toISODate(new Date())}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-44"
              />
            </div>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {existing ? "Update entry" : "Save entry"}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Section title="Study & Academics" goal={`Goal: ${d.settings.goals.study_hours}h/day`}>
            <Toggle label="Studied today" checked={form.studied} onChange={(v) => set("studied", v)} />
            <NumberField
              label="Study hours"
              value={form.study_hours}
              step={0.5}
              onChange={(v) => set("study_hours", v)}
            />
            <TextField
              label="Subject"
              value={form.study_subject}
              placeholder="Physics"
              onChange={(v) => set("study_subject", v)}
            />
            <RatingField
              label="Focus rating"
              value={form.focus_rating}
              onChange={(v) => set("focus_rating", v)}
            />
          </Section>

          <Section
            title="Exercise & Fitness"
            goal={`Goal: ${d.settings.goals.exercise_minutes} min/day`}
          >
            <Toggle
              label="Exercised today"
              checked={form.exercised}
              onChange={(v) => set("exercised", v)}
            />
            <NumberField
              label="Duration (minutes)"
              value={form.exercise_minutes}
              step={5}
              onChange={(v) => set("exercise_minutes", v)}
            />
            <TextField
              label="Type"
              value={form.exercise_type}
              placeholder="Running"
              onChange={(v) => set("exercise_type", v)}
            />
            <RatingField
              label="Fitness rating"
              value={form.fitness_rating}
              onChange={(v) => set("fitness_rating", v)}
            />
          </Section>

          <Section title="Coding & Technical Skills" goal={`Goal: ${d.settings.goals.coding_hours}h/day`}>
            <Toggle label="Coded today" checked={form.coded} onChange={(v) => set("coded", v)} />
            <NumberField
              label="Coding hours"
              value={form.coding_hours}
              step={0.5}
              onChange={(v) => set("coding_hours", v)}
            />
            <TextField
              label="Skill / technology"
              value={form.coding_skill}
              placeholder="TypeScript"
              onChange={(v) => set("coding_skill", v)}
            />
            <RatingField
              label="Progress rating"
              value={form.coding_rating}
              onChange={(v) => set("coding_rating", v)}
            />
          </Section>

          <Section title="Productivity">
            <RatingField
              label="Productivity rating"
              value={form.productivity_rating}
              onChange={(v) => set("productivity_rating", v)}
            />
            <RatingField
              label="Distraction level (lower is better)"
              value={form.distraction_rating}
              onChange={(v) => set("distraction_rating", v)}
            />
          </Section>

          <Section title="Diet & Water" goal={`Goal: ${d.settings.goals.water_liters}L/day`}>
            <Toggle
              label="Ate healthy"
              checked={form.ate_healthy}
              onChange={(v) => set("ate_healthy", v)}
            />
            <NumberField
              label="Water (litres)"
              value={form.water_liters}
              step={0.25}
              onChange={(v) => set("water_liters", v)}
            />
            <RatingField
              label="Diet quality"
              value={form.diet_rating}
              onChange={(v) => set("diet_rating", v)}
            />
          </Section>

          <Section title="Sleep" goal={`Goal: ${d.settings.goals.sleep_hours}h/day`}>
            <NumberField
              label="Hours slept"
              value={form.sleep_hours}
              step={0.5}
              onChange={(v) => set("sleep_hours", v)}
            />
            <RatingField
              label="Sleep quality"
              value={form.sleep_quality}
              onChange={(v) => set("sleep_quality", v)}
            />
          </Section>

          <Section title="Reading" goal={`Goal: ${d.settings.goals.reading_pages} pages/day`}>
            <NumberField
              label="Pages read"
              value={form.pages_read}
              step={1}
              onChange={(v) => set("pages_read", v)}
            />
          </Section>

          <Section title="Notes">
            <div className="sm:col-span-2">
              <Textarea
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="What shaped today?"
                rows={3}
              />
            </div>
          </Section>
        </div>

        <aside className="lg:sticky lg:top-8 lg:h-fit">
          <div className="surface flex flex-col items-center gap-4 p-6">
            <h2 className="self-start text-sm font-semibold">Live score preview</h2>
            <ScoreRing score={preview.score} size={132} />
            <div className="w-full space-y-3">
              {CATEGORY_ORDER.filter((k) => d.settings.enabled[k] && k !== "tasks").map((k) => (
                <Meter key={k} label={CATEGORY_LABELS[k]} value={preview.categories[k]} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Preview excludes task completion, which is calculated from tasks due on this date.
            </p>
          </div>
        </aside>
      </div>
    </form>
  );
}

function Section({
  title,
  goal,
  children,
}: {
  title: string;
  goal?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        {goal ? <span className="text-xs text-muted-foreground">{goal}</span> : null}
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
      <Label className="text-sm font-normal">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function NumberField({
  label,
  value,
  step,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <Input
        type="number"
        min={0}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </div>
  );
}

function TextField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <Input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function RatingField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <span className="stat-number text-sm text-muted-foreground">{value}/10</span>
      </div>
      <Slider
        min={1}
        max={10}
        step={1}
        value={[value]}
        onValueChange={([v]) => onChange(v ?? 5)}
        className="py-2"
      />
    </div>
  );
}
