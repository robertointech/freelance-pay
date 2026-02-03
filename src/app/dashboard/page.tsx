'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import {
  User,
  Settings,
  Wallet,
  ArrowDownToLine,
  Copy,
  Check,
  Loader2,
  Zap,
  Globe,
  DollarSign,
  ExternalLink,
  Save,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useENSProfile } from '@/hooks/useENSProfile';
import { useCircleBridge } from '@/hooks/useCircleBridge';
import { useYellowSession } from '@/hooks/useYellowSession';
import { SUPPORTED_CHAINS, formatUSDC, type SupportedChain } from '@/lib/constants';
import type { FreelancerProfile } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { 
    ensName, 
    profile, 
    isLoading: isLoadingProfile, 
    isSaving,
    saveProfile,
    refreshProfile,
  } = useENSProfile();
  const { settle, isBridging, supportedChains, getBalance } = useCircleBridge();
  const { balance: yellowBalance } = useYellowSession();

  // Form state
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<FreelancerProfile>>({
    rate: 0,
    services: [],
    preferredChain: 'polygon',
    bio: '',
    available: true,
  });
  const [newService, setNewService] = useState('');
  const [copied, setCopied] = useState(false);
  const [balances, setBalances] = useState<Record<string, string>>({});

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  // Load profile data into form
  useEffect(() => {
    if (profile) {
      setFormData({
        rate: profile.rate,
        services: [...profile.services],
        preferredChain: profile.preferredChain,
        bio: profile.bio,
        available: profile.available,
        payoutWallet: profile.payoutWallet,
      });
    }
  }, [profile]);

  // Load balances
  useEffect(() => {
    async function loadBalances() {
      if (!address) return;
      
      const newBalances: Record<string, string> = {};
      for (const chain of supportedChains) {
        try {
          newBalances[chain] = await getBalance(chain);
        } catch {
          newBalances[chain] = '0';
        }
      }
      setBalances(newBalances);
    }

    loadBalances();
  }, [address, supportedChains, getBalance]);

  const handleSave = async () => {
    try {
      toast.loading('Saving to ENS...', { id: 'save' });
      await saveProfile(formData);
      toast.success('Profile saved to ENS!', { id: 'save' });
      setEditMode(false);
      await refreshProfile();
    } catch (err) {
      toast.error('Failed to save profile', { id: 'save' });
    }
  };

  const addService = () => {
    if (newService.trim() && formData.services && formData.services.length < 5) {
      setFormData({
        ...formData,
        services: [...formData.services, newService.trim()],
      });
      setNewService('');
    }
  };

  const removeService = (index: number) => {
    if (formData.services) {
      setFormData({
        ...formData,
        services: formData.services.filter((_, i) => i !== index),
      });
    }
  };

  const copyPaymentLink = () => {
    if (ensName) {
      navigator.clipboard.writeText(`${window.location.origin}/pay/${ensName}`);
      setCopied(true);
      toast.success('Payment link copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected) {
    return null;
  }

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
          <ConnectButton />
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* No ENS Name Warning */}
        {!ensName && !isLoadingProfile && (
          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-yellow-200 mb-2">ENS Name Required</h2>
            <p className="text-yellow-300/80">
              To use FreelancePay as a freelancer, you need an ENS name. Your ENS name becomes your 
              portable identity where clients can find and pay you.
            </p>
            <a 
              href="https://app.ens.domains"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition"
            >
              Get an ENS Name
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {ensName ? `Welcome, ${ensName}` : 'Dashboard'}
            </h1>
            <p className="text-gray-400 mt-1">Manage your freelancer profile and payments</p>
          </div>
          
          {ensName && (
            <button
              onClick={copyPaymentLink}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Payment Link'}
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-2 bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile
              </h2>
              {ensName && (
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="text-indigo-400 hover:text-indigo-300 transition"
                >
                  <Settings className="w-5 h-5" />
                </button>
              )}
            </div>

            {isLoadingProfile ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              </div>
            ) : ensName ? (
              <div className="space-y-4">
                {/* Rate */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Hourly Rate (USDC)</label>
                  {editMode ? (
                    <input
                      type="number"
                      value={formData.rate || ''}
                      onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                      placeholder="75"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-white">${profile?.rate || 0}/hr</p>
                  )}
                </div>

                {/* Services */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Services</label>
                  <div className="flex flex-wrap gap-2">
                    {(editMode ? formData.services : profile?.services)?.map((service, i) => (
                      <span 
                        key={i}
                        className={`px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm ${editMode ? 'pr-1' : ''}`}
                      >
                        {service}
                        {editMode && (
                          <button
                            onClick={() => removeService(i)}
                            className="ml-2 text-red-400 hover:text-red-300"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                  {editMode && formData.services && formData.services.length < 5 && (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={newService}
                        onChange={(e) => setNewService(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addService()}
                        placeholder="Add service..."
                        className="flex-1 px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={addService}
                        className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>

                {/* Preferred Chain */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Settlement Chain</label>
                  {editMode ? (
                    <select
                      value={formData.preferredChain}
                      onChange={(e) => setFormData({ ...formData, preferredChain: e.target.value as SupportedChain })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    >
                      {Object.entries(SUPPORTED_CHAINS).map(([key, chain]) => (
                        <option key={key} value={key}>{chain.name}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-white capitalize">{profile?.preferredChain}</p>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Bio</label>
                  {editMode ? (
                    <textarea
                      value={formData.bio || ''}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                      placeholder="Tell clients about yourself..."
                    />
                  ) : (
                    <p className="text-gray-300">{profile?.bio || 'No bio set'}</p>
                  )}
                </div>

                {/* Availability */}
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-400">Available for work</label>
                  {editMode ? (
                    <button
                      onClick={() => setFormData({ ...formData, available: !formData.available })}
                      className={`w-12 h-6 rounded-full transition ${formData.available ? 'bg-green-500' : 'bg-gray-600'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition transform ${formData.available ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  ) : (
                    <div className={`w-3 h-3 rounded-full ${profile?.available ? 'bg-green-400' : 'bg-red-400'}`} />
                  )}
                </div>

                {/* Save Button */}
                {editMode && (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition mt-4"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving to ENS...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save to ENS
                      </>
                    )}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                Connect a wallet with an ENS name to set up your profile.
              </p>
            )}
          </div>

          {/* Balance Card */}
          <div className="space-y-6">
            {/* Yellow Balance */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-400" />
                Yellow Balance
              </h3>
              <p className="text-3xl font-bold text-white">
                {yellowBalance ? formatUSDC(yellowBalance.freelancer) : '0.00'} USDC
              </p>
              <p className="text-gray-500 text-sm mt-1">In active sessions</p>
            </div>

            {/* On-chain Balances */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Wallet className="w-5 h-5 text-blue-400" />
                USDC Balances
              </h3>
              <div className="space-y-3">
                {supportedChains.slice(0, 4).map((chain) => (
                  <div key={chain} className="flex items-center justify-between">
                    <span className="text-gray-400 capitalize">{chain}</span>
                    <span className="text-white font-mono">
                      {balances[chain] ? formatUSDC(balances[chain]) : '0.00'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  disabled={isBridging}
                  className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  Withdraw from Yellow
                </button>
                <button
                  disabled={isBridging}
                  className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <Globe className="w-4 h-4" />
                  Bridge to Another Chain
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
