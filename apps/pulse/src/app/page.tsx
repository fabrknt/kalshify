export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <span className="text-5xl">💓</span>
          <h1 className="text-4xl font-bold text-foreground">PULSE</h1>
        </div>
        <p className="text-xl text-center text-muted-foreground">
          Team Vitality Tracking & Proof of Contribution
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-8">
          <div className="border border-border rounded-lg p-6 bg-card hover:border-primary/50 transition-colors">
            <h3 className="font-semibold text-lg mb-2 text-foreground">Multi-Platform Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Connect GitHub, Discord, and Notion to track contributions across all your tools
            </p>
          </div>
          <div className="border border-border rounded-lg p-6 bg-card hover:border-primary/50 transition-colors">
            <h3 className="font-semibold text-lg mb-2 text-foreground">Qualitative Scoring</h3>
            <p className="text-sm text-muted-foreground">
              Omotenashi logic rewards quality over quantity for meaningful engagement
            </p>
          </div>
          <div className="border border-border rounded-lg p-6 bg-card hover:border-primary/50 transition-colors">
            <h3 className="font-semibold text-lg mb-2 text-foreground">SBT Rewards</h3>
            <p className="text-sm text-muted-foreground">
              Earn Soulbound Tokens as proof of your contributions and build your on-chain resume
            </p>
          </div>
        </div>
        <div className="mt-8 text-center">
          <span className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
            ✅ MVP Ready
          </span>
        </div>
        <a
          href="/dashboard"
          className="mt-4 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Explore Dashboard →
        </a>
      </div>
    </main>
  );
}
