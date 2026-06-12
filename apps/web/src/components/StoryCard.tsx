'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Bookmark, Share2, ExternalLink, Calendar, ShieldCheck } from 'lucide-react';
import { useStore } from '../store/useStore';

export interface StoryType {
  id: string;
  headline: string;
  coverImageUrl: string;
  category: string;
  sourceName: string;
  sourceDomain: string;
  sourceLogoUrl: string;
  authorName: string;
  originalUrl: string;
  publishedAt: string;
  credibility: 'OFFICIAL_SOURCE' | 'TRUSTED_MEDIA' | 'COMMUNITY_SOURCE' | 'UNVERIFIED';
  quickSummary: string;
  detailedSummary: string;
  deepAnalysis: string;
  whyItMatters: Record<string, string> | null;
  whatHappensNext: string;
  aiImpactScore: number;
  marketImpactScore: number;
  innovationScore: number;
  businessImpactScore: number;
  viralityScore: number;
  companyTags: string[];
  techTags: string[];
}

interface StoryCardProps {
  story: StoryType;
  direction?: 'up' | 'down';
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  onSwipeLeft: () => void;
}

const TAB_LABELS = {
  '15s': 'Quick Read',
  '30s': 'Key Facts',
  '2m': 'Deep Dive',
} as const;

const slideVariants = {
  enter: (dir: 'up' | 'down') => ({
    y: dir === 'up' ? 60 : -60,
    opacity: 0,
    scale: 0.97,
  }),
  center: { y: 0, opacity: 1, scale: 1 },
  exit: (dir: 'up' | 'down') => ({
    y: dir === 'up' ? -60 : 60,
    opacity: 0,
    scale: 0.97,
  }),
};

export default function StoryCard({ story, direction = 'up', onSwipeUp, onSwipeDown }: StoryCardProps) {
  const { likedStories, toggleLike, savedStories, toggleSave } = useStore();
  const [activeTab, setActiveTab] = useState<'15s' | '30s' | '2m'>('15s');
  const [showHeartSplash, setShowHeartSplash] = useState(false);
  const lastTapRef = useRef<number>(0);

  const isLiked = likedStories.includes(story.id);
  const isSaved = savedStories.includes(story.id);

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!isLiked) toggleLike(story.id);
      setShowHeartSplash(true);
      setTimeout(() => setShowHeartSplash(false), 500);
    }
    lastTapRef.current = now;
  };

  const getCredibilityConfig = (cred: string) => {
    switch (cred) {
      case 'OFFICIAL_SOURCE':
        return { label: 'Official', color: 'text-accent-emerald border-accent-emerald/30 bg-accent-emerald/10' };
      case 'TRUSTED_MEDIA':
        return { label: 'Trusted', color: 'text-accent-blue border-accent-blue/30 bg-accent-blue/10' };
      case 'COMMUNITY_SOURCE':
        return { label: 'Community', color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' };
      default:
        return { label: 'Unverified', color: 'text-red-400 border-red-500/30 bg-red-500/10' };
    }
  };

  const RadialScore = ({ score, label, colorClass }: { score: number; label: string; colorClass: string }) => {
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - ((score || 50) / 100) * circumference;

    return (
      <div className="flex flex-col items-center gap-1">
        <div className="relative w-10 h-10 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle cx="20" cy="20" r={radius} stroke="rgba(255,255,255,0.06)" strokeWidth={3} fill="transparent" />
            <motion.circle
              cx="20" cy="20" r={radius}
              stroke="currentColor" strokeWidth={3} fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className={colorClass}
            />
          </svg>
          <span className="absolute text-[9px] font-bold text-white">{score || 50}</span>
        </div>
        <span className="text-[7px] uppercase tracking-widest text-gray-500 font-semibold">{label}</span>
      </div>
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: story.headline, text: story.quickSummary, url: story.originalUrl }).catch(console.error);
    } else {
      navigator.clipboard.writeText(story.originalUrl);
    }
  };

  const cred = getCredibilityConfig(story.credibility);

  return (
    <motion.div
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.35}
      onDragEnd={(_, info) => {
        if (info.offset.y < -80) onSwipeUp();
        else if (info.offset.y > 80) onSwipeDown();
      }}
      onClick={handleTap}
      className="w-full h-full relative overflow-hidden rounded-3xl border border-white/8 bg-black/70 backdrop-blur-xl flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.5)] cursor-grab active:cursor-grabbing select-none"
    >
      {/* Cover image */}
      <div className="absolute inset-0 z-0">
        <img
          src={story.coverImageUrl}
          alt=""
          className="w-full h-full object-cover opacity-30 brightness-[0.45]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/90 to-[#030303]/40" />
      </div>

      {/* Heart splash */}
      <AnimatePresence>
        {showHeartSplash && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.3, 1], opacity: [0, 0.9, 0] }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
          >
            <Heart className="w-24 h-24 text-accent-purple fill-accent-purple" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Source header */}
      <div className="p-5 flex flex-col gap-4 relative z-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden">
              <img
                src={story.sourceLogoUrl}
                alt={story.sourceName}
                className="w-6 h-6 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{story.sourceName}</p>
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(story.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full border text-[9px] font-semibold uppercase tracking-widest flex items-center gap-1 ${cred.color}`}>
            <ShieldCheck className="w-3 h-3" />
            {cred.label}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-black/40 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center text-[10px] font-bold text-white uppercase">
              {story.authorName.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">{story.authorName}</p>
              <p className="text-[10px] text-gray-400 truncate">{story.sourceDomain}</p>
            </div>
          </div>
          <span className="badge-pill">Feed</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 flex-1 flex flex-col justify-end gap-4 pb-4 relative z-10 min-h-0">
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <span className="badge-pill">{story.category.replace('_', ' ')}</span>
          {story.companyTags.slice(0, 2).map((tag) => (
            <span key={tag} className="pill-chip">#{tag}</span>
          ))}
          {story.techTags.slice(0, 2).map((tag) => (
            <span key={tag} className="pill-chip">#{tag}</span>
          ))}
        </div>

        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight">
          {story.headline}
        </h2>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-white/4 rounded-xl border border-white/6">
          {(['15s', '30s', '2m'] as const).map((tab) => (
            <button
              key={tab}
              onClick={(e) => { e.stopPropagation(); setActiveTab(tab); }}
              className={`relative flex-1 py-2 text-center text-[10px] font-semibold uppercase tracking-wider rounded-lg transition-colors duration-200 ${
                activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="story-tab-pill"
                  className="absolute inset-0 bg-accent-purple/20 border border-accent-purple/30 rounded-lg"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{TAB_LABELS[tab]}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="h-36 overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === '15s' && (
                <p className="text-sm text-gray-300 leading-relaxed">{story.quickSummary}</p>
              )}
              {activeTab === '30s' && (
                <ul className="space-y-2 text-sm text-gray-300">
                  {story.detailedSummary.split('\n').map((fact, i) => (
                    <li key={i} className="flex gap-2.5 items-start">
                      <span className="w-1 h-1 rounded-full bg-accent-purple mt-2 shrink-0" />
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              )}
              {activeTab === '2m' && (
                <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
                  <p className="whitespace-pre-line">{story.deepAnalysis}</p>
                  {story.whyItMatters && (
                    <div className="border-l-2 border-accent-blue/30 pl-3 py-1 bg-accent-blue/5 rounded-r-lg">
                      <p className="text-[10px] font-bold uppercase text-accent-blue tracking-widest mb-1">Why It Matters</p>
                      <p className="text-xs text-gray-400">
                        {story.whyItMatters.market || story.whyItMatters.business || 'Critical shifts in tech adoption.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Impact scores */}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 bg-white/4 border border-white/8 rounded-2xl p-3.5">
          <RadialScore score={story.aiImpactScore} label="AI" colorClass="text-accent-purple glow-ring-purple" />
          <RadialScore score={story.marketImpactScore} label="Market" colorClass="text-accent-blue glow-ring-blue" />
          <RadialScore score={story.innovationScore} label="Innov" colorClass="text-accent-emerald glow-ring-emerald" />
          <RadialScore score={story.businessImpactScore} label="Biz" colorClass="text-yellow-400" />
          <RadialScore score={story.viralityScore} label="Viral" colorClass="text-orange-400" />
        </div>
      </div>

      {/* Actions */}
      <div className="p-5 border-t border-white/10 bg-black/55 flex flex-col gap-3 relative z-10 md:flex-row md:items-center md:justify-between">
        <a
          href={story.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="btn-neon-blue inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-4 py-3 rounded-2xl"
        >
          Read Story
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <div className="flex items-center gap-2">
          {[
            { active: isLiked, toggle: () => toggleLike(story.id), Icon: Heart, activeClass: 'bg-accent-purple/15 border-accent-purple/30 text-accent-purple', fill: isLiked, label: isLiked ? 'Unlike story' : 'Like story' },
            { active: isSaved, toggle: () => toggleSave(story.id), Icon: Bookmark, activeClass: 'bg-accent-emerald/15 border-accent-emerald/30 text-accent-emerald', fill: isSaved, label: isSaved ? 'Remove save' : 'Save story' },
            { active: false, toggle: handleShare, Icon: Share2, activeClass: 'bg-white/6 border-white/10 text-gray-300', fill: false, label: 'Share story' },
          ].map(({ active, toggle, Icon, activeClass, fill, label }, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.92 }}
              onClick={(e) => { e.stopPropagation(); toggle(); }}
              aria-label={label}
              className={`w-12 h-12 rounded-3xl border transition-colors duration-200 flex items-center justify-center ${
                active ? activeClass : 'bg-white/5 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${fill ? 'fill-current' : ''}`} />
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
