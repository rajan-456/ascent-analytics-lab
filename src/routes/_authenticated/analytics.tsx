import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGrowthData } from "@/lib/useGrowthData";
import { CATEGORY_LABELS, CATEGORY_ORDER, average, toISODate } from "@/lib/growth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — GrowthOS Progress Charts" },
      {
        name: "description",
        content:
          "Explore growth score trends, effort distribution, category comparisons, a calendar heatmap and radar balance charts.",
      },
      { property: "og:title", content: "Analytics — GrowthOS" },
      {
        property: "og:description",
        content: "Trends, heatmaps and radar charts built from your own daily data.",
      },
    ],
  }),
  component: Analytics,
});

const RANGES = [
  { key: "7", label: "7 days", days: 7 },
  { key: "30", label: "30 days", days: 30 },
  { key: "90", label: "3 months", days: 90 },
  { key: "180", label: "6 months", days: 180 },
  { key: "365", label: "1 year", days: 365 },
] as const;

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
];

function Analytics() {
  const d = useGrowthData();
  const [range, setRange] = useState<string>("30");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [openDay, setOpenDay] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (from && to) return d.scores.filter((s) => s.date >= from && s.date <= to);
    const days = RANGES.find((r) => r.key === range)?.days ?? 30;
    const cutoff = toISODate(new Date(Date.now() - days * 86400000));
    return d.scores.filter((s) => s.date >= cutoff);
  }, [d.scores, range, from, to]);

  const entriesInRange = useMemo(() => {
    const dates = new Set(filtered.map((s) => s.date));
    return d.entries.filter((e) => dates.has(e.entry_date));
  }, [d.entries, filtered]);

  if (d.loading) return <div className="h-96 animate-pulse rounded-xl bg-muted" />;
  if (d.scores.length === 0)
    return (
      <>
        <PageHeader title="Analytics" description="Charts appear as your history grows." />
        <EmptyState
          title="No data to analyse yet"
          description="Complete a few daily check-ins and your trends, distributions and heatmap will build automatically."
        />
      </>
    );

  const trendData = filtered.map((s, i) => ({
    date: s.date,
    label: s.date.slice(5),
    score: s.score,
    weekly: average(filtered.slice(Math.max(0, i - 6), i + 1).map((x) => x.score)),
    monthly: average(filtered.slice(Math.max(0, i - 29), i + 1).map((x) => x.score)),
  }));

  const timeData = [
    {
      name: "Study",
      value: round(entriesInRange.reduce((a, e) => a + Number(e.study_hours), 0)),
    },
    {
      name: "Coding",
      value: round(entriesInRange.reduce((a, e) => a + Number(e.coding_hours), 0)),
    },
    {
      name: "Exercise",
      value: round(entriesInRange.reduce((a, e) => a + Number(e.exercise_minutes), 0) / 60),
    },
    {
      name: "Reading",
      value: round(entriesInRange.reduce((a, e) => a + Number(e.pages_read), 0) / 30),
    },
  ].filter((x) => x.value > 0);

  const half = Math.ceil(filtered.length / 2);
  const periodA = filtered.slice(0, half);
  const periodB = filtered.slice(half);
  const active = CATEGORY_ORDER.filter((k) => d.settings.enabled[k]);
  const compareData = active.map((k) => ({
    category: CATEGORY_LABELS[k],
    earlier: average(periodA.map((s) => s.categories[k])) ?? 0,
    recent: average(periodB.map((s) => s.categories[k])) ?? 0,
  }));

  const radarData = active.map((k) => ({
    category: CATEGORY_LABELS[k],
    current: average(d.scores.slice(-7).map((s) => s.categories[k])) ?? 0,
    previous: average(d.scores.slice(-14, -7).map((s) => s.categories[k])) ?? 0,
  }));

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Every chart is built from your own logged data. Empty areas simply mean no entries yet."
        action={
          <Tabs value={from && to ? "custom" : range} onValueChange={(v) => {
            setRange(v);
            setFrom("");
            setTo("");
          }}>
            <TabsList>
              {RANGES.map((r) => (
                <TabsTrigger key={r.key} value={r.key}>
                  {r.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        }
      />

      <div className="surface mb-6 flex flex-wrap items-end gap-4 p-4">
        <div>
          <Label htmlFor="from" className="text-xs text-muted-foreground">
            Custom from
          </Label>
          <Input
            id="from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 w-44"
          />
        </div>
        <div>
          <Label htmlFor="to" className="text-xs text-muted-foreground">
            Custom to
          </Label>
          <Input
            id="to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 w-44"
          />
        </div>
        {from && to ? (
          <Button
            variant="ghost"
            onClick={() => {
              setFrom("");
              setTo("");
            }}
          >
            Clear custom range
          </Button>
        ) : null}
        <p className="ml-auto text-sm text-muted-foreground">
          {filtered.length} logged {filtered.length === 1 ? "day" : "days"} in range
        </p>
      </div>

      <div className="space-y-6">
        <Panel title="Growth score trend" subtitle="Daily score with rolling weekly and monthly averages">
          {trendData.length >= 2 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Line type="monotone" dataKey="score" name="Daily" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="weekly" name="Weekly avg" stroke="var(--chart-2)" strokeWidth={2} dot={false} strokeDasharray="5 4" />
                  <Line type="monotone" dataKey="monthly" name="Monthly avg" stroke="var(--chart-7)" strokeWidth={2} dot={false} strokeDasharray="2 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Hint>Log at least two days inside this range.</Hint>
          )}
        </Panel>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Effort distribution" subtitle="Hours logged in range (reading counted at ~30 pages/hour)">
            {timeData.length ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={timeData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={3}>
                      {timeData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v} h`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Hint>No time logged in this range yet.</Hint>
            )}
          </Panel>

          <Panel title="Balance radar" subtitle="Current week vs previous week">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid className="stroke-border" />
                  <PolarAngleAxis dataKey="category" fontSize={11} />
                  <Radar name="Previous week" dataKey="previous" stroke="var(--chart-7)" fill="var(--chart-7)" fillOpacity={0.12} />
                  <Radar name="Current week" dataKey="current" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.25} />
                  <Legend />
                  <Tooltip contentStyle={tooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        <Panel title="Category comparison" subtitle="Earlier half vs recent half of the selected range">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compareData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="category" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="earlier" name="Earlier" fill="var(--chart-7)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="recent" name="Recent" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Calendar heatmap" subtitle="Last 26 weeks — click any day to open its full record">
          <Heatmap scores={d.scores} onSelect={setOpenDay} />
        </Panel>

        <Panel title="Time breakdown" subtitle="Totals across the selected range">
          <dl className="grid gap-4 sm:grid-cols-4">
            <Total label="Study" value={`${round(entriesInRange.reduce((a, e) => a + Number(e.study_hours), 0))} h`} />
            <Total label="Coding" value={`${round(entriesInRange.reduce((a, e) => a + Number(e.coding_hours), 0))} h`} />
            <Total label="Exercise" value={`${round(entriesInRange.reduce((a, e) => a + Number(e.exercise_minutes), 0))} min`} />
            <Total label="Reading" value={`${entriesInRange.reduce((a, e) => a + Number(e.pages_read), 0)} pages`} />
          </dl>
        </Panel>
      </div>

      <DayDialog date={openDay} onClose={() => setOpenDay(null)} />
    </>
  );
}

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--card)",
} as const;

const round = (n: number) => Math.round(n * 10) / 10;

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface p-6">
      <h2 className="text-sm font-semibold">{title}</h2>
      {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

const Hint = ({ children }: { children: React.ReactNode }) => (
  <p className="py-10 text-center text-sm text-muted-foreground">{children}</p>
);

function Total({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="stat-number mt-1 text-xl font-semibold">{value}</dd>
    </div>
  );
}

function Heatmap({
  scores,
  onSelect,
}: {
  scores: { date: string; score: number }[];
  onSelect: (date: string) => void;
}) {
  const map = new Map(scores.map((s) => [s.date, s.score]));
  const weeks: string[][] = [];
  const end = new Date();
  end.setDate(end.getDate() + (6 - end.getDay()));
  for (let w = 25; w >= 0; w--) {
    const week: string[] = [];
    for (let day = 0; day < 7; day++) {
      const dt = new Date(end);
      dt.setDate(end.getDate() - w * 7 - (6 - day));
      week.push(toISODate(dt));
    }
    weeks.push(week);
  }

  const tone = (score: number | undefined) => {
    if (score === undefined) return "bg-muted";
    if (score >= 85) return "bg-primary";
    if (score >= 70) return "bg-primary/70";
    if (score >= 50) return "bg-primary/45";
    return "bg-primary/20";
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1">
          {weeks.map((week, i) => (
            <div key={i} className="flex flex-col gap-1">
              {week.map((date) => {
                const score = map.get(date);
                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => score !== undefined && onSelect(date)}
                    title={`${date}${score !== undefined ? ` — ${score}/100` : " — no data"}`}
                    className={cn(
                      "size-3.5 rounded-[3px] transition-transform hover:scale-125",
                      tone(score),
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        No data
        <span className="size-3 rounded-[3px] bg-muted" />
        <span className="size-3 rounded-[3px] bg-primary/20" />
        <span className="size-3 rounded-[3px] bg-primary/45" />
        <span className="size-3 rounded-[3px] bg-primary/70" />
        <span className="size-3 rounded-[3px] bg-primary" />
        High
      </div>
    </div>
  );
}

function DayDialog({ date, onClose }: { date: string | null; onClose: () => void }) {
  const d = useGrowthData();
  const entry = date ? d.entryByDate.get(date) : null;
  const score = date ? d.byDate.get(date) : null;

  return (
    <Dialog open={!!date} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{date}</DialogTitle>
          <DialogDescription>
            {score ? `Growth score ${score.score}/100` : "No entry recorded for this day."}
          </DialogDescription>
        </DialogHeader>
        {entry && score ? (
          <div className="space-y-4 text-sm">
            <dl className="grid grid-cols-2 gap-y-2">
              <dt className="text-muted-foreground">Study</dt>
              <dd className="text-right">
                {entry.study_hours}h {entry.study_subject ? `· ${entry.study_subject}` : ""}
              </dd>
              <dt className="text-muted-foreground">Coding</dt>
              <dd className="text-right">
                {entry.coding_hours}h {entry.coding_skill ? `· ${entry.coding_skill}` : ""}
              </dd>
              <dt className="text-muted-foreground">Exercise</dt>
              <dd className="text-right">
                {entry.exercise_minutes}m {entry.exercise_type ? `· ${entry.exercise_type}` : ""}
              </dd>
              <dt className="text-muted-foreground">Sleep</dt>
              <dd className="text-right">
                {entry.sleep_hours}h · quality {entry.sleep_quality}/10
              </dd>
              <dt className="text-muted-foreground">Water</dt>
              <dd className="text-right">{entry.water_liters}L</dd>
              <dt className="text-muted-foreground">Reading</dt>
              <dd className="text-right">{entry.pages_read} pages</dd>
              <dt className="text-muted-foreground">Productivity</dt>
              <dd className="text-right">{entry.productivity_rating}/10</dd>
              <dt className="text-muted-foreground">Habits complete</dt>
              <dd className="text-right">{score.habitPct}%</dd>
            </dl>
            {entry.notes ? (
              <p className="rounded-lg bg-muted p-3 text-muted-foreground">{entry.notes}</p>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
