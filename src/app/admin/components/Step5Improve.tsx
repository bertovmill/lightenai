"use client";

import { useState, useEffect } from "react";

interface FeedbackItem {
  id: string;
  created_at: string;
  email: string | null;
  page_url: string | null;
  category: string;
  message: string;
  addressed: boolean;
}

interface Step5ImproveProps {
  onComplete: () => void;
  isComplete: boolean;
}

const CATEGORY_STYLES: Record<string, string> = {
  bug: "bg-red-50 text-red-600",
  improvement: "bg-blue-50 text-blue-600",
  feature: "bg-purple-50 text-purple-600",
  other: "bg-gray-50 text-[#666]",
};

export default function Step5Improve({ onComplete, isComplete }: Step5ImproveProps) {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addressing, setAddressing] = useState<string | null>(null);
  const [addressedToday, setAddressedToday] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const res = await fetch("/api/feedback");
      if (!res.ok) throw new Error("Failed to fetch");
      const { data } = await res.json();
      setFeedback(data || []);
    } catch (err) {
      console.error("Failed to load feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddress = async (id: string) => {
    setAddressing(id);
    try {
      const res = await fetch("/api/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, addressed: true }),
      });
      if (!res.ok) throw new Error("Failed to update");

      setFeedback((prev) =>
        prev.map((f) => (f.id === id ? { ...f, addressed: true } : f))
      );
      setAddressedToday(true);
    } catch (err) {
      console.error("Failed to address feedback:", err);
    } finally {
      setAddressing(null);
    }
  };

  const unaddressed = feedback.filter((f) => !f.addressed);
  const addressed = feedback.filter((f) => f.addressed);

  if (loading) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-[#999]">Loading feedback...</p>
      </div>
    );
  }

  if (feedback.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-[#999] mb-2">No feedback yet.</p>
        <p className="text-xs text-[#CCC]">Feedback submitted via the website will appear here.</p>
        {!isComplete && (
          <button
            onClick={onComplete}
            className="mt-4 px-4 py-2 rounded-lg bg-[#5F9468] text-white text-sm font-medium hover:bg-[#4F8357] transition-colors duration-200"
          >
            Mark Improve as Done
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Unaddressed feedback */}
      {unaddressed.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-[#5F9468] uppercase tracking-[0.15em] mb-3">
            Open Feedback ({unaddressed.length})
          </p>
          <div className="space-y-2">
            {unaddressed.map((item) => (
              <FeedbackCard
                key={item.id}
                item={item}
                isAddressing={addressing === item.id}
                onAddress={handleAddress}
              />
            ))}
          </div>
        </div>
      )}

      {/* Addressed feedback */}
      {addressed.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-[#999] uppercase tracking-[0.15em] mb-3">
            Addressed ({addressed.length})
          </p>
          <div className="space-y-2 opacity-60">
            {addressed.slice(0, 5).map((item) => (
              <FeedbackCard key={item.id} item={item} />
            ))}
            {addressed.length > 5 && (
              <p className="text-xs text-[#999] text-center py-1">
                +{addressed.length - 5} more addressed
              </p>
            )}
          </div>
        </div>
      )}

      {/* Complete button */}
      {!isComplete && (
        <button
          onClick={onComplete}
          disabled={!addressedToday && unaddressed.length > 0}
          className="mt-4 w-full px-4 py-2.5 rounded-lg bg-[#5F9468] text-white text-sm font-medium hover:bg-[#4F8357] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {unaddressed.length === 0
            ? "Mark Improve as Done"
            : addressedToday
            ? "Mark Improve as Done"
            : "Address at least one item first"}
        </button>
      )}
    </div>
  );
}

function FeedbackCard({
  item,
  isAddressing,
  onAddress,
}: {
  item: FeedbackItem;
  isAddressing?: boolean;
  onAddress?: (id: string) => void;
}) {
  const categoryStyle = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.other;
  const timeAgo = getRelativeTime(item.created_at);

  return (
    <div className="p-3 rounded-lg border border-[#E8E6E1] bg-[#FAFAF8]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${categoryStyle}`}>
              {item.category}
            </span>
            <span className="text-[10px] text-[#999]">{timeAgo}</span>
          </div>
          <p className="text-sm text-[#1C1C1C] leading-relaxed">{item.message}</p>
          {item.page_url && (
            <p className="text-[10px] text-[#CCC] mt-1 truncate">{item.page_url}</p>
          )}
          {item.email && (
            <p className="text-[10px] text-[#999] mt-0.5">{item.email}</p>
          )}
        </div>
        {onAddress && !item.addressed && (
          <button
            onClick={() => onAddress(item.id)}
            disabled={isAddressing}
            className="shrink-0 px-2.5 py-1 rounded-md border border-[#5F9468] text-xs font-medium text-[#5F9468] hover:bg-[#5F9468] hover:text-white disabled:opacity-50 transition-colors duration-200"
          >
            {isAddressing ? "..." : "Address"}
          </button>
        )}
        {item.addressed && (
          <span className="shrink-0 text-[10px] text-[#5F9468] font-medium">Done</span>
        )}
      </div>
    </div>
  );
}

function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
