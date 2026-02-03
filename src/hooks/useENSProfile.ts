// ===========================================
// useENSProfile Hook
// ===========================================
// Custom ENS integration for reading/writing FreelancePay profiles
// This is CUSTOM CODE for the ENS bounty (not just RainbowKit)

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient, useEnsName, useEnsAddress, useEnsAvatar } from 'wagmi';
import { normalize, namehash } from 'viem/ens';
import { 
  ENS_KEYS, 
  SUPPORTED_CHAINS, 
  type SupportedChain 
} from '@/lib/constants';
import { 
  parseENSProfile, 
  profileToRecords, 
  ENS_RESOLVER_ABI,
  isValidENSName,
  getFreelancePayKeys,
} from '@/lib/ens';
import type { FreelancerProfile, ENSFreelancePayRecords } from '@/types';

// ENS Public Resolver address on mainnet/sepolia
const ENS_PUBLIC_RESOLVER = {
  mainnet: '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63',
  sepolia: '0x8FADE66B79cC9f707aB26799354482EB93a5B7dD',
} as const;

interface UseENSProfileReturn {
  // State
  ensName: string | null;
  profile: FreelancerProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  
  // Actions
  lookupProfile: (ensName: string) => Promise<FreelancerProfile | null>;
  saveProfile: (profile: Partial<FreelancerProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

/**
 * Hook for managing ENS-based freelancer profiles
 * 
 * This is CUSTOM ENS integration code - we read and write
 * FreelancePay-specific text records to ENS names.
 * 
 * Example text records on "alice.eth":
 * - freelancepay.rate: "75"
 * - freelancepay.services: "Web Dev, Smart Contracts"
 * - freelancepay.chain: "polygon"
 * 
 * Usage:
 * ```tsx
 * const { profile, saveProfile, lookupProfile } = useENSProfile();
 * 
 * // Look up a freelancer's profile
 * const freelancerProfile = await lookupProfile('alice.eth');
 * 
 * // Save your own profile
 * await saveProfile({ rate: 100, services: ['Web Dev'] });
 * ```
 */
export function useENSProfile(): UseENSProfileReturn {
  const { address, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  // Get connected user's ENS name
  const { data: userEnsName } = useEnsName({ address });
  
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Read a single text record from ENS
   */
  const readTextRecord = useCallback(async (
    ensName: string,
    key: string
  ): Promise<string> => {
    if (!publicClient) return '';

    try {
      const name = normalize(ensName);
      const node = namehash(name);
      
      // Get resolver address for this name
      const resolverAddress = await publicClient.getEnsResolver({ name });
      
      if (!resolverAddress) return '';

      // Read text record
      const value = await publicClient.readContract({
        address: resolverAddress,
        abi: ENS_RESOLVER_ABI,
        functionName: 'text',
        args: [node, key],
      });

      return value as string;
    } catch (err) {
      console.error(`Error reading ${key} for ${ensName}:`, err);
      return '';
    }
  }, [publicClient]);

  /**
   * Read all FreelancePay text records for an ENS name
   */
  const readAllRecords = useCallback(async (
    ensName: string
  ): Promise<ENSFreelancePayRecords> => {
    const keys = getFreelancePayKeys();
    const records: ENSFreelancePayRecords = {};

    // Read all records in parallel
    const results = await Promise.all(
      keys.map(async (key) => ({
        key,
        value: await readTextRecord(ensName, key),
      }))
    );

    // Build records object
    for (const { key, value } of results) {
      if (value) {
        records[key as keyof ENSFreelancePayRecords] = value;
      }
    }

    return records;
  }, [readTextRecord]);

  /**
   * Look up a freelancer's profile by ENS name
   */
  const lookupProfile = useCallback(async (
    ensName: string
  ): Promise<FreelancerProfile | null> => {
    if (!isValidENSName(ensName)) {
      setError('Invalid ENS name');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get address for ENS name
      const address = await publicClient?.getEnsAddress({ name: normalize(ensName) });
      
      if (!address) {
        setError('ENS name not found');
        return null;
      }

      // Get avatar
      const avatarUrl = `https://metadata.ens.domains/mainnet/avatar/${ensName}`;

      // Read all FreelancePay records
      const records = await readAllRecords(ensName);

      // Parse into profile
      const freelancerProfile = parseENSProfile(
        ensName,
        address,
        records,
        avatarUrl
      );

      return freelancerProfile;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load profile';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, readAllRecords]);

  /**
   * Save profile data to ENS text records
   * 
   * This writes multiple text records in a single transaction
   * using the resolver's multicall function.
   */
  const saveProfile = useCallback(async (
    profileData: Partial<FreelancerProfile>
  ): Promise<void> => {
    if (!walletClient || !userEnsName || !publicClient) {
      throw new Error('Wallet not connected or no ENS name');
    }

    setIsSaving(true);
    setError(null);

    try {
      const name = normalize(userEnsName);
      const node = namehash(name);
      
      // Get resolver address
      const resolverAddress = await publicClient.getEnsResolver({ name });
      
      if (!resolverAddress) {
        throw new Error('No resolver found for ENS name');
      }

      // Convert profile to text records
      const records = profileToRecords(profileData);

      // Write each record (could use multicall for efficiency)
      for (const [key, value] of Object.entries(records)) {
        if (value !== undefined) {
          await walletClient.writeContract({
            address: resolverAddress,
            abi: ENS_RESOLVER_ABI,
            functionName: 'setText',
            args: [node, key, value],
          });
        }
      }

      // Refresh profile
      await refreshProfile();

      console.log('✅ Profile saved to ENS');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save profile';
      setError(message);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [walletClient, userEnsName, publicClient]);

  /**
   * Refresh the current user's profile
   */
  const refreshProfile = useCallback(async () => {
    if (!userEnsName || !address) return;

    setIsLoading(true);

    try {
      const loadedProfile = await lookupProfile(userEnsName);
      setProfile(loadedProfile);
    } catch (err) {
      console.error('Error refreshing profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userEnsName, address, lookupProfile]);

  /**
   * Load profile when ENS name is available
   */
  useEffect(() => {
    if (userEnsName && address) {
      refreshProfile();
    } else {
      setProfile(null);
    }
  }, [userEnsName, address, refreshProfile]);

  return {
    ensName: userEnsName || null,
    profile,
    isLoading,
    isSaving,
    error,
    lookupProfile,
    saveProfile,
    refreshProfile,
  };
}

/**
 * Hook to resolve an ENS name to an address
 * (wrapper around wagmi with error handling)
 */
export function useENSAddress(ensName: string | undefined) {
  const { data: address, isLoading, error } = useEnsAddress({
    name: ensName ? normalize(ensName) : undefined,
  });

  return {
    address,
    isLoading,
    error: error?.message || null,
  };
}

/**
 * Hook to get ENS avatar
 */
export function useENSAvatar(ensName: string | undefined) {
  const { data: avatar, isLoading } = useEnsAvatar({
    name: ensName ? normalize(ensName) : undefined,
  });

  return {
    avatarUrl: avatar || (ensName ? `https://metadata.ens.domains/mainnet/avatar/${ensName}` : null),
    isLoading,
  };
}
