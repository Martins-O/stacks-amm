"use client";

import { createPool } from "@/lib/amm";
import { useStacks } from "@/hooks/use-stacks";
import { useState } from "react";
import { TokenSelector } from "./token-selector";
import { Token } from "@/lib/tokens";

export function CreatePool() {
  const { address, openContractCall } = useStacks();
  const [selectedToken0, setSelectedToken0] = useState<Token | null>(null);
  const [selectedToken1, setSelectedToken1] = useState<Token | null>(null);
  const [fee, setFee] = useState("300");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePool = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    if (!selectedToken0 || !selectedToken1) {
      alert("Please select both tokens");
      return;
    }

    if (selectedToken0.fullAddress === selectedToken1.fullAddress) {
      alert("Cannot create a pool with the same token");
      return;
    }

    try {
      setIsCreating(true);
      const txOptions = await createPool(selectedToken0.fullAddress, selectedToken1.fullAddress, parseInt(fee));

      await openContractCall({
        ...txOptions,
        onFinish: (data: unknown) => {
          console.log("Pool creation transaction:", data);
          alert(`Pool creation transaction submitted! Creating ${selectedToken0.symbol}/${selectedToken1.symbol} pool.`);
          setSelectedToken0(null);
          setSelectedToken1(null);
          setFee("300");
        },
      });
    } catch (error) {
      console.error("Error creating pool:", error);
      alert("Error creating pool: " + (error as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-6">Create New Pool</h2>

      <form onSubmit={handleCreatePool} className="space-y-4">
        <TokenSelector
          selectedToken={selectedToken0}
          onTokenSelect={setSelectedToken0}
          excludeToken={selectedToken1}
          label="Select First Token"
          placeholder="Choose first token..."
        />

        <TokenSelector
          selectedToken={selectedToken1}
          onTokenSelect={setSelectedToken1}
          excludeToken={selectedToken0}
          label="Select Second Token"
          placeholder="Choose second token..."
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Fee Tier (basis points)
          </label>
          <select
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="100">0.01% (100 bp) - Stable pairs</option>
            <option value="300">0.3% (300 bp) - Standard pairs</option>
            <option value="1000">1% (1000 bp) - Exotic pairs</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isCreating || !address || !selectedToken0 || !selectedToken1}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          {isCreating ? "Creating Pool..." :
           selectedToken0 && selectedToken1 ? `Create ${selectedToken0.symbol}/${selectedToken1.symbol} Pool` :
           "Select Tokens to Create Pool"}
        </button>

        {!address && (
          <p className="text-yellow-400 text-sm text-center">
            Connect your wallet to create a pool
          </p>
        )}

        {selectedToken0 && selectedToken1 && (
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-300 mb-1">Pool Preview:</div>
            <div className="text-lg font-semibold text-white">
              {selectedToken0.symbol}/{selectedToken1.symbol}
            </div>
            <div className="text-xs text-gray-400">
              Fee: {(parseInt(fee) / 100).toFixed(2)}% •
              Estimated gas: ~0.01 STX
            </div>
          </div>
        )}
      </form>

      <div className="mt-6 p-4 bg-gray-700 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">💡 How to create a pool:</h3>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Select two different tokens from the dropdowns</li>
          <li>• Available: MOCK token and SIP010 standard token</li>
          <li>• Or add custom tokens using the &quot;Add custom token&quot; feature</li>
          <li>• Choose fee tier (0.3% recommended for most pairs)</li>
          <li>• Click &quot;Create Pool&quot; and confirm in your wallet</li>
        </ul>
        <div className="mt-3 p-2 bg-green-900/30 border border-green-600 rounded">
          <div className="text-xs text-green-300">
            <strong>Ready to go!</strong> Both MOCK and MOCK-2 tokens are deployed and ready for pool creation. Select different tokens from each dropdown.
          </div>
        </div>
      </div>
    </div>
  );
}