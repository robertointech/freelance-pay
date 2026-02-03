# 🌐 FreelancePay - Instant Global Payments for Freelancers

## 🎯 Problem Statement

Freelancers working globally face three major pain points:

1. **High fees**: Traditional payment platforms charge 3-5% + currency conversion fees
2. **Slow settlements**: Cross-border payments take 3-7 business days
3. **Chain fragmentation**: Crypto payments are locked to specific chains, limiting flexibility

## 💡 Solution

**FreelancePay** is a decentralized payment platform that enables:

- ⚡ **Instant payments** via Yellow Network state channels (gasless, sub-second)
- 🌍 **Cross-chain settlement** using Circle's Arc/USDC infrastructure
- 🆔 **ENS-powered profiles** where freelancers store their rates, services, and payment preferences
- 🤖 **AI Agent** that understands natural language - just say "Pay alice.eth $100"

## ✨ WOW Factor Features

### 🤖 AI Payment Agent
Natural language payment processing. Just type:
- "Pay alice.eth $500 for the website work"
- "Send bob.eth $100 weekly for 4 weeks"
- "Tip vitalik.eth 50 bucks"

The AI parses your intent, validates the payment, calculates savings, and executes instantly.

### 📊 Live Transaction Feed
Real-time visualization of payments flowing through the network. Shows:
- Instant payment confirmations
- Total volume processed
- Gas fees saved
- Settlement status

### 🎨 Interactive Architecture
Animated diagram showing the payment flow from client → ENS → Yellow → Arc → Freelancer.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FREELANCEPAY ARCHITECTURE                      │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   CLIENT     │     │  FREELANCER  │     │    ENS       │
│   (Payer)    │     │  (Receiver)  │     │   Profile    │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                     │
       │  1. Lookup ENS     │                     │
       │────────────────────┼─────────────────────▶
       │                    │                     │
       │  2. Get profile    │   rates, services,  │
       │◀───────────────────┼─────────────────────│
       │                    │   preferred chain   │
       │                    │                     │
       ▼                    ▼                     │
┌─────────────────────────────────────────────────────────────────────────┐
│                        YELLOW NETWORK (State Channels)                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  • Off-chain transactions (instant, gasless)                     │   │
│  │  • Session-based payments                                        │   │
│  │  • Cryptographic proofs for security                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   │ 3. Settlement
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        CIRCLE ARC / USDC LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │  Bridge Kit  │  │   Gateway    │  │   Wallets    │                  │
│  │  (Crosschain)│  │(Unified USDC)│  │  (Payouts)   │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        SUPPORTED CHAINS                                  │
│    Ethereum  •  Polygon  •  Arbitrum  •  Base  •  Arc Testnet          │
└─────────────────────────────────────────────────────────────────────────┘
```

## 🔄 User Flow

### For Freelancers (Setup)
1. Connect wallet with ENS name (e.g., `alice.eth`)
2. Set up profile in ENS text records:
   - `freelancepay.rate` = "50" (hourly rate in USDC)
   - `freelancepay.services` = "Web Development, Smart Contracts"
   - `freelancepay.chain` = "polygon" (preferred settlement chain)
   - `freelancepay.wallet` = "0x..." (payout address)
3. Deposit initial funds to Yellow Network channel

### For Clients (Payment)
1. Search freelancer by ENS name
2. View rates and services from ENS profile
3. Connect wallet and fund Yellow session
4. Send instant payment (gasless via Yellow)
5. Freelancer receives funds instantly
6. Settlement to freelancer's preferred chain via Arc

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14 + TypeScript | React framework with App Router |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Wallet** | wagmi + viem + RainbowKit | Wallet connection & transactions |
| **Identity** | ENS.js + wagmi hooks | Decentralized identity & profiles |
| **Payments** | @erc7824/nitrolite | Yellow Network SDK for instant payments |
| **Crosschain** | @circle-fin/bridge-kit | CCTP for USDC bridging |
| **Wallets** | @circle-fin/developer-controlled-wallets | Circle Wallets API |
| **Testnet** | Sepolia + Arc Testnet | Testing environment |

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/freelance-pay.git
cd freelance-pay

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

## 🔐 Environment Variables

```env
# Wallet Connect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Circle API (get from developers.circle.com)
CIRCLE_API_KEY=your_circle_api_key
CIRCLE_ENTITY_SECRET=your_entity_secret

# Yellow Network
NEXT_PUBLIC_YELLOW_WS_URL=wss://clearnet-sandbox.yellow.com/ws

# ENS
NEXT_PUBLIC_ENS_SUBGRAPH_URL=https://api.thegraph.com/subgraphs/name/ensdomains/ens
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Test with Sepolia
npm run dev -- --network sepolia
```

## 🚀 Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

## 🤝 Team

Built for HackMoney 2026 by Rob - Full-stack developer specializing in React, Next.js, and Web3.

---

Built with ❤️ using Yellow Network, Circle Arc, and ENS
