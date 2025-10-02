import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { getAllPools } from "@/lib/amm";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const allPools = await getAllPools();

  return (
    <main className="flex min-h-screen flex-col gap-8 p-6">
      <div className="container mx-auto">
        <AnalyticsDashboard pools={allPools} />
      </div>
    </main>
  );
}