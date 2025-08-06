'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseHeaderScrollReturn {
  shouldHideHeader: boolean;
}

interface UseHeaderScrollOptions {
  threshold?: number;
  debounceMs?: number;
  viewportRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Optimized hook for header hiding behavior on scroll
 * - RAF-throttled scroll handling for performance
 * - Passive event listeners
 * - Minimal state updates (single boolean)
 * - Proper cleanup and memory management
 */
export function useHeaderScroll(
  options: UseHeaderScrollOptions,
): UseHeaderScrollReturn {
  const { threshold = 15, debounceMs = 40, viewportRef } = options;

  const [shouldHideHeader, setShouldHideHeader] = useState(false);

  const lastScrollY = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleScroll = useCallback(() => {
    const element = viewportRef.current;
    if (!element) return;

    // Cancel existing RAF if scheduled
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      if (!element) return;

      const currentScrollY = element.scrollTop;
      const scrollDifference = currentScrollY - lastScrollY.current;

      // Determine if header should be hidden
      const isScrollingDown = scrollDifference > threshold;
      const isAtTop = currentScrollY <= threshold;
      const newShouldHide = isScrollingDown && !isAtTop;

      // Only update state if there's a meaningful change
      if (newShouldHide !== shouldHideHeader) {
        // Clear existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Debounce the state update to prevent flickering
        timeoutRef.current = setTimeout(() => {
          setShouldHideHeader(newShouldHide);
        }, debounceMs);
      }

      lastScrollY.current = currentScrollY;
      rafIdRef.current = null;
    });
  }, [threshold, debounceMs, shouldHideHeader, viewportRef]);

  // Set up scroll listener
  useEffect(() => {
    const element = viewportRef.current;
    if (!element) {
      return;
    }

    // Add passive scroll listener for better performance
    element.addEventListener('scroll', handleScroll, { passive: true });

    // Initialize with current scroll position
    lastScrollY.current = element.scrollTop;
    const isAtTop = element.scrollTop <= threshold;
    setShouldHideHeader(!isAtTop && element.scrollTop > threshold);

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, threshold, viewportRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    shouldHideHeader,
  };
}
