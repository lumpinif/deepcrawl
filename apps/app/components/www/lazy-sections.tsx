'use client';

import dynamic from 'next/dynamic';

const SectionSkeleton = ({ className = '' }: { className?: string }) => (
  <div
    className={`w-full animate-pulse rounded-3xl border border-border/50 bg-background-subtle/60 ${className}`}
  />
);

const ValuePropSection = dynamic(
  () =>
    import('./sections/value-prop').then((mod) => ({
      default: mod.ValueProp,
    })),
  {
    loading: () => <SectionSkeleton className="min-h-[32rem]" />,
    ssr: false,
  },
);

const ToolkitSuiteSection = dynamic(
  () =>
    import('./sections/toolkit-suite').then((mod) => ({
      default: mod.ToolkitSuite,
    })),
  {
    loading: () => <SectionSkeleton className="min-h-[28rem]" />,
    ssr: false,
  },
);

const SurfacesSection = dynamic(
  () =>
    import('./sections/surfaces').then((mod) => ({
      default: mod.Surfaces,
    })),
  {
    loading: () => <SectionSkeleton className="min-h-[28rem]" />,
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
