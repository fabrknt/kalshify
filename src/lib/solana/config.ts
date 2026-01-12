import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";

// Solana network configuration
export const SOLANA_NETWORK =
    process.env.NODE_ENV === "production"
        ? WalletAdapterNetwork.Mainnet
        : WalletAdapterNetwork.Devnet;

// RPC endpoints
export const SOLANA_RPC_ENDPOINT =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(SOLANA_NETWORK);

// Network names for display
export const SOLANA_NETWORK_NAMES: Record<WalletAdapterNetwork, string> = {
    [WalletAdapterNetwork.Mainnet]: "Solana Mainnet",
    [WalletAdapterNetwork.Devnet]: "Solana Devnet",
    [WalletAdapterNetwork.Testnet]: "Solana Testnet",
};

// Block explorers
export const SOLANA_EXPLORERS: Record<WalletAdapterNetwork, string> = {
    [WalletAdapterNetwork.Mainnet]: "https://explorer.solana.com",
    [WalletAdapterNetwork.Devnet]: "https://explorer.solana.com?cluster=devnet",
    [WalletAdapterNetwork.Testnet]: "https://explorer.solana.com?cluster=testnet",
};

// Get explorer URL for transaction
export function getSolanaExplorerTxUrl(txHash: string, network = SOLANA_NETWORK): string {
    const baseUrl = SOLANA_EXPLORERS[network];
    return `${baseUrl}/tx/${txHash}`;
}

// Get explorer URL for address
export function getSolanaExplorerAddressUrl(address: string, network = SOLANA_NETWORK): string {
    const baseUrl = SOLANA_EXPLORERS[network];
    return `${baseUrl}/address/${address}`;
}
