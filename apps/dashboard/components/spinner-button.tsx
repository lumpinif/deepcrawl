'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useMemo } from 'react';

import { cn } from '@deepcrawl/ui/lib/utils';

import { Button, type ButtonProps } from '@deepcrawl/ui/components/ui/button';
import { LoadingSpinner } from './loading-spinner';

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

type SpinnerButtonProps = ButtonProps & {
  className?: string;
  isLoading?: boolean;
  withSuccess?: boolean;
  motionClassName?: string;
  children?: React.ReactNode;
  loadingElement?: React.ReactNode;
  successElement?: React.ReactNode;
  buttonVariant?: ButtonProps['variant'];
  buttonState?: ButtonState;
  setButtonState?: React.Dispatch<React.SetStateAction<ButtonState>>;
  errorElement?: React.ReactNode;
};

const MOTION_CONFIG = {
  type: 'spring' as const,
  duration: 0.48,
  bounce: 0,
};

const MOTION_VARIANTS = {
  initial: { opacity: 0, y: 45 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -45 },
};

export const SpinnerButton: React.FC<SpinnerButtonProps> = ({
  children,
  isLoading = false,
  className,
  withSuccess = false,
  buttonState,
  errorElement,
  buttonVariant = 'default',
  loadingElement,
  successElement,
  motionClassName,
  ...props
}) => {
  //TODO: INFERING THE STATE FROM ISLOADING AND WITHSUCCESS
  // Determine the current state based on props
  const currentState: ButtonState = useMemo(() => {
    if (withSuccess && buttonState) {
      return buttonState;
    }
    return isLoading ? 'loading' : 'idle';
  }, [withSuccess, buttonState, isLoading]);

  // Memoize button content to prevent unnecessary re-renders
  const buttonContent = useMemo(() => {
    const contentMap: Record<ButtonState, React.ReactNode> = {
      idle: children,
      loading: loadingElement ?? <LoadingSpinner size={16} />,
      success: successElement,
      error: errorElement,
    };
    return contentMap[currentState];
  }, [currentState, children, loadingElement, successElement, errorElement]);

  // Memoize variant calculation
  const variant = useMemo(() => {
    if (!withSuccess || !buttonState) return buttonVariant;

    switch (buttonState) {
      case 'success':
        return 'success';
      case 'error':
        return 'destructive';
      default:
        return buttonVariant;
    }
  }, [withSuccess, buttonState, buttonVariant]);

  // Memoize className calculation
  const buttonClassName = useMemo(() => {
    const baseClasses = 'relative select-none overflow-hidden';
    const successClasses = !loadingElement
      ? ''
      : currentState === 'success'
        ? 'disabled:bg-current dark:disabled:bg-inherit'
        : '';

    return cn(baseClasses, className, withSuccess && successClasses);
  }, [className, loadingElement, currentState, withSuccess]);

  // Memoize motion span className
  const motionSpanClassName = useMemo(() => {
    const baseClasses =
      'flex w-full items-center justify-center gap-x-2 text-nowrap';
    const loadingClasses =
      currentState === 'loading' && loadingElement ? 'text-primary' : '';

    return cn(baseClasses, motionClassName, loadingClasses);
  }, [motionClassName, currentState, loadingElement]);

  const isDisabled = currentState === 'loading';

  return (
    <Button
      variant={variant}
      className={buttonClassName}
      disabled={isDisabled}
      {...props}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={currentState}
          transition={MOTION_CONFIG}
          exit={MOTION_VARIANTS.exit}
          className={motionSpanClassName}
          initial={MOTION_VARIANTS.initial}
          animate={MOTION_VARIANTS.animate}
        >
          {buttonContent}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
};
