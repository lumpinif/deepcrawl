import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto flex min-h-svh flex-col items-center justify-center max-sm:mt-2 max-sm:overflow-y-auto max-sm:p-4">
      {children}
    </div>
  );
}
