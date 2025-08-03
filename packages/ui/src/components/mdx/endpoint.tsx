import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@deepcrawl/ui/components/ui/tooltip';
import { Server } from 'lucide-react';

function Method({ method }: { method: 'POST' | 'GET' | 'DELETE' | 'PUT' }) {
  return (
    <div className="flex h-6 w-fit select-none items-center justify-center rounded-lg border bg-background px-2 font-display font-semibold text-sm uppercase">
      {method}
    </div>
  );
}

export function Endpoint({
  path,
  method,
  isServerOnly,
}: {
  path: string;
  method: 'POST' | 'GET' | 'DELETE' | 'PUT';
  isServerOnly?: boolean;
}) {
  return (
    <div className="relative flex w-full items-center gap-2 rounded-md border border-muted bg-fd-secondary/50 p-2">
      <Method method={method} />
      <span className="font-mono text-muted-foreground text-sm">{path}</span>
      {isServerOnly && (
        <div className="absolute right-2">
          <TooltipProvider delayDuration={1}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex size-6 items-center justify-center text-muted-foreground/50 transition-colors duration-150 ease-in-out hover:text-muted-foreground">
                  <Server className="size-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="border border-fd-border bg-fd-popover text-fd-popover-foreground">
                Server Only Endpoint
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}
