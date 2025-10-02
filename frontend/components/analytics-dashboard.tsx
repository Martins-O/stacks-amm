"use client";

import { Pool } from "@/lib/amm";
import { useEffect, useState } from "react";
import { fetchPoolAnalytics, fetchPoolPrice, calculatePoolAPY, PoolAnalytics } from "@/lib/analytics";

export interface AnalyticsDashboardProps {
  pools: Pool[];
}

export function AnalyticsDashboard({ pools }: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<Record<string, PoolAnalytics>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      const analytics: Record<string, PoolAnalytics> = {};

      for (const pool of pools) {
        try {
          const poolAnalytics = await fetchPoolAnalytics(pool.id);
          const currentPrice = await fetchPoolPrice(pool.id);
          const apy = await calculatePoolAPY(pool.id);

          analytics[pool.id] = {
            ...poolAnalytics,
            currentPrice,
            apy,
          };
        } catch (error) {
          console.error(`Failed to fetch analytics for pool ${pool.id}:`, error);
        }
      }

      setAnalyticsData(analytics);
      setLoading(false);
    }

    if (pools.length > 0) {
      loadAnalytics();
    }
  }, [pools]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-400">Loading analytics...</div>
      </div>
    );
  }

  if (pools.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-400">No pools available for analytics</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Pool Analytics Dashboard</h2>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <OverviewCard
          title="Total Pools"
          value={pools.length.toString()}
          subtitle="Active pools"
        />
        <OverviewCard
          title="Total Volume"
          value={formatVolume(getTotalVolume(analyticsData))}
          subtitle="Across all pools"
        />
        <OverviewCard
          title="Total Swaps"
          value={getTotalSwaps(analyticsData).toString()}
          subtitle="All time"
        />
      </div>

      {/* Pool Analytics Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="grid grid-cols-8 gap-4 p-4 bg-gray-900 text-sm font-semibold text-gray-300">
          <span>Pool</span>
          <span>Price</span>
          <span>Volume 24h</span>
          <span>Fees Earned</span>
          <span>Swaps</span>
          <span>APY</span>
          <span>Liquidity</span>
          <span>Fee Tier</span>
        </div>

        {pools.map((pool) => {
          const analytics = analyticsData[pool.id];
          const token0Name = pool["token-0"].split(".")[1];
          const token1Name = pool["token-1"].split(".")[1];

          return (
            <PoolAnalyticsRow
              key={pool.id}
              pool={pool}
              analytics={analytics}
              token0Name={token0Name}
              token1Name={token1Name}
            />
          );
        })}
      </div>
    </div>
  );
}

function OverviewCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-sm font-medium text-gray-400 mb-2">{title}</h3>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

function PoolAnalyticsRow({
  pool,
  analytics,
  token0Name,
  token1Name,
}: {
  pool: Pool;
  analytics: PoolAnalytics | undefined;
  token0Name: string;
  token1Name: string;
}) {
  return (
    <div className="grid grid-cols-8 gap-4 p-4 border-b border-gray-700 hover:bg-gray-750 transition-colors">
      <div className="flex items-center">
        <span className="text-white font-medium">
          {token0Name}/{token1Name}
        </span>
      </div>

      <div className="text-gray-300">
        {analytics?.currentPrice ?
          `$${(analytics.currentPrice / 1000000).toFixed(6)}` :
          'N/A'
        }
      </div>

      <div className="text-gray-300">
        {analytics ?
          formatVolume(analytics.totalVolume0 + analytics.totalVolume1) :
          'N/A'
        }
      </div>

      <div className="text-green-400">
        {analytics ?
          `${analytics.totalFeesCollected.toLocaleString()}` :
          'N/A'
        }
      </div>

      <div className="text-gray-300">
        {analytics?.swapCount || 0}
      </div>

      <div className="text-blue-400">
        {analytics?.apy ?
          `${(analytics.apy / 100).toFixed(2)}%` :
          'N/A'
        }
      </div>

      <div className="text-gray-300">
        {pool.liquidity.toLocaleString()}
      </div>

      <div className="text-gray-300">
        {(pool.fee / 100).toFixed(2)}%
      </div>
    </div>
  );
}

function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `$${(volume / 1000000).toFixed(1)}M`;
  } else if (volume >= 1000) {
    return `$${(volume / 1000).toFixed(1)}K`;
  } else {
    return `$${volume.toFixed(0)}`;
  }
}

function getTotalVolume(analyticsData: Record<string, PoolAnalytics>): number {
  return Object.values(analyticsData).reduce(
    (total, analytics) => total + (analytics?.totalVolume0 || 0) + (analytics?.totalVolume1 || 0),
    0
  );
}

function getTotalSwaps(analyticsData: Record<string, PoolAnalytics>): number {
  return Object.values(analyticsData).reduce(
    (total, analytics) => total + (analytics?.swapCount || 0),
    0
  );
}