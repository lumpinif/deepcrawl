'use client';

import { useAuthSession } from '@/hooks/auth.hooks';
import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { Button } from '@deepcrawl/ui/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@deepcrawl/ui/components/ui/card';
import { IconBrandGithub, IconBrandGoogle } from '@tabler/icons-react';
import { Link2, Loader2, Mail, Plus, Trash2 } from 'lucide-react';

export function ProvidersManagementCard() {
  const { data: session, isLoading } = useAuthSession();
  const user = session?.user;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Connected Accounts
          </CardTitle>
          <CardDescription>
            Manage your authentication methods and connected accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Connected Accounts
          </CardTitle>
          <CardDescription>No user data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-4 text-center text-muted-foreground">
            Unable to load user information
          </div>
        </CardContent>
      </Card>
    );
  }

  // Connected providers - in a real app, this would come from the session/user data
  const connectedProviders = [
    {
      id: 'email',
      name: 'Email',
      type: 'email',
      icon: Mail,
      connected: true,
      primary: true,
      email: user.email,
    },
    {
      id: 'github',
      name: 'GitHub',
      type: 'oauth',
      icon: IconBrandGithub,
      connected: false,
      primary: false,
    },
    {
      id: 'google',
      name: 'Google',
      type: 'oauth',
      icon: IconBrandGoogle,
      connected: false,
      primary: false,
    },
    // Add more providers as needed based on your Better Auth configuration
  ];

  const handleConnectProvider = async (providerId: string) => {
    // TODO: Implement provider connection with Better Auth
    console.log('Connecting provider:', providerId);
  };

  const handleDisconnectProvider = async (providerId: string) => {
    // TODO: Implement provider disconnection with Better Auth
    console.log('Disconnecting provider:', providerId);
  };

  const connectedCount = connectedProviders.filter((p) => p.connected).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Connected Accounts
        </CardTitle>
        <CardDescription>
          Manage your authentication methods and connected accounts (
          {connectedCount} connected)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectedProviders.map((provider) => {
          const IconComponent = provider.icon;

          return (
            <div
              key={provider.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <IconComponent className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{provider.name}</span>
                    {provider.primary && (
                      <Badge variant="default" className="text-xs">
                        Primary
                      </Badge>
                    )}
                    {provider.connected ? (
                      <Badge variant="outline" className="text-xs">
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Not Connected
                      </Badge>
                    )}
                  </div>
                  {provider.email && (
                    <div className="text-muted-foreground text-xs">
                      {provider.email}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {provider.connected ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDisconnectProvider(provider.id)}
                    disabled={provider.primary}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConnectProvider(provider.id)}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Connect
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        <div className="mt-6 rounded-lg bg-muted/50 p-3">
          <div className="text-muted-foreground text-sm">
            <strong>Security tip:</strong> Keep your authentication methods up
            to date and remove any accounts you no longer use. Your primary
            email cannot be disconnected.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
