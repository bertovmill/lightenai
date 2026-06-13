"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { isAdminEmail } from "@/lib/admin";

export function AuthButton() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const email = user?.primaryEmailAddress?.emailAddress ?? null;
  const isAdminUser = isAdminEmail(email);
  const isAdminView = pathname === "/content" && searchParams.get("view") === "admin";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  if (!isLoaded) {
    return <div className="w-16" />;
  }

  if (isSignedIn) {
    const initial = (email?.[0] ?? "U").toUpperCase();
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-8 h-8 rounded-full bg-[#6B8F71] text-white text-xs font-semibold flex items-center justify-center hover:bg-[#5A7D60] transition-colors duration-200"
        >
          {initial}
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-[#E8E6E1] rounded-xl shadow-lg py-1 z-50">
            <div className="px-4 py-2 border-b border-[#E8E6E1]">
              <p className="text-xs text-[#999] truncate">{email}</p>
            </div>
            {isAdminUser && (
              <>
                <Link
                  href="/admin"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2 text-sm text-[#666] hover:text-[#6B8F71] hover:bg-[#F5F4F1] transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/content"
                  onClick={() => setDropdownOpen(false)}
                  className={`block px-4 py-2 text-sm transition-colors ${
                    !isAdminView
                      ? "text-[#6B8F71] font-medium bg-[#6B8F71]/5"
                      : "text-[#666] hover:text-[#6B8F71] hover:bg-[#F5F4F1]"
                  }`}
                >
                  Client View
                </Link>
                <Link
                  href="/content?view=admin"
                  onClick={() => setDropdownOpen(false)}
                  className={`block px-4 py-2 text-sm transition-colors ${
                    isAdminView
                      ? "text-[#6B8F71] font-medium bg-[#6B8F71]/5"
                      : "text-[#666] hover:text-[#6B8F71] hover:bg-[#F5F4F1]"
                  }`}
                >
                  Admin View
                </Link>
              </>
            )}
            <div className="border-t border-[#E8E6E1] mt-1">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleSignOut();
                }}
                className="block w-full text-left px-4 py-2 text-sm text-[#666] hover:text-red-500 hover:bg-[#F5F4F1] transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="text-sm text-[#666] hover:text-[#6B8F71] transition-colors duration-200"
    >
      Sign In
    </Link>
  );
}
