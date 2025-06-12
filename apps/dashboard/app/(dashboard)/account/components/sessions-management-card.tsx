'use client';

import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { Button } from '@deepcrawl/ui/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@deepcrawl/ui/components/ui/card';
import { Separator } from '@deepcrawl/ui/components/ui/separator';
import { Monitor, Smartphone, Tablet, Trash2, Wifi } from 'lucide-react';

// Define types for the different session API responses
type ActiveSession = {
  id: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  expiresAt: Date;
};

type DeviceSession =
  | {
      session: ActiveSession;
      user?: {
        id: string;
        name?: string;
        email: string;
      };
    }
  | ActiveSession; // Can be either format based on Better Auth API

interface SessionsManagementCardProps {
  activeSessions: ActiveSession[];
  deviceSessions: DeviceSession[];
}

export function SessionsManagementCard({
  activeSessions,
  deviceSessions,
}: SessionsManagementCardProps) {
  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return Monitor;

    const ua = userAgent.toLowerCase();
    if (
      ua.includes('mobile') ||
      ua.includes('android') ||
      ua.includes('iphone')
    ) {
      return Smartphone;
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return Tablet;
    }
    return Monitor;
  };

  const getDeviceInfo = (userAgent?: string) => {
    if (!userAgent) return 'Unknown Device';

    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome')) return 'Chrome Browser';
    if (ua.includes('firefox')) return 'Firefox Browser';
    if (ua.includes('safari')) return 'Safari Browser';
    if (ua.includes('edge')) return 'Edge Browser';

    if (ua.includes('mobile')) return 'Mobile Device';
    if (ua.includes('tablet')) return 'Tablet';

    return 'Desktop Browser';
  };

  const handleRevokeSession = async (sessionId: string) => {
    // TODO: Implement session revocation
    console.log('Revoking session:', sessionId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          Active Sessions
        </CardTitle>
        <CardDescription>
          Manage your active sessions and connected devices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Sessions Section */}
        <div>
          <h4 className="font-medium text-sm mb-3">
            Current Sessions ({activeSessions.length})
          </h4>
          <div className="space-y-3">
            {activeSessions.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No active sessions found
              </div>
            ) : (
              activeSessions.map((session, index) => {
                const DeviceIcon = getDeviceIcon(session.userAgent);

                return (
                  <div
                    key={session.id || index}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <DeviceIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">
                          {getDeviceInfo(session.userAgent)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last active:{' '}
                          {session.updatedAt
                            ? new Date(session.updatedAt).toLocaleDateString()
                            : 'Unknown'}
                        </div>
                        {session.ipAddress && (
                          <div className="text-xs text-muted-foreground">
                            IP: {session.ipAddress}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Active</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeSession(session.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {deviceSessions.length > 0 && (
          <>
            <Separator />

            {/* Device Sessions Section */}
            <div>
              <h4 className="font-medium text-sm mb-3">
                Device Sessions ({deviceSessions.length})
              </h4>
              <div className="space-y-3">
                {deviceSessions.map((deviceSession, index) => {
                  // Type guard to handle the union type
                  const session =
                    'session' in deviceSession
                      ? deviceSession.session
                      : deviceSession;
                  const user =
                    'user' in deviceSession ? deviceSession.user : undefined;
                  const DeviceIcon = getDeviceIcon(session.userAgent);

                  return (
                    <div
                      key={session.id || index}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <DeviceIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-sm">
                            {getDeviceInfo(session.userAgent)}
                          </div>
                          {user && (
                            <div className="text-xs text-muted-foreground">
                              {user.name || user.email}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Last active:{' '}
                            {session.updatedAt
                              ? new Date(session.updatedAt).toLocaleDateString()
                              : 'Unknown'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Device</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeSession(session.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {activeSessions.length === 0 && deviceSessions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Wifi className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <h3 className="font-medium text-lg mb-2">No Active Sessions</h3>
            <p className="text-sm">
              No active sessions found. This might indicate a data loading
              issue.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
