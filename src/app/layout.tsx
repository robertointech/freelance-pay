import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FreelancePay - Instant Global Payments for Freelancers',
  description: 'Pay freelancers instantly, gaslessly, on any chain. Powered by Yellow Network, Circle Arc, and ENS.',
  keywords: ['freelance', 'payments', 'crypto', 'USDC', 'Yellow Network', 'ENS', 'crosschain'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
