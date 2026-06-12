'use client';

import React, { useEffect, useState } from 'react';
import { useSocket, PulseTickerItem } from '../hooks/useSocket';
import { Activity } from 'lucide-react';

export default function PulseTicker() {
  const { pulseUpdates } = useSocket();
  const [tickerItems, setTickerItems] = useState<PulseTickerItem[]>([]);

  // Fetch initial pulse list
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    fetch(`${apiUrl}/api/v1/pulse`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTickerItems(data);
        }
      })
      .catch((err) => console.error('Failed to load initial pulse updates', err));
  }, []);

  // Merge websocket items with existing ones
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
      case 'AI_ML':
        return 'text-accent-purple bg-accent-purple/10 border-accent-purple/20';
      case 'FUNDING':
        return 'text-accent-emerald bg-accent-emerald/10 border-accent-emerald/20';
      case 'CYBERSECURITY':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'PRODUCT_LAUNCH':
        return 'text-accent-blue bg-accent-blue/10 border-accent-blue/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getGlowDot = (cat: string) => {
    switch (cat.toUpperCase()) {
      case 'AI_ML':
        return 'bg-accent-purple shadow-[0_0_8px_rgba(157,0,255,0.8)]';
      case 'FUNDING':
        return 'bg-accent-emerald shadow-[0_0_8px_rgba(0,255,135,0.8)]';
      case 'CYBERSECURITY':
        return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]';
      default:
        return 'bg-accent-blue shadow-[0_0_8px_rgba(0,210,255,0.8)]';
    }
  };

  const itemsToDisplay = tickerItems.length > 0 ? tickerItems : [
    { id: '1', title: 'Techgram Live Pulse Gateway connecting...', category: 'SYSTEM', createdAt: '' },
    { id: '2', title: 'OpenAI launches Gemini competitors API updates', category: 'AI_ML', createdAt: '' },
    { id: '3', title: 'NVIDIA shipping Blackwell H200 AI processors', category: 'HARDWARE', createdAt: '' },
    { id: '4', title: 'Stripe valuation touches new levels following VC rounds', category: 'FUNDING', createdAt: '' }
  ];

  // Double the items to allow continuous loop marquee
  const marqueeItems = [...itemsToDisplay, ...itemsToDisplay];

  return (
    <div className="w-full h-10 border-b border-white/5 glass-panel flex items-center overflow-hidden relative z-40 select-none">
      <div className="h-full px-4 border-r border-white/5 flex items-center gap-2 text-accent-purple font-semibold text-xs tracking-wider uppercase bg-black/40 z-10 shrink-0">
        <Activity className="w-4 h-4 animate-pulse" />
        <span>Live Pulse</span>
      </div>

      <div className="w-full overflow-hidden flex items-center bg-black/10">
        <div className="animate-marquee flex items-center whitespace-nowrap gap-12 py-1">
          {marqueeItems.map((item, index) => (
            <div key={`${item.id}-${index}`} className="flex items-center gap-3 text-sm">
              <span className={`w-2 h-2 rounded-full ${getGlowDot(item.category)} shrink-0`} />
              
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${getCategoryColor(item.category)}`}>
                {item.category.replace('_', ' ')}
              </span>

              <span className="text-gray-300 font-medium tracking-tight">
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
