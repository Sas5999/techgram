'use client';

import React from 'react';
import { Activity, Search, TrendingUp, Zap, User } from 'lucide-react';
import { useStore } from '../store/useStore';

interface BottomBarProps {
  onTabChange: (tab: 'feed' | 'search' | 'analytics') => void;
  currentTab: 'feed' | 'search' | 'analytics';
}

export default function BottomBar({ onTabChange, currentTab }: BottomBarProps) {
  const { feedFilter, setFeedFilter } = useStore();

  const tabs = [
    {
      id: 'feed-latest',
      name: 'Latest',
      icon: Activity,
      action: () => {
        setFeedFilter('latest');
        onTabChange('feed');
      },
      active: currentTab === 'feed' && feedFilter === 'latest',
    },
    {
      id: 'feed-founder',
      name: 'Founders',
      icon: Zap,
      action: () => {
        setFeedFilter('founder_mode');
        onTabChange('feed');
      },
      active: currentTab === 'feed' && feedFilter === 'founder_mode',
    },
    {
      id: 'search',
      name: 'Search',
      icon: Search,
      action: () => onTabChange('search'),
      active: currentTab === 'search',
    },
    {
      id: 'analytics',
      name: 'Trends',
      icon: TrendingUp,
      action: () => onTabChange('analytics'),
      active: currentTab === 'analytics',
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-white/5 bg-black/80 backdrop-blur-xl flex items-center justify-around px-4 z-40 select-none">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={tab.action}
          className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-all ${
            tab.active ? 'text-accent-purple font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          <tab.icon className={`w-5 h-5 ${tab.active ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
          <span className="text-[9px] uppercase tracking-wider">{tab.name}</span>
          {tab.active && (
            <span className="w-1 h-1 rounded-full bg-accent-purple shadow-[0_0_8px_rgba(157,0,255,0.8)]" />
          )}
        </button>
      ))}
    </nav>
  );
}
