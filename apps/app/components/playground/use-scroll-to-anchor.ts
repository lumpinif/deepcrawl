'use client';

import { useCallback } from 'react';

const DEFAULT_SCROLL_OPTIONS: ScrollIntoViewOptions = {
  behavior: 'smooth',
  block: 'start',
};

export function useScrollToAnchor(defaultOptions?: ScrollIntoViewOptions) {
  return useCallback(
    (anchorId: string, options?: ScrollIntoViewOptions) => {
      const target = document.getElementById(anchorId);
      if (!target) {
        return;
      }

      target.scrollIntoView({
        ...DEFAULT_SCROLL_OPTIONS,
        ...defaultOptions,
        ...options,
      });
    },
    [defaultOptions],
  );
}
