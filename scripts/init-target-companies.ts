/**
 * Initial Target Companies
 * Early-stage startups and emerging protocols (Series A or earlier, or launched within the last 12-18 months)
 * Source: INIT_TARGET.md
 */

export interface TargetCompany {
  name: string;
  slug: string;
  category: "defi" | "infrastructure" | "nft" | "dao" | "gaming";
  chain: "ethereum" | "base" | "arbitrum" | "solana";
  description: string;
  website?: string;
  github?: string;
  twitter?: string;
  contractAddress?: string; // Main contract address for on-chain verification
  tokenAddress?: string; // Token contract if applicable
}

export const INIT_TARGET_COMPANIES: TargetCompany[] = [
  // ========================================
  // ETHEREUM - DeFi Protocols (Early/Niche)
  // ========================================
  {
    name: "Fluid",
    slug: "fluid-instadapp",
    category: "defi",
    chain: "ethereum",
    description: "A new modular DeFi protocol that combines lending, vaults, and smart accounts into one hyper-efficient layer by Instadapp",
    website: "https://fluid.instadapp.io",
    github: "Instadapp",
    twitter: "fluid_protocol",
  },
  {
    name: "Juice Finance",
    slug: "juice-finance",
    category: "defi",
    chain: "ethereum",
    description: "An innovative yield-farming enhancer that allows users to access high-leverage points-farming and yield on top of other protocols",
    website: "https://www.juice.finance",
    twitter: "juice_finance",
  },
  {
    name: "Napier Finance",
    slug: "napier-finance",
    category: "defi",
    chain: "ethereum",
    description: "A liquidity hub for yield trading that introduces a new primitive for yield curves on Ethereum",
    website: "https://napier.finance",
    github: "napierfi",
    twitter: "napierfinance",
  },
  {
    name: "Term Finance",
    slug: "term-finance",
    category: "defi",
    chain: "ethereum",
    description: "A protocol bringing fixed-rate lending to Ethereum through periodic auctions, targeting institutional-style predictability",
    website: "https://term.finance",
    github: "term-finance",
    twitter: "termfinance",
  },
  {
    name: "Peapods Finance",
    slug: "peapods-finance",
    category: "defi",
    chain: "ethereum",
    description: "An emerging Volatility-as-a-Service protocol that enables decentralized index funds with a focus on yield generation",
    website: "https://peapods.finance",
    twitter: "peapods_finance",
  },

  // ========================================
  // ETHEREUM - Infrastructure
  // ========================================
  {
    name: "Adamik",
    slug: "adamik",
    category: "infrastructure",
    chain: "ethereum",
    description: "A universal API startup that allows developers to connect to 40+ blockchains via a single, standardized interface",
    website: "https://adamik.io",
    github: "adamikio",
    twitter: "adamik_io",
  },
  {
    name: "Voltius",
    slug: "voltius",
    category: "infrastructure",
    chain: "ethereum",
    description: "A young US-based startup using AI/ML to automate smart contract audits and threat detection",
    website: "https://voltius.io",
    twitter: "voltius_io",
  },
  {
    name: "Lobby",
    slug: "lobby",
    category: "infrastructure",
    chain: "ethereum",
    description: "A developer-focused tool building social infrastructure for DAOs and on-chain organizations",
    website: "https://lobby.so",
    github: "lobby-so",
    twitter: "lobby_so",
  },
  {
    name: "Lagrange",
    slug: "lagrange",
    category: "infrastructure",
    chain: "ethereum",
    description: "A ZK-infrastructure project enabling cross-chain state proofs, allowing dApps to prove data from one chain to another securely",
    website: "https://lagrange.dev",
    github: "Lagrange-Labs",
    twitter: "lagrangedev",
  },
  {
    name: "Spire",
    slug: "spire",
    category: "infrastructure",
    chain: "ethereum",
    description: "A Rollup-as-a-service focused on app-specific L3s that settle directly to Ethereum or its major L2s",
    website: "https://spire.dev",
    twitter: "spire_labs",
  },

  // ========================================
  // BASE - DeFi Protocols (Emerging)
  // ========================================
  {
    name: "Avantis",
    slug: "avantis",
    category: "defi",
    chain: "base",
    description: "A young, high-leverage synthetic perpetuals protocol built natively for the Base ecosystem",
    website: "https://avantis.io",
    github: "avantis-labs",
    twitter: "avantisfi",
  },
  {
    name: "Concentric",
    slug: "concentric",
    category: "defi",
    chain: "base",
    description: "Automated liquidity manager built on top of Aerodrome's Slipstream LPs on Base",
    website: "https://concentric.fi",
    twitter: "concentric_fi",
  },
  {
    name: "Infinex",
    slug: "infinex",
    category: "defi",
    chain: "base",
    description: "A user-layer DeFi project by Synthetix founders designed to make Base feel like a centralized exchange for retail users",
    website: "https://infinex.io",
    github: "infinex-io",
    twitter: "infinex_app",
  },
  {
    name: "Steakhouse Financial",
    slug: "steakhouse-financial",
    category: "defi",
    chain: "base",
    description: "Building managed lending vaults on Morpho Blue Base deployments",
    website: "https://steakhouse.financial",
    twitter: "SteakhouseFi",
  },
  {
    name: "Swaap",
    slug: "swaap",
    category: "defi",
    chain: "base",
    description: "A market-making protocol that protects liquidity providers from toxic flow (arbitrageurs)",
    website: "https://swaap.finance",
    github: "swaap-labs",
    twitter: "Swaap_Finance",
  },

  // ========================================
  // BASE - Infrastructure
  // ========================================
  {
    name: "Goldsky",
    slug: "goldsky",
    category: "infrastructure",
    chain: "base",
    description: "A real-time data indexing company that has become the subgraph alternative of choice for the Base community",
    website: "https://goldsky.com",
    github: "goldsky-io",
    twitter: "goldskycom",
  },
  {
    name: "Pimlico",
    slug: "pimlico",
    category: "infrastructure",
    chain: "base",
    description: "The current leader in ERC-4337 (Account Abstraction) infrastructure, making gasless apps possible on Base",
    website: "https://pimlico.io",
    github: "pimlicolabs",
    twitter: "pimlicoHQ",
  },
  {
    name: "Openfort",
    slug: "openfort",
    category: "infrastructure",
    chain: "base",
    description: "A Wallet-as-a-Service provider that helps game developers on Base hide the blockchain from their users",
    website: "https://openfort.xyz",
    github: "openfort-xyz",
    twitter: "openfortxyz",
  },
  {
    name: "Daimo",
    slug: "daimo",
    category: "infrastructure",
    chain: "base",
    description: "A young startup building a P2P payment app (Venmo-style) using stablecoins natively on the Base network",
    website: "https://daimo.com",
    github: "daimo-eth",
    twitter: "daimo_eth",
  },
  {
    name: "Blockscout Base",
    slug: "blockscout-base",
    category: "infrastructure",
    chain: "base",
    description: "The open-source explorer team, which remains a small, mission-driven alternative to Etherscan for Base",
    website: "https://base.blockscout.com",
    github: "blockscout",
    twitter: "blockscoutcom",
  },

  // ========================================
  // ARBITRUM - DeFi Protocols
  // ========================================
  {
    name: "Hyperliquid",
    slug: "hyperliquid",
    category: "defi",
    chain: "arbitrum",
    description: "A fast-growing, high-performance perpetual DEX that operates on its own dedicated L1/L3 stack",
    website: "https://hyperliquid.xyz",
    twitter: "HyperliquidX",
  },
  {
    name: "Dolomite",
    slug: "dolomite",
    category: "defi",
    chain: "arbitrum",
    description: "A next-generation money market and DEX that allows for yield-bearing collateral—a step beyond traditional lending",
    website: "https://dolomite.io",
    github: "dolomite-exchange",
    twitter: "dolomite_io",
  },
  {
    name: "Contango",
    slug: "contango",
    category: "defi",
    chain: "arbitrum",
    description: "A unique protocol that builds perpetuals out of spot lending markets (like Aave) to offer lower rates",
    website: "https://contango.xyz",
    github: "contango-xyz",
    twitter: "contango_xyz",
  },
  {
    name: "Ramses Exchange",
    slug: "ramses-exchange",
    category: "defi",
    chain: "arbitrum",
    description: "A ve(3,3) DEX (similar to Aerodrome) but focused on the Arbitrum ecosystem and its unique L3 chains",
    website: "https://ramses.exchange",
    twitter: "RamsesExchange",
  },
  {
    name: "Winr Protocol",
    slug: "winr-protocol",
    category: "defi",
    chain: "arbitrum",
    description: "A decentralized gaming-liquidity engine that powers on-chain betting and casino-style dApps on Arbitrum",
    website: "https://winr.games",
    github: "WINRLabs",
    twitter: "WINRProtocol",
  },

  // ========================================
  // ARBITRUM - Infrastructure
  // ========================================
  {
    name: "Zeeve",
    slug: "zeeve",
    category: "infrastructure",
    chain: "arbitrum",
    description: "A specialized Rollup-as-a-Service that helps small teams launch their own Arbitrum Orbit chains in minutes",
    website: "https://zeeve.io",
    twitter: "zeeve_io",
  },
  {
    name: "Espresso Systems",
    slug: "espresso-systems",
    category: "infrastructure",
    chain: "arbitrum",
    description: "Developing a Shared Sequencer to help all the new Arbitrum Orbit chains talk to each other without delays",
    website: "https://espressosys.com",
    github: "EspressoSystems",
    twitter: "EspressoSys",
  },
  {
    name: "AltLayer",
    slug: "altlayer",
    category: "infrastructure",
    chain: "arbitrum",
    description: "A Restaked Rollup provider that adds a layer of security to small Arbitrum-based chains",
    website: "https://altlayer.io",
    github: "alt-research",
    twitter: "alt_layer",
  },
  {
    name: "Gelato",
    slug: "gelato",
    category: "infrastructure",
    chain: "arbitrum",
    description: "Relay and Functions tools specifically being used by young Arbitrum projects to automate complex tasks",
    website: "https://gelato.network",
    github: "gelatodigital",
    twitter: "gelatonetwork",
  },
  {
    name: "Caldera",
    slug: "caldera",
    category: "infrastructure",
    chain: "arbitrum",
    description: "One of the main providers for Arbitrum Orbit infrastructure, helping small projects manage their own dedicated blockspace",
    website: "https://caldera.xyz",
    github: "calderachain",
    twitter: "Calderaxyz",
  },

  // ========================================
  // SOLANA - DeFi Protocols
  // ========================================
  {
    name: "Sanctum",
    slug: "sanctum",
    category: "defi",
    chain: "solana",
    description: "A protocol building the Liquid Staking Infinity layer, allowing anyone to create their own liquid staking token (LST)",
    website: "https://sanctum.so",
    twitter: "sanctumso",
  },
  {
    name: "Parcl",
    slug: "parcl",
    category: "defi",
    chain: "solana",
    description: "A real-estate focused DeFi platform that lets users trade square footage prices of global cities",
    website: "https://parcl.co",
    twitter: "Parcl",
  },
  {
    name: "Flash Trade",
    slug: "flash-trade",
    category: "defi",
    chain: "solana",
    description: "A younger, asset-backed perpetual exchange that uses a pool model for high-efficiency trading",
    website: "https://flash.trade",
    twitter: "FlashTrade_",
  },
  {
    name: "Phoenix",
    slug: "phoenix-ellipsis",
    category: "defi",
    chain: "solana",
    description: "A fully on-chain, limit order book DEX by Ellipsis Labs that is significantly faster and more lean than previous iterations",
    website: "https://phoenix.trade",
    github: "Ellipsis-Labs",
    twitter: "Phoenix_WS",
  },
  {
    name: "Meteora",
    slug: "meteora",
    category: "defi",
    chain: "solana",
    description: "A dynamic liquidity provider protocol focused on maximizing yield for LPs through DLMM (Dynamic Liquidity Market Maker) technology",
    website: "https://meteora.ag",
    twitter: "MeteoraAG",
  },

  // ========================================
  // SOLANA - Infrastructure
  // ========================================
  {
    name: "Helius",
    slug: "helius",
    category: "infrastructure",
    chain: "solana",
    description: "A small but dominant team providing the developer platform for Solana (RPCs, Webhooks, and data APIs)",
    website: "https://helius.dev",
    github: "helius-labs",
    twitter: "heliuslabs",
  },
  {
    name: "Ironforge",
    slug: "ironforge",
    category: "infrastructure",
    chain: "solana",
    description: "A cloud-based developer platform that simplifies the deployment and monitoring of Solana programs",
    website: "https://ironforge.cloud",
    twitter: "ironforge_cloud",
  },
  {
    name: "Anza",
    slug: "anza",
    category: "infrastructure",
    chain: "solana",
    description: "A new, small development entity by Armani Ferrante focused solely on the core optimization of the Solana validator client",
    website: "https://anza.xyz",
    github: "anza-xyz",
    twitter: "anza_xyz",
  },
  {
    name: "Clockwork",
    slug: "clockwork",
    category: "infrastructure",
    chain: "solana",
    description: "A smart contract automation engine for Solana, allowing for scheduled tasks and event-driven triggers",
    website: "https://clockwork.xyz",
    github: "clockwork-xyz",
    twitter: "clockwork_xyz",
  },
  {
    name: "Squads",
    slug: "squads",
    category: "infrastructure",
    chain: "solana",
    description: "The infrastructure behind most Solana treasuries; a multi-sig and smart account platform for teams",
    website: "https://squads.so",
    github: "Squads-Protocol",
    twitter: "SquadsProtocol",
  },
];

export default INIT_TARGET_COMPANIES;
