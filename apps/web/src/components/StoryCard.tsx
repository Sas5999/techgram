'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Bookmark, Share2, ExternalLink, Calendar, ShieldCheck, HelpCircle } from 'lucide-react';
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
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  onSwipeLeft: () => void; // Show related
}

export default function StoryCard({ story, onSwipeUp, onSwipeDown, onSwipeLeft }: StoryCardProps) {
  const { likedStories, toggleLike, savedStories, toggleSave } = useStore();
  const [activeTab, setActiveTab] = useState<'15s' | '30s' | '2m'>('15s');
  
  const [showHeartSplash, setShowHeartSplash] = useState(false);
  const lastTapRef = useRef<number>(0);

  const isLiked = likedStories.includes(story.id);
  const isSaved = savedStories.includes(story.id);

  // Handle double-tap to like
  const handleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (!isLiked) {
        toggleLike(story.id);
      }
      setShowHeartSplash(true);
      setTimeout(() => setShowHeartSplash(false), 500);
    }
    lastTapRef.current = now;
  };

  const getCredibilityConfig = (cred: string) => {
    switch (cred) {
      case 'OFFICIAL_SOURCE':
        return { label: 'Official Source', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' };
      case 'TRUSTED_MEDIA':
        return { label: 'Trusted Media', color: 'text-accent-blue border-accent-blue/30 bg-accent-blue/10' };
      case 'COMMUNITY_SOURCE':
        return { label: 'Community Feed', color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' };
      default:
        return { label: 'Unverified Report', color: 'text-red-400 border-red-500/30 bg-red-500/10' };
    }
  };

  const RadialScore = ({ score, label, colorClass }: { score: number; label: string; colorClass: string }) => {
    const radius = 16;
    const strokeWidth = 3;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - ((score || 50) / 100) * circumference;

    return (
      <div className="flex flex-col items-center gap-1 select-none">
        <div className="relative w-10 h-10 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="20" cy="20" r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} fill="transparent" />
            <circle 
              cx="20" cy="20" r={radius} 
              stroke="currentColor" strokeWidth={strokeWidth} fill="transparent"
              strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
              className={`transition-all duration-1000 ease-out ${colorClass}`}
            />
          </svg>
          <span className="absolute text-[9px] font-extrabold text-white">{score || 50}</span>
        </div>
        <span className="text-[7px] uppercase tracking-widest text-gray-400 font-bold leading-none">{label}</span>
      </div>
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: story.headline,
        text: story.quickSummary,
        url: story.originalUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(story.originalUrl);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <motion.div 
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.4}
      onDragEnd={(event, info) => {
        const threshold = 80;
        if (info.offset.y < -threshold) {
          onSwipeUp();
        } else if (info.offset.y > threshold) {
          onSwipeDown();
        }
      }}
      onClick={handleTap}
      className="w-full h-full relative overflow-hidden rounded-3xl border border-white/5 bg-black flex flex-col justify-between shadow-[0_12px_40px_rgba(0,0,0,0.8)] cursor-grab active:cursor-grabbing select-none"
    >
      {/* Background Cover Image with Gradients */}
      <div className="absolute inset-0 z-0">
        <img 
          src={story.coverImageUrl} 
          alt={story.headline}
          className="w-full h-full object-cover opacity-35 filter brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/85 to-[#030303]/30 z-0" />
      </div>

      {/* Floating double-tap heart indicator */}
      <AnimatePresence>
        {showHeartSplash && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [1, 1.4, 0.95, 1], opacity: [0, 0.9, 0.9, 0] }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
          >
            <Heart className="w-24 h-24 text-accent-purple fill-accent-purple heart-splash" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Section: Source Metadata */}
      <div className="p-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <img 
            src={story.sourceLogoUrl} 
            alt={story.sourceName}
            className="w-7 h-7 rounded-lg bg-white/10 p-0.5 object-contain border border-white/10"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide">{story.sourceName}</h4>
            <div className="flex items-center gap-1.5 text-[9px] text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>{new Date(story.publishedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${getCredibilityConfig(story.credibility).color}`}>
          <ShieldCheck className="w-3 h-3" />
          <span>{getCredibilityConfig(story.credibility).label}</span>
        </div>
      </div>

      {/* Center Section: Main Article Details */}
      <div className="px-6 flex-1 flex flex-col justify-end gap-5 pb-6 relative z-10">
        {/* Category & Tags */}
        <div className="flex flex-wrap gap-2">
          <span className="text-[10px] font-extrabold uppercase bg-accent-purple/20 text-accent-purple border border-accent-purple/30 px-2 py-0.5 rounded-md tracking-wider">
            {story.category.replace('_', ' ')}
          </span>
          {story.companyTags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] font-semibold bg-white/5 border border-white/10 text-gray-300 px-2 py-0.5 rounded-md">
              #{tag}
            </span>
          ))}
          {story.techTags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] font-semibold bg-white/5 border border-white/10 text-gray-300 px-2 py-0.5 rounded-md">
              {tag}
            </span>
          ))}
        </div>

        {/* Headline */}
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white leading-tight">
          {story.headline}
        </h2>

        {/* Tiered Summaries Navigation Tabs */}
        <div className="flex border-b border-white/5">
          {(['15s', '30s', '2m'] as const).map((tab) => (
            <button
              key={tab}
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab(tab);
              }}
              className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === tab 
                  ? 'border-accent-purple text-white bg-white/5' 
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab === '15s' ? '15s Excerpt' : tab === '30s' ? '30s Key Facts' : '2m Deep Analysis'}
            </button>
          ))}
        </div>

        {/* Tab content display */}
        <div className="h-44 overflow-y-auto no-scrollbar pr-1">
          {activeTab === '15s' && (
            <p className="text-sm text-gray-300 leading-relaxed tracking-tight font-medium">
              {story.quickSummary}
            </p>
          )}
          {activeTab === '30s' && (
            <ul className="space-y-2 text-sm text-gray-300">
              {story.detailedSummary.split('\n').map((fact, i) => (
                <li key={i} className="flex gap-2.5 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-purple mt-2 shrink-0 shadow-[0_0_6px_rgba(157,0,255,0.8)]" />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          )}
          {activeTab === '2m' && (
            <div className="space-y-3 text-sm text-gray-300 leading-relaxed font-light">
              <p className="whitespace-pre-line">{story.deepAnalysis}</p>
              
              {story.whyItMatters && (
                <div className="mt-4 border-l-2 border-accent-blue/30 pl-3 py-1 bg-accent-blue/5 rounded-r-lg">
                  <h5 className="text-[10px] font-extrabold uppercase text-accent-blue tracking-widest mb-1">Why This Matters</h5>
                  <p className="text-xs text-gray-400 italic">
                    {(story.whyItMatters as any).market || (story.whyItMatters as any).business || 'Critical shifts in tech stack adoption.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Intelligence Engine Scores */}
        <div className="grid grid-cols-5 bg-white/5 border border-white/5 rounded-2xl p-3 select-none">
          <RadialScore score={story.aiImpactScore} label="AI" colorClass="text-accent-purple glow-ring-purple" />
          <RadialScore score={story.marketImpactScore} label="Market" colorClass="text-accent-blue glow-ring-blue" />
          <RadialScore score={story.innovationScore} label="Inno" colorClass="text-accent-emerald glow-ring-emerald" />
          <RadialScore score={story.businessImpactScore} label="Biz" colorClass="text-yellow-400" />
          <RadialScore score={story.viralityScore} label="Viral" colorClass="text-orange-400" />
        </div>
      </div>

      {/* Bottom Tray: Actions */}
      <div className="p-6 border-t border-white/5 bg-black/20 flex items-center justify-between relative z-10">
        <a 
          href={story.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 text-xs font-bold text-accent-blue hover:text-white transition uppercase tracking-wider bg-accent-blue/10 border border-accent-blue/30 px-4 py-2.5 rounded-xl"
        >
          <span>Source Link</span>
          <ExternalLink className="w-4 h-4" />
        </a>

        <div className="flex gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(story.id);
            }}
            className={`p-3 rounded-xl border transition ${
              isLiked 
                ? 'bg-accent-purple/10 border-accent-purple/40 text-accent-purple' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-accent-purple' : ''}`} />
          </button>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleSave(story.id);
            }}
            className={`p-3 rounded-xl border transition ${
              isSaved 
                ? 'bg-accent-emerald/10 border-accent-emerald/40 text-accent-emerald' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-accent-emerald' : ''}`} />
          </button>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
