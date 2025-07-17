import { notFound } from 'next/navigation';
import { AuthCard } from '@/components/auth/auth-card';
import { authViewRoutes } from '@/routes/auth';
import { isValidAuthRoute } from '@/utils';

export function generateStaticParams() {
  return Object.values(authViewRoutes).map((pathname) => ({ pathname }));
}

export default async function AuthPage({
  params,
}: {
  params: Promise<{ pathname: string }>;
}) {
  const { pathname } = await params;

  // Validate the pathname before rendering
  if (!isValidAuthRoute(authViewRoutes, pathname)) {
    notFound();
  }

  return (
    <>
      <AuthCard pathname={pathname} />
      <div className="block py-12 text-center text-muted-foreground text-sm sm:fixed sm:right-0 sm:bottom-0 sm:left-0 dark:text-muted-foreground/80">
        <a
          target="_blank"
          href="/terms-of-service"
          className="hover:underline"
          rel="noopener noreferrer"
        >
          Terms of Service
        </a>
        <span className="mx-2">|</span>
        <a
          target="_blank"
          href="/privacy"
          className="hover:underline"
          rel="noopener noreferrer"
        >
          Privacy Policy
        </a>
      </div>
    </>
  );
}
