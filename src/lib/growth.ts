// Core GrowthOS domain logic: scoring, levels, streaks, achievements, insights.
// Everything is derived deterministically from stored daily entries + settings,
// so editing history automatically recalculates every statistic.

export type CategoryKey =
  | "study"
  | "productivity"
  | "coding"
  | "exercise"
  | "sleep"
  | "diet"
  | "reading"
  | "tasks";

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  study: "Study",
  productivity: "Productivity",
  coding: "Coding",
  exercise: "Exercise",
  sleep: "Sleep",
  diet: "Diet & Water",
  reading: "Reading",
  tasks: "Habits & Tasks",
};

export const CATEGORY_ORDER: CategoryKey[] = [
  "study",
  "productivity",
  "coding",
  "exercise",
  "sleep",
  "diet",
  "reading",
  "tasks",
];

export interface Goals {
  study_hours: number;
  sleep_hours: number;
  exercise_minutes: number;
  coding_hours: number;
  reading_pages: number;
  water_liters: number;
}

export interface XpRewards {
  checkin: number;
  study: number;
  coding: number;
  exercise: number;
  reading: number;
  sleep: number;
  perfect_day: number;
  streak_bonus: number;
}

export interface Settings {
  goals: Goals;
  weights: Record<CategoryKey, number>;
  enabled: Record<CategoryKey, boolean>;
  xp_rewards: XpRewards;
  streak_min_score: number;
}

export const DEFAULT_SETTINGS: Settings = {
  goals: {
    study_hours: 4,
    sleep_hours: 8,
    exercise_minutes: 30,
    coding_hours: 1,
    reading_pages: 20,
    water_liters: 3,
  },
  weights: {
    study: 20,
    productivity: 15,
    coding: 15,
    exercise: 10,
    sleep: 10,
    diet: 10,
    reading: 10,
    tasks: 10,
  },
  enabled: {
    study: true,
    productivity: true,
    coding: true,
    exercise: true,
    sleep: true,
    diet: true,
    reading: true,
    tasks: true,
  },
  xp_rewards: {
    checkin: 10,
    study: 25,
    coding: 20,
    exercise: 15,
    reading: 10,
    sleep: 10,
    perfect_day: 50,
    streak_bonus: 5,
  },
  streak_min_score: 60,
};

export interface DailyEntry {
  id: string;
  user_id: string;
  entry_date: string;
  studied: boolean;
  study_hours: number;
  study_subject: string | null;
  focus_rating: number;
  exercised: boolean;
  exercise_minutes: number;
  exercise_type: string | null;
  fitness_rating: number;
  coded: boolean;
  coding_hours: number;
  coding_skill: string | null;
  coding_rating: number;
  productivity_rating: number;
  distraction_rating: number;
  ate_healthy: boolean;
  water_liters: number;
  diet_rating: number;
  sleep_hours: number;
  sleep_quality: number;
  pages_read: number;
  notes: string | null;
}

export interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  priority: "high" | "medium" | "low";
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));
export const pct = (value: number, target: number) =>
  target <= 0 ? 0 : clamp((value / target) * 100);
export const rating = (n: number) => clamp((n / 10) * 100);

export function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(iso: string, delta: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y!, (m ?? 1) - 1, d ?? 1);
  date.setDate(date.getDate() + delta);
  return toISODate(date);
}

/** Per-category score 0-100 for one day. */
export function categoryScores(
  entry: DailyEntry,
  settings: Settings,
  taskCompletion: number | null,
): Record<CategoryKey, number> {
  const g = settings.goals;
  return {
    study: Math.round(0.6 * pct(entry.study_hours, g.study_hours) + 0.4 * rating(entry.focus_rating)),
    productivity: Math.round(
      0.6 * rating(entry.productivity_rating) + 0.4 * rating(10 - entry.distraction_rating),
    ),
    coding: Math.round(
      0.6 * pct(entry.coding_hours, g.coding_hours) + 0.4 * rating(entry.coding_rating),
    ),
    exercise: Math.round(
      0.6 * pct(entry.exercise_minutes, g.exercise_minutes) + 0.4 * rating(entry.fitness_rating),
    ),
    sleep: Math.round(
      0.6 * sleepScore(entry.sleep_hours, g.sleep_hours) + 0.4 * rating(entry.sleep_quality),
    ),
    diet: Math.round(
      0.4 * pct(entry.water_liters, g.water_liters) +
        0.4 * rating(entry.diet_rating) +
        0.2 * (entry.ate_healthy ? 100 : 0),
    ),
    reading: Math.round(pct(entry.pages_read, g.reading_pages)),
    tasks: Math.round(taskCompletion ?? habitCompletion(entry, settings)),
  };
}

/** Sleeping far above the target is not better than the target. */
function sleepScore(hours: number, target: number) {
  if (hours <= 0) return 0;
  if (hours <= target) return (hours / target) * 100;
  return clamp(100 - (hours - target) * 12);
}

/** Fraction of the day's core habits that were completed. */
export function habitCompletion(entry: DailyEntry, settings: Settings) {
  const g = settings.goals;
  const habits = [
    entry.study_hours >= g.study_hours,
    entry.coding_hours >= g.coding_hours,
    entry.exercise_minutes >= g.exercise_minutes,
    entry.pages_read >= g.reading_pages,
    entry.sleep_hours >= g.sleep_hours,
    entry.water_liters >= g.water_liters,
    entry.ate_healthy,
  ];
  return (habits.filter(Boolean).length / habits.length) * 100;
}

export function habitBreakdown(entry: DailyEntry, settings: Settings) {
  const g = settings.goals;
  return [
    { key: "study", label: `Study ${g.study_hours}h`, done: entry.study_hours >= g.study_hours },
    { key: "coding", label: `Code ${g.coding_hours}h`, done: entry.coding_hours >= g.coding_hours },
    {
      key: "exercise",
      label: `Exercise ${g.exercise_minutes}m`,
      done: entry.exercise_minutes >= g.exercise_minutes,
    },
    {
      key: "reading",
      label: `Read ${g.reading_pages}p`,
      done: entry.pages_read >= g.reading_pages,
    },
    { key: "sleep", label: `Sleep ${g.sleep_hours}h`, done: entry.sleep_hours >= g.sleep_hours },
    {
      key: "water",
      label: `Water ${g.water_liters}L`,
      done: entry.water_liters >= g.water_liters,
    },
    { key: "diet", label: "Healthy eating", done: entry.ate_healthy },
  ];
}

export function normalizedWeights(settings: Settings) {
  const active = CATEGORY_ORDER.filter((k) => settings.enabled[k]);
  const total = active.reduce((sum, k) => sum + (settings.weights[k] || 0), 0);
  const out = {} as Record<CategoryKey, number>;
  for (const k of CATEGORY_ORDER) {
    out[k] = settings.enabled[k] && total > 0 ? ((settings.weights[k] || 0) / total) * 100 : 0;
  }
  return out;
}

export interface DayScore {
  date: string;
  score: number;
  categories: Record<CategoryKey, number>;
  habitPct: number;
}

export function growthScore(
  entry: DailyEntry,
  settings: Settings,
  taskCompletion: number | null = null,
): DayScore {
  const categories = categoryScores(entry, settings, taskCompletion);
  const w = normalizedWeights(settings);
  const score = CATEGORY_ORDER.reduce((sum, k) => sum + (categories[k] * w[k]) / 100, 0);
  return {
    date: entry.entry_date,
    score: Math.round(clamp(score)),
    categories,
    habitPct: Math.round(habitCompletion(entry, settings)),
  };
}

export function buildScores(
  entries: DailyEntry[],
  settings: Settings,
  taskCompletionByDate: Record<string, number> = {},
): DayScore[] {
  return entries
    .slice()
    .sort((a, b) => a.entry_date.localeCompare(b.entry_date))
    .map((e) => growthScore(e, settings, taskCompletionByDate[e.entry_date] ?? null));
}

export const average = (values: number[]) =>
  values.length === 0 ? null : Math.round(values.reduce((a, b) => a + b, 0) / values.length);

/* ---------------------------------- XP ---------------------------------- */

export function dayXp(entry: DailyEntry, settings: Settings, score: number) {
  const g = settings.goals;
  const r = settings.xp_rewards;
  let xp = r.checkin;
  if (entry.study_hours >= g.study_hours) xp += r.study;
  if (entry.coding_hours >= g.coding_hours) xp += r.coding;
  if (entry.exercise_minutes >= g.exercise_minutes) xp += r.exercise;
  if (entry.pages_read >= g.reading_pages) xp += r.reading;
  if (entry.sleep_hours >= g.sleep_hours) xp += r.sleep;
  if (habitCompletion(entry, settings) === 100 && score >= 90) xp += r.perfect_day;
  return xp;
}

export function totalXp(entries: DailyEntry[], settings: Settings, scores: DayScore[]) {
  const byDate = new Map(scores.map((s) => [s.date, s.score]));
  const base = entries.reduce((sum, e) => sum + dayXp(e, settings, byDate.get(e.entry_date) ?? 0), 0);
  const streak = streakInfo(scores, settings).current;
  return base + streak * settings.xp_rewards.streak_bonus;
}

export const LEVEL_TITLES: { level: number; title: string }[] = [
  { level: 1, title: "Beginner" },
  { level: 2, title: "Building" },
  { level: 5, title: "Consistent" },
  { level: 10, title: "Focused" },
  { level: 20, title: "High Performer" },
  { level: 35, title: "Relentless" },
  { level: 50, title: "Elite Growth" },
];

/** XP required to go from level n to n+1 — grows gradually. */
export const xpForLevel = (level: number) => 100 + (level - 1) * 150;

export function levelFromXp(xp: number) {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpForLevel(level) && level < 999) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  const need = xpForLevel(level);
  const title = [...LEVEL_TITLES].reverse().find((t) => level >= t.level)?.title ?? "Beginner";
  return { level, title, into: Math.round(remaining), need, pct: Math.round((remaining / need) * 100) };
}

/* -------------------------------- Streaks -------------------------------- */

export interface StreakResult {
  current: number;
  longest: number;
}

export function streakFromDates(successDates: string[]): StreakResult {
  const set = new Set(successDates);
  if (set.size === 0) return { current: 0, longest: 0 };
  const sorted = [...set].sort();

  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (addDays(sorted[i - 1]!, 1) === sorted[i]) run += 1;
    else run = 1;
    longest = Math.max(longest, run);
  }

  const today = toISODate(new Date());
  let cursor = set.has(today) ? today : addDays(today, -1);
  let current = 0;
  while (set.has(cursor)) {
    current += 1;
    cursor = addDays(cursor, -1);
  }
  return { current, longest };
}

export function streakInfo(scores: DayScore[], settings: Settings): StreakResult {
  return streakFromDates(
    scores.filter((s) => s.score >= settings.streak_min_score).map((s) => s.date),
  );
}

export function categoryStreak(entries: DailyEntry[], predicate: (e: DailyEntry) => boolean) {
  return streakFromDates(entries.filter(predicate).map((e) => e.entry_date));
}

/* ------------------------------ Achievements ----------------------------- */

export interface AchievementDef {
  code: string;
  icon: string;
  title: string;
  description: string;
  target: number;
  progress: (ctx: AchievementContext) => number;
}

export interface AchievementContext {
  entries: DailyEntry[];
  scores: DayScore[];
  settings: Settings;
  streak: StreakResult;
}

const sum = (entries: DailyEntry[], pick: (e: DailyEntry) => number) =>
  entries.reduce((a, e) => a + (pick(e) || 0), 0);

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    code: "streak_7",
    icon: "🔥",
    title: "First 7-Day Streak",
    description: "Hit your minimum growth score 7 days in a row.",
    target: 7,
    progress: (c) => c.streak.longest,
  },
  {
    code: "study_100",
    icon: "📚",
    title: "100 Study Hours",
    description: "Log 100 total hours of study.",
    target: 100,
    progress: (c) => sum(c.entries, (e) => Number(e.study_hours)),
  },
  {
    code: "coding_100",
    icon: "💻",
    title: "100 Coding Hours",
    description: "Log 100 total hours of coding.",
    target: 100,
    progress: (c) => sum(c.entries, (e) => Number(e.coding_hours)),
  },
  {
    code: "exercise_30",
    icon: "🏋️",
    title: "30 Exercise Sessions",
    description: "Complete 30 days with exercise logged.",
    target: 30,
    progress: (c) => c.entries.filter((e) => e.exercised).length,
  },
  {
    code: "pages_1000",
    icon: "📖",
    title: "1,000 Pages Read",
    description: "Read 1,000 pages in total.",
    target: 1000,
    progress: (c) => sum(c.entries, (e) => Number(e.pages_read)),
  },
  {
    code: "perfect_day",
    icon: "🎯",
    title: "Perfect Day",
    description: "Complete every habit in a single day.",
    target: 1,
    progress: (c) => (c.scores.some((s) => s.habitPct === 100) ? 1 : 0),
  },
  {
    code: "consistency_30",
    icon: "⚡",
    title: "30-Day Consistency",
    description: "Reach a 30-day success streak.",
    target: 30,
    progress: (c) => c.streak.longest,
  },
  {
    code: "score_90",
    icon: "🏆",
    title: "90+ Growth Score",
    description: "Finish a day with a growth score of 90 or higher.",
    target: 1,
    progress: (c) => (c.scores.some((s) => s.score >= 90) ? 1 : 0),
  },
  {
    code: "checkins_30",
    icon: "🗓️",
    title: "30 Check-Ins",
    description: "Complete 30 daily check-ins.",
    target: 30,
    progress: (c) => c.entries.length,
  },
];

export function achievementState(ctx: AchievementContext) {
  return ACHIEVEMENTS.map((a) => {
    const raw = a.progress(ctx);
    return {
      ...a,
      value: Math.round(raw * 10) / 10,
      unlocked: raw >= a.target,
      pct: Math.round(clamp((raw / a.target) * 100)),
    };
  });
}

/* -------------------------------- Insights ------------------------------- */

export type InsightKind = "observation" | "trend" | "prediction";

export interface Insight {
  kind: InsightKind;
  title: string;
  detail: string;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function generateInsights(
  entries: DailyEntry[],
  scores: DayScore[],
  settings: Settings,
): Insight[] {
  const out: Insight[] = [];
  if (scores.length < 3) return out;

  const last7 = scores.slice(-7);
  const prev7 = scores.slice(-14, -7);
  const a7 = average(last7.map((s) => s.score));
  const p7 = average(prev7.map((s) => s.score));

  if (a7 !== null && p7 !== null) {
    const delta = a7 - p7;
    out.push({
      kind: "trend",
      title:
        delta > 2
          ? "Your overall growth is trending up"
          : delta < -2
            ? "Your overall growth is trending down"
            : "Your overall growth is stable",
      detail: `Last 7 days average ${a7}/100 vs ${p7}/100 the week before (${delta >= 0 ? "+" : ""}${delta} points).`,
    });
  }

  // Strongest / weakest category over the last 7 days.
  const catAvg = CATEGORY_ORDER.filter((k) => settings.enabled[k]).map((k) => ({
    key: k,
    value: average(last7.map((s) => s.categories[k])) ?? 0,
  }));
  if (catAvg.length) {
    const sorted = [...catAvg].sort((a, b) => b.value - a.value);
    const best = sorted[0]!;
    const worst = sorted[sorted.length - 1]!;
    out.push({
      kind: "observation",
      title: `${CATEGORY_LABELS[worst.key]} is your weakest area this week`,
      detail: `${CATEGORY_LABELS[worst.key]} averaged ${worst.value}/100, while ${CATEGORY_LABELS[best.key]} averaged ${best.value}/100.`,
    });
  }

  // Best weekday, needs at least 2 samples per day.
  const byWeekday = new Map<number, number[]>();
  for (const s of scores) {
    const [y, m, d] = s.date.split("-").map(Number);
    const wd = new Date(y!, (m ?? 1) - 1, d ?? 1).getDay();
    byWeekday.set(wd, [...(byWeekday.get(wd) ?? []), s.score]);
  }
  const weekdayAvgs = [...byWeekday.entries()]
    .filter(([, v]) => v.length >= 2)
    .map(([wd, v]) => ({ wd, avg: average(v)! }));
  if (weekdayAvgs.length >= 3) {
    const top = weekdayAvgs.sort((a, b) => b.avg - a.avg)[0]!;
    out.push({
      kind: "observation",
      title: `You perform best on ${WEEKDAYS[top.wd]}s`,
      detail: `Your average growth score on ${WEEKDAYS[top.wd]}s is ${top.avg}/100 across ${byWeekday.get(top.wd)!.length} logged days.`,
    });
  }

  // Sleep vs score relationship.
  const target = settings.goals.sleep_hours;
  const good = entries.filter((e) => Number(e.sleep_hours) >= target);
  const bad = entries.filter((e) => Number(e.sleep_hours) > 0 && Number(e.sleep_hours) < target);
  if (good.length >= 3 && bad.length >= 3) {
    const map = new Map(scores.map((s) => [s.date, s.score]));
    const ga = average(good.map((e) => map.get(e.entry_date) ?? 0))!;
    const ba = average(bad.map((e) => map.get(e.entry_date) ?? 0))!;
    if (Math.abs(ga - ba) >= 4) {
      out.push({
        kind: "observation",
        title:
          ga > ba
            ? "Your performance drops when you sleep below target"
            : "Your best days are not your longest-sleep days",
        detail: `Days with ${target}h+ sleep average ${ga}/100; days below target average ${ba}/100.`,
      });
    }
  }

  // Exercise correlation.
  const map = new Map(scores.map((s) => [s.date, s.score]));
  const exDays = entries.filter((e) => e.exercised);
  const noEx = entries.filter((e) => !e.exercised);
  if (exDays.length >= 3 && noEx.length >= 3) {
    const ea = average(exDays.map((e) => map.get(e.entry_date) ?? 0))!;
    const na = average(noEx.map((e) => map.get(e.entry_date) ?? 0))!;
    if (ea - na >= 4) {
      out.push({
        kind: "observation",
        title: "Exercise days are your strongest days",
        detail: `Days with exercise average ${ea}/100 vs ${na}/100 without.`,
      });
    }
  }

  // Prediction from linear trend of the last 30 days.
  const window = scores.slice(-30);
  if (window.length >= 10) {
    const n = window.length;
    const xs = window.map((_, i) => i);
    const ys = window.map((s) => s.score);
    const mx = xs.reduce((a, b) => a + b, 0) / n;
    const my = ys.reduce((a, b) => a + b, 0) / n;
    const denom = xs.reduce((a, x) => a + (x - mx) ** 2, 0) || 1;
    const slope = xs.reduce((a, x, i) => a + (x - mx) * (ys[i]! - my), 0) / denom;
    const predicted = clamp(my + slope * (n / 2 + 3.5));
    const residual = Math.sqrt(
      ys.reduce((a, y, i) => a + (y - (my + slope * (xs[i]! - mx))) ** 2, 0) / n,
    );
    const lo = Math.round(clamp(predicted - residual / 2));
    const hi = Math.round(clamp(predicted + residual / 2));
    out.push({
      kind: "prediction",
      title: `Estimated growth score next week: ${lo}–${hi}`,
      detail: `Estimate based on the linear trend of your last ${n} logged days. This is a projection, not a measurement.`,
    });
  }

  return out;
}
