export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <span className="text-5xl">📊</span>
          <h1 className="text-4xl font-bold text-foreground">TRACE</h1>
        </div>
        <p className="text-xl text-center text-muted-foreground">
          Marketing Attribution & On-Chain Activity Monitoring
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-8">
          <div className="border border-border rounded-lg p-6 bg-card hover:border-primary/50 transition-colors">
            <h3 className="font-semibold text-lg mb-2 text-foreground">Click-to-Wallet Attribution</h3>
            <p className="text-sm text-muted-foreground">
              Track marketing campaigns from click to on-chain conversion with UTM support
            </p>
          </div>
          <div className="border border-border rounded-lg p-6 bg-card hover:border-primary/50 transition-colors">
            <h3 className="font-semibold text-lg mb-2 text-foreground">Bot Detection</h3>
            <p className="text-sm text-muted-foreground">
              Wallet hygiene scoring filters out Sybil attacks and bot traffic for true ROI
            </p>
          </div>
          <div className="border border-border rounded-lg p-6 bg-card hover:border-primary/50 transition-colors">
            <h3 className="font-semibold text-lg mb-2 text-foreground">Service Health Metrics</h3>
            <p className="text-sm text-muted-foreground">
              Monitor DAU/WAU/MAU, transaction volume, and Protocol Activity Score (0-100)
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
