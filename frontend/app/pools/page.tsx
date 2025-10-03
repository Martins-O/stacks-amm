"use client";

import { PoolsList } from "@/components/pools";
import { getAllPools } from "@/lib/amm";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Pool } from "@/lib/amm";

export default function PoolsPage() {
  const [allPools, setAllPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const pools = await getAllPools();
        setAllPools(pools);
      } catch (error) {
        console.error("Error fetching pools:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPools();
  }, []);

  return (
    <main className="flex min-h-screen flex-col gap-8 p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Liquidity Pools</h1>
          <Link
            href="/analytics"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            View Analytics
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="text-gray-400">Loading pools...</div>
          </div>
        ) : allPools.length > 0 ? (
          <PoolsList pools={allPools} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No pools found</p>
            <p className="text-gray-500 text-sm mt-2">
              Create a new pool to start trading
            </p>
          </div>
        )}
      </div>
    </main>
  );
}