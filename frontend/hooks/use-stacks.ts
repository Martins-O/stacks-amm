"use client";

import {
  addLiquidity,
  createPool,
  Pool,
  removeLiquidity,
  swap,
} from "@/lib/amm";
import { PostConditionMode } from "@stacks/transactions";
import { useEffect, useState } from "react";

// Dynamic imports for client-side only
import type {
  AppConfig,
  UserData,
  UserSession,
} from "@stacks/connect";

const appDetails = {
  name: "Full Range AMM",
  icon: "https://cryptologos.cc/logos/stacks-stx-logo.png",
};

export function useStacks() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [stacksConnect, setStacksConnect] = useState<any>(null);
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  // Load Stacks Connect dynamically
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("@stacks/connect").then((connect) => {
        setStacksConnect(connect);
        const appConfig = new connect.AppConfig(["store_write"]);
        const session = new connect.UserSession({ appConfig });
        setUserSession(session);
      });
    }
  }, []);

  function connectWallet() {
    if (!userSession || !stacksConnect) return;
    stacksConnect.showConnect({
      appDetails,
      onFinish: () => {
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      },
      userSession,
    });
  }

  function disconnectWallet() {
    if (!userSession) return;
    userSession.signUserOut();
    setUserData(null);
  }

  async function handleCreatePool(token0: string, token1: string, fee: number) {
    try {
      if (!userData || !stacksConnect) throw new Error("User not connected");
      const options = await createPool(token0, token1, fee);
      await stacksConnect.openContractCall({
        ...options,
        appDetails,
        onFinish: (data: any) => {
          if (typeof window !== "undefined") {
            window.alert("Sent create pool transaction");
          }
          console.log(data);
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (_err) {
      const err = _err as Error;
      console.log(err);
      if (typeof window !== "undefined") {
        window.alert(err.message);
      }
      return;
    }
  }

  async function handleSwap(pool: Pool, amount: number, zeroForOne: boolean) {
    try {
      if (!userData || !stacksConnect) throw new Error("User not connected");
      const options = await swap(pool, amount, zeroForOne);
      await stacksConnect.openContractCall({
        ...options,
        appDetails,
        onFinish: (data: any) => {
          if (typeof window !== "undefined") {
            window.alert("Sent swap transaction");
          }
          console.log(data);
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (_err) {
      const err = _err as Error;
      console.log(err);
      if (typeof window !== "undefined") {
        window.alert(err.message);
      }
      return;
    }
  }

  async function handleAddLiquidity(
    pool: Pool,
    amount0: number,
    amount1: number
  ) {
    try {
      if (!userData || !stacksConnect) throw new Error("User not connected");
      const options = await addLiquidity(pool, amount0, amount1);
      await stacksConnect.openContractCall({
        ...options,
        appDetails,
        onFinish: (data: any) => {
          if (typeof window !== "undefined") {
            window.alert("Sent add liquidity transaction");
          }
          console.log({ data });
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (_err) {
      const err = _err as Error;
      console.log(err);
      if (typeof window !== "undefined") {
        window.alert(err.message);
      }
      return;
    }
  }

  async function handleRemoveLiquidity(pool: Pool, liquidity: number) {
    try {
      if (!userData || !stacksConnect) throw new Error("User not connected");
      const options = await removeLiquidity(pool, liquidity);
      await stacksConnect.openContractCall({
        ...options,
        appDetails,
        onFinish: (data: any) => {
          if (typeof window !== "undefined") {
            window.alert("Sent remove liquidity transaction");
          }
          console.log(data);
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (_err) {
      const err = _err as Error;
      console.log(err);
      if (typeof window !== "undefined") {
        window.alert(err.message);
      }
      return;
    }
  }

  useEffect(() => {
    if (!userSession) return;

    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setUserData(userData);
      });
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, [userSession]);

  // Add openContractCall function for new CreatePool component
  async function openContractCall(options: any) {
    if (!stacksConnect) throw new Error("Stacks Connect not loaded");
    if (!userData) throw new Error("User not connected");

    return stacksConnect.openContractCall({
      ...options,
      appDetails,
      postConditionMode: PostConditionMode.Allow,
    });
  }

  return {
    userData,
    address: userData?.profile?.stxAddress?.testnet || null,
    handleCreatePool,
    handleSwap,
    handleAddLiquidity,
    handleRemoveLiquidity,
    connectWallet,
    disconnectWallet,
    openContractCall,
  };
}
