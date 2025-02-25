"use client";

import React, { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { Engagespot } from "@engagespot/react-component";
import { User } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";

import { generateUserToken } from "@/app/server/actions/engage/library-reader";

const UserControlPanel = () => {
  const router = useRouter();
  const { user, authenticated, ready, login, logout } = usePrivy();
  const [userId, setUserId] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [, setUserExists] = useState<boolean | null>(null);
  const [, setSubmitError] = useState("");
  const [, setIsLoading] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_ENGAGESPOT_API_KEY;

  // Handle user token generation and wallet address setup
  useEffect(() => {
    const setupUser = async () => {
      if (user?.wallet?.address) {
        setUserId(user.wallet.address);
        setWalletAddress(user.wallet.address);

        try {
          const token = await generateUserToken(user.wallet.address);

          setUserToken(token);
        } catch (error) {
          console.error("Error fetching user token:", error);
        }
      } else {
        setWalletAddress("");
        setUserExists(null);
      }
    };

    setupUser();
  }, [user]);

  // Check user existence for wallet and notification
  useEffect(() => {
    const checkUserExists = async () => {
      if (!authenticated || !user?.wallet?.address) return;

      setIsLoading(true);

      try {
        const response = await fetch(`/api/user/fetch-details?wallet=${user.wallet.address}`);
        const exists = response.ok;

        setUserExists(exists);

        if (!exists) {
          router.replace('/user/onboarding');
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setSubmitError(error instanceof Error ? error.message : 'Failed to fetch user data');
        setUserExists(false);
        router.replace('/user/onboarding');
      } finally {
        setIsLoading(false);
      }
    };

    if (walletAddress) checkUserExists();
  }, [authenticated, user?.wallet?.address, walletAddress, router]);

  // Handle logout redirect
  useEffect(() => {
    if (!authenticated && ready) {
      router.replace('/');
    }
  }, [authenticated, ready, router]);

  const handleWalletClick = () => {
    authenticated ? logout() : login();
  };

  const theme = {
    notificationButton: {
      iconFill: "#5D4037",
      iconSize: "40px",
    },
  };

  // Show a loading state while authentication state is being determined
  if (!ready) {
    return (
      <div className="flex gap-4 items-center">
        <div className="bg-gray-200 animate-pulse rounded w-auto px-6 py-4 text-transparent">
          Loading...
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex gap-4 items-center">
        <button
          onClick={handleWalletClick}
          className="bg-black text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-white rounded w-auto px-6 py-4 text-md transition duration-200"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-4 items-center">
      <button
        onClick={handleWalletClick}
        className="bg-black text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-white rounded w-auto px-6 py-4 text-md transition duration-200"
      >
        Logout
      </button>

      <Link
        href={`/user/dashboard/${walletAddress}`}
        className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brown-700 to-brown-500 px-6 py-3 text-white shadow-lg transition-all hover:shadow-brown-500/25 hover:translate-y-[-2px] active:translate-y-[1px]"
      >
        <span className="relative font-semibold">Profile</span>
        <User size={18} className="transition-transform group-hover:rotate-45" />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brown-700/20 to-brown-500/20 blur-xl transition-opacity opacity-0 group-hover:opacity-100" />
      </Link>

      <Engagespot
        apiKey={apiKey as string}
        userId={userId || 'guest'}
        dataRegion="us"
        userToken={userToken as string}
        theme={theme}
      />
    </div>
  );
};

export default UserControlPanel;
