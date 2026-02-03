// ===========================================
// FreelancePay Constants & Configuration
// ===========================================

// ENS Text Record Keys (custom for FreelancePay)
export const ENS_KEYS = {
  RATE: 'freelancepay.rate',           // Hourly rate in USDC
  SERVICES: 'freelancepay.services',   // Comma-separated services
  CHAIN: 'freelancepay.chain',         // Preferred settlement chain
  WALLET: 'freelancepay.wallet',       // Payout wallet address
  BIO: 'freelancepay.bio',             // Short bio
  AVAILABLE: 'freelancepay.available', // "true" or "false"
} as const;

// Supported Chains for Settlement
export const SUPPORTED_CHAINS = {
  ethereum: {
    id: 1,
    name: 'Ethereum',
    usdcAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    rpcUrl: process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://eth.llamarpc.com',
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    usdcAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://polygon-rpc.com',
  },
  arbitrum: {
    id: 42161,
    name: 'Arbitrum One',
    usdcAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
  },
  base: {
    id: 8453,
    name: 'Base',
    usdcAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org',
  },
  sepolia: {
    id: 11155111,
    name: 'Sepolia (Testnet)',
    usdcAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Circle USDC on Sepolia
    rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org',
  },
  arcTestnet: {
    id: 5042002,
    name: 'Arc Testnet',
    usdcAddress: '0x3600000000000000000000000000000000000000', // Native USDC on Arc
    rpcUrl: process.env.NEXT_PUBLIC_ARC_TESTNET_RPC_URL || 'https://rpc.testnet.arc.network/',
  },
} as const;

// Yellow Network Configuration
export const YELLOW_CONFIG = {
  // Use sandbox for testing, production for mainnet
  wsUrl: process.env.NEXT_PUBLIC_YELLOW_WS_URL || 'wss://clearnet-sandbox.yellow.com/ws',
  
  // Protocol name for our app
  protocol: 'freelancepay-v1',
  
  // Default session settings
  defaultWeights: [50, 50],
  defaultQuorum: 100,
  defaultChallenge: 0,
} as const;

// Circle Configuration
export const CIRCLE_CONFIG = {
  // Bridge Kit supported chains
  bridgeChains: ['Ethereum', 'Polygon', 'Arbitrum', 'Base', 'Arc_Testnet'],
  
  // CCTP domains
  cctpDomains: {
    ethereum: 0,
    arbitrum: 3,
    polygon: 7,
    base: 6,
    arcTestnet: 26,
  },
} as const;

// UI Constants
export const UI = {
  // Maximum values
  MAX_RATE: 10000,
  MAX_SERVICES: 5,
  
  // Minimum payment (in USDC, 6 decimals)
  MIN_PAYMENT: 1_000_000, // 1 USDC
  
  // Default profile values
  DEFAULT_BIO: 'Available for freelance work',
} as const;

// USDC has 6 decimals
export const USDC_DECIMALS = 6;

// Helper to convert USDC amount to human readable
export function formatUSDC(amount: bigint | string | number): string {
  const value = typeof amount === 'bigint' ? amount : BigInt(amount);
  const divisor = BigInt(10 ** USDC_DECIMALS);
  const whole = value / divisor;
  const fraction = value % divisor;
  
  if (fraction === 0n) {
    return `${whole}.00`;
  }
  
  return `${whole}.${fraction.toString().padStart(USDC_DECIMALS, '0').slice(0, 2)}`;
}

// Helper to convert human amount to USDC units
export function parseUSDC(amount: string | number): bigint {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return BigInt(Math.round(value * 10 ** USDC_DECIMALS));
}

// Chain type
export type SupportedChain = keyof typeof SUPPORTED_CHAINS;
