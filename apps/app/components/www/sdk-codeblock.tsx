import { CodeBlock } from '@deepcrawl/ui/components/ai-elements/code-block';
import { cn } from '@deepcrawl/ui/lib/utils';

const SDK_CODE = `import { DeepcrawlApp } from 'deepcrawl';

const deepcrawl = new DeepcrawlApp({
  apiKey: 'dc_your-api-key',
});

console.log(deepcrawl.readUrl('https://example.com'));
`;

export function SDKCodeblock({
  code,
  className,
}: {
  code?: string;
  className?: string;
}) {
  return (
    <CodeBlock
      className={cn('size-full', className)}
      code={code ?? SDK_CODE}
      language="typescript"
    />
  );
}
