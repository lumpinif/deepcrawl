'use client';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@deepcrawl/ui/components/ui/input-group';
import { Kbd, KbdGroup } from '@deepcrawl/ui/components/ui/kbd';
import { useIsMac } from '@deepcrawl/ui/hooks/use-is-mac';
import { useSearchContext } from 'fumadocs-ui/provider';
import { SearchIcon } from 'lucide-react';
import { useEffect } from 'react';

interface SearchTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  placeholder?: string;
  className?: string;
}

export function SearchTrigger({
  placeholder = 'Try searching for pages...',
  className,
  ...props
}: SearchTriggerProps) {
  const isMac = useIsMac();
  const { setOpenSearch } = useSearchContext();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        const target = e.target as HTMLElement;
        if (
          (target instanceof HTMLElement && target.isContentEditable) ||
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLSelectElement
        ) {
          return;
        }
        e.preventDefault();
        setOpenSearch(true);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setOpenSearch]);

  return (
    <InputGroup className={className} {...props}>
      <InputGroupInput
        autoComplete="off"
        onClick={() => {
          setOpenSearch(true);
        }}
        placeholder={placeholder}
        readOnly
        suppressHydrationWarning
        type="text"
      />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <KbdGroup>
          <Kbd className="border">{isMac ? '⌘' : 'Ctrl'}</Kbd>
          <Kbd className="border">K</Kbd>
        </KbdGroup>
      </InputGroupAddon>
    </InputGroup>
  );
}
