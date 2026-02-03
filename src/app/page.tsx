'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Zap, Globe, Shield, ArrowRight, Search, DollarSign } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [searchENS, setSearchENS] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchENS.trim()) {
      router.push(`/pay/${searchENS.trim()}`);
    }
  };

  const features = [
    {
      icon: Zap,
      title: 'Instant Payments',
      description: 'Send and receive payments in milliseconds using Yellow Network state channels.',
      color: 'text-yellow-400',
    },
    {
      icon: DollarSign,
      title: 'Zero Gas Fees',
      description: 'Off-chain transactions mean zero gas costs. Only pay when settling.',
      color: 'text-green-400',
    },
    {
      icon: Globe,
      title: 'Any Chain Settlement',
      description: 'Receive USDC on Ethereum, Polygon, Arbitrum, Base, or Arc.',
      color: 'text-blue-400',
    },
    {
      icon: Shield,
      title: 'ENS Identity',
      description: 'Your ENS name is your portable profile with rates and preferences.',
      color: 'text-purple-400',
    },
  ];

  const steps = [
    { num: '01', title: 'Connect Wallet', desc: 'Link your ENS name' },
    { num: '02', title: 'Set Profile', desc: 'Define rates in ENS' },
    { num: '03', title: 'Get Paid', desc: 'Instant payments' },
    { num: '04', title: 'Settle', desc: 'Withdraw anywhere' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">FreelancePay</span>
          </div>
          <div className="flex items-center gap-4">
            {isConnected && (
              <button onClick={() => router.push('/dashboard')} className="text-gray-300 hover:text-white transition">
                Dashboard
              </button>
            )}
            <ConnectButton />
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Instant Global Payments<br />
            <span className="text-indigo-400">for Freelancers</span>
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Pay freelancers instantly, gaslessly, on any chain. Powered by Yellow Network state channels and Circle USDC.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-16">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchENS}
                onChange={(e) => setSearchENS(e.target.value)}
                placeholder="Search freelancer by ENS (e.g., alice.eth)"
                className="w-full pl-12 pr-32 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2">
                Pay Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {features.map((f) => (
              <div key={f.title} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-left hover:border-gray-600 transition">
                <f.icon className={`w-10 h-10 ${f.color} mb-4`} />
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.description}</p>
              </div>
            ))}
          </div>

          {/* How it Works */}
          <h2 className="text-3xl font-bold text-white mb-10">How It Works</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-20">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center w-40">
                  <span className="text-indigo-400 font-mono text-sm">{s.num}</span>
                  <h4 className="text-white font-semibold mt-2">{s.title}</h4>
                  <p className="text-gray-500 text-sm mt-1">{s.desc}</p>
                </div>
                {i < steps.length - 1 && <ArrowRight className="w-6 h-6 text-gray-600 mx-2 hidden md:block" />}
              </div>
            ))}
          </div>

          {/* Tech Stack - Sponsors */}
          <div className="bg-gray-800/30 rounded-2xl p-8 mb-20">
            <h3 className="text-xl font-bold text-white mb-6">Powered By</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-700/50 rounded-xl p-4">
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="text-white font-semibold">Yellow Network</h4>
                <p className="text-gray-400 text-sm">State channels for instant, gasless payments</p>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-4">
                <div className="text-2xl mb-2">🔵</div>
                <h4 className="text-white font-semibold">Circle Arc</h4>
                <p className="text-gray-400 text-sm">USDC crosschain settlement</p>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-4">
                <div className="text-2xl mb-2">🌐</div>
                <h4 className="text-white font-semibold">ENS</h4>
                <p className="text-gray-400 text-sm">Decentralized identity & profiles</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
            <p className="text-indigo-100 mb-6">Connect your wallet and set up your freelancer profile in minutes.</p>
            <ConnectButton />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-800">
        <div className="flex flex-col md:flex-row items-center justify-between text-gray-500 text-sm">
          <p>Built for HackMoney 2026 • Yellow Network + Circle Arc + ENS</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="https://github.com" className="hover:text-white">GitHub</a>
            <a href="#" className="hover:text-white">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
