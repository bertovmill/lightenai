"use client";

import { useState, useCallback } from "react";

const COMPANY_SIZE_OPTIONS = [
  "Less than 20",
  "20-50",
  "50-100",
  "100-500",
  "More than 500",
] as const;

const ANNUAL_REVENUE_OPTIONS = [
  "Less than $100K",
  "$100K-$500K",
  "$500K-$1M",
  "$1M-$2M",
  "More than $2M",
] as const;

const PROJECT_BUDGET_OPTIONS = [
  "Less than $10K",
  "$10K-$50K",
  "$50K-$100K",
  "More than $100K",
] as const;

const SERVICES_OPTIONS = [
  "Identifying AI opportunities",
  "Educating your team on AI",
  "Developing custom AI solutions",
] as const;

const STEPS = [
  { label: "About you", number: 1 },
  { label: "Your company", number: 2 },
  { label: "Your project", number: 3 },
] as const;

export function ContactForm() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    role: "",
    website: "",
    companySize: "",
    annualRevenue: "",
    projectBudget: "",
    services: "",
    additionalInfo: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const handleChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const canAdvance = useCallback(() => {
    if (step === 0) {
      return formData.firstName && formData.lastName && formData.email;
    }
    if (step === 1) {
      return formData.company && formData.role && formData.website && formData.companySize;
    }
    return true;
  }, [step, formData]);

  const next = useCallback(() => {
    if (step < 2 && canAdvance()) {
      setDirection("forward");
      setStep((s) => s + 1);
    }
  }, [step, canAdvance]);

  const back = useCallback(() => {
    if (step > 0) {
      setDirection("back");
      setStep((s) => s - 1);
    }
  }, [step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          company: formData.company,
          role: formData.role,
          website: formData.website,
          company_size: formData.companySize,
          annual_revenue: formData.annualRevenue || null,
          project_budget: formData.projectBudget,
          services: formData.services,
          message: formData.additionalInfo || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit inquiry");
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Submit error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#5F9468]/10 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-[#5F9468]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2 text-[#1C1C1C]">
          You&apos;re all set
        </h3>
        <p className="text-[#888]">
          We&apos;ll be in touch soon to discuss how we can help.
        </p>
      </div>
    );
  }

  const inputClasses =
    "w-full px-4 py-2.5 bg-[#FAFAF8] border border-[#E8E6E1] rounded-2xl text-sm text-[#1C1C1C] placeholder-[#aaa] focus:outline-none focus:border-[#5F9468] focus:ring-2 focus:ring-[#5F9468]/20 transition-all duration-200";

  const selectClasses =
    "w-full px-4 py-2.5 bg-[#FAFAF8] border border-[#E8E6E1] rounded-2xl text-sm text-[#1C1C1C] focus:outline-none focus:border-[#5F9468] focus:ring-2 focus:ring-[#5F9468]/20 transition-all duration-200 appearance-none cursor-pointer";

  const animationClass = direction === "forward"
    ? "animate-slideInRight"
    : "animate-slideInLeft";

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-full bg-[#5F9468]/10 flex items-center justify-center">
          <svg className="w-4.5 h-4.5 text-[#5F9468]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#1C1C1C]">Let&apos;s lighten the load</h2>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-4 mt-2">
        {STEPS.map((s, i) => (
          <div key={s.number} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-1.5 flex-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-all duration-300 ${
                  i < step
                    ? "bg-[#5F9468] text-white"
                    : i === step
                    ? "bg-[#5F9468] text-white"
                    : "bg-[#E8E6E1] text-[#999]"
                }`}
              >
                {i < step ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s.number
                )}
              </div>
              <span
                className={`text-xs transition-colors duration-300 hidden sm:inline ${
                  i <= step ? "text-[#1C1C1C] font-medium" : "text-[#999]"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px relative">
                <div className="absolute inset-0 bg-[#E8E6E1]" />
                <div
                  className="absolute inset-y-0 left-0 bg-[#5F9468] transition-all duration-500"
                  style={{ width: i < step ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step content area with fixed min-height to prevent layout shift */}
        <div className="overflow-hidden relative min-h-[180px]">
          {/* Step 1: About you */}
          {step === 0 && (
            <div key="step-0" className={`space-y-3 ${animationClass}`}>
              <p className="text-sm text-[#888] mb-4">First, tell us a bit about yourself.</p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="First Name*"
                  className={inputClasses}
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                />
                <input
                  type="text"
                  required
                  placeholder="Last Name*"
                  className={inputClasses}
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                />
              </div>
              <input
                type="email"
                required
                placeholder="Email*"
                className={inputClasses}
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
          )}

          {/* Step 2: Your company */}
          {step === 1 && (
            <div key="step-1" className={`space-y-3 ${animationClass}`}>
              <p className="text-sm text-[#888] mb-4">Now, tell us about your company.</p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Company*"
                  className={inputClasses}
                  value={formData.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                />
                <input
                  type="text"
                  required
                  placeholder="Role*"
                  className={inputClasses}
                  value={formData.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                />
              </div>
              <input
                type="text"
                required
                placeholder="Company Website*"
                className={inputClasses}
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
              />
              <div className="relative">
                <select
                  required
                  className={`${selectClasses} ${!formData.companySize ? "text-[#aaa]" : ""}`}
                  value={formData.companySize}
                  onChange={(e) => handleChange("companySize", e.target.value)}
                >
                  <option value="" disabled>Company Size*</option>
                  {COMPANY_SIZE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          )}

          {/* Step 3: Your project */}
          {step === 2 && (
            <div key="step-2" className={`space-y-3 ${animationClass}`}>
              <p className="text-sm text-[#888] mb-4">Almost done! Tell us about your project.</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <select
                    className={`${selectClasses} ${!formData.annualRevenue ? "text-[#aaa]" : ""}`}
                    value={formData.annualRevenue}
                    onChange={(e) => handleChange("annualRevenue", e.target.value)}
                  >
                    <option value="" disabled>Annual Revenue</option>
                    {ANNUAL_REVENUE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
                <div className="relative">
                  <select
                    required
                    className={`${selectClasses} ${!formData.projectBudget ? "text-[#aaa]" : ""}`}
                    value={formData.projectBudget}
                    onChange={(e) => handleChange("projectBudget", e.target.value)}
                  >
                    <option value="" disabled>Project Budget*</option>
                    {PROJECT_BUDGET_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
              <div className="relative">
                <select
                  required
                  className={`${selectClasses} ${!formData.services ? "text-[#aaa]" : ""}`}
                  value={formData.services}
                  onChange={(e) => handleChange("services", e.target.value)}
                >
                  <option value="" disabled>What services are you interested in?*</option>
                  {SERVICES_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
              <textarea
                rows={2}
                placeholder="Additional Info..."
                className={`${inputClasses} resize-none`}
                value={formData.additionalInfo}
                onChange={(e) => handleChange("additionalInfo", e.target.value)}
              />
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl px-4 py-2 mt-3">{error}</p>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center gap-3 mt-4">
          {step > 0 && (
            <button
              type="button"
              onClick={back}
              className="px-5 py-2.5 text-sm font-medium text-[#666] bg-[#F5F4F1] rounded-full hover:bg-[#ECEAE5] transition-all duration-200 active:scale-[0.98]"
            >
              Back
            </button>
          )}
          {step < 2 ? (
            <button
              type="button"
              onClick={next}
              disabled={!canAdvance()}
              className="flex-1 py-3 bg-[#5F9468] text-white text-sm font-semibold rounded-full hover:bg-[#4F8357] transition-all duration-200 hover:shadow-lg hover:shadow-[#5F9468]/25 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-[#D97757] text-white text-sm font-semibold rounded-full hover:bg-[#C9684A] transition-all duration-200 hover:shadow-lg hover:shadow-[#D97757]/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </span>
              ) : (
                "Submit"
              )}
            </button>
          )}
        </div>
      </form>
      <p className="text-xs text-[#aaa] text-center mt-3">
        No spam, ever. We&apos;ll reach out within 24 hours.
      </p>

      {/* Inline keyframe animations */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
