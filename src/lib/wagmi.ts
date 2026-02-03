// ===========================================
// Wagmi & RainbowKit Configuration
// ===========================================

'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { 
  mainnet, 
  polygon, 
  arbitrum, 
  base, 
  sepolia,
} from 'wagmi/chains';
import { http } from 'wagmi';

// Define Arc Testnet chain
const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: {
    name: 'Arc',
    symbol: 'ARC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.arc.network/'],
    },
    public: {
      http: ['https://rpc.testnet.arc.network/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arc Testnet Explorer',
      url: 'https://testnet.arcscan.app',
    },
  },
  testnet: true,
} as const;

// Wagmi configuration with RainbowKit
export const config = getDefaultConfig({
  appName: 'FreelancePay',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo',
  chains: [
    mainnet,
    polygon,
    arbitrum,
    base,
    sepolia,
    arcTestnet,
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [sepolia.id]: http(),
    [arcTestnet.id]: http('https://rpc.testnet.arc.network/'),
  },
  ssr: true,
});

// Export chain for use elsewhere
export { arcTestnet };
