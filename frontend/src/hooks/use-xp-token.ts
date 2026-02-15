'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getXPTokenBalance, type XPTokenInfo } from '@/services/solana-service';

/**
 * Hook to read the connected wallet's XP soulbound token balance
 * from Solana devnet using Token-2022 program.
 */
export function useXPToken() {
  const { publicKey, connected } = useWallet();
  const [xpToken, setXpToken] = useState<XPTokenInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchXPBalance = useCallback(async () => {
    if (!publicKey || !connected) {
      setXpToken(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await getXPTokenBalance(publicKey.toBase58());
      setXpToken(result);
    } catch (err) {
      console.error('Failed to fetch XP token:', err);
      setError('Failed to read XP token from chain');
    } finally {
      setLoading(false);
    }
  }, [publicKey, connected]);

  useEffect(() => {
    fetchXPBalance();

    // Refresh every 60 seconds
    const interval = setInterval(fetchXPBalance, 60000);
    return () => clearInterval(interval);
  }, [fetchXPBalance]);

  return {
    xpToken,
    onChainXP: xpToken?.balance ?? null,
    onChainLevel: xpToken?.level ?? null,
    loading,
    error,
    refresh: fetchXPBalance,
  };
}
