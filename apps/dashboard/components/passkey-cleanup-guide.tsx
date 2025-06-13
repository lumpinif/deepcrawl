'use client';

import { Button } from '@deepcrawl/ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@deepcrawl/ui/components/ui/dialog';
import { Separator } from '@deepcrawl/ui/components/ui/separator';
import { HelpCircle } from 'lucide-react';

export function PasskeyCleanupGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-auto p-1">
          <span className="flex cursor-pointer items-center gap-x-1 text-muted-foreground text-xs transition-colors duration-200 ease-out hover:text-foreground hover:underline">
            <HelpCircle className="h-4 w-4" />
            Passkeys Cleaning Guide
          </span>
          <span className="sr-only">How to remove passkeys from devices</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Remove Passkeys from Your Devices</DialogTitle>
          <DialogDescription>
            After removing a passkey from your account, you should also remove
            it from your device&apos;s credential manager to prevent confusion.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Windows Hello */}
          <div>
            <h3 className="font-semibold text-sm">Windows Hello</h3>
            <ol className="mt-2 list-inside list-decimal space-y-1 text-muted-foreground text-sm">
              <li>Open Windows Settings</li>
              <li>
                Go to &ldquo;Accounts&rdquo; → &ldquo;Sign-in options&rdquo;
              </li>
              <li>
                Under &ldquo;Passkeys&rdquo;, click &ldquo;Manage
                passkeys&rdquo;
              </li>
              <li>Find the passkey and click &ldquo;Delete&rdquo;</li>
            </ol>
          </div>

          <Separator />

          {/* macOS */}
          <div>
            <h3 className="font-semibold text-sm">macOS Safari/Keychain</h3>
            <div className="space-y-3">
              <div>
                <p className="mb-1 font-medium text-muted-foreground text-xs">
                  macOS 15 (Sequoia) and later:
                </p>
                <ol className="mt-1 list-inside list-decimal space-y-1 text-muted-foreground text-sm">
                  <li>Open the &ldquo;Apple Passwords&rdquo; app</li>
                  <li>Click on &ldquo;Passkeys&rdquo; in the sidebar</li>
                  <li>Find the passkey and click &ldquo;Edit&rdquo;</li>
                  <li>Click &ldquo;Delete&rdquo; to remove the passkey</li>
                </ol>
              </div>
              <div>
                <p className="mb-1 font-medium text-muted-foreground text-xs">
                  macOS 14 and earlier:
                </p>
                <ol className="mt-1 list-inside list-decimal space-y-1 text-muted-foreground text-sm">
                  <li>
                    Open &ldquo;System Settings&rdquo; (or &ldquo;System
                    Preferences&rdquo;)
                  </li>
                  <li>Go to &ldquo;Passwords&rdquo; in the sidebar</li>
                  <li>Enter your password or use Touch ID</li>
                  <li>Find the passkey and click &ldquo;Edit&rdquo;</li>
                  <li>Click &ldquo;Delete Passkey&rdquo; and confirm</li>
                </ol>
              </div>
            </div>
            <p className="mt-2 text-muted-foreground text-xs">
              Alternative: Open Keychain Access → search for the website → look
              for &ldquo;Secure Enclave&rdquo; entries → right-click and select
              &ldquo;Delete&rdquo;
            </p>
          </div>

          <Separator />

          {/* iOS */}
          <div>
            <h3 className="font-semibold text-sm">iOS</h3>
            <div className="space-y-3">
              <div>
                <p className="mb-1 font-medium text-muted-foreground text-xs">
                  iOS 18 and later:
                </p>
                <ol className="mt-1 list-inside list-decimal space-y-1 text-muted-foreground text-sm">
                  <li>Open the &ldquo;Apple Passwords&rdquo; app</li>
                  <li>Tap on &ldquo;Passkeys&rdquo;</li>
                  <li>Find the passkey and tap on it</li>
                  <li>Tap &ldquo;Edit&rdquo; then &ldquo;Delete&rdquo;</li>
                </ol>
              </div>
              <div>
                <p className="mb-1 font-medium text-muted-foreground text-xs">
                  iOS 17 and earlier:
                </p>
                <ol className="mt-1 list-inside list-decimal space-y-1 text-muted-foreground text-sm">
                  <li>Open Settings app</li>
                  <li>Go to &ldquo;Passwords&rdquo;</li>
                  <li>Search for this website</li>
                  <li>Tap the entry and select &ldquo;Delete Passkey&rdquo;</li>
                </ol>
              </div>
            </div>
          </div>

          <Separator />

          {/* Android */}
          <div>
            <h3 className="font-semibold text-sm">Android</h3>
            <ol className="mt-2 list-inside list-decimal space-y-1 text-muted-foreground text-sm">
              <li>Open Chrome app</li>
              <li>Tap the 3-dot menu → &ldquo;Settings&rdquo;</li>
              <li>
                Go to &ldquo;Password Manager&rdquo; → &ldquo;Passkeys&rdquo;
              </li>
              <li>Find the passkey and tap &ldquo;Delete&rdquo;</li>
            </ol>
          </div>

          <Separator />

          {/* 1Password */}
          <div>
            <h3 className="font-semibold text-sm">1Password</h3>
            <ol className="mt-2 list-inside list-decimal space-y-1 text-muted-foreground text-sm">
              <li>Open 1Password app</li>
              <li>Search for this website</li>
              <li>Look for &ldquo;Passkey&rdquo; items</li>
              <li>Delete the passkey item</li>
            </ol>
          </div>
        </div>

        <div className="mt-6 rounded-lg bg-muted/50 p-4">
          <p className="text-muted-foreground text-sm">
            <strong>Note:</strong> Removing passkeys from your device won&apos;t
            affect other websites where you use passkeys. This only removes the
            credentials for this specific website.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
