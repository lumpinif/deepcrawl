'use client';

import { Button } from '@deepcrawl/ui/components/ui/button';
import { createContext } from '@deepcrawl/ui/lib/context';

import { cn } from '@deepcrawl/ui/lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import * as React from 'react';

const IconHoverButton = React.forwardRef<
  React.ComponentRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button>
>(({ className, children, ...props }, ref) => {
  const [isHover, setIsHover] = React.useState(false);

  return (
    <IconHoverButtonProvider value={{ isHover }}>
      <Button
        className={cn('min-w-9 gap-0 px-2.5', className)}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        ref={ref}
        {...props}
      >
        {children}
      </Button>
    </IconHoverButtonProvider>
  );
});
IconHoverButton.displayName = 'IconHoverButton';

const IconHoverButtonIcon = React.forwardRef<
  React.ComponentRef<'span'>,
  React.ComponentPropsWithoutRef<'span'>
>(({ className, ...props }, ref) => (
  <span className={className} ref={ref} {...props} />
));
IconHoverButtonIcon.displayName = 'IconHoverButtonIcon';

const IconHoverButtonText = React.forwardRef<
  React.ComponentRef<typeof motion.div>,
  React.ComponentPropsWithoutRef<typeof motion.div> & {
    children?: React.ReactNode;
    spanClassName?: string;
  }
>(({ className, spanClassName, children, ...props }, ref) => {
  const { isHover } = useIconHoverButtonContext();

  const variants = {
    initial: {
      width: 0,
      opacity: 0,
    },
    animate: { width: 'auto', opacity: 1 },
  };

  return (
    <AnimatePresence>
      {isHover && (
        <motion.div
          animate="animate"
          className={cn('overflow-hidden', className)}
          exit="initial"
          initial="initial"
          ref={ref}
          transition={{ duration: 0.4, type: 'spring', bounce: 0 }}
          variants={variants}
          {...props}
        >
          <span className={cn('ml-1', spanClassName)}>{children}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
IconHoverButtonText.displayName = 'IconHoverButtonText';

interface ButtonContextValue {
  isHover: boolean;
}

const [IconHoverButtonProvider, useIconHoverButtonContext] =
  createContext<ButtonContextValue>({
    isHover: false,
  });

export { IconHoverButton, IconHoverButtonIcon, IconHoverButtonText };
export { useIconHoverButtonContext };
