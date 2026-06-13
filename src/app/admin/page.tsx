"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useDailyProgress, getTodayString } from "./hooks/useDailyProgress";
import MorningProgress from "./components/MorningProgress";
import StepCard from "./components/StepCard";
import Step4Learn from "./components/Step4Learn";
import StepNews from "./components/StepNews";
import StepLeadOutreach from "./components/StepCreateAgent";
import Step3Content from "./components/Step3Content";
import Step1Leads from "./components/Step1Leads";
import Step5Improve from "./components/Step5Improve";
import StepReddit from "./components/StepReddit";
import StepCustDev from "./components/StepCustDev";
import StepCommunity from "./components/StepCommunity";


function formatDateDisplay(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function shiftDate(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [newInquiryCount, setNewInquiryCount] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [newsForContent, setNewsForContent] = useState<string | undefined>();
  const [selectedDate, setSelectedDate] = useState(getTodayString);

  const {
    progress,
    stepsComplete,
    completedCount,
    totalSteps,
    isToday,
    markLearningCompleted,
    markNewsRead,
    markAgentCreated,
    markContentCreated,
    markInquiriesReviewed,
    markWebsiteImproved,
    markRedditEngaged,
    markCustDevCompleted,
    markCommunityManaged,
  } = useDailyProgress(selectedDate);

  const goToPreviousDay = useCallback(() => {
    setSelectedDate((prev) => shiftDate(prev, -1));
  }, []);

  const goToNextDay = useCallback(() => {
    setSelectedDate((prev) => {
      const next = shiftDate(prev, 1);
      const today = getTodayString();
      return next > today ? prev : next;
    });
  }, []);

  const goToToday = useCallback(() => {
    setSelectedDate(getTodayString());
  }, []);

  // Auto-expand first incomplete step on initial load only
  const hasAutoExpanded = useRef(false);
  useEffect(() => {
    if (!isLoading && isToday && !hasAutoExpanded.current) {
      hasAutoExpanded.current = true;
      const firstIncomplete = stepsComplete.findIndex((s) => !s);
      setExpandedStep(firstIncomplete === -1 ? null : firstIncomplete);
    } else if (!isToday) {
      setExpandedStep(null);
      hasAutoExpanded.current = false;
    }
  }, [isLoading, stepsComplete, isToday]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch unaddressed feedback count
        const res = await fetch("/api/feedback");
        if (res.ok) {
          const { data } = await res.json();
          const fbCount = (data || []).filter(
            (f: { addressed: boolean | null }) => f.addressed === false
          ).length;
          setFeedbackCount(fbCount);
        }
      } catch (error) {
        console.error("Data fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleStep = useCallback((step: number) => {
    setExpandedStep((prev) => (prev === step ? null : step));
  }, []);

  const advanceToNext = useCallback((currentStep: number) => {
    const next = currentStep + 1;
    if (next < 9) {
      setExpandedStep(next);
    } else {
      setExpandedStep(null);
    }
  }, []);

  // Step 0: Learn
  const handleLearningComplete = useCallback(() => {
    const wasComplete = stepsComplete[0];
    markLearningCompleted();
    if (!wasComplete) advanceToNext(0);
  }, [markLearningCompleted, advanceToNext, stepsComplete]);

  // Step 1: News
  const handleNewsComplete = useCallback(() => {
    const wasComplete = stepsComplete[1];
    markNewsRead();
    if (!wasComplete) advanceToNext(1);
  }, [markNewsRead, advanceToNext, stepsComplete]);

  const handleCreateContentFromNews = useCallback((newsText: string) => {
    const prompt = `I just read today's SDK & AI news briefing. Help me create a social media post based on this news. Here's the briefing:\n\n${newsText}\n\nDraft a LinkedIn or X post highlighting the most interesting takeaway.`;
    setNewsForContent(prompt);
    setExpandedStep(3); // Expand the Content step
  }, []);

  // Step 2: Create Agent
  const handleAgentComplete = useCallback(() => {
    const wasComplete = stepsComplete[2];
    markAgentCreated();
    if (!wasComplete) advanceToNext(2);
  }, [markAgentCreated, advanceToNext, stepsComplete]);

  // Step 3: Create Content
  const handleContentComplete = useCallback(() => {
    const wasComplete = stepsComplete[3];
    markContentCreated();
    if (!wasComplete) advanceToNext(3);
  }, [markContentCreated, advanceToNext, stepsComplete]);

  // Step 4: Review Leads
  const handleInquiriesComplete = useCallback(() => {
    const wasComplete = stepsComplete[4];
    markInquiriesReviewed();
    if (!wasComplete) advanceToNext(4);
  }, [markInquiriesReviewed, advanceToNext, stepsComplete]);

  // Step 5: Improve Website
  const handleImproveComplete = useCallback(() => {
    const wasComplete = stepsComplete[5];
    markWebsiteImproved();
    if (!wasComplete) advanceToNext(5);
  }, [markWebsiteImproved, advanceToNext, stepsComplete]);

  // Step 6: Reddit Engagement
  const handleRedditComplete = useCallback(() => {
    const wasComplete = stepsComplete[6];
    markRedditEngaged();
    if (!wasComplete) advanceToNext(6);
  }, [markRedditEngaged, advanceToNext, stepsComplete]);

  // Step 7: Customer Development
  const handleCustDevComplete = useCallback(() => {
    const wasComplete = stepsComplete[7];
    markCustDevCompleted();
    if (!wasComplete) advanceToNext(7);
  }, [markCustDevCompleted, advanceToNext, stepsComplete]);

  // Step 8: Community Management
  const handleCommunityComplete = useCallback(() => {
    const wasComplete = stepsComplete[8];
    markCommunityManaged();
    if (!wasComplete) advanceToNext(8);
  }, [markCommunityManaged, advanceToNext, stepsComplete]);

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#6B8F71] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-[#6B8F71] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-[#6B8F71] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Greeting + Date Navigation */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1C1C1C]">
          {isToday ? `${getGreeting()}, Robert.` : "Looking back"}
        </h1>

        <div className="flex items-center gap-3 mt-1">
          <button
            onClick={goToPreviousDay}
            className="p-1 text-[#999] hover:text-[#6B8F71] transition-colors rounded-lg hover:bg-[#6B8F71]/5"
            title="Previous day"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={goToToday}
            className={`text-sm transition-colors ${
              isToday ? "text-[#999]" : "text-[#6B8F71] hover:text-[#5A7D60] underline underline-offset-2"
            }`}
            disabled={isToday}
          >
            {formatDateDisplay(selectedDate)}
          </button>

          <button
            onClick={goToNextDay}
            disabled={isToday}
            className={`p-1 rounded-lg transition-colors ${
              isToday
                ? "text-[#E8E6E1] cursor-not-allowed"
                : "text-[#999] hover:text-[#6B8F71] hover:bg-[#6B8F71]/5"
            }`}
            title="Next day"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Past date banner */}
      {!isToday && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
          <p className="text-sm text-amber-700">
            Viewing {formatDateDisplay(selectedDate)}
          </p>
          <button
            onClick={goToToday}
            className="text-xs font-medium text-amber-700 hover:text-amber-900 underline underline-offset-2 transition-colors"
          >
            Back to today
          </button>
        </div>
      )}

      {/* Progress */}
      <MorningProgress stepsComplete={stepsComplete} completedCount={completedCount} />

      {/* All done celebration */}
      {completedCount === totalSteps && (
        <div className="mb-8 p-6 rounded-xl bg-[#6B8F71]/5 border border-[#6B8F71]/20 text-center">
          <div className="w-12 h-12 rounded-full bg-[#6B8F71] flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[#1C1C1C] mb-1">
            {isToday ? "Morning routine complete!" : "This day was completed!"}
          </h2>
          <p className="text-sm text-[#666]">
            {isToday ? "Great start to your day. Everything's handled." : `All ${totalSteps} steps were completed on ${formatDateDisplay(selectedDate)}.`}
          </p>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-5">
        {/* Step 1: Learn */}
        <StepCard
          stepNumber={1}
          label="Learn"
          title="Learn"
          timeEstimate="~15 min"
          isComplete={stepsComplete[0]}
          isExpanded={expandedStep === 0}
          onToggle={() => toggleStep(0)}
        >
          <Step4Learn
            onComplete={handleLearningComplete}
            isComplete={stepsComplete[0]}
          />
        </StepCard>

        {/* Step 2: News */}
        <StepCard
          stepNumber={2}
          label="News"
          title="Stay Up to Date"
          timeEstimate="~10 min"
          isComplete={stepsComplete[1]}
          isExpanded={expandedStep === 1}
          onToggle={() => toggleStep(1)}
        >
          <StepNews
            onComplete={handleNewsComplete}
            isComplete={stepsComplete[1]}
            onCreateContent={handleCreateContentFromNews}
          />
        </StepCard>

        {/* Step 3: Lead Outreach */}
        <StepCard
          stepNumber={3}
          label="Outreach"
          title="Find & Reach Leads"
          timeEstimate="~15 min"
          isComplete={stepsComplete[2]}
          isExpanded={expandedStep === 2}
          onToggle={() => toggleStep(2)}
        >
          <StepLeadOutreach
            onComplete={handleAgentComplete}
            isComplete={stepsComplete[2]}
          />
        </StepCard>

        {/* Step 4: Create Content */}
        <StepCard
          stepNumber={4}
          label="Create"
          title="Create Content"
          timeEstimate="~25 min"
          isComplete={stepsComplete[3]}
          isExpanded={expandedStep === 3}
          onToggle={() => toggleStep(3)}
        >
          <Step3Content
            onComplete={handleContentComplete}
            isComplete={stepsComplete[3]}
            externalPrompt={newsForContent}
          />
        </StepCard>

        {/* Step 5: Review Leads */}
        <StepCard
          stepNumber={5}
          label="Review"
          title="Review Leads"
          timeEstimate="~5 min"
          isComplete={stepsComplete[4]}
          isExpanded={expandedStep === 4}
          onToggle={() => toggleStep(4)}
          badge={
            newInquiryCount > 0 && !stepsComplete[4] && isToday ? (
              <span className="px-2 py-0.5 rounded-full bg-[#6B8F71] text-white text-xs font-medium">
                {newInquiryCount} new
              </span>
            ) : undefined
          }
        >
          <Step1Leads
            onComplete={handleInquiriesComplete}
            isComplete={stepsComplete[4]}
            onNewCount={setNewInquiryCount}
          />
        </StepCard>

        {/* Step 6: Improve Website */}
        <StepCard
          stepNumber={6}
          label="Improve"
          title="Improve the Website"
          timeEstimate="~10 min"
          isComplete={stepsComplete[5]}
          isExpanded={expandedStep === 5}
          onToggle={() => toggleStep(5)}
          badge={
            feedbackCount > 0 && !stepsComplete[5] && isToday ? (
              <span className="px-2 py-0.5 rounded-full bg-[#6B8F71] text-white text-xs font-medium">
                {feedbackCount} open
              </span>
            ) : undefined
          }
        >
          <Step5Improve
            onComplete={handleImproveComplete}
            isComplete={stepsComplete[5]}
          />
        </StepCard>

        {/* Step 7: Reddit Engagement */}
        <StepCard
          stepNumber={7}
          label="Engage"
          title="Reddit SDK Q&A"
          timeEstimate="~15 min"
          isComplete={stepsComplete[6]}
          isExpanded={expandedStep === 6}
          onToggle={() => toggleStep(6)}
        >
          <StepReddit
            onComplete={handleRedditComplete}
            isComplete={stepsComplete[6]}
          />
        </StepCard>

        {/* Step 8: Customer Development */}
        <StepCard
          stepNumber={8}
          label="Develop"
          title="Customer Development"
          timeEstimate="~10 min"
          isComplete={stepsComplete[7]}
          isExpanded={expandedStep === 7}
          onToggle={() => toggleStep(7)}
        >
          <StepCustDev
            onComplete={handleCustDevComplete}
            isComplete={stepsComplete[7]}
          />
        </StepCard>

        {/* Step 9: Community Management */}
        <StepCard
          stepNumber={9}
          label="Community"
          title="Community Management"
          timeEstimate="~10 min"
          isComplete={stepsComplete[8]}
          isExpanded={expandedStep === 8}
          onToggle={() => toggleStep(8)}
        >
          <StepCommunity
            onComplete={handleCommunityComplete}
            isComplete={stepsComplete[8]}
          />
        </StepCard>
      </div>
    </div>
  );
}
