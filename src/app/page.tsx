'use client';

import Link from 'next/link';
import {
  TrendingUp,
  BarChart2,
  Sparkles,
  Briefcase,
  ArrowRight,
  ChevronRight,
  Globe,
  Shield,
  Zap,
  GraduationCap,
  Terminal,
  Github,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      {/* Navigation */}
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-base sm:text-xl font-bold text-zinc-900 dark:text-white">
                Kalshify
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/markets"
                className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                Markets
              </Link>
              <Link
                href="/portfolio"
                className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                Portfolio
              </Link>
              <Link
                href="/leaderboard"
                className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                <span className="hidden sm:inline">Leaderboard</span>
                <span className="sm:hidden">Ranks</span>
              </Link>
              <Link
                href="/for-you"
                className="hidden sm:block text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                AI Picks
              </Link>
              <Link
                href="/intel"
                className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 flex items-center gap-1"
              >
                <Terminal className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Intel</span>
              </Link>
              <Link
                href="/markets"
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                <span className="hidden sm:inline">Start Trading</span>
                <span className="sm:hidden">Trade</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium mb-4">
            <Globe className="w-4 h-4" />
            Available Worldwide
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium mb-8 ml-2">
            <Sparkles className="w-4 h-4" />
            Powered by Claude AI
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-zinc-900 dark:text-white mb-6">
            Experience Kalshi
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              From Anywhere
            </span>
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl mx-auto">
            The AI-powered paper trading platform for Kalshi prediction markets.
            Practice trading with real market data — no US residency required.
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-10 max-w-xl mx-auto">
            Learn prediction market trading risk-free. Get AI recommendations, build a portfolio,
            and track your P&L with simulated trades.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/markets"
              className="flex items-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors text-lg"
            >
              Start Paper Trading
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/for-you"
              className="flex items-center gap-2 px-8 py-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-xl font-semibold transition-colors"
            >
              Get AI Recommendations
            </Link>
          </div>
        </div>
      </section>

      {/* Why Paper Trade Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-10">
            Why Paper Trade on Kalshify?
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-1">Global Access</h3>
              <p className="text-blue-100 text-sm">
                Trade from anywhere in the world — no US residency needed
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-1">Zero Risk</h3>
              <p className="text-blue-100 text-sm">
                Practice with simulated money — learn without losing
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-1">Real Data</h3>
              <p className="text-blue-100 text-sm">
                Live Kalshi market prices, volume, and orderbook data
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-1">AI-Powered</h3>
              <p className="text-blue-100 text-sm">
                Get personalized recommendations from Claude AI
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white text-center mb-4">
            Everything you need to learn prediction markets
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-center mb-12 max-w-2xl mx-auto">
            Built for traders worldwide who want to experience Kalshi's prediction markets
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<BarChart2 className="w-6 h-6" />}
              title="Live Market Explorer"
              description="Browse real Kalshi markets with live prices, trading volume, and probability charts."
              href="/markets"
            />
            <FeatureCard
              icon={<Terminal className="w-6 h-6" />}
              title="Intel Terminal"
              description="Real-time market signals, volume spikes, and smart money detection in a hacker-style terminal."
              href="/intel"
              highlight
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="AI Recommendations"
              description="Claude AI analyzes markets and suggests trades that match your risk profile."
              href="/for-you"
            />
            <FeatureCard
              icon={<Briefcase className="w-6 h-6" />}
              title="Paper Portfolio"
              description="Build a portfolio with simulated trades. Track your P&L in real-time."
              href="/portfolio"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white text-center mb-4">
            How it works
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-center mb-12 max-w-2xl mx-auto">
            Start paper trading in seconds — no account or payment required
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400 font-bold text-xl">
                1
              </div>
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                Browse Markets
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                Explore live Kalshi prediction markets across politics, economics, sports, and more
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400 font-bold text-xl">
                2
              </div>
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                Place Paper Trades
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                Buy YES or NO positions with simulated money at real market prices
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400 font-bold text-xl">
                3
              </div>
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                Track Your P&L
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                Watch your portfolio value change as market prices move. Learn what works!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white text-center mb-4">
            Markets for every interest
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-center mb-12 max-w-2xl mx-auto">
            From US elections to global economics, find markets that match your expertise
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Politics', 'Economics', 'Climate', 'Tech', 'Sports', 'Finance', 'Crypto', 'Entertainment'].map(
              (category) => (
                <Link
                  key={category}
                  href={`/markets?category=${category.toLowerCase()}`}
                  className="px-5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {category}
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-white text-sm mb-6">
              <GraduationCap className="w-4 h-4" />
              For Educational Purposes
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to learn prediction markets?
            </h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
              Join traders worldwide practicing on Kalshify.
              No sign-up required to start paper trading.
            </p>
            <Link
              href="/markets"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors text-lg"
            >
              Start Paper Trading
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-zinc-900 dark:text-white">Kalshify</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
              <Link href="/markets" className="hover:text-zinc-900 dark:hover:text-white">
                Markets
              </Link>
              <Link href="/portfolio" className="hover:text-zinc-900 dark:hover:text-white">
                Portfolio
              </Link>
              <Link href="/leaderboard" className="hover:text-zinc-900 dark:hover:text-white">
                Leaderboard
              </Link>
              <Link href="/for-you" className="hover:text-zinc-900 dark:hover:text-white">
                AI Picks
              </Link>
              <Link href="/intel" className="hover:text-green-500 dark:hover:text-green-400 text-green-600 dark:text-green-500">
                Intel
              </Link>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <a
              href="https://x.com/psyto"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              @psyto
            </a>
            <a
              href="https://github.com/psyto/kalshify"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8">
            <p className="text-xs text-zinc-500 dark:text-zinc-500 text-center max-w-3xl mx-auto">
              <strong>Disclaimer:</strong> Kalshify is an educational paper trading platform.
              No real money is involved. This platform is not affiliated with Kalshi Inc.
              Market data is provided for educational purposes only.
              Paper trading results do not guarantee future performance on real markets.
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center mt-4">
              Built for the Kalshi Hackathon | Powered by Claude AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  href,
  highlight,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-2xl p-6 transition-all group ${
        highlight
          ? 'bg-gradient-to-br from-green-900/90 to-zinc-900 border border-green-500/50 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20'
          : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500'
      }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
        highlight
          ? 'bg-green-500/20 text-green-400'
          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
      }`}>
        {icon}
      </div>
      <h3 className={`text-lg font-semibold mb-2 transition-colors ${
        highlight
          ? 'text-green-400 group-hover:text-green-300'
          : 'text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
      }`}>
        {title}
      </h3>
      <p className={`text-sm ${highlight ? 'text-green-100/70' : 'text-zinc-600 dark:text-zinc-400'}`}>
        {description}
      </p>
    </Link>
  );
}
