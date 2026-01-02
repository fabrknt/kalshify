import Link from "next/link";
import {
    ArrowRight,
    Brain,
    Link2,
    TrendingUp,
    Shield,
    Users,
    Building2,
    Github,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { Logo } from "@/components/logo";

// Mark page as dynamic since it uses database
export const dynamic = "force-dynamic";

async function getCompanyStats() {
    const [companyCount, listedCount, avgScore] = await Promise.all([
        prisma.company.count({ where: { isActive: true } }),
        prisma.company.count({ where: { isActive: true, isListed: true } }),
        prisma.company.aggregate({
            where: { isActive: true },
            _avg: { overallScore: true },
        }),
    ]);

    return {
        totalCompanies: companyCount,
        listedCompanies: listedCount,
        avgScore: Math.round(avgScore._avg.overallScore || 0),
    };
}

async function getListingStats() {
    const activeListings = await prisma.listing.count({
        where: { status: "active" },
    });

    return { activeListings };
}

export default async function SuiteLandingPage() {
    const [companyStats, listingStats] = await Promise.all([
        getCompanyStats(),
        getListingStats(),
    ]);

    const totalCompanies = companyStats.totalCompanies;
    const listedCompanies = companyStats.listedCompanies;
    const activeListings = listingStats.activeListings;

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted to-background">
            {/* Header */}
            <header className="border-b border-border bg-card sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Logo size="sm" />
                        <div className="flex items-center gap-6">
                            <a
                                href="https://x.com/fabrknt"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors"
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
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="GitHub"
                            >
                                <Github className="h-5 w-5" />
                            </a>
                            <Link
                                href="/cindex"
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Index
                            </Link>
                            <Link
                                href="/synergy"
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Synergy
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="border-b border-border bg-card">
                <div className="container mx-auto px-4 py-16 md:py-24">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="flex justify-center mb-4">
                            <Logo size="lg" />
                        </div>
                        <div className="flex justify-center mb-8">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-semibold">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                                </span>
                                Preview
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
                            Web3 Index & Synergy Platform
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8">
                            Research web3 companies with AI-powered index.
                            Connect for acquisitions, strategic partnerships,
                            and ecosystem collaborations—all backed by verified
                            on-chain and off-chain data.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/cindex"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors font-semibold text-lg"
                            >
                                <Brain className="h-6 w-6" />
                                Explore Index
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                            <Link
                                href="/synergy"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-colors font-semibold text-lg"
                            >
                                <Link2 className="h-6 w-6" />
                                Find Synergies
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                    <div className="text-center">
                        <p className="text-4xl font-bold text-foreground mb-2">
                            {totalCompanies}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Companies Tracked
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-4xl font-bold text-purple-600 mb-2">
                            {companyStats.avgScore}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Avg Index Score
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-4xl font-bold text-cyan-600 mb-2">
                            {activeListings}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Active Opportunities
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-4xl font-bold text-green-600 mb-2">
                            100%
                        </p>
                        <p className="text-sm text-muted-foreground">
                            AI-Verified Data
                        </p>
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* INDEX Product */}
                    <div className="bg-card rounded-lg border border-border p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-lg bg-purple-100">
                                <Brain className="h-8 w-8 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-foreground">
                                    INDEX
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Web3 Company Index
                                </p>
                            </div>
                        </div>

                        <p className="text-muted-foreground mb-6">
                            Automated index for {totalCompanies} web3 companies
                            with verified on-chain and off-chain data. No manual
                            input, just trustworthy metrics.
                        </p>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-start gap-3">
                                <TrendingUp className="h-5 w-5 text-purple-600 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-foreground">
                                        Growth Metrics
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        On-chain activity, wallet growth, user
                                        growth rates
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-foreground">
                                        Team Health
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        GitHub commits, contributors, retention,
                                        code quality
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-foreground">
                                        Verified Index
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Automated verification via blockchain
                                        and GitHub APIs
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/index"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors font-medium w-full justify-center"
                        >
                            Explore Index
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>

                    {/* SYNERGY Product */}
                    <div className="bg-card rounded-lg border border-border p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-lg bg-cyan-100">
                                <Link2 className="h-8 w-8 text-cyan-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-foreground">
                                    SYNERGY
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    M&A & Partnership Synergy
                                </p>
                            </div>
                        </div>

                        <p className="text-muted-foreground mb-6">
                            Find acquisition targets and partnership
                            opportunities with verified index. Connect for M&A,
                            strategic alliances, and ecosystem collaboration.
                        </p>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-start gap-3">
                                <Building2 className="h-5 w-5 text-cyan-600 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-foreground">
                                        Acquisition Targets
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {listedCompanies} verified web3
                                        companies seeking M&A with transparent
                                        metrics
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Users className="h-5 w-5 text-cyan-600 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-foreground">
                                        Strategic Partnerships
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Technical integrations, ecosystem
                                        collaborations, co-marketing
                                        opportunities
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Shield className="h-5 w-5 text-cyan-600 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-foreground">
                                        AI-Powered Synergy
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Automated compatibility analysis based
                                        on verified index scores
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/synergy"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-colors font-medium w-full justify-center"
                        >
                            Explore Opportunities
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <div className="bg-card border-t border-b border-border">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-foreground text-center mb-12">
                            How It Works
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-purple-600">
                                        1
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    AI Index
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Automated analysis of on-chain data, GitHub
                                    activity, and social metrics—no manual input
                                    needed
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-cyan-100 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-cyan-600">
                                        2
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    Smart Synergy
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    AI-powered compatibility analysis finds the
                                    best M&A targets and partnership
                                    opportunities
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-green-600">
                                        3
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    Connect & Close
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Transparent verified metrics enable faster
                                    due diligence and confident decision-making
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-foreground mb-4">
                            About Fabrknt
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            We are{" "}
                            <a
                                href="https://www.fabrknt.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-purple-600 hover:text-purple-700"
                            >
                                www.fabrknt.com
                            </a>{" "}
                            — Building the future of Web3 index and synergy
                        </p>
                    </div>
                    <div className="bg-card rounded-lg border border-border p-8">
                        <p className="text-muted-foreground mb-6">
                            Fabrknt is a Web3 index and synergy platform that
                            brings transparency and trust to the ecosystem. Our
                            mission is to enable better decision-making through
                            AI-powered, verified index on Web3 companies.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold text-foreground mb-2">
                                    🎯 Our Mission
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Democratize access to verified Web3 company
                                    index and facilitate meaningful connections
                                    between companies seeking growth through M&A
                                    and strategic partnerships.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground mb-2">
                                    🔍 Our Approach
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    100% automated verification using on-chain
                                    data, GitHub activity, and social metrics.
                                    No manual input, no manipulation—just
                                    trustworthy, transparent index.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground mb-2">
                                    🤝 Built for Web3
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    We understand the unique challenges of the
                                    Web3 ecosystem. Our platform is designed to
                                    help founders, investors, and acquirers make
                                    data-driven decisions with confidence.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground mb-2">
                                    🚀 Open Development
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    We believe in building in public. Follow our
                                    journey on GitHub and X as we continue to
                                    expand our index coverage and synergy
                                    capabilities.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-purple-50 to-cyan-50 rounded-lg border border-purple-200 p-12">
                    <h2 className="text-3xl font-bold text-foreground mb-4">
                        Ready to Find Your Next Strategic Move?
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8">
                        Research companies with AI-powered INDEX. Find
                        acquisitions and partnerships with smart SYNERGY. All
                        decisions backed by 100% verified data.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/cindex/companies"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors font-medium"
                        >
                            Explore Companies
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                        <Link
                            href="/synergy/opportunities"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-50 transition-colors font-medium"
                        >
                            Find Synergyes
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-border bg-card mt-16">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        {/* Company Info */}
                        <div className="md:col-span-2">
                            <Logo size="md" className="mb-4" />
                            <div className="flex items-center gap-2 mb-4">
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500"></span>
                                    </span>
                                    Preview
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                Web3 Index & Synergy Platform
                            </p>
                            <p className="text-sm text-muted-foreground mb-4">
                                We are{" "}
                                <a
                                    href="https://www.fabrknt.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-purple-600 hover:text-purple-700"
                                >
                                    www.fabrknt.com
                                </a>
                            </p>
                            <div className="flex items-center gap-4">
                                <a
                                    href="https://x.com/fabrknt"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
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
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label="GitHub"
                                >
                                    <Github className="h-5 w-5" />
                                </a>
                            </div>
                        </div>

                        {/* Products */}
                        <div>
                            <h3 className="font-semibold text-foreground mb-4">
                                Products
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        href="/cindex"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Index
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/cindex/companies"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Company Directory
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/synergy"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Synergy
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/synergy/opportunities"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Opportunities
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h3 className="font-semibold text-foreground mb-4">
                                Company
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <a
                                        href="https://www.fabrknt.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        About Us
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://github.com/fabrknt"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        GitHub
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://x.com/fabrknt"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        X (Twitter)
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="border-t border-border pt-8">
                        <p className="text-sm text-muted-foreground text-center">
                            © {new Date().getFullYear()} Fabrknt. All rights
                            reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
