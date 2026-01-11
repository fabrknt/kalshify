import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Brain, PieChart, TrendingUp, Github, LogIn } from "lucide-react";
import { Logo } from "@/components/logo";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b border-border bg-card">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Logo size="sm" />
                        <div className="flex items-center gap-4">
                            <Link
                                href="/auth/signin"
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <LogIn className="h-4 w-4" />
                                Sign In
                            </Link>
                            <a
                                href="https://x.com/fabrknt"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="X (Twitter)"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                            <a
                                href="https://github.com/fabrknt"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="GitHub"
                            >
                                <Github className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <main className="flex-1">
                <div className="container mx-auto px-4 py-16 md:py-24">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="flex justify-center mb-6">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gradient-to-r from-purple-500/10 to-cyan-500/10 text-cyan-400 border border-cyan-400/30 text-sm font-semibold font-mono">
                                <Sparkles className="h-4 w-4" />
                                AI-POWERED
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
                            DeFi Yield Curation
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                                Powered by AI
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                            Personalized yield recommendations, intelligent risk analysis, and portfolio optimization - all powered by AI.
                        </p>

                        {/* AI Features */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-3xl mx-auto">
                            <div className="bg-card border border-border rounded-xl p-5 text-left">
                                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
                                    <Brain className="h-5 w-5 text-purple-400" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-1">AI Recommendations</h3>
                                <p className="text-sm text-muted-foreground">
                                    Get personalized pool suggestions based on your risk tolerance and preferences.
                                </p>
                            </div>
                            <div className="bg-card border border-border rounded-xl p-5 text-left">
                                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-3">
                                    <Shield className="h-5 w-5 text-cyan-400" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-1">Smart Risk Insights</h3>
                                <p className="text-sm text-muted-foreground">
                                    AI-generated analysis explaining risks and opportunities in plain English.
                                </p>
                            </div>
                            <div className="bg-card border border-border rounded-xl p-5 text-left">
                                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-3">
                                    <PieChart className="h-5 w-5 text-green-400" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-1">Portfolio Optimizer</h3>
                                <p className="text-sm text-muted-foreground">
                                    AI suggests optimal allocation across pools to maximize risk-adjusted returns.
                                </p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap justify-center gap-8 mb-10 text-sm">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-cyan-400">5,000+</p>
                                <p className="text-muted-foreground">Pools Analyzed</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-purple-400">30-day</p>
                                <p className="text-muted-foreground">APY Trends</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-400">Real-time</p>
                                <p className="text-muted-foreground">Risk Scoring</p>
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/curate"
                                className="inline-flex items-center gap-3 px-8 py-4 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-400 hover:to-cyan-400 transition-all font-bold text-lg shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
                            >
                                <Sparkles className="h-5 w-5" />
                                Explore CURATE
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                            <Link
                                href="/auth/signin"
                                className="inline-flex items-center gap-2 px-6 py-4 rounded-lg border border-border text-foreground hover:bg-card transition-all font-medium"
                            >
                                <LogIn className="h-5 w-5" />
                                Sign In for AI Features
                            </Link>
                        </div>

                        <p className="mt-6 text-sm text-muted-foreground">
                            <TrendingUp className="inline h-4 w-4 mr-1" />
                            Browse pools freely. Sign in to unlock AI-powered recommendations.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border py-6">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <span>© {new Date().getFullYear()}</span>
                            <a
                                href="https://www.fabrknt.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:text-cyan-300 font-medium"
                            >
                                Fabrknt
                            </a>
                        </div>
                        <div className="flex items-center gap-4">
                            <a
                                href="https://x.com/fabrknt"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-foreground transition-colors"
                            >
                                X (Twitter)
                            </a>
                            <a
                                href="https://github.com/fabrknt"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-foreground transition-colors"
                            >
                                GitHub
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
