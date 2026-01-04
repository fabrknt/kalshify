"use client";

import Link from "next/link";
import { Link2, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";

interface SynergyCTAProps {
  variant?: "primary" | "secondary" | "footer";
  className?: string;
}

export function SynergyCTA({ variant = "primary", className = "" }: SynergyCTAProps) {
  const { data: session } = useSession();
  const isProduction = process.env.NODE_ENV === "production";

  const href = session ? "/synergy/discover" : (isProduction ? "#" : "/auth/signin?callbackUrl=/synergy/discover");

  if (variant === "footer") {
    return (
      <Link
        href={href}
        className={`text-sm transition-colors ${
          !session && isProduction
            ? "text-gray-400 cursor-not-allowed opacity-50"
            : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={(e) => {
          if (!session && isProduction) {
            e.preventDefault();
          }
        }}
        title={!session && isProduction ? "Sign in is disabled in production" : undefined}
      >
        Synergy {!session && <span className="text-xs">(Sign in {isProduction ? "disabled" : "required"})</span>}
      </Link>
    );
  }

  if (variant === "secondary") {
    return (
      <Link
        href={href}
        className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 transition-all font-bold ${
          !session && isProduction
            ? "border-gray-400 text-gray-400 cursor-not-allowed opacity-50"
            : "border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
        } ${className}`}
        onClick={(e) => {
          if (!session && isProduction) {
            e.preventDefault();
          }
        }}
        title={!session && isProduction ? "Sign in is disabled in production" : undefined}
      >
        <div className="flex flex-col items-center">
          <span>Find Synergies</span>
          {!session && <span className="text-xs">Sign in {isProduction ? "disabled" : "required"}</span>}
        </div>
        <ArrowRight className="h-5 w-5" />
      </Link>
    );
  }

  // Primary variant (hero section)
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg transition-all font-bold text-lg relative group border shadow-lg ${
        !session && isProduction
          ? "bg-gray-400 text-gray-600 border-gray-300 cursor-not-allowed opacity-50"
          : "bg-emerald-500 text-white border-emerald-400 hover:bg-emerald-400 shadow-emerald-500/20 hover:shadow-emerald-500/40"
      } ${className}`}
      onClick={(e) => {
        if (!session && isProduction) {
          e.preventDefault();
        }
      }}
      title={!session && isProduction ? "Sign in is disabled in production" : undefined}
    >
      <Link2 className="h-6 w-6" />
      <div className="flex flex-col items-start">
        <span>Find Real Synergies</span>
        {!session && <span className="text-xs font-normal text-emerald-100">Sign in {isProduction ? "disabled" : "required"}</span>}
      </div>
      <ArrowRight className="h-5 w-5" />
    </Link>
  );
}

// For the mobile card variant
export function SynergyCTACard() {
  const { data: session } = useSession();
  const isProduction = process.env.NODE_ENV === "production";
  const href = session ? "/synergy/discover" : (isProduction ? "#" : "/auth/signin?callbackUrl=/synergy/discover");

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-all font-bold w-full justify-center border shadow-lg ${
        !session && isProduction
          ? "bg-gray-400 text-gray-600 border-gray-300 cursor-not-allowed opacity-50"
          : "bg-emerald-500 text-white border-emerald-400 hover:bg-emerald-400 shadow-emerald-500/20 hover:shadow-emerald-500/40"
      }`}
      onClick={(e) => {
        if (!session && isProduction) {
          e.preventDefault();
        }
      }}
      title={!session && isProduction ? "Sign in is disabled in production" : undefined}
    >
      <div className="flex flex-col items-center">
        <span>Find Synergies</span>
        {!session && <span className="text-xs">Sign in {isProduction ? "disabled" : "required"}</span>}
      </div>
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
