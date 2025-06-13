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
          <span className="flex items-center gap-x-1 text-muted-foreground text-xs cursor-pointer hover:text-foreground hover:underline transition-colors duration-200 ease-out">
            <HelpCircle className="h-4 w-4" />
            Passkeys Cleaning Guide
          </span>
          <span className="sr-only">How to remove passkeys from devices</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Remove Passkeys from Your Devices</DialogTitle>
          <DialogDescription>
            After removing a passkey from your account, you should also remove
            it from your device's credential manager to prevent confusion.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Windows Hello */}
          <div>
            <h3 className="font-semibold text-sm">Windows Hello</h3>
            <ol className="mt-2 space-y-1 text-sm text-muted-foreground list-decimal list-inside">
              <li>Open Windows Settings</li>
              <li>Go to "Accounts" → "Sign-in options"</li>
              <li>Under "Passkeys", click "Manage passkeys"</li>
              <li>Find the passkey and click "Delete"</li>
            </ol>
          </div>

          <Separator />

          {/* macOS */}
          <div>
            <h3 className="font-semibold text-sm">macOS Safari/Keychain</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  macOS 15 (Sequoia) and later:
                </p>
                <ol className="mt-1 space-y-1 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Open the "Apple Passwords" app</li>
                  <li>Click on "Passkeys" in the sidebar</li>
                  <li>Find the passkey and click "Edit"</li>
                  <li>Click "Delete" to remove the passkey</li>
                </ol>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  macOS 14 and earlier:
                </p>
                <ol className="mt-1 space-y-1 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Open "System Settings" (or "System Preferences")</li>
                  <li>Go to "Passwords" in the sidebar</li>
                  <li>Enter your password or use Touch ID</li>
                  <li>Find the passkey and click "Edit"</li>
                  <li>Click "Delete Passkey" and confirm</li>
                </ol>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Alternative: Open Keychain Access → search for the website → look
              for "Secure Enclave" entries → right-click and select "Delete"
            </p>
          </div>

          <Separator />

          {/* iOS */}
          <div>
            <h3 className="font-semibold text-sm">iOS</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  iOS 18 and later:
                </p>
                <ol className="mt-1 space-y-1 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Open the "Apple Passwords" app</li>
                  <li>Tap on "Passkeys"</li>
                  <li>Find the passkey and tap on it</li>
                  <li>Tap "Edit" then "Delete"</li>
                </ol>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  iOS 17 and earlier:
                </p>
                <ol className="mt-1 space-y-1 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Open Settings app</li>
                  <li>Go to "Passwords"</li>
                  <li>Search for this website</li>
                  <li>Tap the entry and select "Delete Passkey"</li>
                </ol>
              </div>
            </div>
          </div>

          <Separator />

          {/* Android */}
          <div>
            <h3 className="font-semibold text-sm">Android</h3>
            <ol className="mt-2 space-y-1 text-sm text-muted-foreground list-decimal list-inside">
              <li>Open Chrome app</li>
              <li>Tap the 3-dot menu → "Settings"</li>
              <li>Go to "Password Manager" → "Passkeys"</li>
              <li>Find the passkey and tap "Delete"</li>
            </ol>
          </div>

          <Separator />

          {/* 1Password */}
          <div>
            <h3 className="font-semibold text-sm">1Password</h3>
            <ol className="mt-2 space-y-1 text-sm text-muted-foreground list-decimal list-inside">
              <li>Open 1Password app</li>
              <li>Search for this website</li>
              <li>Look for "Passkey" items</li>
              <li>Delete the passkey item</li>
            </ol>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Removing passkeys from your device won't
            affect other websites where you use passkeys. This only removes the
            credentials for this specific website.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
