import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@deepcrawl/ui/components/ui/card';
import { Skeleton } from '@deepcrawl/ui/components/ui/skeleton';
import { IconUser } from '@tabler/icons-react';
import {
  CalendarDays,
  Edit3,
  Key,
  Mail,
  Monitor,
  Smartphone,
  UserCheck,
  Users,
  Wifi,
} from 'lucide-react';

export function UserAvatarCardSkeleton() {
  return (
    <Card className="group/user-avatar-card">
      <CardHeader className="flex w-full justify-between">
        <div className="flex flex-col gap-1.5">
          <CardTitle className="flex items-center gap-2">
            <IconUser className="h-5 w-5" />
            User Profile
          </CardTitle>
          <CardDescription>Your account information and status</CardDescription>
        </div>
        <Skeleton className="h-5 w-5" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="size-20 rounded-full max-sm:size-16" />
          <div className="space-y-1">
            <Skeleton className="h-7 w-32" />
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <CalendarDays className="h-4 w-4" />
          <Skeleton className="h-4 w-28" />
        </div>
      </CardFooter>
    </Card>
  );
}

export function UserNameCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit3 className="h-5 w-5" />
          Display Name
        </CardTitle>
        <CardDescription>
          Please enter your full name, or a display name you are comfortable
          with.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-10" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex justify-end gap-2">
            <Skeleton className="h-9 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProvidersManagementCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Sign-in Methods
        </CardTitle>
        <CardDescription>
          Customize how you access your account. Link your Git profiles and set
          up passkeys for seamless, secure authentication.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider items skeleton */}
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            className="flex items-center justify-between rounded-lg border p-3"
            key={index}
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5" />
              <div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-1 h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-9 w-20" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function MultipleAccountsManagementCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Multiple Accounts
        </CardTitle>
        <CardDescription>
          Manage multiple accounts and switch between them seamlessly. Maximum 3
          accounts allowed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Account Section */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-medium text-sm">Current Account</h4>
          </div>
          <div className="rounded-lg border bg-background-subtle p-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-1 h-3 w-48" />
              </div>
            </div>
          </div>
        </div>

        {/* Other Accounts Section */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-24" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                className="flex items-center justify-between rounded-lg border p-3"
                key={index}
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="mt-1 h-3 w-40" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PasswordChangeCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Password Security
        </CardTitle>
        <CardDescription>
          Manage your password and security settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg p-3 max-sm:flex-col max-sm:gap-y-2">
          <div className="flex items-center gap-3 max-sm:hidden">
            <div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-1 h-3 w-40" />
            </div>
          </div>
          <Skeleton className="h-9 w-32 max-sm:w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SessionsManagementCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          Sessions
        </CardTitle>
        <CardDescription>
          Manage your active sessions and connected devices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Skeleton className="h-4 w-40" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              className="flex items-center justify-between rounded-lg border p-3 max-sm:flex-col max-sm:items-start max-sm:gap-y-2"
              key={index}
            >
              <div className="flex items-center gap-3 max-sm:w-full max-sm:justify-between">
                <div className="flex items-center gap-x-2">
                  {index === 0 ? (
                    <Monitor size={16} />
                  ) : (
                    <Smartphone size={16} />
                  )}
                  <div>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-1 h-3 w-28" />
                  </div>
                </div>
                <div className="flex flex-row-reverse items-center gap-x-2 max-sm:flex-col max-sm:items-end max-sm:gap-y-1">
                  {index === 0 && <Skeleton className="h-5 w-12" />}
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex items-center gap-x-2 max-sm:w-full max-sm:justify-end">
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
