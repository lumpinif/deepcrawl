'use client';

import dynamic from 'next/dynamic';

// Skeleton for interactive components
const InteractiveSkeleton = () => <div className="size-full" />;

// Lazy load heavy-duty interactive components
export const LazyDottedWorldMap = dynamic(
  () => import('./dotted-map').then((mod) => ({ default: mod.DottedWorldMap })),
  {
    loading: () => <InteractiveSkeleton />,
    ssr: false,
  },
);

export const LazyGlobe = dynamic(
  () => import('./globe').then((mod) => ({ default: mod.Globe })),
  {
    loading: () => <InteractiveSkeleton />,
    ssr: false,
  },
);

export const LazyPyramidAnimation = dynamic(
  () => import('./ascii-pyramid').then((mod) => ({ default: mod.default })),
  {
    loading: () => <InteractiveSkeleton />,
    ssr: false,
  },
);

export const LazyOperationSelectorDemo = dynamic(
  () =>
    import('./operation-selector-demo').then((mod) => ({
      default: mod.OperationSelectorDemo,
    })),
  {
    loading: () => <InteractiveSkeleton />,
    ssr: false,
  },
);

export const LazyTiltedScroll = dynamic(
  () =>
    import('./tilted-scroll').then((mod) => ({ default: mod.TiltedScroll })),
  {
    loading: () => <InteractiveSkeleton />,
    ssr: false,
  },
);

export const LazyDisplayCards = dynamic(
  () => import('./display-cards').then((mod) => ({ default: mod.default })),
  {
    loading: () => <InteractiveSkeleton />,
    ssr: false,
  },
);
