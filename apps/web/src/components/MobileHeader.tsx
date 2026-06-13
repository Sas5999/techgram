'use client';

import { Zap } from 'lucide-react';

interface MobileHeaderProps {
  activeTab: 'feed' | 'search' | 'analytics';
  feedFilter?: string;
}

const TAB_LABELS: Record<string, string> = {
  feed: 'Feed',
  search: 'Search',
  analytics: 'Intelligence',
};

const FILTER_LABELS: Record<string, string> = {
  latest: 'Latest',
  trending: 'Trending',
  founder_mode: 'Founder Mode',
  market_disruption: 'Disruptions',
};

export default function MobileHeader({ activeTab, feedFilter }: MobileHeaderProps) {
  const subtitle =
    activeTab === 'feed' && feedFilter
      ? FILTER_LABELS[feedFilter] ?? feedFilter
      : TAB_LABELS[activeTab];

  return (
    <header className="md:hidden flex items-center justify-between px-5 py-3 border-b border-white/10 glass-panel relative z-20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center shadow-[0_0_18px_rgba(157,0,255,0.35)] pulse-text">
          <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-base font-extrabold tracking-tight text-white leading-none bg-gradient-to-r from-white via-accent-blue to-white bg-clip-text gradient-shimmer-text">Techgram</h1>
          <p className="text-[10px] text-gray-400 font-medium tracking-wide mt-0.5">{subtitle}</p>
        </div>
      </div>
      <span className="text-[9px] font-bold text-accent-emerald border border-accent-emerald/25 px-2 py-0.5 rounded-full uppercase tracking-widest float-badge">
        Live
      </span>
    </header>
  );
}
