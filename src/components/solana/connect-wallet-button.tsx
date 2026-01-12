"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

interface SolanaConnectButtonProps {
    className?: string;
}

export function SolanaConnectButton({ className }: SolanaConnectButtonProps) {
    return <WalletMultiButton className={className} />;
}

// Hook to get wallet status
export function useSolanaWallet() {
    const { connected, publicKey, connecting, disconnect, wallet } = useWallet();

    return {
        connected,
        connecting,
        publicKey: publicKey?.toBase58() || null,
        walletName: wallet?.adapter.name || null,
        disconnect,
    };
}
