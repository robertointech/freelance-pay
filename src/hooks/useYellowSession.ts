// ===========================================
// useYellowSession Hook
// ===========================================
// React hook for managing Yellow Network payment sessions

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { getYellowClient, initYellowClient, YellowClient } from '@/lib/yellow';
import type { YellowSession, Payment, YellowMessage } from '@/types';

interface UseYellowSessionReturn {
  // State
  isConnected: boolean;
  isConnecting: boolean;
  session: YellowSession | null;
  payments: Payment[];
  balance: { payer: string; freelancer: string } | null;
  error: string | null;
  
  // Actions
  connect: () => Promise<void>;
  createSession: (freelancerAddress: string, deposit: string) => Promise<YellowSession>;
  sendPayment: (amount: string) => Promise<Payment>;
  closeSession: () => Promise<void>;
  disconnect: () => void;
}

/**
 * Hook for managing Yellow Network payment sessions
 * 
 * Usage:
 * ```tsx
 * const { 
 *   isConnected, 
 *   createSession, 
 *   sendPayment 
 * } = useYellowSession();
 * 
 * // Create a session with a freelancer
 * await createSession(freelancerAddress, "100"); // Deposit 100 USDC
 * 
 * // Send instant payments
 * await sendPayment("25"); // Send 25 USDC instantly!
 * ```
 */
export function useYellowSession(): UseYellowSessionReturn {
  const { address, isConnected: walletConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const [client, setClient] = useState<YellowClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [session, setSession] = useState<YellowSession | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [balance, setBalance] = useState<{ payer: string; freelancer: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Connect to Yellow Network
   */
  const connect = useCallback(async () => {
    if (!address || !walletClient) {
      setError('Please connect your wallet first');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Create message signer from wallet client
      const messageSigner = async (message: string) => {
        const signature = await walletClient.signMessage({
          message,
        });
        return signature;
      };

      // Initialize Yellow client
      const yellowClient = await initYellowClient(address, messageSigner);
      setClient(yellowClient);
      setIsConnected(true);

      console.log('🟢 Connected to Yellow Network');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect';
      setError(message);
      console.error('❌ Yellow connection failed:', err);
    } finally {
      setIsConnecting(false);
    }
  }, [address, walletClient]);

  /**
   * Create a payment session with a freelancer
   */
  const createSession = useCallback(async (
    freelancerAddress: string,
    deposit: string
  ): Promise<YellowSession> => {
    if (!client || !address) {
      throw new Error('Not connected to Yellow Network');
    }

    setError(null);

    try {
      const newSession = await client.createPaymentSession(
        freelancerAddress,
        deposit
      );

      setSession(newSession);
      
      // Update balance
      const sessionBalance = client.getSessionBalance(newSession.id);
      setBalance(sessionBalance);

      return newSession;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create session';
      setError(message);
      throw err;
    }
  }, [client, address]);

  /**
   * Send an instant payment
   */
  const sendPayment = useCallback(async (amount: string): Promise<Payment> => {
    if (!client || !session) {
      throw new Error('No active session');
    }

    const freelancerAddress = session.participants[1];
    
    setError(null);

    try {
      const payment = await client.sendPayment(
        session.id,
        amount,
        freelancerAddress
      );

      // Add to payments list
      setPayments(prev => [...prev, payment]);

      // Update balance
      const sessionBalance = client.getSessionBalance(session.id);
      setBalance(sessionBalance);

      return payment;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      setError(message);
      throw err;
    }
  }, [client, session]);

  /**
   * Close session and trigger settlement
   */
  const closeSession = useCallback(async () => {
    if (!client || !session) {
      throw new Error('No active session');
    }

    setError(null);

    try {
      await client.closeSession(session.id);
      
      // Update session status
      setSession(prev => prev ? { ...prev, status: 'settling' } : null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to close session';
      setError(message);
      throw err;
    }
  }, [client, session]);

  /**
   * Disconnect from Yellow Network
   */
  const disconnect = useCallback(() => {
    if (client) {
      client.disconnect();
      setClient(null);
    }
    setIsConnected(false);
    setSession(null);
    setPayments([]);
    setBalance(null);
  }, [client]);

  /**
   * Handle incoming messages from Yellow Network
   */
  useEffect(() => {
    if (!client) return;

    const unsubscribe = client.onMessage((message: YellowMessage) => {
      switch (message.type) {
        case 'session_created':
          if (session && message.sessionId === session.id) {
            setSession(prev => prev ? { ...prev, status: 'active' } : null);
          }
          break;

        case 'payment':
          // Payment received (for freelancers)
          if (message.amount && message.sender) {
            const payment: Payment = {
              id: `incoming_${Date.now()}`,
              sessionId: session?.id || '',
              from: message.sender,
              to: address || '',
              amount: message.amount,
              timestamp: Date.now(),
              status: 'confirmed',
            };
            setPayments(prev => [...prev, payment]);
          }
          break;

        case 'balance_update':
          // Refresh balance
          if (session) {
            const sessionBalance = client.getSessionBalance(session.id);
            setBalance(sessionBalance);
          }
          break;

        case 'error':
          setError(message.error || 'Unknown error');
          break;
      }
    });

    return () => unsubscribe();
  }, [client, session, address]);

  /**
   * Auto-connect when wallet is available
   */
  useEffect(() => {
    if (walletConnected && address && walletClient && !isConnected && !isConnecting) {
      // Could auto-connect here if desired
      // connect();
    }
  }, [walletConnected, address, walletClient, isConnected, isConnecting, connect]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (client) {
        client.disconnect();
      }
    };
  }, [client]);

  return {
    isConnected,
    isConnecting,
    session,
    payments,
    balance,
    error,
    connect,
    createSession,
    sendPayment,
    closeSession,
    disconnect,
  };
}
