// ===========================================
// ENS Utilities - Custom Integration
// ===========================================
// This is CUSTOM ENS code (not just RainbowKit) for the ENS bounty!
// We use wagmi hooks + viem for reading and writing ENS text records.

import { normalize } from 'viem/ens';
import { ENS_KEYS, SUPPORTED_CHAINS, type SupportedChain } from './constants';
import type { FreelancerProfile, ENSFreelancePayRecords } from '@/types';

/**
 * FreelancePay ENS Text Record Keys
 * 
 * We store freelancer profile data in ENS text records, enabling:
 * - Decentralized identity (no centralized database)
 * - Portable profiles (works across any dApp)
 * - User-controlled data (they own their ENS name)
 * 
 * Example text records for "alice.eth":
 * - freelancepay.rate: "75"
 * - freelancepay.services: "Web Development, Smart Contracts, UI Design"
 * - freelancepay.chain: "polygon"
 * - freelancepay.wallet: "0x..."
 * - freelancepay.bio: "Full-stack developer with 5 years experience"
 * - freelancepay.available: "true"
 */

// ABI for ENS Resolver text record functions
export const ENS_RESOLVER_ABI = [
  {
    name: 'text',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'key', type: 'string' },
    ],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'setText',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'key', type: 'string' },
      { name: 'value', type: 'string' },
    ],
    outputs: [],
  },
  {
    name: 'multicall',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'data', type: 'bytes[]' }],
    outputs: [{ name: 'results', type: 'bytes[]' }],
  },
] as const;

/**
 * Parse ENS text records into a FreelancerProfile
 */
export function parseENSProfile(
  ensName: string,
  address: string,
  records: ENSFreelancePayRecords,
  avatarUrl?: string
): FreelancerProfile {
  // Parse services from comma-separated string
  const servicesRaw = records[ENS_KEYS.SERVICES] || '';
  const services = servicesRaw
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // Parse preferred chain, default to polygon
  const chainRaw = records[ENS_KEYS.CHAIN] || 'polygon';
  const preferredChain = (
    Object.keys(SUPPORTED_CHAINS).includes(chainRaw) 
      ? chainRaw 
      : 'polygon'
  ) as SupportedChain;

  return {
    ensName,
    address,
    rate: parseFloat(records[ENS_KEYS.RATE] || '0'),
    services,
    preferredChain,
    payoutWallet: records[ENS_KEYS.WALLET] || address,
    bio: records[ENS_KEYS.BIO] || '',
    available: records[ENS_KEYS.AVAILABLE] === 'true',
    avatarUrl,
  };
}

/**
 * Convert FreelancerProfile to ENS text records
 */
export function profileToRecords(
  profile: Partial<FreelancerProfile>
): ENSFreelancePayRecords {
  const records: ENSFreelancePayRecords = {};

  if (profile.rate !== undefined) {
    records[ENS_KEYS.RATE] = profile.rate.toString();
  }

  if (profile.services?.length) {
    records[ENS_KEYS.SERVICES] = profile.services.join(', ');
  }

  if (profile.preferredChain) {
    records[ENS_KEYS.CHAIN] = profile.preferredChain;
  }

  if (profile.payoutWallet) {
    records[ENS_KEYS.WALLET] = profile.payoutWallet;
  }

  if (profile.bio) {
    records[ENS_KEYS.BIO] = profile.bio;
  }

  if (profile.available !== undefined) {
    records[ENS_KEYS.AVAILABLE] = profile.available.toString();
  }

  return records;
}

/**
 * Get the namehash for an ENS name
 * Used for interacting with ENS resolver contracts
 */
export function getNamehash(name: string): `0x${string}` {
  // Normalize the name first (handles special characters, etc.)
  const normalized = normalize(name);
  
  // Calculate namehash using viem's built-in function
  // This is a recursive hash: namehash('alice.eth') = keccak256(namehash('eth') + keccak256('alice'))
  const { namehash } = require('viem/ens');
  return namehash(normalized);
}

/**
 * Validate an ENS name format
 */
export function isValidENSName(name: string): boolean {
  if (!name || name.length === 0) return false;
  
  // Must end with .eth (or other valid TLD)
  if (!name.includes('.')) return false;
  
  try {
    // Try to normalize - will throw if invalid
    normalize(name);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format an address for display (truncate middle)
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Check if a profile has minimum required data
 */
export function isProfileComplete(profile: Partial<FreelancerProfile>): boolean {
  return !!(
    profile.rate && 
    profile.rate > 0 &&
    profile.services && 
    profile.services.length > 0 &&
    profile.payoutWallet
  );
}

/**
 * Get all FreelancePay ENS keys
 */
export function getFreelancePayKeys(): string[] {
  return Object.values(ENS_KEYS);
}

/**
 * Format rate for display
 */
export function formatRate(rate: number): string {
  return `$${rate.toFixed(2)}/hr`;
}

/**
 * Parse services string into array
 */
export function parseServices(services: string): string[] {
  return services
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * Generate a URL for an ENS avatar
 * Supports various avatar record formats
 */
export function getAvatarUrl(ensName: string): string {
  // Use ENS metadata service for avatar
  return `https://metadata.ens.domains/mainnet/avatar/${ensName}`;
}

/**
 * Build text record setters for multicall
 * This allows setting multiple text records in one transaction
 */
export function buildTextRecordSetters(
  records: ENSFreelancePayRecords,
  namehash: `0x${string}`
): `0x${string}`[] {
  const { encodeFunctionData } = require('viem');
  
  const setters: `0x${string}`[] = [];
  
  for (const [key, value] of Object.entries(records)) {
    if (value !== undefined) {
      const data = encodeFunctionData({
        abi: ENS_RESOLVER_ABI,
        functionName: 'setText',
        args: [namehash, key, value],
      });
      setters.push(data);
    }
  }
  
  return setters;
}

/**
 * Example ENS integration for searching freelancers
 * This would be used with The Graph or ENS subgraph
 */
export interface FreelancerSearchResult {
  ensName: string;
  address: string;
  avatarUrl?: string;
  rate?: number;
  services?: string[];
  available?: boolean;
}

/**
 * Build GraphQL query for finding freelancers with FreelancePay profiles
 * (Would be used with ENS Subgraph)
 */
export function buildFreelancerSearchQuery(searchTerm?: string): string {
  return `
    query FindFreelancers($searchTerm: String) {
      domains(
        where: {
          name_contains: $searchTerm
          resolvedAddress_not: null
        }
        first: 20
      ) {
        name
        resolvedAddress {
          id
        }
        resolver {
          texts(where: { key_starts_with: "freelancepay." }) {
            key
            value
          }
        }
      }
    }
  `;
}
