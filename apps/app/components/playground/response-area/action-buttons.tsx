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
  response: PlaygroundOperationResponse;
  onRetry?: () => void;
}

/**
 * ActionButtons component for response actions (copy, share, retry)
 */
export function ActionButtons({ response, onRetry }: ActionButtonsProps) {
  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="flex items-center gap-2">
      <IconHoverButton
        aria-label="Copy Response"
        className="text-muted-foreground hover:text-foreground"
        onClick={() =>
          handleCopy(
            response.error ? response.error : formatResponseData(response.data),
          )
        }
        size="sm"
        type="button"
        variant="outline"
      >
        <IconHoverButtonIcon>
          <Copy className="h-4 w-4" />
        </IconHoverButtonIcon>
        <IconHoverButtonText>Copy Response</IconHoverButtonText>
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
