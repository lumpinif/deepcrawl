import { AuthCard } from '@/components/auth/auth-card';
import { authViewRoutes } from '@/routes/auth';
import { isValidAuthRoute } from '@/utils';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return Object.values(authViewRoutes).map((pathname) => ({ pathname }));
}

export default async function AuthPage({
  params,
}: { params: Promise<{ pathname: string }> }) {
  const { pathname } = await params;

  // Validate the pathname before rendering
  if (!isValidAuthRoute(authViewRoutes, pathname)) {
    notFound();
  }

  return <AuthCard pathname={pathname} />;
}
