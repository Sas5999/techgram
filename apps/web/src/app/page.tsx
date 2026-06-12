'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useSocket } from '../hooks/useSocket';
import Sidebar from '../components/Sidebar';
import BottomBar from '../components/BottomBar';
import PulseTicker from '../components/PulseTicker';
import StoryCard, { StoryType } from '../components/StoryCard';
import SearchConsole from '../components/SearchConsole';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { Layers, Sparkles, Activity } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'feed' | 'search' | 'analytics'>('feed');
  const { feedFilter } = useStore();
  const { newStoriesCount, resetNewStoriesCount } = useSocket();

  const [stories, setStories] = useState<StoryType[]>([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load feed stories from API
  const fetchFeed = () => {
    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    fetch(`${apiUrl}/api/v1/feed?filter=${feedFilter}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.stories) && data.stories.length > 0) {
          setStories(data.stories);
        } else {
          // Fallback mock stories if database is empty
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
      setActiveStoryIndex((prev) => prev + 1);
    }
  };

  const handleSwipeDown = () => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex((prev) => prev - 0.999 ? prev - 1 : 0);
    }
  };

  const handleRefreshNewStories = () => {
    resetNewStoriesCount();
    fetchFeed();
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#030303] text-white">
      {/* Live Marquee Ticker */}
      <PulseTicker />

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Collapsible Sidebar (Desktop) */}
        <Sidebar onTabChange={setActiveTab} currentTab={activeTab} />

        {/* Center Canvas */}
        <main className="flex-1 flex flex-col relative items-center justify-center p-4 pb-20 md:pb-6 overflow-hidden">
          {activeTab === 'feed' && (
            <div className="w-full max-w-[440px] h-[calc(100vh-140px)] flex flex-col items-center justify-center relative">
              {/* Live stories notification banner */}
              {newStoriesCount > 0 && (
                <button
                  onClick={handleRefreshNewStories}
                  className="absolute top-4 z-30 animate-bounce cursor-pointer glass-card btn-neon-purple px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:scale-105 transition-transform"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{newStoriesCount} New Stories Available</span>
                </button>
              )}

              {loading ? (
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent-blue border-r-accent-purple animate-spin" />
                    <div className="absolute inset-2 rounded-full border border-accent-emerald/30 animate-pulse" />
                  </div>
                  <span className="text-xs font-medium text-gray-400 tracking-wide">Tuning into technology intelligence...</span>
                </div>
              ) : stories.length > 0 ? (
                <div className="w-full h-full relative">
                  <StoryCard 
                    story={stories[activeStoryIndex]} 
                    onSwipeUp={handleSwipeUp}
                    onSwipeDown={handleSwipeDown}
                    onSwipeLeft={() => {
                      alert('Related Stories drawer swipe: Loaded semantically similar feeds!');
                    }}
                  />
                  
                  {/* Slide controls display for desktop click assistance */}
                  <div className="hidden lg:flex flex-col gap-2 absolute -right-16 top-1/2 -translate-y-1/2">
                    <button 
                      onClick={handleSwipeDown}
                      disabled={activeStoryIndex === 0}
                      className="w-10 h-10 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-sm"
                    >
                      ▲
                    </button>
                    <button 
                      onClick={handleSwipeUp}
                      disabled={activeStoryIndex === stories.length - 1}
                      className="w-10 h-10 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-sm"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-sm text-center">
                  Feed is currently empty. Scrapers are running...
                </div>
              )}
            </div>
          )}

          {activeTab === 'search' && <SearchConsole />}

          {activeTab === 'analytics' && <AnalyticsDashboard />}
        </main>

        {/* Bottom Nav Bar (Mobile) */}
        <BottomBar onTabChange={setActiveTab} currentTab={activeTab} />
      </div>
    </div>
  );
}

// Global High-Fidelity Fallback Mock Data for instant demonstration
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
