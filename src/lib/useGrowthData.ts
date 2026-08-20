import { useMemo } from "react";
import {
  DEFAULT_SETTINGS,
  achievementState,
  average,
  buildScores,
  generateInsights,
  levelFromXp,
  streakInfo,
  toISODate,
  totalXp,
  type DailyEntry,
  type DayScore,
} from "./growth";
import { useEntries, useSettings, useTasks } from "./queries";

export function useGrowthData() {
  const settingsQ = useSettings();
  const entriesQ = useEntries();
  const tasksQ = useTasks();

  const settings = settingsQ.data ?? DEFAULT_SETTINGS;
  const entries = useMemo(() => entriesQ.data ?? [], [entriesQ.data]);
  const tasks = useMemo(() => tasksQ.data ?? [], [tasksQ.data]);

  const taskCompletionByDate = useMemo(() => {
    const map: Record<string, { total: number; done: number }> = {};
    for (const t of tasks) {
      if (!t.due_date) continue;
      map[t.due_date] ??= { total: 0, done: 0 };
      map[t.due_date]!.total += 1;
      if (t.completed) map[t.due_date]!.done += 1;
    }
    const out: Record<string, number> = {};
    for (const [date, v] of Object.entries(map)) out[date] = (v.done / v.total) * 100;
    return out;
  }, [tasks]);

  const scores = useMemo(
    () => buildScores(entries, settings, taskCompletionByDate),
    [entries, settings, taskCompletionByDate],
  );

  const today = toISODate(new Date());
  const yesterday = toISODate(new Date(Date.now() - 86400000));
  const byDate = useMemo(() => new Map(scores.map((s) => [s.date, s])), [scores]);
  const entryByDate = useMemo(() => new Map(entries.map((e) => [e.entry_date, e])), [entries]);

  const todayScore = byDate.get(today) ?? null;
  const yesterdayScore = byDate.get(yesterday) ?? null;

  const last = (n: number) => scores.slice(-n).map((s) => s.score);
  const streak = streakInfo(scores, settings);
  const xp = totalXp(entries, settings, scores);
  const level = levelFromXp(xp);

  const best = scores.length ? scores.reduce((a, b) => (b.score > a.score ? b : a)) : null;
  const worst = scores.length ? scores.reduce((a, b) => (b.score < a.score ? b : a)) : null;

  const achievements = achievementState({ entries, scores, settings, streak });
  const insights = generateInsights(entries, scores, settings);

  return {
    loading: settingsQ.isLoading || entriesQ.isLoading || tasksQ.isLoading,
    error: settingsQ.error ?? entriesQ.error ?? tasksQ.error,
    settings,
    entries,
    tasks,
    scores,
    byDate,
    entryByDate,
    today,
    yesterday,
    todayScore,
    yesterdayScore,
    weeklyAvg: average(last(7)),
    monthlyAvg: average(last(30)),
    allTimeAvg: average(scores.map((s) => s.score)),
    streak,
    xp,
    level,
    best,
    worst,
    achievements,
    insights,
  };
}

export type GrowthData = ReturnType<typeof useGrowthData>;
export type { DailyEntry, DayScore };
