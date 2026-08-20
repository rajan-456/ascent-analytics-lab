import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, PageHeader } from "@/components/AppShell";
import { StatCard } from "@/components/stats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTaskMutations, useTasks } from "@/lib/queries";
import { toISODate, type TaskRow } from "@/lib/growth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — GrowthOS" },
      {
        name: "description",
        content:
          "Manage tasks with priorities and deadlines. Completed tasks feed directly into your productivity score.",
      },
      { property: "og:title", content: "Tasks — GrowthOS" },
      {
        property: "og:description",
        content: "Priorities, deadlines and completion rates that feed your growth score.",
      },
    ],
  }),
  component: TasksPage,
});

const FILTERS = ["today", "upcoming", "completed", "high", "overdue", "all"] as const;
type Filter = (typeof FILTERS)[number];

function TasksPage() {
  const tasksQ = useTasks();
  const { create, update, remove } = useTaskMutations();
  const [filter, setFilter] = useState<Filter>("today");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskRow["priority"]>("medium");
  const [due, setDue] = useState(toISODate(new Date()));

  const tasks = useMemo(() => tasksQ.data ?? [], [tasksQ.data]);
  const today = toISODate(new Date());

  const visible = tasks.filter((t) => {
    switch (filter) {
      case "today":
        return !t.completed && t.due_date === today;
      case "upcoming":
        return !t.completed && (!t.due_date || t.due_date > today);
      case "completed":
        return t.completed;
      case "high":
        return !t.completed && t.priority === "high";
      case "overdue":
        return !t.completed && !!t.due_date && t.due_date < today;
      default:
        return true;
    }
  });

  const completed = tasks.filter((t) => t.completed).length;
  const completionPct = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await create.mutateAsync({ title: title.trim(), priority, due_date: due || null });
      setTitle("");
      toast.success("Task added");
    } catch {
      toast.error("Could not add task");
    }
  };

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Tasks due on a date contribute to that day's habit & task score."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total tasks" value={tasks.length} />
        <StatCard label="Completed" value={completed} />
        <StatCard label="Remaining" value={tasks.length - completed} />
        <StatCard label="Completion" value={`${completionPct}%`} />
      </div>

      <form onSubmit={add} className="surface mb-6 grid gap-4 p-5 sm:grid-cols-[1fr_auto_auto_auto]">
        <div className="space-y-2">
          <Label htmlFor="task-title">New task</Label>
          <Input
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Finish physics problem set"
          />
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as TaskRow["priority"])}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="task-due">Deadline</Label>
          <Input
            id="task-due"
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="w-44"
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={create.isPending}>
            <Plus className="size-4" /> Add
          </Button>
        </div>
      </form>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)} className="mb-4">
        <TabsList>
          {FILTERS.map((f) => (
            <TabsTrigger key={f} value={f} className="capitalize">
              {f}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {visible.length === 0 ? (
        <EmptyState
          title="Nothing here"
          description="No tasks match this filter yet. Add one above to get started."
        />
      ) : (
        <ul className="surface divide-y divide-border">
          {visible.map((t) => (
            <li key={t.id} className="flex items-center gap-3 p-4">
              <Checkbox
                checked={t.completed}
                onCheckedChange={(v) =>
                  update.mutate({
                    id: t.id,
                    completed: !!v,
                    completed_at: v ? new Date().toISOString() : null,
                  })
                }
              />
              <div className="min-w-0 flex-1">
                <p className={cn("truncate text-sm", t.completed && "text-muted-foreground line-through")}>
                  {t.title}
                </p>
                {t.due_date ? (
                  <p
                    className={cn(
                      "text-xs text-muted-foreground",
                      !t.completed && t.due_date < today && "text-destructive",
                    )}
                  >
                    Due {t.due_date}
                    {!t.completed && t.due_date < today ? " · overdue" : ""}
                  </p>
                ) : null}
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "capitalize",
                  t.priority === "high" && "border-destructive/40 text-destructive",
                  t.priority === "medium" && "border-warning/50 text-warning",
                )}
              >
                {t.priority}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete task"
                onClick={() => remove.mutate(t.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
