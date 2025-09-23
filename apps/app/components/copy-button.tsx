import { Button, type ButtonProps } from '@deepcrawl/ui/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@deepcrawl/ui/components/ui/tooltip';
import { cn } from '@deepcrawl/ui/lib/utils';
import { Check, Copy } from 'lucide-react';
import { type SVGProps, useEffect, useState } from 'react';
import { copyToClipboard } from '@/utils/clipboard';

interface CopyButtonProps extends ButtonProps {
  textToCopy: string;
  iconProps?: IconProps;
}

interface IconProps extends SVGProps<SVGSVGElement> {}

export default function CopyButton({
  textToCopy,
  children,
  className,
  iconProps,
  ...props
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleCopy = async () => {
    const success = await copyToClipboard(textToCopy);
    if (success) {
      setIsCopied(true);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className={cn('h-8 w-8', className)}
            onClick={handleCopy}
            size="icon"
            variant="link"
            {...props}
          >
            {isCopied ? (
              <Check className="h-4 w-4" {...iconProps} />
            ) : (
              <Copy className="h-4 w-4" {...iconProps} />
            )}
            {children}
            <span className="sr-only">Copy to clipboard</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isCopied ? 'Copied!' : 'Copy to clipboard'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
