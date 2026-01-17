"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { RiskTolerance } from "@/components/curate/quick-start";
import { AllocationRecommendation, RecommendedAllocation } from "@/components/curate/recommendation-display";

const STORAGE_KEY = "fabrknt_paper_portfolio";
const HISTORY_KEY = "fabrknt_paper_history";
const COMPLETED_KEY = "fabrknt_completed_pools";
const SNAPSHOTS_KEY = "fabrknt_performance_snapshots";

// Performance snapshot - captured on each visit
export interface PerformanceSnapshot {
    timestamp: string;
    portfolioId: string; // Links to PaperPortfolioEntry.id
    pools: {
        poolId: string;
        currentApy: number;
        savedApy: number; // APY when allocation was created
    }[];
    totalExpectedApy: number;
    totalCurrentApy: number;
}

// Performance metrics calculated from snapshots
export interface PerformanceMetrics {
    portfolioId: string;
    daysSinceCreated: number;
    savedApy: number;
    currentApy: number;
    apyChange: number; // percentage change
    apyTrend: "up" | "down" | "stable";
    expectedYieldToDate: number;
    snapshots: PerformanceSnapshot[];
    lastUpdated: string;
}

// Paper portfolio entry for history tracking
export interface PaperPortfolioEntry {
    id: string;
    allocation: AllocationRecommendation;
    riskTolerance: RiskTolerance;
    createdAt: string;
    notes?: string;
}

interface AllocationContextType {
    // The user's allocation from Get Started
    allocation: AllocationRecommendation | null;
    riskTolerance: RiskTolerance | null;

    // Actions
    setAllocation: (allocation: AllocationRecommendation, risk: RiskTolerance) => void;
    clearAllocation: () => void;

    // Paper portfolio history (localStorage)
    paperHistory: PaperPortfolioEntry[];
    saveToPaperHistory: (notes?: string) => void;
    deleteFromPaperHistory: (id: string) => void;
    restoreFromPaperHistory: (id: string) => void;

    // Execution tracking
    completedPools: Set<string>;
    togglePoolComplete: (poolId: string) => void;
    isPoolComplete: (poolId: string) => boolean;
    allPoolsCompleted: boolean;
    completedCount: number;

    // Performance tracking
    captureSnapshot: (portfolioId: string, currentApyData?: Record<string, number>) => void;
    getPerformanceMetrics: (portfolioId: string) => PerformanceMetrics | null;
    getAllPerformanceMetrics: () => PerformanceMetrics[];
    trackingDays: number; // How many days user has been tracking

    // Helpers
    hasAllocation: boolean;
    isPoolInAllocation: (poolId: string) => boolean;
    getPoolAllocation: (poolId: string) => RecommendedAllocation | undefined;
    getAllocatedPoolIds: () => string[];
}

const AllocationContext = createContext<AllocationContextType | null>(null);

// Helper to safely access localStorage
function getFromStorage<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue;
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
}

function saveToStorage<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Storage full or unavailable
    }
}

function removeFromStorage(key: string): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.removeItem(key);
    } catch {
        // Storage unavailable
    }
}

export function AllocationProvider({ children }: { children: ReactNode }) {
    const [allocation, setAllocationState] = useState<AllocationRecommendation | null>(null);
    const [riskTolerance, setRiskToleranceState] = useState<RiskTolerance | null>(null);
    const [paperHistory, setPaperHistory] = useState<PaperPortfolioEntry[]>([]);
    const [completedPools, setCompletedPools] = useState<Set<string>>(new Set());
    const [snapshots, setSnapshots] = useState<PerformanceSnapshot[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const savedPortfolio = getFromStorage<{ allocation: AllocationRecommendation; riskTolerance: RiskTolerance } | null>(STORAGE_KEY, null);
        if (savedPortfolio) {
            setAllocationState(savedPortfolio.allocation);
            setRiskToleranceState(savedPortfolio.riskTolerance);
        }

        const savedHistory = getFromStorage<PaperPortfolioEntry[]>(HISTORY_KEY, []);
        setPaperHistory(savedHistory);

        const savedCompleted = getFromStorage<string[]>(COMPLETED_KEY, []);
        setCompletedPools(new Set(savedCompleted));

        const savedSnapshots = getFromStorage<PerformanceSnapshot[]>(SNAPSHOTS_KEY, []);
        // Prune old snapshots (keep last 90 days)
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const recentSnapshots = savedSnapshots.filter(
            s => new Date(s.timestamp) > ninetyDaysAgo
        );
        setSnapshots(recentSnapshots);
        if (recentSnapshots.length !== savedSnapshots.length) {
            saveToStorage(SNAPSHOTS_KEY, recentSnapshots);
        }

        setIsHydrated(true);
    }, []);

    const setAllocation = useCallback((newAllocation: AllocationRecommendation, risk: RiskTolerance) => {
        setAllocationState(newAllocation);
        setRiskToleranceState(risk);
        // Persist to localStorage
        saveToStorage(STORAGE_KEY, { allocation: newAllocation, riskTolerance: risk });
    }, []);

    const clearAllocation = useCallback(() => {
        setAllocationState(null);
        setRiskToleranceState(null);
        setCompletedPools(new Set());
        removeFromStorage(STORAGE_KEY);
        removeFromStorage(COMPLETED_KEY);
    }, []);

    // Toggle pool completion status
    const togglePoolComplete = useCallback((poolId: string) => {
        setCompletedPools(prev => {
            const next = new Set(prev);
            if (next.has(poolId)) {
                next.delete(poolId);
            } else {
                next.add(poolId);
            }
            saveToStorage(COMPLETED_KEY, [...next]);
            return next;
        });
    }, []);

    const isPoolComplete = useCallback((poolId: string) => {
        return completedPools.has(poolId);
    }, [completedPools]);

    const allPoolsCompleted = allocation
        ? allocation.allocations.every(a => completedPools.has(a.poolId))
        : false;

    const completedCount = allocation
        ? allocation.allocations.filter(a => completedPools.has(a.poolId)).length
        : 0;

    // Save current allocation to paper history
    const saveToPaperHistory = useCallback((notes?: string) => {
        if (!allocation || !riskTolerance) return;

        const entry: PaperPortfolioEntry = {
            id: `paper_${Date.now()}`,
            allocation,
            riskTolerance,
            createdAt: new Date().toISOString(),
            notes,
        };

        const newHistory = [entry, ...paperHistory].slice(0, 10); // Keep last 10
        setPaperHistory(newHistory);
        saveToStorage(HISTORY_KEY, newHistory);
    }, [allocation, riskTolerance, paperHistory]);

    // Delete from paper history
    const deleteFromPaperHistory = useCallback((id: string) => {
        const newHistory = paperHistory.filter(entry => entry.id !== id);
        setPaperHistory(newHistory);
        saveToStorage(HISTORY_KEY, newHistory);
    }, [paperHistory]);

    // Restore allocation from paper history
    const restoreFromPaperHistory = useCallback((id: string) => {
        const entry = paperHistory.find(e => e.id === id);
        if (entry) {
            setAllocationState(entry.allocation);
            setRiskToleranceState(entry.riskTolerance);
            saveToStorage(STORAGE_KEY, { allocation: entry.allocation, riskTolerance: entry.riskTolerance });
        }
    }, [paperHistory]);

    const isPoolInAllocation = useCallback((poolId: string) => {
        if (!allocation) return false;
        return allocation.allocations.some(a => a.poolId === poolId);
    }, [allocation]);

    const getPoolAllocation = useCallback((poolId: string) => {
        if (!allocation) return undefined;
        return allocation.allocations.find(a => a.poolId === poolId);
    }, [allocation]);

    const getAllocatedPoolIds = useCallback(() => {
        if (!allocation) return [];
        return allocation.allocations.map(a => a.poolId);
    }, [allocation]);

    // Capture a performance snapshot for a portfolio
    const captureSnapshot = useCallback((portfolioId: string, currentApyData?: Record<string, number>) => {
        const entry = paperHistory.find(e => e.id === portfolioId);
        if (!entry) return;

        // Check if we already have a snapshot today for this portfolio
        const today = new Date().toDateString();
        const hasSnapshotToday = snapshots.some(
            s => s.portfolioId === portfolioId && new Date(s.timestamp).toDateString() === today
        );
        if (hasSnapshotToday) return; // Only one snapshot per day

        const snapshot: PerformanceSnapshot = {
            timestamp: new Date().toISOString(),
            portfolioId,
            pools: entry.allocation.allocations.map(a => ({
                poolId: a.poolId,
                savedApy: a.apy,
                currentApy: currentApyData?.[a.poolId] ?? a.apy, // Use provided data or fallback to saved
            })),
            totalExpectedApy: entry.allocation.summary.expectedApy,
            totalCurrentApy: currentApyData
                ? entry.allocation.allocations.reduce(
                    (sum, a) => sum + ((currentApyData[a.poolId] ?? a.apy) * a.allocation / 100),
                    0
                  )
                : entry.allocation.summary.expectedApy,
        };

        const newSnapshots = [...snapshots, snapshot];
        setSnapshots(newSnapshots);
        saveToStorage(SNAPSHOTS_KEY, newSnapshots);
    }, [paperHistory, snapshots]);

    // Get performance metrics for a specific portfolio
    const getPerformanceMetrics = useCallback((portfolioId: string): PerformanceMetrics | null => {
        const entry = paperHistory.find(e => e.id === portfolioId);
        if (!entry) return null;

        const portfolioSnapshots = snapshots
            .filter(s => s.portfolioId === portfolioId)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        const createdAt = new Date(entry.createdAt);
        const now = new Date();
        const daysSinceCreated = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

        const savedApy = entry.allocation.summary.expectedApy;
        const latestSnapshot = portfolioSnapshots[portfolioSnapshots.length - 1];
        const currentApy = latestSnapshot?.totalCurrentApy ?? savedApy;
        const apyChange = savedApy > 0 ? ((currentApy - savedApy) / savedApy) * 100 : 0;

        // Determine trend based on recent snapshots
        let apyTrend: "up" | "down" | "stable" = "stable";
        if (portfolioSnapshots.length >= 2) {
            const recent = portfolioSnapshots.slice(-3);
            const firstApy = recent[0].totalCurrentApy;
            const lastApy = recent[recent.length - 1].totalCurrentApy;
            if (lastApy > firstApy * 1.02) apyTrend = "up";
            else if (lastApy < firstApy * 0.98) apyTrend = "down";
        }

        // Calculate expected yield to date (simple calculation)
        const yearFraction = daysSinceCreated / 365;
        const expectedYieldToDate = entry.allocation.summary.totalAmount * (currentApy / 100) * yearFraction;

        return {
            portfolioId,
            daysSinceCreated,
            savedApy,
            currentApy,
            apyChange,
            apyTrend,
            expectedYieldToDate,
            snapshots: portfolioSnapshots,
            lastUpdated: latestSnapshot?.timestamp ?? entry.createdAt,
        };
    }, [paperHistory, snapshots]);

    // Get performance metrics for all portfolios
    const getAllPerformanceMetrics = useCallback((): PerformanceMetrics[] => {
        return paperHistory
            .map(entry => getPerformanceMetrics(entry.id))
            .filter((m): m is PerformanceMetrics => m !== null);
    }, [paperHistory, getPerformanceMetrics]);

    // Calculate how many days user has been tracking
    const trackingDays = paperHistory.length > 0
        ? Math.floor(
            (new Date().getTime() - new Date(paperHistory[paperHistory.length - 1].createdAt).getTime())
            / (1000 * 60 * 60 * 24)
          )
        : 0;

    return (
        <AllocationContext.Provider
            value={{
                allocation,
                riskTolerance,
                setAllocation,
                clearAllocation,
                paperHistory,
                saveToPaperHistory,
                deleteFromPaperHistory,
                restoreFromPaperHistory,
                completedPools,
                togglePoolComplete,
                isPoolComplete,
                allPoolsCompleted,
                completedCount,
                captureSnapshot,
                getPerformanceMetrics,
                getAllPerformanceMetrics,
                trackingDays,
                hasAllocation: allocation !== null,
                isPoolInAllocation,
                getPoolAllocation,
                getAllocatedPoolIds,
            }}
        >
            {children}
        </AllocationContext.Provider>
    );
}

export function useAllocation() {
    const context = useContext(AllocationContext);
    if (!context) {
        throw new Error("useAllocation must be used within an AllocationProvider");
    }
    return context;
}

// Optional hook that doesn't throw if used outside provider
export function useAllocationOptional() {
    return useContext(AllocationContext);
}
