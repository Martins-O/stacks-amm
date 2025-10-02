import { PoolsList } from "@/components/pools";
import { getAllPools } from "@/lib/amm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PoolsPage() {
  const allPools = await getAllPools();

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

        {allPools.length > 0 ? (
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