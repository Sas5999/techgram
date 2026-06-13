'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Flame, ArrowRight, Sparkles } from 'lucide-react';
import { StoryType } from './StoryCard';

export default function SearchConsole() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StoryType[]>([]);
  const [loading, setLoading] = useState(false);

  const trendingSearches = [
    'OpenAI reasoning',
    'NVIDIA GPU supply',
    'Series A funding',
    'Cybersecurity breach',
    'TypeScript 5.0',
  ];

  useEffect(() => {
    if (!query) { setResults([]); return; }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${apiUrl}/api/v1/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (Array.isArray(data)) setResults(data);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="w-full max-w-lg mx-auto py-8 px-6 overflow-y-auto h-[calc(100vh-120px)] md:h-[calc(100vh-80px)] no-scrollbar select-none">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 text-accent-purple text-xs font-semibold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Semantic Search
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
          Discover Tech Intelligence
        </h2>
        <p className="text-xs text-gray-500">
          Search technologies, founders, funding stages, or startups.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative mb-8 neon-pulse-focus rounded-[1.25rem]"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full input-glass rounded-[1.25rem] pl-11 pr-12 py-4 text-sm text-white focus:outline-none focus:border-accent-purple/50 focus:ring-1 focus:ring-accent-purple/25 transition-all placeholder:text-gray-500"
          placeholder="Search creators, trends, funding or signals…"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-accent-purple border-t-transparent animate-spin" />
        )}
      </motion.div>

      {query.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            Trending
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingSearches.map((search, i) => (
              <motion.button
                key={search}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setQuery(search)}
                className="pill-chip shine-sweep text-[11px] font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                {search}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {results.map((story, i) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              layout
              className="glass-card shine-sweep rounded-2xl p-4 flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase bg-accent-purple/15 text-accent-purple px-2 py-0.5 rounded">
                  {story.category.replace('_', ' ')}
                </span>
                <span className="text-[9px] text-gray-500">
                  {new Date(story.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white leading-snug">{story.headline}</h4>
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{story.quickSummary}</p>
              <div className="flex items-center justify-between border-t border-white/5 pt-2.5">
                <span className="text-[10px] text-accent-blue font-medium">{story.sourceName}</span>
                <a
                  href={story.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 hover:text-accent-purple transition-colors uppercase tracking-wider"
                >
                  Read <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {query && !loading && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 text-gray-500 text-sm"
          >
            No results for &ldquo;{query}&rdquo;
          </motion.div>
        )}
      </div>
    </div>
  );
}
