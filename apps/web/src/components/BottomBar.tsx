'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Search, TrendingUp, Zap } from 'lucide-react';
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
      action: () => { setFeedFilter('latest'); onTabChange('feed'); },
      active: currentTab === 'feed' && feedFilter === 'latest',
    },
    {
      id: 'feed-founder',
      name: 'Founders',
      icon: Zap,
      action: () => { setFeedFilter('founder_mode'); onTabChange('feed'); },
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

  const activeIndex = tabs.findIndex((t) => t.active);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[78px] border-t border-white/10 glass-panel flex items-end justify-around px-3 pb-3 z-40 select-none">
      {/* Sliding indicator */}
      <motion.div
        className="absolute top-0 h-[3px] bg-gradient-to-r from-accent-purple to-accent-blue rounded-full"
        animate={{
          left: `${activeIndex * (100 / tabs.length) + 8}%`,
          width: `${100 / tabs.length - 12}%`,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />

      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          whileTap={{ scale: 0.92 }}
          onClick={tab.action}
          className={`relative flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-3xl transition-all duration-200 ${
            tab.active ? 'text-accent-emerald bg-white/10' : 'text-gray-500 hover:text-white hover:bg-white/10'
          }`}
        >
          <motion.div
            animate={tab.active ? { scale: 1.1, y: -1 } : { scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          >
            <tab.icon className={`w-5 h-5 ${tab.active ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
          </motion.div>
          <span className={`text-[9px] uppercase tracking-widest ${tab.active ? 'font-bold' : 'font-medium'}`}>
            {tab.name}
          </span>
        </motion.button>
      ))}
    </nav>
  );
}
