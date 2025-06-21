'use client';

import { navigationItems } from '@/lib/navigation-config';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function AppNavTabs() {
  const router = useRouter();
  const pathname = usePathname();

  // Find the active index based on the current pathname
  const getActiveIndex = () => {
    const index = navigationItems.findIndex((item) => item.url === pathname);
    return index >= 0 ? index : 0; // Default to first tab if not found
  };

  const [activeIndex, setActiveIndex] = useState(getActiveIndex());
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoverStyle, setHoverStyle] = useState({});
  const [activeStyle, setActiveStyle] = useState({ left: '0px', width: '0px' });
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const setTabRef = (index: number) => (el: HTMLAnchorElement | null) => {
    tabRefs.current[index] = el;
  };

  // Update active index when pathname changes
  useEffect(() => {
    const newActiveIndex = getActiveIndex();
    setActiveIndex(newActiveIndex);
  }, [pathname]);

  // Handle hover style positioning
  useEffect(() => {
    if (hoveredIndex !== null) {
      const hoveredElement = tabRefs.current[hoveredIndex];
      if (hoveredElement) {
        const { offsetLeft, offsetWidth } = hoveredElement;
        setHoverStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    }
  }, [hoveredIndex]);

  // Update active indicator position when activeIndex changes
  useEffect(() => {
    const updateActiveStyle = () => {
      const activeElement = tabRefs.current[activeIndex];
      if (activeElement) {
        const { offsetLeft, offsetWidth } = activeElement;
        setActiveStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    };

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(updateActiveStyle);
  }, [activeIndex]);

  // Initial positioning after component mounts
  useEffect(() => {
    const initializeActiveStyle = () => {
      const activeElement = tabRefs.current[activeIndex];
      if (activeElement) {
        const { offsetLeft, offsetWidth } = activeElement;
        setActiveStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    };

    // Double requestAnimationFrame to ensure all refs are set and layout is complete
    requestAnimationFrame(() => {
      requestAnimationFrame(initializeActiveStyle);
    });
  }, []); // Only run once on mount

  const handleHoverToPrefetch = (url: string) => {
    router.prefetch(url);
  };

  return (
    <div className="scrollbar-none sticky top-0 z-10 overflow-x-auto border-b bg-background-subtle px-4">
      <div className="relative flex w-full flex-nowrap items-center justify-start bg-background-subtle py-2 shadow-none">
        {/* Hover Highlight */}
        <div
          className="absolute flex h-[30px] items-center rounded-[6px] bg-accent transition-all duration-200 ease-out"
          style={{
            ...hoverStyle,
            opacity: hoveredIndex !== null ? 1 : 0,
          }}
        />

        {/* Active Indicator */}
        <div
          className="absolute bottom-0 z-20 h-[2px] bg-primary transition-all duration-200 ease-out"
          style={activeStyle}
        />

        {/* Tabs */}
        <div className="relative flex items-center space-x-1">
          {navigationItems.map((item, index) => (
            <Link
              key={index}
              href={item.url}
              ref={setTabRef(index)}
              className={`h-[30px] cursor-pointer border-none bg-transparent px-3 py-2 transition-colors duration-300 ${
                index === activeIndex ? 'text-primary' : 'text-muted-foreground'
              }`}
              onMouseEnter={() => {
                setHoveredIndex(index);
                handleHoverToPrefetch(item.url);
              }}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => handleHoverToPrefetch(item.url)}
              onMouseOver={() => handleHoverToPrefetch(item.url)}
              onPointerEnter={() => handleHoverToPrefetch(item.url)}
            >
              <div className="flex h-full items-center justify-center whitespace-nowrap text-sm leading-5">
                {item.title}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
