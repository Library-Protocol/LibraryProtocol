'use client';

import { useEffect, useState } from 'react';

const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    // Update network status
    const handleOnline = () => {
      setIsOnline(true);
      // Keep the "Back Online" message for 3 seconds
      setShowOfflineMessage(true);
      setTimeout(() => setShowOfflineMessage(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);
    setShowOfflineMessage(!navigator.onLine);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOfflineMessage) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`rounded-lg px-4 py-2 shadow-lg transition-all duration-300 ${
          isOnline
            ? 'bg-green-500 text-white'
            : 'bg-brown-500 text-white'
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              isOnline ? 'bg-green-200 animate-pulse' : 'bg-black'
            }`}
          />
          <span className="font-medium">
            {isOnline ? 'Back Online' : 'No Internet Connection'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;
