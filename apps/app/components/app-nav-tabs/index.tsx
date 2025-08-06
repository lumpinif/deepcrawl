'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NAVGATION_ITEMS } from '@/lib/navigation-config';

export default function AppNavTabs() {
  const router = useRouter();
  const pathname = usePathname();

  // Find the active index based on the current pathname
  const getActiveIndex = useCallback(() => {
    const index = NAVGATION_ITEMS.findIndex((item) => item.url === pathname);
    return index >= 0 ? index : 0; // Default to first tab if not found
  }, [pathname]);

  const [activeIndex, setActiveIndex] = useState(getActiveIndex());
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoverStyle, setHoverStyle] = useState({});
  const [activeStyle, setActiveStyle] = useState({ left: '0px', width: '0px' });
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const rafIdRef = useRef<number | null>(null);

  // Memoized tab ref setter
  const setTabRef = useCallback(
    (index: number) => (el: HTMLAnchorElement | null) => {
      tabRefs.current[index] = el;
    },
    [],
  );

  // Optimized style updater with RAF management
  const updateActiveStyle = useCallback((targetIndex: number) => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      const activeElement = tabRefs.current[targetIndex];
      if (activeElement) {
        const { offsetLeft, offsetWidth } = activeElement;
        setActiveStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
      rafIdRef.current = null;
    });
  }, []);

  // Memoized event handlers
  const handleMouseEnter = useCallback(
    (index: number, url: string) => {
      setHoveredIndex(index);
      router.prefetch(url);
    },
    [router],
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  const handlePrefetch = useCallback(
    (url: string) => {
      router.prefetch(url);
    },
    [router],
  );

  // Update active index when pathname changes
  useEffect(() => {
    const newActiveIndex = getActiveIndex();
    if (newActiveIndex !== activeIndex) {
      setActiveIndex(newActiveIndex);
    }
  }, [pathname, getActiveIndex, activeIndex]);

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
    updateActiveStyle(activeIndex);
  }, [activeIndex, updateActiveStyle]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // Memoized hover style with opacity
  const computedHoverStyle = useMemo(
    () => ({
      ...hoverStyle,
      opacity: hoveredIndex !== null ? 1 : 0,
    }),
    [hoverStyle, hoveredIndex],
  );

  // Memoized navigation items to prevent unnecessary re-renders
  const renderedTabs = useMemo(
    () =>
      NAVGATION_ITEMS.map((item, index) => (
        <Link
          key={`${item.url}-${index}`} // More stable key
          href={item.url}
          ref={setTabRef(index)}
          className={`h-8 cursor-pointer border-none bg-transparent transition-colors duration-300 ${
            index === activeIndex ? 'text-primary' : 'text-muted-foreground'
          }`}
          onMouseEnter={() => handleMouseEnter(index, item.url)}
          onMouseLeave={handleMouseLeave}
          onFocus={() => handlePrefetch(item.url)}
        >
          <div className="flex h-full items-center justify-center whitespace-nowrap px-3 pb-1 text-sm">
            {item.title}
          </div>
        </Link>
      )),
    [
      activeIndex,
      setTabRef,
      handleMouseEnter,
      handleMouseLeave,
      handlePrefetch,
    ],
  );

  return (
    <div className="scrollbar-none sticky top-0 z-10 h-11 overflow-x-auto border-b bg-background-subtle px-4">
      <div className="relative flex h-full w-full flex-nowrap items-center justify-start shadow-none">
        {/* Hover Highlight */}
        <div
          className="absolute hidden h-8 items-center rounded bg-accent transition-all duration-150 ease-out md:flex"
          style={computedHoverStyle}
        />

        {/* Active Indicator */}
        <div
          className="absolute bottom-0 z-20 h-[2px] bg-primary transition-all duration-150 ease-out"
          style={activeStyle}
        />

        {/* Tabs */}
        <div className="relative flex items-center">{renderedTabs}</div>
      </div>
    </div>
  );
}
