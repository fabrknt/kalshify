import Link from "next/link";
import { ArrowRight, Percent, Shield, Activity, TrendingUp, Github } from "lucide-react";
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
            <main className="flex-1 flex items-center justify-center">
                <div className="container mx-auto px-4 py-16 md:py-24">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="flex justify-center mb-6">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 text-sm font-semibold font-mono">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                                </span>
                                PREVIEW
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
                            DeFi Yield Intelligence
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground mb-8">
                            Risk scoring. APY stability. Liquidity analysis.
                        </p>

                        {/* Value props */}
                        <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-cyan-400" />
                                <span>5,000+ pools scored</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-cyan-400" />
                                <span>30-day APY trends</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-cyan-400" />
                                <span>Historical charts</span>
                            </div>
                        </div>

                        {/* CTA */}
                        <Link
                            href="/curate"
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-lg bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all font-bold text-lg border border-cyan-300 shadow-lg shadow-cyan-400/20 hover:shadow-cyan-400/40"
                        >
                            <Percent className="h-6 w-6" />
                            Explore Yields
                            <ArrowRight className="h-5 w-5" />
                        </Link>

                        <p className="mt-6 text-sm text-muted-foreground">
                            No sign-up required. 100% automated data.
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
