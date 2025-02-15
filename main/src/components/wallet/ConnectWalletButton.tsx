import React, { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { User } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';

import Novu from '../notification/Novu';

const SkeletonLoader = ({ width, height }: { width: string; height: string }) => (
  <div className={`animate-pulse bg-gray-700 rounded`} style={{ width, height }}></div>
);

const DashboardButton = () => {
  const router = useRouter();
  const [, setSubmitError] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, authenticated } = usePrivy();

  useEffect(() => {
    if (user?.wallet) {
      setWalletAddress(user.wallet.address);
    }
  }, [user]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!walletAddress) return;

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

    fetchUser();
  }, [walletAddress]);

  useEffect(() => {
    if (userExists === false) {
      router.push('/user/onboarding');
    }
  }, [userExists, router]);

  if (!authenticated || userExists === null || isLoading) {
    return <SkeletonLoader width="120px" height="40px" />;
  }

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

const ConnectWalletButton = () => {
  const { ready, authenticated, login, logout } = usePrivy();

  const handleClick = () => {
    authenticated ? logout() : login();
  };

  if (!ready) {
    return <SkeletonLoader width="180px" height="50px" />;
  }

  return (
    <div className="flex gap-4 items-center">
      <button
        onClick={handleClick}
        className="bg-black text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-white rounded w-auto px-6 py-4 text-md transition duration-200"
      >
        {authenticated ? 'Logout' : 'Connect Wallet'}
      </button>
      <DashboardButton />
      <Novu />
    </div>
  );
};

export default ConnectWalletButton;
