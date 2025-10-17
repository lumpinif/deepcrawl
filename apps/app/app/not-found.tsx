import { Button } from '@deepcrawl/ui/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@deepcrawl/ui/components/ui/empty';
import Link from 'next/link';
import { DeepcrawlLogo } from '@/components/deepcrawl-logo';
import { SearchTrigger } from '@/components/search-trigger';

export default function NotFound() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>
          <DeepcrawlLogo />
        </EmptyTitle>
        <EmptyTitle>404 - Page Not Found</EmptyTitle>
        <EmptyDescription>
          The page you&apos;re looking for doesn&apos;t exist. Try searching for
          what you need below.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <SearchTrigger className="sm:w-3/4" />
        <Button asChild size="sm">
          <Link href="/">Return Home</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
