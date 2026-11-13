"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AccountType = "personal" | "business";

const accountTypes: { id: AccountType; title: string; description: string }[] = [
  {
    id: "personal",
    title: "Personal Account",
    description: "Browse items, chat with vendors and place secure escrow orders.",
  },
  {
    id: "business",
    title: "Vendor / Business Account",
    description: "List products, manage inventory, and receive payouts.",
  },
];

export default function AccountTypePage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>("personal");

  return (
    <main
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-white text-[#171717]"
      style={{
        paddingTop: "max(env(safe-area-inset-top), 40px)",
        paddingBottom: "max(env(safe-area-inset-bottom), 8px)",
      }}
    >
      <div className="mx-auto flex h-full w-full max-w-[480px] flex-col">
        <header className="flex h-[50px] shrink-0 items-center gap-[10px] border-b border-[#e7e7e7] px-[18px]">
          <Link
            href="/"
            aria-label="Back to marketplace"
            className="flex h-6 w-2 items-center text-[#171717]"
          >
            <svg
              aria-hidden="true"
              width="8"
              height="14"
              viewBox="0 0 8 14"
              fill="none"
            >
              <path
                d="M6.5 1.5 1.5 7l5 5.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <h1 className="text-base font-semibold leading-5">
            Choose Account Type
          </h1>
        </header>

        <section
          aria-label="Account type"
          role="radiogroup"
          className="flex flex-col gap-[11px] px-[18px] pt-[14px]"
        >
          {accountTypes.map((option) => {
            const isSelected = accountType === option.id;

            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setAccountType(option.id)}
                className={`flex min-h-[72px] w-full items-center justify-between rounded-[14px] border px-3 py-3 text-left transition-colors ${
                  isSelected ? "border-[#c9c9c9]" : "border-[#ededed]"
                }`}
              >
                <span className="min-w-0 pr-3">
                  <span className="block text-sm font-semibold leading-5 text-[#171717]">
                    {option.title}
                  </span>
                  <span className="mt-1 block max-w-[320px] text-xs font-normal leading-4 text-zinc-500">
                    {option.description}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#333]"
                >
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-[#008000]" />
                  )}
                </span>
              </button>
            );
          })}
        </section>

        <footer className="mt-auto px-[18px] pb-[12px] pt-6 text-center">
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="auth-primary-button"
          >
            Continue
          </button>
          <p className="mt-4 text-sm leading-5 text-zinc-500">
            Already have a personal account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-[#008000]"
            >
              Log In
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
