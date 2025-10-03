"use client";

import { useState, useEffect, useRef } from "react";
import { Token, getAllAvailableTokens, searchTokens, addCustomToken } from "@/lib/tokens";

interface TokenSelectorProps {
  selectedToken: Token | null;
  onTokenSelect: (token: Token) => void;
  excludeToken?: Token | null;
  label: string;
  placeholder?: string;
}

export function TokenSelector({
  selectedToken,
  onTokenSelect,
  excludeToken,
  label,
  placeholder = "Select a token"
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [customTokenInput, setCustomTokenInput] = useState("");
  const [addingCustomToken, setAddingCustomToken] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadTokens() {
      try {
        setLoading(true);
        const availableTokens = await getAllAvailableTokens();
        setTokens(availableTokens);
        setFilteredTokens(availableTokens);
      } catch (error) {
        console.error("Error loading tokens:", error);
        // Fallback to empty array if loading fails
        setTokens([]);
        setFilteredTokens([]);
      } finally {
        setLoading(false);
      }
    }

    loadTokens();
  }, []);

  useEffect(() => {
    const filtered = searchTokens(tokens, searchQuery);
    const filteredWithoutExcluded = excludeToken
      ? filtered.filter(token => token.fullAddress !== excludeToken.fullAddress)
      : filtered;
    setFilteredTokens(filteredWithoutExcluded);
  }, [searchQuery, tokens, excludeToken]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTokenSelect = (token: Token) => {
    onTokenSelect(token);
    setIsOpen(false);
    setSearchQuery("");
    setCustomTokenInput("");
  };

  const handleAddCustomToken = async () => {
    if (!customTokenInput.trim()) return;

    try {
      setAddingCustomToken(true);
      const customToken = await addCustomToken(customTokenInput.trim());

      if (customToken) {
        // Add to tokens list if not already present
        const exists = tokens.find(t => t.fullAddress === customToken.fullAddress);
        if (!exists) {
          const updatedTokens = [...tokens, customToken].sort((a, b) => a.symbol.localeCompare(b.symbol));
          setTokens(updatedTokens);
        }

        handleTokenSelect(customToken);
        alert(`Successfully added ${customToken.symbol} (${customToken.name})`);
      }
    } catch (error) {
      alert(`Error adding custom token: ${(error as Error).message}`);
    } finally {
      setAddingCustomToken(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
      >
        {selectedToken ? (
          <div className="flex items-center">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold mr-3">
              {selectedToken.symbol.charAt(0)}
            </div>
            <div>
              <div className="font-medium">{selectedToken.symbol}</div>
              <div className="text-sm text-gray-400 truncate">{selectedToken.name}</div>
            </div>
          </div>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}

        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-600">
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Token List */}
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-400">Loading tokens...</div>
            ) : filteredTokens.length > 0 ? (
              filteredTokens.map((token) => (
                <button
                  key={token.fullAddress}
                  onClick={() => handleTokenSelect(token)}
                  className="w-full p-3 hover:bg-gray-600 text-left flex items-center transition-colors"
                >
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold mr-3">
                    {token.symbol.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white">{token.symbol}</div>
                    <div className="text-sm text-gray-400 truncate">{token.name}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-gray-400">
                {searchQuery ? "No tokens found" : "No tokens available"}
              </div>
            )}
          </div>

          {/* Add Custom Token */}
          <div className="p-3 border-t border-gray-600">
            <div className="text-xs text-gray-400 mb-2">Add custom token:</div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="CONTRACT.TOKEN-NAME"
                value={customTokenInput}
                onChange={(e) => setCustomTokenInput(e.target.value)}
                className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={handleAddCustomToken}
                disabled={addingCustomToken || !customTokenInput.trim()}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded text-xs transition-colors"
              >
                {addingCustomToken ? "..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}