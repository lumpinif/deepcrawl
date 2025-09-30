import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@deepcrawl/ui/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import type { PlaygroundOperationResponse } from '@/hooks/playground/types';

interface ErrorCardProps {
  response: PlaygroundOperationResponse;
}

/**
 * ErrorCard component for displaying error information
 */
export function ErrorCard({ response }: ErrorCardProps) {
  if (!response.error) {
    return null;
  }

  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Error
        </CardTitle>
        {response.userMessage && (
          <CardDescription>{response.userMessage}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <pre className="whitespace-pre-wrap font-mono text-xs">
          {response.error}
        </pre>
        {response.targetUrl && (
          <div className="text-muted-foreground text-xs">
            Invalid input: {response.targetUrl}
          </div>
        )}
        {response.retryAfter && (
          <div className="text-muted-foreground text-xs">
            Retry after: {response.retryAfter} seconds
          </div>
        )}
      </CardContent>
    </Card>
  );
}
