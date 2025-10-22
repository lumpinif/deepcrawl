'use client';

import dynamic from 'next/dynamic';
import { PlaygroundSkeleton } from './playground-skeleton';

// Lazy load playground input component with skeleton loading state
const PlaygroundOperationClientContent = dynamic(
  () =>
    import('./playground-operation-client').then((mod) => ({
      default: mod.PlaygroundOperationClientContent,
    })),
  {
    loading: () => <PlaygroundSkeleton />,
    ssr: false,
  },
);

// Lazy load response area (renders null until data is available)
const PGResponseArea = dynamic(
  () =>
    import('./response-area/pg-response-area').then((mod) => ({
      default: mod.PGResponseArea,
    })),
  {
    loading: () => null,
    ssr: false,
  },
);

export function LazyPlayground() {
  return (
    <>
      <PlaygroundOperationClientContent />
      <PGResponseArea />
    </>
  );
}
