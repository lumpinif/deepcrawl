import { GalleryVerticalEnd } from 'lucide-react';
import Link from 'next/link';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-y-2">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <span className="font-bold text-2xl">Sign In</span>
          <Link
            href="/"
            className="flex items-center gap-2 self-center font-medium"
          >
            DeepCrawl Dashboard
          </Link>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
