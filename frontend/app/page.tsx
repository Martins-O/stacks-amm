import { Swap } from "@/components/swap";
import { CreatePool } from "@/components/create-pool";
import { NoPoolsFound } from "@/components/no-pools-found";
import { getAllPools } from "@/lib/amm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const allPools = await getAllPools();

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
            {allPools.length > 0 ? (
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
