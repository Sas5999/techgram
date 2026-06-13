'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import {
  Flame, Activity, Search, TrendingUp, ShieldAlert, Zap,
  ChevronLeft, ChevronRight, User, X,
} from 'lucide-react';

interface SidebarProps {
  onTabChange: (tab: 'feed' | 'search' | 'analytics') => void;
  currentTab: 'feed' | 'search' | 'analytics';
}

export default function Sidebar({ onTabChange, currentTab }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { feedFilter, setFeedFilter, user, setUser, logout } = useStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const menuItems = [
    { id: 'latest', name: 'Latest Feed', icon: Activity, filter: 'latest', color: 'text-accent-blue' },
    { id: 'trending', name: 'Trending', icon: Flame, filter: 'trending', color: 'text-orange-400' },
    { id: 'founder_mode', name: 'Founder Mode', icon: Zap, filter: 'founder_mode', color: 'text-accent-purple' },
    { id: 'market_disruption', name: 'Disruptions', icon: ShieldAlert, filter: 'market_disruption', color: 'text-red-400' },
    { id: 'search', name: 'Search', icon: Search, tab: 'search' as const, color: 'text-yellow-400' },
    { id: 'analytics', name: 'Intelligence', icon: TrendingUp, tab: 'analytics' as const, color: 'text-accent-emerald' },
  ] as const;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = isRegistering ? 'register' : 'login';
      const body = isRegistering
        ? { email: registerEmail, fullName: registerName, password: registerPassword }
        : { email: registerEmail, password: registerPassword };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/v1/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.token) {
        setUser(data.user);
        localStorage.setItem('techgram_token', data.token);
        setShowAuthModal(false);
      } else {
        alert(data.message || 'Authentication failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error during auth');
    }
  };

  return (
    <aside
      className={`hidden md:flex flex-col h-full border-r border-white/5 glass-panel transition-all duration-300 relative z-30 select-none ${
        isCollapsed ? 'w-[68px]' : 'w-60'
      }`}
    >
      {/* Brand */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between gap-3">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-1"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-accent-purple via-accent-blue to-accent-emerald bg-clip-text text-transparent">
                Techgram
              </span>
              <span className="text-[8px] font-bold text-accent-blue border border-accent-blue/25 px-2 py-0.5 rounded-full uppercase tracking-widest">
                Beta
              </span>
            </div>
            <p className="text-[11px] text-gray-500 max-w-[180px]">
              Social intelligence for founders, investors, and builders.
            </p>
          </motion.div>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-2xl border border-white/10 bg-white/5 text-gray-400 hover:text-white transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </motion.button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-5 space-y-2 overflow-y-auto no-scrollbar">
        {menuItems.map((item, i) => {
          const isActive =
            ('tab' in item && item.tab === 'search' && currentTab === 'search') ||
            ('tab' in item && item.tab === 'analytics' && currentTab === 'analytics') ||
            (!('tab' in item) && currentTab === 'feed' && item.filter === feedFilter);

          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              onClick={() => {
                if ('tab' in item) onTabChange(item.tab);
                else { setFeedFilter(item.filter); onTabChange('feed'); }
              }}
              className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'text-white bg-gradient-to-r from-white/10 to-white/5 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.12)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-y-2 left-2 w-1.5 rounded-full bg-gradient-to-b from-accent-purple to-accent-blue"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <item.icon className={`w-5 h-5 shrink-0 relative z-10 ${isActive ? item.color : 'text-gray-400'}`} />
              {!isCollapsed && <span className="relative z-10 text-left">{item.name}</span>}
            </motion.button>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/5">
        {user ? (
          <div className="flex items-center gap-3 bg-white/4 p-3 rounded-xl border border-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center text-xs font-bold text-white shrink-0 uppercase">
              {user.fullName.substring(0, 2)}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate text-white">{user.fullName}</p>
                <button onClick={logout} className="text-[10px] text-gray-500 hover:text-red-400 transition-colors">
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAuthModal(true)}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl bg-gradient-to-r from-accent-purple/15 to-accent-blue/15 hover:from-accent-purple/25 hover:to-accent-blue/25 border border-accent-purple/25 text-white text-xs font-semibold uppercase tracking-wider justify-center transition-all"
          >
            <User className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Join Platform</span>}
          </motion.button>
        )}
      </div>

      {/* Auth modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setShowAuthModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm glass-panel p-8 rounded-2xl border border-white/10 relative"
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-xl font-bold text-white mb-1">
                {isRegistering ? 'Create Account' : 'Welcome Back'}
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                {isRegistering ? 'Unlock custom feeds and AI analytics.' : 'Sign in to sync your saved stories.'}
              </p>

              <form onSubmit={handleAuth} className="space-y-4">
                {isRegistering && (
                  <div>
                    <label className="block text-[10px] uppercase font-semibold tracking-widest text-gray-500 mb-1.5">Full Name</label>
                    <input type="text" required value={registerName} onChange={(e) => setRegisterName(e.target.value)}
                      className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-purple transition-colors placeholder:text-gray-600"
                      placeholder="Jane Doe" />
                  </div>
                )}
                <div>
                  <label className="block text-[10px] uppercase font-semibold tracking-widest text-gray-500 mb-1.5">Email</label>
                  <input type="email" required value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)}
                    className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-purple transition-colors placeholder:text-gray-600"
                    placeholder="name@domain.com" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold tracking-widest text-gray-500 mb-1.5">Password</label>
                  <input type="password" required value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-purple transition-colors placeholder:text-gray-600"
                    placeholder="••••••••" />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-accent-purple to-accent-blue py-3 rounded-xl font-semibold text-xs uppercase tracking-widest text-white mt-1"
                >
                  {isRegistering ? 'Create Account' : 'Sign In'}
                </motion.button>
              </form>

              <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="w-full mt-5 text-xs text-accent-blue hover:underline"
              >
                {isRegistering ? 'Already have an account? Sign in' : 'New here? Create an account'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
