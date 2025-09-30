'use client';

import { createContext } from '@deepcrawl/ui/lib/context';
import { cn } from '@deepcrawl/ui/lib/utils';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { AnimatePresence, motion } from 'motion/react';
import * as React from 'react';

const Tabs = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ value, onValueChange, defaultValue, ...props }, ref) => {
  const [activeTab, setActiveTab] = useControllableState({
    prop: value,
    defaultProp: defaultValue ?? '',
    onChange: onValueChange,
  });

  return (
    <TabsProvider value={{ activeTab, setActiveTab }}>
      <TabsPrimitive.Root
        onValueChange={setActiveTab}
        ref={ref}
        value={activeTab}
        {...props}
      />
    </TabsProvider>
  );
});
Tabs.displayName = TabsPrimitive.Root.displayName;

const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.List
    className={cn(
      'inline-flex h-8 items-center justify-center gap-2',
      className,
    )}
    ref={ref}
    {...props}
  >
    {children}
  </TabsPrimitive.List>
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, value, ...props }, ref) => {
  return (
    <TabProvider value={{ value }}>
      <TabsPrimitive.Trigger
        className={cn(
          'group inline-flex h-full items-center justify-center whitespace-nowrap rounded-md bg-secondary px-3 py-1 font-medium text-secondary-foreground text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          className,
        )}
        ref={ref}
        value={value}
        {...props}
      >
        {children}
      </TabsPrimitive.Trigger>
    </TabProvider>
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsTriggerIcon = React.forwardRef<
  React.ComponentRef<'span'>,
  React.ComponentPropsWithoutRef<'span'>
>(({ className, ...props }, ref) => (
  <span
    className={cn('[&>svg]:h-4 [&>svg]:w-4', className)}
    ref={ref}
    {...props}
  />
));
TabsTriggerIcon.displayName = TabsPrimitive.Trigger.displayName;

const TabsTriggerText = React.forwardRef<
  React.ComponentRef<typeof motion.div>,
  React.ComponentPropsWithoutRef<typeof motion.div> & {
    children?: React.ReactNode;
  }
>(({ className, children, ...props }, ref) => {
  const { activeTab } = useTabsContext();
  const { value } = useTabContext();

  const isActive = value === activeTab;

  const variants = {
    initial: {
      width: 0,
      opacity: 0,
    },
    animate: { width: 'auto', opacity: 1 },
  };

  return (
    <AnimatePresence initial={false}>
      {isActive && (
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
          <span className="ml-1">{children}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
TabsTriggerText.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className,
    )}
    ref={ref}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

interface TabsContextValue {
  activeTab: string | undefined;
  setActiveTab: (value: string) => void;
}

interface TabContextValue {
  value: string | undefined;
}

const [TabsProvider, useTabsContext] = createContext<TabsContextValue>({
  activeTab: undefined,
  setActiveTab: () => {},
});

const [TabProvider, useTabContext] = createContext<TabContextValue>({
  value: undefined,
});

export {
  Tabs,
  TabsList,
  TabsContent,
  TabsTrigger,
  TabsTriggerText,
  TabsTriggerIcon,
};

export { useTabsContext, useTabContext };
