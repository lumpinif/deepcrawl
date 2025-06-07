import { SignInButton, SignInFallback } from '@/components/auth/sign-in-btn';
import { Suspense } from 'react';

export default async function Home() {
  const features = [
    'Email & Password',
    'Organization | Teams',
    'Passkeys',
    'Multi Factor',
    'Password Reset',
    'Email Verification',
    'Roles & Permissions',
    'Rate Limiting',
    'Session Management',
  ];
  return (
    <div className="no-visible-scrollbar flex min-h-[80vh] items-center justify-center overflow-hidden px-6 md:px-0">
      <main className="row-start-2 flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-center font-bold text-4xl text-black dark:text-white">
            Better Auth.
          </h3>
          <p className="break-words text-center text-sm md:text-base">
            Official demo to showcase{' '}
            <a
              href="https://better-auth.com"
              target="_blank"
              className="italic underline"
            >
              better-auth.
            </a>{' '}
            features and capabilities. <br />
          </p>
        </div>
        <div className="flex w-full flex-col gap-4 md:w-10/12">
          <div className="flex flex-col flex-wrap gap-3 pt-2">
            <div className="border-y border-dotted bg-secondary/60 py-2 opacity-80">
              <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs ">
                <span className="text-center">
                  All features on this demo are implemented with Better Auth
                  without any custom backend code
                </span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {features.map((feature) => (
                <span
                  className="flex cursor-pointer items-center gap-1 border-b pb-1 text-muted-foreground text-xs transition-all duration-150 ease-in-out hover:border-foreground hover:text-foreground"
                  key={feature}
                >
                  {feature}.
                </span>
              ))}
            </div>
          </div>
          <Suspense fallback={<SignInFallback />}>
            <SignInButton />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
