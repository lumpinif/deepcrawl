'use client';

import { cn } from '@deepcrawl/ui/lib/utils';
import { type ComponentProps, memo } from 'react';
import { Streamdown } from 'streamdown';

type ResponseProps = ComponentProps<typeof Streamdown>;

const CustomImage = ({
  src,
  alt,
  ...props
}: {
  src?: string;
  alt?: string;
}) => (
  <span className="group relative inline-block" data-streamdown="image-wrapper">
    <img alt={alt} src={src} {...props} />
    <span className="pointer-events-none absolute inset-0 hidden rounded-lg bg-black/10 group-hover:block" />
  </span>
);

export const Response = memo(
  ({ className, components, ...props }: ResponseProps) => (
    <Streamdown
      className={cn(
        'size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
        className,
      )}
      components={{
        img: CustomImage,
        ...components,
      }}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

Response.displayName = 'Response';
