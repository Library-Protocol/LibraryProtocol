//  DashboardButton component

'use client';

import React, { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { User } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';

const DashboardButton = () => {
  const router = useRouter();
  const [, setSubmitError] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [, setIsLoading] = useState(false); // Default to false
  const { user, authenticated } = usePrivy();

  useEffect(() => {
    if (user?.wallet) {
      setWalletAddress(user.wallet.address);
    } else {
      setWalletAddress('');
      setUserExists(null); // Reset when logged out
    }
  }, [user]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!walletAddress) return;

      setIsLoading(true); // Only set loading when fetching starts

      try {
        const response = await fetch(`/api/user/fetch-details?wallet=${walletAddress}`);

        setUserExists(response.ok);
      } catch (err) {
        setSubmitError((err as Error).message || 'Failed to fetch user data');
        setUserExists(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (walletAddress) fetchUser();
  }, [walletAddress]);

  useEffect(() => {
    if (userExists === false) {
      router.push('/user/onboarding');
    }
  }, [userExists, router]);

  if (!authenticated) return null; // Don't show loader or button when logged out

  return (
    <Link
      href={`/user/dashboard/${walletAddress}`}
      className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brown-700 to-brown-500 px-6 py-3 text-white shadow-lg transition-all hover:shadow-brown-500/25 hover:translate-y-[-2px] active:translate-y-[1px]"
    >
      <span className="relative font-semibold">Profile</span>
      <User size={18} className="transition-transform group-hover:rotate-45" />
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brown-700/20 to-brown-500/20 blur-xl transition-opacity opacity-0 group-hover:opacity-100" />
    </Link>
  );
};

export default DashboardButton;
