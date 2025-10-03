import { STACKS_TESTNET } from "@stacks/network";
import {
  bufferCV,
  fetchCallReadOnlyFunction,
  UIntCV,
} from "@stacks/transactions";

const AMM_CONTRACT_ADDRESS = "STGQVXD8MEEAVRXYNTS6KMWFWDQ7YDJ3Y3PWNP95";
const AMM_CONTRACT_NAME = "amm";

export interface PoolAnalytics {
  totalVolume0: number;
  totalVolume1: number;
  totalFeesCollected: number;
  swapCount: number;
  lastPrice: number;
  currentPrice?: number;
  apy?: number;
}

export async function fetchPoolAnalytics(poolId: string): Promise<PoolAnalytics> {
  try {
    const analyticsResult = await fetchCallReadOnlyFunction({
      contractAddress: AMM_CONTRACT_ADDRESS,
      contractName: AMM_CONTRACT_NAME,
      functionName: "get-pool-analytics",
      functionArgs: [bufferCV(Buffer.from(poolId, "hex"))],
      senderAddress: AMM_CONTRACT_ADDRESS,
      network: STACKS_TESTNET,
    });

    if (analyticsResult.type !== "ok") {
      throw new Error("Failed to fetch pool analytics");
    }

    if (analyticsResult.value.type === "none") {
      // Return default analytics if no data exists
      return {
        totalVolume0: 0,
        totalVolume1: 0,
        totalFeesCollected: 0,
        swapCount: 0,
        lastPrice: 0,
      };
    }

    if (analyticsResult.value.type !== "some" || analyticsResult.value.value.type !== "tuple") {
      throw new Error("Invalid analytics data format");
    }

    const analyticsData = analyticsResult.value.value.value as {
      "total-volume-0": UIntCV;
      "total-volume-1": UIntCV;
      "total-fees-collected": UIntCV;
      "swap-count": UIntCV;
      "last-price": UIntCV;
    };

    return {
      totalVolume0: parseInt(analyticsData["total-volume-0"].value.toString()),
      totalVolume1: parseInt(analyticsData["total-volume-1"].value.toString()),
      totalFeesCollected: parseInt(analyticsData["total-fees-collected"].value.toString()),
      swapCount: parseInt(analyticsData["swap-count"].value.toString()),
      lastPrice: parseInt(analyticsData["last-price"].value.toString()),
    };
  } catch (error) {
    console.error("Error fetching pool analytics:", error);
    // Return default values on error
    return {
      totalVolume0: 0,
      totalVolume1: 0,
      totalFeesCollected: 0,
      swapCount: 0,
      lastPrice: 0,
    };
  }
}

export async function fetchPoolPrice(poolId: string): Promise<number> {
  try {
    const priceResult = await fetchCallReadOnlyFunction({
      contractAddress: AMM_CONTRACT_ADDRESS,
      contractName: AMM_CONTRACT_NAME,
      functionName: "get-pool-price",
      functionArgs: [bufferCV(Buffer.from(poolId, "hex"))],
      senderAddress: AMM_CONTRACT_ADDRESS,
      network: STACKS_TESTNET,
    });

    if (priceResult.type !== "ok" || priceResult.value.type !== "uint") {
      return 0;
    }

    return parseInt(priceResult.value.value.toString());
  } catch (error) {
    console.error("Error fetching pool price:", error);
    return 0;
  }
}

export async function calculatePoolAPY(poolId: string): Promise<number> {
  try {
    const apyResult = await fetchCallReadOnlyFunction({
      contractAddress: AMM_CONTRACT_ADDRESS,
      contractName: AMM_CONTRACT_NAME,
      functionName: "calculate-pool-apy",
      functionArgs: [bufferCV(Buffer.from(poolId, "hex"))],
      senderAddress: AMM_CONTRACT_ADDRESS,
      network: STACKS_TESTNET,
    });

    if (apyResult.type !== "ok" || apyResult.value.type !== "uint") {
      return 0;
    }

    return parseInt(apyResult.value.value.toString());
  } catch (error) {
    console.error("Error calculating pool APY:", error);
    return 0;
  }
}

export function formatPrice(price: number): string {
  if (price === 0) return "N/A";

  // Price is scaled by 1e6 in the contract
  const actualPrice = price / 1000000;

  if (actualPrice < 0.000001) {
    return actualPrice.toExponential(2);
  } else if (actualPrice < 0.01) {
    return actualPrice.toFixed(6);
  } else if (actualPrice < 1) {
    return actualPrice.toFixed(4);
  } else {
    return actualPrice.toFixed(2);
  }
}

export function formatVolume(volume: number): string {
  if (volume >= 1000000000) {
    return `${(volume / 1000000000).toFixed(1)}B`;
  } else if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  } else {
    return volume.toString();
  }
}

export function formatAPY(apy: number): string {
  if (apy === 0) return "N/A";

  // APY is returned as basis points (1/100th of a percent)
  const percentage = apy / 100;

  if (percentage < 0.01) {
    return `${percentage.toFixed(3)}%`;
  } else if (percentage < 1) {
    return `${percentage.toFixed(2)}%`;
  } else {
    return `${percentage.toFixed(1)}%`;
  }
}

export function calculatePriceChange(currentPrice: number, previousPrice: number): {
  change: number;
  percentage: number;
} {
  if (previousPrice === 0) {
    return { change: 0, percentage: 0 };
  }

  const change = currentPrice - previousPrice;
  const percentage = (change / previousPrice) * 100;

  return { change, percentage };
}