# Morpho Vault Integration - Technical Specification

## Overview

Enable CURATE users to deploy permissionless lending vaults on Morpho, allowing them to become yield curators with custom allocation strategies.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CURATE Frontend                        │
├─────────────────────────────────────────────────────────────┤
│  VaultCreationWizard  │  VaultDashboard  │  AllocationUI   │
└───────────┬───────────┴────────┬─────────┴────────┬────────┘
            │                    │                  │
            ▼                    ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Routes                              │
├─────────────────────────────────────────────────────────────┤
│  /api/morpho/vaults     │  /api/morpho/markets              │
│  /api/morpho/deploy     │  /api/morpho/allocate             │
└───────────┬─────────────┴────────┬──────────────────────────┘
            │                      │
            ▼                      ▼
┌─────────────────────┐  ┌─────────────────────────────────────┐
│   Morpho SDK        │  │        Wallet Connection            │
│   @morpho-org/*     │  │   wagmi / viem / WalletConnect      │
└─────────┬───────────┘  └─────────────┬───────────────────────┘
          │                            │
          ▼                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Morpho Smart Contracts (Onchain)               │
├─────────────────────────────────────────────────────────────┤
│  VaultV2Factory  │  MetaMorphoFactory  │  Morpho Blue       │
└─────────────────────────────────────────────────────────────┘
```

---

## Contract Addresses

### Ethereum Mainnet

| Contract | Address |
|----------|---------|
| Morpho Blue | `0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb` |
| MetaMorpho Factory V1.1 | `0x1897A8997241C1cD4bD0698647e4EB7213535c24` |
| VaultV2Factory | `0xA1D94F746dEfa1928926b84fB2596c06926C0405` |
| MorphoRegistry | `0x3696c5eAe4a7Ffd04Ea163564571E9CD8Ed9364e` |
| Adaptive Curve IRM | `0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC` |

### Base Mainnet

| Contract | Address |
|----------|---------|
| Morpho Blue | `0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb` |
| MetaMorpho Factory V1.1 | `0x1897A8997241C1cD4bD0698647e4EB7213535c24` |

---

## Dependencies

```bash
# Core Morpho SDKs
pnpm add @morpho-org/blue-sdk @morpho-org/blue-sdk-viem @morpho-org/morpho-ts

# Wallet connection
pnpm add wagmi viem @rainbow-me/rainbowkit

# Additional utilities
pnpm add decimal.js
```

---

## Database Schema

Add to `prisma/schema.prisma`:

```prisma
model MorphoVault {
  id              String   @id @default(cuid())
  userId          String
  chainId         Int
  vaultAddress    String   @unique
  factoryVersion  String   // "v1.1" or "v2"
  asset           String   // Underlying token address
  assetSymbol     String   // e.g., "USDC"
  name            String
  symbol          String
  deployedAt      DateTime @default(now())

  // Curator settings
  curatorAddress  String?
  performanceFee  Float    @default(0)
  managementFee   Float    @default(0)

  // Tracking
  tvl             Float    @default(0)
  totalEarned     Float    @default(0)
  lastSyncedAt    DateTime?

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  allocations     VaultAllocation[]

  @@index([userId])
  @@index([chainId, vaultAddress])
}

model VaultAllocation {
  id              String   @id @default(cuid())
  vaultId         String
  marketId        String   // Morpho market identifier
  allocationCap   Float    // Max allocation percentage
  currentAmount   Float    @default(0)
  updatedAt       DateTime @updatedAt

  vault           MorphoVault @relation(fields: [vaultId], references: [id], onDelete: Cascade)

  @@unique([vaultId, marketId])
}
```

---

## API Routes

### 1. Get Available Markets

`GET /api/morpho/markets`

```typescript
// src/app/api/morpho/markets/route.ts
import { NextResponse } from "next/server";

const MORPHO_API = "https://blue-api.morpho.org/graphql";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chainId = searchParams.get("chainId") || "1";
  const asset = searchParams.get("asset"); // Filter by loan asset

  const query = `
    query GetMarkets($chainId: Int!, $asset: String) {
      markets(
        where: {
          chainId_in: [$chainId]
          ${asset ? `loanAsset_contains_nocase: "${asset}"` : ""}
        }
        first: 100
        orderBy: totalSupplyUsd
        orderDirection: desc
      ) {
        items {
          id
          uniqueKey
          loanAsset {
            address
            symbol
            decimals
          }
          collateralAsset {
            address
            symbol
          }
          lltv
          oracle {
            address
          }
          irm {
            address
          }
          state {
            supplyApy
            borrowApy
            totalSupplyUsd
            totalBorrowUsd
            utilization
          }
        }
      }
    }
  `;

  const response = await fetch(MORPHO_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { chainId: parseInt(chainId), asset } }),
  });

  const data = await response.json();
  return NextResponse.json(data.data.markets);
}
```

### 2. Deploy Vault

`POST /api/morpho/deploy`

```typescript
// src/app/api/morpho/deploy/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    chainId,
    vaultAddress,
    factoryVersion,
    asset,
    assetSymbol,
    name,
    symbol,
    curatorAddress,
    txHash,
  } = body;

  // Validate required fields
  if (!vaultAddress || !chainId || !asset) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Record vault in database
  const vault = await prisma.morphoVault.create({
    data: {
      userId: user.id,
      chainId,
      vaultAddress,
      factoryVersion: factoryVersion || "v1.1",
      asset,
      assetSymbol,
      name,
      symbol,
      curatorAddress: curatorAddress || user.id,
    },
  });

  return NextResponse.json({ vault, txHash });
}
```

### 3. Get User Vaults

`GET /api/morpho/vaults`

```typescript
// src/app/api/morpho/vaults/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vaults = await prisma.morphoVault.findMany({
    where: { userId: user.id },
    include: { allocations: true },
    orderBy: { deployedAt: "desc" },
  });

  return NextResponse.json({ vaults });
}
```

---

## Frontend Components

### 1. Vault Creation Wizard

```typescript
// src/components/morpho/vault-creation-wizard.tsx
"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, encodeFunctionData } from "viem";

// MetaMorpho Factory V1.1 ABI (createMetaMorpho function)
const FACTORY_ABI = [
  {
    name: "createMetaMorpho",
    type: "function",
    inputs: [
      { name: "initialOwner", type: "address" },
      { name: "initialTimelock", type: "uint256" },
      { name: "asset", type: "address" },
      { name: "name", type: "string" },
      { name: "symbol", type: "string" },
      { name: "salt", type: "bytes32" },
    ],
    outputs: [{ name: "metaMorpho", type: "address" }],
  },
] as const;

const FACTORY_ADDRESSES: Record<number, `0x${string}`> = {
  1: "0x1897A8997241C1cD4bD0698647e4EB7213535c24", // Ethereum
  8453: "0x1897A8997241C1cD4bD0698647e4EB7213535c24", // Base
};

interface VaultConfig {
  asset: `0x${string}`;
  assetSymbol: string;
  name: string;
  symbol: string;
  timelock: number; // seconds
}

export function VaultCreationWizard() {
  const { address, chainId } = useAccount();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<VaultConfig>({
    asset: "0x" as `0x${string}`,
    assetSymbol: "",
    name: "",
    symbol: "",
    timelock: 0, // No timelock for initial setup
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleDeploy = async () => {
    if (!address || !chainId) return;

    const factoryAddress = FACTORY_ADDRESSES[chainId];
    if (!factoryAddress) {
      alert("Unsupported chain");
      return;
    }

    // Generate random salt for CREATE2
    const salt = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("")}` as `0x${string}`;

    writeContract({
      address: factoryAddress,
      abi: FACTORY_ABI,
      functionName: "createMetaMorpho",
      args: [
        address, // initialOwner
        BigInt(config.timelock), // initialTimelock
        config.asset, // asset
        config.name, // name
        config.symbol, // symbol
        salt, // salt
      ],
    });
  };

  // Record vault after successful deployment
  useEffect(() => {
    if (isSuccess && hash) {
      // TODO: Parse vault address from transaction receipt
      // Then call POST /api/morpho/deploy to record in database
    }
  }, [isSuccess, hash]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create Morpho Vault</h2>

      {/* Step 1: Select Asset */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Step 1: Select Underlying Asset</h3>
          <AssetSelector
            value={config.asset}
            onChange={(asset, symbol) => setConfig({ ...config, asset, assetSymbol: symbol })}
          />
          <button
            onClick={() => setStep(2)}
            disabled={!config.asset || config.asset === "0x"}
            className="px-4 py-2 bg-cyan-500 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Step 2: Vault Details */}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Step 2: Vault Details</h3>
          <input
            type="text"
            placeholder="Vault Name (e.g., USDC Yield Vault)"
            value={config.name}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Vault Symbol (e.g., yvUSDC)"
            value={config.symbol}
            onChange={(e) => setConfig({ ...config, symbol: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="px-4 py-2 border rounded">
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!config.name || !config.symbol}
              className="px-4 py-2 bg-cyan-500 text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Deploy */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Step 3: Review & Deploy</h3>
          <div className="bg-slate-800 p-4 rounded space-y-2">
            <p><strong>Asset:</strong> {config.assetSymbol}</p>
            <p><strong>Name:</strong> {config.name}</p>
            <p><strong>Symbol:</strong> {config.symbol}</p>
            <p><strong>Owner:</strong> {address}</p>
            <p><strong>Chain:</strong> {chainId === 1 ? "Ethereum" : chainId === 8453 ? "Base" : "Unknown"}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="px-4 py-2 border rounded">
              Back
            </button>
            <button
              onClick={handleDeploy}
              disabled={isPending || isConfirming}
              className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
            >
              {isPending ? "Confirm in Wallet..." : isConfirming ? "Deploying..." : "Deploy Vault"}
            </button>
          </div>
          {isSuccess && (
            <div className="bg-green-500/20 border border-green-500 p-4 rounded">
              Vault deployed successfully! Transaction: {hash}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### 2. Market Selector

```typescript
// src/components/morpho/market-selector.tsx
"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

interface Market {
  id: string;
  uniqueKey: string;
  loanAsset: { address: string; symbol: string };
  collateralAsset: { address: string; symbol: string };
  lltv: string;
  state: {
    supplyApy: number;
    totalSupplyUsd: number;
    utilization: number;
  };
}

interface MarketSelectorProps {
  asset: string; // Filter by loan asset
  selectedMarkets: string[];
  onSelect: (marketId: string) => void;
}

export function MarketSelector({ asset, selectedMarkets, onSelect }: MarketSelectorProps) {
  const { chainId } = useAccount();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMarkets() {
      setLoading(true);
      const res = await fetch(`/api/morpho/markets?chainId=${chainId}&asset=${asset}`);
      const data = await res.json();
      setMarkets(data.items || []);
      setLoading(false);
    }
    if (chainId && asset) fetchMarkets();
  }, [chainId, asset]);

  if (loading) return <div>Loading markets...</div>;

  return (
    <div className="space-y-2">
      <h4 className="font-semibold">Select Markets for Allocation</h4>
      <div className="max-h-96 overflow-y-auto space-y-2">
        {markets.map((market) => (
          <div
            key={market.id}
            onClick={() => onSelect(market.id)}
            className={`p-3 border rounded cursor-pointer transition ${
              selectedMarkets.includes(market.id)
                ? "border-cyan-500 bg-cyan-500/10"
                : "border-slate-700 hover:border-slate-500"
            }`}
          >
            <div className="flex justify-between">
              <span className="font-medium">
                {market.loanAsset.symbol} / {market.collateralAsset.symbol}
              </span>
              <span className="text-green-400">
                {(market.state.supplyApy * 100).toFixed(2)}% APY
              </span>
            </div>
            <div className="text-sm text-slate-400">
              TVL: ${(market.state.totalSupplyUsd / 1e6).toFixed(2)}M |
              LLTV: {(parseFloat(market.lltv) * 100).toFixed(0)}% |
              Util: {(market.state.utilization * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Wallet Configuration

```typescript
// src/lib/wagmi-config.ts
import { createConfig, http } from "wagmi";
import { mainnet, base } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

export const wagmiConfig = createConfig({
  chains: [mainnet, base],
  connectors: [
    injected(),
    walletConnect({ projectId }),
  ],
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_ETH_RPC_URL),
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
  },
});
```

---

## Environment Variables

Add to `.env.example`:

```bash
# Wallet Connect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# RPC URLs
NEXT_PUBLIC_ETH_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY

# Morpho API
MORPHO_API_URL=https://blue-api.morpho.org/graphql
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Add wagmi/viem dependencies
- [ ] Configure wallet connection (RainbowKit or custom)
- [ ] Add Prisma schema for MorphoVault
- [ ] Run database migration

### Phase 2: Read Operations (Week 2)
- [ ] Implement `/api/morpho/markets` endpoint
- [ ] Build MarketSelector component
- [ ] Display available markets with APY/TVL

### Phase 3: Vault Creation (Week 3)
- [ ] Implement VaultCreationWizard
- [ ] Add `/api/morpho/deploy` endpoint
- [ ] Test on Base testnet (Sepolia)
- [ ] Deploy to Base mainnet

### Phase 4: Vault Management (Week 4)
- [ ] Build VaultDashboard component
- [ ] Implement allocation management
- [ ] Add TVL/performance tracking
- [ ] Sync vault data from chain

---

## Security Considerations

1. **No Private Keys** - All transactions signed client-side via wallet
2. **Multisig Recommended** - Production vaults should use Safe multisig as owner
3. **Timelock** - Consider adding timelock for sensitive operations
4. **Dead Deposit** - Initial deposit to prevent inflation attacks
5. **Rate Limiting** - API endpoints rate-limited to prevent abuse
6. **Input Validation** - Validate all addresses and parameters

---

## Testing Checklist

- [ ] Vault creation on Base Sepolia testnet
- [ ] Vault creation on Base mainnet
- [ ] Vault creation on Ethereum mainnet
- [ ] Market data fetching
- [ ] Allocation updates
- [ ] TVL tracking accuracy
- [ ] Error handling (failed transactions, network issues)

---

## References

- [Morpho Vault V2 Docs](https://docs.morpho.org/learn/concepts/vault-v2/)
- [Vault Creation Tutorial](https://docs.morpho.org/curate/tutorials-v2/vault-creation/)
- [Blue SDK](https://docs.morpho.org/tools/offchain/sdks/blue-sdk/)
- [Morpho Addresses](https://docs.morpho.org/get-started/resources/addresses/)
- [MetaMorpho GitHub](https://github.com/morpho-org/metamorpho)
- [Vault V2 GitHub](https://github.com/morpho-org/vault-v2)
