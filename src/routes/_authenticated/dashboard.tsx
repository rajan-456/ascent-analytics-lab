import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  CalendarDays,
  CheckCircle2,
  Flame,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart as RLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "@/components/AppShell";
import { Meter, ScoreRing, StatCard, TrendBadge } from "@/components/stats";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGrowthData } from "@/lib/useGrowthData";
import { CATEGORY_LABELS, CATEGORY_ORDER, habitBreakdown } from "@/lib/growth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — GrowthOS Personal Growth Analytics" },
      {
        name: "description",
        content:
          "Your daily growth score, streaks, level progress and today's habits at a glance in GrowthOS.",
      },
      { property: "og:title", content: "GrowthOS Dashboard" },
      {
        property: "og:description",
        content: "Track your daily growth score, streaks, XP and habit completion.",
      },
    ],
  }),
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning! Let's improve today.";
  if (h < 18) return "Good afternoon! Keep the momentum.";
  return "Good evening! Let's improve today.";
}

function Dashboard() {
  const d = useGrowthData();

  if (d.loading) return <DashboardSkeleton />;

  const todayEntry = d.entryByDate.get(d.today);
  const delta =
    d.todayScore && d.yesterdayScore ? d.todayScore.score - d.yesterdayScore.score : null;
  const chartData = d.scores.slice(-30).map((s) => ({ date: s.date.slice(5), score: s.score }));
  const openTasks = d.tasks.filter((t) => !t.completed);
  const todayTasks = openTasks.filter((t) => t.due_date === d.today);
  const recentAchievements = d.achievements.filter((a) => a.unlocked).slice(0, 3);

  const weakest = d.todayScore
    ? CATEGORY_ORDER.filter((k) => d.settings.enabled[k]).reduce((a, b) =>
        d.todayScore!.categories[b] < d.todayScore!.categories[a] ? b : a,
      )
    : null;

  return (
    <div className="space-y-8">
      <header>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-4" />
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
          Personal Growth Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{greeting()}</p>
      </header>

      {!todayEntry ? (
        <div className="surface flex flex-wrap items-center justify-between gap-4 border-primary/30 bg-accent/40 p-5">
          <div>
            <p className="font-medium">You haven&apos;t checked in today</p>
            <p className="text-sm text-muted-foreground">
              Log today&apos;s numbers to update your growth score, streak and XP.
            </p>
          </div>
          <Button asChild>
            <Link to="/checkin">Start today&apos;s check-in</Link>
          </Button>
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's Growth Score"
          value={d.todayScore ? `${d.todayScore.score} / 100` : "—"}
          sub={<TrendBadge delta={delta} />}
          icon={<TrendingUp className="size-4" />}
          footer={
            <dl className="grid grid-cols-2 gap-y-1 text-xs text-muted-foreground">
              <dt>Yesterday</dt>
              <dd className="text-right">{d.yesterdayScore?.score ?? "—"}</dd>
              <dt>Weekly avg</dt>
              <dd className="text-right">{d.weeklyAvg ?? "—"}</dd>
              <dt>Monthly avg</dt>
              <dd className="text-right">{d.monthlyAvg ?? "—"}</dd>
              <dt>All-time avg</dt>
              <dd className="text-right">{d.allTimeAvg ?? "—"}</dd>
            </dl>
          }
        />
        <StatCard
          label="Current Streak"
          value={`🔥 ${d.streak.current} ${d.streak.current === 1 ? "day" : "days"}`}
          sub={`Longest: ${d.streak.longest} days`}
          icon={<Flame className="size-4" />}
          footer={
            <p className="text-xs text-muted-foreground">
              A day counts when your growth score reaches {d.settings.streak_min_score}.
            </p>
          }
        />
        <StatCard
          label="Level"
          value={`Level ${d.level.level}`}
          sub={d.level.title}
          icon={<Award className="size-4" />}
          footer={
            <Meter
              label="XP"
              value={d.level.pct}
              detail={`${d.level.into.toLocaleString()} / ${d.level.need.toLocaleString()} XP`}
            />
          }
        />
        <StatCard
          label="Habit Completion"
          value={d.todayScore ? `${d.todayScore.habitPct}%` : "—"}
          sub={
            todayEntry
              ? `${habitBreakdown(todayEntry, d.settings).filter((h) => h.done).length} of ${
                  habitBreakdown(todayEntry, d.settings).length
                } habits done`
              : "No check-in yet"
          }
          icon={<CheckCircle2 className="size-4" />}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="surface flex flex-col items-center justify-center gap-4 p-6">
          <h2 className="self-start text-sm font-semibold">Today at a glance</h2>
          <ScoreRing score={d.todayScore?.score ?? 0} />
          {weakest ? (
            <p className="text-center text-sm text-muted-foreground">
              Weakest area today:{" "}
              <span className="font-medium text-foreground">{CATEGORY_LABELS[weakest]}</span>
            </p>
          ) : null}
        </div>

        <div className="surface p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold">Today&apos;s progress by category</h2>
          {d.todayScore ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {CATEGORY_ORDER.filter((k) => d.settings.enabled[k]).map((k) => (
                <Meter key={k} label={CATEGORY_LABELS[k]} value={d.todayScore!.categories[k]} />
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              Category progress appears after your first check-in today.
            </p>
          )}
        </div>
      </section>

      <section className="surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Growth score trend (last 30 logged days)</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/analytics">Open analytics</Link>
          </Button>
        </div>
        {chartData.length >= 2 ? (
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RLineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </RLineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">
            Log at least two days to see your trend line.
          </p>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Today&apos;s tasks</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/tasks">All tasks</Link>
            </Button>
          </div>
          {todayTasks.length ? (
            <ul className="mt-4 space-y-2">
              {todayTasks.slice(0, 5).map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
                  <span>{t.title}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      t.priority === "high" && "border-destructive/40 text-destructive",
                      t.priority === "medium" && "border-warning/50 text-warning",
                    )}
                  >
                    {t.priority}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No tasks due today.</p>
          )}
        </div>

        <div className="surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Daily goals</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/goals">Manage</Link>
            </Button>
          </div>
          {todayEntry ? (
            <ul className="mt-4 space-y-2 text-sm">
              {habitBreakdown(todayEntry, d.settings).map((h) => (
                <li key={h.key} className="flex items-center gap-2">
                  <CheckCircle2
                    className={cn("size-4", h.done ? "text-success" : "text-muted-foreground/40")}
                  />
                  <span className={cn(h.done && "text-muted-foreground line-through")}>
                    {h.label}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Check in today to see your goal progress.
            </p>
          )}
        </div>

        <div className="surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent achievements</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/achievements">View all</Link>
            </Button>
          </div>
          {recentAchievements.length ? (
            <ul className="mt-4 space-y-3">
              {recentAchievements.map((a) => (
                <li key={a.code} className="flex items-start gap-3 text-sm">
                  <span className="text-lg">{a.icon}</span>
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No achievements unlocked yet — keep logging.
            </p>
          )}
        </div>
      </section>

      <section className="surface p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="size-4 text-primary" /> Insights from your data
        </h2>
        {d.insights.length ? (
          <ul className="mt-4 space-y-3">
            {d.insights.slice(0, 3).map((i, idx) => (
              <li key={idx} className="flex flex-wrap items-baseline gap-2 text-sm">
                <Badge variant="secondary" className="capitalize">
                  {i.kind}
                </Badge>
                <span className="font-medium">{i.title}</span>
                <span className="text-muted-foreground">{i.detail}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Insights appear once you have at least 3 days of data.
          </p>
        )}
      </section>

      {d.scores.length === 0 ? (
        <EmptyState
          title="No history yet"
          description="Your analytics, streaks and predictions build up as you complete daily check-ins."
          action={
            <Button asChild>
              <Link to="/checkin">
                <Target className="size-4" /> Complete your first check-in
              </Link>
            </Button>
          }
        />
      ) : null}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}
