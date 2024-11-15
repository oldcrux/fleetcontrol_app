import React, { useEffect, useState, RefObject } from 'react';

interface ScrollDownIndicatorProps {
  scrollContainerRef: RefObject<HTMLElement>; // or use the appropriate type based on your use case
}

export function ScrollDownIndicator({ scrollContainerRef }: ScrollDownIndicatorProps) {

  const [isVisible, setIsVisible] = useState(true);

  const handleScroll = () => {
    // console.log(`is scroll listening ??`);
    if (!scrollContainerRef.current) return;

    const scrollTop = scrollContainerRef.current.scrollTop;
    const containerHeight = scrollContainerRef.current.clientHeight;
    const scrollHeight = scrollContainerRef.current.scrollHeight;

    // Check if scrolled down more than 3/4 of the scrollable area
    if (scrollTop > scrollHeight - containerHeight - containerHeight / 4) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [scrollContainerRef]);

  return (
    isVisible && (
      <div className="absolute bottom-5 right-5 transform text-center z-20 transition-opacity duration-300">
        <div className="relative">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-full transition-transform">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-white"></div>
          </div>
          <span className="tooltip absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 transition-opacity bg-gray-400 text-white text-xs rounded px-2 py-1 pointer-events-none">
            Scroll down
          </span>
        </div>
      </div>
    )
  );
}
