'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, DollarSign, TrendingUp, Layers, BarChart3 } from 'lucide-react';

interface DashboardData {
  totalStories: number;
  distribution: { category: string; count: number }[];
  trends: { name: string; growth: number; activeCount: number }[];
}

function AnimatedNumber({ value, suffix = '' }: { value: number | string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const num = typeof value === 'number' ? value : parseInt(String(value)) || 0;

  useEffect(() => {
    if (typeof value !== 'number') return;
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * num);
      setDisplay(start);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [num, value]);

  if (typeof value !== 'number') return <>{value}{suffix}</>;
  return <>{display}{suffix}</>;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    fetch(`${apiUrl}/api/v1/analytics/dashboard`)
      .then((res) => res.json())
      .then((resData) => { setData(resData); setLoading(false); })
      .catch((err) => { console.error('Failed to load dashboard', err); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-gray-500 select-none gap-3">
        <div className="w-5 h-5 rounded-full border-2 border-accent-purple border-t-transparent animate-spin" />
        <span>Loading intelligence metrics…</span>
      </div>
    );
  }

  const getCategoryColor = (cat: string) => {
    switch (cat.toUpperCase()) {
      case 'AI_ML': return 'bg-accent-purple';
      case 'FUNDING': return 'bg-accent-emerald';
      case 'PRODUCT_LAUNCH': return 'bg-accent-blue';
      case 'CYBERSECURITY': return 'bg-red-500';
      default: return 'bg-yellow-500';
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

  const statCards = [
    { icon: Cpu, label: 'Total Ingested', value: data?.totalStories || 94, suffix: ' Stories', iconClass: 'bg-accent-purple/10 border-accent-purple/25 text-accent-purple' },
    { icon: DollarSign, label: 'VC Momentum', value: '+42%', suffix: ' Growth', iconClass: 'bg-accent-emerald/10 border-accent-emerald/25 text-accent-emerald' },
    { icon: TrendingUp, label: 'Market Index', value: 'Bullish', suffix: ' Tech', iconClass: 'bg-accent-blue/10 border-accent-blue/25 text-accent-blue' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-6 h-[calc(100vh-120px)] md:h-[calc(100vh-80px)] overflow-y-auto no-scrollbar select-none">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 text-accent-emerald text-xs font-semibold uppercase tracking-widest mb-3">
          <BarChart3 className="w-3.5 h-3.5" />
          Analytics
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
          Intelligence Console
        </h2>
        <p className="text-xs text-gray-500">Global technology momentum and index tracking.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4"
          >
            <div className={`p-2.5 border rounded-xl ${card.iconClass}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">{card.label}</p>
              <p className="text-xl font-bold text-white mt-0.5">
                <AnimatedNumber value={card.value} suffix={card.suffix} />
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-panel p-6 rounded-2xl border border-white/5 mb-6"
      >
        <h4 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent-purple" />
          Sector Distribution
        </h4>
        <div className="space-y-4">
          {distributions.map((item, i) => {
            const pct = Math.max(8, (item.count / maxCount) * 100);
            return (
              <div key={item.category} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-gray-400">
                  <span>{item.category.replace('_', ' ')}</span>
                  <span>{item.count}</span>
                </div>
                <div className="w-full h-2 bg-white/4 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className={`h-full rounded-full ${getCategoryColor(item.category)}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Trends */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass-panel p-6 rounded-2xl border border-white/5"
      >
        <h4 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent-emerald" />
          Growth Velocity
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {trends.map((trend, i) => (
            <motion.div
              key={trend.name}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              whileHover={{ scale: 1.02 }}
              className="glass-card p-4 rounded-xl flex items-center justify-between"
            >
              <div>
                <h5 className="text-sm font-semibold text-white">{trend.name}</h5>
                <p className="text-xs text-gray-500 mt-0.5">{trend.activeCount} active reports</p>
              </div>
              <span className="text-xs font-bold text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/25 px-2.5 py-1 rounded-lg">
                +{trend.growth}%
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
