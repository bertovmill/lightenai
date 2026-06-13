"use client";

import { useEffect, useState } from "react";

interface Inquiry {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  message: string;
  created_at: string;
}

interface Step1InquiriesProps {
  onComplete: () => void;
  isComplete: boolean;
  onNewCount?: (count: number) => void;
}

export default function Step1Inquiries({ onComplete, isComplete, onNewCount }: Step1InquiriesProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInquiries = async () => {
    try {
      const res = await fetch("/api/inquiries");
      if (!res.ok) {
        console.error("Fetch error:", res.status);
        setLoading(false);
        return;
      }
      const { data } = await res.json();

      const all: Inquiry[] = (data || []).slice(0, 10);
      setInquiries(all);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const newCount = all.filter((i) => new Date(i.created_at) > yesterday).length;
      onNewCount?.(newCount);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const recentInquiries = inquiries.slice(0, 5);

  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#5F9468] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 bg-[#5F9468] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 bg-[#5F9468] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  if (recentInquiries.length === 0) {
    return (
      <div className="py-6 text-center">
        <div className="w-10 h-10 rounded-full bg-[#5F9468]/10 flex items-center justify-center mx-auto mb-3">
          <svg className="w-5 h-5 text-[#5F9468]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-medium text-[#1C1C1C] mb-1">No new inquiries</p>
        <p className="text-xs text-[#999]">You&apos;re all caught up!</p>
        {!isComplete && (
          <button
            onClick={onComplete}
            className="mt-4 px-4 py-2 rounded-lg bg-[#5F9468] text-white text-sm font-medium hover:bg-[#4F8357] transition-colors duration-200"
          >
            Mark Reviewed
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="divide-y divide-[#F0EFEC]">
        {recentInquiries.map((inquiry) => (
          <div key={inquiry.id} className="py-3 first:pt-0">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <a
                  href={`mailto:${inquiry.email}`}
                  className="text-sm text-[#5F9468] hover:underline font-medium truncate"
                >
                  {inquiry.first_name && inquiry.last_name
                    ? `${inquiry.first_name} ${inquiry.last_name}`
                    : inquiry.email}
                </a>
                {inquiry.company && (
                  <span className="text-xs text-[#999] truncate">
                    {inquiry.company}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-[#999] shrink-0">
                {formatDate(inquiry.created_at)}
              </span>
            </div>
            <p className="text-sm text-[#666] line-clamp-2">{inquiry.message}</p>
          </div>
        ))}
      </div>

      {inquiries.length > 5 && (
        <p className="text-xs text-[#999] mt-3">
          +{inquiries.length - 5} more inquiries
        </p>
      )}

      {!isComplete && (
        <button
          onClick={onComplete}
          className="mt-4 w-full px-4 py-2.5 rounded-lg bg-[#5F9468] text-white text-sm font-medium hover:bg-[#4F8357] transition-colors duration-200"
        >
          Mark Reviewed
        </button>
      )}
    </div>
  );
}
