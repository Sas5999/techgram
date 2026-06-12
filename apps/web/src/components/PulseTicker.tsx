'use client';

import React, { useEffect, useState } from 'react';
import { useSocket, PulseTickerItem } from '../hooks/useSocket';
import { Radio } from 'lucide-react';

export default function PulseTicker() {
  const { pulseUpdates } = useSocket();
  const [tickerItems, setTickerItems] = useState<PulseTickerItem[]>([]);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    fetch(`${apiUrl}/api/v1/pulse`)
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setTickerItems(data); })
      .catch((err) => console.error('Failed to load pulse', err));
  }, []);

  useEffect(() => {
    if (pulseUpdates.length > 0) {
      setTickerItems((prev) => {
        const newItems = pulseUpdates.filter(
          (pu) => !prev.some((item) => item.id === pu.id || item.title === pu.title)
        );
        return [...newItems, ...prev].slice(0, 30);
      });
    }
  }, [pulseUpdates]);

  const getCategoryColor = (cat: string) => {
    switch (cat.toUpperCase()) {
      case 'AI_ML': return 'text-accent-purple bg-accent-purple/10 border-accent-purple/20';
      case 'FUNDING': return 'text-accent-emerald bg-accent-emerald/10 border-accent-emerald/20';
      case 'CYBERSECURITY': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'PRODUCT_LAUNCH': return 'text-accent-blue bg-accent-blue/10 border-accent-blue/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getGlowDot = (cat: string) => {
    switch (cat.toUpperCase()) {
      case 'AI_ML': return 'bg-accent-purple shadow-[0_0_6px_rgba(157,0,255,0.7)]';
      case 'FUNDING': return 'bg-accent-emerald shadow-[0_0_6px_rgba(0,255,135,0.7)]';
      case 'CYBERSECURITY': return 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.7)]';
      default: return 'bg-accent-blue shadow-[0_0_6px_rgba(0,210,255,0.7)]';
    }
  };

  const itemsToDisplay = tickerItems.length > 0 ? tickerItems : [
    { id: '1', title: 'Techgram Live Pulse connecting…', category: 'SYSTEM', createdAt: '' },
    { id: '2', title: 'OpenAI launches next-gen reasoning API updates', category: 'AI_ML', createdAt: '' },
    { id: '3', title: 'NVIDIA shipping Blackwell H200 AI processors', category: 'HARDWARE', createdAt: '' },
    { id: '4', title: 'Stripe valuation hits new record following VC rounds', category: 'FUNDING', createdAt: '' },
  ];

  const marqueeItems = [...itemsToDisplay, ...itemsToDisplay];

  return (
    <div className="w-full h-9 border-b border-white/5 glass-panel flex items-center overflow-hidden relative z-40 select-none">
      <div className="h-full px-4 border-r border-white/5 flex items-center gap-2 text-accent-purple font-semibold text-[10px] tracking-wider uppercase bg-black/30 z-10 shrink-0">
        <Radio className="w-3.5 h-3.5 animate-pulse" />
        <span>Pulse</span>
      </div>

      <div className="w-full overflow-hidden ticker-fade">
        <div className="animate-marquee flex items-center whitespace-nowrap gap-10 py-1">
          {marqueeItems.map((item, index) => (
            <div key={`${item.id}-${index}`} className="flex items-center gap-2.5 text-sm">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getGlowDot(item.category)}`} />
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border ${getCategoryColor(item.category)}`}>
                {item.category.replace('_', ' ')}
              </span>
              <span className="text-gray-400 font-medium text-[13px]">{item.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
