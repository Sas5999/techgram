'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useSocket } from '../hooks/useSocket';
import Sidebar from '../components/Sidebar';
import BottomBar from '../components/BottomBar';
import PulseTicker from '../components/PulseTicker';
import StoryCard, { StoryType } from '../components/StoryCard';
import SearchConsole from '../components/SearchConsole';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import AnimatedBackground from '../components/AnimatedBackground';
import MobileHeader from '../components/MobileHeader';
import { Sparkles, ChevronUp, ChevronDown } from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<'feed' | 'search' | 'analytics'>('feed');
  const { feedFilter } = useStore();
  const { newStoriesCount, resetNewStoriesCount } = useSocket();

  const [stories, setStories] = useState<StoryType[]>([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'up' | 'down'>('up');

  const fetchFeed = () => {
    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    fetch(`${apiUrl}/api/v1/feed?filter=${feedFilter}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.stories) && data.stories.length > 0) {
          setStories(data.stories);
        } else {
          setStories(MOCK_STORIES);
        }
        setActiveStoryIndex(0);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load feed', err);
        setStories(MOCK_STORIES);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFeed();
  }, [feedFilter]);

  const handleSwipeUp = () => {
    if (activeStoryIndex < stories.length - 1) {
      setSwipeDirection('up');
      setActiveStoryIndex((prev) => prev + 1);
    }
  };

  const handleSwipeDown = () => {
    if (activeStoryIndex > 0) {
      setSwipeDirection('down');
      setActiveStoryIndex((prev) => prev - 1);
    }
  };

  const handleRefreshNewStories = () => {
    resetNewStoriesCount();
    fetchFeed();
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-white relative">
      <AnimatedBackground />

      <div className="relative z-10 flex flex-col h-full">
        <MobileHeader activeTab={activeTab} feedFilter={feedFilter} />
        <PulseTicker />

        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar onTabChange={setActiveTab} currentTab={activeTab} />

          <main className="flex-1 flex flex-col relative items-center justify-center p-4 pb-20 md:pb-6 overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === 'feed' && (
                <motion.div
                  key="feed"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-[440px] h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] flex flex-col items-center justify-center relative"
                >
                  {newStoriesCount > 0 && (
                    <motion.button
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handleRefreshNewStories}
                      className="absolute top-2 z-30 cursor-pointer glass-card btn-neon-purple px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{newStoriesCount} new {newStoriesCount === 1 ? 'story' : 'stories'}</span>
                    </motion.button>
                  )}

                  {loading ? (
                    <div className="w-full h-full rounded-3xl shimmer border border-white/5 flex flex-col items-center justify-center gap-5">
                      <div className="relative w-10 h-10">
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent-blue border-r-accent-purple animate-spin" />
                      </div>
                      <span className="text-xs font-medium text-gray-500 tracking-wide">Loading intelligence feed…</span>
                    </div>
                  ) : stories.length > 0 ? (
                    <div className="w-full h-full relative flex flex-col gap-3">
                      {/* Story progress */}
                      <div className="flex items-center justify-center gap-1.5 shrink-0">
                        {stories.map((_, i) => (
                          <div
                            key={i}
                            className={`story-dot ${i === activeStoryIndex ? 'active' : i < activeStoryIndex ? 'done' : ''}`}
                          />
                        ))}
                      </div>

                      <div className="flex-1 relative min-h-0">
                        <AnimatePresence mode="wait" custom={swipeDirection}>
                          <StoryCard
                            key={stories[activeStoryIndex].id}
                            story={stories[activeStoryIndex]}
                            direction={swipeDirection}
                            onSwipeUp={handleSwipeUp}
                            onSwipeDown={handleSwipeDown}
                            onSwipeLeft={() => {}}
                          />
                        </AnimatePresence>

                        {/* Desktop nav controls */}
                        <div className="hidden lg:flex flex-col gap-2 absolute -right-14 top-1/2 -translate-y-1/2">
                          <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSwipeDown}
                            disabled={activeStoryIndex === 0}
                            className="w-10 h-10 rounded-full border border-white/8 bg-white/5 hover:bg-white/10 text-white disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center transition-colors"
                            aria-label="Previous story"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSwipeUp}
                            disabled={activeStoryIndex === stories.length - 1}
                            className="w-10 h-10 rounded-full border border-white/8 bg-white/5 hover:bg-white/10 text-white disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center transition-colors"
                            aria-label="Next story"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>

                      {/* Swipe hint */}
                      {activeStoryIndex === 0 && stories.length > 1 && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.2 }}
                          className="text-center text-[10px] text-gray-500 font-medium tracking-wide swipe-hint shrink-0"
                        >
                          Swipe up for next story · Double-tap to like
                        </motion.p>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm text-center px-6">
                      Feed is empty. Scrapers are running…
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'search' && (
                <motion.div
                  key="search"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full"
                >
                  <SearchConsole />
                </motion.div>
              )}

              {activeTab === 'analytics' && (
                <motion.div
                  key="analytics"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full"
                >
                  <AnalyticsDashboard />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <BottomBar onTabChange={setActiveTab} currentTab={activeTab} />
        </div>
      </div>
    </div>
  );
}

const MOCK_STORIES: StoryType[] = [
  {
    id: 'mock-1',
    headline: 'OpenAI Unveils GPT-5 "Orion" Specifying Quantum Logic Capabilities',
    coverImageUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
    category: 'AI_ML',
    sourceName: 'TechCrunch',
    sourceDomain: 'techcrunch.com',
    sourceLogoUrl: 'https://logo.clearbit.com/techcrunch.com?size=128',
    authorName: 'Alex Wilhelm',
    originalUrl: 'https://techcrunch.com/2026/06/openai-orion-gpt-5-unveil',
    publishedAt: new Date().toISOString(),
    credibility: 'OFFICIAL_SOURCE',
    quickSummary: 'OpenAI has officially launched its newest foundational model, code-named Orion. The architecture introduces active quantum-logic optimizations and advanced reasoning paths, showcasing high benchmarking records across multi-step mathematics and coding.',
    detailedSummary: 'Orion marks OpenAI\'s transition into quantum-aligned reasoning models.\nBenchmark records show 98.4% accuracy in multi-step programming tasks.\nThe model is rolling out immediately to Enterprise developers.\nLatency has been optimized by 42% compared to previous API iterations.\nIndustry responses indicate a major disruption in search and dev ecosystems.',
    deepAnalysis: 'The official release of GPT-5 (Orion) represents a major architectural pivot. OpenAI has successfully combined sparse transformer architectures with dynamic logical routing models, effectively reducing computational waste while increasing factual alignment. Developers can immediately integrate it via standard API keys.\n\nFrom a market standpoint, this release raises pressure on Anthropic and Google. Hardware alliances, particularly with Microsoft and Nvidia, remain critical as compute costs scale. We anticipate a rapid adoption wave across developer platforms and automated agents.\n\nOver the next 60 days, we will likely see specialized fine-tuned versions targeting cybersecurity audits and quantitative trading algorithms. Orion is positioning itself as the default engine for high-tier enterprise AI.',
    whyItMatters: {
      market: 'Reshapes search index valuations and increases AI infrastructure spending commitments.',
      business: 'Allows full automation of complex multi-tier enterprise logic flows.',
      technology: 'Demonstrates sparse logical routing inside commercial neural nets.',
      developer: 'Provides advanced system API integration keys and lower rate limit tiers.',
      consumer: 'Brings lightning-fast conversational and debugging assistant features.'
    },
    whatHappensNext: 'Immediate API keys will be distributed to waitlisted developers. A public rollout of consumer integrations is expected within 30 days.',
    aiImpactScore: 99,
    marketImpactScore: 92,
    innovationScore: 98,
    businessImpactScore: 90,
    viralityScore: 96,
    companyTags: ['OpenAI', 'Microsoft', 'Nvidia'],
    techTags: ['GPT-5', 'LLM', 'ORION', 'API']
  },
  {
    id: 'mock-2',
    headline: 'Stripe Closes $850M Series G Funding Round at $82B Valuation',
    coverImageUrl: 'https://images.unsplash.com/photo-1553729459-beb747028b4e?w=800&auto=format&fit=crop&q=80',
    category: 'FUNDING',
    sourceName: 'VentureBeat',
    sourceDomain: 'venturebeat.com',
    sourceLogoUrl: 'https://logo.clearbit.com/venturebeat.com?size=128',
    authorName: 'Ingrid Lunden',
    originalUrl: 'https://venturebeat.com/2026/06/stripe-series-g-valuation-82b',
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    credibility: 'TRUSTED_MEDIA',
    quickSummary: 'Stripe has completed an $850 million Series G growth funding round, bringing its valuation to $82 billion. The round was led by major sovereign wealth funds and venture partners, earmarked for expanding global cross-border payments.',
    detailedSummary: 'Stripe raises $850M in its latest Series G capital injection.\nThe valuation stabilizes at $82B, cementing Stripe as a fintech leader.\nCapital will be deployed for regional cross-border payment rails.\nInvestors include Sequoia, Andreessen Horowitz, and sovereign wealth entities.\nThis round decreases immediate pressure for an initial public offering (IPO).',
    deepAnalysis: 'Stripe\'s latest cash injection serves as a valuation validator in a shifting fintech landscape. By securing capital at an $82 billion mark, Stripe demonstrates strong unit economics and resilient revenue streams despite high competitive pressures from Adyen and PayPal.\n\nThe strategic focus of this round centers on emerging markets. Expanding local rails in Southeast Asia and Africa allows Stripe to capture high-growth remittance and B2B invoice corridors. This strategy will fuel growth metrics for the next 24 months.\n\nFurthermore, this capital buffer gives the company liquidity flexibility. A public listing is now deferred to late 2027, letting management focus on core engineering integrations without public market scrutiny.',
    whyItMatters: {
      market: 'Stabilizes private fintech valuations and increases late-stage venture investor confidence.',
      business: 'Provides capital reserves to acquire smaller regional payments networks.',
      technology: 'Supports rollout of Stripe\'s custom machine-learning fraud detection algorithms.',
      developer: 'Promises cheaper cross-border API fees and invoice handling rates.',
      consumer: 'Enables faster Checkout flows and instant multi-currency refunds.'
    },
    whatHappensNext: 'Stripe will launch its updated regional payment SDKs in 8 new countries by the end of the year.',
    aiImpactScore: 45,
    marketImpactScore: 95,
    innovationScore: 72,
    businessImpactScore: 92,
    viralityScore: 88,
    companyTags: ['Stripe', 'Sequoia', 'Adyen'],
    techTags: ['API', 'FINTECH', 'STRIPE']
  },
  {
    id: 'mock-3',
    headline: 'NVIDIA Announces Blackwell Ultra GPUs Built on TSMC 3nm Process',
    coverImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    category: 'HARDWARE',
    sourceName: 'Wired Tech',
    sourceDomain: 'wired.com',
    sourceLogoUrl: 'https://logo.clearbit.com/wired.com?size=128',
    authorName: 'Lily Hay Newman',
    originalUrl: 'https://wired.com/2026/06/nvidia-blackwell-ultra-tsmc-3nm',
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    credibility: 'OFFICIAL_SOURCE',
    quickSummary: 'NVIDIA has announced the Blackwell Ultra GPU architecture, manufactured on TSMC\'s cutting-edge 3nm process node. The chip delivers a 3x increase in inference performance for trillion-parameter LLM configurations.',
    detailedSummary: 'Blackwell Ultra GPUs are officially announced by NVIDIA CEO Jensen Huang.\nManufactured using TSMC\'s highly advanced 3nm semiconductor node.\nDelivers a 3.2x speedup in LLM inference tasks over prior versions.\nThermal efficiency metrics show a 35% drop in power requirements.\nCloud providers have placed immediate pre-orders for early 2027 deliveries.',
    deepAnalysis: 'NVIDIA\'s move to the 3nm node via TSMC for Blackwell Ultra is a calculated response to rising silicon challenges. By reducing feature sizes, NVIDIA squeezed 210 billion transistors onto the die, achieving unprecedented density and computational speeds.\n\nEnergy consumption has become the main limiting factor for data center expansion. The Blackwell Ultra address this with custom microarchitectural power management, allowing operators to run larger model weights without scaling up grid power grids.\n\nTSMC\'s capacity limits remain the single supply bottleneck. However, this announcements keeps NVIDIA ahead of AMD\'s MI350 series, securing its dominance in artificial intelligence accelerator grids.',
    whyItMatters: {
      market: 'Spurs higher capital commitments for TSMC and consolidates NVIDIA\'s index lead.',
      business: 'Reduces operational power bills for cloud hyper-scalers (AWS, Azure).',
      technology: 'Pushes the boundaries of high-bandwidth memory (HBM3e) routing.',
      developer: 'Speeds up training feedback loops and reduces model inference cost.',
      consumer: 'Enables hosting of more complex local weights on next-gen consumer systems.'
    },
    whatHappensNext: 'Pre-orders open immediately, with volume shipping to cloud providers slated for Q1 2027.',
    aiImpactScore: 96,
    marketImpactScore: 94,
    innovationScore: 95,
    businessImpactScore: 91,
    viralityScore: 92,
    companyTags: ['Nvidia', 'TSMC', 'AMD'],
    techTags: ['GPU', 'SEMICONDUCTOR', 'BLACKWELL']
  }
];
