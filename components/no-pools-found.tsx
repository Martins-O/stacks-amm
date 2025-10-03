"use client";

export function NoPoolsFound() {
  return (
    <div className="bg-gray-800 p-6 rounded-lg text-center">
      <p className="text-gray-400 text-lg">No pools found</p>
      <p className="text-gray-500 text-sm mt-2 mb-4">
        Create your first pool to start trading
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
      >
        🔄 Refresh Pools
      </button>
      <p className="text-gray-500 text-xs mt-2">
        Pool indexing may take a few moments after creation
      </p>
    </div>
  );
}