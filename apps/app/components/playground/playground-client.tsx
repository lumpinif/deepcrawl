'use client';

import {
  extractLinksAction,
  getMarkdownAction,
  readUrlAction,
} from '@/app/actions/deepcrawl';
import { SpinnerButton } from '@/components/spinner-button';
import { Badge } from '@deepcrawl/ui/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@deepcrawl/ui/components/ui/card';
import { Input } from '@deepcrawl/ui/components/ui/input';
import { Label } from '@deepcrawl/ui/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@deepcrawl/ui/components/ui/tabs';
import { cn } from '@deepcrawl/ui/lib/utils';
import { Copy, ExternalLink, FileText, Link2, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ApiResponse {
  data?: unknown;
  error?: string;
  status?: number;
}

export function PlaygroundClient() {
  const [url, setUrl] = useState('https://example.com');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [responses, setResponses] = useState<Record<string, ApiResponse>>({});

  const executeApiCall = async (
    operation: 'getMarkdown' | 'readUrl' | 'extractLinks',
    label: string,
  ) => {
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    if (!apiKey.trim()) {
      toast.error('Please enter your API key');
      return;
    }

    setIsLoading((prev) => ({ ...prev, [operation]: true }));

    try {
      let result: { data?: unknown; error?: string; status?: number };
      switch (operation) {
        case 'getMarkdown':
          result = await getMarkdownAction({ url, apiKey });
          break;
        case 'readUrl':
          result = await readUrlAction({ url, apiKey });
          break;
        case 'extractLinks':
          result = await extractLinksAction({ url, apiKey });
          break;
      }

      if (result.error) {
        setResponses((prev) => ({
          ...prev,
          [operation]: {
            error: result.error,
            status: result.status,
          },
        }));
        toast.error(`${label} failed: ${result.error}`);
      } else {
        setResponses((prev) => ({
          ...prev,
          [operation]: { data: result.data, status: result.status },
        }));
        toast.success(`${label} completed successfully`);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';
      setResponses((prev) => ({
        ...prev,
        [operation]: {
          error: errorMessage,
          status: 500,
        },
      }));
      toast.error(`${label} failed: ${errorMessage}`);
    } finally {
      setIsLoading((prev) => ({ ...prev, [operation]: false }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatResponseData = (data: unknown): string => {
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Configuration
          </CardTitle>
          <CardDescription>
            Enter your API key and the URL you want to test
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="url">Target URL</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Your API key"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Operations */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Get Markdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Get Markdown
              <Badge variant="secondary">GET</Badge>
            </CardTitle>
            <CardDescription>
              Extract markdown content from the URL
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SpinnerButton
              onClick={() => executeApiCall('getMarkdown', 'Get Markdown')}
              isLoading={isLoading.getMarkdown}
              className="w-full"
            >
              Get Markdown
            </SpinnerButton>
          </CardContent>
        </Card>

        {/* Read URL */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Read URL
              <Badge variant="outline">POST</Badge>
            </CardTitle>
            <CardDescription>
              Get full result object with metadata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SpinnerButton
              onClick={() => executeApiCall('readUrl', 'Read URL')}
              isLoading={isLoading.readUrl}
              className="w-full"
            >
              Read URL
            </SpinnerButton>
          </CardContent>
        </Card>

        {/* Extract Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Extract Links
              <Badge variant="outline">POST</Badge>
            </CardTitle>
            <CardDescription>
              Extract all links and sitemap data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SpinnerButton
              onClick={() => executeApiCall('extractLinks', 'Extract Links')}
              isLoading={isLoading.extractLinks}
              className="w-full"
            >
              Extract Links
            </SpinnerButton>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      {Object.keys(responses).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>API responses will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={Object.keys(responses)[0]} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {Object.keys(responses).map((operation) => (
                  <TabsTrigger
                    key={operation}
                    value={operation}
                    className="text-xs"
                  >
                    {operation === 'getMarkdown' && 'Markdown'}
                    {operation === 'readUrl' && 'Read URL'}
                    {operation === 'extractLinks' && 'Links'}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(responses).map(([operation, response]) => (
                <TabsContent key={operation} value={operation} className="mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">Response</span>
                        <Badge
                          variant={response.error ? 'destructive' : 'default'}
                          className="text-xs"
                        >
                          {response.status || 'Unknown'}
                        </Badge>
                      </div>
                      <SpinnerButton
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            response.error
                              ? response.error
                              : formatResponseData(response.data),
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </SpinnerButton>
                    </div>

                    <div
                      className={cn(
                        'relative rounded-lg border p-4 font-mono text-sm',
                        'max-h-96 overflow-auto',
                        response.error
                          ? 'border-destructive/50 bg-destructive/5'
                          : 'bg-muted/50',
                      )}
                    >
                      <pre className="whitespace-pre-wrap">
                        {response.error
                          ? response.error
                          : formatResponseData(response.data)}
                      </pre>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
