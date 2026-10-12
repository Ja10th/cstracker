import React, { useState, useEffect } from 'react';
import { hasPendingSync, getSyncQueue, getLastSync, processQueue } from '../utils/syncManager';
import Icon from './Icon';

export default function SyncStatus() {
  const [pending, setPending] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    // Check sync status on mount and periodically
    const checkStatus = () => {
      setPending(hasPendingSync());
      setLastSync(getLastSync());
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000); // Check every 5 seconds

    // Listen for online/offline events
    const handleOnline = () => {
      setOnline(true);
      checkStatus();
    };

    const handleOffline = () => {
      setOnline(false);
      checkStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleManualSync = async () => {
    if (syncing || !pending) return;
    
    setSyncing(true);
    try {
      await processQueue();
      setPending(false);
      setLastSync(Date.now());
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  if (!pending && online) {
    return null; // Don't show anything when all synced and online
  }

  const queueCount = getSyncQueue().length;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm
        ${!online ? 'bg-amber-500/90 text-white' : 'bg-white/90 text-gray-800 border border-gray-200'}
      `}>
        {/* Status Icon */}
        <div className="flex-shrink-0">
          {syncing ? (
            <div className="animate-spin">
              <Icon name="refresh" className="w-5 h-5" />
            </div>
          ) : !online ? (
            <Icon name="cloud_off" className="w-5 h-5" />
          ) : pending ? (
            <Icon name="cloud_upload" className="w-5 h-5 text-blue-600" />
          ) : (
            <Icon name="cloud_done" className="w-5 h-5 text-green-600" />
          )}
        </div>

        {/* Status Text */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">
            {syncing ? 'Syncing...' : !online ? 'Offline Mode' : pending ? `${queueCount} pending` : 'Synced'}
          </div>
          {lastSync && (
            <div className="text-xs opacity-75">
              Last sync: {new Date(lastSync).toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Manual Sync Button */}
        {pending && online && !syncing && (
          <button
            onClick={handleManualSync}
            className="flex-shrink-0 px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Sync Now
          </button>
        )}
      </div>
    </div>
  );
}
