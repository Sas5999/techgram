import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '../Sidebar';

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, ...props }: any, ref: any) => (
        <div ref={ref} {...props}>{children}</div>
      )),
      button: React.forwardRef(({ children, ...props }: any, ref: any) => (
        <button ref={ref} {...props}>{children}</button>
      )),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

const mockSetFeedFilter = jest.fn();
const mockSetUser = jest.fn();
const mockLogout = jest.fn();

jest.mock('../../store/useStore', () => ({
  useStore: () => ({
    feedFilter: 'latest',
    setFeedFilter: mockSetFeedFilter,
    user: null,
    setUser: mockSetUser,
    logout: mockLogout,
  }),
}));

describe('Sidebar Component', () => {
  const defaultProps = {
    onTabChange: jest.fn(),
    currentTab: 'feed' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the brand title and logo', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('Techgram')).toBeInTheDocument();
  });

  it('displays menu items for feed categories', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('Latest Feed')).toBeInTheDocument();
    expect(screen.getByText('Trending')).toBeInTheDocument();
    expect(screen.getByText('Founder Mode')).toBeInTheDocument();
    expect(screen.getByText('Disruptions')).toBeInTheDocument();
  });

  it('clicking Latest Feed sets store filter and triggers tab change', () => {
    render(<Sidebar {...defaultProps} />);
    const latestFeedBtn = screen.getByText('Latest Feed');
    fireEvent.click(latestFeedBtn);
    expect(mockSetFeedFilter).toHaveBeenCalledWith('latest');
    expect(defaultProps.onTabChange).toHaveBeenCalledWith('feed');
  });

  it('clicking Founder Mode sets store filter to founder_mode', () => {
    render(<Sidebar {...defaultProps} />);
    const founderModeBtn = screen.getByText('Founder Mode');
    fireEvent.click(founderModeBtn);
    expect(mockSetFeedFilter).toHaveBeenCalledWith('founder_mode');
    expect(defaultProps.onTabChange).toHaveBeenCalledWith('feed');
  });

  it('clicking Intelligence triggers tab change to analytics', () => {
    render(<Sidebar {...defaultProps} />);
    const intelBtn = screen.getByText('Intelligence');
    fireEvent.click(intelBtn);
    expect(defaultProps.onTabChange).toHaveBeenCalledWith('analytics');
  });

  it('shows Join Platform when user is not authenticated', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('Join Platform')).toBeInTheDocument();
  });
});
