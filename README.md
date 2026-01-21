# Kalshify: Experience Kalshi Prediction Markets From Anywhere

**AI-powered paper trading for Kalshi prediction markets. Practice trading worldwide — no US residency required.**

**Live Demo:** [kalshify-fabrknt.vercel.app](https://kalshify-fabrknt.vercel.app)

---

## What is Kalshify?

Kalshify lets you **experience Kalshi prediction markets** from anywhere in the world. Get AI-powered recommendations, place paper trades with real market data, and track your P&L — all without risking real money.

**Built for the Kalshi Hackathon** | Powered by Claude AI

---

## Features

### Markets Explorer
Browse live Kalshi prediction markets with real-time data:
- Filter by category (Politics, Economics, Climate, Sports, etc.)
- View probability charts (simulated history) and orderbook data
- See volume, open interest, and market status

### Paper Trading
Practice trading without real money:
- Buy YES or NO positions at current market prices
- Track unrealized and realized P&L
- Simulate price movements to test strategies
- Close positions and see results

### AI Recommendations
Get personalized market suggestions powered by Claude AI:
- Set your risk tolerance and interests
- Receive curated market picks with reasoning
- Understand why each market matches your profile

### Leaderboard
Compete with traders worldwide:
- Rankings by total P&L, win rate, trades, or streak
- Track your progress and percentile
- Win streaks and performance trends

---

## Quick Start

1. **Browse Markets** — Explore live Kalshi prediction markets at `/markets`
2. **Place Paper Trades** — Click a market, buy YES or NO positions
3. **Track Portfolio** — View your positions and P&L at `/portfolio`
4. **Climb the Leaderboard** — Close positions to record trades at `/leaderboard`

No sign-up required. Start trading immediately.

---

## Pages

| Page | Description |
|------|-------------|
| `/` | Landing page with value proposition |
| `/markets` | Browse all Kalshi markets with filters |
| `/markets/[ticker]` | Market detail with trading interface |
| `/portfolio` | Paper trading portfolio and P&L |
| `/leaderboard` | Global rankings and competition |
| `/for-you` | AI-powered personalized recommendations |

---

## API Endpoints

### Market Data
- `GET /api/kalshi/markets` — List markets with filters
- `GET /api/kalshi/markets/[ticker]` — Single market details

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

---

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **AI:** Anthropic Claude API
- **Data:** Kalshi REST API (live market data)
- **Hosting:** Vercel

---

## Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your KALSHI_API_KEY, ANTHROPIC_API_KEY, etc.

# Run development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

```env
# Kalshi API
KALSHI_API_KEY=your-api-key

# AI (for recommendations)
ANTHROPIC_API_KEY=sk-ant-...

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
| **AI-Powered** | Claude AI recommendations and insights |
| **Learn First** | Understand prediction markets before real trading |

---

## Disclaimer

Kalshify is an **educational paper trading platform**. No real money is involved. This platform is not affiliated with Kalshi Inc. Market data is provided for educational purposes only. Paper trading results do not guarantee future performance on real markets.

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
