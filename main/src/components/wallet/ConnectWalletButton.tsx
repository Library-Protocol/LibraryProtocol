import React, { useEffect, useState } from 'react';

import Link from 'next/link';

import { ExternalLink } from 'lucide-react';

import { usePrivy } from '@privy-io/react-auth';

const CuratorDashboardButton = () => {
  const [, setSubmitError] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [curatorId, setCuratorId] = useState<string | null>(null);
  const [, setIsLoading] = useState(false);
  const { user, authenticated } = usePrivy();

  useEffect(() => {
    const fetchWalletAddress = async () => {
      try {
        setSubmitError('');

        if (user && user.wallet) {
          setWalletAddress(user.wallet.address);
        }
      } catch (err) {
        setSubmitError((err as Error).message || 'Failed to fetch wallet address');
      }
    };

    fetchWalletAddress();
  }, [user]);

  useEffect(() => {
    const fetchCuratorId = async () => {
      if (!walletAddress) return;

      setIsLoading(true);

      try {
        const response = await fetch(`/api/library/curator/${walletAddress}/fetch-details`);

        if (!response.ok) {
          throw new Error('Failed to fetch curator data');
        }

        const data = await response.json();

        setCuratorId(data.id); // Assuming the API returns an object with an `id` field
      } catch (err) {
        setSubmitError((err as Error).message || 'Failed to fetch curator data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCuratorId();
  }, [walletAddress]);

  // Don't render anything if not authenticated or curatorId is not fetchedç
  if (!authenticated || !curatorId) {
    return null;
  }

  return (
    <Link
      href={`/library/curator/dashboard/${curatorId}`}
      className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-white shadow-lg transition-all hover:shadow-purple-500/25 hover:translate-y-[-2px] active:translate-y-[1px]"
    >
      <span className="relative font-semibold">Curator Dashboard</span>
      <ExternalLink
        size={18}
        className="transition-transform group-hover:rotate-45"
      />
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/20 to-indigo-600/20 blur-xl transition-opacity opacity-0 group-hover:opacity-100" />
    </Link>
  );
};

const ConnectWalletButton = () => {
  const { ready, authenticated, login, logout } = usePrivy();

  const handleClick = () => {
    if (authenticated) {
      logout();
    } else {
      login();
    }
  };

  if (!ready) {
    return (
      <button
        disabled
        className="bg-gray-600 text-white px-6 py-4 text-md rounded transition duration-200"
      >
        Loading...
      </button>
    );
  }

  return (
    <div className="flex gap-4 items-center">
      <button
        onClick={handleClick}
        className="
          bg-black
          text-white
          hover:bg-gray-800
          focus:outline-none
          focus:ring-2
          focus:ring-white
          rounded
          w-auto
          px-6
          py-4
          text-md
          transition
          duration-200
        "
      >
        {authenticated ? 'Logout' : 'Connect Wallet'}
      </button>
      <CuratorDashboardButton />
    </div>
  );
};

export default ConnectWalletButton;
