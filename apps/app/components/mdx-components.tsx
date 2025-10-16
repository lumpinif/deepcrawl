import { Endpoint } from '@deepcrawl/ui/components/mdx/endpoint';
import { cn } from '@deepcrawl/ui/lib/utils';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { File, Files, Folder } from 'fumadocs-ui/components/files';
import {
  ImageZoom,
  type ImageZoomProps,
} from 'fumadocs-ui/components/image-zoom';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { TypeTable } from 'fumadocs-ui/components/type-table';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';
import { DeepcrawlLogoText } from './deepcrawl-logo';

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    LogoText: ({ description }: { description?: string }) => (
      <div className="mx-auto mb-14 flex h-52 w-full flex-col items-center justify-center gap-4 rounded-md lg:h-56 xl:h-64 2xl:h-72">
        <DeepcrawlLogoText className="!text-5xl 2xl:!text-6xl" />
        {description && (
          <span className="mx-auto max-w-lg text-pretty text-center font-medium text-muted-foreground">
            {description}
          </span>
        )}
      </div>
    ),
    img: (props) => <ImageZoom {...(props as ImageZoomProps)} />,
    Link: ({ className, ...props }: React.ComponentProps<typeof Link>) => (
      <Link
        className={cn('font-medium underline underline-offset-4', className)}
        {...props}
      />
    ),
    Step,
    Steps,
    Tab,
    Tabs,
    File,
    Folder,
    Files,
    TypeTable,
    Accordion,
    Accordions,
    Endpoint,
    Callout: ({ children, ...props }) => (
      <defaultMdxComponents.Callout
        {...props}
        className={cn(
          props,
          'rounded-md border-border border-dashed bg-background-subtle',
          props.type === 'info' && 'border-l-blue-500/50',
          props.type === 'success' && 'border-l-green-500/50',
          props.type === 'warn' && 'border-l-amber-700/50',
          props.type === 'error' && 'border-l-red-500/50',
        )}
      >
        {children}
      </defaultMdxComponents.Callout>
    ),
    iframe: (props) => <iframe {...props} className="h-[500px] w-full" />,
    ...components,
  };
}
