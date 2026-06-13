"use client";

import { useState, useEffect, useCallback } from "react";

interface CommunityTask {
  id: string;
  title: string;
  is_completed: boolean;
  created_at: string;
}

interface StepCommunityProps {
  onComplete: () => void;
  isComplete: boolean;
}

export default function StepCommunity({ onComplete, isComplete }: StepCommunityProps) {
  const [lumaChecked, setLumaChecked] = useState(false);
  const [slackChecked, setSlackChecked] = useState(false);
  const [tasks, setTasks] = useState<CommunityTask[]>([]);
  const [newTask, setNewTask] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Load fixed checks from localStorage (daily reset)
  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const saved = localStorage.getItem("lighten-community-checks");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) {
          setLumaChecked(parsed.luma ?? false);
          setSlackChecked(parsed.slack ?? false);
        }
      }
    } catch { /* ignore */ }
  }, []);

  const saveChecks = (luma: boolean, slack: boolean) => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem("lighten-community-checks", JSON.stringify({ date: today, luma, slack }));
  };

  const toggleLuma = () => {
    const next = !lumaChecked;
    setLumaChecked(next);
    saveChecks(next, slackChecked);
  };

  const toggleSlack = () => {
    const next = !slackChecked;
    setSlackChecked(next);
    saveChecks(lumaChecked, next);
  };

  // Load tasks from the API (Drizzle, scoped to current user server-side)
  const loadTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/community-tasks");
      if (res.ok) {
        const { data } = await res.json();
        if (data) setTasks(data);
      }
    } catch {
      // Silent fail
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const addTask = async () => {
    const title = newTask.trim();
    if (!title) return;
    setIsAdding(true);
    try {
      const res = await fetch("/api/community-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        const { data } = await res.json();
        if (data) {
          setTasks((prev) => [...prev, data]);
          setNewTask("");
        }
      }
    } catch {
      // Silent fail
    }
    setIsAdding(false);
  };

  const toggleTask = async (task: CommunityTask) => {
    const next = !task.is_completed;
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, is_completed: next } : t));
    await fetch("/api/community-tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, is_completed: next }),
    });
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/community-tasks?id=${id}`, { method: "DELETE" });
  };

  const completedTasks = tasks.filter((t) => t.is_completed).length;
  const totalChecks = 2 + tasks.length; // Luma + Slack + custom tasks
  const doneChecks = (lumaChecked ? 1 : 0) + (slackChecked ? 1 : 0) + completedTasks;

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-1.5 bg-[#E8E6E1] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#5F9468] rounded-full transition-all duration-300"
            style={{ width: totalChecks > 0 ? `${(doneChecks / totalChecks) * 100}%` : "0%" }}
          />
        </div>
        <span className="text-xs text-[#999] shrink-0">
          {doneChecks}/{totalChecks}
        </span>
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        {/* Fixed: Check Luma */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[#E8E6E1] bg-[#FAFAF8]">
          <button
            onClick={toggleLuma}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors duration-200 ${
              lumaChecked
                ? "bg-[#5F9468] border-[#5F9468]"
                : "border-[#D1CFC9] hover:border-[#5F9468]"
            }`}
          >
            {lumaChecked && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <div className="flex-1 min-w-0">
            <span className={`text-sm ${lumaChecked ? "text-[#5F9468] line-through" : "text-[#1C1C1C]"}`}>
              Check Luma for messages
            </span>
            <p className="text-xs text-[#999] mt-0.5">Reply to any community messages, RSVPs, or event questions</p>
          </div>
          <a
            href="https://lu.ma/home"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#5F9468] hover:text-[#4F8357] font-medium transition-colors shrink-0"
          >
            Open Luma
          </a>
        </div>

        {/* Fixed: Check MakersLounge Slack */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[#E8E6E1] bg-[#FAFAF8]">
          <button
            onClick={toggleSlack}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors duration-200 ${
              slackChecked
                ? "bg-[#5F9468] border-[#5F9468]"
                : "border-[#D1CFC9] hover:border-[#5F9468]"
            }`}
          >
            {slackChecked && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <div className="flex-1 min-w-0">
            <span className={`text-sm ${slackChecked ? "text-[#5F9468] line-through" : "text-[#1C1C1C]"}`}>
              Check MakersLounge Slack
            </span>
            <p className="text-xs text-[#999] mt-0.5">Read and respond to any messages or threads</p>
          </div>
        </div>

        {/* Dynamic tasks from Supabase */}
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[#E8E6E1] bg-[#FAFAF8] group"
          >
            <button
              onClick={() => toggleTask(task)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors duration-200 ${
                task.is_completed
                  ? "bg-[#5F9468] border-[#5F9468]"
                  : "border-[#D1CFC9] hover:border-[#5F9468]"
              }`}
            >
              {task.is_completed && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <span className={`flex-1 text-sm ${task.is_completed ? "text-[#5F9468] line-through" : "text-[#1C1C1C]"}`}>
              {task.title}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 text-[#999] hover:text-red-500 transition-all"
              title="Remove task"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {/* Inline add task — looks like another checklist row */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-dashed border-[#E8E6E1] bg-white hover:border-[#5F9468]/40 transition-colors duration-200">
          <div className="w-5 h-5 rounded border-2 border-[#E8E6E1] flex items-center justify-center shrink-0">
            <svg className="w-3 h-3 text-[#999]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Add a task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            className="flex-1 bg-transparent text-sm outline-none placeholder-[#999] text-[#1C1C1C]"
          />
          {newTask.trim() && (
            <button
              onClick={addTask}
              disabled={isAdding}
              className="text-xs text-[#5F9468] hover:text-[#4F8357] font-medium transition-colors shrink-0 disabled:opacity-40"
            >
              {isAdding ? "Adding..." : "Add"}
            </button>
          )}
        </div>
      </div>

      {/* Mark complete */}
      <div className="mt-4">
        <button
          onClick={onComplete}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
            isComplete
              ? "bg-[#5F9468]/10 text-[#5F9468] border border-[#5F9468]/20"
              : lumaChecked && slackChecked
                ? "bg-[#5F9468] text-white hover:bg-[#4F8357]"
                : "bg-[#F5F4F1] text-[#999] cursor-not-allowed"
          }`}
          disabled={!isComplete && !(lumaChecked && slackChecked)}
        >
          {isComplete ? "Completed — Undo" : "Mark Community Complete"}
        </button>
      </div>
    </div>
  );
}
