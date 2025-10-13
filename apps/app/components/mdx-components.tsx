import { Endpoint } from '@deepcrawl/ui/components/mdx/endpoint';
import { cn } from '@deepcrawl/ui/lib/utils';
import { createGenerator } from 'fumadocs-typescript';
import { AutoTypeTable } from 'fumadocs-typescript/ui';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { File, Files, Folder } from 'fumadocs-ui/components/files';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { TypeTable } from 'fumadocs-ui/components/type-table';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';

const tsGenerator = createGenerator();

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
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
    AutoTypeTable: (props) => (
      <AutoTypeTable {...props} generator={tsGenerator} />
    ),
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
