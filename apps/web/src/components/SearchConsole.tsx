'use client';

import React, { useState, useEffect } from 'react';
import { Search, Flame, Cpu, ArrowRight } from 'lucide-react';
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
    'TypeScript 5.0'
  ];

  // Debounced search trigger
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${apiUrl}/api/v1/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setResults(data);
        }
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="w-full max-w-lg mx-auto py-12 px-6 overflow-y-auto h-[calc(100vh-80px)] no-scrollbar select-none">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          Semantic Tech Discovery
        </h2>
        <p className="text-xs text-gray-400">
          Query technologies, founders, funding stages, or startups.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple transition-all shadow-lg"
          placeholder="e.g. LLM architectures, acquisitions..."
        />
        {loading && (
          <div className="absolute right-4 top-3.5 w-5 h-5 rounded-full border-2 border-accent-purple border-t-transparent animate-spin" />
        )}
      </div>

      {/* Suggested Searches */}
      {query.length === 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Trending Searches</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {trendingSearches.map((search) => (
              <button
                key={search}
                onClick={() => setQuery(search)}
                className="text-xs font-medium text-gray-300 bg-white/5 border border-white/5 hover:border-accent-blue/30 px-3.5 py-2 rounded-xl transition"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      <div className="space-y-4">
        {results.length > 0 ? (
          results.map((story) => (
            <div 
              key={story.id} 
              className="glass-card rounded-2xl p-4 border border-white/5 flex flex-col gap-3 transition"
            >
              <div className="flex items-center gap-2 justify-between">
                <span className="text-[9px] font-extrabold uppercase bg-accent-purple/20 text-accent-purple px-2 py-0.5 rounded">
                  {story.category.replace('_', ' ')}
                </span>
                <span className="text-[9px] text-gray-400">
                  {new Date(story.publishedAt).toLocaleDateString()}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white leading-snug">
                {story.headline}
              </h4>
              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                {story.quickSummary}
              </p>
              <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1">
                <span className="text-[10px] text-accent-blue font-semibold">{story.sourceName}</span>
                <a 
                  href={story.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] font-bold text-white uppercase tracking-wider hover:text-accent-purple transition"
                >
                  <span>Full Article</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))
        ) : (
          query && !loading && (
            <div className="text-center py-12 text-gray-500 text-sm">
              No results found for "{query}".
            </div>
          )
        )}
      </div>
    </div>
  );
}
