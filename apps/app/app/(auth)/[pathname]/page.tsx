import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import { AuthCard } from '@/components/auth/auth-card';
import { BackButton } from '@/components/auth/back-button';
import { isBetterAuthMode } from '@/lib/auth-mode';
import { authViewSegments } from '@/routes/auth';
import { isValidAuthRoute } from '@/utils';

export function generateStaticParams() {
  return Object.values(authViewSegments).map((pathname) => ({ pathname }));
}

export default function AuthPage({
  params,
}: {
  params: Promise<{ pathname: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <AuthPageContent paramsPromise={params} />
    </Suspense>
  );
}

async function AuthPageContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ pathname: string }>;
}) {
  const { pathname } = await paramsPromise;

  if (!isBetterAuthMode()) {
    redirect('/app');
  }

  if (!isValidAuthRoute(authViewSegments, pathname)) {
    notFound();
  }

  return (
    <>
      <AuthCard pathname={pathname} />
      <BackButton />
      <div className="block py-12 text-center text-muted-foreground text-sm sm:fixed sm:right-0 sm:bottom-0 sm:left-0 dark:text-muted-foreground/80">
        <a
          className="hover:underline"
          href="/terms-of-service"
          rel="noopener noreferrer"
          target="_blank"
        >
          Terms of Service
        </a>
        <span className="mx-2">|</span>
        <a
          className="hover:underline"
          href="/privacy"
          rel="noopener noreferrer"
          target="_blank"
        >
          Privacy Policy
        </a>
      </div>
    </>
  );
}
