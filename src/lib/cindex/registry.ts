/**
 * Index Module Registry
 * Maps company slugs to their index module functions and chain information
 */

import { Company } from "./companies";
import { IndexData, IndexScore } from "@/lib/api/types";

// Supported blockchain chains
export type SupportedChain =
    | "ethereum"
    | "solana"
    | "polygon"
    | "arbitrum"
    | "optimism"
    | "base";

// Company metadata
export interface CompanyMetadata {
    chain: SupportedChain;
    name: string;
    description?: string;
    blogUrl?: string;
    mediumUrl?: string;
}

// Type for index module functions
export interface IndexModule {
    fetchData: () => Promise<IndexData>;
    calculateScore: (data?: IndexData) => Promise<IndexScore>;
    getCompanyData: (
        data?: IndexData,
        score?: IndexScore
    ) => Promise<Company>;
}

// Registry entry combining metadata and module loader
export interface RegistryEntry {
    metadata: CompanyMetadata;
    loader: () => Promise<IndexModule>;
}

// Registry mapping company slugs to their metadata and module paths
export const INDEX_REGISTRY: Record<string, RegistryEntry> = {
    uniswap: {
        metadata: {
            chain: "ethereum",
            name: "Uniswap",
            description: "Leading decentralized exchange protocol",
            blogUrl: "https://blog.uniswap.org",
            mediumUrl: "https://medium.com/uniswap",
        },
        loader: async () => {
            const module = await import("./uniswap");
            return {
                fetchData: module.fetchUniswapData,
                calculateScore: module.calculateUniswapScore,
                getCompanyData: module.getUniswapCompanyData,
            };
        },
    },
    jupiter: {
        metadata: {
            chain: "solana",
            name: "Jupiter",
            description: "Solana's leading DEX aggregator",
            blogUrl: "https://station.jup.ag/docs",
        },
        loader: async () => {
            const module = await import("./jupiter");
            return {
                fetchData: module.fetchJupiterData,
                calculateScore: module.calculateJupiterScore,
                getCompanyData: module.getJupiterCompanyData,
            };
        },
    },
    // Ethereum companies
    morpho: {
        metadata: {
            chain: "ethereum",
            name: "Morpho",
            description: "Peer-to-peer lending protocol",
            mediumUrl: "https://medium.com/morpho-labs",
        },
        loader: async () => {
            const module = await import("./morpho");
            return {
                fetchData: module.fetchMorphoData,
                calculateScore: module.calculateMorphoScore,
                getCompanyData: module.getMorphoCompanyData,
            };
        },
    },
    euler: {
        metadata: {
            chain: "ethereum",
            name: "Euler",
            description: "Permissionless lending protocol",
            mediumUrl: "https://medium.com/euler-finance",
        },
        loader: async () => {
            const module = await import("./euler");
            return {
                fetchData: module.fetchEulerData,
                calculateScore: module.calculateEulerScore,
                getCompanyData: module.getEulerCompanyData,
            };
        },
    },
    rocketpool: {
        metadata: {
            chain: "ethereum",
            name: "Rocket Pool",
            description: "Decentralized Ethereum staking protocol",
            mediumUrl: "https://medium.com/rocket-pool",
        },
        loader: async () => {
            const module = await import("./rocketpool");
            return {
                fetchData: module.fetchRocketpoolData,
                calculateScore: module.calculateRocketpoolScore,
                getCompanyData: module.getRocketpoolCompanyData,
            };
        },
    },
    blur: {
        metadata: {
            chain: "ethereum",
            name: "Blur",
            description: "NFT marketplace and aggregator",
        },
        loader: async () => {
            const module = await import("./blur");
            return {
                fetchData: module.fetchBlurData,
                calculateScore: module.calculateBlurScore,
                getCompanyData: module.getBlurCompanyData,
            };
        },
    },
    safe: {
        metadata: {
            chain: "ethereum",
            name: "Safe",
            description: "Multi-sig wallet infrastructure",
            blogUrl: "https://safe.global/blog",
        },
        loader: async () => {
            const module = await import("./safe");
            return {
                fetchData: module.fetchSafeData,
                calculateScore: module.calculateSafeScore,
                getCompanyData: module.getSafeCompanyData,
            };
        },
    },
    // Solana companies
    orca: {
        metadata: {
            chain: "solana",
            name: "Orca",
            description: "User-friendly AMM on Solana",
            mediumUrl: "https://medium.com/orca-so",
        },
        loader: async () => {
            const module = await import("./orca");
            return {
                fetchData: module.fetchOrcaData,
                calculateScore: module.calculateOrcaScore,
                getCompanyData: module.getOrcaCompanyData,
            };
        },
    },
    drift: {
        metadata: {
            chain: "solana",
            name: "Drift Protocol",
            description: "Decentralized perpetuals and spot trading",
            blogUrl: "https://drift.trade/updates",
            mediumUrl: "https://medium.com/@drift-protocol",
        },
        loader: async () => {
            const module = await import("./drift");
            return {
                fetchData: module.fetchDriftData,
                calculateScore: module.calculateDriftScore,
                getCompanyData: module.getDriftCompanyData,
            };
        },
    },
    marginfi: {
        metadata: {
            chain: "solana",
            name: "MarginFi",
            description: "Lending and borrowing protocol",
            mediumUrl: "https://medium.com/marginfi",
        },
        loader: async () => {
            const module = await import("./marginfi");
            return {
                fetchData: module.fetchMarginfiData,
                calculateScore: module.calculateMarginfiScore,
                getCompanyData: module.getMarginfiCompanyData,
            };
        },
    },
    kamino: {
        metadata: {
            chain: "solana",
            name: "Kamino Finance",
            description: "Automated liquidity management",
            mediumUrl: "https://medium.com/kamino-finance",
        },
        loader: async () => {
            const module = await import("./kamino");
            return {
                fetchData: module.fetchKaminoData,
                calculateScore: module.calculateKaminoScore,
                getCompanyData: module.getKaminoCompanyData,
            };
        },
    },
    tensor: {
        metadata: {
            chain: "solana",
            name: "Tensor",
            description: "NFT marketplace on Solana",
            blogUrl: "https://tensor.substack.com",
        },
        loader: async () => {
            const module = await import("./tensor");
            return {
                fetchData: module.fetchTensorData,
                calculateScore: module.calculateTensorScore,
                getCompanyData: module.getTensorCompanyData,
            };
        },
    },
    // Additional Ethereum companies
    lido: {
        metadata: {
            chain: "ethereum",
            name: "Lido",
            description: "Liquid staking protocol for Ethereum",
            blogUrl: "https://blog.lido.fi",
        },
        loader: async () => {
            const module = await import("./lido");
            return {
                fetchData: module.fetchLidoData,
                calculateScore: module.calculateLidoScore,
                getCompanyData: module.getLidoCompanyData,
            };
        },
    },
    zora: {
        metadata: {
            chain: "ethereum",
            name: "Zora",
            description: "NFT marketplace and protocol",
            blogUrl: "https://zora.co/writing",
        },
        loader: async () => {
            const module = await import("./zora");
            return {
                fetchData: module.fetchZoraData,
                calculateScore: module.calculateZoraScore,
                getCompanyData: module.getZoraCompanyData,
            };
        },
    },
    zerox: {
        metadata: {
            chain: "ethereum",
            name: "0x Protocol",
            description: "DEX aggregation and liquidity protocol",
            blogUrl: "https://0x.org/blog",
        },
        loader: async () => {
            const module = await import("./zerox");
            return {
                fetchData: module.fetchZeroxData,
                calculateScore: module.calculateZeroxScore,
                getCompanyData: module.getZeroxCompanyData,
            };
        },
    },
    parallel: {
        metadata: {
            chain: "ethereum",
            name: "Parallel",
            description: "Sci-fi card game on Ethereum",
            mediumUrl: "https://medium.com/parallel-life",
        },
        loader: async () => {
            const module = await import("./parallel");
            return {
                fetchData: module.fetchParallelData,
                calculateScore: module.calculateParallelScore,
                getCompanyData: module.getParallelCompanyData,
            };
        },
    },
    velodrome: {
        metadata: {
            chain: "ethereum",
            name: "Velodrome",
            description: "AMM and ve(3,3) model on Optimism",
            mediumUrl: "https://medium.com/@velodrome",
        },
        loader: async () => {
            const module = await import("./velodrome");
            return {
                fetchData: module.fetchVelodromeData,
                calculateScore: module.calculateVelodromeScore,
                getCompanyData: module.getVelodromeCompanyData,
            };
        },
    },
    // Additional Solana companies
    metaplex: {
        metadata: {
            chain: "solana",
            name: "Metaplex",
            description: "NFT standard and tools on Solana",
            mediumUrl: "https://medium.com/metaplex",
        },
        loader: async () => {
            const module = await import("./metaplex");
            return {
                fetchData: module.fetchMetaplexData,
                calculateScore: module.calculateMetaplexScore,
                getCompanyData: module.getMetaplexCompanyData,
            };
        },
    },
    jito: {
        metadata: {
            chain: "solana",
            name: "Jito",
            description: "MEV infrastructure on Solana",
            blogUrl: "https://jito.wtf/blog",
        },
        loader: async () => {
            const module = await import("./jito");
            return {
                fetchData: module.fetchJitoData,
                calculateScore: module.calculateJitoScore,
                getCompanyData: module.getJitoCompanyData,
            };
        },
    },
    staratlas: {
        metadata: {
            chain: "solana",
            name: "Star Atlas",
            description: "Space MMO on Solana",
            mediumUrl: "https://medium.com/star-atlas",
        },
        loader: async () => {
            const module = await import("./staratlas");
            return {
                fetchData: module.fetchStaratlasData,
                calculateScore: module.calculateStaratlasScore,
                getCompanyData: module.getStaratlasCompanyData,
            };
        },
    },
    aurory: {
        metadata: {
            chain: "solana",
            name: "Aurory",
            description: "RPG and NFT game on Solana",
            mediumUrl: "https://medium.com/aurory-project",
        },
        loader: async () => {
            const module = await import("./aurory");
            return {
                fetchData: module.fetchAuroryData,
                calculateScore: module.calculateAuroryScore,
                getCompanyData: module.getAuroryCompanyData,
            };
        },
    },
    mangomarkets: {
        metadata: {
            chain: "solana",
            name: "Mango Markets",
            description: "Decentralized trading platform on Solana",
            mediumUrl: "https://medium.com/mango-markets",
        },
        loader: async () => {
            const module = await import("./mangomarkets");
            return {
                fetchData: module.fetchMangomarketsData,
                calculateScore: module.calculateMangomarketsScore,
                getCompanyData: module.getMangomarketsCompanyData,
            };
        },
    },
    fabrknt: {
        metadata: {
            chain: "ethereum",
            name: "Fabrknt",
            description:
                "The Foundational Foundry for Agentic Code & Future Economies",
            blogUrl: "https://www.fabrknt.com",
        },
        loader: async () => {
            const module = await import("./fabrknt");
            return {
                fetchData: module.fetchFabrkntData,
                calculateScore: module.calculateFabrkntScore,
                getCompanyData: module.getFabrkntCompanyData,
            };
        },
    },
};

/**
 * Get index module for a company slug
 */
export async function getIndexModule(
    slug: string
): Promise<IndexModule | null> {
    const entry = INDEX_REGISTRY[slug.toLowerCase()];
    if (!entry) {
        return null;
    }
    return entry.loader();
}

/**
 * Get company metadata for a slug
 */
export function getCompanyMetadata(slug: string): CompanyMetadata | null {
    const entry = INDEX_REGISTRY[slug.toLowerCase()];
    return entry?.metadata || null;
}

/**
 * Get all available company slugs
 */
export function getAvailableCompanySlugs(): string[] {
    return Object.keys(INDEX_REGISTRY);
}

/**
 * Get all companies for a specific chain
 */
export function getCompaniesByChain(chain: SupportedChain): string[] {
    return Object.entries(INDEX_REGISTRY)
        .filter(([_, entry]) => entry.metadata.chain === chain)
        .map(([slug]) => slug);
}

/**
 * Get RPC configuration info for a chain
 */
export function getChainRpcInfo(chain: SupportedChain): {
    envVar: string;
    defaultUrl?: string;
    description: string;
} {
    switch (chain) {
        case "ethereum":
            return {
                envVar: "ETHEREUM_RPC_URL",
                defaultUrl: "Public RPC endpoints",
                description:
                    "Ethereum RPC (supports Alchemy API key or custom RPC)",
            };
        case "solana":
            return {
                envVar: "SOLANA_RPC_URL",
                defaultUrl: "Public Solana RPC",
                description:
                    "Solana RPC (supports Helius API key or custom RPC)",
            };
        default:
            return {
                envVar: `${chain.toUpperCase()}_RPC_URL`,
                description: `${chain} RPC endpoint`,
            };
    }
}
