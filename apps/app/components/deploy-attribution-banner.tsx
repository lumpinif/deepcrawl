'use client';

import {
  getApexDomainFromHostname,
  getApexDomainFromUrl,
  OFFICIAL_APP_URL,
} from '@deepcrawl/runtime/urls';
import { cn } from '@deepcrawl/ui/lib/utils';
import { IconX } from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect, useSyncExternalStore } from 'react';

// Versioned so we can safely change behavior/style in the future.
const DISMISS_KEY = 'deepcrawl.deployAttributionBanner.dismissed.v1';
const TOP_OFFSET_CSS_VAR = '--dc-top-banner-offset';
export const BANNER_HEIGHT_PX = 40;
const GITHUB_REPO_URL = 'https://github.com/lumpinif/deepcrawl';

const OFFICIAL_APEX_DOMAIN = getApexDomainFromUrl(OFFICIAL_APP_URL);

export type DeployAttributionBannerState = {
  canRender: boolean;
  isDismissed: boolean;
  isRendered: boolean;
};

const BANNER_STATE_EVENT = 'deepcrawl:deploy-attribution-banner:state';

type StoreListener = () => void;

const storeListeners = new Set<StoreListener>();
let storeState: DeployAttributionBannerState = {
  canRender: false,
  isDismissed: false,
  isRendered: false,
};
let stopStoreEffects: (() => void) | null = null;
const SERVER_SNAPSHOT: DeployAttributionBannerState = Object.freeze({
  canRender: false,
  isDismissed: false,
  isRendered: false,
});

function notifyStoreListeners(): void {
  for (const listener of storeListeners) {
    listener();
  }
}

function setStoreState(next: DeployAttributionBannerState): void {
  if (
    storeState.canRender === next.canRender &&
    storeState.isDismissed === next.isDismissed &&
    storeState.isRendered === next.isRendered
  ) {
    return;
  }

  storeState = next;
  notifyStoreListeners();
}

export function isBannerDismissed(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

export function dismissBanner(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(DISMISS_KEY, '1');
  } catch {
    // Ignore storage failures (Safari private mode, quota, etc.)
  }

  // Same-tab: localStorage writes don't trigger a `storage` event, so update
  // our store and dispatch a custom event for any non-store listeners.
  setStoreState({
    canRender: computeCanRenderBanner(),
    isDismissed: true,
    isRendered: false,
  });
  try {
    window.dispatchEvent(new CustomEvent(BANNER_STATE_EVENT));
  } catch {
    // Ignore
  }
}

function computeCanRenderBanner(): boolean {
  // if (process.env.NODE_ENV !== 'production') {
  //   return false;
  // }

  if (typeof window === 'undefined') {
    return false;
  }

  if (!OFFICIAL_APEX_DOMAIN) {
    return false;
  }

  const currentApex = getApexDomainFromHostname(window.location.hostname);
  if (!currentApex) {
    return false;
  }

  return currentApex !== OFFICIAL_APEX_DOMAIN;
}

function readClientState(): DeployAttributionBannerState {
  const canRender = computeCanRenderBanner();
  if (!canRender) {
    return {
      canRender: false,
      isDismissed: false,
      isRendered: false,
    };
  }

  const dismissed = isBannerDismissed();
  return {
    canRender,
    isDismissed: dismissed,
    isRendered: !dismissed,
  };
}

function refreshStoreFromClient(): void {
  if (typeof window === 'undefined') {
    return;
  }
  setStoreState(readClientState());
}

function subscribeToStore(listener: StoreListener): () => void {
  storeListeners.add(listener);

  if (storeListeners.size === 1 && typeof window !== 'undefined') {
    const onStorage = (event: StorageEvent) => {
      // `key === null` can happen for `localStorage.clear()`.
      if (event.key !== null && event.key !== DISMISS_KEY) {
        return;
      }
      refreshStoreFromClient();
    };

    const onCustom = () => {
      refreshStoreFromClient();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener(BANNER_STATE_EVENT, onCustom);

    stopStoreEffects = () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(BANNER_STATE_EVENT, onCustom);
      stopStoreEffects = null;
    };

    refreshStoreFromClient();
  }

  return () => {
    storeListeners.delete(listener);
    if (storeListeners.size === 0) {
      stopStoreEffects?.();
      setStoreState({
        canRender: false,
        isDismissed: false,
        isRendered: false,
      });
    }
  };
}

function getStoreSnapshot(): DeployAttributionBannerState {
  return storeState;
}

function getServerSnapshot(): DeployAttributionBannerState {
  // Must be referentially stable across calls, otherwise React can loop.
  return SERVER_SNAPSHOT;
}

export function useDeployAttributionBannerState(): DeployAttributionBannerState {
  return useSyncExternalStore(
    subscribeToStore,
    getStoreSnapshot,
    getServerSnapshot,
  );
}

export function useDeployAttributionBannerOffsetPx(options?: {
  assumeRendered?: boolean;
}): number {
  const { canRender, isDismissed, isRendered } =
    useDeployAttributionBannerState();
  if (!canRender) {
    return 0;
  }

  const assumeRendered = options?.assumeRendered ?? false;
  if (assumeRendered) {
    return isDismissed ? 0 : BANNER_HEIGHT_PX;
  }
  return isRendered ? BANNER_HEIGHT_PX : 0;
}

export function useDeployAttributionBanner(options?: {
  assumeRendered?: boolean;
}): DeployAttributionBannerState & { offsetPx: number } {
  const state = useDeployAttributionBannerState();
  const assumeRendered = options?.assumeRendered ?? false;

  if (!state.canRender) {
    return { ...state, offsetPx: 0 };
  }

  const offsetPx = assumeRendered
    ? state.isDismissed
      ? 0
      : BANNER_HEIGHT_PX
    : state.isRendered
      ? BANNER_HEIGHT_PX
      : 0;

  return { ...state, offsetPx };
}

export function DeployAttributionBanner({ className }: { className?: string }) {
  const { isRendered } = useDeployAttributionBannerState();

  useEffect(() => {
    // Offset fixed headers (notably the header-mode logo) when the banner is
    // visible, without needing per-layout changes.
    try {
      document.documentElement.style.setProperty(
        TOP_OFFSET_CSS_VAR,
        isRendered ? `${BANNER_HEIGHT_PX}px` : '0px',
      );
    } catch {
      // Ignore
    }

    return () => {
      try {
        document.documentElement.style.removeProperty(TOP_OFFSET_CSS_VAR);
      } catch {
        // Ignore
      }
    };
  }, [isRendered]);

  if (!isRendered) {
    return null;
  }

  return (
    <div
      className={cn(
        'relative w-full border-border border-b bg-background backdrop-blur',
        'supports-backdrop-filter:bg-background/60',
        className,
      )}
    >
      <div className="flex h-10 w-full items-center justify-center gap-3 px-4">
        <div className="flex min-w-0 items-center gap-2 text-muted-foreground text-xs sm:text-sm">
          <span className="truncate">
            This app is maybe deployed with{' '}
            <code className="rounded-sm bg-muted px-2 py-1 font-mono font-semibold text-foreground text-xs">
              npm create deepcrawl@latest
            </code>
          </span>
          <span className="text-muted-foreground/50">·</span>
          <Link
            className="shrink-0 font-medium text-foreground/90 hover:text-foreground hover:underline"
            href={GITHUB_REPO_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            GitHub
          </Link>
          <span className="text-muted-foreground/50">·</span>
          <Link
            className="shrink-0 font-medium text-foreground/90 hover:text-foreground hover:underline"
            href={OFFICIAL_APP_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            deepcrawl.dev is free and open source.
          </Link>
        </div>

        <button
          aria-label="Dismiss banner"
          className={cn(
            'absolute right-4 inline-flex size-7 items-center justify-center rounded-md',
            'text-muted-foreground hover:bg-accent hover:text-foreground',
          )}
          onClick={() => {
            dismissBanner();
            try {
              document.documentElement.style.setProperty(
                TOP_OFFSET_CSS_VAR,
                '0px',
              );
            } catch {
              // Ignore
            }
          }}
          title="Dismiss banner"
          type="button"
        >
          <IconX className="size-4" />
        </button>
      </div>
    </div>
  );
}
