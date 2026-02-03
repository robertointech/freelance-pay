'use client';

import { useState, useRef, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Zap, 
  X, 
  MessageCircle,
  Loader2,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { getAgent, quickPay, type AgentAction, type AgentRecommendation } from '@/lib/agent';
import { useYellowSession } from '@/hooks/useYellowSession';
import { useENSProfile } from '@/hooks/useENSProfile';

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  action?: AgentAction;
  recommendation?: AgentRecommendation;
  timestamp: Date;
}

interface AIAgentChatProps {
  onPaymentRequest?: (intent: any) => void;
}

export function AIAgentChat({ onPaymentRequest }: AIAgentChatProps) {
  const { address } = useAccount();
  const { balance } = useYellowSession();
  const { lookupProfile } = useENSProfile();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'agent',
      content: "Hey! I'm your FreelancePay AI assistant ✨ I can help you send instant payments. Try saying 'Pay alice.eth $100' or 'help' to see what I can do!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Get user balance
      const userBalance = balance ? parseFloat(balance.payer) / 1e6 : 0;

      // Process with AI agent
      const result = await quickPay(input.trim(), {
        userAddress: address || '',
        userBalance,
        connectedToYellow: !!balance,
      });

      // If it's a payment action, get recommendation
      let recommendation: AgentRecommendation | undefined;
      
      if (result.action.action === 'pay' && result.action.params.intent) {
        const intent = result.action.params.intent as any;
        const freelancerProfile = await lookupProfile(intent.freelancerENS);
        
        if (freelancerProfile) {
          const agent = getAgent();
          recommendation = await agent.analyzePayment(intent, freelancerProfile, userBalance);
        }
      }

      // Build response message
      let responseContent = result.response;
      
      if (recommendation) {
        if (recommendation.type === 'proceed') {
          responseContent = `${recommendation.message}\n\n💰 **Savings with Yellow Network:**\n• Gas saved: ${recommendation.savings?.gasSaved}\n• Time saved: ${recommendation.savings?.timeSaved}\n\nReady to send?`;
        } else {
          responseContent = recommendation.message;
        }
      }

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: responseContent,
        action: result.action,
        recommendation,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, agentMessage]);

      // If payment action and callback provided
      if (result.action.action === 'pay' && onPaymentRequest) {
        onPaymentRequest(result.action.params.intent);
      }

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: "Oops! Something went wrong. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick action buttons
  const quickActions = [
    { label: 'Help', command: 'What can you do?' },
    { label: 'Balance', command: 'Check my balance' },
  ];

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform z-50 ${isOpen ? 'hidden' : ''}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bot className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-96 h-[500px] bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Pay AI Assistant</h3>
                  <p className="text-white/70 text-xs">Powered by Yellow Network</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-800 text-gray-100'
                    }`}
                  >
                    {message.role === 'agent' && (
                      <div className="flex items-center gap-1 mb-1">
                        <Bot className="w-3 h-3 text-indigo-400" />
                        <span className="text-xs text-indigo-400">AI Assistant</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Recommendation Badge */}
                    {message.recommendation && (
                      <div className={`mt-2 flex items-center gap-2 text-xs ${
                        message.recommendation.type === 'proceed' ? 'text-green-400' :
                        message.recommendation.type === 'warning' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {message.recommendation.type === 'proceed' ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <AlertTriangle className="w-4 h-4" />
                        )}
                        Risk Score: {message.recommendation.riskScore}/100
                      </div>
                    )}
                    
                    {/* Action Button */}
                    {message.action?.action === 'pay' && message.recommendation?.type === 'proceed' && (
                      <button
                        onClick={() => onPaymentRequest?.(message.action?.params.intent)}
                        className="mt-2 w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2 transition"
                      >
                        <Zap className="w-4 h-4" />
                        Confirm Payment
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {/* Processing indicator */}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-800 rounded-2xl px-4 py-2">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 flex gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    setInput(action.command);
                    handleSend();
                  }}
                  className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full text-xs transition"
                >
                  {action.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Pay alice.eth $100..."
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
                  disabled={isProcessing}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isProcessing}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white rounded-xl transition"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
