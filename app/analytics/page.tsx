"use client";

import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { getAllPools } from "@/lib/amm";
import { useEffect, useState } from "react";
import { Pool } from "@/lib/amm";

export default function AnalyticsPage() {
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

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col gap-8 p-6">
        <div className="container mx-auto">
          <div className="flex justify-center items-center p-8">
            <div className="text-gray-400">Loading analytics...</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col gap-8 p-6">
      <div className="container mx-auto">
        <AnalyticsDashboard pools={allPools} />
      </div>
    </main>
  );
}