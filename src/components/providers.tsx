"use client";

import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { AuthProvider } from "./providers/session-provider";
import { queryClient } from "@/lib/query-client";
import { getWagmiConfig } from "@/lib/wagmi-config";
import "@rainbow-me/rainbowkit/styles.css";

export function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [config, setConfig] = useState<any>(null);

    useEffect(() => {
        setMounted(true);
        // Only get config on client side
        try {
            setConfig(getWagmiConfig());
        } catch (error) {
            console.error("Failed to initialize wagmi config:", error);
        }
    }, []);

    // Always wrap with AuthProvider, but conditionally render Web3 providers
    if (!mounted || !config) {
        return <AuthProvider>{children}</AuthProvider>;
    }

    return (
        <AuthProvider>
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>
                    <RainbowKitProvider locale="en">{children}</RainbowKitProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </AuthProvider>
    );
}
