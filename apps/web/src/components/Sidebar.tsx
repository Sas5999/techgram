'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Flame, 
  Activity, 
  Search, 
  TrendingUp, 
  Cpu, 
  Layers, 
  ShieldAlert, 
  Zap, 
  ChevronLeft, 
  ChevronRight,
  TrendingDown,
  User,
  Database
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
    {
      id: 'latest',
      name: 'Latest Feed',
      icon: Activity,
      action: () => {
        setFeedFilter('latest');
        onTabChange('feed');
      },
      color: 'text-accent-blue hover:shadow-[0_0_12px_rgba(0,210,255,0.4)]',
    },
    {
      id: 'trending',
      name: 'Trending Feed',
      icon: Flame,
      action: () => {
        setFeedFilter('trending');
        onTabChange('feed');
      },
      color: 'text-orange-400 hover:shadow-[0_0_12px_rgba(251,146,60,0.4)]',
    },
    {
      id: 'founder_mode',
      name: 'Founder Mode',
      icon: Zap,
      action: () => {
        setFeedFilter('founder_mode');
        onTabChange('feed');
      },
      color: 'text-accent-purple hover:shadow-[0_0_12px_rgba(157,0,255,0.4)]',
    },
    {
      id: 'market_disruption',
      name: 'Disruptions',
      icon: ShieldAlert,
      action: () => {
        setFeedFilter('market_disruption');
        onTabChange('feed');
      },
      color: 'text-red-400 hover:shadow-[0_0_12px_rgba(248,113,113,0.4)]',
    },
    {
      id: 'search',
      name: 'Search Feed',
      icon: Search,
      action: () => onTabChange('search'),
      color: 'text-yellow-400',
    },
    {
      id: 'analytics',
      name: 'Intelligence',
      icon: TrendingUp,
      action: () => onTabChange('analytics'),
      color: 'text-accent-emerald',
    },
  ];

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
      className={`hidden md:flex flex-col h-[calc(100vh-40px)] border-r border-white/5 bg-black/40 backdrop-blur-xl transition-all duration-300 relative z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-accent-purple via-accent-blue to-accent-emerald bg-clip-text text-transparent">
              TECHGRAM
            </span>
            <span className="text-[9px] font-bold text-accent-blue border border-accent-blue/30 px-1 rounded uppercase tracking-widest">
              v1.0
            </span>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg border border-white/5 bg-white/5 text-gray-400 hover:text-white transition"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Menu Options */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => {
          const isActive = 
            (item.id === 'search' && currentTab === 'search') ||
            (item.id === 'analytics' && currentTab === 'analytics') ||
            (currentTab === 'feed' && item.id === feedFilter);

          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium tracking-wide transition-all border ${
                isActive 
                  ? 'bg-white/5 border-white/10 text-white shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                  : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${isActive ? item.color : 'text-gray-400'}`} />
              {!isCollapsed && <span>{item.name}</span>}
              {isActive && !isCollapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-purple shadow-[0_0_8px_rgba(157,0,0,0.9)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Section / Auth Trigger */}
      <div className="p-4 border-t border-white/5">
        {user ? (
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
            <div className="w-8 h-8 rounded-full bg-accent-purple flex items-center justify-center text-xs font-bold text-white shrink-0 uppercase">
              {user.fullName.substring(0, 2)}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate text-white leading-tight">
                  {user.fullName}
                </p>
                <button 
                  onClick={logout}
                  className="text-[10px] text-gray-400 hover:text-red-400 transition"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-accent-purple/20 to-accent-blue/20 hover:from-accent-purple/30 hover:to-accent-blue/30 border border-accent-purple/30 text-white text-xs font-bold uppercase tracking-wider text-center justify-center transition"
          >
            <User className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Join Platform</span>}
          </button>
        )}
      </div>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm glass-panel p-8 rounded-2xl border border-white/10 relative">
            <h3 className="text-xl font-bold tracking-tight text-white mb-2">
              {isRegistering ? 'Create Techgram Account' : 'Welcome Back'}
            </h3>
            <p className="text-xs text-gray-400 mb-6">
              {isRegistering ? 'Unlock custom feeds, collections, and AI analytics.' : 'Log in to sync your saved items.'}
            </p>

            <form onSubmit={handleAuth} className="space-y-4">
              {isRegistering && (
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-purple transition"
                    placeholder="Jane Doe"
                  />
                </div>
              )}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-purple transition"
                  placeholder="name@domain.com"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-purple transition"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-accent-purple to-accent-blue py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-white shadow-lg hover:shadow-accent-purple/20 transition duration-300 mt-2"
              >
                {isRegistering ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-xs text-accent-blue hover:underline bg-transparent"
              >
                {isRegistering ? 'Already have an account? Log in' : "New to Techgram? Sign up"}
              </button>
            </div>

            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
