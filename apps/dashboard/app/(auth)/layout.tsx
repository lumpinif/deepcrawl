import type { ReactNode } from 'react';

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <div className="flex h-svh max-h-svh flex-1 flex-col overflow-hidden">
        <div className="container mx-auto flex flex-1 flex-col items-center justify-center">
          {children}
        </div>
      </div>
    </>
  );
}
