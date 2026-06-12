import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface PulseTickerItem {
  id: string;
  title: string;
  category: string;
  createdAt: string;
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [pulseUpdates, setPulseUpdates] = useState<PulseTickerItem[]>([]);
  const [newStoriesCount, setNewStoriesCount] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    
    // Connect to WebSocket server on port 4000 using custom path
    const socket = io(socketUrl, {
      path: '/ws/pulse',
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      setConnected(true);
      console.log('[WebSocket] Connected to Techgram Live Pulse Gateway');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('[WebSocket] Disconnected from Gateway');
    });

    socket.on('connection_ack', (data) => {
      console.log('[WebSocket] Handshake acknowledged:', data);
    });

    // Handle new pulse ticker items
    socket.on('pulse_update', (data: PulseTickerItem) => {
      setPulseUpdates((prev) => {
        // Prevent duplicate updates
        if (prev.some((item) => item.id === data.id || item.title === data.title)) {
          return prev;
        }
        return [data, ...prev].slice(0, 50); // Keep last 50
      });
    });

    // Handle background story additions
    socket.on('feed_update', () => {
      setNewStoriesCount((count) => count + 1);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  const resetNewStoriesCount = () => {
    setNewStoriesCount(0);
  };

  return {
    socket: socketRef.current,
    connected,
    pulseUpdates,
    newStoriesCount,
    resetNewStoriesCount,
  };
}
