import React, { useState, useEffect, useRef } from 'react';
import gif from './../../assets/dio-chuggis.gif'

interface ErrorBubble {
  x: number;
  y: number;
  id: number;
  size: number;
  code: string;
}

interface GreenBubble {
  x: number;
  y: number;
  targetIndex: number;
  id: number;
}

interface TickMark {
  x: number;
  y: number;
  id: number;
}

interface CursorPosition {
  x: number;
  y: number;
  id?: number;
}

interface BubbleCleanerProps {
  children?: React.ReactNode;
}

const BubbleCleaner: React.FC<BubbleCleanerProps> = ({ children }) => {
  // ========== CONFIGURATION ==========
  // Replace this URL with your own GIF/image URL
  const CLEANER_SIZE = 80; // Size of the cleaner bubble in pixels
  // ===================================
  
  const [errorBubbles, setErrorBubbles] = useState<ErrorBubble[]>([]);
  const [greenBubbles, setGreenBubbles] = useState<GreenBubble[]>([{ x: 50, y: 50, targetIndex: 0, id: 1 }]);
  const [tickMarks, setTickMarks] = useState<TickMark[]>([]);
  const [cursorTrail, setCursorTrail] = useState<CursorPosition[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const colorIndex = useRef<number>(0)
  const colors : string[ ] = [
    "#ff0000", "#00ff00", "#0000ff"
  ]
  
  const errorCodes: string[] = [
    'ERR_404', 'ERR_500', 'ERR_403', 'ERR_502', 'ERR_401',
    'ERR_503', 'ERR_408', 'ERR_429', 'ERR_504', 'ERR_400'
  ];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newPos: CursorPosition = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
        
        // Add to trail with timestamp
        setCursorTrail(prev => {
          const newTrail = [...prev, { ...newPos, id: Date.now() + Math.random() }];
          return newTrail.slice(-10); // Keep last 15 positions for longer trail
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  useEffect(() => {
    if (errorBubbles.length === 0) return;

    // Spawn new cleaners if needed
    const neededCleaners = Math.min(Math.floor(errorBubbles.length / 5) + 1, 5);
    if (neededCleaners > greenBubbles.length) {
      setGreenBubbles(prev => {
        const newCleaners: GreenBubble[] = [];
        for (let i = prev.length; i < neededCleaners; i++) {
          newCleaners.push({
            x: Math.random() * 800 + 100,
            y: Math.random() * 400 + 100,
            targetIndex: i,
            id: Date.now() + i
          });
        }
        return [...prev, ...newCleaners];
      });
    }

    const interval = setInterval(() => {
      setGreenBubbles(prevBubbles => {
        return prevBubbles.map((cleaner, cleanerIdx) => {
          // Assign targets round-robin style
          const assignedErrors = errorBubbles.filter((_, idx) => idx % prevBubbles.length === cleanerIdx);
          if (assignedErrors.length === 0) return cleaner;

          const targetInAssigned = Math.floor(cleaner.targetIndex / prevBubbles.length);
          const target = assignedErrors[targetInAssigned % assignedErrors.length];
          
          if (!target) return cleaner;

          const dx = target.x - cleaner.x;
          const dy = target.y - cleaner.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 5) {
            // Add tick mark at the position
            setTickMarks(prev => [...prev, { 
              x: target.x, 
              y: target.y, 
              id: Date.now() + Math.random() 
            }]);
            setErrorBubbles(bubbles => bubbles.filter(b => b.id !== target.id));
            return {
              ...cleaner,
              targetIndex: cleaner.targetIndex + prevBubbles.length
            };
          }

          const speed = 3;
          return {
            ...cleaner,
            x: cleaner.x + (dx / distance) * speed,
            y: cleaner.y + (dy / distance) * speed
          };
        });
      });
    }, 10);

    return () => clearInterval(interval);
  }, [errorBubbles, greenBubbles.length]);

  // Remove tick marks after 2 seconds
  useEffect(() => {
    if (tickMarks.length === 0) return;
    
    const timeout = setTimeout(() => {
      setTickMarks(prev => prev.slice(1));
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [tickMarks]);

  // Fade out cursor trail after inactivity
  useEffect(() => {
    if (cursorTrail.length === 0) {
      colorIndex.current = (colorIndex.current + 1) % colors.length
      return;
    }
    
    const timeout = setTimeout(() => {
      setCursorTrail(prev => prev.slice(1));
    }, 50); // Remove one trail point every 50ms
    
    return () => clearTimeout(timeout);
  }, [cursorTrail]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Check if click is on the content area
    const target = e.target as HTMLElement;
    if (target.closest('.content-area')) {
      return; // Don't create bubbles on content area
    }
    
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newBubble: ErrorBubble = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        id: Date.now(),
        size: 60 + Math.random() * 60,
        code: errorCodes[Math.floor(Math.random() * errorCodes.length)]
      };
      setErrorBubbles(prev => [...prev, newBubble]);
    }
  };

  return (
    <div 
      ref={containerRef}
      onClick={handleClick}
      className="relative w-full h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden cursor-crosshair"
      style={{
        backgroundImage: 'radial-gradient(circle, #e0e7ff 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}
    >
      {/* Cursor trail - DEBUGGING */}
      <svg
        className="absolute pointer-events-none"
        style={{ 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          zIndex: 100
        }}
      >
        {cursorTrail.length > 1 && cursorTrail.slice(1).map((pos, index) => {
          const prevPos = cursorTrail[index];
          
          return (
            <line
              key={`${pos.id}-${index}`}
              x1={prevPos.x}
              y1={prevPos.y}
              x2={pos.x}
              y2={pos.y}
              stroke={colors[colorIndex.current]}
              strokeWidth={6}
              opacity={1}
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* Error bubbles */}
      {errorBubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
          style={{ left: bubble.x, top: bubble.y }}
        >
          <div 
            className="bg-red-200 rounded-full shadow-lg border-2 border-red-300 flex items-center justify-center"
            style={{ width: bubble.size, height: bubble.size }}
          >
            <span className="text-xs font-mono text-red-700 font-semibold">
              {bubble.code}
            </span>
          </div>
        </div>
      ))}

      {/* Tick marks */}
      {tickMarks.map((tick) => (
        <div
          key={tick.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-ping"
          style={{ 
            left: tick.x, 
            top: tick.y,
            animationDuration: '2s'
          }}
        >
          <div className="text-4xl text-green-500 font-bold">✓</div>
        </div>
      ))}

      {/* Green cleaner bubbles */}
      {errorBubbles.length > 0 && greenBubbles.map((cleaner) => (
        <div
          key={cleaner.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: cleaner.x,
            top: cleaner.y,
            transition: 'transform 0.1s ease',
            width: CLEANER_SIZE,
            height: CLEANER_SIZE
          }}
        >
          <div className="w-full h-full bg-linear-to-br from-green-200 to-emerald-200 rounded-full flex items-center justify-center shadow-xl border-3 border-green-300 relative overflow-hidden">
            {/* Your GIF/Image goes here */}
            <img 
              src={gif}
              alt="cleaner"
              className="w-full h-full object-cover rounded-full"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                // Fallback if image fails to load
                const target = e.currentTarget;
                target.style.display = 'none';
                if (target.nextSibling && target.nextSibling instanceof HTMLElement) {
                  target.nextSibling.style.display = 'flex';
                }
              }}
            />
            {/* Fallback emoji (hidden if image loads successfully) */}
            <div className="absolute inset-0 items-center justify-center text-4xl" style={{ display: 'none' }}>
              🧹
            </div>
            {/* Pulse effect */}
            <div className="absolute inset-0 rounded-full bg-green-300 animate-ping opacity-20" />
          </div>
        </div>
      ))}

      {/* Content Area - Center */}
      {children && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 200 }}>
          <div className="content-area pointer-events-auto">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default BubbleCleaner;