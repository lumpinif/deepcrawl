import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@deepcrawl/ui/components/ui/card';
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
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <div className="text-foreground text-sm">{displayValue}</div>
    </div>
  );
}

/**
 * PageMetadataCard component for displaying extracted page metadata
 */
export function PageMetadataCard({
  metadata,
}: {
  metadata?: PageMetadata | null;
}) {
  if (!metadata) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Page Metadata</CardTitle>
        <CardDescription>
          Extracted metadata from the target page
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <MetadataItem label="Title" value={metadata.title} />
        <MetadataItem label="Description" value={metadata.description} />
        <MetadataItem label="Language" value={metadata.language} />
        <MetadataItem label="Author" value={metadata.author} />
        <MetadataItem label="Keywords" value={metadata.keywords} />
        <MetadataItem label="Canonical URL" value={metadata.canonical} />
        <MetadataItem label="Robots" value={metadata.robots} />
        {metadata.ogTitle && (
          <MetadataItem label="OG Title" value={metadata.ogTitle} />
        )}
        {metadata.ogDescription && (
          <MetadataItem label="OG Description" value={metadata.ogDescription} />
        )}
        {metadata.ogImage && (
          <MetadataItem label="OG Image" value={metadata.ogImage} />
        )}
        {metadata.twitterCard && (
          <MetadataItem label="Twitter Card" value={metadata.twitterCard} />
        )}
        {metadata.favicon && (
          <MetadataItem label="Favicon" value={metadata.favicon} />
        )}
      </CardContent>
    </Card>
  );
}
