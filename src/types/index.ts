// ===========================================
// FreelancePay TypeScript Types
// ===========================================

import { SupportedChain } from '@/lib/constants';

// Freelancer Profile (stored in ENS text records)
export interface FreelancerProfile {
  ensName: string;
  address: string;
  rate: number;              // Hourly rate in USDC
  services: string[];        // List of services offered
  preferredChain: SupportedChain;
  payoutWallet: string;      // Address to receive payments
  bio: string;
  available: boolean;
  avatarUrl?: string;        // From ENS avatar record
}

// Yellow Network Session
export interface YellowSession {
  id: string;
  participants: [string, string]; // [payer, freelancer]
  allocations: SessionAllocation[];
  status: 'pending' | 'active' | 'settling' | 'closed';
  createdAt: number;
}

export interface SessionAllocation {
  participant: string;
  asset: 'usdc';
  amount: string; // In smallest units (6 decimals for USDC)
}

// Payment Transaction
export interface Payment {
  id: string;
  sessionId: string;
  from: string;
  to: string;
  amount: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'settled';
  txHash?: string;
}

// Settlement Request
export interface SettlementRequest {
  sessionId: string;
  targetChain: SupportedChain;
  recipient: string;
  amount: string;
}

// Settlement Result
export interface SettlementResult {
  success: boolean;
  sourceTxHash?: string;
  destinationTxHash?: string;
  error?: string;
}

// Yellow SDK Message Types
export interface YellowMessage {
  type: 'session_created' | 'payment' | 'session_message' | 'error' | 'balance_update';
  sessionId?: string;
  amount?: string;
  sender?: string;
  error?: string;
  data?: unknown;
}

// ENS Text Records for FreelancePay
export interface ENSFreelancePayRecords {
  'freelancepay.rate'?: string;
  'freelancepay.services'?: string;
  'freelancepay.chain'?: string;
  'freelancepay.wallet'?: string;
  'freelancepay.bio'?: string;
  'freelancepay.available'?: string;
}

// Circle Bridge Result
export interface BridgeResult {
  state: 'pending' | 'success' | 'failed';
  amount: string;
  token: string;
  source: {
    address: string;
    chain: string;
  };
  destination: {
    address: string;
    chain: string;
  };
  steps: BridgeStep[];
}

export interface BridgeStep {
  name: 'approve' | 'burn' | 'fetchAttestation' | 'mint';
  state: 'pending' | 'success' | 'failed';
  txHash?: string;
  explorerUrl?: string;
}

// App State
export interface AppState {
  isConnected: boolean;
  address?: string;
  ensName?: string;
  isFreelancer: boolean;
  profile?: FreelancerProfile;
  activeSession?: YellowSession;
  balance: {
    yellow: string;      // Balance in Yellow channel
    onchain: string;     // On-chain USDC balance
  };
}

// Component Props
export interface PaymentFormProps {
  freelancer: FreelancerProfile;
  onPayment: (amount: string) => Promise<void>;
  isLoading: boolean;
}

export interface ProfileEditorProps {
  profile?: Partial<FreelancerProfile>;
  onSave: (profile: Partial<FreelancerProfile>) => Promise<void>;
  isLoading: boolean;
}

export interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: YellowSession;
  onSettle: (request: SettlementRequest) => Promise<SettlementResult>;
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Transaction Status
export type TransactionStatus = 'idle' | 'pending' | 'confirming' | 'success' | 'error';

// Toast notification types
export interface ToastMessage {
  type: 'success' | 'error' | 'loading' | 'info';
  message: string;
  duration?: number;
}
