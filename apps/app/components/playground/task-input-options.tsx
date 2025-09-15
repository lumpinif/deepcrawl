import {
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
} from '@deepcrawl/ui/components/ai-elements/prompt-input';
import { ScrollArea } from '@deepcrawl/ui/components/ui/scroll-area';
import { SettingsIcon } from '@deepcrawl/ui/icons/settings';
import type {
  ExtractLinksOptions,
  GetMarkdownOptions,
  ReadUrlOptions,
} from 'deepcrawl';
import type { DeepcrawlOperations } from '@/hooks/playground/use-task-input-state';
import { OptionsPanel } from './options-panel';

interface TaskInputOptionsProps {
  selectedOperation: DeepcrawlOperations;
  options: ReadUrlOptions | ExtractLinksOptions | GetMarkdownOptions;
  onOptionsChange: (
    options: ReadUrlOptions | ExtractLinksOptions | GetMarkdownOptions,
  ) => void;
}

export function TaskInputOptions({
  selectedOperation,
  options,
  onOptionsChange,
}: TaskInputOptionsProps) {
  return (
    <PromptInputActionMenu>
      <PromptInputActionMenuTrigger>
        <SettingsIcon />
      </PromptInputActionMenuTrigger>
      <PromptInputActionMenuContent
        alignOffset={-4}
        className="w-fit overflow-visible p-1 sm:min-w-xl"
        onCloseAutoFocus={(e) => e.preventDefault()}
        sideOffset={10}
      >
        {/* SOCIAL: WE CAN POST THIS ON X */}
        <ScrollArea className="[&_[data-slot=scroll-area-viewport]]:max-h-[500px] [&_[data-slot=scroll-area-viewport]]:overflow-y-auto">
          <OptionsPanel
            cardProps={{
              card: {
                className: 'bg-background border-none',
              },
              header: {
                className: 'bg-background',
              },
              content: {
                className: 'bg-background',
              },
            }}
            onOptionsChange={onOptionsChange}
            options={options}
            selectedOperation={selectedOperation}
          />
        </ScrollArea>
      </PromptInputActionMenuContent>
    </PromptInputActionMenu>
  );
}
