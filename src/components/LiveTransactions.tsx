'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ArrowRight, Globe, Clock } from 'lucide-react';
import { formatUSDC } from '@/lib/constants';

interface LiveTransaction {
  id: string;
  from: string;
  to: string;
  amount: string;
  chain: string;
  timestamp: number;
  type: 'instant' | 'settling' | 'settled';
}

// Simulated live transactions for demo
const generateMockTransaction = (): LiveTransaction => {
  const names = ['alice.eth', 'bob.eth', 'carol.eth', 'dave.eth', 'eve.eth', 'frank.eth'];
  const chains = ['Polygon', 'Arbitrum', 'Base', 'Ethereum'];
  const amounts = ['25000000', '50000000', '100000000', '150000000', '200000000', '500000000'];
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    from: names[Math.floor(Math.random() * names.length)],
    to: names[Math.floor(Math.random() * names.length)],
    amount: amounts[Math.floor(Math.random() * amounts.length)],
    chain: chains[Math.floor(Math.random() * chains.length)],
    timestamp: Date.now(),
    type: 'instant',
  };
};

export function LiveTransactionFeed() {
  const [transactions, setTransactions] = useState<LiveTransaction[]>([]);
  const [totalVolume, setTotalVolume] = useState(0);
  const [txCount, setTxCount] = useState(0);

  // Simulate live transactions
  useEffect(() => {
    // Initial transactions
    const initial = Array(3).fill(null).map(generateMockTransaction);
    setTransactions(initial);
    setTotalVolume(initial.reduce((acc, tx) => acc + parseInt(tx.amount), 0));
    setTxCount(initial.length);

    // Add new transaction every 3-5 seconds
    const interval = setInterval(() => {
      const newTx = generateMockTransaction();
      
      setTransactions(prev => {
        const updated = [newTx, ...prev.slice(0, 9)]; // Keep last 10
        return updated;
      });
      
      setTotalVolume(prev => prev + parseInt(newTx.amount));
      setTxCount(prev => prev + 1);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 overflow-hidden">
      {/* Header with stats */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <h3 className="text-lg font-semibold text-white">Live Transactions</h3>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-gray-400">
            <span className="text-green-400 font-bold">{formatUSDC(totalVolume.toString())}</span> USDC volume
          </div>
          <div className="text-gray-400">
            <span className="text-indigo-400 font-bold">{txCount}</span> transactions
          </div>
        </div>
      </div>

      {/* Transaction list */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {transactions.map((tx) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-700/50 rounded-xl p-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Instant badge */}
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 rounded-full">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-yellow-400 font-medium">Instant</span>
                  </div>
                  
                  {/* From -> To */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-white font-medium">{tx.from}</span>
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                    <span className="text-white font-medium">{tx.to}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Chain */}
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Globe className="w-3 h-3" />
                    {tx.chain}
                  </div>
                  
                  {/* Amount */}
                  <span className="text-green-400 font-bold text-sm">
                    +{formatUSDC(tx.amount)} USDC
                  </span>
                </div>
              </div>

              {/* Time ago */}
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <TimeAgo timestamp={tx.timestamp} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Yellow Network branding */}
      <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-center gap-2 text-gray-500 text-sm">
        <Zap className="w-4 h-4 text-yellow-400" />
        <span>Powered by Yellow Network State Channels</span>
      </div>
    </div>
  );
}

// Helper component for relative time
function TimeAgo({ timestamp }: { timestamp: number }) {
  const [timeAgo, setTimeAgo] = useState('just now');

  useEffect(() => {
    const update = () => {
      const seconds = Math.floor((Date.now() - timestamp) / 1000);
      
      if (seconds < 5) {
        setTimeAgo('just now');
      } else if (seconds < 60) {
        setTimeAgo(`${seconds}s ago`);
      } else {
        setTimeAgo(`${Math.floor(seconds / 60)}m ago`);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [timestamp]);

  return <span>{timeAgo}</span>;
}

/**
 * Animated stats counter for landing page
 */
export function AnimatedStats() {
  const [stats, setStats] = useState({
    volume: 0,
    transactions: 0,
    saved: 0,
  });

  useEffect(() => {
    // Animate counters on mount
    const duration = 2000;
    const steps = 60;
    const targets = {
      volume: 1250000,
      transactions: 4832,
      saved: 12500,
    };

    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic

      setStats({
        volume: Math.floor(targets.volume * eased),
        transactions: Math.floor(targets.transactions * eased),
        saved: Math.floor(targets.saved * eased),
      });

      if (step >= steps) {
        clearInterval(interval);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="text-center">
        <p className="text-4xl font-bold text-white">
          ${(stats.volume / 1000000).toFixed(2)}M
        </p>
        <p className="text-gray-400 mt-1">Volume Processed</p>
      </div>
      <div className="text-center">
        <p className="text-4xl font-bold text-white">
          {stats.transactions.toLocaleString()}
        </p>
        <p className="text-gray-400 mt-1">Instant Payments</p>
      </div>
      <div className="text-center">
        <p className="text-4xl font-bold text-green-400">
          ${stats.saved.toLocaleString()}
        </p>
        <p className="text-gray-400 mt-1">Gas Fees Saved</p>
      </div>
    </div>
  );
}
