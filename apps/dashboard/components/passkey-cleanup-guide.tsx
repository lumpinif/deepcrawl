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
          <HelpCircle className="h-4 w-4" />
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
          {/* Chrome */}
          <div>
            <h3 className="font-semibold text-sm flex items-center gap-2">
              Chrome
            </h3>
            <ol className="mt-2 space-y-1 text-sm text-muted-foreground list-decimal list-inside">
              <li>Open Chrome Settings (chrome://settings)</li>
              <li>Go to "Autofill and passwords" → "Password Manager"</li>
              <li>Click on "Passwords" in the left sidebar</li>
              <li>
                Find the passkey for this website and click the 3-dot menu
              </li>
              <li>Select "Delete" to remove the passkey</li>
            </ol>
          </div>

          <Separator />

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
            <ol className="mt-2 space-y-1 text-sm text-muted-foreground list-decimal list-inside">
              <li>Open "Keychain Access" app</li>
              <li>Search for this website's domain</li>
              <li>Look for "Secure Enclave" entries</li>
              <li>Right-click and select "Delete"</li>
            </ol>
            <p className="mt-2 text-xs text-muted-foreground">
              Alternatively: System Settings → Passwords → search for the
              website
            </p>
          </div>

          <Separator />

          {/* iOS */}
          <div>
            <h3 className="font-semibold text-sm">iOS</h3>
            <ol className="mt-2 space-y-1 text-sm text-muted-foreground list-decimal list-inside">
              <li>Open Settings app</li>
              <li>Go to "Passwords"</li>
              <li>Search for this website</li>
              <li>Tap the entry and select "Delete Passkey"</li>
            </ol>
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
