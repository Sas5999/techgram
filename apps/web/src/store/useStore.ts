import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  user: {
    id: string;
    email: string;
    fullName: string;
    tier: string;
    preferences?: {
      followedCategories: string[];
      followedCompanies: string[];
      followedTechnologies: string[];
      founderModeEnabled: boolean;
    };
  } | null;
  feedFilter: 'trending' | 'latest' | 'personalized' | 'founder_mode' | 'market_disruption';
  activeCategory: string | null;
  likedStories: string[];
  savedStories: string[];
  followedTopics: string[];
  
  setUser: (user: any) => void;
  logout: () => void;
  setFeedFilter: (filter: 'trending' | 'latest' | 'personalized' | 'founder_mode' | 'market_disruption') => void;
  setActiveCategory: (category: string | null) => void;
  toggleLike: (storyId: string) => void;
  toggleSave: (storyId: string) => void;
  toggleTopic: (topic: string) => void;
}

export const useStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      feedFilter: 'latest',
      activeCategory: null,
      likedStories: [],
      savedStories: [],
      followedTopics: [],

      setUser: (user) => set({ user }),
      logout: () => set({ user: null, feedFilter: 'latest' }),
      setFeedFilter: (feedFilter) => set({ feedFilter, activeCategory: null }),
      setActiveCategory: (activeCategory) => set({ activeCategory }),
      
      toggleLike: (storyId) =>
        set((state) => {
          const isLiked = state.likedStories.includes(storyId);
          return {
            likedStories: isLiked
              ? state.likedStories.filter((id) => id !== storyId)
              : [...state.likedStories, storyId],
          };
        }),

      toggleSave: (storyId) =>
        set((state) => {
          const isSaved = state.savedStories.includes(storyId);
          return {
            savedStories: isSaved
              ? state.savedStories.filter((id) => id !== storyId)
              : [...state.savedStories, storyId],
          };
        }),

      toggleTopic: (topic) =>
        set((state) => {
          const isFollowing = state.followedTopics.includes(topic);
          return {
            followedTopics: isFollowing
              ? state.followedTopics.filter((t) => t !== topic)
              : [...state.followedTopics, topic],
          };
        }),
    }),
    {
      name: 'techgram-storage',
    },
  ),
);
