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
        slug: "uniswap",
        name: "Uniswap",
        category: "defi",
        subcategory: "dex",
        description:
            "Leading decentralized exchange protocol enabling permissionless token swaps on Ethereum and Layer 2s",
        logo: "🦄",
        website: "https://uniswap.org",
        github: {
            org: "Uniswap",
            customMetricsFunction: "getUniswapMetrics",
        },
        twitter: {
            handle: "Uniswap",
        },
        onchain: {
            chain: "ethereum",
            address: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
            customMetricsFunction: "getUniswapMetrics",
        },
        blogUrl: "https://blog.uniswap.org",
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 15,
            userGrowthRate: 15,
            codeQuality: 90,
            trend: "up",
            tvl: 5000000000,
        },
    },
    {
        slug: "jupiter",
        name: "Jupiter",
        category: "defi",
        subcategory: "dex",
        description:
            "Leading DEX aggregator on Solana providing best swap rates across all DEXs",
        logo: "🪐",
        website: "https://jup.ag",
        github: {
            org: "jup-ag",
        },
        twitter: {
            handle: "JupiterExchange",
        },
        onchain: {
            chain: "solana",
            address: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
            customMetricsFunction: "getJupiterMetrics",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 20,
            codeQuality: 90,
            trend: "up",
            tvl: 0,
        },
    },
    {
        slug: "hyperliquid",
        name: "Hyperliquid",
        category: "defi",
        subcategory: "derivatives",
        description:
            "High-performance decentralized perpetual exchange on its own L1 blockchain",
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
            address: "0x0000000000000000000000000000000000000000", // L1 chain, placeholder address
        },
        features: {
            hasTVL: true,
            hasVolume: true,
        },
        defaults: {
            walletGrowth: 30,
            userGrowthRate: 25,
            codeQuality: 90,
            trend: "up",
            tvl: 0,
        },
    },
    {
        slug: "morpho",
        name: "Morpho",
        category: "defi",
        subcategory: "lending",
        description:
            "Peer-to-peer lending protocol with optimized capital efficiency",
        logo: "🔷",
        website: "https://morpho.org",
        github: {
            org: "morpho-org",
        },
        twitter: {
            handle: "MorphoLabs",
        },
        onchain: {
            chain: "ethereum",
            address: "0x8888882f8f843896699869179fB6E4f7e3B58888",
        },
        blogUrl: "https://morpho.mirror.xyz",
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 15,
            userGrowthRate: 15,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "euler",
        name: "Euler",
        category: "defi",
        subcategory: "lending",
        description: "Permissionless lending protocol on Ethereum",
        logo: "📐",
        website: "https://www.euler.finance",
        github: {
            org: "euler-xyz",
        },
        twitter: {
            handle: "eulerfinance",
        },
        onchain: {
            chain: "ethereum",
            address: "0x27182842E098f60e3D576794A5bFFb0777E025d3",
        },
        defaults: {
            walletGrowth: 15,
            userGrowthRate: 15,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "rocketpool",
        name: "Rocket Pool",
        category: "defi",
        subcategory: "liquid-staking",
        description: "Decentralized Ethereum staking protocol",
        logo: "🚀",
        website: "https://rocketpool.net",
        github: {
            org: "rocket-pool",
        },
        twitter: {
            handle: "Rocket_Pool",
        },
        onchain: {
            chain: "ethereum",
            address: "0xae78736Cd615f374D3085123A210448E74Fc6393",
        },
        defaults: {
            walletGrowth: 15,
            userGrowthRate: 15,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "blur",
        name: "Blur",
        category: "nft",
        subcategory: "marketplace",
        description: "NFT marketplace and aggregator",
        logo: "💎",
        website: "https://blur.io",
        github: {
            org: "blur-io",
        },
        twitter: {
            handle: "blur_io",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000A39bb272e79075ade645fdA5fdEe5F",
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 20,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "safe",
        name: "Safe",
        category: "infrastructure",
        subcategory: "wallet",
        description: "Multi-sig wallet infrastructure",
        logo: "🔒",
        website: "https://safe.global",
        github: {
            org: "safe-global",
        },
        twitter: {
            handle: "safe",
        },
        onchain: {
            chain: "ethereum",
            address: "0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552",
        },
        defaults: {
            walletGrowth: 15,
            userGrowthRate: 15,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "orca",
        name: "Orca",
        category: "defi",
        subcategory: "dex",
        description:
            "User-friendly AMM and concentrated liquidity DEX on Solana",
        logo: "🐋",
        website: "https://www.orca.so",
        github: {
            org: "orca-so",
        },
        twitter: {
            handle: "orca_so",
        },
        onchain: {
            chain: "solana",
            address: "whirLbMiicVdio4qvUfM5DAg3K5nRp6oP2Y",
            customMetricsFunction: "getOrcaMetrics",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 20,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "drift",
        name: "Drift Protocol",
        category: "defi",
        subcategory: "derivatives",
        description: "Decentralized perpetuals and spot trading on Solana",
        logo: "🌊",
        website: "https://www.drift.trade",
        github: {
            org: "drift-labs",
        },
        twitter: {
            handle: "DriftProtocol",
        },
        onchain: {
            chain: "solana",
            address: "dRiftyHA39bWEY4nXUvNnprgNa8gvhcteAdT",
            customMetricsFunction: "getDriftMetrics",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 20,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "marginfi",
        name: "MarginFi",
        category: "defi",
        subcategory: "yield",
        description: "Lending and borrowing protocol on Solana",
        logo: "💰",
        website: "https://marginfi.com",
        github: {
            org: "marginfi",
        },
        twitter: {
            handle: "marginfi",
        },
        onchain: {
            chain: "solana",
            address: "MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7F",
            customMetricsFunction: "getMarginFiMetrics",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 20,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "kamino",
        name: "Kamino Finance",
        category: "defi",
        subcategory: "lending",
        description: "Automated liquidity management",
        logo: "🌊",
        website: "https://kamino.finance",
        github: {
            org: "Kamino-Finance",
        },
        twitter: {
            handle: "KaminoFinance",
        },
        onchain: {
            chain: "solana",
            address: "KLend2g3cP87fffoy8q1mQqGKjrxjC8boSy",
            customMetricsFunction: "getKaminoMetrics",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 20,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "tensor",
        name: "Tensor",
        category: "nft",
        subcategory: "marketplace",
        description: "NFT marketplace on Solana",
        logo: "🎯",
        website: "https://www.tensor.trade",
        github: {
            org: "tensor-hq",
        },
        twitter: {
            handle: "tensor_hq",
        },
        onchain: {
            chain: "solana",
            address: "TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbZv",
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 20,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "lido",
        name: "Lido",
        category: "defi",
        subcategory: "liquid-staking",
        description: "Liquid staking protocol for Ethereum",
        logo: "🌊",
        website: "https://lido.fi",
        github: {
            org: "lidofinance",
        },
        twitter: {
            handle: "LidoFinance",
        },
        onchain: {
            chain: "ethereum",
            address: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",
        },
        blogUrl: "https://blog.lido.fi",
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 15,
            userGrowthRate: 15,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "zora",
        name: "Zora",
        category: "nft",
        subcategory: "marketplace",
        description: "NFT marketplace and protocol",
        logo: "✨",
        website: "https://zora.co",
        github: {
            org: "ourzora",
        },
        twitter: {
            handle: "zora",
        },
        onchain: {
            chain: "ethereum",
            address: "0xE7E9Ea069b77e960B457D9b9810408EBC281B242",
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 20,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "zerox",
        name: "0x Protocol",
        category: "infrastructure",
        subcategory: "dex",
        description: "DEX aggregation and liquidity protocol",
        logo: "0️⃣",
        website: "https://0x.org",
        github: {
            org: "0xProject",
        },
        twitter: {
            handle: "0xProject",
        },
        onchain: {
            chain: "ethereum",
            address: "0xDef1C0ded9bec7F1a1670819833240f027b25EfF",
        },
        defaults: {
            walletGrowth: 15,
            userGrowthRate: 15,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "metaplex",
        name: "Metaplex",
        category: "infrastructure",
        subcategory: "dev-tools",
        description: "NFT standard and tools on Solana",
        logo: "🎨",
        website: "https://www.metaplex.com",
        github: {
            org: "metaplex-foundation",
        },
        twitter: {
            handle: "metaplex",
        },
        onchain: {
            chain: "solana",
            address: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 20,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "parallel",
        name: "Parallel",
        category: "gaming",
        subcategory: "card-game",
        description: "Sci-fi card game on Ethereum",
        logo: "🎮",
        website: "https://parallel.life",
        github: {
            org: "ParallelNFT",
        },
        twitter: {
            handle: "ParallelTCG",
        },
        onchain: {
            chain: "ethereum",
            address: "0x76BE3b62873462d2142405439777e971754E8E77",
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 20,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "velodrome",
        name: "Velodrome",
        category: "defi",
        subcategory: "dex",
        description: "AMM and ve(3,3) model on Optimism",
        logo: "🏁",
        website: "https://velodrome.finance",
        github: {
            org: "velodrome-finance",
        },
        twitter: {
            handle: "VelodromeFi",
        },
        onchain: {
            chain: "ethereum",
            address: "0x9c12939390052919aF3155f41Bf4160Fd3666A6f",
        },
        defaults: {
            walletGrowth: 15,
            userGrowthRate: 15,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "jito",
        name: "Jito",
        category: "infrastructure",
        subcategory: "validator",
        description: "MEV infrastructure on Solana",
        logo: "⚡",
        website: "https://www.jito.wtf",
        github: {
            org: "jito-foundation",
        },
        twitter: {
            handle: "jito_sol",
        },
        onchain: {
            chain: "solana",
            address: "Jito4APyf642JPZPx3hGc6WWJ8zPKtRbRs4P815Awbb",
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 20,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "staratlas",
        name: "Star Atlas",
        category: "gaming",
        subcategory: "mmo",
        description: "Space MMO on Solana",
        logo: "🌌",
        website: "https://staratlas.com",
        github: {
            org: "staratlasmeta",
        },
        twitter: {
            handle: "staratlas",
        },
        onchain: {
            chain: "solana",
            address: "ATLASXkqGSx5B2YvY1Y4K1mcn1dY6VxTqzkJp5YXW1i",
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 20,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "aurory",
        name: "Aurory",
        category: "gaming",
        subcategory: "rpg",
        description: "RPG and NFT game on Solana",
        logo: "🎴",
        website: "https://aurory.io",
        github: {
            org: "AuroryProject",
        },
        twitter: {
            handle: "AuroryProject",
        },
        onchain: {
            chain: "solana",
            address: "AURYxxLd8c4qFd3s2Q1a1n4ZWLJ7XfyqTxq6HgFjE1",
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 20,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "fabrknt",
        name: "Fabrknt",
        category: "infrastructure",
        subcategory: "dev-tools",
        description:
            "The Foundational Foundry for Agentic Code & Future Economies",
        logo: "🏭",
        website: "https://www.fabrknt.com",
        github: {
            org: "fabrknt",
            customMetricsFunction: "getFabrkntMetrics",
        },
        twitter: {
            handle: "fabrknt",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        blogUrl: "https://www.fabrknt.com",
        features: {
            useCrawler: true,
        },
        defaults: {
            walletGrowth: 0,
            userGrowthRate: 0,
            codeQuality: 90,
            trend: "stable",
        },
    },
    {
        slug: "mangomarkets",
        name: "Mango Markets",
        category: "defi",
        subcategory: "derivatives",
        description: "Decentralized trading platform on Solana",
        logo: "🥭",
        website: "https://mango.markets",
        github: {
            org: "blockworks-foundation",
        },
        twitter: {
            handle: "mangomarkets",
        },
        onchain: {
            chain: "solana",
            address: "4MangoMjqJ2firMokCjjGgoK8d4MXcrgL7XJaL3w6fVg",
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 20,
            codeQuality: 90,
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
