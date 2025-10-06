'use client';

import { cn } from '@deepcrawl/ui/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

// Define CardContext
type CardContextType = {
  variant: 'default' | 'accent';
};

const CardContext = React.createContext<CardContextType>({
  variant: 'default', // Default value
});

// Hook to use CardContext
const useCardContext = () => {
  const context = React.useContext(CardContext);
  if (!context) {
    throw new Error('useCardContext must be used within a Card component');
  }
  return context;
};

// Variants
const cardVariants = cva(
  'flex flex-col items-stretch rounded-xl text-card-foreground',
  {
    variants: {
      variant: {
        default: 'black/5 border border-border bg-card shadow-xs',
        accent: 'bg-muted p-1 shadow-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const cardHeaderVariants = cva(
  'flex min-h-14 flex-wrap items-center justify-between gap-2.5 px-5',
  {
    variants: {
      variant: {
        default: 'border-border border-b',
        accent: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const cardContentVariants = cva('grow p-5', {
  variants: {
    variant: {
      default: '',
      accent: 'rounded-t-xl bg-card [&:last-child]:rounded-b-xl',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const cardTableVariants = cva('grid grow', {
  variants: {
    variant: {
      default: '',
      accent: 'rounded-xl bg-card',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const cardFooterVariants = cva('flex min-h-14 items-center px-5', {
  variants: {
    variant: {
      default: 'border-border border-t',
      accent: 'mt-[2px] rounded-b-xl bg-card',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

// Card Component
function Card({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>) {
  return (
    <CardContext.Provider value={{ variant: variant || 'default' }}>
      <div
        className={cn(cardVariants({ variant }), className)}
        data-slot="card"
        {...props}
      />
    </CardContext.Provider>
  );
}

// CardHeader Component
function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { variant } = useCardContext();
  return (
    <div
      className={cn(cardHeaderVariants({ variant }), className)}
      data-slot="card-header"
      {...props}
    />
  );
}

// CardContent Component
function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { variant } = useCardContext();
  return (
    <div
      className={cn(cardContentVariants({ variant }), className)}
      data-slot="card-content"
      {...props}
    />
  );
}

// CardTable Component
function CardTable({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { variant } = useCardContext();
  return (
    <div
      className={cn(cardTableVariants({ variant }), className)}
      data-slot="card-table"
      {...props}
    />
  );
}

// CardFooter Component
function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { variant } = useCardContext();
  return (
    <div
      className={cn(cardFooterVariants({ variant }), className)}
      data-slot="card-footer"
      {...props}
    />
  );
}

// Other Components
function CardHeading({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('space-y-1', className)}
      data-slot="card-heading"
      {...props}
    />
  );
}

function CardToolbar({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center gap-2.5', className)}
      data-slot="card-toolbar"
      {...props}
    />
  );
}

function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'font-semibold text-base leading-none tracking-tight',
        className,
      )}
      data-slot="card-title"
      {...props}
    />
  );
}

function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('text-muted-foreground text-sm', className)}
      data-slot="card-description"
      {...props}
    />
  );
}

// Exports
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTable,
  CardTitle,
  CardToolbar,
};
