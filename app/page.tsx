"use client";

import { Swap } from "@/components/swap";
import { CreatePool } from "@/components/create-pool";
import { NoPoolsFound } from "@/components/no-pools-found";
import { getAllPools } from "@/lib/amm";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Pool } from "@/lib/amm";

export default function Home() {
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
    <main className="flex min-h-screen flex-col items-center gap-8 p-24">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Stacks AMM</h1>
          <div className="flex gap-4">
            <Link
              href="/pools"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              View Pools
            </Link>
            <Link
              href="/analytics"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Analytics
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Pool Section */}
          <div>
            <CreatePool />
          </div>

          {/* Swap Section */}
          <div>
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="text-gray-400">Loading pools...</div>
              </div>
            ) : allPools.length > 0 ? (
              <Swap pools={allPools} />
            ) : (
              <NoPoolsFound />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
