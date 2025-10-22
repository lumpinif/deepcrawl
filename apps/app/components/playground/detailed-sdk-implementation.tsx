'use client';

import {
  CodeBlock,
  CodeBlockCopyButton,
} from '@deepcrawl/ui/components/ai-elements/code-block';
import { Button } from '@deepcrawl/ui/components/ui/button';
import { Label } from '@deepcrawl/ui/components/ui/label';
import { cn } from '@deepcrawl/ui/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { memo, useMemo } from 'react';
import { toast } from 'sonner';
import {
  usePlaygroundActionsSelector,
  usePlaygroundCoreSelector,
  usePlaygroundOptionsSelector,
} from '@/contexts/playground-context';
import { buildSdkSnippet } from '@/utils/playground/sdk-snippet';

export const DetailedSDKImpl = memo(function DetailedSDKImpl({
  className,
}: {
  className?: string;
}) {
  const router = useRouter();
  const requestUrl = usePlaygroundCoreSelector('requestUrl');
  const selectedOperation = usePlaygroundCoreSelector('selectedOperation');
  const currentOptions = usePlaygroundOptionsSelector('currentOptions');
  const resetToDefaults = usePlaygroundActionsSelector('resetToDefaults');

  const { code, hasCustomOptions } = useMemo(
    () =>
      buildSdkSnippet({
        operation: selectedOperation,
        requestUrl,
        options: currentOptions,
      }),
    [selectedOperation, requestUrl, currentOptions],
  );

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <Label className="font-medium text-muted-foreground text-xs">
          SDK Usage
        </Label>
        <div className="flex items-center gap-2">
          <Button
            className="w-fit select-none text-muted-foreground text-xs"
            onClick={() => resetToDefaults(selectedOperation)}
            size="sm"
            type="button"
            variant="outline"
          >
            Reset Options
          </Button>
          <Button
            className="w-fit select-none text-muted-foreground text-xs"
            onClick={() => router.push('/app/api-keys')}
            size="sm"
            type="button"
            variant="outline"
          >
            Get API Key
          </Button>
        </div>
      </div>

      <CodeBlock
        className="scrollbar-thin max-h-[500px] overflow-y-auto bg-card shadow-sm md:max-h-[600px]"
        code={code}
        language="typescript"
      >
        <CodeBlockCopyButton
          onCopy={() => toast.success('Copied SDK snippet')}
        />
      </CodeBlock>

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs">
          {hasCustomOptions
            ? 'Showing only options that differ from the defaults'
            : 'Defaults applied — tweak the playground controls to override'}
        </p>
        <p className="text-muted-foreground text-xs">
          Check the{' '}
          <Link
            className="text-foreground underline underline-offset-4"
            href="/docs/reference/defaults"
          >
            DEFAULTS
          </Link>{' '}
          for more details.
        </p>
      </div>
    </div>
  );
});
