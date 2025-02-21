// src/components/NetworkCheck.tsx
'use client';

import { useEffect, useState } from 'react';

import { useAccount , useWalletClient } from 'wagmi';
import { arbitrum } from 'wagmi/chains';

const NetworkCheck = () => {
  const { chain, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false); // Loading state for Switch button
  const [isAddLoading, setIsAddLoading] = useState(false); // Loading state for Add button

  useEffect(() => {
    console.log('Network Check - isConnected:', isConnected);
    console.log('Network Check - Chain:', chain);
    console.log('Network Check - Chain ID:', chain?.id);
    console.log('Network Check - Arbitrum One ID:', arbitrum.id);

    if (isConnected) {
      const wrongNetwork = !chain || chain.id !== arbitrum.id;

      console.log('Network Check - Is Wrong Network:', wrongNetwork);
      setIsWrongNetwork(wrongNetwork);
    } else {
      console.log('Network Check - Not connected, hiding modal');
      setIsWrongNetwork(false);
    }
  }, [chain, isConnected]);

  const handleSwitchNetwork = async () => {
    if (!walletClient) {
      setError('Wallet not available');
      
return;
    }

    setIsSwitchLoading(true); // Start loading

    try {
      setError(null);
      await walletClient.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${arbitrum.id.toString(16)}` }],
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';

      setError('Switch failed: ' + errorMessage);
    } finally {
      setIsSwitchLoading(false); // Stop loading
    }
  };

  const handleAddNetwork = async () => {
    if (!walletClient) {
      setError('Wallet not available');
      
return;
    }

    setIsAddLoading(true); // Start loading

    try {
      setError(null);
      await walletClient.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${arbitrum.id.toString(16)}`,
          chainName: 'Arbitrum One',
          nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://arb1.arbitrum.io/rpc'],
          blockExplorerUrls: ['https://arbiscan.io/'],
        }],
      });
      await walletClient.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${arbitrum.id.toString(16)}` }],
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';

      setError('Add failed: ' + errorMessage);
    } finally {
      setIsAddLoading(false); // Stop loading
    }
  };

  if (!isWrongNetwork) {
    console.log('Network Check - Modal hidden');
    
return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-96 max-w-full mx-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Wrong Network Detected</h2>
        <p className="text-gray-600 mb-2">
          Current: <span className="font-medium">{chain?.name || 'Unknown'}</span> (ID:{' '}
          {chain?.id || 'Not Detected'})
        </p>
        <p className="text-gray-600 mb-6">
          This app requires Arbitrum One (ID: {arbitrum.id}). Please switch to continue.
        </p>
        <button
          onClick={handleSwitchNetwork}
          disabled={isSwitchLoading}
          className="w-full bg-brown-500 text-white font-medium px-4 py-3 rounded-lg hover:bg-brown-600 transition-colors duration-200 mb-3 flex items-center justify-center disabled:opacity-50"
        >
          {isSwitchLoading ? (
            <svg
              className="animate-spin h-5 w-5 text-white mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : null}
          {isSwitchLoading ? 'Switching...' : 'Switch to Arbitrum One'}
        </button>
        <button
          onClick={handleAddNetwork}
          disabled={isAddLoading}
          className="w-full bg-gray-500 text-white font-medium px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center disabled:opacity-50"
        >
          {isAddLoading ? (
            <svg
              className="animate-spin h-5 w-5 text-white mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : null}
          {isAddLoading ? 'Adding...' : 'Add Arbitrum One'}
        </button>
        {error && (
          <p className="text-red-600 text-sm mt-4 bg-red-50 p-2 rounded">{error}</p>
        )}
      </div>
    </div>
  );
};

export default NetworkCheck;
