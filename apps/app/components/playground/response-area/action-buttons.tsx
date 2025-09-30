import {
  IconHoverButton,
  IconHoverButtonIcon,
  IconHoverButtonText,
} from '@deepcrawl/ui/components/annui/icon-hover-button';
import { Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import type { PlaygroundOperationResponse } from '@/hooks/playground/types';
import { copyToClipboard } from '@/utils/clipboard';
import { formatResponseData } from '@/utils/playground/formatter';

interface ActionButtonsProps {
  activeTab: 'markdown' | 'tree' | 'raw';
  markdownContent?: string;
  response: PlaygroundOperationResponse;
  onRetry?: () => void;
}

/**
 * ActionButtons component for response actions (copy, share, retry)
 */
export function ActionButtons({
  activeTab,
  response,
  onRetry,
  markdownContent,
}: ActionButtonsProps) {
  const handleCopy = async (response: PlaygroundOperationResponse) => {
    const apiResponse = response.data;

    let text = '';

    if (response.error) {
      text = response.error;
      await copyToClipboard(text);
      toast.success('Copied to clipboard');
      return;
    }

    if (activeTab === 'markdown') {
      text = markdownContent || 'no markdown content found';
    } else if (activeTab === 'tree') {
      text = formatResponseData(apiResponse);
    } else if (activeTab === 'raw') {
      text = formatResponseData(apiResponse);
    }

    await copyToClipboard(text);
    toast.success('Copied to clipboard');
  };

  const buttonCopyLabel =
    activeTab === 'markdown' ? 'Copy as Markdown' : 'Copy as JSON';

  return (
    <div className="flex items-center gap-2">
      <IconHoverButton
        aria-label={buttonCopyLabel}
        className="text-muted-foreground hover:text-foreground"
        onClick={() => handleCopy(response)}
        size="sm"
        type="button"
        variant="outline"
      >
        <IconHoverButtonIcon>
          <Copy className="h-4 w-4" />
        </IconHoverButtonIcon>
        <IconHoverButtonText>{buttonCopyLabel}</IconHoverButtonText>
      </IconHoverButton>
      {response.retryable && onRetry && (
        <IconHoverButton
          aria-label="Retry"
          className="text-muted-foreground hover:text-foreground"
          onClick={onRetry}
          size="sm"
          type="button"
          variant="outline"
        >
          <IconHoverButtonIcon>
            <RefreshCw className="h-4 w-4" />
          </IconHoverButtonIcon>
          <IconHoverButtonText>Retry</IconHoverButtonText>
        </IconHoverButton>
      )}
    </div>
  );
}
