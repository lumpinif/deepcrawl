import {
  CodeBlock,
  CodeBlockCopyButton,
} from '@deepcrawl/ui/components/ai-elements/code-block';
import { toast } from 'sonner';
import {
  type ActivityLogEntry,
  formatTimestamp,
  getLogTimestamp,
  getLogUrl,
} from './logs-columns';

interface LogsDetailContentProps {
  log: ActivityLogEntry;
}

export function LogsDetailContent({ log }: LogsDetailContentProps) {
  return (
    <div className="grid gap-6 py-4 sm:grid-cols-[1fr_1.8fr]">
      <div className="grid gap-y-6 max-md:gap-2">
        <div className="flex flex-col gap-2 max-md:grid">
          <div className="font-medium text-muted-foreground text-sm">
            Request ID
          </div>
          <div className="h-full rounded-md py-2 font-medium font-mono text-muted-foreground text-sm">
            {log.id}
          </div>
        </div>

        <div className="flex flex-col gap-2 max-md:grid">
          <div className="font-medium text-muted-foreground text-sm">URL</div>
          <div className="h-full break-all rounded-md py-2 font-medium text-muted-foreground text-sm">
            {getLogUrl(log)}
          </div>
        </div>

        <div className="flex flex-col gap-2 max-md:grid">
          <div className="font-medium text-muted-foreground text-sm">
            Request Time
          </div>
          <div className="h-full rounded-md py-2 font-medium text-muted-foreground text-sm">
            {formatTimestamp(getLogTimestamp(log))}
          </div>
        </div>
      </div>

      <div className="relative grid min-w-0 gap-2">
        <div className="font-medium text-muted-foreground text-sm">
          Request Options
        </div>
        <div className="bg-linear-to-b from-transparent to-transparent after:absolute after:inset-x-0 after:bottom-0 after:h-12 after:translate-y-1 after:rounded-b-md after:bg-linear-to-t after:from-background after:to-transparent after:content-[''] max-md:after:h-10">
          <CodeBlock
            className="md:scrollbar-none scrollbar-thin h-52 w-full overflow-y-auto overflow-x-hidden border-none bg-card! pb-2 text-muted-foreground text-xs sm:h-80"
            code={JSON.stringify(log.requestOptions, null, 2)}
            language="json"
          >
            <CodeBlockCopyButton
              onCopy={() => toast.success('Copied options to clipboard')}
            />
          </CodeBlock>
        </div>
      </div>
    </div>
  );
}
