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

const TAB_LABELS = { '15s': 'Quick Read', '30s': 'Key Facts', '2m': 'Deep Dive' } as const;

const slideVariants = {
  enter: (dir: 'up' | 'down') => ({ y: dir === 'up' ? 60 : -60, opacity: 0, scale: 0.97 }),
  center: { y: 0, opacity: 1, scale: 1 },
  exit: (dir: 'up' | 'down') => ({ y: dir === 'up' ? -60 : 60, opacity: 0, scale: 0.97 }),
};

const CRED_CONFIG: Record<string, { label: string; color: string }> = {
  OFFICIAL_SOURCE: { label: 'Official',   color: 'text-accent-emerald border-accent-emerald/30 bg-accent-emerald/10' },
  TRUSTED_MEDIA:   { label: 'Trusted',    color: 'text-accent-blue border-accent-blue/30 bg-accent-blue/10' },
  COMMUNITY_SOURCE:{ label: 'Community',  color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' },
  UNVERIFIED:      { label: 'Unverified', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
};

/* ── Radial score ring ─────────────────────────────── */
const RadialScore = ({ score, label, colorClass }: { score: number; label: string; colorClass: string }) => {
  const r = 16;
  const circ = 2 * Math.PI * r;
  const offset = circ - ((score || 50) / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={3} fill="transparent" />
          <motion.circle
            cx="20" cy="20" r={r}
            stroke="currentColor" strokeWidth={3} fill="transparent"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
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

/* ── Main component ────────────────────────────────── */
export default function StoryCard({ story, direction = 'up', onSwipeUp, onSwipeDown }: StoryCardProps) {
  const { likedStories, toggleLike, savedStories, toggleSave } = useStore();
  const [activeTab, setActiveTab] = useState<'15s' | '30s' | '2m'>('15s');
  const [showHeartSplash, setShowHeartSplash] = useState(false);
  const lastTapRef = useRef<number>(0);

  const isLiked = likedStories.includes(story.id);
  const isSaved = savedStories.includes(story.id);
  const cred = CRED_CONFIG[story.credibility] ?? CRED_CONFIG.UNVERIFIED;

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!isLiked) toggleLike(story.id);
      setShowHeartSplash(true);
      setTimeout(() => setShowHeartSplash(false), 500);
    }
    lastTapRef.current = now;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: story.headline, text: story.quickSummary, url: story.originalUrl }).catch(console.error);
    } else {
      navigator.clipboard.writeText(story.originalUrl);
    }
  };

  const actions = [
    { active: isLiked,  toggle: () => toggleLike(story.id),  Icon: Heart,    activeClass: 'bg-accent-purple/15 border-accent-purple/30 text-accent-purple', fill: isLiked },
    { active: isSaved,  toggle: () => toggleSave(story.id),  Icon: Bookmark, activeClass: 'bg-accent-emerald/15 border-accent-emerald/30 text-accent-emerald', fill: isSaved },
    { active: false,    toggle: handleShare,                  Icon: Share2,   activeClass: 'bg-white/6 border-white/10 text-gray-300', fill: false },
  ];

  return (
    <motion.div
      custom={direction}
      variants={slideVariants}
      initial="enter" animate="center" exit="exit"
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.35}
      onDragEnd={(_, { offset }) => {
        if (offset.y < -80) onSwipeUp();
        else if (offset.y > 80) onSwipeDown();
      }}
      onClick={handleTap}
      className="w-full h-full relative overflow-hidden rounded-3xl border border-white/8 bg-black/70 backdrop-blur-xl flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.5)] cursor-grab active:cursor-grabbing select-none"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img src={story.coverImageUrl} alt="" className="w-full h-full object-cover opacity-30 brightness-[0.45]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/90 to-[#030303]/40" />
      </div>

      {/* Double-tap heart */}
      <AnimatePresence>
        {showHeartSplash && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.3, 1], opacity: [0, 0.9, 0] }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
          >
            <Heart className="w-20 h-20 sm:w-24 sm:h-24 text-accent-purple fill-accent-purple" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Source header ── */}
      <div className="p-4 sm:p-5 flex flex-col gap-3 relative z-10">
        {/* Row 1: source + credibility badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden">
              <img
                src={story.sourceLogoUrl} alt={story.sourceName}
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] sm:text-sm font-semibold text-white truncate">{story.sourceName}</p>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-gray-400">
                <Calendar className="w-3 h-3 shrink-0" />
                <span>{new Date(story.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
          <span className={`shrink-0 px-2.5 py-1 rounded-full border text-[8px] sm:text-[9px] font-semibold uppercase tracking-widest flex items-center gap-1 ${cred.color}`}>
            <ShieldCheck className="w-3 h-3" />
            <span className="hidden xs:inline">{cred.label}</span>
          </span>
        </div>

        {/* Row 2: author chip */}
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-black/40 px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center text-[10px] font-bold text-white uppercase">
              {story.authorName.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] sm:text-sm font-semibold text-white truncate">{story.authorName}</p>
              <p className="text-[9px] sm:text-[10px] text-gray-400 truncate">{story.sourceDomain}</p>
            </div>
          </div>
          <span className="badge-pill shrink-0">Feed</span>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="px-4 sm:px-5 flex-1 flex flex-col justify-end gap-3 sm:gap-4 pb-3 relative z-10 min-h-0 overflow-hidden">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <span className="badge-pill">{story.category.replace('_', ' ')}</span>
          {story.companyTags.slice(0, 2).map((t) => <span key={t} className="pill-chip">#{t}</span>)}
          {story.techTags.slice(0, 2).map((t) => <span key={t} className="pill-chip">#{t}</span>)}
        </div>

        {/* Headline */}
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight line-clamp-3">
          {story.headline}
        </h2>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 bg-white/4 rounded-xl border border-white/6">
          {(['15s', '30s', '2m'] as const).map((tab) => (
            <button
              key={tab}
              onClick={(e) => { e.stopPropagation(); setActiveTab(tab); }}
              className={`relative flex-1 py-2 text-center text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider rounded-lg transition-colors duration-200 min-h-[36px] ${
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

        {/* Tab content — flex-grows but won't overflow */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar max-h-32 sm:max-h-40">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === '15s' && (
                <p className="text-[13px] sm:text-sm text-gray-300 leading-relaxed">{story.quickSummary}</p>
              )}
              {activeTab === '30s' && (
                <ul className="space-y-2 text-[13px] sm:text-sm text-gray-300">
                  {story.detailedSummary.split('\n').map((fact, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <span className="w-1 h-1 rounded-full bg-accent-purple mt-2 shrink-0" />
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              )}
              {activeTab === '2m' && (
                <div className="space-y-3 text-[13px] sm:text-sm text-gray-300 leading-relaxed">
                  <p className="whitespace-pre-line">{story.deepAnalysis}</p>
                  {story.whyItMatters && (
                    <div className="border-l-2 border-accent-blue/30 pl-3 py-1 bg-accent-blue/5 rounded-r-lg">
                      <p className="text-[9px] sm:text-[10px] font-bold uppercase text-accent-blue tracking-widest mb-1">Why It Matters</p>
                      <p className="text-[11px] sm:text-xs text-gray-400">
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
        <div className="grid grid-cols-5 gap-1.5 sm:gap-3 bg-white/4 border border-white/8 rounded-2xl p-2.5 sm:p-3.5">
          <RadialScore score={story.aiImpactScore}       label="AI"     colorClass="text-accent-purple" />
          <RadialScore score={story.marketImpactScore}   label="Market" colorClass="text-accent-blue" />
          <RadialScore score={story.innovationScore}     label="Innov"  colorClass="text-accent-emerald" />
          <RadialScore score={story.businessImpactScore} label="Biz"    colorClass="text-yellow-400" />
          <RadialScore score={story.viralityScore}       label="Viral"  colorClass="text-orange-400" />
        </div>
      </div>

      {/* ── Action bar ── */}
      <div className="px-4 sm:px-5 py-3 sm:py-4 border-t border-white/10 bg-black/55 flex items-center justify-between gap-3 relative z-10">
        <a
          href={story.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="btn-neon-blue inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl whitespace-nowrap"
        >
          Read Story
          <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </a>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {actions.map(({ active, toggle, Icon, activeClass, fill }, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.92 }}
              onClick={(e) => { e.stopPropagation(); toggle(); }}
              aria-label={i === 0 ? (active ? 'Unlike' : 'Like') : i === 1 ? (active ? 'Unsave' : 'Save') : 'Share'}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl sm:rounded-3xl border transition-colors duration-200 flex items-center justify-center ${
                active ? activeClass : 'bg-white/5 border-white/10 hover:bg-white/10 hover:text-white text-gray-400'
              }`}
            >
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${fill ? 'fill-current' : ''}`} />
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}