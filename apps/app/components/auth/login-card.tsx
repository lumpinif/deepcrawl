import GithubIcon from '@deepcrawl/ui/components/icons/github-icon';
import { Button } from '@deepcrawl/ui/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@deepcrawl/ui/components/ui/card';
import { Input } from '@deepcrawl/ui/components/ui/input';
import { Label } from '@deepcrawl/ui/components/ui/label';
import { cn } from '@deepcrawl/ui/lib/utils';
import Link from 'next/link';
import { SpinnerButton } from '@/components/spinner-button';
import { PasswordInput } from './password-input';

export function LoginCard({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your Github or Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full">
                  <GithubIcon />
                  Login with Github
                </Button>
                <Button variant="outline" className="w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Login with Google
                </Button>
              </div>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
                <span className="relative z-10 bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="your@email.com"
                    suppressHydrationWarning={true}
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <PasswordInput
                    required
                    id="password"
                    type="password"
                    suppressHydrationWarning={true}
                  />
                </div>
                <SpinnerButton type="submit" className="w-full">
                  Login
                </SpinnerButton>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/sign-up" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-muted-foreground text-xs *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary">
        By clicking continue, you agree to our{' '}
        <Link href="/terms-of-service">Terms of Service</Link> and{' '}
        <Link href="/privacy-policy">Privacy Policy</Link>.
      </div>
    </div>
  );
}
