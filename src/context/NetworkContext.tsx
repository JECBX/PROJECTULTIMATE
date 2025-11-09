import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../db/db';

interface NetworkContextType {
  isOnline: boolean;
  lastSynced: Date | null;
  syncPending: boolean;
  pendingSyncCount: number;
  syncData: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

export const NetworkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [syncPending, setSyncPending] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  // Update pending sync count
  const updatePendingSyncCount = async () => {
    const { products, transactions } = await db.getPendingSyncItems();
    setPendingSyncCount(products.length + transactions.length);
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncPending(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial pending sync count
    updatePendingSyncCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncData = async () => {
    if (!isOnline) return;
    
    try {
      setSyncPending(true);
      
      // Get items that need syncing
      const { products, transactions, multiTransactions } = await db.getPendingSyncItems();
      
      if (products.length === 0 && transactions.length === 0 && multiTransactions.length === 0) {
        setSyncPending(false);
        setLastSynced(new Date());
        return;
      }

      // In a real app, this would make API calls to sync with backend
      // For now, we'll simulate the sync process
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mark items as synced
      if (products.length > 0) {
        await db.markAsSynced('products', products.map(p => p.id));
      }
      
      if (multiTransactions.length > 0) {
        await db.markAsSynced('multiTransactions', multiTransactions.map(t => t.id));
      }
      if (transactions.length > 0) {
        await db.markAsSynced('transactions', transactions.map(t => t.id));
      }

      // Update sync status
      setLastSynced(new Date());
      setSyncPending(false);
      await updatePendingSyncCount();
      
    } catch (error) {
      console.error('Error syncing data:', error);
      setSyncPending(false);
    }
  };

  // When we come back online, attempt to sync
  useEffect(() => {
    if (isOnline && syncPending) {
      syncData();
    }
  }, [isOnline, syncPending]);

  return (
    <NetworkContext.Provider value={{ 
      isOnline, 
      lastSynced, 
      syncPending, 
      pendingSyncCount,
      syncData 
    }}>
      {children}
    </NetworkContext.Provider>
  );
};