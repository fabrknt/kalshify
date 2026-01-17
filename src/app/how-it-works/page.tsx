"use client";

import { CurateLayoutClient } from "@/components/curate/curate-layout-client";
import {
    Database,
    Brain,
    Shield,
    TrendingUp,
    Layers,
    Zap,
    CheckCircle,
    AlertTriangle,
    BarChart3,
    Clock,
    BookOpen,
    Users,
    Hammer,
    Activity,
    Scale,
    Grid3X3,
    Droplet,
    Link as LinkIcon,
    ArrowRight,
    GitCompare,
    LineChart,
    Bookmark,
    Sparkles,
    Calculator,
    Coins,
    Building2,
    Wrench,
} from "lucide-react";
import Link from "next/link";

export default function HowItWorksPage() {
    return (
        <CurateLayoutClient>
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Hero */}
                <div className="text-center py-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        How FABRKNT Works
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Get personalized DeFi allocations in 30 seconds, or learn to build your own strategies.
                    </p>
                </div>

                {/* Quick Start - Primary CTA */}
                <section className="bg-gradient-to-br from-cyan-900/30 to-purple-900/30 border border-cyan-500/30 rounded-xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Zap className="h-6 w-6 text-cyan-400" />
                            <h2 className="text-xl font-semibold text-white">Get Started in 30 Seconds</h2>
                        </div>
                        <Link
                            href="/?tab=start"
                            className="flex items-center gap-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-medium rounded-lg transition-colors"
                        >
                            Start Now <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <p className="text-slate-300 mb-6">
                        Tell us your investment amount and risk tolerance. We'll show you exactly where to put your money with step-by-step execution instructions.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                            <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                <span className="text-lg font-bold text-cyan-400">1</span>
                            </div>
                            <h3 className="text-white font-medium mb-1">Your Preferences</h3>
                            <p className="text-xs text-slate-400">Enter amount and risk level</p>
                        </div>
                        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                            <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                <span className="text-lg font-bold text-cyan-400">2</span>
                            </div>
                            <h3 className="text-white font-medium mb-1">Your Allocation</h3>
                            <p className="text-xs text-slate-400">See personalized recommendations</p>
                        </div>
                        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                            <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                <span className="text-lg font-bold text-cyan-400">3</span>
                            </div>
                            <h3 className="text-white font-medium mb-1">Execute</h3>
                            <p className="text-xs text-slate-400">Step-by-step instructions</p>
                        </div>
                    </div>
                    <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-cyan-500/20">
                        <h3 className="text-white font-medium mb-2">Your allocation persists across all tabs:</h3>
                        <ul className="text-sm text-slate-400 space-y-1">
                            <li>• <strong className="text-cyan-400">Insights:</strong> Compare your allocation vs professional curators</li>
                            <li>• <strong className="text-cyan-400">Explore:</strong> Pools in your allocation are highlighted; find alternatives</li>
                            <li>• <strong className="text-cyan-400">Learn:</strong> Load your allocation into Strategy Builder to customize</li>
                        </ul>
                    </div>
                </section>

                {/* Learning Flow */}
                <section className="bg-gradient-to-br from-purple-900/20 to-slate-800 border border-purple-500/30 rounded-xl p-8">
                    <h2 className="text-xl font-semibold text-white mb-2">Want to Learn Instead?</h2>
                    <p className="text-slate-400 mb-6">Build your own curation skills through our learning flow:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { icon: Users, label: "1. Study Curators", desc: "See how experts allocate & why", href: "/?tab=insights" },
                            { icon: Hammer, label: "2. Practice", desc: "Build strategies with feedback", href: "/?tab=learn&subtab=practice" },
                            { icon: Wrench, label: "3. Compare", desc: "Analyze with specialized tools", href: "/?tab=learn&subtab=compare" },
                        ].map((step, i) => (
                            <Link key={i} href={step.href} className="text-center p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors group">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-500/30 transition-colors">
                                    <step.icon className="h-6 w-6 text-purple-400" />
                                </div>
                                <h3 className="text-white font-medium mb-1">{step.label}</h3>
                                <p className="text-xs text-slate-400">{step.desc}</p>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Curation Principles */}
                <section className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <BookOpen className="h-6 w-6 text-cyan-400" />
                        <h2 className="text-xl font-semibold text-white">6 Curation Principles</h2>
                    </div>
                    <p className="text-slate-300 mb-6">
                        These mental models guide how professional curators make allocation decisions:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { icon: Scale, name: "Risk/Reward Balance", desc: "Higher yield always comes with higher risk", color: "cyan" },
                            { icon: Grid3X3, name: "Diversification", desc: "Spread risk across protocols and assets", color: "purple" },
                            { icon: Clock, name: "Yield Sustainability", desc: "Base APY vs temporary token emissions", color: "green" },
                            { icon: Shield, name: "Protocol Trust", desc: "TVL, audits, team track record", color: "yellow" },
                            { icon: Droplet, name: "Liquidity Depth", desc: "Can you exit without slippage?", color: "blue" },
                            { icon: LinkIcon, name: "Correlation", desc: "How positions move together", color: "orange" },
                        ].map((principle, i) => (
                            <div key={i} className="flex items-start gap-3 bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                                <div className={`w-8 h-8 bg-${principle.color}-500/20 rounded-lg flex items-center justify-center flex-shrink-0`}>
                                    <principle.icon className={`h-4 w-4 text-${principle.color}-400`} />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">{principle.name}</h3>
                                    <p className="text-sm text-slate-400">{principle.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Curator Strategies */}
                <section className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Users className="h-6 w-6 text-purple-400" />
                            <h2 className="text-xl font-semibold text-white">Learn from Curators</h2>
                        </div>
                        <Link
                            href="/?tab=insights"
                            className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                        >
                            View strategies <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <p className="text-slate-300 mb-6">
                        See how professional curators like Gauntlet, Steakhouse, and RE7 allocate capital:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                            <h3 className="text-white font-medium mb-2">Allocation Reasoning</h3>
                            <p className="text-sm text-slate-400">
                                Every position includes why they chose it, why that percentage,
                                and what tradeoffs they accepted.
                            </p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                            <h3 className="text-white font-medium mb-2">Principle Badges</h3>
                            <p className="text-sm text-slate-400">
                                See which mental models each allocation demonstrates. Connect
                                theory to real decisions.
                            </p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                            <h3 className="text-white font-medium mb-2">Historical Performance</h3>
                            <p className="text-sm text-slate-400">
                                Track record metrics: returns, max drawdown, Sharpe ratio,
                                and benchmark comparisons.
                            </p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                            <h3 className="text-white font-medium mb-2">Risk Profiles</h3>
                            <p className="text-sm text-slate-400">
                                Conservative, moderate, or aggressive—understand each curator's
                                approach to risk.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Strategy Builder */}
                <section className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Hammer className="h-6 w-6 text-green-400" />
                            <h2 className="text-xl font-semibold text-white">Strategy Builder</h2>
                        </div>
                        <Link
                            href="/?tab=learn&subtab=practice"
                            className="flex items-center gap-1 text-sm text-green-400 hover:text-green-300 transition-colors"
                        >
                            Try it <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <p className="text-slate-300 mb-6">
                        Practice building your own allocation strategy with real-time feedback:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                            <p className="text-2xl font-bold text-white mb-1">A-F</p>
                            <p className="text-sm text-slate-400">Grading on diversification, risk, sustainability</p>
                        </div>
                        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                            <p className="text-2xl font-bold text-white mb-1">Real-time</p>
                            <p className="text-sm text-slate-400">Instant feedback as you adjust allocations</p>
                        </div>
                        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                            <p className="text-2xl font-bold text-white mb-1">Compare</p>
                            <p className="text-sm text-slate-400">See how your strategy differs from curators</p>
                        </div>
                    </div>
                </section>

                {/* Scenario Simulator */}
                <section className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Activity className="h-6 w-6 text-orange-400" />
                            <h2 className="text-xl font-semibold text-white">Scenario Simulator</h2>
                        </div>
                        <Link
                            href="/?tab=learn&subtab=practice"
                            className="flex items-center gap-1 text-sm text-orange-400 hover:text-orange-300 transition-colors"
                        >
                            Try it <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <p className="text-slate-300 mb-6">
                        Stress test your strategy before committing capital:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {[
                            { name: "Market Crash", change: "-30%" },
                            { name: "Correction", change: "-15%" },
                            { name: "Bull Run", change: "+50%" },
                            { name: "Rewards End", change: "APY drop" },
                            { name: "Depeg", change: "Stablecoin" },
                        ].map((scenario, i) => (
                            <div key={i} className="text-center p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                <p className="text-sm font-medium text-white">{scenario.name}</p>
                                <p className="text-xs text-slate-400">{scenario.change}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Pool Comparison & Backtest */}
                <section className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <GitCompare className="h-6 w-6 text-blue-400" />
                            <h2 className="text-xl font-semibold text-white">Pool Comparison & Backtest</h2>
                        </div>
                        <Link
                            href="/?tab=explore"
                            className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Try it <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <p className="text-slate-300 mb-6">
                        Compare pools side-by-side and test historical performance before committing capital:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                            <div className="flex items-center gap-2 mb-2">
                                <GitCompare className="h-4 w-4 text-blue-400" />
                                <h3 className="text-white font-medium">Compare Up to 3 Pools</h3>
                            </div>
                            <p className="text-sm text-slate-400">
                                Select pools from the Explore tab and compare risk breakdown, APY sustainability, and key metrics side-by-side.
                            </p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                            <div className="flex items-center gap-2 mb-2">
                                <LineChart className="h-4 w-4 text-blue-400" />
                                <h3 className="text-white font-medium">Historical Backtest</h3>
                            </div>
                            <p className="text-sm text-slate-400">
                                See how pools performed over 7, 30, or 90 days. Choose compounding options (daily, weekly, none) to estimate returns.
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-xs text-blue-300">
                            <strong>How to use:</strong> In Explore tab, click the compare icon on any pool to add it to comparison. Click "Compare" button when ready.
                        </p>
                    </div>
                </section>

                {/* Compare Tools */}
                <section className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Building2 className="h-6 w-6 text-purple-400" />
                            <h2 className="text-xl font-semibold text-white">Compare Tools</h2>
                        </div>
                        <Link
                            href="/?tab=learn&subtab=compare"
                            className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                        >
                            Open tools <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <p className="text-slate-300 mb-6">
                        Specialized tools to analyze different aspects of Solana DeFi:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { icon: Building2, name: "Protocol Comparison", desc: "Compare Kamino, Marginfi, Meteora and other protocols by TVL, pools, and average APY" },
                            { icon: Coins, name: "LST Comparison", desc: "Compare liquid staking tokens: APY breakdown, validator count, MEV boost, peg stability" },
                            { icon: TrendingUp, name: "Yield Spreads", desc: "Find APY differences for the same asset across protocols—spot arbitrage opportunities" },
                            { icon: Layers, name: "Alternative Yields", desc: "Explore restaking and perp LP yields beyond traditional lending" },
                            { icon: Calculator, name: "IL Calculator", desc: "Calculate impermanent loss for any price change scenario, including concentrated liquidity" },
                        ].map((tool, i) => (
                            <div key={i} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                                <div className="flex items-center gap-2 mb-2">
                                    <tool.icon className="h-4 w-4 text-purple-400" />
                                    <h3 className="text-white font-medium text-sm">{tool.name}</h3>
                                </div>
                                <p className="text-xs text-slate-400">{tool.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* AI Features */}
                <section className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Sparkles className="h-6 w-6 text-yellow-400" />
                        <h2 className="text-xl font-semibold text-white">AI-Powered Features</h2>
                        <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/30">
                            Login Required
                        </span>
                    </div>
                    <p className="text-slate-300 mb-6">
                        Sign in to unlock AI-powered analysis and personalized recommendations:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                            <div className="flex items-center gap-2 mb-2">
                                <Brain className="h-4 w-4 text-yellow-400" />
                                <h3 className="text-white font-medium">Portfolio Optimizer</h3>
                            </div>
                            <p className="text-sm text-slate-400 mb-3">
                                Input your investment amount and risk tolerance. AI suggests a diversified allocation across pools with expected yields and risk warnings.
                            </p>
                            <p className="text-xs text-slate-500">
                                Access: Click "Optimize" button in the Explore tab header.
                            </p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-4 w-4 text-yellow-400" />
                                <h3 className="text-white font-medium">AI Pool Insights</h3>
                            </div>
                            <p className="text-sm text-slate-400 mb-3">
                                Get plain-English analysis of any pool: risk explanation, APY sustainability assessment, comparison vs similar pools, and actionable verdict.
                            </p>
                            <p className="text-xs text-slate-500">
                                Access: Click "AI Insights" on any expanded pool card.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Watchlist */}
                <section className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Bookmark className="h-6 w-6 text-cyan-400" />
                            <h2 className="text-xl font-semibold text-white">Watchlist</h2>
                        </div>
                        <Link
                            href="/?tab=explore"
                            className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                            Try it <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <p className="text-slate-300 mb-4">
                        Save pools you're interested in and track them over time:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                            <Bookmark className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
                            <p className="text-sm text-white font-medium mb-1">Save Pools</p>
                            <p className="text-xs text-slate-400">Click bookmark icon on any pool</p>
                        </div>
                        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                            <AlertTriangle className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                            <p className="text-sm text-white font-medium mb-1">APY Alerts</p>
                            <p className="text-xs text-slate-400">See badges when APY changes significantly</p>
                        </div>
                        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                            <BarChart3 className="h-6 w-6 text-green-400 mx-auto mb-2" />
                            <p className="text-sm text-white font-medium mb-1">Quick Filter</p>
                            <p className="text-xs text-slate-400">Toggle between All and Watchlist view</p>
                        </div>
                    </div>
                    <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                        <p className="text-xs text-cyan-300">
                            <strong>Note:</strong> Watchlist is stored locally in your browser. Sign in to sync across devices.
                        </p>
                    </div>
                </section>

                {/* Data Pipeline */}
                <section className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white">Data Pipeline</h2>
                        <Link
                            href="/?tab=explore"
                            className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                            Explore pools <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { icon: Database, label: "1. Collect", desc: "Aggregate pool data from protocols" },
                            { icon: BarChart3, label: "2. Analyze", desc: "Calculate risk scores & metrics" },
                            { icon: Brain, label: "3. Rank", desc: "AI evaluates risk-adjusted returns" },
                            { icon: Zap, label: "4. Deliver", desc: "Surface best opportunities" },
                        ].map((step, i) => (
                            <div key={i} className="text-center p-4 bg-slate-800/50 rounded-lg">
                                <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <step.icon className="h-6 w-6 text-cyan-400" />
                                </div>
                                <h3 className="text-white font-medium mb-1">{step.label}</h3>
                                <p className="text-xs text-slate-400">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Risk Scoring */}
                <section className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Shield className="h-6 w-6 text-green-400" />
                            <h2 className="text-xl font-semibold text-white">Risk Scoring Model</h2>
                        </div>
                        <Link
                            href="/?tab=explore"
                            className="flex items-center gap-1 text-sm text-green-400 hover:text-green-300 transition-colors"
                        >
                            See risk scores <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <p className="text-slate-300 mb-6">
                        Every pool receives a risk score from 0-100 based on five weighted factors:
                    </p>
                    <div className="space-y-4">
                        {[
                            {
                                name: "TVL Risk",
                                weight: "25%",
                                desc: "Lower TVL = higher risk. Pools under $1M get higher scores.",
                                color: "bg-cyan-500",
                            },
                            {
                                name: "APY Sustainability",
                                weight: "25%",
                                desc: "Extremely high APYs are often unsustainable. We penalize outliers.",
                                color: "bg-green-500",
                            },
                            {
                                name: "IL Risk",
                                weight: "20%",
                                desc: "LP pools with uncorrelated assets face impermanent loss risk.",
                                color: "bg-orange-500",
                            },
                            {
                                name: "Stablecoin Exposure",
                                weight: "15%",
                                desc: "Stablecoins = low volatility. Volatile tokens = higher risk.",
                                color: "bg-yellow-500",
                            },
                            {
                                name: "Protocol Maturity",
                                weight: "15%",
                                desc: "Audits, team reputation, time in market, upgrade authority.",
                                color: "bg-purple-500",
                            },
                        ].map((factor, i) => (
                            <div key={i} className="flex items-center gap-4 bg-slate-800/50 rounded-lg p-4">
                                <div className={`w-2 h-12 ${factor.color} rounded-full`} />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-white font-medium">{factor.name}</h3>
                                        <span className="text-sm text-slate-400">{factor.weight}</span>
                                    </div>
                                    <p className="text-sm text-slate-400">{factor.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <h4 className="text-white font-medium mb-2">Risk Levels</h4>
                        <div className="flex flex-wrap gap-4 text-sm">
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-green-500 rounded-full" />
                                <span className="text-slate-300">Low (0-20)</span>
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-yellow-500 rounded-full" />
                                <span className="text-slate-300">Medium (21-40)</span>
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-orange-500 rounded-full" />
                                <span className="text-slate-300">High (41-60)</span>
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-red-500 rounded-full" />
                                <span className="text-slate-300">Very High (61+)</span>
                            </span>
                        </div>
                    </div>
                </section>

                {/* What We Don't Do */}
                <section className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="h-6 w-6 text-red-400" />
                        <h2 className="text-xl font-semibold text-white">What We Don't Do</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            "We never request wallet signing permissions",
                            "We never custody or manage your funds",
                            "We never execute transactions on your behalf",
                            "We never sell your data to third parties",
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-slate-300">
                                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-red-400 text-sm">✕</span>
                                </div>
                                {item}
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="text-center py-8 border-t border-slate-800">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        Ready to get started?
                    </h2>
                    <p className="text-slate-400 mb-6">
                        Get your personalized allocation in 30 seconds, or explore on your own.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link
                            href="/?tab=start"
                            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-medium rounded-lg transition-colors"
                        >
                            Get My Allocation
                        </Link>
                        <Link
                            href="/?tab=explore"
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg transition-colors"
                        >
                            Browse Pools
                        </Link>
                        <Link
                            href="/?tab=learn"
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg transition-colors"
                        >
                            Practice Building
                        </Link>
                    </div>
                </section>
            </div>
        </CurateLayoutClient>
    );
}
