"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { FeatherLogo } from "@/app/components/Logo";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
          {FeatherLogo}
          <span className="text-xl font-semibold tracking-tight text-[#1C1C1C]">
            Lighten AI
          </span>
        </Link>
      </div>

      <SignIn
        routing="hash"
        signUpUrl="/login#/sign-up"
        forceRedirectUrl={redirectTo}
        appearance={{
          variables: {
            colorPrimary: "#6B8F71",
            colorBackground: "#FFFFFF",
            borderRadius: "1rem",
            fontFamily: "var(--font-plus-jakarta)",
          },
          elements: {
            rootBox: "mx-auto",
            card: "border border-[#E8E6E1] shadow-none rounded-3xl",
          },
        }}
      />

      <div className="mt-6 text-center">
        <Link
          href="/"
          className="text-sm text-[#999] hover:text-[#666] transition-colors"
        >
          &larr; Back to home
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-6 py-16">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
