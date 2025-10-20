import Link from 'next/link';

export function Footer() {
  return (
    <footer className="py-14 md:py-16">
      <div className="mx-auto px-6 lg:px-8">
        <p className="text-center text-muted-foreground text-sm">
          Built by{' '}
          <Link
            className="underline underline-offset-4"
            href="https://x.com/felixlu1018"
            rel="noopener noreferrer"
            target="_blank"
          >
            Felix Lu
          </Link>{' '}
          with ❤️. The source code is available on{' '}
          <Link
            className="underline underline-offset-4"
            href="https://github.com/lumpinif/deepcrawl"
            rel="noopener noreferrer"
            target="_blank"
          >
            GitHub
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
