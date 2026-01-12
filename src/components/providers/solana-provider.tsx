"use client";

import { useMemo, ReactNode } from "react";
import {
    ConnectionProvider,
    WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    TorusWalletAdapter,
    LedgerWalletAdapter,
    CoinbaseWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { SOLANA_RPC_ENDPOINT } from "@/lib/solana/config";

// Import wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";

interface SolanaProviderProps {
    children: ReactNode;
}

export function SolanaProvider({ children }: SolanaProviderProps) {
    // Initialize wallet adapters
    // The wallets array can be extended with more wallets as needed
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
            new TorusWalletAdapter(),
            new LedgerWalletAdapter(),
            new CoinbaseWalletAdapter(),
        ],
        []
    );

    return (
        <ConnectionProvider endpoint={SOLANA_RPC_ENDPOINT}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
