'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getCredentials, type OnChainCredential } from '@/services/solana-service';

/**
 * Hook to fetch on-chain cNFT credentials for the connected wallet.
 * Uses Helius DAS API if configured, otherwise falls back to standard RPC.
 */
export function useCredentials() {
  const { publicKey, connected } = useWallet();
  const [credentials, setCredentials] = useState<OnChainCredential[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCredentials = useCallback(async () => {
    if (!publicKey || !connected) {
      setCredentials([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await getCredentials(publicKey.toBase58());
      setCredentials(result);
    } catch (err) {
      console.error('Failed to fetch credentials:', err);
      setError('Failed to read credentials from chain');
    } finally {
      setLoading(false);
    }
  }, [publicKey, connected]);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  return {
    credentials,
    loading,
    error,
    refresh: fetchCredentials,
    hasCredentials: credentials.length > 0,
  };
}
