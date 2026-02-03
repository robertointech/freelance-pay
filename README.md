# 🌐 FreelancePay - Instant Global Payments for Freelancers

> **HackMoney 2026 Submission**  
> Multi-sponsor bounty targeting: Yellow ($5K) + Arc Crosschain ($2.5K) + Arc Payouts ($2.5K) + ENS Integration ($2K)

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

## 🎬 Demo Flow

### Video Demo Script (2-3 minutes) - WINNING FORMULA

**0:00 - 0:15 | Hook** 🎣
"What if I told you freelancers could get paid instantly, without gas fees, on any chain?"
*Show: PayPal waiting screen vs FreelancePay instant confirmation*

**0:15 - 0:45 | The Problem** 😤
- Show traditional payment: 3-7 days wait, 3-5% fees
- "I'm a freelancer. I built this because I was tired of waiting."

**0:45 - 1:30 | The Solution** ⚡
- Demo the AI Agent: "Pay alice.eth $100 for the logo"
- Show instant confirmation (< 1 second)
- Highlight: "Zero gas fees - this happened off-chain"

**1:30 - 2:00 | The Tech** 🔧
- Quick architecture diagram
- "Yellow Network for instant payments"
- "Circle Arc for settlement to any chain"
- "ENS for decentralized identity"

**2:00 - 2:30 | Settlement** 💰
- Show freelancer dashboard
- One-click withdraw to Polygon
- "Client paid on Arbitrum, I got it on Polygon"

**2:30 - 2:45 | Closing** 🚀
- Show live transaction feed
- "FreelancePay - Instant. Gasless. Global."

### Key Demo Tips
- **Don't wait for MetaMask** - skip confirmations in edit
- **Use testnet** - have funds pre-loaded
- **Show the AI** - it's the WOW factor
- **End with live feed** - visual impact

## 🏆 Bounty Qualification

### Yellow Network ($15K pool)
- ✅ Yellow SDK integration via @erc7824/nitrolite
- ✅ Off-chain payment logic (instant, gasless)
- ✅ Session-based spending for freelancer services
- ✅ On-chain settlement when session ends
- ✅ 2-3 min demo video

### Arc - Crosschain Financial Apps ($5K pool)
- ✅ Uses Arc + Circle Gateway + USDC
- ✅ Multiple chains as one liquidity surface
- ✅ Seamless UX despite crosschain complexity
- ✅ Functional MVP with architecture diagram
- ✅ Video demonstration

### Arc - Global Payouts ($2.5K pool)
- ✅ Automated payout logic
- ✅ Multi-chain settlement for freelancers
- ✅ Uses Circle Wallets + Bridge Kit
- ✅ Real-world use case (freelancer payouts)

### ENS Integration ($3.5K pool - split)
- ✅ Custom ENS integration code (not just RainbowKit)
- ✅ ENS text records for profile data
- ✅ Functional demo without hardcoded values
- ✅ Open source on GitHub

### ENS Creative DeFi ($1.5K pool)
- ✅ Novel use of ENS for DeFi
- ✅ Text records store payment preferences
- ✅ ENS as decentralized identity layer

## 📁 Project Structure

```
freelance-pay/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Landing page with live feed
│   │   ├── dashboard/         # Freelancer dashboard
│   │   └── pay/[ens]/         # Payment page (core flow)
│   ├── components/
│   │   ├── AIAgentChat.tsx    # 🤖 AI Payment Agent (WOW factor!)
│   │   ├── LiveTransactions.tsx # 📊 Real-time tx feed
│   │   ├── ArchitectureDiagram.tsx # 🎨 Animated architecture
│   │   ├── Providers.tsx      # Wallet providers
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useYellowSession.ts   # ⭐ Yellow SDK hook
│   │   ├── useENSProfile.ts      # ⭐ Custom ENS text records
│   │   └── useCircleBridge.ts    # ⭐ Circle Bridge Kit hook
│   ├── lib/
│   │   ├── agent.ts           # 🤖 AI Agent logic
│   │   ├── yellow.ts          # Yellow Network wrapper
│   │   ├── ens.ts             # ENS utilities (bounty code!)
│   │   ├── circle.ts          # Circle SDK wrapper
│   │   └── constants.ts
│   └── types/
│       └── index.ts
├── docs/
├── .env.example
├── package.json
└── README.md
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

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Team

Built for HackMoney 2026 by Rob - Full-stack developer specializing in React, Next.js, and Web3.

## 🔗 Links

- **Live Demo**: [freelancepay.vercel.app](https://freelancepay.vercel.app)
- **Video Demo**: [YouTube/Loom link]
- **GitHub**: [github.com/yourusername/freelance-pay](https://github.com/yourusername/freelance-pay)

---

Built with ❤️ using Yellow Network, Circle Arc, and ENS
