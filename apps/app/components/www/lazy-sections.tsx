'use client';

import dynamic from 'next/dynamic';

const SectionSkeleton = ({ className = '' }: { className?: string }) => (
  <div
    className={`min-h-[52rem] w-full animate-pulse rounded-none border border-border/50 bg-background-subtle/60 ${className}`}
  />
);

const ValuePropSection = dynamic(
  () =>
    import('./sections/value-prop').then((mod) => ({
      default: mod.ValueProp,
    })),
  {
    loading: () => <SectionSkeleton />,
    ssr: false,
  },
);

const ToolkitSuiteSection = dynamic(
  () =>
    import('./sections/toolkit-suite').then((mod) => ({
      default: mod.ToolkitSuite,
    })),
  {
    loading: () => <SectionSkeleton />,
    ssr: false,
  },
);

const SurfacesSection = dynamic(
  () =>
    import('./sections/surfaces').then((mod) => ({
      default: mod.Surfaces,
    })),
  {
    loading: () => <SectionSkeleton />,
    ssr: false,
  },
);

export function LazySections() {
  return (
    <>
      <ValuePropSection />
      <ToolkitSuiteSection />
      <SurfacesSection />
    </>
  );
}
