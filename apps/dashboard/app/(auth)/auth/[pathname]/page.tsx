import { AuthView } from '@/components/auth/view';
import { authViewPaths } from '@daveyplate/better-auth-ui/server';

export function generateStaticParams() {
  return Object.values(authViewPaths).map((pathname) => ({ pathname }));
}

export default async function AuthPage({
  params,
}: { params: Promise<{ pathname: string }> }) {
  const { pathname } = await params;

  return <AuthView pathname={pathname} />;
}
