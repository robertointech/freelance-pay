// ===========================================
// Circle Arc/Bridge Kit Integration
// ===========================================
// Handles crosschain USDC transfers using Circle's infrastructure

import { SUPPORTED_CHAINS, CIRCLE_CONFIG, type SupportedChain } from './constants';
import type { SettlementRequest, SettlementResult, BridgeResult } from '@/types';

/**
 * CircleClient - Manages crosschain USDC transfers via Circle
 * 
 * Uses:
 * - Bridge Kit: For CCTP-based crosschain transfers
 * - Gateway: For unified USDC balance (instant access)
 * - Wallets: For developer-controlled wallets
 * 
 * This enables freelancers to receive payments on ANY chain
 * regardless of which chain the payer uses.
 */

// Chain name mapping for Circle Bridge Kit
const CHAIN_NAMES: Record<SupportedChain, string> = {
  ethereum: 'Ethereum',
  polygon: 'Polygon',
  arbitrum: 'Arbitrum',
  base: 'Base',
  sepolia: 'Ethereum_Sepolia',
  arcTestnet: 'Arc_Testnet',
};

/**
 * Initialize Bridge Kit for crosschain transfers
 * 
 * Bridge Kit uses CCTP (Cross-Chain Transfer Protocol) under the hood
 * which enables secure, 1:1 USDC transfers without bridges.
 */
export async function initBridgeKit() {
  // Dynamic import to avoid SSR issues
  const { BridgeKit } = await import('@circle-fin/bridge-kit');
  
  const kit = new BridgeKit({
    // Bridge Kit doesn't require API key for basic transfers
    // It uses CCTP which is permissionless
  });
  
  return kit;
}

/**
 * Bridge USDC from one chain to another
 * 
 * This is used when settling payments - the freelancer's funds
 * are moved from the source chain to their preferred chain.
 * 
 * Example flow:
 * 1. Payer deposits USDC on Arbitrum
 * 2. Payment session happens on Yellow (off-chain)
 * 3. Settlement: bridge USDC from Arbitrum to Polygon (freelancer's choice)
 */
export async function bridgeUSDC(
  sourceChain: SupportedChain,
  destinationChain: SupportedChain,
  amount: string,
  walletClient: any, // Viem wallet client
  destinationAddress?: string
): Promise<BridgeResult> {
  const kit = await initBridgeKit();
  
  // Create viem adapter for the source chain
  const { createViemAdapter } = await import('@circle-fin/bridge-kit/adapters/viem');
  const viemAdapter = createViemAdapter(walletClient);
  
  // Get destination address (default to sender)
  const recipient = destinationAddress || walletClient.account.address;
  
  try {
    // Execute the bridge transfer
    // Bridge Kit handles: approve → burn → attestation → mint
    const result = await kit.bridge({
      from: {
        adapter: viemAdapter,
        chain: CHAIN_NAMES[sourceChain],
      },
      to: {
        chain: CHAIN_NAMES[destinationChain],
        address: recipient,
      },
      amount,
      // Optional: set transfer speed
      config: {
        transferSpeed: 'FAST', // Uses fast finality when available
      },
    });
    
    console.log('✅ Bridge transfer complete:', result);
    return result as BridgeResult;
    
  } catch (error) {
    console.error('❌ Bridge transfer failed:', error);
    throw error;
  }
}

/**
 * Settle a Yellow session to a specific chain
 * 
 * This is the main settlement function that combines:
 * 1. Closing the Yellow session (getting funds on-chain)
 * 2. Bridging to the freelancer's preferred chain
 */
export async function settlePayment(
  request: SettlementRequest,
  walletClient: any,
  sourceChain: SupportedChain = 'sepolia' // Default to testnet
): Promise<SettlementResult> {
  try {
    // If same chain, no bridging needed
    if (sourceChain === request.targetChain) {
      return {
        success: true,
        sourceTxHash: 'direct_settlement',
      };
    }
    
    // Bridge to target chain
    const bridgeResult = await bridgeUSDC(
      sourceChain,
      request.targetChain,
      request.amount,
      walletClient,
      request.recipient
    );
    
    // Extract transaction hashes from steps
    const burnStep = bridgeResult.steps.find(s => s.name === 'burn');
    const mintStep = bridgeResult.steps.find(s => s.name === 'mint');
    
    return {
      success: bridgeResult.state === 'success',
      sourceTxHash: burnStep?.txHash,
      destinationTxHash: mintStep?.txHash,
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Settlement failed',
    };
  }
}

/**
 * Get USDC balance on a specific chain
 */
export async function getUSDCBalance(
  address: string,
  chain: SupportedChain,
  publicClient: any // Viem public client
): Promise<string> {
  const chainConfig = SUPPORTED_CHAINS[chain];
  
  const balance = await publicClient.readContract({
    address: chainConfig.usdcAddress as `0x${string}`,
    abi: [
      {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
      },
    ],
    functionName: 'balanceOf',
    args: [address],
  });
  
  return balance.toString();
}

/**
 * Approve USDC spending (needed before bridging)
 */
export async function approveUSDC(
  spender: string,
  amount: string,
  chain: SupportedChain,
  walletClient: any
): Promise<string> {
  const chainConfig = SUPPORTED_CHAINS[chain];
  
  const hash = await walletClient.writeContract({
    address: chainConfig.usdcAddress as `0x${string}`,
    abi: [
      {
        name: 'approve',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'spender', type: 'address' },
          { name: 'amount', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bool' }],
      },
    ],
    functionName: 'approve',
    args: [spender, BigInt(amount)],
  });
  
  return hash;
}

/**
 * Get supported chains for bridging
 */
export function getSupportedBridgeChains(): SupportedChain[] {
  return Object.keys(SUPPORTED_CHAINS).filter(chain => 
    CIRCLE_CONFIG.bridgeChains.includes(CHAIN_NAMES[chain as SupportedChain])
  ) as SupportedChain[];
}

/**
 * Get chain explorer URL for a transaction
 */
export function getExplorerUrl(chain: SupportedChain, txHash: string): string {
  const explorers: Record<SupportedChain, string> = {
    ethereum: 'https://etherscan.io/tx/',
    polygon: 'https://polygonscan.com/tx/',
    arbitrum: 'https://arbiscan.io/tx/',
    base: 'https://basescan.org/tx/',
    sepolia: 'https://sepolia.etherscan.io/tx/',
    arcTestnet: 'https://testnet.arcscan.app/tx/',
  };
  
  return `${explorers[chain]}${txHash}`;
}

/**
 * Estimate bridge transfer time
 */
export function estimateBridgeTime(
  sourceChain: SupportedChain,
  destinationChain: SupportedChain
): string {
  // CCTP with fast finality is typically < 20 minutes
  // Arc testnet has 1 confirmation = very fast
  if (sourceChain === 'arcTestnet' || destinationChain === 'arcTestnet') {
    return '< 1 minute';
  }
  
  // Standard CCTP transfers
  return '10-20 minutes';
}

/**
 * Circle Gateway integration for instant crosschain access
 * (Optional premium feature)
 */
export interface GatewayConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
}

export async function initGateway(config: GatewayConfig) {
  // Gateway provides instant (<500ms) crosschain USDC access
  // Requires API key and has per-transfer fees
  
  // This would be used for premium instant settlements
  console.log('Gateway initialized for:', config.environment);
}
