'use client';

import { cn } from '@deepcrawl/ui/lib/utils';
import React, { useLayoutEffect, useRef, useState } from 'react';

type DetailedOptionsAccordionChildrenProps = React.ComponentProps<'div'>;
type DetailedOptionsAccordionProps = React.ComponentProps<'div'> & {
  open?: boolean;
  childrenProps?: DetailedOptionsAccordionChildrenProps;
};

export function DetailedOptionsAccordion({
  children,
  className,
  open: isOpen,
  childrenProps,
  style,
  ...props
}: DetailedOptionsAccordionProps) {
  const [height, setHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (contentRef.current) {
      // Temporarily disable transitions to measure natural height
      const element = contentRef.current;
      const originalTransition = element.style.transition;
      element.style.transition = 'none';

      // Measure the full height
      const rect = element.getBoundingClientRect();
      setHeight(rect.height);

      // Restore transition
      element.style.transition = originalTransition;
    }
  }, [children, isOpen]);

  return (
    <div
      className={cn(
        'overflow-hidden border-none transition-[height] duration-200 ease-out last:border-b-0',
        isOpen ? '' : 'peer-hover/toolbar:!h-2 h-0',
        className,
      )}
      style={
        {
          '--detailed-options-accordion-height': height,
          height: isOpen ? `${height}px` : '0px',
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      <div
        className={cn(childrenProps?.className)}
        ref={contentRef}
        {...childrenProps}
      >
        {children}
      </div>
    </div>
  );
}
