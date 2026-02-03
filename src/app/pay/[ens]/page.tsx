'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { 
  ArrowLeft, 
  Zap, 
  Check, 
  Loader2, 
  ExternalLink,
  User,
  DollarSign,
  Globe,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useENSProfile } from '@/hooks/useENSProfile';
import { useYellowSession } from '@/hooks/useYellowSession';
import { formatUSDC, SUPPORTED_CHAINS } from '@/lib/constants';
import type { FreelancerProfile } from '@/types';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const ensName = params.ens as string;
  
  const { isConnected, address } = useAccount();
  const { lookupProfile, isLoading: isLoadingProfile } = useENSProfile();
  const { 
    isConnected: yellowConnected,
    isConnecting,
    session,
    payments,
    balance,
    error: yellowError,
    connect: connectYellow,
    createSession,
    sendPayment,
    closeSession,
  } = useYellowSession();

  const [freelancer, setFreelancer] = useState<FreelancerProfile | null>(null);
  const [amount, setAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('100');
  const [step, setStep] = useState<'load' | 'connect' | 'deposit' | 'pay' | 'success'>('load');
  const [isPaying, setIsPaying] = useState(false);

  // Load freelancer profile
  useEffect(() => {
    async function loadProfile() {
      if (!ensName) return;
      
      const profile = await lookupProfile(ensName);
      setFreelancer(profile);
      
      if (profile) {
        setStep(isConnected ? 'connect' : 'connect');
      }
    }
    
    loadProfile();
  }, [ensName, lookupProfile, isConnected]);

  // Update step based on state
  useEffect(() => {
    if (!freelancer) {
      setStep('load');
    } else if (!isConnected) {
      setStep('connect');
    } else if (!yellowConnected || !session) {
      setStep('deposit');
    } else {
      setStep('pay');
    }
  }, [freelancer, isConnected, yellowConnected, session]);

  // Handle Yellow connection and session creation
  const handleDeposit = async () => {
    if (!freelancer || !depositAmount) return;

    try {
      // First connect to Yellow if not connected
      if (!yellowConnected) {
        await connectYellow();
      }

      // Create payment session
      toast.loading('Creating payment session...', { id: 'session' });
      await createSession(freelancer.address, depositAmount);
      toast.success('Session created! Ready to pay.', { id: 'session' });
      
      setStep('pay');
    } catch (err) {
      toast.error('Failed to create session', { id: 'session' });
      console.error(err);
    }
  };

  // Handle instant payment
  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsPaying(true);

    try {
      toast.loading('Sending payment...', { id: 'payment' });
      await sendPayment(amount);
      toast.success(`Sent ${amount} USDC instantly!`, { id: 'payment' });
      setAmount('');
    } catch (err) {
      toast.error('Payment failed', { id: 'payment' });
      console.error(err);
    } finally {
      setIsPaying(false);
    }
  };

  // Quick amount buttons
  const quickAmounts = freelancer?.rate 
    ? [freelancer.rate / 2, freelancer.rate, freelancer.rate * 2, freelancer.rate * 4]
    : [25, 50, 100, 200];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <ConnectButton />
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Loading State */}
        {isLoadingProfile && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-4" />
            <p className="text-gray-400">Loading {ensName}...</p>
          </div>
        )}

        {/* Not Found */}
        {!isLoadingProfile && !freelancer && (
          <div className="text-center py-20">
            <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Profile Not Found</h2>
            <p className="text-gray-400 mb-6">
              {ensName} doesn't have a FreelancePay profile set up yet.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
            >
              Go Back
            </button>
          </div>
        )}

        {/* Freelancer Profile */}
        {freelancer && (
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {freelancer.ensName.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white">{freelancer.ensName}</h1>
                  <p className="text-gray-400 text-sm font-mono">
                    {freelancer.address.slice(0, 6)}...{freelancer.address.slice(-4)}
                  </p>
                  
                  {freelancer.bio && (
                    <p className="text-gray-300 mt-2">{freelancer.bio}</p>
                  )}
                  
                  {/* Services */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {freelancer.services.map((service) => (
                      <span 
                        key={service}
                        className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700">
                <div className="text-center">
                  <DollarSign className="w-5 h-5 text-green-400 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">${freelancer.rate}/hr</p>
                  <p className="text-gray-500 text-sm">Rate</p>
                </div>
                <div className="text-center">
                  <Globe className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white capitalize">{freelancer.preferredChain}</p>
                  <p className="text-gray-500 text-sm">Settlement Chain</p>
                </div>
                <div className="text-center">
                  <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${freelancer.available ? 'bg-green-400' : 'bg-red-400'}`} />
                  <p className="text-xl font-bold text-white">{freelancer.available ? 'Available' : 'Busy'}</p>
                  <p className="text-gray-500 text-sm">Status</p>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              {/* Step: Connect Wallet */}
              {step === 'connect' && !isConnected && (
                <div className="text-center py-8">
                  <h2 className="text-xl font-bold text-white mb-4">Connect Your Wallet</h2>
                  <p className="text-gray-400 mb-6">Connect your wallet to start a payment session.</p>
                  <ConnectButton />
                </div>
              )}

              {/* Step: Deposit to Yellow */}
              {step === 'deposit' && isConnected && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white">Start Payment Session</h2>
                  <p className="text-gray-400">
                    Deposit USDC to create an instant payment channel. You can send multiple payments without gas fees!
                  </p>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Deposit Amount (USDC)</label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="100"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    {[50, 100, 250, 500].map((val) => (
                      <button
                        key={val}
                        onClick={() => setDepositAmount(val.toString())}
                        className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                      >
                        ${val}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleDeposit}
                    disabled={isConnecting || !depositAmount}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Start Session
                      </>
                    )}
                  </button>

                  <p className="text-center text-gray-500 text-sm">
                    Powered by Yellow Network • Instant & Gasless
                  </p>
                </div>
              )}

              {/* Step: Send Payments */}
              {step === 'pay' && session && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Send Payment</h2>
                    <div className="flex items-center gap-2 text-green-400">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-sm">Session Active</span>
                    </div>
                  </div>

                  {/* Balance Display */}
                  {balance && (
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">Your Session Balance</p>
                      <p className="text-2xl font-bold text-white">
                        {formatUSDC(balance.payer)} USDC
                      </p>
                    </div>
                  )}

                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Amount (USDC)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-2xl font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Quick Amounts */}
                  <div className="flex gap-2">
                    {quickAmounts.map((val) => (
                      <button
                        key={val}
                        onClick={() => setAmount(val.toString())}
                        className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition text-sm"
                      >
                        ${val}
                      </button>
                    ))}
                  </div>

                  {/* Pay Button */}
                  <button
                    onClick={handlePayment}
                    disabled={isPaying || !amount || parseFloat(amount) <= 0}
                    className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition"
                  >
                    {isPaying ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Pay {amount || '0'} USDC Instantly
                      </>
                    )}
                  </button>

                  {/* Payment History */}
                  {payments.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-700">
                      <h3 className="text-sm font-semibold text-gray-400 mb-3">Recent Payments</h3>
                      <div className="space-y-2">
                        {payments.slice(-5).reverse().map((payment) => (
                          <div 
                            key={payment.id}
                            className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3"
                          >
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-400" />
                              <span className="text-white">{formatUSDC(payment.amount)} USDC</span>
                            </div>
                            <span className="text-gray-500 text-sm">
                              {new Date(payment.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Close Session */}
                  <button
                    onClick={closeSession}
                    className="w-full py-2 text-gray-400 hover:text-white transition text-sm"
                  >
                    Close Session & Settle On-Chain
                  </button>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-indigo-900/30 border border-indigo-700/50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-indigo-400 mt-0.5" />
                <div>
                  <p className="text-indigo-200 font-medium">How it works</p>
                  <p className="text-indigo-300/80 text-sm mt-1">
                    Your deposit creates a state channel on Yellow Network. Payments within the session 
                    are instant and gasless. When you close the session, the final balance is settled 
                    on-chain to {freelancer.ensName}'s preferred chain ({freelancer.preferredChain}).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
