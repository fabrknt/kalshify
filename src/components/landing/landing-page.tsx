"use client";

import { useState } from "react";
import {
    Lightbulb,
    BookOpen,
    Hammer,
    Zap,
    ArrowRight,
    ChevronDown,
    Shield,
    TrendingUp,
    Users,
    CheckCircle,
} from "lucide-react";

interface LandingPageProps {
    onGetStarted: () => void;
}

export function LandingHero({ onGetStarted }: LandingPageProps) {
    return (
        <section className="relative py-16 md:py-24">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-cyan-500/5 to-transparent pointer-events-none" />

            <div className="relative max-w-4xl mx-auto text-center px-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                    Learn DeFi curation from{" "}
                    <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        proven strategies
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
                    See how top curators allocate capital, understand their reasoning, and practice building your own strategies with real-time feedback.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={onGetStarted}
                        className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all shadow-lg shadow-cyan-500/25"
                    >
                        Start Learning
                    </button>
                    <a
                        href="#how-it-works"
                        className="flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-white transition-colors"
                    >
                        See how it works
                        <ChevronDown className="h-4 w-4" />
                    </a>
                </div>
            </div>
        </section>
    );
}

export function ProblemSection() {
    return (
        <section className="py-16 border-t border-slate-800/50">
            <div className="max-w-4xl mx-auto px-4">
                <p className="text-sm text-slate-500 uppercase tracking-wide mb-3">The problem</p>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                    Dashboards show you data. They don&apos;t teach you how to think.
                </h2>
                <div className="text-slate-400 space-y-4">
                    <p>
                        You can find APYs anywhere. But knowing that a pool offers 12% doesn&apos;t tell you:
                    </p>
                    <ul className="space-y-2 ml-4">
                        <li className="flex items-start gap-3">
                            <span className="text-orange-400 mt-1">•</span>
                            <span>Is that yield sustainable or just token emissions?</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-orange-400 mt-1">•</span>
                            <span>How much should you allocate to it?</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-orange-400 mt-1">•</span>
                            <span>What happens if the market crashes?</span>
                        </li>
                    </ul>
                    <p className="pt-2">
                        Most DeFi users copy strategies they don&apos;t understand. When conditions change, they don&apos;t know how to adapt.
                    </p>
                </div>
            </div>
        </section>
    );
}

export function SolutionSection() {
    const features = [
        {
            icon: Lightbulb,
            title: "Understand the reasoning",
            description: "Every curator allocation comes with an explanation. Why this asset. Why this percentage. What risk it manages. What tradeoff it accepts.",
            color: "cyan",
        },
        {
            icon: BookOpen,
            title: "Learn the mental models",
            description: "Six principles that guide professional curators: risk/reward balance, diversification, yield sustainability, protocol trust, liquidity depth, and correlation.",
            color: "purple",
        },
        {
            icon: Hammer,
            title: "Practice with feedback",
            description: "Build your own strategy. Get graded on diversification, risk alignment, and sustainability. See warnings before you make mistakes.",
            color: "green",
        },
        {
            icon: Zap,
            title: "Stress test scenarios",
            description: "What if the market drops 30%? What if rewards end? See how different strategies perform under pressure before you commit capital.",
            color: "orange",
        },
    ];

    const colorClasses = {
        cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
        purple: "bg-purple-500/10 text-purple-400 border-purple-500/30",
        green: "bg-green-500/10 text-green-400 border-green-500/30",
        orange: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    };

    return (
        <section className="py-16 border-t border-slate-800/50">
            <div className="max-w-5xl mx-auto px-4">
                <p className="text-sm text-slate-500 uppercase tracking-wide mb-3">How FABRKNT teaches</p>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-10">
                    Four ways to build real curation skills
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                    {features.map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={idx}
                                className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
                            >
                                <div className={`inline-flex p-3 rounded-lg border mb-4 ${colorClasses[feature.color as keyof typeof colorClasses]}`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export function CuratorPreviewSection() {
    const curators = [
        { name: "Gauntlet", risk: "Moderate", apy: "6.2%", color: "yellow" },
        { name: "Steakhouse Financial", risk: "Conservative", apy: "7.0%", color: "green" },
        { name: "RE7 Capital", risk: "Aggressive", apy: "7.1%", color: "orange" },
    ];

    const riskColors = {
        green: "text-green-400 bg-green-500/10 border-green-500/30",
        yellow: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
        orange: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    };

    return (
        <section className="py-16 border-t border-slate-800/50">
            <div className="max-w-5xl mx-auto px-4">
                <p className="text-sm text-slate-500 uppercase tracking-wide mb-3">Learn from the best</p>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Strategies from curators managing real capital
                </h2>
                <p className="text-slate-400 mb-8 max-w-2xl">
                    FABRKNT features allocation strategies from professional DeFi curators. These aren&apos;t hypothetical portfolios — they&apos;re approaches used to manage millions in real assets.
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                    {curators.map((curator, idx) => (
                        <div
                            key={idx}
                            className="p-5 bg-slate-900/50 border border-slate-800 rounded-xl"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-white">{curator.name}</h3>
                                <Users className="h-4 w-4 text-purple-400" />
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs px-2 py-1 rounded border ${riskColors[curator.color as keyof typeof riskColors]}`}>
                                    {curator.risk}
                                </span>
                                <span className="text-green-400 font-medium">{curator.apy} APY</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function HowItWorksSection() {
    const steps = [
        {
            number: "01",
            title: "Explore curator strategies",
            description: "Browse allocations from Gauntlet, Steakhouse, and RE7. Expand any position to see the reasoning behind it.",
        },
        {
            number: "02",
            title: "Learn the principles",
            description: "Understand the six mental models curators use to evaluate risk, diversify holdings, and assess yield sustainability.",
        },
        {
            number: "03",
            title: "Build your own strategy",
            description: "Select pools, set allocations, and get instant feedback. Compare your approach to how professionals would handle the same capital.",
        },
        {
            number: "04",
            title: "Test before you deploy",
            description: "Run your strategy through market scenarios. See which positions protect you and which expose you to risk.",
        },
    ];

    return (
        <section id="how-it-works" className="py-16 border-t border-slate-800/50">
            <div className="max-w-5xl mx-auto px-4">
                <p className="text-sm text-slate-500 uppercase tracking-wide mb-3">How it works</p>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-10">
                    From following to understanding to doing
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                    {steps.map((step, idx) => (
                        <div key={idx} className="flex gap-4">
                            <div className="text-3xl font-bold text-slate-700">{step.number}</div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                                <p className="text-slate-400 text-sm">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function ComparisonSection() {
    const comparisons = [
        { elsewhere: "APY percentages", here: "Whether that APY is sustainable" },
        { elsewhere: "Risk scores", here: "Why certain risks matter more" },
        { elsewhere: "Protocol lists", here: "Side-by-side strategy comparisons" },
        { elsewhere: "Raw data", here: "Explained reasoning" },
        { elsewhere: "Dashboards to browse", here: "Skills to develop" },
    ];

    return (
        <section className="py-16 border-t border-slate-800/50">
            <div className="max-w-4xl mx-auto px-4">
                <p className="text-sm text-slate-500 uppercase tracking-wide mb-3">Why FABRKNT</p>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
                    Data platforms show numbers. FABRKNT builds judgment.
                </h2>

                <div className="overflow-hidden rounded-xl border border-slate-800">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-900/50">
                                <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">What you get elsewhere</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">What you get here</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comparisons.map((row, idx) => (
                                <tr key={idx} className="border-t border-slate-800/50">
                                    <td className="px-6 py-4 text-slate-400">{row.elsewhere}</td>
                                    <td className="px-6 py-4 text-white flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                                        {row.here}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

export function FocusSection() {
    return (
        <section className="py-16 border-t border-slate-800/50">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm mb-6">
                    <Shield className="h-4 w-4" />
                    Solana-focused
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Built for Solana DeFi
                </h2>
                <p className="text-slate-400 max-w-xl mx-auto">
                    FABRKNT focuses on Solana&apos;s yield ecosystem. The curators featured allocate across Kamino, Marginfi, Jito, Orca, and other Solana protocols. No noise from chains you don&apos;t care about.
                </p>
            </div>
        </section>
    );
}

export function FinalCTASection({ onGetStarted }: LandingPageProps) {
    return (
        <section className="py-20 border-t border-slate-800/50">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Stop copying. Start understanding.
                </h2>
                <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                    Learn how professional curators think about DeFi allocation. Build strategies with confidence.
                </p>
                <button
                    onClick={onGetStarted}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all shadow-lg shadow-cyan-500/25"
                >
                    Start Learning — Free
                </button>
                <p className="text-sm text-slate-500 mt-4">
                    No wallet connection required to explore
                </p>
            </div>
        </section>
    );
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
    return (
        <div className="min-h-screen">
            <LandingHero onGetStarted={onGetStarted} />
            <ProblemSection />
            <SolutionSection />
            <CuratorPreviewSection />
            <HowItWorksSection />
            <ComparisonSection />
            <FocusSection />
            <FinalCTASection onGetStarted={onGetStarted} />
        </div>
    );
}
