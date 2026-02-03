'use client';

import { motion } from 'framer-motion';
import { 
  User, 
  Zap, 
  Globe, 
  Wallet, 
  ArrowRight, 
  Shield,
  Clock,
  DollarSign,
} from 'lucide-react';

/**
 * Interactive Architecture Diagram
 * Shows the flow of a payment through the system
 * Animated for visual impact during demo
 */
export function ArchitectureDiagram() {
  const steps = [
    { icon: User, label: 'Client', sublabel: 'Connects wallet' },
    { icon: Globe, label: 'ENS', sublabel: 'Lookup profile' },
    { icon: Zap, label: 'Yellow Network', sublabel: 'Instant payment' },
    { icon: Shield, label: 'Circle Arc', sublabel: 'Settlement' },
    { icon: Wallet, label: 'Freelancer', sublabel: 'Receives USDC' },
  ];

  return (
    <div className="bg-gray-800/30 rounded-2xl p-8 overflow-hidden">
      <h3 className="text-xl font-bold text-white mb-8 text-center">Payment Flow</h3>
      
      <div className="flex items-center justify-between relative">
        {/* Connection line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 via-yellow-500 to-green-500 -translate-y-1/2" />
        
        {steps.map((step, index) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Icon circle */}
            <motion.div
              animate={{ 
                boxShadow: [
                  '0 0 0 0 rgba(99, 102, 241, 0)',
                  '0 0 0 10px rgba(99, 102, 241, 0.3)',
                  '0 0 0 0 rgba(99, 102, 241, 0)',
                ],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                delay: index * 0.4,
              }}
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                index === 2 
                  ? 'bg-yellow-500' // Yellow Network highlighted
                  : 'bg-gray-700'
              }`}
            >
              <step.icon className={`w-8 h-8 ${
                index === 2 ? 'text-gray-900' : 'text-white'
              }`} />
            </motion.div>
            
            {/* Label */}
            <p className="mt-3 text-white font-medium">{step.label}</p>
            <p className="text-gray-500 text-sm">{step.sublabel}</p>
            
            {/* Arrow (except last) */}
            {index < steps.length - 1 && (
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute top-8 -right-6 text-gray-600"
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Benefits row */}
      <div className="mt-12 grid grid-cols-3 gap-4">
        <div className="bg-gray-700/50 rounded-xl p-4 text-center">
          <Clock className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-white font-semibold">Instant</p>
          <p className="text-gray-400 text-sm">Sub-second payments</p>
        </div>
        <div className="bg-gray-700/50 rounded-xl p-4 text-center">
          <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-white font-semibold">Zero Gas</p>
          <p className="text-gray-400 text-sm">Off-chain transactions</p>
        </div>
        <div className="bg-gray-700/50 rounded-xl p-4 text-center">
          <Globe className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-white font-semibold">Any Chain</p>
          <p className="text-gray-400 text-sm">Circle CCTP bridging</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Sponsor Integration Showcase
 * Shows how we use each sponsor's technology
 */
export function SponsorShowcase() {
  const sponsors = [
    {
      name: 'Yellow Network',
      logo: '⚡',
      color: 'from-yellow-500 to-orange-500',
      usage: 'State channels for instant, gasless payments',
      features: ['ERC-7824 Protocol', 'Off-chain transactions', 'Session-based payments'],
    },
    {
      name: 'Circle Arc',
      logo: '🔵',
      color: 'from-blue-500 to-cyan-500',
      usage: 'USDC infrastructure for crosschain settlement',
      features: ['Bridge Kit', 'CCTP v2', 'Unified USDC balance'],
    },
    {
      name: 'ENS',
      logo: '🌐',
      color: 'from-purple-500 to-pink-500',
      usage: 'Decentralized identity and profile storage',
      features: ['Custom text records', 'Portable profiles', 'No centralized DB'],
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-6">Powered By</h3>
      
      {sponsors.map((sponsor, index) => (
        <motion.div
          key={sponsor.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-gray-600 transition"
        >
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${sponsor.color} flex items-center justify-center text-2xl`}>
              {sponsor.logo}
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <h4 className="text-white font-semibold">{sponsor.name}</h4>
              <p className="text-gray-400 text-sm mt-1">{sponsor.usage}</p>
              
              {/* Features */}
              <div className="flex flex-wrap gap-2 mt-2">
                {sponsor.features.map((feature) => (
                  <span 
                    key={feature}
                    className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
