# ⚡ FreelancePay — Instant Global Payments for Freelancers

## Overview

Freelancers working globally face three core problems: high platform fees (3-8%), slow cross-border settlements (3-7 days), and chain fragmentation when receiving crypto payments.

FreelancePay is a decentralized payment platform that combines off-chain state channels, crosschain USDC infrastructure, and ENS-based identity to enable instant, gasless payments between clients and freelancers — settled on any chain.

## How It Works

1. **Freelancer registers** their rates, services, and preferred settlement chain as ENS text records
2. **Client searches** by ENS name (e.g., `alice.eth`) and sees the freelancer's profile
3. **Payment session opens** via Yellow Network state channel — client deposits USDC
4. **Payments are instant** — off-chain state updates, no gas per transaction
5. **Session closes** — funds settle to the freelancer's preferred chain via Circle Bridge Kit

The result is a payment experience that feels like Venmo but settles on-chain with full cryptographic guarantees.

## Architecture

```
Client Wallet
     │
     ▼
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  ENS Lookup │────▶│  Yellow Network  │────▶│  Circle Arc     │
│  (Profile)  │     │  (State Channel) │     │  (Settlement)   │
└─────────────┘     └──────────────────┘     └─────────────────┘
                           │                         │
                    Instant, gasless          Crosschain USDC
                      payments              to preferred chain
                                                     │
                                                     ▼
                                              Freelancer Wallet
```

## Tech Stack

- **Yellow Network** (`@erc7824/nitrolite`) — Off-chain payment sessions via state channels
- **Circle Arc / Bridge Kit** — Crosschain USDC settlement using CCTP
- **ENS** — Custom text records as decentralized freelancer profiles
- **Next.js 14 + TypeScript**
- **wagmi + RainbowKit**
- **Tailwind CSS**

## Getting Started

```bash
git clone https://github.com/robertointech/freelance-pay.git
cd freelance-pay
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Links

- [Yellow Network Docs](https://docs.yellow.com)
- [Circle Developer Docs](https://developers.circle.com)
- [ENS Documentation](https://docs.ens.domains)
- [Nitrolite SDK](https://github.com/erc7824/nitrolite)
