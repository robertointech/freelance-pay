// ===========================================
// useCircleBridge Hook
// ===========================================
// React hook for crosschain USDC settlements using Circle Bridge Kit

'use client';

import { useState, useCallback } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { 
  bridgeUSDC, 
  settlePayment, 
  getUSDCBalance,
  getSupportedBridgeChains,
  getExplorerUrl,
  estimateBridgeTime,
} from '@/lib/circle';
import { type SupportedChain } from '@/lib/constants';
import type { SettlementRequest, SettlementResult, BridgeResult } from '@/types';

interface UseCircleBridgeReturn {
  // State
  isBridging: boolean;
  bridgeResult: BridgeResult | null;
  settlementResult: SettlementResult | null;
  error: string | null;
  
  // Data
  supportedChains: SupportedChain[];
  
  // Actions
  bridge: (
    sourceChain: SupportedChain,
    destinationChain: SupportedChain,
    amount: string,
    destinationAddress?: string
  ) => Promise<BridgeResult>;
  
  settle: (request: SettlementRequest) => Promise<SettlementResult>;
  
  getBalance: (chain: SupportedChain) => Promise<string>;
  
  getEstimatedTime: (source: SupportedChain, destination: SupportedChain) => string;
  
  getExplorer: (chain: SupportedChain, txHash: string) => string;
}

/**
 * Hook for crosschain USDC bridging via Circle Bridge Kit
 * 
 * This enables freelancers to receive payments on ANY chain,
 * regardless of where the payer sends from.
 * 
 * Usage:
 * ```tsx
 * const { bridge, settle, getBalance } = useCircleBridge();
 * 
 * // Bridge USDC from Arbitrum to Polygon
 * await bridge('arbitrum', 'polygon', '100');
 * 
 * // Settle a Yellow session to freelancer's preferred chain
 * await settle({
 *   sessionId: 'session_123',
 *   targetChain: 'polygon',
 *   recipient: '0x...',
 *   amount: '5000000', // 5 USDC in units
 * });
 * ```
 */
export function useCircleBridge(): UseCircleBridgeReturn {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  
  const [isBridging, setIsBridging] = useState(false);
  const [bridgeResult, setBridgeResult] = useState<BridgeResult | null>(null);
  const [settlementResult, setSettlementResult] = useState<SettlementResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Bridge USDC from one chain to another
   */
  const bridge = useCallback(async (
    sourceChain: SupportedChain,
    destinationChain: SupportedChain,
    amount: string,
    destinationAddress?: string
  ): Promise<BridgeResult> => {
    if (!walletClient) {
      throw new Error('Wallet not connected');
    }

    setIsBridging(true);
    setError(null);
    setBridgeResult(null);

    try {
      const result = await bridgeUSDC(
        sourceChain,
        destinationChain,
        amount,
        walletClient,
        destinationAddress
      );

      setBridgeResult(result);
      console.log('✅ Bridge complete:', result);
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bridge failed';
      setError(message);
      throw err;
    } finally {
      setIsBridging(false);
    }
  }, [walletClient]);

  /**
   * Settle a payment session to a specific chain
   */
  const settle = useCallback(async (
    request: SettlementRequest
  ): Promise<SettlementResult> => {
    if (!walletClient) {
      throw new Error('Wallet not connected');
    }

    setIsBridging(true);
    setError(null);
    setSettlementResult(null);

    try {
      // Default source chain based on current network
      // In production, this would come from the Yellow session
      const sourceChain: SupportedChain = 'sepolia';
      
      const result = await settlePayment(
        request,
        walletClient,
        sourceChain
      );

      setSettlementResult(result);

      if (!result.success) {
        setError(result.error || 'Settlement failed');
      } else {
        console.log('✅ Settlement complete:', result);
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Settlement failed';
      setError(message);
      
      return {
        success: false,
        error: message,
      };
    } finally {
      setIsBridging(false);
    }
  }, [walletClient]);

  /**
   * Get USDC balance on a specific chain
   */
  const getBalance = useCallback(async (chain: SupportedChain): Promise<string> => {
    if (!address || !publicClient) {
      return '0';
    }

    try {
      return await getUSDCBalance(address, chain, publicClient);
    } catch (err) {
      console.error('Error getting balance:', err);
      return '0';
    }
  }, [address, publicClient]);

  /**
   * Get estimated bridge time between chains
   */
  const getEstimatedTime = useCallback((
    source: SupportedChain,
    destination: SupportedChain
  ): string => {
    return estimateBridgeTime(source, destination);
  }, []);

  /**
   * Get explorer URL for a transaction
   */
  const getExplorer = useCallback((
    chain: SupportedChain,
    txHash: string
  ): string => {
    return getExplorerUrl(chain, txHash);
  }, []);

  return {
    isBridging,
    bridgeResult,
    settlementResult,
    error,
    supportedChains: getSupportedBridgeChains(),
    bridge,
    settle,
    getBalance,
    getEstimatedTime,
    getExplorer,
  };
}
