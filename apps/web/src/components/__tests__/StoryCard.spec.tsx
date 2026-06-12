import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StoryCard, { StoryType } from '../StoryCard';

// Mock Framer Motion to bypass animation loops in tests
jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, drag, dragConstraints, dragElastic, onDragEnd, ...props }: any, ref: any) => (
        <div ref={ref} {...props} data-testid="motion-div">
          {children}
        </div>
      )),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

// Mock Zustand Store
const mockToggleLike = jest.fn();
const mockToggleSave = jest.fn();

jest.mock('../../store/useStore', () => ({
  useStore: () => ({
    likedStories: [],
    savedStories: [],
    toggleLike: mockToggleLike,
    toggleSave: mockToggleSave,
  }),
}));

const mockStory: StoryType = {
  id: 'story-123',
  headline: 'SpaceX Launches Starship Flight 6 Successfully',
  coverImageUrl: 'https://example.com/spacex.jpg',
  category: 'HARDWARE',
  sourceName: 'SpaceFlightNow',
  sourceDomain: 'spaceflightnow.com',
  sourceLogoUrl: 'https://example.com/logo.png',
  authorName: 'Stephen Clark',
  originalUrl: 'https://spaceflightnow.com/starship-6',
  publishedAt: '2026-06-11T12:00:00Z',
  credibility: 'TRUSTED_MEDIA',
  quickSummary: 'SpaceX completed its sixth test flight of the Starship spacecraft, catching the booster in mid-air.',
  detailedSummary: 'Launch occurred at sunrise from Boca Chica.\nSuper Heavy booster was caught by mechanised arms.\nStarship landed in the Indian Ocean.',
  deepAnalysis: 'This flight demonstrates that rapid reuse of the Super Heavy booster is moving closer to reality. The engineering constraints of catching a 200-ton rocket with mechanical chopsticks require microsecond precision.',
  whyItMatters: {
    market: 'Lowers satellite launch costs dramatically.',
    technology: 'Proves high reliability of tower landing catching system.',
  },
  whatHappensNext: 'Flight 7 is planned for late summer targeting orbital cargo deployment tests.',
  aiImpactScore: 40,
  marketImpactScore: 85,
  innovationScore: 95,
  businessImpactScore: 80,
  viralityScore: 90,
  companyTags: ['SpaceX'],
  techTags: ['ROCKET', 'STARSHIP'],
};

describe('StoryCard Component', () => {
  const defaultProps = {
    story: mockStory,
    onSwipeUp: jest.fn(),
    onSwipeDown: jest.fn(),
    onSwipeLeft: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the source name, author info, and headline', () => {
    render(<StoryCard {...defaultProps} />);
    expect(screen.getByText('SpaceFlightNow')).toBeInTheDocument();
    expect(screen.getByText('SpaceX Launches Starship Flight 6 Successfully')).toBeInTheDocument();
  });

  it('renders the 15s quick summary by default', () => {
    render(<StoryCard {...defaultProps} />);
    expect(screen.getByText(mockStory.quickSummary)).toBeInTheDocument();
  });

  it('clicking the 30s tab displays key facts bullet points', () => {
    render(<StoryCard {...defaultProps} />);
    const thirtySecTab = screen.getByText('30s Key Facts');
    fireEvent.click(thirtySecTab);
    expect(screen.getByText('Launch occurred at sunrise from Boca Chica.')).toBeInTheDocument();
    expect(screen.getByText('Super Heavy booster was caught by mechanised arms.')).toBeInTheDocument();
  });

  it('clicking the 2m tab displays deep analysis paragraph', () => {
    render(<StoryCard {...defaultProps} />);
    const twoMinTab = screen.getByText('2m Deep Analysis');
    fireEvent.click(twoMinTab);
    expect(screen.getByText(/rapid reuse of the Super Heavy booster/i)).toBeInTheDocument();
  });

  it('displays the correct radial scores for all metrics', () => {
    render(<StoryCard {...defaultProps} />);
    expect(screen.getByText('40')).toBeInTheDocument(); // AI
    expect(screen.getByText('85')).toBeInTheDocument(); // Market
    expect(screen.getByText('95')).toBeInTheDocument(); // Innovation
    expect(screen.getByText('80')).toBeInTheDocument(); // Business
    expect(screen.getByText('90')).toBeInTheDocument(); // Virality
  });

  it('clicking the like button triggers store toggleLike', () => {
    render(<StoryCard {...defaultProps} />);
    // Select first button containing Heart icon (actually we can select by svg or class, or click the button)
    const likeBtn = screen.getAllByRole('button')[3]; // 0: 15s, 1: 30s, 2: 2m, 3: like, 4: save, 5: share
    fireEvent.click(likeBtn);
    expect(mockToggleLike).toHaveBeenCalledWith(mockStory.id);
  });

  it('clicking the bookmark button triggers store toggleSave', () => {
    render(<StoryCard {...defaultProps} />);
    const saveBtn = screen.getAllByRole('button')[4]; // bookmark
    fireEvent.click(saveBtn);
    expect(mockToggleSave).toHaveBeenCalledWith(mockStory.id);
  });
});
