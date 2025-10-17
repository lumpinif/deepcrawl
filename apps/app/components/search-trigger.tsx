'use client';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@deepcrawl/ui/components/ui/input-group';
import { Kbd } from '@deepcrawl/ui/components/ui/kbd';
import { useSearchContext } from 'fumadocs-ui/provider';
import { SearchIcon } from 'lucide-react';
import { useEffect } from 'react';

interface SearchTriggerProps {
  placeholder?: string;
  className?: string;
}

export function SearchTrigger({
  placeholder = 'Try searching for pages...',
  className,
}: SearchTriggerProps) {
  const { setOpenSearch } = useSearchContext();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === '/' && !event.ctrlKey && !event.metaKey) {
        const target = event.target as HTMLElement;
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return;
        }
        event.preventDefault();
        setOpenSearch(true);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setOpenSearch]);

  return (
    <InputGroup className={className}>
      <InputGroupInput
        onClick={() => {
          setOpenSearch(true);
        }}
        placeholder={placeholder}
        readOnly
        type="text"
      />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <Kbd>/</Kbd>
      </InputGroupAddon>
    </InputGroup>
  );
}
