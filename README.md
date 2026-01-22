# Kalshify: Experience Kalshi Prediction Markets From Anywhere

**AI-powered paper trading for Kalshi prediction markets. Practice trading worldwide — no US residency required.**

**Live Demo:** [kalshify-fabrknt.vercel.app](https://kalshify-fabrknt.vercel.app)

---

## What is Kalshify?

Kalshify lets you **experience Kalshi prediction markets** from anywhere in the world. Get AI-powered recommendations, place paper trades with real market data, and track your P&L — all without risking real money.

**Built for the [Kalshi Builders Program](https://kalshi.com)** | Powered by Claude AI

---

## Why Kalshify?

### The Problem
- **95% of the world** can't access Kalshi (US residency required)
- **Beginners** have no risk-free way to learn prediction markets
- **No real-time intelligence tools** exist for Kalshi traders

### The Solution
Kalshify serves as the **global on-ramp to Kalshi**:

1. **Learn** — Paper trade with real market data, zero risk
2. **Practice** — Build strategies and track P&L before real trading
3. **Convert** — When ready, transition to real trading on Kalshi

> *"Every Kalshify user is a potential Kalshi customer."*

---

## Features

### Intel Terminal (New!)
Real-time market intelligence in a hacker-style terminal interface:
- **Smart Money Detection** — Volume spikes, whale alerts, price movements
- **AI Market Analyst** — Claude-powered analysis of each signal
- **Live Demo Mode** — Auto-refresh every 10 seconds with new signal highlights
- Terminal aesthetic with green/amber/red severity indicators

### Markets Explorer
Browse live Kalshi prediction markets with real-time data:
- **Kalshi-style Market Cards** — Clean design matching Kalshi's UI
- **Category Thumbnails** — Emoji icons for quick category recognition
- **YES/NO Buttons** — Solid green YES, outlined NO (just like Kalshi)
- **Grid, List, and Heatmap views** — Multiple visualization options
- Filter by category (Politics, Economics, Climate, Sports, etc.)

### Paper Trading
Practice trading without real money:
- Buy YES or NO positions at current market prices
- Track unrealized and realized P&L
- **Portfolio Donut Chart** — Visual category exposure breakdown
- **Confetti celebration** on profitable trades
- Simulate price movements to test strategies

### AI Recommendations
Get personalized market suggestions powered by Claude AI:
- Set your risk tolerance and interests
- **Flip Card Animation** — Tap to reveal AI analysis
- Receive curated market picks with reasoning
- Understand why each market matches your profile

### Leaderboard
Compete with traders worldwide:
- **Top 3 Podium** — Gold, silver, bronze styled rankings
- Rankings by total P&L, win rate, trades, or streak
- Track your progress and percentile
- **Animated numbers** for live updates

### Visual Enhancements
Modern, polished UI matching Kalshi's design language:
- **Kalshi-style Cards** — Clean market cards with YES/NO buttons
- **Category Emojis** — Visual thumbnails (🏛️ Politics, 📈 Economics, 🏈 Sports)
- **Live Price Ticker** — Scrolling marquee of trending markets
- **Heatmap View** — Color-coded market grid by price change
- **Donut Chart** — Portfolio category breakdown
- **Card Flip Animation** — Interactive AI recommendation cards
- **Podium Animation** — Animated leaderboard entrance

---

## Quick Start

1. **Browse Markets** — Explore live Kalshi prediction markets at `/markets`
2. **Check Intel** — See real-time market signals at `/intel`
3. **Place Paper Trades** — Click a market, buy YES or NO positions
4. **Track Portfolio** — View your positions and P&L at `/portfolio`
5. **Climb the Leaderboard** — Close positions to record trades at `/leaderboard`

No sign-up required. Start trading immediately.

---

## Pages

| Page | Description |
|------|-------------|
| `/` | Landing page with value proposition |
| `/intel` | **Intel Terminal** — Real-time market signals and AI analysis |
| `/markets` | Browse all Kalshi markets (grid, list, or heatmap view) |
| `/markets/[ticker]` | Market detail with trading interface |
| `/portfolio` | Paper trading portfolio with donut chart |
| `/leaderboard` | Global rankings with top 3 podium |
| `/for-you` | AI-powered recommendations with flip cards |

---

## API Endpoints

### Market Data
- `GET /api/kalshi/markets` — List markets with filters
- `GET /api/kalshi/markets/[ticker]` — Single market details
- `GET /api/markets/trending` — Trending markets for ticker

### Intel System
- `GET /api/intel` — Get intel signals (volume spikes, whale alerts, etc.)
- `POST /api/intel/scan` — Trigger manual market scan
- `POST /api/intel/analyze` — AI analysis of a signal (Claude API)

### Paper Trading
- `GET /api/portfolio/paper/positions` — Get positions
- `POST /api/portfolio/paper/positions` — Create position
- `DELETE /api/portfolio/paper/positions?id=` — Close position
- `PATCH /api/portfolio/paper/positions` — Simulate prices

### Performance & Leaderboard
- `GET /api/portfolio/paper/snapshots` — Performance snapshots
- `GET /api/leaderboard` — Leaderboard rankings

### AI Features
- `POST /api/kalshi/ai/recommendations` — Get AI recommendations
- `GET /api/kalshi/ai/insights/[marketId]` — Market analysis

### Cron Jobs
- `GET /api/cron/scan-markets` — Scheduled market scanning
- `GET /api/cron/scan-social` — Scheduled social intel scanning

---

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **UI Components:** Radix UI, Lucide Icons, Framer Motion
- **AI:** Anthropic Claude API (sonnet for analysis)
- **Data:** Kalshi REST API (live market data)
- **Database:** PostgreSQL with Prisma ORM
- **Hosting:** Vercel (with cron jobs)

---

## Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your KALSHI_API_KEY, ANTHROPIC_API_KEY, DATABASE_URL, etc.

# Run database migrations
npx prisma db push

# Run development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

```env
# Kalshi API
KALSHI_API_KEY=your-api-key

# AI (for recommendations and Intel analysis)
ANTHROPIC_API_KEY=sk-ant-...

# Database
DATABASE_URL=postgresql://...

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Why Paper Trade?

| Benefit | Description |
|---------|-------------|
| **Global Access** | Trade from anywhere — no US residency required |
| **Zero Risk** | Practice with simulated money |
| **Real Data** | Live Kalshi prices and market data |
| **AI-Powered** | Claude AI recommendations and signal analysis |
| **Intel Terminal** | Real-time market signals and smart money detection |
| **Learn First** | Understand prediction markets before real trading |

---

## Value to Kalshi Ecosystem

Kalshify creates a **user acquisition pipeline** for Kalshi:

```
Global/Novice Users → Kalshify (learn & practice) → Kalshi (real trading)
```

### For Kalshi
- **Pre-qualified leads** — Users who understand prediction markets
- **Global community** — Build demand for international expansion
- **Reduced support burden** — Educated users need less hand-holding
- **Feature testing** — Intel Terminal, AI Analyst could become premium features

### For Users
- **Risk-free learning** — Understand markets before real money
- **Build confidence** — Track P&L and prove strategies work
- **Smooth transition** — Same markets, same data, ready to trade real

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── intel/         # Intel system endpoints
│   │   ├── kalshi/        # Kalshi market data
│   │   └── portfolio/     # Paper trading
│   ├── intel/             # Intel Terminal page
│   ├── markets/           # Markets explorer
│   ├── portfolio/         # Portfolio dashboard
│   ├── leaderboard/       # Rankings
│   └── for-you/           # AI recommendations
├── components/
│   ├── ai/                # AI Pick cards
│   ├── intel/             # Terminal components
│   ├── markets/           # Market cards, heatmap
│   ├── portfolio/         # Portfolio dashboard
│   └── ui/                # Shared UI (sparkline, donut, ticker)
└── lib/
    ├── intel/             # Smart money detection
    └── kalshi/            # Kalshi API client
```

---

## Disclaimer

Kalshify is an **educational paper trading platform**. No real money is involved. Market data is provided for educational purposes only. Paper trading results do not guarantee future performance on real markets.

**Ready for real trading?** Visit [Kalshi.com](https://kalshi.com) — the regulated exchange for event contracts.

---

## Team

**Hiroyuki Saito** — Builder
- Banking & enterprise software background
- AWS certified, Stanford blockchain certification
- Based in Tokyo

---

## Connect

- **GitHub:** [github.com/psyto/kalshify](https://github.com/psyto/kalshify)
- **X (Twitter):** [@psyto](https://x.com/psyto)

---

*Experience Kalshi prediction markets from anywhere in the world.*
