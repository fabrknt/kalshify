/**
 * Company Configuration Registry
 * Single source of truth for all company metadata
 */

import { CompanyCategory, CompanySubcategory, Chain } from "./companies";

export type SupportedChain =
    | "ethereum"
    | "solana"
    | "polygon"
    | "arbitrum"
    | "optimism"
    | "base";

export interface CompanyConfig {
    // Core identifiers
    slug: string;
    name: string;
    category: CompanyCategory;
    subcategory?: CompanySubcategory;
    chains?: Chain[]; // Multi-chain support (if not specified, uses onchain.chain)

    // Display metadata
    description: string;
    logo: string;
    website: string;

    // API identifiers
    github: {
        org: string;
        customMetricsFunction?: "getUniswapMetrics" | "getFabrkntMetrics";
    };
    twitter: {
        handle: string;
    };
    onchain: {
        chain: SupportedChain;
        address: string;
        customMetricsFunction?:
            | "getUniswapMetrics"
            | "getJupiterMetrics"
            | "getKaminoMetrics"
            | "getDriftMetrics"
            | "getOrcaMetrics"
            | "getMarginFiMetrics";
    };

    // Optional URLs for news crawling
    blogUrl?: string;
    mediumUrl?: string;

    // Special behavior flags
    features?: {
        useCrawler?: boolean; // For companies like Fabrknt
        hasTVL?: boolean; // For DeFi companies
        hasVolume?: boolean; // For NFT/DeFi companies
    };

    // Static display values (placeholders)
    defaults?: {
        walletGrowth?: number;
        userGrowthRate?: number;
        codeQuality?: number;
        trend?: "up" | "stable" | "down";
        tvl?: number;
    };
}

export const COMPANY_CONFIGS: CompanyConfig[] = [
    {
        slug: "adamik",
        name: "Adamik",
        category: "infrastructure",
        subcategory: "dev-tools",
        description:
            "A universal API startup that allows developers to connect to 40+ blockchains via a single, standardized interface",
        logo: "🔌",
        website: "https://adamik.io",
        github: {
            org: "adamikio",
        },
        twitter: {
            handle: "adamikio",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 15,
            userGrowthRate: 15,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "altlayer",
        name: "AltLayer",
        category: "infrastructure",
        subcategory: "l2",
        description:
            "A Restaked Rollup provider that adds a layer of security to small Arbitrum-based chains",
        logo: "🔒",
        website: "https://altlayer.io",
        github: {
            org: "alt-research",
        },
        twitter: {
            handle: "alt_layer",
        },
        onchain: {
            chain: "arbitrum",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 18,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "anza",
        name: "Anza",
        category: "infrastructure",
        subcategory: "dev-tools",
        description:
            "A new, small development entity by Armani Ferrante focused solely on the core optimization of the Solana validator client",
        logo: "⚡",
        website: "https://anza.xyz",
        github: {
            org: "anza-xyz",
        },
        twitter: {
            handle: "anza_xyz",
        },
        onchain: {
            chain: "solana",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 15,
            userGrowthRate: 12,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "avantis",
        name: "Avantis",
        category: "defi",
        subcategory: "derivatives",
        description:
            "A young, high-leverage synthetic perpetuals protocol built natively for the Base ecosystem",
        logo: "📈",
        website: "https://avantis.io",
        github: {
            org: "avantis-labs",
        },
        twitter: {
            handle: "AvantisLabs",
        },
        onchain: {
            chain: "base",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
            hasVolume: true,
        },
        defaults: {
            walletGrowth: 25,
            userGrowthRate: 22,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "blockscout-base",
        name: "Blockscout Base",
        category: "infrastructure",
        subcategory: "analytics",
        description:
            "The open-source explorer team, which remains a small, mission-driven alternative to Etherscan for Base",
        logo: "🔍",
        website: "https://base.blockscout.com",
        github: {
            org: "blockscout",
        },
        twitter: {
            handle: "blockscoutcom",
        },
        onchain: {
            chain: "base",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 18,
            userGrowthRate: 16,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "caldera",
        name: "Caldera",
        category: "infrastructure",
        subcategory: "l2",
        description:
            "One of the main providers for Arbitrum Orbit infrastructure, helping small projects manage their own dedicated blockspace",
        logo: "🌋",
        website: "https://caldera.xyz",
        github: {
            org: "calderachain",
        },
        twitter: {
            handle: "caldera",
        },
        onchain: {
            chain: "arbitrum",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 18,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "clockwork",
        name: "Clockwork",
        category: "infrastructure",
        subcategory: "dev-tools",
        description:
            "A smart contract automation engine for Solana, allowing for scheduled tasks and event-driven triggers",
        logo: "⏰",
        website: "https://clockwork.xyz",
        github: {
            org: "clockwork-xyz",
        },
        twitter: {
            handle: "clockwork_xyz",
        },
        onchain: {
            chain: "solana",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 15,
            userGrowthRate: 14,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "concentric",
        name: "Concentric",
        category: "defi",
        subcategory: "yield",
        description:
            "Automated liquidity manager built on top of Aerodrome's Slipstream LPs on Base",
        logo: "🎯",
        website: "https://concentric.fi",
        github: {
            org: "concentric-fi",
        },
        twitter: {
            handle: "ConcentricFi",
        },
        onchain: {
            chain: "base",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 18,
            userGrowthRate: 16,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "contango",
        name: "Contango",
        category: "defi",
        subcategory: "derivatives",
        description:
            "A unique protocol that builds perpetuals out of spot lending markets (like Aave) to offer lower rates",
        logo: "🔄",
        website: "https://contango.xyz",
        github: {
            org: "contango-xyz",
        },
        twitter: {
            handle: "contangoxyz",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 16,
            userGrowthRate: 15,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "daimo",
        name: "Daimo",
        category: "infrastructure",
        subcategory: "wallet",
        description:
            "A young startup building a P2P payment app (Venmo-style) using stablecoins natively on the Base network",
        logo: "💸",
        website: "https://daimo.com",
        github: {
            org: "daimo-eth",
        },
        twitter: {
            handle: "daimo",
        },
        onchain: {
            chain: "base",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 22,
            userGrowthRate: 20,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "dolomite",
        name: "Dolomite",
        category: "defi",
        subcategory: "lending",
        description:
            "A next-generation money market and DEX that allows for yield-bearing collateral—a step beyond traditional lending",
        logo: "💎",
        website: "https://dolomite.io",
        github: {
            org: "dolomite-exchange",
        },
        twitter: {
            handle: "DolomiteProtocol",
        },
        onchain: {
            chain: "arbitrum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 18,
            userGrowthRate: 16,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "espresso-systems",
        name: "Espresso Systems",
        category: "infrastructure",
        subcategory: "l2",
        description:
            "Developing a Shared Sequencer to help all the new Arbitrum Orbit chains talk to each other without delays",
        logo: "☕",
        website: "https://espressosys.com",
        github: {
            org: "EspressoSystems",
        },
        twitter: {
            handle: "EspressoSys",
        },
        onchain: {
            chain: "arbitrum",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 15,
            userGrowthRate: 14,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "flash-trade",
        name: "Flash Trade",
        category: "defi",
        subcategory: "derivatives",
        description:
            "A younger, asset-backed perpetual exchange that uses a pool model for high-efficiency trading",
        logo: "⚡",
        website: "https://flash.trade",
        github: {
            org: "flash-trade",
        },
        twitter: {
            handle: "FlashTrade_",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
            hasVolume: true,
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 18,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "fluid-instadapp",
        name: "Fluid",
        category: "defi",
        subcategory: "lending",
        description:
            "A new modular DeFi protocol that combines lending, vaults, and smart accounts into one hyper-efficient layer by Instadapp",
        logo: "💧",
        website: "https://fluid.instadapp.io",
        github: {
            org: "Instadapp",
        },
        twitter: {
            handle: "Instadapp",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 18,
            userGrowthRate: 16,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "gelato",
        name: "Gelato",
        category: "infrastructure",
        subcategory: "dev-tools",
        description:
            "Relay and Functions tools specifically being used by young Arbitrum projects to automate complex tasks",
        logo: "🍦",
        website: "https://gelato.network",
        github: {
            org: "gelatodigital",
        },
        twitter: {
            handle: "gelatonetwork",
        },
        onchain: {
            chain: "arbitrum",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 18,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "goldsky",
        name: "Goldsky",
        category: "infrastructure",
        subcategory: "data",
        description:
            "A real-time data indexing company that has become the subgraph alternative of choice for the Base community",
        logo: "🌟",
        website: "https://goldsky.com",
        github: {
            org: "goldsky-io",
        },
        twitter: {
            handle: "goldskycom",
        },
        onchain: {
            chain: "base",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 22,
            userGrowthRate: 20,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "helius",
        name: "Helius",
        category: "infrastructure",
        subcategory: "data",
        description:
            "A small but dominant team providing the developer platform for Solana (RPCs, Webhooks, and data APIs)",
        logo: "☀️",
        website: "https://helius.dev",
        github: {
            org: "helius-labs",
        },
        twitter: {
            handle: "heliuslabs",
        },
        onchain: {
            chain: "solana",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 25,
            userGrowthRate: 22,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "hyperliquid",
        name: "Hyperliquid",
        category: "defi",
        subcategory: "derivatives",
        description:
            "A fast-growing, high-performance perpetual DEX that operates on its own dedicated L1/L3 stack",
        logo: "💧",
        website: "https://hyperliquid.xyz",
        github: {
            org: "hyperliquid-dex",
        },
        twitter: {
            handle: "HyperliquidX",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
            hasVolume: true,
        },
        defaults: {
            walletGrowth: 30,
            userGrowthRate: 28,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "infinex",
        name: "Infinex",
        category: "defi",
        subcategory: "dex",
        description:
            "A user-layer DeFi project by Synthetix founders designed to make Base feel like a centralized exchange for retail users",
        logo: "∞",
        website: "https://infinex.io",
        github: {
            org: "infinex-xyz",
        },
        twitter: {
            handle: "infinex_app",
        },
        onchain: {
            chain: "base",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 24,
            userGrowthRate: 22,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "ironforge",
        name: "Ironforge",
        category: "infrastructure",
        subcategory: "dev-tools",
        description:
            "A cloud-based developer platform that simplifies the deployment and monitoring of Solana programs",
        logo: "🔨",
        website: "https://ironforge.cloud",
        github: {
            org: "ironforge-cloud",
        },
        twitter: {
            handle: "ironforgecloud",
        },
        onchain: {
            chain: "solana",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 18,
            userGrowthRate: 16,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "juice-finance",
        name: "Juice Finance",
        category: "defi",
        subcategory: "yield",
        description:
            "An innovative yield-farming enhancer that allows users to access high-leverage points-farming and yield on top of other protocols",
        logo: "🧃",
        website: "https://www.juice.finance",
        github: {
            org: "juice-finance",
        },
        twitter: {
            handle: "JuiceFinance",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 18,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "lagrange",
        name: "Lagrange",
        category: "infrastructure",
        subcategory: "security",
        description:
            "A ZK-infrastructure project enabling cross-chain state proofs, allowing dApps to prove data from one chain to another securely",
        logo: "🔐",
        website: "https://lagrange.dev",
        github: {
            org: "lagrange-labs",
        },
        twitter: {
            handle: "lagrangedev",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 16,
            userGrowthRate: 14,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "lobby",
        name: "Lobby",
        category: "infrastructure",
        subcategory: "identity",
        description:
            "A developer-focused tool building social infrastructure for DAOs and on-chain organizations",
        logo: "🏛️",
        website: "https://lobby.so",
        github: {
            org: "lobby-so",
        },
        twitter: {
            handle: "lobbyso",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 15,
            userGrowthRate: 14,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "meteora",
        name: "Meteora",
        category: "defi",
        subcategory: "dex",
        description:
            "A dynamic liquidity provider protocol focused on maximizing yield for LPs through DLMM (Dynamic Liquidity Market Maker) technology",
        logo: "🌠",
        website: "https://meteora.ag",
        github: {
            org: "MeteoraAg",
        },
        twitter: {
            handle: "MeteoraAG",
        },
        onchain: {
            chain: "solana",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 22,
            userGrowthRate: 20,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "napier-finance",
        name: "Napier Finance",
        category: "defi",
        subcategory: "yield",
        description:
            "A liquidity hub for yield trading that introduces a new primitive for yield curves on Ethereum",
        logo: "📊",
        website: "https://napier.finance",
        github: {
            org: "napier-v2",
        },
        twitter: {
            handle: "napierfinance",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 16,
            userGrowthRate: 15,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "openfort",
        name: "Openfort",
        category: "infrastructure",
        subcategory: "wallet",
        description:
            "A Wallet-as-a-Service provider that helps game developers on Base hide the blockchain from their users",
        logo: "🎮",
        website: "https://openfort.xyz",
        github: {
            org: "openfort-xyz",
        },
        twitter: {
            handle: "openfortxyz",
        },
        onchain: {
            chain: "base",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 18,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "parcl",
        name: "Parcl",
        category: "defi",
        subcategory: "rwa",
        description:
            "A real-estate focused DeFi platform that lets users trade square footage prices of global cities",
        logo: "🏘️",
        website: "https://parcl.co",
        github: {
            org: "ParclFinance",
        },
        twitter: {
            handle: "Parcl",
        },
        onchain: {
            chain: "solana",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 18,
            userGrowthRate: 16,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "peapods-finance",
        name: "Peapods Finance",
        category: "defi",
        subcategory: "yield",
        description:
            "An emerging Volatility-as-a-Service protocol that enables decentralized index funds with a focus on yield generation",
        logo: "🫛",
        website: "https://peapods.finance",
        github: {
            org: "peapods-finance",
        },
        twitter: {
            handle: "PeapodsFinance",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 15,
            userGrowthRate: 14,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "phoenix-ellipsis",
        name: "Phoenix",
        category: "defi",
        subcategory: "dex",
        description:
            "A fully on-chain, limit order book DEX by Ellipsis Labs that is significantly faster and more lean than previous iterations",
        logo: "🔥",
        website: "https://phoenix.trade",
        github: {
            org: "Ellipsis-Labs",
        },
        twitter: {
            handle: "PhoenixTrade",
        },
        onchain: {
            chain: "solana",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
            hasVolume: true,
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 18,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "pimlico",
        name: "Pimlico",
        category: "infrastructure",
        subcategory: "wallet",
        description:
            "The current leader in ERC-4337 (Account Abstraction) infrastructure, making gasless apps possible on Base",
        logo: "🔑",
        website: "https://pimlico.io",
        github: {
            org: "pimlicolabs",
        },
        twitter: {
            handle: "pimlicoHQ",
        },
        onchain: {
            chain: "base",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 22,
            userGrowthRate: 20,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "ramses-exchange",
        name: "Ramses Exchange",
        category: "defi",
        subcategory: "dex",
        description:
            "A ve(3,3) DEX (similar to Aerodrome) but focused on the Arbitrum ecosystem and its unique L3 chains",
        logo: "🏛️",
        website: "https://ramses.exchange",
        github: {
            org: "RamsesExchange",
        },
        twitter: {
            handle: "RamsesExchange",
        },
        onchain: {
            chain: "arbitrum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 18,
            userGrowthRate: 16,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "sanctum",
        name: "Sanctum",
        category: "defi",
        subcategory: "liquid-staking",
        description:
            "A protocol building the Liquid Staking Infinity layer, allowing anyone to create their own liquid staking token (LST)",
        logo: "⛪",
        website: "https://sanctum.so",
        github: {
            org: "sanctumlabs",
        },
        twitter: {
            handle: "sanctumso",
        },
        onchain: {
            chain: "solana",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 18,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "spire",
        name: "Spire",
        category: "infrastructure",
        subcategory: "l2",
        description:
            "A Rollup-as-a-service focused on app-specific L3s that settle directly to Ethereum or its major L2s",
        logo: "🗼",
        website: "https://spire.dev",
        github: {
            org: "spire-labs",
        },
        twitter: {
            handle: "spiredev",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 16,
            userGrowthRate: 14,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "squads",
        name: "Squads",
        category: "infrastructure",
        subcategory: "wallet",
        description:
            "The infrastructure behind most Solana treasuries; a multi-sig and smart account platform for teams",
        logo: "👥",
        website: "https://squads.so",
        github: {
            org: "Squads-Protocol",
        },
        twitter: {
            handle: "SquadsProtocol",
        },
        onchain: {
            chain: "solana",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 18,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "steakhouse-financial",
        name: "Steakhouse Financial",
        category: "defi",
        subcategory: "lending",
        description:
            "Building managed lending vaults on Morpho Blue Base deployments",
        logo: "🥩",
        website: "https://steakhouse.financial",
        github: {
            org: "steakhouse-financial",
        },
        twitter: {
            handle: "SteakhouseFi",
        },
        onchain: {
            chain: "base",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 16,
            userGrowthRate: 15,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "swaap",
        name: "Swaap",
        category: "defi",
        subcategory: "dex",
        description:
            "A market-making protocol that protects liquidity providers from toxic flow (arbitrageurs)",
        logo: "🔀",
        website: "https://swaap.finance",
        github: {
            org: "swaap-labs",
        },
        twitter: {
            handle: "Swaap_Protocol",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 15,
            userGrowthRate: 14,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "term-finance",
        name: "Term Finance",
        category: "defi",
        subcategory: "lending",
        description:
            "A protocol bringing fixed-rate lending to Ethereum through periodic auctions, targeting institutional-style predictability",
        logo: "📅",
        website: "https://term.finance",
        github: {
            org: "term-finance",
        },
        twitter: {
            handle: "TermFinance",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 15,
            userGrowthRate: 14,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "voltius",
        name: "Voltius",
        category: "infrastructure",
        subcategory: "security",
        description:
            "A young US-based startup using AI/ML to automate smart contract audits and threat detection",
        logo: "🛡️",
        website: "https://voltius.io",
        github: {
            org: "voltius-labs",
        },
        twitter: {
            handle: "voltiuslabs",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 16,
            userGrowthRate: 15,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "winr-protocol",
        name: "Winr Protocol",
        category: "defi",
        subcategory: "derivatives",
        description:
            "A decentralized gaming-liquidity engine that powers on-chain betting and casino-style dApps on Arbitrum",
        logo: "🎲",
        website: "https://winr.games",
        github: {
            org: "WINRProtocol",
        },
        twitter: {
            handle: "winr_protocol",
        },
        onchain: {
            chain: "arbitrum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 18,
            userGrowthRate: 16,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "zeeve",
        name: "Zeeve",
        category: "infrastructure",
        subcategory: "l2",
        description:
            "A specialized Rollup-as-a-Service that helps small teams launch their own Arbitrum Orbit chains in minutes",
        logo: "⚙️",
        website: "https://zeeve.io",
        github: {
            org: "Zeeve-App",
        },
        twitter: {
            handle: "ZeeveInc",
        },
        onchain: {
            chain: "arbitrum",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 16,
            userGrowthRate: 15,
            codeQuality: 85,
            trend: "up",
        },
    },
    // ============================================
    // OPTIMISM PROJECTS (16 new)
    // ============================================
    {
        slug: "sonne-finance",
        name: "Sonne Finance",
        category: "defi",
        subcategory: "lending",
        description:
            "Native Optimism lending market, a Compound fork with ve tokenomics for governance",
        logo: "☀️",
        website: "https://sonne.finance",
        github: {
            org: "sonne-finance",
        },
        twitter: {
            handle: "SonneFinance",
        },
        onchain: {
            chain: "optimism",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 18,
            userGrowthRate: 16,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "exactly-protocol",
        name: "Exactly Protocol",
        category: "defi",
        subcategory: "lending",
        description:
            "Fixed-rate lending protocol with variable rate optimization for predictable borrowing costs",
        logo: "📐",
        website: "https://exact.ly",
        github: {
            org: "exactly",
        },
        twitter: {
            handle: "ExactlyProtocol",
        },
        onchain: {
            chain: "optimism",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 17,
            userGrowthRate: 15,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "pika-protocol",
        name: "Pika Protocol",
        category: "defi",
        subcategory: "derivatives",
        description:
            "Perpetual exchange with low fees and deep liquidity, native to Optimism",
        logo: "⚡",
        website: "https://pikaprotocol.com",
        github: {
            org: "pika-protocol",
        },
        twitter: {
            handle: "PikaProtocol",
        },
        onchain: {
            chain: "optimism",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
            hasVolume: true,
        },
        defaults: {
            walletGrowth: 16,
            userGrowthRate: 14,
            codeQuality: 85,
            trend: "stable",
        },
    },
    {
        slug: "synthetix",
        name: "Synthetix",
        category: "defi",
        subcategory: "derivatives",
        description:
            "Synthetic assets protocol providing liquidity for derivatives, heavily focused on Optimism after migration",
        logo: "💠",
        website: "https://synthetix.io",
        github: {
            org: "Synthetixio",
        },
        twitter: {
            handle: "synthetix_io",
        },
        onchain: {
            chain: "optimism",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 15,
            userGrowthRate: 12,
            codeQuality: 90,
            trend: "stable",
        },
    },
    {
        slug: "beethoven-x",
        name: "Beethoven X",
        category: "defi",
        subcategory: "dex",
        description:
            "Balancer-style weighted pools DEX with yield optimization on Optimism",
        logo: "🎼",
        website: "https://beets.fi",
        github: {
            org: "beethovenxfi",
        },
        twitter: {
            handle: "beethaborz",
        },
        onchain: {
            chain: "optimism",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 14,
            userGrowthRate: 12,
            codeQuality: 85,
            trend: "stable",
        },
    },
    {
        slug: "granary-finance",
        name: "Granary Finance",
        category: "defi",
        subcategory: "lending",
        description:
            "Aave fork focused on emerging assets and yield opportunities across multiple chains",
        logo: "🌾",
        website: "https://granary.finance",
        github: {
            org: "granary-finance",
        },
        twitter: {
            handle: "GranaryFinance",
        },
        onchain: {
            chain: "optimism",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 15,
            userGrowthRate: 13,
            codeQuality: 82,
            trend: "stable",
        },
    },
    {
        slug: "extra-finance",
        name: "Extra Finance",
        category: "defi",
        subcategory: "yield",
        description:
            "Leveraged yield farming protocol enabling up to 7x leverage on LP positions",
        logo: "➕",
        website: "https://extra.finance",
        github: {
            org: "extrafi",
        },
        twitter: {
            handle: "extraaborz",
        },
        onchain: {
            chain: "optimism",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 18,
            userGrowthRate: 16,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "thales",
        name: "Thales",
        category: "defi",
        subcategory: "derivatives",
        description:
            "Binary options and sports betting protocol built on Synthetix liquidity",
        logo: "🎯",
        website: "https://thalesmarket.io",
        github: {
            org: "thales-markets",
        },
        twitter: {
            handle: "thabormarkets",
        },
        onchain: {
            chain: "optimism",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 16,
            userGrowthRate: 14,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "conduit",
        name: "Conduit",
        category: "infrastructure",
        subcategory: "l2",
        description:
            "Rollup deployment platform making it easy to launch OP Stack and Arbitrum Orbit chains",
        logo: "🔧",
        website: "https://conduit.xyz",
        github: {
            org: "conduit-xyz",
        },
        twitter: {
            handle: "condaborxyz",
        },
        onchain: {
            chain: "optimism",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 22,
            userGrowthRate: 20,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "lattice",
        name: "Lattice",
        category: "infrastructure",
        subcategory: "dev-tools",
        description:
            "MUD framework creators building infrastructure for fully on-chain games and autonomous worlds",
        logo: "🎮",
        website: "https://lattice.xyz",
        github: {
            org: "latticexyz",
        },
        twitter: {
            handle: "latticexyz",
        },
        onchain: {
            chain: "optimism",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 18,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "socket",
        name: "Socket",
        category: "infrastructure",
        subcategory: "dev-tools",
        description:
            "Cross-chain infrastructure providing bridging and interoperability solutions",
        logo: "🔌",
        website: "https://socket.tech",
        github: {
            org: "SocketDotTech",
        },
        twitter: {
            handle: "SocketDotTech",
        },
        onchain: {
            chain: "optimism",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 18,
            userGrowthRate: 16,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "layer3",
        name: "Layer3",
        category: "infrastructure",
        subcategory: "identity",
        description:
            "Quest and credential platform helping projects distribute tokens and build communities",
        logo: "🏆",
        website: "https://layer3.xyz",
        github: {
            org: "layer3xyz",
        },
        twitter: {
            handle: "layer3xyz",
        },
        onchain: {
            chain: "optimism",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 22,
            userGrowthRate: 20,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "galxe",
        name: "Galxe",
        category: "infrastructure",
        subcategory: "identity",
        description:
            "On-chain credential network for building and verifying digital identity",
        logo: "🌌",
        website: "https://galxe.com",
        github: {
            org: "galxe",
        },
        twitter: {
            handle: "Galxe",
        },
        onchain: {
            chain: "optimism",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 18,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "dune-analytics",
        name: "Dune Analytics",
        category: "infrastructure",
        subcategory: "data",
        description:
            "Community-powered blockchain analytics platform with SQL-based queries",
        logo: "📊",
        website: "https://dune.com",
        github: {
            org: "duneanalytics",
        },
        twitter: {
            handle: "DuneAnalytics",
        },
        onchain: {
            chain: "optimism",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 18,
            userGrowthRate: 16,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "chainlink-optimism",
        name: "Chainlink",
        category: "infrastructure",
        subcategory: "data",
        description:
            "Decentralized oracle network providing price feeds and verifiable randomness",
        logo: "🔗",
        website: "https://chain.link",
        github: {
            org: "smartcontractkit",
        },
        twitter: {
            handle: "chainlink",
        },
        onchain: {
            chain: "optimism",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 15,
            userGrowthRate: 12,
            codeQuality: 92,
            trend: "stable",
        },
    },
    {
        slug: "op-labs",
        name: "OP Labs",
        category: "infrastructure",
        subcategory: "l2",
        description:
            "Core development team building the OP Stack and Optimism ecosystem",
        logo: "🔴",
        website: "https://optimism.io",
        github: {
            org: "ethereum-optimism",
        },
        twitter: {
            handle: "Optimism",
        },
        onchain: {
            chain: "optimism",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 18,
            codeQuality: 92,
            trend: "up",
        },
    },
    // ============================================
    // POLYGON PROJECTS (16 new)
    // ============================================
    {
        slug: "quickswap",
        name: "QuickSwap",
        category: "defi",
        subcategory: "dex",
        description:
            "Leading DEX on Polygon with DragonLair staking and concentrated liquidity",
        logo: "🐉",
        website: "https://quickswap.exchange",
        github: {
            org: "QuickSwap",
        },
        twitter: {
            handle: "QuickswapDEX",
        },
        onchain: {
            chain: "polygon",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
            hasVolume: true,
        },
        defaults: {
            walletGrowth: 16,
            userGrowthRate: 14,
            codeQuality: 85,
            trend: "stable",
        },
    },
    {
        slug: "gains-network",
        name: "Gains Network",
        category: "defi",
        subcategory: "derivatives",
        description:
            "Decentralized leveraged trading platform with synthetic assets and low fees",
        logo: "📈",
        website: "https://gains.trade",
        github: {
            org: "GainsNetwork",
        },
        twitter: {
            handle: "GainsNetwork_io",
        },
        onchain: {
            chain: "polygon",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
            hasVolume: true,
        },
        defaults: {
            walletGrowth: 18,
            userGrowthRate: 16,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "beefy-finance",
        name: "Beefy Finance",
        category: "defi",
        subcategory: "yield",
        description:
            "Multi-chain yield optimizer with auto-compounding vaults across 20+ chains",
        logo: "🐮",
        website: "https://beefy.com",
        github: {
            org: "beefyfinance",
        },
        twitter: {
            handle: "beaborfinance",
        },
        onchain: {
            chain: "polygon",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 15,
            userGrowthRate: 13,
            codeQuality: 88,
            trend: "stable",
        },
    },
    {
        slug: "gamma-strategies",
        name: "Gamma Strategies",
        category: "defi",
        subcategory: "yield",
        description:
            "Active liquidity management protocol for concentrated liquidity positions",
        logo: "Γ",
        website: "https://gamma.xyz",
        github: {
            org: "GammaStrategies",
        },
        twitter: {
            handle: "GammaStrategies",
        },
        onchain: {
            chain: "polygon",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 17,
            userGrowthRate: 15,
            codeQuality: 87,
            trend: "up",
        },
    },
    {
        slug: "mai-finance",
        name: "Mai Finance",
        category: "defi",
        subcategory: "lending",
        description:
            "Stablecoin lending protocol offering interest-free loans against crypto collateral",
        logo: "🏦",
        website: "https://mai.finance",
        github: {
            org: "0xlaozi",
        },
        twitter: {
            handle: "QiDaoProtocol",
        },
        onchain: {
            chain: "polygon",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 14,
            userGrowthRate: 12,
            codeQuality: 85,
            trend: "stable",
        },
    },
    {
        slug: "balancer-polygon",
        name: "Balancer",
        category: "defi",
        subcategory: "dex",
        description:
            "Automated portfolio manager and liquidity provider with weighted pools",
        logo: "⚖️",
        website: "https://balancer.fi",
        github: {
            org: "balancer",
        },
        twitter: {
            handle: "Balancer",
        },
        onchain: {
            chain: "polygon",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 15,
            userGrowthRate: 13,
            codeQuality: 90,
            trend: "stable",
        },
    },
    {
        slug: "harvest-finance",
        name: "Harvest Finance",
        category: "defi",
        subcategory: "yield",
        description:
            "Yield aggregator with auto-compounding strategies across multiple chains",
        logo: "🚜",
        website: "https://harvest.finance",
        github: {
            org: "harvest-finance",
        },
        twitter: {
            handle: "harvest_finance",
        },
        onchain: {
            chain: "polygon",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 13,
            userGrowthRate: 11,
            codeQuality: 85,
            trend: "stable",
        },
    },
    {
        slug: "dystopia",
        name: "Dystopia",
        category: "defi",
        subcategory: "dex",
        description:
            "ve(3,3) DEX inspired by Solidly, focused on low-fee swaps and gauge voting",
        logo: "🌆",
        website: "https://dystopia.exchange",
        github: {
            org: "dystopia-exchange",
        },
        twitter: {
            handle: "DystopiaSwap",
        },
        onchain: {
            chain: "polygon",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 14,
            userGrowthRate: 12,
            codeQuality: 82,
            trend: "stable",
        },
    },
    {
        slug: "polygon-labs",
        name: "Polygon Labs",
        category: "infrastructure",
        subcategory: "l2",
        description:
            "Core development team building Polygon PoS, zkEVM, and CDK infrastructure",
        logo: "💜",
        website: "https://polygon.technology",
        github: {
            org: "maticnetwork",
        },
        twitter: {
            handle: "0xPolygon",
        },
        onchain: {
            chain: "polygon",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 18,
            userGrowthRate: 16,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "biconomy",
        name: "Biconomy",
        category: "infrastructure",
        subcategory: "wallet",
        description:
            "Account abstraction and gasless transaction infrastructure for Web3 apps",
        logo: "🔥",
        website: "https://biconomy.io",
        github: {
            org: "bcnmy",
        },
        twitter: {
            handle: "biaboromy",
        },
        onchain: {
            chain: "polygon",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 18,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "lens-protocol",
        name: "Lens Protocol",
        category: "infrastructure",
        subcategory: "identity",
        description:
            "Decentralized social graph enabling portable social identities and content",
        logo: "🌿",
        website: "https://lens.xyz",
        github: {
            org: "lens-protocol",
        },
        twitter: {
            handle: "LensProtocol",
        },
        onchain: {
            chain: "polygon",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 22,
            userGrowthRate: 20,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "alchemy",
        name: "Alchemy",
        category: "infrastructure",
        subcategory: "data",
        description:
            "Blockchain development platform with node infrastructure and developer tools",
        logo: "🧪",
        website: "https://alchemy.com",
        github: {
            org: "alchemyplatform",
        },
        twitter: {
            handle: "AlchemyPlatform",
        },
        onchain: {
            chain: "polygon",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 18,
            codeQuality: 92,
            trend: "up",
        },
    },
    {
        slug: "quicknode",
        name: "QuickNode",
        category: "infrastructure",
        subcategory: "data",
        description:
            "Blockchain node infrastructure providing fast and reliable RPC endpoints",
        logo: "⚡",
        website: "https://quicknode.com",
        github: {
            org: "quiknode-labs",
        },
        twitter: {
            handle: "QuickNode",
        },
        onchain: {
            chain: "polygon",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 18,
            userGrowthRate: 16,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "thirdweb",
        name: "thirdweb",
        category: "infrastructure",
        subcategory: "dev-tools",
        description:
            "Full-stack Web3 development platform with SDKs, contracts, and infrastructure",
        logo: "🔺",
        website: "https://thirdweb.com",
        github: {
            org: "thirdweb-dev",
        },
        twitter: {
            handle: "thirdweb",
        },
        onchain: {
            chain: "polygon",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 24,
            userGrowthRate: 22,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "sequence",
        name: "Sequence",
        category: "infrastructure",
        subcategory: "wallet",
        description:
            "Smart wallet infrastructure designed for gaming and consumer applications",
        logo: "🎮",
        website: "https://sequence.xyz",
        github: {
            org: "0xsequence",
        },
        twitter: {
            handle: "0xSequence",
        },
        onchain: {
            chain: "polygon",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 18,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "immutable",
        name: "Immutable",
        category: "infrastructure",
        subcategory: "dev-tools",
        description:
            "Gaming-focused infrastructure with zkEVM and marketplace solutions",
        logo: "🎯",
        website: "https://immutable.com",
        github: {
            org: "immutable",
        },
        twitter: {
            handle: "Immutable",
        },
        onchain: {
            chain: "polygon",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 18,
            userGrowthRate: 16,
            codeQuality: 88,
            trend: "up",
        },
    },
    // ============================================
    // ETHEREUM ADDITIONAL PROJECTS (3 new)
    // ============================================
    {
        slug: "gearbox",
        name: "Gearbox",
        category: "defi",
        subcategory: "lending",
        description:
            "Composable leverage protocol enabling leveraged positions across DeFi",
        logo: "⚙️",
        website: "https://gearbox.fi",
        github: {
            org: "Gearbox-protocol",
        },
        twitter: {
            handle: "GearboxProtocol",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 17,
            userGrowthRate: 15,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "sommelier",
        name: "Sommelier",
        category: "defi",
        subcategory: "yield",
        description:
            "Intelligent DeFi vaults using off-chain computation for yield optimization",
        logo: "🍷",
        website: "https://sommelier.finance",
        github: {
            org: "PeggyJV",
        },
        twitter: {
            handle: "sommaborfinance",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 16,
            userGrowthRate: 14,
            codeQuality: 87,
            trend: "up",
        },
    },
    {
        slug: "eigenlayer",
        name: "EigenLayer",
        category: "infrastructure",
        subcategory: "security",
        description:
            "Restaking protocol enabling shared security for new protocols and rollups",
        logo: "🔒",
        website: "https://eigenlayer.xyz",
        github: {
            org: "Layr-Labs",
        },
        twitter: {
            handle: "eigenlayer",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 28,
            userGrowthRate: 25,
            codeQuality: 92,
            trend: "up",
        },
    },
    // ============================================
    // SOLANA ADDITIONAL PROJECTS (8 new)
    // ============================================
    {
        slug: "raydium",
        name: "Raydium",
        category: "defi",
        subcategory: "dex",
        description:
            "AMM and order book DEX providing liquidity to Serum's central limit order book",
        logo: "☢️",
        website: "https://raydium.io",
        github: {
            org: "raydium-io",
        },
        twitter: {
            handle: "RaydiumProtocol",
        },
        onchain: {
            chain: "solana",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
            hasVolume: true,
        },
        defaults: {
            walletGrowth: 18,
            userGrowthRate: 16,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "marinade-finance",
        name: "Marinade Finance",
        category: "defi",
        subcategory: "liquid-staking",
        description:
            "Largest liquid staking protocol on Solana with mSOL and native staking",
        logo: "🥖",
        website: "https://marinade.finance",
        github: {
            org: "marinade-finance",
        },
        twitter: {
            handle: "MarinadeFinance",
        },
        onchain: {
            chain: "solana",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 17,
            userGrowthRate: 15,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "lifinity",
        name: "Lifinity",
        category: "defi",
        subcategory: "dex",
        description:
            "Proactive market maker DEX using oracle prices to reduce impermanent loss",
        logo: "♾️",
        website: "https://lifinity.io",
        github: {
            org: "Lifinity-Protocol",
        },
        twitter: {
            handle: "Lifinity_io",
        },
        onchain: {
            chain: "solana",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 16,
            userGrowthRate: 14,
            codeQuality: 86,
            trend: "up",
        },
    },
    {
        slug: "save-solend",
        name: "Save (Solend)",
        category: "defi",
        subcategory: "lending",
        description:
            "Algorithmic lending and borrowing protocol, rebranded from Solend",
        logo: "💰",
        website: "https://save.finance",
        github: {
            org: "solendprotocol",
        },
        twitter: {
            handle: "solaborprotocol",
        },
        onchain: {
            chain: "solana",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 15,
            userGrowthRate: 13,
            codeQuality: 88,
            trend: "stable",
        },
    },
    {
        slug: "jito-labs",
        name: "Jito Labs",
        category: "infrastructure",
        subcategory: "dev-tools",
        description:
            "MEV infrastructure and liquid staking protocol with JitoSOL",
        logo: "🔥",
        website: "https://jito.network",
        github: {
            org: "jito-foundation",
        },
        twitter: {
            handle: "jito_sol",
        },
        onchain: {
            chain: "solana",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 24,
            userGrowthRate: 22,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "triton",
        name: "Triton",
        category: "infrastructure",
        subcategory: "data",
        description:
            "High-performance RPC and validator infrastructure for Solana",
        logo: "🔱",
        website: "https://triton.one",
        github: {
            org: "triton-one",
        },
        twitter: {
            handle: "triaborone",
        },
        onchain: {
            chain: "solana",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 18,
            userGrowthRate: 16,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "switchboard",
        name: "Switchboard",
        category: "infrastructure",
        subcategory: "data",
        description:
            "Decentralized oracle network providing customizable data feeds for Solana",
        logo: "🔀",
        website: "https://switchboard.xyz",
        github: {
            org: "switchboard-xyz",
        },
        twitter: {
            handle: "switchboardxyz",
        },
        onchain: {
            chain: "solana",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 17,
            userGrowthRate: 15,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "light-protocol",
        name: "Light Protocol",
        category: "infrastructure",
        subcategory: "dev-tools",
        description:
            "ZK compression protocol enabling cost-efficient state on Solana",
        logo: "💡",
        website: "https://lightprotocol.com",
        github: {
            org: "Lightprotocol",
        },
        twitter: {
            handle: "LightProtocol",
        },
        onchain: {
            chain: "solana",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 18,
            codeQuality: 90,
            trend: "up",
        },
    },
    // ============================================
    // BASE ADDITIONAL PROJECTS (8 new)
    // ============================================
    {
        slug: "aerodrome",
        name: "Aerodrome",
        category: "defi",
        subcategory: "dex",
        description:
            "Leading ve(3,3) DEX on Base, forked from Velodrome with governance incentives",
        logo: "✈️",
        website: "https://aerodrome.finance",
        github: {
            org: "aerodrome-finance",
        },
        twitter: {
            handle: "AesodromeFi",
        },
        onchain: {
            chain: "base",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
            hasVolume: true,
        },
        defaults: {
            walletGrowth: 25,
            userGrowthRate: 23,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "moonwell",
        name: "Moonwell",
        category: "defi",
        subcategory: "lending",
        description:
            "Open lending protocol native to Base with community governance",
        logo: "🌙",
        website: "https://moonwell.fi",
        github: {
            org: "moonwell-fi",
        },
        twitter: {
            handle: "MoonwellFi",
        },
        onchain: {
            chain: "base",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 18,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "seamless-protocol",
        name: "Seamless Protocol",
        category: "defi",
        subcategory: "lending",
        description:
            "Integrated lending protocol with ILMs (Integrated Liquidity Markets) on Base",
        logo: "🔄",
        website: "https://seamlessprotocol.com",
        github: {
            org: "seamless-protocol",
        },
        twitter: {
            handle: "SeamlessFi",
        },
        onchain: {
            chain: "base",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 22,
            userGrowthRate: 20,
            codeQuality: 87,
            trend: "up",
        },
    },
    {
        slug: "baseswap",
        name: "BaseSwap",
        category: "defi",
        subcategory: "dex",
        description:
            "Native Base DEX with yield farming and NFT marketplace features",
        logo: "🔵",
        website: "https://baseswap.fi",
        github: {
            org: "baseswapfi",
        },
        twitter: {
            handle: "BaseSwap_Fi",
        },
        onchain: {
            chain: "base",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 18,
            userGrowthRate: 16,
            codeQuality: 82,
            trend: "up",
        },
    },
    {
        slug: "coinbase-wallet",
        name: "Coinbase Wallet",
        category: "infrastructure",
        subcategory: "wallet",
        description:
            "Self-custody wallet from Coinbase, primary gateway to the Base ecosystem",
        logo: "💼",
        website: "https://wallet.coinbase.com",
        github: {
            org: "coinbase",
        },
        twitter: {
            handle: "CoinbaseWallet",
        },
        onchain: {
            chain: "base",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 22,
            userGrowthRate: 20,
            codeQuality: 92,
            trend: "up",
        },
    },
    {
        slug: "privy",
        name: "Privy",
        category: "infrastructure",
        subcategory: "wallet",
        description:
            "Embedded wallet infrastructure enabling seamless Web3 onboarding",
        logo: "🔐",
        website: "https://privy.io",
        github: {
            org: "privy-io",
        },
        twitter: {
            handle: "priabordev",
        },
        onchain: {
            chain: "base",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 24,
            userGrowthRate: 22,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "zora",
        name: "Zora",
        category: "infrastructure",
        subcategory: "dev-tools",
        description:
            "NFT and media protocol with its own L2 network on the OP Stack",
        logo: "🎨",
        website: "https://zora.co",
        github: {
            org: "ourzora",
        },
        twitter: {
            handle: "zaboraa",
        },
        onchain: {
            chain: "base",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 18,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "mirror",
        name: "Mirror",
        category: "infrastructure",
        subcategory: "dev-tools",
        description:
            "Decentralized publishing platform for writers and creators",
        logo: "🪞",
        website: "https://mirror.xyz",
        github: {
            org: "mirror-xyz",
        },
        twitter: {
            handle: "mirrordotxyz",
        },
        onchain: {
            chain: "base",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 16,
            userGrowthRate: 14,
            codeQuality: 88,
            trend: "stable",
        },
    },
    // ============================================
    // ARBITRUM ADDITIONAL PROJECTS (9 new)
    // ============================================
    {
        slug: "camelot",
        name: "Camelot",
        category: "defi",
        subcategory: "dex",
        description:
            "Native Arbitrum DEX with launchpad and innovative tokenomics",
        logo: "⚔️",
        website: "https://camelot.exchange",
        github: {
            org: "camelotboardxchange",
        },
        twitter: {
            handle: "CamelotDEX",
        },
        onchain: {
            chain: "arbitrum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
            hasVolume: true,
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 18,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "radiant-capital",
        name: "Radiant Capital",
        category: "defi",
        subcategory: "lending",
        description:
            "Cross-chain lending protocol leveraging LayerZero for omnichain borrowing",
        logo: "☀️",
        website: "https://radiant.capital",
        github: {
            org: "radiant-capital",
        },
        twitter: {
            handle: "RDNTCapital",
        },
        onchain: {
            chain: "arbitrum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 16,
            userGrowthRate: 14,
            codeQuality: 85,
            trend: "stable",
        },
    },
    {
        slug: "pendle",
        name: "Pendle",
        category: "defi",
        subcategory: "yield",
        description:
            "Yield tokenization protocol enabling trading of future yield",
        logo: "⏳",
        website: "https://pendle.finance",
        github: {
            org: "pendle-finance",
        },
        twitter: {
            handle: "pendle_fi",
        },
        onchain: {
            chain: "arbitrum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 24,
            userGrowthRate: 22,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "vela-exchange",
        name: "Vela Exchange",
        category: "defi",
        subcategory: "derivatives",
        description:
            "Perpetual DEX with advanced order types and low fees on Arbitrum",
        logo: "⛵",
        website: "https://vela.exchange",
        github: {
            org: "vela-exchange",
        },
        twitter: {
            handle: "velaaborchange",
        },
        onchain: {
            chain: "arbitrum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
            hasVolume: true,
        },
        defaults: {
            walletGrowth: 17,
            userGrowthRate: 15,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "jones-dao",
        name: "Jones DAO",
        category: "defi",
        subcategory: "yield",
        description:
            "Options vaults and yield strategies maximizing returns on blue-chip assets",
        logo: "🎩",
        website: "https://jonesdao.io",
        github: {
            org: "Jones-DAO",
        },
        twitter: {
            handle: "Jones_DAO",
        },
        onchain: {
            chain: "arbitrum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 16,
            userGrowthRate: 14,
            codeQuality: 86,
            trend: "stable",
        },
    },
    {
        slug: "arbitrum-foundation",
        name: "Arbitrum Foundation",
        category: "infrastructure",
        subcategory: "l2",
        description:
            "Governance body supporting the Arbitrum ecosystem and grants",
        logo: "🔷",
        website: "https://arbitrum.foundation",
        github: {
            org: "ArbitrumFoundation",
        },
        twitter: {
            handle: "arbitrum",
        },
        onchain: {
            chain: "arbitrum",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 18,
            userGrowthRate: 16,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "offchain-labs",
        name: "Offchain Labs",
        category: "infrastructure",
        subcategory: "l2",
        description:
            "Core development team building Arbitrum technology and Stylus VM",
        logo: "🔬",
        website: "https://offchainlabs.com",
        github: {
            org: "OffchainLabs",
        },
        twitter: {
            handle: "OffchainLabs",
        },
        onchain: {
            chain: "arbitrum",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 18,
            codeQuality: 92,
            trend: "up",
        },
    },
    {
        slug: "layerzero",
        name: "LayerZero",
        category: "infrastructure",
        subcategory: "dev-tools",
        description:
            "Omnichain interoperability protocol enabling cross-chain messaging",
        logo: "0️⃣",
        website: "https://layerzero.network",
        github: {
            org: "LayerZero-Labs",
        },
        twitter: {
            handle: "LayerZero_Labs",
        },
        onchain: {
            chain: "arbitrum",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 22,
            userGrowthRate: 20,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "chainlink-ccip",
        name: "Chainlink CCIP",
        category: "infrastructure",
        subcategory: "dev-tools",
        description:
            "Cross-Chain Interoperability Protocol for secure token and message transfers",
        logo: "🔗",
        website: "https://chain.link/cross-chain",
        github: {
            org: "smartcontractkit",
        },
        twitter: {
            handle: "chainlink",
        },
        onchain: {
            chain: "arbitrum",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 18,
            userGrowthRate: 16,
            codeQuality: 92,
            trend: "up",
        },
    },
];

// Helper functions
export function getCompanyConfig(
    slug: string
): CompanyConfig | undefined {
    return COMPANY_CONFIGS.find(
        (c) => c.slug.toLowerCase() === slug.toLowerCase()
    );
}

export function getAllCompanySlugs(): string[] {
    return COMPANY_CONFIGS.map((c) => c.slug);
}

export function getCompaniesByChain(chain: SupportedChain): CompanyConfig[] {
    return COMPANY_CONFIGS.filter((c) => c.onchain.chain === chain);
}
