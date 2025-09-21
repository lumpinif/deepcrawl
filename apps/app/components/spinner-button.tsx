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

const MOTION_CONFIG = {
  type: 'spring' as const,
  duration: 0.48,
  bounce: 0,
};

const DEFAULT_SUCCESS_DURATION = 1600;

const MOTION_VARIANTS = {
  initial: { opacity: 0, y: 45 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -45 },
};

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
  const withSuccess = Boolean(successElement);

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

  useEffect(() => () => clearSuccessTimer(), [clearSuccessTimer]);

  useEffect(() => {
    if (buttonState === 'success' || buttonState === 'error') {
      clearSuccessTimer();
      updateState(buttonState);
    }
  }, [buttonState, clearSuccessTimer, updateState]);

  useEffect(() => {
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

  const currentState: ButtonState = useMemo(() => {
    if (buttonState && buttonState !== 'idle') {
      return buttonState;
    }

    return internalState;
  }, [buttonState, internalState]);

  const buttonContent = useMemo(() => {
    const contentMap: Record<ButtonState, React.ReactNode> = {
      idle: children,
      loading: loadingElement ?? <LoadingSpinner size={16} />,
      success: successElement ?? children,
      error: errorElement ?? children,
    };
    return contentMap[currentState];
  }, [children, currentState, errorElement, loadingElement, successElement]);

  const variant = useMemo(() => {
    if (!(withSuccess && currentState !== 'idle')) {
      return buttonVariant;
    }

    switch (currentState) {
      case 'success':
        return buttonVariant || 'success';
      case 'error':
        return 'destructive';
      default:
        return buttonVariant;
    }
  }, [buttonVariant, currentState, withSuccess]);

  const buttonClassName = useMemo(() => {
    const baseClasses = 'relative select-none overflow-hidden';
    const successDisabledClasses =
      withSuccess && currentState === 'success' && loadingElement
        ? 'disabled:bg-current dark:disabled:bg-inherit'
        : '';

    return cn(baseClasses, className, successDisabledClasses);
  }, [className, currentState, withSuccess, loadingElement]);

  const motionSpanClassName = useMemo(() => {
    const baseClasses =
      'flex w-full items-center justify-center gap-x-2 text-nowrap';
    const loadingClasses =
      currentState === 'loading' && loadingElement ? 'text-primary' : '';

    return cn(baseClasses, motionClassName, loadingClasses);
  }, [currentState, loadingElement, motionClassName]);

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
