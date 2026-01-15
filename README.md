# FABRKNT: Learn DeFi Curation from Proven Strategies

**Learn how top curators think. Build strategies with confidence.**

**Domain:** [www.fabrknt.com](https://www.fabrknt.com)

---

## What is FABRKNT?

FABRKNT is a **DeFi curation learning platform** focused on **Solana**. Unlike data-heavy analytics tools, FABRKNT teaches you *how to think* about yield strategies by showing you how professional curators allocate capital—and why.

**Our philosophy:** Understanding over copying. Judgment over data dumps.

---

## Navigation

The app is organized into three main tabs:

| Tab | Purpose | What You'll Find |
|-----|---------|------------------|
| **Insights** | "Learn from the best" | Curation principles, curator strategies with reasoning |
| **Explore** | "Browse all pools" | Full pool table with filters, search, watchlist, backtesting |
| **Learn** | "Build your skills" | Principles, Strategy Builder, comparison tools |

**Mobile:** Bottom tab navigation with hamburger menu for site links.

---

## Core Features

### Insights Tab

#### Curation Principles
Six mental models that guide professional curators:
- **Risk/Reward Balance** — Higher yield = higher risk, always
- **Diversification** — Spread risk across protocols and assets
- **Yield Sustainability** — Base APY vs temporary emissions
- **Protocol Trust** — TVL, audits, track record
- **Liquidity Depth** — Can you exit without slippage?
- **Correlation** — Understand how positions move together

Click any principle to see a detailed explanation with examples.

#### Curator Strategies
Learn from professional DeFi curators:
- **Gauntlet**, **Steakhouse Financial**, **RE7 Labs** profiles
- Each allocation shows **why this asset** and **why this percentage**
- Principle badges show which mental models each curator applies
- Historical performance metrics (return, max drawdown, Sharpe ratio)

#### Welcome Banner
First-time visitors see an intro explaining FABRKNT's learning approach. Dismissible after reading.

### Explore Tab

#### Explore Hero
Overview of available pools with key stats (total pools, low-risk count).

#### Pool Table
Comprehensive pool listing with intelligent defaults:
- Filter by protocol, risk level, TVL
- Sort by TVL, APY, risk score
- APY change alerts (badges when APY drops 20%+ or rises 30%+)
- Watchlist for tracking favorites

#### Pool Comparison & Backtesting
Compare up to 3 pools side-by-side:
- Risk breakdown comparison
- APY sustainability analysis
- **Historical performance backtesting** (7/30/90 days)
- Compounding options (daily, weekly, none)

### Learn Tab

The Learn tab is divided into three sub-sections:

#### Principles
- **Why Learn Curation** — Problem statement and comparison table
- **6 Core Principles** — Expandable cards with examples

#### Practice
- **Strategy Builder** — Build your own allocation strategy
  - Select from available pools
  - Set allocation percentages
  - Get real-time feedback and grading (A-F)
  - Compare your strategy to professional curators
  - **Scenario Simulator** — Stress test with market scenarios:
    - Market crash (-30%)
    - Mild correction (-15%)
    - Bull run (+50%)
    - Rewards ending
    - Stablecoin depeg

#### Compare (Tools)
Card-based tool picker for cleaner navigation:
- **Protocol Comparison** — Compare Kamino, Marginfi, Meteora, etc.
- **LST Comparison** — Compare liquid staking tokens
- **Yield Spreads** — Find arbitrage opportunities
- **Alternative Yields** — Restaking, perp LP, advanced strategies
- **IL Calculator** — Impermanent loss estimation

---

## Learning Flow

FABRKNT is designed around a learning progression:

1. **Understand the principles** — Learn the 6 mental models curators use
2. **Study curator strategies** — See how experts apply these principles
3. **Practice building** — Create your own strategy with feedback
4. **Test before deploying** — Run scenarios to see how your strategy performs

---

## AI-Powered Features

### Smart Risk Insights
AI-generated analysis in plain English (requires login):
- Risk explanation and breakdown
- APY sustainability analysis
- Comparison vs. similar pools
- Actionable verdict

### Portfolio Optimizer
AI suggests optimal allocation (requires login):
- Input total amount and risk tolerance
- Get diversified portfolio suggestions
- View expected yields and risk warnings

---

## Risk Scoring

Our composite risk score (0-100) evaluates:

| Factor | Weight | Description |
|--------|--------|-------------|
| TVL Risk | 25% | Liquidity depth and exit-ability |
| APY Sustainability | 25% | Historical volatility and trends |
| IL Risk | 20% | Impermanent loss exposure for LPs |
| Stablecoin Exposure | 15% | Stability of underlying assets |
| Protocol Maturity | 15% | Age, audits, track record |

**Risk Levels:**
- **Low** (0-20): Conservative, stable yields
- **Medium** (21-40): Balanced risk-reward
- **High** (41+): Higher risk, potentially higher returns

---

## Trust & Security

| Principle | Description |
|-----------|-------------|
| **Read-Only** | We never request wallet permissions |
| **Non-Custodial** | Your keys, your funds. We never touch assets |
| **Transparent** | Our methodology is open. See [How It Works](/how-it-works) |

---

## Pages

- **/** — Main app with Insights, Explore, and Learn tabs
- **/tools** — IL Calculator and Position Simulator (full page)
- **/how-it-works** — Methodology and risk scoring explanation
- **/about** — Team and mission

---

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS
- **AI:** Anthropic Claude API
- **Database:** PostgreSQL (Supabase)
- **Hosting:** Vercel
- **Data Sources:** DeFiLlama APIs, on-chain data

---

## Getting Started

### For Users

1. **Start with Principles** — Learn the 6 mental models in the Insights tab
2. **Study Curator Strategies** — See how experts apply these principles
3. **Practice Building** — Use the Strategy Builder in the Learn tab
4. **Test Your Strategy** — Run scenarios before committing capital
5. **Explore Pools** — Browse the Explore tab when ready to dive deeper
6. **Sign In** — Unlock personalized AI recommendations

### Development

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY, DATABASE_URL, etc.

# Run development server
pnpm dev

# Type check
pnpm type-check

# Build for production
pnpm build
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret

# AI
ANTHROPIC_API_KEY=sk-ant-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## API Endpoints

### Public Endpoints

- `GET /api/curate/defi` — Yield pools with risk scoring
- `GET /api/curate/defi/history/{poolId}` — Historical APY data
- `GET /api/curate/protocols` — Protocol aggregation and comparison
- `GET /api/curate/spreads` — Yield spread opportunities
- `GET /api/curate/curators` — Curator profiles
- `GET /api/curate/curators/{slug}` — Curator strategies and insights
- `POST /api/curate/backtest` — Historical performance backtesting

### Authenticated Endpoints

- `GET /api/curate/ai/preferences` — Get user preferences
- `PUT /api/curate/ai/preferences` — Update preferences
- `POST /api/curate/ai/recommendations` — Get AI recommendations
- `GET /api/curate/ai/insights/{poolId}` — Get AI pool insights
- `POST /api/curate/ai/portfolio` — Optimize portfolio

---

## Team

**Hiroyuki Saito** — Founder
Banking & enterprise software background. AWS certified, Stanford blockchain certification. Building at the intersection of institutional finance and DeFi. Based in Tokyo.

- X (Twitter): [@psyto](https://x.com/psyto)
- LinkedIn: [hiroyuki-saito](https://www.linkedin.com/in/hiroyuki-saito/)

---

## Contact & Resources

- **Website:** [www.fabrknt.com](https://www.fabrknt.com)
- **GitHub:** [github.com/fabrknt](https://github.com/fabrknt)
- **X (Twitter):** [@fabrknt](https://x.com/fabrknt)

---

**Learn how top curators think. Build strategies with confidence.**
