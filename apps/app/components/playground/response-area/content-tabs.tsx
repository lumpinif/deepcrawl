import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TabsTriggerIcon,
  TabsTriggerText,
} from '@deepcrawl/ui/components/annui/focus-tabs';
import { ListTreeIcon } from '@deepcrawl/ui/components/icons/list-tree-icon';
import { MarkdownIcon } from '@deepcrawl/ui/components/icons/markdown';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@deepcrawl/ui/components/ui/card';
import { ScrollArea } from '@deepcrawl/ui/components/ui/scroll-area';
import type { LinksTree } from 'deepcrawl';
import { Code2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type {
  DeepcrawlOperations,
  PlaygroundOperationResponse,
} from '@/hooks/playground/types';
import { formatResponseData } from '@/utils/playground/formatter';
import { ActionButtons } from './action-buttons';

const VariantTrigger = ({
  value,
  children,
}: {
  value: string;
  children?: React.ReactNode;
}) => {
  return (
    <TabsTrigger
      className="select-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
      value={value}
    >
      {children}
    </TabsTrigger>
  );
};

type MarkdownCardProps = {
  value: 'markdown';
  content: string;
};

type TreeCardProps = {
  value: 'tree';
  content: LinksTree;
};

type JsonCardProps = {
  value: 'raw';
  content: PlaygroundOperationResponse['data'];
};

type ContentScrollAreaCardProps =
  | MarkdownCardProps
  | TreeCardProps
  | JsonCardProps;

function ContentScrollAreaCard({ value, content }: ContentScrollAreaCardProps) {
  let header: React.ReactNode | null = null;
  let children: React.ReactNode | null = null;
  if (value === 'markdown') {
    header = (
      <>
        <CardTitle>Markdown</CardTitle>
        <CardDescription>Extracted markdown content</CardDescription>
      </>
    );
    children = (
      <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:border prose-table:border prose-td:border prose-th:border prose-blockquote:border-muted-foreground prose-blockquote:border-l-4 prose-pre:bg-muted prose-th:bg-muted prose-blockquote:pl-4 prose-headings:font-semibold prose-a:text-primary prose-code:text-foreground prose-headings:text-foreground prose-li:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-a:no-underline hover:prose-a:underline">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    );
  }
  if (value === 'tree') {
    header = (
      <>
        <CardTitle>Links Tree</CardTitle>
        <CardDescription>Site structure with extracted links</CardDescription>
      </>
    );
    children = (
      <pre className="whitespace-pre-wrap font-mono text-xs">
        {formatResponseData(content)}
      </pre>
    );
  }
  if (value === 'raw') {
    header = (
      <>
        <CardTitle>API Response Data</CardTitle>
        <CardDescription>Complete JSON response from the API</CardDescription>
      </>
    );
    children = (
      <pre className="whitespace-pre-wrap font-mono text-xs">
        {formatResponseData(content)}
      </pre>
    );
  }

  return (
    <TabsContent
      className="m-0 flex min-h-0 flex-1 flex-col overflow-hidden p-0"
      value={value}
    >
      {children && (
        <>
          {header && (
            <CardHeader className="border-b pt-6">{header}</CardHeader>
          )}
          {children && (
            <ScrollArea className="h-full min-h-0 flex-1">
              <CardContent className="py-6">{children}</CardContent>
            </ScrollArea>
          )}
        </>
      )}
    </TabsContent>
  );
}

interface ContentTabsProps {
  selectedOperation: DeepcrawlOperations;
  activeTab: 'markdown' | 'tree' | 'raw';
  onTabChange: (value: 'markdown' | 'tree' | 'raw') => void;
  markdownContent?: string;
  treeData?: LinksTree;
  onRetry?: () => void;
  response: PlaygroundOperationResponse;
}

/**
 * ContentTabs component for displaying response content in different formats
 */
export function ContentTabs({
  selectedOperation,
  activeTab,
  onTabChange,
  markdownContent,
  treeData,
  onRetry,
  response,
}: ContentTabsProps) {
  const hasTree = selectedOperation === 'extractLinks' && Boolean(treeData);
  const hasMarkdown =
    selectedOperation === 'readUrl' ||
    (response.operation === 'readUrl' && Boolean(markdownContent)) ||
    (selectedOperation === 'getMarkdown' && Boolean(markdownContent)) ||
    (response.operation === 'getMarkdown' && Boolean(markdownContent));

  const apiResponse = response?.data;

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
      <Tabs
        className="flex h-full min-h-0 flex-col"
        defaultValue="markdown"
        onValueChange={(value) =>
          onTabChange(value as 'markdown' | 'tree' | 'raw')
        }
        value={activeTab}
      >
        {/* <CardHeader className="border-b">
          <CardTitle>API Response Data</CardTitle>
          <CardDescription>Complete JSON response from the API</CardDescription>
        </CardHeader> */}

        <CardHeader className="flex items-center justify-between gap-2 border-b">
          <TabsList>
            {hasMarkdown && (
              <VariantTrigger value="markdown">
                <TabsTriggerIcon>
                  <MarkdownIcon size={16} />
                </TabsTriggerIcon>
                <TabsTriggerText>Markdown</TabsTriggerText>
              </VariantTrigger>
            )}
            {hasTree && (
              <VariantTrigger value="tree">
                <TabsTriggerIcon>
                  <ListTreeIcon size={16} />
                </TabsTriggerIcon>
                <TabsTriggerText>Links Tree</TabsTriggerText>
              </VariantTrigger>
            )}
            {response.operation !== 'getMarkdown' && (
              <VariantTrigger value="raw">
                <TabsTriggerIcon>
                  <Code2 />
                </TabsTriggerIcon>
                <TabsTriggerText>JSON</TabsTriggerText>
              </VariantTrigger>
            )}
          </TabsList>
          {/* Action Buttons */}
          <ActionButtons
            activeTab={activeTab}
            markdownContent={markdownContent}
            onRetry={onRetry}
            response={response}
          />
        </CardHeader>

        {/* Markdown View Tab */}
        {hasMarkdown && markdownContent && (
          <ContentScrollAreaCard content={markdownContent} value="markdown" />
        )}

        {/* Tree View Tab */}
        {hasTree && treeData && (
          <ContentScrollAreaCard content={treeData} value="tree" />
        )}

        {/* Raw JSON View Tab */}
        <ContentScrollAreaCard content={apiResponse} value="raw" />
      </Tabs>
    </Card>
  );
}
