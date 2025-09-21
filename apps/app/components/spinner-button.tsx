'use client';

import { Button, type ButtonProps } from '@deepcrawl/ui/components/ui/button';
import { cn } from '@deepcrawl/ui/lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LoadingSpinner } from './loading-spinner';

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

type SpinnerButtonProps = ButtonProps & {
  className?: string;
  isLoading?: boolean;
  motionClassName?: string;
  children?: React.ReactNode;
  loadingElement?: React.ReactNode;
  successElement?: React.ReactNode;
  buttonVariant?: ButtonProps['variant'];
  buttonState?: ButtonState;
  setButtonState?: React.Dispatch<React.SetStateAction<ButtonState>>;
  errorElement?: React.ReactNode;
  successDuration?: number;
};

// Static constants moved outside component to prevent recreation
const MOTION_CONFIG = {
  type: 'spring' as const,
  duration: 0.48,
  bounce: 0,
} as const;

const DEFAULT_SUCCESS_DURATION = 1600;

const MOTION_VARIANTS = {
  initial: { opacity: 0, y: 45 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -45 },
} as const;

const BASE_BUTTON_CLASSES = 'relative select-none overflow-hidden';
const BASE_MOTION_CLASSES =
  'flex w-full items-center justify-center gap-x-2 text-nowrap';

/* SOCIAL: SHARE HOW I CREATED THIS COMPONENT */

export const SpinnerButton: React.FC<SpinnerButtonProps> = ({
  children,
  isLoading = false,
  className,
  buttonState,
  errorElement,
  buttonVariant = 'default',
  loadingElement,
  successElement,
  motionClassName,
  setButtonState,
  successDuration = DEFAULT_SUCCESS_DURATION,
  ...props
}) => {
  // Memoize expensive computations early
  const withSuccess = useMemo(() => Boolean(successElement), [successElement]);

  // Keep original state management for reliability
  const [internalState, setInternalState] = useState<ButtonState>('idle');
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevIsLoadingRef = useRef(isLoading);

  const clearSuccessTimer = useCallback(() => {
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
  }, []);

  const updateState = useCallback(
    (next: ButtonState) => {
      setInternalState((prev) => {
        if (prev === next) {
          return prev;
        }
        setButtonState?.(next);
        return next;
      });
    },
    [setButtonState],
  );

  // Cleanup timer on unmount
  useEffect(() => clearSuccessTimer, [clearSuccessTimer]);

  // Handle external buttonState changes
  useEffect(() => {
    if (buttonState === 'success' || buttonState === 'error') {
      clearSuccessTimer();
      updateState(buttonState);
    }
  }, [buttonState, clearSuccessTimer, updateState]);

  // Handle loading state changes - optimized with early returns
  useEffect(() => {
    // Skip processing if external state controls the button
    if (buttonState === 'success' || buttonState === 'error') {
      prevIsLoadingRef.current = isLoading;
      return;
    }

    if (isLoading) {
      clearSuccessTimer();
      updateState('loading');
    } else if (withSuccess && prevIsLoadingRef.current) {
      clearSuccessTimer();
      updateState('success');

      if (successDuration > 0) {
        successTimerRef.current = setTimeout(() => {
          updateState('idle');
          successTimerRef.current = null;
        }, successDuration);
      }
    } else {
      updateState('idle');
    }

    prevIsLoadingRef.current = isLoading;
  }, [
    buttonState,
    clearSuccessTimer,
    isLoading,
    successDuration,
    updateState,
    withSuccess,
  ]);

  // Current state computation - preserve original logic
  const currentState: ButtonState = useMemo(() => {
    if (buttonState && buttonState !== 'idle') {
      return buttonState;
    }
    return internalState;
  }, [buttonState, internalState]);

  // Optimized button content computation - avoid object recreation
  const buttonContent = useMemo(() => {
    switch (currentState) {
      case 'loading':
        return loadingElement ?? <LoadingSpinner size={16} />;
      case 'success':
        return successElement ?? children;
      case 'error':
        return errorElement ?? children;
      default:
        return children;
    }
  }, [currentState, children, errorElement, loadingElement, successElement]);

  // Optimized variant computation with early returns
  const variant = useMemo(() => {
    if (!withSuccess || currentState === 'idle') {
      return buttonVariant;
    }

    if (currentState === 'success') {
      return buttonVariant || 'success';
    }

    if (currentState === 'error') {
      return 'destructive';
    }

    return buttonVariant;
  }, [buttonVariant, currentState, withSuccess]);

  // Split className computations for better performance
  const successDisabledClasses = useMemo(() => {
    return withSuccess && currentState === 'success' && loadingElement
      ? 'disabled:bg-current dark:disabled:bg-inherit'
      : '';
  }, [withSuccess, currentState, loadingElement]);

  const buttonClassName = useMemo(() => {
    return cn(BASE_BUTTON_CLASSES, className, successDisabledClasses);
  }, [className, successDisabledClasses]);

  // Optimized motion classes
  const loadingTextClasses = useMemo(() => {
    return currentState === 'loading' && loadingElement ? 'text-primary' : '';
  }, [currentState, loadingElement]);

  const motionSpanClassName = useMemo(() => {
    return cn(BASE_MOTION_CLASSES, motionClassName, loadingTextClasses);
  }, [motionClassName, loadingTextClasses]);

  const isDisabled = currentState === 'loading';

  return (
    <Button
      className={buttonClassName}
      disabled={isDisabled}
      variant={variant}
      {...props}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          animate={MOTION_VARIANTS.animate}
          className={motionSpanClassName}
          exit={MOTION_VARIANTS.exit}
          initial={MOTION_VARIANTS.initial}
          key={currentState}
          transition={MOTION_CONFIG}
        >
          {buttonContent}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
};
