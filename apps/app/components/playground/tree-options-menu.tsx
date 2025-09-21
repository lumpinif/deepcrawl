'use client';

import { DEFAULT_TREE_OPTIONS } from '@deepcrawl/types/configs';
import {
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
} from '@deepcrawl/ui/components/ai-elements/prompt-input';
import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { Button } from '@deepcrawl/ui/components/ui/button';
import { Label } from '@deepcrawl/ui/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@deepcrawl/ui/components/ui/select';
import { Switch } from '@deepcrawl/ui/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@deepcrawl/ui/components/ui/tooltip';
import { cn } from '@deepcrawl/ui/lib/utils';
import type { ExtractLinksOptions, TreeOptions } from 'deepcrawl';
import { ListTree } from 'lucide-react';
import { useRef, useState } from 'react';

type TreeOptionsInput = ExtractLinksOptions['folderFirst'] &
  ExtractLinksOptions['linksOrder'] &
  ExtractLinksOptions['extractedLinks'] &
  ExtractLinksOptions['subdomainAsRootUrl'] &
  ExtractLinksOptions['isPlatformUrl'];

interface TreeOptionsMenuProps {
  treeOptions: TreeOptions | undefined;
  onTreeOptionsChange: (treeOptions: TreeOptions) => void;
  isTreeEnabled?: boolean;
}

export function TreeOptionsMenu({
  treeOptions,
  onTreeOptionsChange,
  isTreeEnabled = true,
}: TreeOptionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const iconRef = useRef<{
    startAnimation: () => void;
    stopAnimation: () => void;
  }>(null);

  // Skip rendering if tree is not enabled
  if (!isTreeEnabled) {
    return null;
  }

  const updateTreeOption = (
    key: string,
    value: boolean | 'page' | 'alphabetical',
  ) => {
    onTreeOptionsChange({
      ...treeOptions,
      [key]: value,
    });
  };

  // Tree option fields with their defaults and metadata
  const TREE_OPTION_FIELDS = [
    {
      key: 'folderFirst',
      defaultValue: DEFAULT_TREE_OPTIONS.folderFirst,
      type: 'switch',
      label: 'Folders First',
      tooltip: 'Whether to place folders before leaf nodes in the tree',
    },
    {
      key: 'extractedLinks',
      defaultValue: DEFAULT_TREE_OPTIONS.extractedLinks,
      type: 'switch',
      label: 'Include Extracted Links',
      tooltip: 'Whether to include extracted links for each node in the tree',
    },
    {
      key: 'subdomainAsRootUrl',
      defaultValue: DEFAULT_TREE_OPTIONS.subdomainAsRootUrl,
      type: 'switch',
      label: 'Subdomain as Root URL',
      tooltip:
        'Whether to treat subdomain as root URL. If false, subdomain will be excluded from root URL',
    },
    {
      key: 'isPlatformUrl',
      defaultValue: DEFAULT_TREE_OPTIONS.isPlatformUrl,
      type: 'switch',
      label: 'Platform URL',
      tooltip:
        'Whether the URL is a platform URL. If true, the targetUrl will be the platform URL',
    },
    {
      key: 'linksOrder',
      defaultValue: DEFAULT_TREE_OPTIONS.linksOrder,
      type: 'select',
      label: 'Links Ordering',
      tooltip: 'How to order links within each folder',
      options: [
        { value: 'page', label: 'Page Order (preserve original)' },
        { value: 'alphabetical', label: 'Alphabetical (A→Z)' },
      ],
    },
  ] as const;

  const resetToDefaults = () => {
    onTreeOptionsChange({
      folderFirst: DEFAULT_TREE_OPTIONS.folderFirst,
      linksOrder: DEFAULT_TREE_OPTIONS.linksOrder,
      extractedLinks: DEFAULT_TREE_OPTIONS.extractedLinks,
      subdomainAsRootUrl: DEFAULT_TREE_OPTIONS.subdomainAsRootUrl,
      isPlatformUrl: DEFAULT_TREE_OPTIONS.isPlatformUrl,
    });
  };

  const hasCustomSettings = TREE_OPTION_FIELDS.some(({ key, defaultValue }) => {
    const currentValue = treeOptions?.[key as keyof typeof treeOptions];
    return currentValue !== undefined && currentValue !== defaultValue;
  });

  return (
    <Tooltip>
      <PromptInputActionMenu onOpenChange={setIsOpen} open={isOpen}>
        <TooltipTrigger asChild>
          <PromptInputActionMenuTrigger
            className="cursor-help"
            onMouseEnter={() => iconRef.current?.startAnimation()}
            onMouseLeave={() => iconRef.current?.stopAnimation()}
          >
            <ListTree
              className={cn('h-4 w-4', hasCustomSettings && 'text-blue-600')}
            />
          </PromptInputActionMenuTrigger>
        </TooltipTrigger>
        <PromptInputActionMenuContent
          alignOffset={-4}
          className="w-fit overflow-visible p-0"
          onCloseAutoFocus={(e) => e.preventDefault()}
          sideOffset={10}
        >
          <div className="min-w-80 space-y-4 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Tree Options</h3>
              <Button
                className="text-xs"
                onClick={resetToDefaults}
                size="sm"
                variant="outline"
              >
                Reset
              </Button>
            </div>

            <div className="space-y-4">
              {TREE_OPTION_FIELDS.map((field) => {
                const currentValue =
                  treeOptions?.[field.key as keyof typeof treeOptions] ??
                  field.defaultValue;
                const fieldId = `tree-${field.key}`;

                if (field.type === 'switch') {
                  return (
                    <div
                      className="flex w-fit items-center space-x-2"
                      key={field.key}
                    >
                      <Switch
                        checked={Boolean(currentValue)}
                        id={fieldId}
                        onCheckedChange={(checked) =>
                          updateTreeOption(field.key, Boolean(checked))
                        }
                      />
                      <Label
                        className="cursor-pointer text-sm"
                        htmlFor={fieldId}
                      >
                        {field.label}
                        <Badge
                          className="ml-2 text-muted-foreground text-xs uppercase"
                          variant="outline"
                        >
                          Default: {field.defaultValue ? 'On' : 'Off'}
                        </Badge>
                      </Label>
                    </div>
                  );
                }

                if (field.type === 'select') {
                  return (
                    <div className="space-y-2" key={field.key}>
                      <Label className="text-sm" htmlFor={fieldId}>
                        {field.label}
                        <Badge
                          className="ml-2 text-muted-foreground text-xs uppercase"
                          variant="outline"
                        >
                          Default: {field.defaultValue}
                        </Badge>
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          updateTreeOption(
                            field.key,
                            value as 'page' | 'alphabetical',
                          )
                        }
                        value={
                          typeof currentValue === 'string'
                            ? currentValue
                            : field.defaultValue
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={`Select ${field.label.toLowerCase()}`}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-muted-foreground text-xs">
                        {field.tooltip}
                      </p>
                    </div>
                  );
                }

                return null;
              })}
            </div>

            <div className="border-t pt-3">
              <p className="text-muted-foreground text-xs">
                * Tree settings control how the site map tree is built and
                organized
              </p>
            </div>
          </div>
        </PromptInputActionMenuContent>
        <TooltipContent align="start" side="bottom">
          <p>Configure site map tree generation options</p>
        </TooltipContent>
      </PromptInputActionMenu>
    </Tooltip>
  );
}
