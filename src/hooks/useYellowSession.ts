'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { getYellowClient, initYellowClient, YellowClient } from '@/lib/yellow';
import type { YellowSession, Payment, YellowMessage } from '@/types';

interface UseYellowSessionReturn {
  isConnected: boolean;
  isConnecting: boolean;
  session: YellowSession | null;
  payments: Payment[];
  balance: { payer: string; freelancer: string } | null;
  error: string | null;
  connect: () => Promise<void>;
  createSession: (freelancerAddress: string, deposit: string) => Promise<YellowSession>;
  sendPayment: (amount: string) => Promise<Payment>;
  closeSession: () => Promise<void>;
  disconnect: () => void;
}

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

  const connect = useCallback(async () => {
    if (!address || !walletClient) {
      setError('Please connect your wallet first');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const yellowClient = await initYellowClient(address, walletClient);
      setClient(yellowClient);
      setIsConnected(true);
      console.log('🟢 Yellow session hook connected');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect';
      setError(message);
      console.error('❌ Yellow connection failed:', err);
    } finally {
      setIsConnecting(false);
    }
  }, [address, walletClient]);

  const createSession = useCallback(async (
    freelancerAddress: string,
    deposit: string
  ): Promise<YellowSession> => {
    // Auto-connect if not connected
    if (!client && address && walletClient) {
      console.log('Auto-connecting to Yellow...');
      const yellowClient = await initYellowClient(address, walletClient);
      setClient(yellowClient);
      setIsConnected(true);
      
      const newSession = await yellowClient.createPaymentSession(freelancerAddress, deposit);
      setSession(newSession);
      const sessionBalance = yellowClient.getSessionBalance(newSession.id);
      setBalance(sessionBalance);
      return newSession;
    }

    if (!client || !address) {
      throw new Error('Not connected to Yellow Network');
    }

    setError(null);

    try {
      const newSession = await client.createPaymentSession(freelancerAddress, deposit);
      setSession(newSession);
      const sessionBalance = client.getSessionBalance(newSession.id);
      setBalance(sessionBalance);
      return newSession;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create session';
      setError(message);
      throw err;
    }
  }, [client, address, walletClient]);

  const sendPayment = useCallback(async (amount: string): Promise<Payment> => {
    if (!client || !session) {
      throw new Error('No active session');
    }

    const freelancerAddress = session.participants[1];
    setError(null);

    try {
      const payment = await client.sendPayment(session.id, amount, freelancerAddress);
      setPayments(prev => [...prev, payment]);
      const sessionBalance = client.getSessionBalance(session.id);
      setBalance(sessionBalance);
      return payment;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      setError(message);
      throw err;
    }
  }, [client, session]);

  const closeSession = useCallback(async () => {
    if (!client || !session) {
      throw new Error('No active session');
    }

    setError(null);

    try {
      await client.closeSession(session.id);
      setSession(prev => prev ? { ...prev, status: 'settling' } : null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to close session';
      setError(message);
      throw err;
    }
  }, [client, session]);

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

  useEffect(() => {
    if (!client) return;

    const unsubscribe = client.onMessage((message: YellowMessage) => {
      if (message.type === 'balance_update' && session) {
        const sessionBalance = client.getSessionBalance(session.id);
        setBalance(sessionBalance);
      }
    });

    return () => unsubscribe();
  }, [client, session]);

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
