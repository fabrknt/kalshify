"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
    Plus,
    Loader2,
    Vault,
    AlertTriangle,
    Wallet,
    ArrowLeft,
    RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { VaultCreationWizard } from "@/components/morpho/vault-creation-wizard";
import { VaultCard } from "@/components/morpho/vault-card";

interface VaultAllocation {
    id: string;
    marketId: string;
    marketName: string | null;
    allocationCap: number;
    enabled: boolean;
    currentAmount: number;
    currentApy: number | null;
}

interface VaultData {
    id: string;
    chainId: number;
    vaultAddress: string;
    factoryVersion: string;
    asset: string;
    assetSymbol: string;
    name: string;
    symbol: string;
    deployedAt: string;
    txHash: string | null;
    curatorAddress: string | null;
    performanceFee: number;
    managementFee: number;
    tvl: number;
    totalEarned: number;
    lastSyncedAt: string | null;
    allocations: VaultAllocation[];
}

// Content component that uses wagmi hooks (only rendered after mount)
function VaultsPageContent() {
    const { isConnected } = useAccount();
    const isProduction = process.env.NODE_ENV === "production";

    const [vaults, setVaults] = useState<VaultData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showWizard, setShowWizard] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch user's vaults
    const fetchVaults = async () => {
        try {
            setError(null);
            const response = await fetch("/api/morpho/vaults");
            if (!response.ok) {
                throw new Error("Failed to fetch vaults");
            }
            const data = await response.json();
            setVaults(data.vaults || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchVaults();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchVaults();
    };

    const handleVaultCreated = (vaultAddress: string, txHash: string) => {
        fetchVaults();
    };

    const handleManageVault = (vault: VaultData) => {
        console.log("Manage vault:", vault);
    };

    // Loading state
    if (loading) {
        return (
            <div className="space-y-6">
                <Header onCreateClick={() => {}} showCreate={false} />
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
                </div>
            </div>
        );
    }


    return (
        <div className="space-y-6">
            <Header
                onCreateClick={() => setShowWizard(true)}
                showCreate={isConnected && !isProduction}
                showWalletButton={true}
                onRefresh={handleRefresh}
                refreshing={refreshing}
                vaultCount={vaults.length}
                isProduction={isProduction}
            />

            {/* Wallet Connection Notice */}
            {!isConnected && !isProduction && (
                <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-400" />
                        <div>
                            <p className="text-amber-400 font-medium">Wallet not connected</p>
                            <p className="text-amber-400/70 text-sm">
                                Connect your wallet to create new vaults
                            </p>
                        </div>
                    </div>
                    <ConnectButton />
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                    {error}
                </div>
            )}

            {/* Vaults Grid */}
            {vaults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vaults.map((vault) => (
                        <VaultCard
                            key={vault.id}
                            vault={vault}
                            onManage={handleManageVault}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState onCreateClick={() => setShowWizard(true)} canCreate={isConnected && !isProduction} isProduction={isProduction} />
            )}

            {/* Vault Creation Wizard */}
            {showWizard && (
                <VaultCreationWizard
                    onClose={() => setShowWizard(false)}
                    onSuccess={handleVaultCreated}
                />
            )}
        </div>
    );
}

// Main page component with SSR-safe mounting
export default function VaultsPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Show loading state during SSR and initial mount
    if (!mounted) {
        return (
            <div className="space-y-6">
                <Header onCreateClick={() => {}} showCreate={false} />
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
                </div>
            </div>
        );
    }

    // Only render content with wagmi hooks after mounting on client
    return <VaultsPageContent />;
}

// Header Component
function Header({
    onCreateClick,
    showCreate,
    onRefresh,
    refreshing,
    vaultCount,
    showWalletButton = false,
    isProduction = false,
}: {
    onCreateClick: () => void;
    showCreate: boolean;
    onRefresh?: () => void;
    refreshing?: boolean;
    vaultCount?: number;
    showWalletButton?: boolean;
    isProduction?: boolean;
}) {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 p-6">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link
                            href="/curate"
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <h1 className="text-2xl font-bold text-white">My Vaults</h1>
                        {vaultCount !== undefined && vaultCount > 0 && (
                            <span className="px-2 py-0.5 text-xs bg-slate-700 text-slate-300 rounded-full">
                                {vaultCount}
                            </span>
                        )}
                    </div>
                    <p className="text-slate-400 text-sm max-w-md">
                        Create and manage your MetaMorpho vaults. Deploy permissionless yield vaults on Ethereum or Base.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            disabled={refreshing}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                            title="Refresh"
                        >
                            <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
                        </button>
                    )}
                    {showWalletButton && (
                        isProduction ? (
                            <span
                                className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-400 font-medium rounded-lg cursor-not-allowed"
                                title="Wallet connection coming soon"
                            >
                                <Wallet className="h-4 w-4" />
                                Connect Wallet
                                <span className="text-[10px] px-1.5 py-0.5 bg-slate-600 text-slate-300 rounded-full">
                                    Soon
                                </span>
                            </span>
                        ) : (
                            <ConnectButton />
                        )
                    )}
                    {showCreate && (
                        <button
                            onClick={onCreateClick}
                            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Create Vault
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Empty State Component
function EmptyState({
    onCreateClick,
    canCreate,
    isProduction = false,
}: {
    onCreateClick: () => void;
    canCreate: boolean;
    isProduction?: boolean;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-900/50 border border-slate-800 rounded-xl">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mb-6">
                <Vault className="h-8 w-8 text-cyan-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No Vaults Yet</h3>
            <p className="text-slate-400 text-sm mb-6 text-center max-w-md">
                Create your first MetaMorpho vault to start earning yield. Vaults are fully permissionless and customizable.
            </p>

            {isProduction ? (
                <div className="text-center">
                    <p className="text-slate-500 text-sm mb-4">Connect wallet to create a vault</p>
                    <span
                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 text-slate-400 font-medium rounded-lg cursor-not-allowed"
                        title="Wallet connection coming soon"
                    >
                        <Wallet className="h-5 w-5" />
                        Connect Wallet
                        <span className="text-xs px-2 py-0.5 bg-slate-600 text-slate-300 rounded-full">
                            Coming Soon
                        </span>
                    </span>
                </div>
            ) : canCreate ? (
                <button
                    onClick={onCreateClick}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-purple-500/25"
                >
                    <Plus className="h-5 w-5" />
                    Create Your First Vault
                </button>
            ) : (
                <div className="text-center">
                    <p className="text-slate-500 text-sm mb-4">Connect wallet to create a vault</p>
                    <ConnectButton />
                </div>
            )}

            {/* Info cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 w-full max-w-3xl">
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <h4 className="text-sm font-medium text-white mb-1">Permissionless</h4>
                    <p className="text-xs text-slate-400">
                        Deploy vaults without any approval or whitelisting required
                    </p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <h4 className="text-sm font-medium text-white mb-1">Customizable</h4>
                    <p className="text-xs text-slate-400">
                        Choose your asset, markets, and allocation strategy
                    </p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <h4 className="text-sm font-medium text-white mb-1">Non-Custodial</h4>
                    <p className="text-xs text-slate-400">
                        You maintain full ownership and control of your vault
                    </p>
                </div>
            </div>
        </div>
    );
}
