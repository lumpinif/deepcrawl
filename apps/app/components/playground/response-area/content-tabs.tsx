import { Response } from '@deepcrawl/ui/components/ai-elements/response';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TabsTriggerIcon,
  TabsTriggerText,
} from '@deepcrawl/ui/components/annui/focus-tabs';
import {
  IconHoverButton,
  IconHoverButtonIcon,
  IconHoverButtonText,
} from '@deepcrawl/ui/components/annui/icon-hover-button';
import { ListTreeIcon } from '@deepcrawl/ui/components/icons/list-tree-icon';
import { MarkdownIcon } from '@deepcrawl/ui/components/icons/markdown';
import {
  type TreeDataItem,
  TreeView,
} from '@deepcrawl/ui/components/tree-view';
import { buttonVariants } from '@deepcrawl/ui/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@deepcrawl/ui/components/ui/card';
import { cn } from '@deepcrawl/ui/lib/utils';
// import { ScrollArea } from '@deepcrawl/ui/components/ui/scroll-area';
import type {
  ExtractLinksResponse,
  LinksTree,
  ReadUrlResponse,
} from 'deepcrawl';
import {
  Code2,
  Copy,
  CopyMinus,
  ExternalLink,
  Folder,
  FolderOpen,
  ListChevronsUpDown,
} from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import type {
  DeepcrawlOperations,
  PlaygroundActions,
  PlaygroundOperationResponse,
} from '@/hooks/playground/types';
import { copyToClipboard } from '@/utils/clipboard';
import { formatResponseData } from '@/utils/playground/formatter';
import { ActionButtons } from './action-buttons';
import { MetricsDisplay } from './task-info-card';

/**
 * Memoized copy button component to avoid recreating on every render
 * Using div instead of button to avoid nested button error in TreeView
 */
const CopyButton = React.memo(
  ({ url, title }: { url: string; title?: string }) => {
    const handleCopy = React.useCallback(
      async (e: React.MouseEvent) => {
        e.stopPropagation();
        await copyToClipboard(url);
        toast.success('URL copied to clipboard');
      },
      [url],
    );

    return (
      <div className="flex items-center gap-0 rounded-full border bg-border/80 backdrop-blur-[2px]">
        {title && (
          <span className="truncate pr-1 pl-2 font-medium text-xs">
            {title}
          </span>
        )}
        <a
          className={cn(
            buttonVariants({
              variant: 'ghost',
              size: 'icon',
              className: '!bg-transparent size-8 cursor-pointer',
            }),
          )}
          href={url}
          rel="noopener noreferrer"
          target="_blank"
          title="Open the link in new tab"
        >
          <ExternalLink className="size-3" />
        </a>
        <div
          className={cn(
            buttonVariants({
              variant: 'ghost',
              size: 'icon',
              className: '!bg-transparent size-8 cursor-pointer',
            }),
          )}
          onClick={handleCopy}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCopy(e as unknown as React.MouseEvent);
            }
          }}
          role="button"
          tabIndex={0}
          title="Copy the URL"
        >
          <Copy className="size-3" />
        </div>
      </div>
    );
  },
);
CopyButton.displayName = 'CopyButton';

/**
 * Transform LinksTree to TreeDataItem format for TreeView component
 * Optimized to avoid creating new functions/objects on every render
 */
function transformLinksTreeToTreeData(
  tree: LinksTree,
  enableCopyOnClick = false,
): TreeDataItem {
  const hasChildren = tree.children && tree.children.length > 0;

  return {
    id: tree.url,
    name: tree.url,
    icon: hasChildren ? Folder : undefined,
    openIcon: hasChildren ? FolderOpen : undefined,
    actions: enableCopyOnClick ? (
      <CopyButton title={tree.name} url={tree.url} />
    ) : undefined,
    children: tree.children?.map((child) =>
      transformLinksTreeToTreeData(child, enableCopyOnClick),
    ),
  };
}

const VariantTrigger = React.memo(
  ({ value, children }: { value: string; children?: React.ReactNode }) => {
    return (
      <TabsTrigger
        className="select-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        value={value}
      >
        {children}
      </TabsTrigger>
    );
  },
);
VariantTrigger.displayName = 'VariantTrigger';

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

const TreeViewCard = React.memo(({ content }: { content: LinksTree }) => {
  const [expandKey, setExpandKey] = React.useState(0);
  const [expandAll, setExpandAll] = React.useState(true);
  const [enableCopyOnClick] = React.useState(true);

  const linksTreeData = content;

  const treeData = React.useMemo(
    () => transformLinksTreeToTreeData(linksTreeData, enableCopyOnClick),
    [linksTreeData, enableCopyOnClick],
  );

  const handleExpandAll = React.useCallback(() => {
    setExpandAll(true);
    setExpandKey((prev) => prev + 1);
  }, []);

  const handleCollapseAll = React.useCallback(() => {
    setExpandAll(false);
    setExpandKey((prev) => prev + 1);
  }, []);

  return (
    <>
      <CardHeader className="border-b pt-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle>Links Tree</CardTitle>
            <CardDescription>
              Extracted links tree map for AI Agents
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <IconHoverButton
              className="text-muted-foreground"
              onClick={handleExpandAll}
              size="sm"
              variant="ghost"
            >
              <IconHoverButtonIcon>
                <ListChevronsUpDown className="h-4 w-4" />
              </IconHoverButtonIcon>
              <IconHoverButtonText>Expand All</IconHoverButtonText>
            </IconHoverButton>
            <IconHoverButton
              className="text-muted-foreground"
              onClick={handleCollapseAll}
              size="sm"
              variant="ghost"
            >
              <IconHoverButtonIcon>
                <CopyMinus className="h-4 w-4" />
              </IconHoverButtonIcon>
              <IconHoverButtonText>Collapse All</IconHoverButtonText>
            </IconHoverButton>
          </div>
        </div>
      </CardHeader>
      <CardContent className="scrollbar-thin scrollbar-thumb-rounded-full size-full min-h-0 flex-1 overflow-auto px-2 py-6">
        <TreeView data={treeData} expandAll={expandAll} key={expandKey} />
      </CardContent>
    </>
  );
});
TreeViewCard.displayName = 'TreeViewCard';

const ContentScrollAreaCard = React.memo(
  ({ value, content }: ContentScrollAreaCardProps) => {
    let header: React.ReactNode | null = null;
    let children: React.ReactNode | null = null;
    if (value === 'markdown') {
      children = (
        <div className="[&_pre]:scrollbar-thin px-6" suppressHydrationWarning>
          <Response>{content}</Response>
        </div>
      );
    }
    if (value === 'tree') {
      children = <TreeViewCard content={content} />;
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
        className="m-0 flex size-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-0"
        value={value}
      >
        {children && (
          <>
            {header && (
              <CardHeader className="border-b pt-6">{header}</CardHeader>
            )}
            {children && (
              <CardContent className="scrollbar-thin scrollbar-thumb-rounded-full size-full min-h-0 flex-1 overflow-auto py-6">
                {/* <ScrollArea className="size-full min-h-0"> */}
                {children}
                {/* </ScrollArea> */}
              </CardContent>
            )}
          </>
        )}
      </TabsContent>
    );
  },
);
ContentScrollAreaCard.displayName = 'ContentScrollAreaCard';

interface ContentTabsProps {
  selectedOperation: DeepcrawlOperations;
  activeTab: 'markdown' | 'tree' | 'raw';
  onTabChange: (value: 'markdown' | 'tree' | 'raw') => void;
  markdownContent?: string;
  treeData?: LinksTree;
  onRetry?: () => void;
  response: PlaygroundOperationResponse;
  apiMetrics?: ReadUrlResponse['metrics'] | ExtractLinksResponse['metrics'];
  formatTime: PlaygroundActions['formatTime'];
  operationMethod: string;
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
  apiMetrics,
  formatTime,
  operationMethod,
}: ContentTabsProps) {
  const hasTree = React.useMemo(
    () => selectedOperation === 'extractLinks' && Boolean(treeData),
    [selectedOperation, treeData],
  );

  const hasMarkdown = React.useMemo(
    () =>
      selectedOperation === 'readUrl' ||
      (response.operation === 'readUrl' && Boolean(markdownContent)) ||
      (selectedOperation === 'getMarkdown' && Boolean(markdownContent)) ||
      (response.operation === 'getMarkdown' && Boolean(markdownContent)),
    [selectedOperation, response.operation, markdownContent],
  );

  const apiResponse = React.useMemo(() => response?.data, [response?.data]);

  return (
    <Card className="flex size-full min-h-0 flex-col">
      <Tabs
        className="flex size-full flex-col"
        defaultValue="markdown"
        onValueChange={(value) =>
          onTabChange(value as 'markdown' | 'tree' | 'raw')
        }
        value={activeTab}
      >
        <CardHeader className="flex flex-col gap-2 border-b">
          <div className="flex w-full items-center justify-between gap-2">
            <TabsList>
              {hasMarkdown && (
                <VariantTrigger value="markdown">
                  <TabsTriggerIcon>
                    <MarkdownIcon size={16} />
                  </TabsTriggerIcon>
                  <TabsTriggerText>
                    {selectedOperation === 'getMarkdown'
                      ? 'Extracted markdown content'
                      : 'Markdown'}
                  </TabsTriggerText>
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
          </div>
        </CardHeader>

        {/* Markdown View Tab */}
        {hasMarkdown && markdownContent && (
          <>
            {selectedOperation === 'getMarkdown' && (
              <CardHeader className="!py-3 border-b p-6">
                {/* Metrics */}
                <MetricsDisplay
                  apiMetrics={apiMetrics}
                  badgeVariant="inline"
                  className="w-full border-none p-0"
                  contentClassName="w-full border-none p-0"
                  formatTime={formatTime}
                  operationMethod={operationMethod}
                  response={response}
                />
              </CardHeader>
            )}
            <ContentScrollAreaCard content={markdownContent} value="markdown" />
          </>
        )}

        {/* Tree View Tab */}
        {hasTree && treeData && (
          <TabsContent
            className="m-0 flex size-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-0"
            value="tree"
          >
            <TreeViewCard content={treeData} />
          </TabsContent>
        )}

        {/* Raw JSON View Tab */}
        <ContentScrollAreaCard content={apiResponse} value="raw" />
      </Tabs>
    </Card>
  );
}
