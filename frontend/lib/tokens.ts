import { STACKS_TESTNET } from "@stacks/network";
import { fetchCallReadOnlyFunction } from "@stacks/transactions";

export interface Token {
  symbol: string;
  name: string;
  contractAddress: string;
  contractName: string;
  fullAddress: string;
  decimals: number;
}

// Available tokens for testing - using actual deployed contract addresses
const KNOWN_TESTNET_TOKENS: Token[] = [
  {
    symbol: "MOCK",
    name: "Mock Token",
    contractAddress: "STGQVXD8MEEAVRXYNTS6KMWFWDQ7YDJ3Y3PWNP95",
    contractName: "mock-token",
    fullAddress: "STGQVXD8MEEAVRXYNTS6KMWFWDQ7YDJ3Y3PWNP95.mock-token",
    decimals: 6,
  },
  {
    symbol: "MOCK-2",
    name: "Mock Token 2",
    contractAddress: "STGQVXD8MEEAVRXYNTS6KMWFWDQ7YDJ3Y3PWNP95",
    contractName: "mock-token-2",
    fullAddress: "STGQVXD8MEEAVRXYNTS6KMWFWDQ7YDJ3Y3PWNP95.mock-token-2",
    decimals: 6,
  },
];

// Function to verify if a token contract implements SIP-010
async function verifySIP010Token(contractAddress: string, contractName: string): Promise<boolean> {
  try {
    // Try to call the get-name function which is required by SIP-010
    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: "get-name",
      functionArgs: [],
      senderAddress: contractAddress,
      network: STACKS_TESTNET,
    });

    return result.type === "ok";
  } catch (error) {
    console.error(`Error verifying SIP-010 token ${contractAddress}.${contractName}:`, error);
    return false;
  }
}

// Function to get token metadata
async function getTokenMetadata(contractAddress: string, contractName: string): Promise<Partial<Token> | null> {
  try {
    const [nameResult, symbolResult, decimalsResult] = await Promise.all([
      fetchCallReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: "get-name",
        functionArgs: [],
        senderAddress: contractAddress,
        network: STACKS_TESTNET,
      }),
      fetchCallReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: "get-symbol",
        functionArgs: [],
        senderAddress: contractAddress,
        network: STACKS_TESTNET,
      }),
      fetchCallReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: "get-decimals",
        functionArgs: [],
        senderAddress: contractAddress,
        network: STACKS_TESTNET,
      }),
    ]);

    if (nameResult.type === "ok" && symbolResult.type === "ok" && decimalsResult.type === "ok") {
      const nameValue = nameResult.value.type === "ascii" ? nameResult.value.value : contractName;
      const symbolValue = symbolResult.value.type === "ascii" ? symbolResult.value.value : contractName.toUpperCase();
      const decimalsValue = decimalsResult.value.type === "uint" ? parseInt(decimalsResult.value.value.toString()) : 6;

      return {
        name: nameValue,
        symbol: symbolValue,
        decimals: decimalsValue,
        contractAddress,
        contractName,
        fullAddress: `${contractAddress}.${contractName}`,
      };
    }
  } catch (error) {
    console.error(`Error getting token metadata for ${contractAddress}.${contractName}:`, error);
  }

  return null;
}

// Function to discover tokens from recent transactions (simplified approach)
async function discoverTokensFromTransactions(): Promise<Token[]> {
  try {
    // For now, we'll return the known tokens without validation
    // In production, you would validate these against actual deployed contracts
    return KNOWN_TESTNET_TOKENS;
  } catch (error) {
    console.error("Error discovering tokens:", error);
    return KNOWN_TESTNET_TOKENS;
  }
}

// Main function to get all available tokens
export async function getAllAvailableTokens(): Promise<Token[]> {
  try {
    // Start with known tokens and verify them
    const verifiedTokens = await discoverTokensFromTransactions();

    // Remove duplicates based on full address
    const uniqueTokens = verifiedTokens.filter((token, index, self) =>
      index === self.findIndex(t => t.fullAddress === token.fullAddress)
    );

    // Sort by symbol for better UX
    return uniqueTokens.sort((a, b) => a.symbol.localeCompare(b.symbol));
  } catch (error) {
    console.error("Error getting available tokens:", error);
    // Return known tokens as fallback
    return KNOWN_TESTNET_TOKENS;
  }
}

// Function to add a custom token by address
export async function addCustomToken(fullAddress: string): Promise<Token | null> {
  try {
    const [contractAddress, contractName] = fullAddress.split('.');

    if (!contractAddress || !contractName) {
      throw new Error("Invalid contract address format. Use: ADDRESS.CONTRACT-NAME");
    }

    const isValid = await verifySIP010Token(contractAddress, contractName);
    if (!isValid) {
      throw new Error("Contract does not implement SIP-010 token standard");
    }

    const metadata = await getTokenMetadata(contractAddress, contractName);
    if (!metadata) {
      throw new Error("Could not fetch token metadata");
    }

    return metadata as Token;
  } catch (error) {
    console.error("Error adding custom token:", error);
    throw error;
  }
}

// Function to search tokens by symbol or name
export function searchTokens(tokens: Token[], query: string): Token[] {
  if (!query.trim()) return tokens;

  const lowercaseQuery = query.toLowerCase();
  return tokens.filter(token =>
    token.symbol.toLowerCase().includes(lowercaseQuery) ||
    token.name.toLowerCase().includes(lowercaseQuery) ||
    token.fullAddress.toLowerCase().includes(lowercaseQuery)
  );
}