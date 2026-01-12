"use client";

import { useState, useEffect } from "react";
import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from "wagmi";
import { parseUnits, keccak256, encodePacked } from "viem";
import { mainnet, base } from "wagmi/chains";
import {
    CHAIN_ADDRESSES,
    META_MORPHO_FACTORY_ABI,
    VAULT_ASSETS,
} from "@/lib/morpho/constants";
import { CHAIN_NAMES, BLOCK_EXPLORERS } from "@/lib/wagmi/config";
import { ArrowLeft, ArrowRight, Check, Loader2, AlertTriangle, Wallet } from "lucide-react";

// MetaMorpho Factory is only deployed on mainnet and Base
// Testnets (Sepolia, Base Sepolia) do NOT have MetaMorpho Factory
const AVAILABLE_CHAINS = [mainnet, base];

interface VaultCreationWizardProps {
    onClose: () => void;
    onSuccess?: (vaultAddress: string, txHash: string) => void;
}

type Step = "chain" | "asset" | "details" | "confirm" | "deploying" | "success";

export function VaultCreationWizard({ onClose, onSuccess }: VaultCreationWizardProps) {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { switchChain } = useSwitchChain();

    // Wizard state
    const [step, setStep] = useState<Step>("chain");
    const [selectedChain, setSelectedChain] = useState<number>(AVAILABLE_CHAINS[0].id);
    const [selectedAsset, setSelectedAsset] = useState<string>("");
    const [vaultName, setVaultName] = useState("");
    const [vaultSymbol, setVaultSymbol] = useState("");
    const [timelock, setTimelock] = useState(86400); // 1 day in seconds
    const [deployedVaultAddress, setDeployedVaultAddress] = useState<string>("");

    // Contract interaction
    const { writeContract, data: txHash, error: writeError, isPending: isWriting } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    // Get selected asset details
    const selectedAssetDetails = selectedAsset
        ? VAULT_ASSETS[selectedChain]?.find((a) => a.address === selectedAsset)
        : null;

    // Generate salt for deterministic deployment
    const generateSalt = () => {
        const randomBytes = crypto.getRandomValues(new Uint8Array(32));
        return `0x${Array.from(randomBytes)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")}` as `0x${string}`;
    };

    // Handle vault deployment
    const handleDeploy = async () => {
        if (!address || !selectedAsset || !vaultName || !vaultSymbol) return;

        const chainAddresses = CHAIN_ADDRESSES[selectedChain];
        if (!chainAddresses) return;

        setStep("deploying");

        const salt = generateSalt();

        writeContract({
            address: chainAddresses.metaMorphoFactory,
            abi: META_MORPHO_FACTORY_ABI,
            functionName: "createMetaMorpho",
            args: [
                address, // initialOwner
                BigInt(timelock), // initialTimelock
                selectedAsset as `0x${string}`, // asset
                vaultName, // name
                vaultSymbol, // symbol
                salt, // salt
            ],
        });
    };

    // Handle transaction confirmation
    useEffect(() => {
        if (isConfirmed && receipt) {
            // Extract vault address from logs
            // The CreateMetaMorpho event emits the new vault address
            const vaultAddress = receipt.logs[0]?.topics[1];
            if (vaultAddress) {
                const formattedAddress = `0x${vaultAddress.slice(26)}`;
                setDeployedVaultAddress(formattedAddress);
                setStep("success");

                // Register vault in database
                fetch("/api/morpho/vaults", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chainId: selectedChain,
                        vaultAddress: formattedAddress,
                        factoryVersion: "v1.1",
                        asset: selectedAsset,
                        assetSymbol: selectedAssetDetails?.symbol || "",
                        name: vaultName,
                        symbol: vaultSymbol,
                        txHash: txHash,
                    }),
                }).catch(console.error);

                onSuccess?.(formattedAddress, txHash || "");
            }
        }
    }, [isConfirmed, receipt, txHash, selectedChain, selectedAsset, selectedAssetDetails, vaultName, vaultSymbol, onSuccess]);

    // Handle transaction rejection/error - go back to confirm step
    useEffect(() => {
        if (writeError && step === "deploying") {
            setStep("confirm");
        }
    }, [writeError, step]);

    // Switch chain if needed
    const handleChainSelect = (newChainId: number) => {
        setSelectedChain(newChainId);
        setSelectedAsset(""); // Reset asset when chain changes
        if (isConnected && chainId !== newChainId) {
            switchChain({ chainId: newChainId });
        }
    };

    const canProceed = () => {
        switch (step) {
            case "chain":
                return true;
            case "asset":
                return !!selectedAsset;
            case "details":
                return vaultName.length >= 3 && vaultSymbol.length >= 2;
            case "confirm":
                return isConnected && chainId === selectedChain;
            default:
                return false;
        }
    };

    const nextStep = () => {
        switch (step) {
            case "chain":
                setStep("asset");
                break;
            case "asset":
                setStep("details");
                break;
            case "details":
                setStep("confirm");
                break;
            case "confirm":
                handleDeploy();
                break;
        }
    };

    const prevStep = () => {
        switch (step) {
            case "asset":
                setStep("chain");
                break;
            case "details":
                setStep("asset");
                break;
            case "confirm":
                setStep("details");
                break;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg mx-4 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-slate-700">
                    <h2 className="text-xl font-semibold text-white">Create Morpho Vault</h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Deploy your own MetaMorpho vault to earn yield
                    </p>

                    {/* Progress indicators */}
                    <div className="flex items-center gap-2 mt-4">
                        {["chain", "asset", "details", "confirm"].map((s, i) => (
                            <div
                                key={s}
                                className={`h-1 flex-1 rounded-full ${
                                    step === s
                                        ? "bg-cyan-500"
                                        : ["chain", "asset", "details", "confirm"].indexOf(step) > i
                                        ? "bg-cyan-500/50"
                                        : "bg-slate-700"
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 min-h-[300px]">
                    {/* Step 1: Chain Selection */}
                    {step === "chain" && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white">Select Chain</h3>
                            <p className="text-sm text-slate-400">
                                Choose which network to deploy your vault on
                            </p>
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                {AVAILABLE_CHAINS.map((chain) => (
                                    <button
                                        key={chain.id}
                                        onClick={() => handleChainSelect(chain.id)}
                                        className={`p-4 rounded-lg border transition-all ${
                                            selectedChain === chain.id
                                                ? "border-cyan-500 bg-cyan-500/10"
                                                : "border-slate-700 hover:border-slate-600"
                                        }`}
                                    >
                                        <div className="text-left">
                                            <div className="font-medium text-white">
                                                {CHAIN_NAMES[chain.id]}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                {chain.id === mainnet.id
                                                    ? "Higher liquidity"
                                                    : "Lower gas fees"}
                                            </div>
                                        </div>
                                        {selectedChain === chain.id && (
                                            <Check className="absolute top-2 right-2 h-4 w-4 text-cyan-500" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Asset Selection */}
                    {step === "asset" && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white">Select Asset</h3>
                            <p className="text-sm text-slate-400">
                                Choose the underlying token for your vault
                            </p>
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                {VAULT_ASSETS[selectedChain]?.map((asset) => (
                                    <button
                                        key={asset.address}
                                        onClick={() => setSelectedAsset(asset.address)}
                                        className={`p-4 rounded-lg border transition-all ${
                                            selectedAsset === asset.address
                                                ? "border-cyan-500 bg-cyan-500/10"
                                                : "border-slate-700 hover:border-slate-600"
                                        }`}
                                    >
                                        <div className="text-left">
                                            <div className="font-medium text-white">{asset.symbol}</div>
                                            <div className="text-xs text-slate-400 mt-1 font-mono">
                                                {asset.address.slice(0, 6)}...{asset.address.slice(-4)}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Vault Details */}
                    {step === "details" && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white">Vault Details</h3>
                            <p className="text-sm text-slate-400">
                                Configure your vault&apos;s name and settings
                            </p>

                            <div className="space-y-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Vault Name
                                    </label>
                                    <input
                                        type="text"
                                        value={vaultName}
                                        onChange={(e) => setVaultName(e.target.value)}
                                        placeholder={`My ${selectedAssetDetails?.symbol || ""} Vault`}
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Vault Symbol
                                    </label>
                                    <input
                                        type="text"
                                        value={vaultSymbol}
                                        onChange={(e) => setVaultSymbol(e.target.value.toUpperCase())}
                                        placeholder={`mm${selectedAssetDetails?.symbol || ""}`}
                                        maxLength={10}
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Timelock Period
                                    </label>
                                    <select
                                        value={timelock}
                                        onChange={(e) => setTimelock(parseInt(e.target.value))}
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    >
                                        <option value={0}>No timelock</option>
                                        <option value={3600}>1 hour</option>
                                        <option value={86400}>1 day (recommended)</option>
                                        <option value={259200}>3 days</option>
                                        <option value={604800}>7 days</option>
                                    </select>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Time required before changes take effect
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Confirm */}
                    {step === "confirm" && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white">Confirm Deployment</h3>
                            <p className="text-sm text-slate-400">
                                Review your vault configuration
                            </p>

                            <div className="bg-slate-800 rounded-lg p-4 space-y-3 mt-4">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Chain</span>
                                    <span className="text-white font-medium">
                                        {CHAIN_NAMES[selectedChain]}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Asset</span>
                                    <span className="text-white font-medium">
                                        {selectedAssetDetails?.symbol}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Name</span>
                                    <span className="text-white font-medium">{vaultName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Symbol</span>
                                    <span className="text-white font-medium">{vaultSymbol}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Timelock</span>
                                    <span className="text-white font-medium">
                                        {timelock === 0
                                            ? "None"
                                            : timelock < 86400
                                            ? `${timelock / 3600} hour(s)`
                                            : `${timelock / 86400} day(s)`}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Owner</span>
                                    <span className="text-white font-mono text-sm">
                                        {address?.slice(0, 6)}...{address?.slice(-4)}
                                    </span>
                                </div>
                            </div>

                            {!isConnected && (
                                <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-sm">
                                    <Wallet className="h-4 w-4" />
                                    <span>Connect your wallet to deploy</span>
                                </div>
                            )}

                            {isConnected && chainId !== selectedChain && (
                                <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-sm">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span>
                                        Please switch to {CHAIN_NAMES[selectedChain]} to deploy
                                    </span>
                                </div>
                            )}

                            {writeError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                    {writeError.message.includes("User rejected")
                                        ? "Transaction rejected"
                                        : "Failed to deploy vault. Please try again."}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 5: Deploying */}
                    {step === "deploying" && (
                        <div className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="h-12 w-12 text-cyan-500 animate-spin" />
                            <h3 className="text-lg font-medium text-white mt-4">
                                {isWriting
                                    ? "Confirm in wallet..."
                                    : isConfirming
                                    ? "Deploying vault..."
                                    : "Processing..."}
                            </h3>
                            <p className="text-sm text-slate-400 mt-2 text-center">
                                {isWriting
                                    ? "Please confirm the transaction in your wallet"
                                    : "This may take a few moments"}
                            </p>
                            {txHash && (
                                <div className="mt-4 font-mono text-xs text-slate-500">
                                    TX: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 6: Success */}
                    {step === "success" && (
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Check className="h-6 w-6 text-green-500" />
                            </div>
                            <h3 className="text-lg font-medium text-white mt-4">
                                Vault Deployed!
                            </h3>
                            <p className="text-sm text-slate-400 mt-2 text-center">
                                Your MetaMorpho vault is now live
                            </p>

                            <div className="mt-4 p-3 bg-slate-800 rounded-lg w-full">
                                <div className="text-xs text-slate-400 mb-1">Vault Address</div>
                                <div className="font-mono text-sm text-white break-all">
                                    {deployedVaultAddress}
                                </div>
                            </div>

                            {txHash && (
                                <a
                                    href={`${BLOCK_EXPLORERS[selectedChain]}/tx/${txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 text-sm text-cyan-400 hover:text-cyan-300"
                                >
                                    View on Explorer
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700 flex justify-between">
                    {step !== "deploying" && step !== "success" && (
                        <>
                            <button
                                onClick={step === "chain" ? onClose : prevStep}
                                className="px-4 py-2 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                {step === "chain" ? "Cancel" : "Back"}
                            </button>

                            <button
                                onClick={nextStep}
                                disabled={!canProceed()}
                                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                            >
                                {step === "confirm" ? (
                                    <>
                                        Deploy Vault
                                        <Check className="h-4 w-4" />
                                    </>
                                ) : (
                                    <>
                                        Continue
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </>
                    )}

                    {step === "success" && (
                        <button
                            onClick={onClose}
                            className="w-full px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors"
                        >
                            Done
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
