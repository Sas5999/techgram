'use client';

import React, { useEffect, useState } from 'react';
import { Cpu, DollarSign, TrendingUp, Layers, CheckCircle } from 'lucide-react';

interface DashboardData {
  totalStories: number;
  distribution: { category: string; count: number }[];
  trends: { name: string; growth: number; activeCount: number }[];
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    fetch(`${apiUrl}/api/v1/analytics/dashboard`)
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load dashboard data', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-gray-400 select-none">
        <div className="w-5 h-5 rounded-full border-2 border-accent-purple border-t-transparent animate-spin mr-2" />
        <span>Loading tech intelligence metrics...</span>
      </div>
    );
  }

  const getCategoryColor = (cat: string) => {
    switch (cat.toUpperCase()) {
      case 'AI_ML':
        return 'bg-accent-purple';
      case 'FUNDING':
        return 'bg-accent-emerald';
      case 'PRODUCT_LAUNCH':
        return 'bg-accent-blue';
      case 'CYBERSECURITY':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getCategoryGlow = (cat: string) => {
    switch (cat.toUpperCase()) {
      case 'AI_ML':
        return 'shadow-[0_0_12px_rgba(157,0,255,0.4)]';
      case 'FUNDING':
        return 'shadow-[0_0_12px_rgba(0,255,135,0.4)]';
      case 'PRODUCT_LAUNCH':
        return 'shadow-[0_0_12px_rgba(0,210,255,0.4)]';
      default:
        return 'shadow-[0_0_12px_rgba(234,179,8,0.4)]';
    }
  };

  const trends = data?.trends || [
    { name: 'AI & ML', growth: 124, activeCount: 450 },
    { name: 'Venture Capital', growth: 42, activeCount: 180 },
    { name: 'Developer Tools', growth: 87, activeCount: 320 },
    { name: 'Cybersecurity', growth: 18, activeCount: 95 },
  ];

  const distributions = data?.distribution || [
    { category: 'AI_ML', count: 42 },
    { category: 'FUNDING', count: 18 },
    { category: 'DEVELOPER_TOOLS', count: 24 },
    { category: 'CYBERSECURITY', count: 10 },
  ];

  const maxCount = Math.max(...distributions.map((d) => d.count), 1);

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-6 h-[calc(100vh-80px)] overflow-y-auto no-scrollbar select-none">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          Techgram Intelligence Console
        </h2>
        <p className="text-xs text-gray-400">
          Global technology momentum metrics and index tracking.
        </p>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-accent-purple/10 border border-accent-purple/30 text-accent-purple rounded-xl">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h5 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Total Ingested</h5>
            <p className="text-2xl font-extrabold text-white mt-0.5">{data?.totalStories || 94} Stories</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h5 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">VC Inflow Momentum</h5>
            <p className="text-2xl font-extrabold text-white mt-0.5">+42% Growth</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h5 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Core Index Rating</h5>
            <p className="text-2xl font-extrabold text-white mt-0.5">Bullish Tech</p>
          </div>
        </div>
      </div>

      {/* Sector Bar Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 mb-8">
        <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-6 flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent-purple" />
          <span>Sector Distribution Volume</span>
        </h4>
        <div className="space-y-5">
          {distributions.map((item) => {
            const pct = Math.max(10, (item.count / maxCount) * 100);
            return (
              <div key={item.category} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-gray-300">
                  <span>{item.category.replace('_', ' ')}</span>
                  <span>{item.count} items</span>
                </div>
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden relative">
                  <div 
                    style={{ width: `${pct}%` }} 
                    className={`h-full rounded-full ${getCategoryColor(item.category)} ${getCategoryGlow(item.category)} transition-all duration-1000`} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sector Growth Momentum */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5">
        <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent-emerald" />
          <span>Tech Sector Growth Velocity</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {trends.map((trend) => (
            <div 
              key={trend.name} 
              className="glass-card p-4 rounded-xl border border-white/5 flex items-center justify-between"
            >
              <div>
                <h5 className="text-sm font-bold text-white">{trend.name}</h5>
                <p className="text-xs text-gray-400 mt-1">{trend.activeCount} active reports</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-extrabold text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/30 px-2 py-1 rounded-lg">
                  +{trend.growth}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
