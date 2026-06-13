"use client";

interface MorningProgressProps {
  stepsComplete: boolean[];
  completedCount: number;
}

const STEP_LABELS = ["Learn", "News", "Agent", "Content", "Leads", "Improve", "Visuals", "Reddit", "CustDev"];
const TIME_ESTIMATES = [15, 10, 20, 25, 5, 10, 5, 15, 10]; // minutes per step

export default function MorningProgress({ stepsComplete, completedCount }: MorningProgressProps) {
  const remainingMinutes = TIME_ESTIMATES.reduce(
    (sum, mins, i) => sum + (stepsComplete[i] ? 0 : mins),
    0
  );

  return (
    <div className="mb-8">
      {/* Progress circles */}
      <div className="flex items-center justify-center gap-0 mb-3">
        {stepsComplete.map((complete, i) => (
          <div key={i} className="flex items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 ${
                complete
                  ? "bg-[#5F9468] text-white shadow-sm shadow-[#5F9468]/25"
                  : "border-2 border-[#E8E6E1] text-[#999] bg-white"
              }`}
            >
              {complete ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={`w-8 h-0.5 transition-colors duration-500 ${
                  complete ? "bg-[#5F9468]" : "bg-[#E8E6E1]"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Labels */}
      <div className="flex items-center justify-center mb-3">
        <div className="flex items-center gap-0">
          {STEP_LABELS.map((label, i) => (
            <div key={i} className="flex items-center">
              <span
                className={`text-[11px] font-medium w-9 text-center ${
                  stepsComplete[i] ? "text-[#5F9468]" : "text-[#999]"
                }`}
              >
                {label}
              </span>
              {i < STEP_LABELS.length - 1 && <div className="w-8" />}
            </div>
          ))}
        </div>
      </div>

      {/* Status text */}
      <p className="text-center text-sm text-[#666]">
        {completedCount === STEP_LABELS.length ? (
          <span className="text-[#5F9468] font-medium">All done for today!</span>
        ) : (
          <>
            <span className="font-medium text-[#1C1C1C]">{completedCount} of {STEP_LABELS.length}</span>
            {" complete"}
            {remainingMinutes > 0 && (
              <span className="text-[#999]"> &middot; ~{remainingMinutes} min remaining</span>
            )}
          </>
        )}
      </p>
    </div>
  );
}
