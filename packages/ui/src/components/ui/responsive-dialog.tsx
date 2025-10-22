'use client';

import * as React from 'react';
import { useMediaQuery } from '@deepcrawl/ui/hooks/use-media-query';
import { cn } from '@deepcrawl/ui/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@deepcrawl/ui/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@deepcrawl/ui/components/ui/drawer';

interface ResponsiveDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface ResponsiveDialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveDialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveDialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveDialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveDialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveDialogCloseProps {
  children: React.ReactElement;
}

const ResponsiveDialogContext = React.createContext<{
  isDesktop: boolean;
} | null>(null);

function useResponsiveDialog() {
  const context = React.useContext(ResponsiveDialogContext);
  if (!context) {
    throw new Error(
      'useResponsiveDialog must be used within ResponsiveDialog',
    );
  }
  return context;
}

function ResponsiveDialog({
  children,
  open,
  onOpenChange,
}: ResponsiveDialogProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <ResponsiveDialogContext.Provider value={{ isDesktop }}>
        <Dialog open={open} onOpenChange={onOpenChange}>
          {children}
        </Dialog>
      </ResponsiveDialogContext.Provider>
    );
  }

  return (
    <ResponsiveDialogContext.Provider value={{ isDesktop }}>
      <Drawer open={open} onOpenChange={onOpenChange}>
        {children}
      </Drawer>
    </ResponsiveDialogContext.Provider>
  );
}

function ResponsiveDialogContent({
  children,
  className,
}: ResponsiveDialogContentProps) {
  const { isDesktop } = useResponsiveDialog();

  const defaultCN = 'max-md:px-8 max-md:pb-8 md:max-w-2xl xl:max-w-4xl' as const;

  if (isDesktop) {
    return <DialogContent className={cn(defaultCN, className)}>{children}</DialogContent>;
  }

  return <DrawerContent className={cn(defaultCN, className)}>{children}</DrawerContent>;
}

function ResponsiveDialogHeader({
  children,
  className,
}: ResponsiveDialogHeaderProps) {
  const { isDesktop } = useResponsiveDialog();

  if (isDesktop) {
    return <DialogHeader className={className}>{children}</DialogHeader>;
  }

  return (
    <DrawerHeader className={className ?? 'text-left'}>{children}</DrawerHeader>
  );
}

function ResponsiveDialogTitle({
  children,
  className,
}: ResponsiveDialogTitleProps) {
  const { isDesktop } = useResponsiveDialog();

  if (isDesktop) {
    return <DialogTitle className={className}>{children}</DialogTitle>;
  }

  return <DrawerTitle className={className}>{children}</DrawerTitle>;
}

function ResponsiveDialogDescription({
  children,
  className,
}: ResponsiveDialogDescriptionProps) {
  const { isDesktop } = useResponsiveDialog();

  if (isDesktop) {
    return <DialogDescription className={className}>{children}</DialogDescription>;
  }

  return <DrawerDescription className={className}>{children}</DrawerDescription>;
}

function ResponsiveDialogFooter({
  children,
  className,
}: ResponsiveDialogFooterProps) {
  const { isDesktop } = useResponsiveDialog();

  if (isDesktop) {
    return <DialogFooter className={className}>{children}</DialogFooter>;
  }

  return (
    <DrawerFooter className={className ?? 'pt-2'}>
      {children}
    </DrawerFooter>
  );
}

function ResponsiveDialogClose({ children }: ResponsiveDialogCloseProps) {
  const { isDesktop } = useResponsiveDialog();

  if (isDesktop) {
    return children;
  }

  return <DrawerClose asChild>{children}</DrawerClose>;
}

export {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogClose,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
};
