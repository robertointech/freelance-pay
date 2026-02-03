// ===========================================
// Yellow Network SDK Wrapper
// ===========================================
// Integration with @erc7824/nitrolite for instant, gasless payments

import { createAppSessionMessage, parseRPCResponse } from '@erc7824/nitrolite';
import { YELLOW_CONFIG, USDC_DECIMALS } from './constants';
import type { YellowSession, YellowMessage, Payment, SessionAllocation } from '@/types';

// Message Signer type (from wallet)
type MessageSigner = (message: string) => Promise<string>;

/**
 * YellowClient - Manages connection to Yellow Network ClearNode
 * 
 * Key features:
 * - WebSocket connection to ClearNode
 * - Session management for payments
 * - Off-chain transactions (instant, gasless)
 * - On-chain settlement when needed
 */
export class YellowClient {
  private ws: WebSocket | null = null;
  private messageSigner: MessageSigner | null = null;
  private userAddress: string | null = null;
  private sessions: Map<string, YellowSession> = new Map();
  private messageHandlers: Set<(message: YellowMessage) => void> = new Set();
  private connectionPromise: Promise<void> | null = null;

  /**
   * Initialize the Yellow client with wallet connection
   */
  async init(address: string, signer: MessageSigner): Promise<void> {
    this.userAddress = address;
    this.messageSigner = signer;
    
    // Connect to ClearNode
    await this.connect();
    
    console.log('🟢 Yellow client initialized for:', address);
  }

  /**
   * Connect to Yellow Network ClearNode via WebSocket
   */
  private connect(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(YELLOW_CONFIG.wsUrl);

        this.ws.onopen = () => {
          console.log('✅ Connected to Yellow Network!');
          resolve();
        };

        this.ws.onmessage = (event) => {
          const message = parseRPCResponse(event.data) as YellowMessage;
          this.handleMessage(message);
        };

        this.ws.onerror = (error) => {
          console.error('❌ Yellow connection error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('🔴 Disconnected from Yellow Network');
          this.connectionPromise = null;
        };

      } catch (error) {
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  /**
   * Handle incoming messages from ClearNode
   */
  private handleMessage(message: YellowMessage): void {
    console.log('📨 Yellow message:', message);

    switch (message.type) {
      case 'session_created':
        if (message.sessionId) {
          this.updateSessionStatus(message.sessionId, 'active');
        }
        break;

      case 'payment':
        // Update local balance tracking
        break;

      case 'balance_update':
        // Sync balance from ClearNode
        break;

      case 'error':
        console.error('❌ Yellow error:', message.error);
        break;
    }

    // Notify all registered handlers
    this.messageHandlers.forEach(handler => handler(message));
  }

  /**
   * Create a payment session with a freelancer
   * 
   * This is the core Yellow integration - creates a state channel
   * where payments happen instantly off-chain.
   */
  async createPaymentSession(
    freelancerAddress: string,
    initialDeposit: string // Amount in USDC (human readable, e.g., "100")
  ): Promise<YellowSession> {
    if (!this.userAddress || !this.messageSigner || !this.ws) {
      throw new Error('Yellow client not initialized');
    }

    // Convert to smallest units (6 decimals)
    const depositUnits = BigInt(Math.round(parseFloat(initialDeposit) * 10 ** USDC_DECIMALS));

    // Define the payment application
    const appDefinition = {
      protocol: YELLOW_CONFIG.protocol,
      participants: [this.userAddress, freelancerAddress],
      weights: YELLOW_CONFIG.defaultWeights,
      quorum: YELLOW_CONFIG.defaultQuorum,
      challenge: YELLOW_CONFIG.defaultChallenge,
      nonce: Date.now(),
    };

    // Initial allocations - payer deposits, freelancer starts at 0
    const allocations: SessionAllocation[] = [
      {
        participant: this.userAddress,
        asset: 'usdc',
        amount: depositUnits.toString(),
      },
      {
        participant: freelancerAddress,
        asset: 'usdc',
        amount: '0',
      },
    ];

    // Create signed session message
    const sessionMessage = await createAppSessionMessage(
      this.messageSigner,
      [{ definition: appDefinition, allocations }]
    );

    // Send to ClearNode
    this.ws.send(sessionMessage);

    // Create local session record
    const session: YellowSession = {
      id: `session_${Date.now()}`,
      participants: [this.userAddress, freelancerAddress],
      allocations,
      status: 'pending',
      createdAt: Date.now(),
    };

    this.sessions.set(session.id, session);

    console.log('✅ Payment session created:', session.id);
    return session;
  }

  /**
   * Send an instant payment within a session
   * 
   * This is INSTANT and GASLESS - the magic of state channels!
   * The payment is cryptographically signed and sent to ClearNode,
   * which updates balances immediately without blockchain transactions.
   */
  async sendPayment(
    sessionId: string,
    amount: string, // Human readable USDC amount
    recipient: string
  ): Promise<Payment> {
    if (!this.userAddress || !this.messageSigner || !this.ws) {
      throw new Error('Yellow client not initialized');
    }

    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Convert to smallest units
    const amountUnits = BigInt(Math.round(parseFloat(amount) * 10 ** USDC_DECIMALS));

    // Create payment data
    const paymentData = {
      type: 'payment',
      sessionId,
      amount: amountUnits.toString(),
      recipient,
      timestamp: Date.now(),
    };

    // Sign the payment
    const signature = await this.messageSigner(JSON.stringify(paymentData));

    // Create signed payment message
    const signedPayment = {
      ...paymentData,
      signature,
      sender: this.userAddress,
    };

    // Send instantly through ClearNode
    this.ws.send(JSON.stringify(signedPayment));

    // Create payment record
    const payment: Payment = {
      id: `payment_${Date.now()}`,
      sessionId,
      from: this.userAddress,
      to: recipient,
      amount: amountUnits.toString(),
      timestamp: Date.now(),
      status: 'confirmed', // Instant confirmation in Yellow!
    };

    console.log('💸 Payment sent instantly:', amount, 'USDC');
    return payment;
  }

  /**
   * Close session and trigger on-chain settlement
   * 
   * When the payment session is done, we settle the final balances
   * on-chain. This is the only blockchain transaction needed!
   */
  async closeSession(sessionId: string): Promise<void> {
    if (!this.ws) {
      throw new Error('Yellow client not initialized');
    }

    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Send close request to ClearNode
    this.ws.send(JSON.stringify({
      type: 'close_session',
      sessionId,
    }));

    this.updateSessionStatus(sessionId, 'settling');
    console.log('⏳ Session settling on-chain:', sessionId);
  }

  /**
   * Get current session balance
   */
  getSessionBalance(sessionId: string): { payer: string; freelancer: string } | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    return {
      payer: session.allocations[0]?.amount || '0',
      freelancer: session.allocations[1]?.amount || '0',
    };
  }

  /**
   * Register a message handler
   */
  onMessage(handler: (message: YellowMessage) => void): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * Update session status
   */
  private updateSessionStatus(
    sessionId: string,
    status: YellowSession['status']
  ): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = status;
      this.sessions.set(sessionId, session);
    }
  }

  /**
   * Disconnect from Yellow Network
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionPromise = null;
    console.log('🔴 Disconnected from Yellow Network');
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
let yellowClient: YellowClient | null = null;

/**
 * Get or create Yellow client instance
 */
export function getYellowClient(): YellowClient {
  if (!yellowClient) {
    yellowClient = new YellowClient();
  }
  return yellowClient;
}

/**
 * Initialize Yellow client with wallet
 */
export async function initYellowClient(
  address: string,
  signer: MessageSigner
): Promise<YellowClient> {
  const client = getYellowClient();
  await client.init(address, signer);
  return client;
}
