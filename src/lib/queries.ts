import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_SETTINGS,
  type DailyEntry,
  type Settings,
  type TaskRow,
} from "./growth";

export interface GoalRow {
  id: string;
  user_id: string;
  title: string;
  category: string;
  metric: string;
  period: "daily" | "weekly" | "monthly";
  target: number;
  unit: string;
  target_date: string | null;
  status: "active" | "paused" | "completed";
  created_at: string;
}

export interface AchievementRow {
  id: string;
  code: string;
  unlocked_at: string;
}

async function requireUserId() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const userId = await requireUserId();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return data as { id: string; display_name: string | null } | null;
    },
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async (): Promise<Settings> => {
      const userId = await requireUserId();
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        await supabase.from("user_settings").insert({ user_id: userId });
        return DEFAULT_SETTINGS;
      }
      return {
        goals: { ...DEFAULT_SETTINGS.goals, ...(data.goals as object) },
        weights: { ...DEFAULT_SETTINGS.weights, ...(data.weights as object) },
        enabled: { ...DEFAULT_SETTINGS.enabled, ...(data.enabled as object) },
        xp_rewards: { ...DEFAULT_SETTINGS.xp_rewards, ...(data.xp_rewards as object) },
        streak_min_score: data.streak_min_score ?? 60,
      } as Settings;
    },
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Settings>) => {
      const userId = await requireUserId();
      const { error } = await supabase
        .from("user_settings")
        .upsert({ user_id: userId, ...(patch as Record<string, unknown>) } as never, {
          onConflict: "user_id",
        });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useEntries() {
  return useQuery({
    queryKey: ["entries"],
    queryFn: async (): Promise<DailyEntry[]> => {
      const userId = await requireUserId();
      const { data, error } = await supabase
        .from("daily_entries")
        .select("*")
        .eq("user_id", userId)
        .order("entry_date", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((e) => ({
        ...e,
        study_hours: Number(e.study_hours),
        exercise_minutes: Number(e.exercise_minutes),
        coding_hours: Number(e.coding_hours),
        water_liters: Number(e.water_liters),
        sleep_hours: Number(e.sleep_hours),
      })) as DailyEntry[];
    },
  });
}

export function useSaveEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: Partial<DailyEntry> & { entry_date: string }) => {
      const userId = await requireUserId();
      const { error } = await supabase
        .from("daily_entries")
        .upsert({ ...entry, user_id: userId } as never, { onConflict: "user_id,entry_date" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async (): Promise<TaskRow[]> => {
      const userId = await requireUserId();
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TaskRow[];
    },
  });
}

export function useTaskMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries();
  return {
    create: useMutation({
      mutationFn: async (task: Partial<TaskRow> & { title: string }) => {
        const userId = await requireUserId();
        const { error } = await supabase.from("tasks").insert({ ...task, user_id: userId } as never);
        if (error) throw error;
      },
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: async ({ id, ...patch }: Partial<TaskRow> & { id: string }) => {
        const { error } = await supabase.from("tasks").update(patch as never).eq("id", id);
        if (error) throw error;
      },
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase.from("tasks").delete().eq("id", id);
        if (error) throw error;
      },
      onSuccess: invalidate,
    }),
  };
}

export function useGoals() {
  return useQuery({
    queryKey: ["goals"],
    queryFn: async (): Promise<GoalRow[]> => {
      const userId = await requireUserId();
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((g) => ({ ...g, target: Number(g.target) })) as GoalRow[];
    },
  });
}

export function useGoalMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries();
  return {
    create: useMutation({
      mutationFn: async (goal: Partial<GoalRow> & { title: string }) => {
        const userId = await requireUserId();
        const { error } = await supabase.from("goals").insert({ ...goal, user_id: userId } as never);
        if (error) throw error;
      },
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: async ({ id, ...patch }: Partial<GoalRow> & { id: string }) => {
        const { error } = await supabase.from("goals").update(patch as never).eq("id", id);
        if (error) throw error;
      },
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase.from("goals").delete().eq("id", id);
        if (error) throw error;
      },
      onSuccess: invalidate,
    }),
  };
}

export function useUnlockedAchievements() {
  return useQuery({
    queryKey: ["achievements"],
    queryFn: async (): Promise<AchievementRow[]> => {
      const userId = await requireUserId();
      const { data, error } = await supabase
        .from("user_achievements")
        .select("*")
        .eq("user_id", userId);
      if (error) throw error;
      return (data ?? []) as AchievementRow[];
    },
  });
}

export function useRecordAchievements() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (codes: string[]) => {
      if (codes.length === 0) return;
      const userId = await requireUserId();
      const { error } = await supabase
        .from("user_achievements")
        .upsert(
          codes.map((code) => ({ user_id: userId, code })),
          { onConflict: "user_id,code", ignoreDuplicates: true },
        );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["achievements"] }),
  });
}
