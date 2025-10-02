import { Card, CardContent } from '@deepcrawl/ui/components/ui/card';

import type { PageMetadata } from 'deepcrawl';

/**
 * MetadataItem component for displaying key-value pairs
 */
export function MetadataItem({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | string[] | boolean | null;
  icon?: React.ReactNode;
}) {
  if (!value) {
    return null;
  }

  const displayValue = Array.isArray(value)
    ? value.join(', ')
    : typeof value === 'boolean'
      ? value.toString()
      : value;

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <div className="w-full whitespace-normal text-pretty break-words text-muted-foreground text-sm transition-all duration-200 ease-out hover:text-foreground">
        {displayValue}
      </div>
    </div>
  );
}

/**
 * PageMetadataCard component for displaying extracted page metadata
 */
export function PageMetadataCard({
  metadata,
  className,
}: {
  metadata?: PageMetadata | null;
  className?: string;
}) {
  if (!metadata) {
    return null;
  }

  const {
    language,
    author,
    keywords,
    canonical,
    robots,
    ogTitle,
    ogDescription,
    ogImage,
    twitterCard,
    favicon,
  } = metadata;

  return (
    <Card className={className}>
      {/* <CardHeader>
        <CardTitle className="text-muted-foreground text-xs">
          Page Metadata
        </CardTitle>
      </CardHeader> */}
      <CardContent className="scrollbar-thin scrollbar-thumb-rounded-full min-w-0 space-y-4 overflow-auto">
        {/* <ScrollArea
          className="w-full"
          viewportClassName="whitespace-normal break-words overflow-x-hidden"
        > */}
        <MetadataItem label="Language" value={language} />
        <MetadataItem label="Author" value={author} />
        <MetadataItem label="Keywords" value={keywords} />
        <MetadataItem label="Canonical URL" value={canonical} />
        <MetadataItem label="Robots" value={robots} />
        {ogDescription && (
          <MetadataItem label="OG Description" value={ogDescription} />
        )}
        {ogImage && <MetadataItem label="OG Image" value={ogImage} />}

        {twitterCard && (
          <MetadataItem label="Twitter Card" value={twitterCard} />
        )}
        {favicon && <MetadataItem label="Favicon" value={favicon} />}
        {/* </ScrollArea> */}
      </CardContent>
    </Card>
  );
}
