"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { useSession, signOut } from "next-auth/react";
import { LogIn, LogOut, Lock, FolderTree, Brain, Link2 } from "lucide-react";

export function CindexLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { data: session, status } = useSession();
    const isProduction = process.env.NODE_ENV === "production";

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted to-background">
            {/* Top Menu Bar */}
            <header className="border-b border-border bg-card sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Logo size="sm" />
                        <div className="flex items-center gap-4">
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
                            <Link
                                href="/cindex"
                                className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors hidden sm:flex items-center gap-1.5"
                            >
                                <Brain className="h-3.5 w-3.5" />
                                Index
                            </Link>
                            <Link
                                href="/curate"
                                className="text-sm font-medium text-cyan-500 hover:text-cyan-400 transition-colors hidden sm:flex items-center gap-1.5"
                            >
                                <FolderTree className="h-3.5 w-3.5" />
                                Curate
                            </Link>
                            <Link
                                href="/synergy"
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:flex items-center gap-1.5"
                                title={!session ? "Sign in required" : "Synergy"}
                            >
                                <Link2 className="h-3.5 w-3.5" />
                                Synergy
                                {!session && <Lock className="h-3 w-3 text-muted-foreground/50" />}
                            </Link>

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
                                            : "bg-purple-600 text-white hover:bg-purple-700"
                                    }`}
                                    onClick={(e) => {
                                        if (isProduction) {
                                            e.preventDefault();
                                        }
                                    }}
                                    title={isProduction ? "Sign in is disabled in production" : "Sign In"}
                                >
                                    <LogIn className="h-4 w-4" />
                                    <span>Sign In</span>
                                </Link>
                            )}

                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="Toggle menu"
                            >
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sidebar and Content Area */}
            <div className="flex h-[calc(100vh-73px)] overflow-hidden">
                {/* Mobile Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <DashboardSidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-muted p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
