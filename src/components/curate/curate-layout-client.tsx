"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { useSession, signOut } from "next-auth/react";
import { LogIn, LogOut, Github } from "lucide-react";

export function CurateLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const isProduction = process.env.NODE_ENV === "production";

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted to-background">
            {/* Top Menu Bar */}
            <header className="border-b border-border bg-card sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <Logo size="sm" />
                        <div className="flex items-center gap-4">
                            {/* Social Links */}
                            <a
                                href="https://x.com/fabrknt"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
                                aria-label="X (Twitter)"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                            <a
                                href="https://github.com/fabrknt"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
                                aria-label="GitHub"
                            >
                                <Github className="h-5 w-5" />
                            </a>

                            {/* Divider */}
                            <div className="hidden sm:block h-5 w-px bg-border" />

                            {/* Auth UI */}
                            {status === "loading" ? (
                                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                            ) : session ? (
                                <div className="flex items-center gap-2">
                                    <div className="hidden md:flex flex-col items-end">
                                        <span className="text-xs font-medium text-foreground">
                                            {session.user?.name || session.user?.email}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                            Signed in
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => signOut({ callbackUrl: "/" })}
                                        className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                        title="Sign Out"
                                    >
                                        <LogOut className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href={isProduction ? "#" : "/auth/signin"}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                                        isProduction
                                            ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-50"
                                            : "bg-cyan-500 text-white hover:bg-cyan-400"
                                    }`}
                                    onClick={(e) => {
                                        if (isProduction) {
                                            e.preventDefault();
                                        }
                                    }}
                                    title={isProduction ? "Sign in is disabled in production" : "Sign In"}
                                >
                                    <LogIn className="h-4 w-4" />
                                    <span className="hidden sm:inline">Sign In</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Page Content - Full width, no sidebar */}
            <main className="container mx-auto px-4 py-6">
                {children}
            </main>
        </div>
    );
}
