'use client';

/**
 * Solana On-Chain Service
 *
 * Provides real devnet reads for:
 * - XP token balance (Token-2022 soulbound tokens)
 * - cNFT credentials via Helius DAS API (getAssetsByOwner)
 * - Leaderboard indexing from token balances
 *
 * These are READ-ONLY operations — no signing needed.
 * Write operations (mint XP, issue credentials) are stubbed
 * and will be connected to the on-chain program later.
 */

import { Connection, PublicKey, type ParsedAccountData } from '@solana/web3.js';
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { SOLANA_CONFIG } from '@/config/constants';
import type { Credential, CredentialMetadata, LearningTrack } from '@/types';

// ============================================
// Connection Singleton
// ============================================

let _connection: Connection | null = null;

export function getConnection(): Connection {
  if (!_connection) {
    _connection = new Connection(SOLANA_CONFIG.rpcUrl, 'confirmed');
  }
  return _connection;
}

// ============================================
// XP Token Reads (Token-2022 Soulbound)
// ============================================

export interface XPTokenInfo {
  balance: number;
  mint: string;
  tokenAccount: string;
  level: number;
  decimals: number;
}

/**
 * Fetch XP soulbound token balance for a wallet.
 * Reads Token-2022 accounts owned by the wallet and filters by XP mint.
 * Falls back gracefully if mint isn't configured or wallet has no XP tokens.
 */
export async function getXPTokenBalance(
  walletAddress: string
): Promise<XPTokenInfo | null> {
  try {
    const connection = getConnection();
    const wallet = new PublicKey(walletAddress);
    const xpMint = SOLANA_CONFIG.xpMintAddress;

    // If XP mint is configured, look for that specific token
    if (xpMint) {
      const mintPubkey = new PublicKey(xpMint);
      // Get Token-2022 accounts for this wallet filtered by mint
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        wallet,
        { mint: mintPubkey, programId: TOKEN_2022_PROGRAM_ID }
      );

      if (tokenAccounts.value.length > 0) {
        const account = tokenAccounts.value[0];
        const parsed = account.account.data as ParsedAccountData;
        const info = parsed.parsed?.info;
        const amount = Number(info?.tokenAmount?.uiAmount ?? 0);
        const decimals = Number(info?.tokenAmount?.decimals ?? 0);

        return {
          balance: amount,
          mint: xpMint,
          tokenAccount: account.pubkey.toBase58(),
          level: Math.floor(Math.sqrt(amount / 100)),
          decimals,
        };
      }
    }

    // If no specific mint, scan all Token-2022 accounts
    // This is useful for discovery on devnet
    const allToken2022Accounts = await connection.getParsedTokenAccountsByOwner(
      wallet,
      { programId: TOKEN_2022_PROGRAM_ID }
    );

    if (allToken2022Accounts.value.length > 0) {
      // Return the first non-zero Token-2022 balance (likely XP on devnet)
      for (const account of allToken2022Accounts.value) {
        const parsed = account.account.data as ParsedAccountData;
        const info = parsed.parsed?.info;
        const amount = Number(info?.tokenAmount?.uiAmount ?? 0);
        if (amount > 0) {
          return {
            balance: amount,
            mint: info?.mint ?? '',
            tokenAccount: account.pubkey.toBase58(),
            level: Math.floor(Math.sqrt(amount / 100)),
            decimals: Number(info?.tokenAmount?.decimals ?? 0),
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch XP token balance:', error);
    return null;
  }
}

/**
 * Get all Token-2022 token accounts for a wallet.
 * Useful for displaying all soulbound tokens.
 */
export async function getToken2022Accounts(
  walletAddress: string
): Promise<Array<{ mint: string; balance: number; decimals: number; account: string }>> {
  try {
    const connection = getConnection();
    const wallet = new PublicKey(walletAddress);

    const accounts = await connection.getParsedTokenAccountsByOwner(
      wallet,
      { programId: TOKEN_2022_PROGRAM_ID }
    );

    return accounts.value.map((acc) => {
      const parsed = acc.account.data as ParsedAccountData;
      const info = parsed.parsed?.info;
      return {
        mint: info?.mint ?? '',
        balance: Number(info?.tokenAmount?.uiAmount ?? 0),
        decimals: Number(info?.tokenAmount?.decimals ?? 0),
        account: acc.pubkey.toBase58(),
      };
    });
  } catch (error) {
    console.error('Failed to fetch Token-2022 accounts:', error);
    return [];
  }
}

// ============================================
// cNFT Credential Reads (Metaplex Bubblegum)
// ============================================

export interface OnChainCredential {
  id: string;
  mint: string;
  name: string;
  description: string;
  image: string;
  track: LearningTrack | string;
  level: number;
  xp: number;
  attributes: Array<{ trait_type: string; value: string | number }>;
  owner: string;
  collection?: string;
  compressed: boolean;
  verificationUrl: string;
}

/**
 * Fetch cNFT credentials from chain using DAS API (Helius / standard RPC).
 * Tries Helius DAS first, then falls back to getProgramAccounts.
 */
export async function getCredentials(
  walletAddress: string
): Promise<OnChainCredential[]> {
  const heliusApiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;

  if (heliusApiKey) {
    return getCredentialsViaDAS(walletAddress, heliusApiKey);
  }

  // Fallback: try standard DAS RPC method (some RPCs support it natively)
  return getCredentialsViaRPC(walletAddress);
}

/**
 * Fetch assets via Helius DAS API (getAssetsByOwner).
 * This is the recommended way to read cNFTs.
 */
async function getCredentialsViaDAS(
  walletAddress: string,
  apiKey: string
): Promise<OnChainCredential[]> {
  try {
    const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'solana-quest',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: walletAddress,
          page: 1,
          limit: 50,
          displayOptions: {
            showCollectionMetadata: true,
          },
        },
      }),
    });

    const data = await response.json();
    const items = data?.result?.items || [];

    return items
      .filter((item: DASAsset) => {
        // Filter for Solana Quest credentials by name pattern or collection
        const name = item.content?.metadata?.name || '';
        return (
          name.toLowerCase().includes('solana quest') ||
          name.toLowerCase().includes('quest credential') ||
          name.toLowerCase().includes('superteam academy')
        );
      })
      .map((item: DASAsset) => mapDASAssetToCredential(item, walletAddress));
  } catch (error) {
    console.error('Failed to fetch credentials via DAS:', error);
    return [];
  }
}

/**
 * Fallback: Try the standard RPC getAssetsByOwner method.
 * Some RPC providers (Helius, Triton) support DAS natively.
 */
async function getCredentialsViaRPC(
  walletAddress: string
): Promise<OnChainCredential[]> {
  try {
    const response = await fetch(SOLANA_CONFIG.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'solana-quest',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: walletAddress,
          page: 1,
          limit: 50,
        },
      }),
    });

    const data = await response.json();

    // If RPC doesn't support DAS, it will return an error
    if (data.error) {
      console.info('RPC does not support DAS API, credential display requires Helius');
      return [];
    }

    const items = data?.result?.items || [];
    return items.map((item: DASAsset) => mapDASAssetToCredential(item, walletAddress));
  } catch (error) {
    console.error('Failed to fetch credentials via RPC:', error);
    return [];
  }
}

// ============================================
// Leaderboard Indexing (XP Token Balances)
// ============================================

export interface IndexedLeaderboardEntry {
  wallet: string;
  xpBalance: number;
  level: number;
  tokenAccount: string;
}

/**
 * Index XP token holders for leaderboard.
 * Uses getTokenLargestAccounts to find top holders of the XP mint.
 */
export async function getXPLeaderboard(
  limit: number = 20
): Promise<IndexedLeaderboardEntry[]> {
  try {
    const xpMint = SOLANA_CONFIG.xpMintAddress;
    if (!xpMint) return [];

    const connection = getConnection();
    const mintPubkey = new PublicKey(xpMint);

    // Get largest token accounts for the XP mint
    const largestAccounts = await connection.getTokenLargestAccounts(mintPubkey);

    const entries: IndexedLeaderboardEntry[] = [];

    for (const account of largestAccounts.value.slice(0, limit)) {
      const balance = Number(account.uiAmount ?? 0);
      if (balance <= 0) continue;

      // Get the account info to find the owner
      const accountInfo = await connection.getParsedAccountInfo(account.address);
      const parsed = accountInfo.value?.data as ParsedAccountData | undefined;
      const owner = parsed?.parsed?.info?.owner as string | undefined;

      if (owner) {
        entries.push({
          wallet: owner,
          xpBalance: balance,
          level: Math.floor(Math.sqrt(balance / 100)),
          tokenAccount: account.address.toBase58(),
        });
      }
    }

    // Sort by XP descending
    return entries.sort((a, b) => b.xpBalance - a.xpBalance);
  } catch (error) {
    console.error('Failed to index XP leaderboard:', error);
    return [];
  }
}

// ============================================
// Helper Types & Mapping
// ============================================

// DAS API asset type (simplified)
interface DASAsset {
  id: string;
  content?: {
    metadata?: {
      name?: string;
      description?: string;
      symbol?: string;
      attributes?: Array<{ trait_type: string; value: string | number }>;
    };
    links?: {
      image?: string;
    };
    json_uri?: string;
  };
  compression?: {
    compressed: boolean;
    tree?: string;
    leaf_index?: number;
  };
  grouping?: Array<{
    group_key: string;
    group_value: string;
  }>;
  ownership?: {
    owner: string;
  };
}

function mapDASAssetToCredential(
  asset: DASAsset,
  walletAddress: string
): OnChainCredential {
  const metadata = asset.content?.metadata;
  const attributes = metadata?.attributes || [];

  const trackAttr = attributes.find((a) => a.trait_type === 'Track');
  const levelAttr = attributes.find((a) => a.trait_type === 'Level');
  const xpAttr = attributes.find((a) => a.trait_type === 'XP');

  const collection = asset.grouping?.find(
    (g) => g.group_key === 'collection'
  )?.group_value;

  return {
    id: asset.id,
    mint: asset.id,
    name: metadata?.name || 'Unknown Credential',
    description: metadata?.description || '',
    image: asset.content?.links?.image || '',
    track: (trackAttr?.value as LearningTrack) || 'solana-fundamentals',
    level: Number(levelAttr?.value ?? 1),
    xp: Number(xpAttr?.value ?? 0),
    attributes,
    owner: walletAddress,
    collection,
    compressed: asset.compression?.compressed ?? false,
    verificationUrl: `https://explorer.solana.com/address/${asset.id}?cluster=${SOLANA_CONFIG.network}`,
  };
}
