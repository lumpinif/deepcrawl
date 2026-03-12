import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import { CopyMarkdownButton } from '@/components/docs/copy-markdown-button';
import { OpenDocsMenu } from '@/components/docs/open-docs-menu';
import { getMDXComponents } from '@/components/mdx-components';
import { absoluteUrl } from '@/lib/navigation-config';
import { source } from '@/lib/source';

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);

  if (!page) {
    notFound();
  }

  const doc = page.data;

  if (!(doc.title && doc.description)) {
    notFound();
  }

  return {
    title: `${doc.title}`,
    description: doc.description,
    openGraph: {
      title: doc.title,
      description: doc.description,
      type: 'article',
      url: absoluteUrl(page.url),
      // images: [
      //   {
      //     url: `/og?title=${encodeURIComponent(
      //       doc.title,
      //     )}&description=${encodeURIComponent(doc.description)}`,
      //   },
      // ],
    },
    twitter: {
      card: 'summary_large_image',
      title: doc.title,
      description: doc.description,
      // images: [
      //   {
      //     url: `/og?title=${encodeURIComponent(
      //       doc.title,
      //     )}&description=${encodeURIComponent(doc.description)}`,
      //   },
      // ],
      creator: '@felixlu1018',
    },
  };
}

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) {
    notFound();
  }

  const MDX = page.data.body;
  const pageUrl = absoluteUrl(page.url);
  const markdownUrl = `${page.url}.mdx`;
  const githubUrl = `https://github.com/lumpinif/deepcrawl/blob/main/apps/app/content/docs/${page.path}`;

  return (
    <DocsPage
      breadcrumb={{ enabled: true }}
      editOnGithub={{
        owner: 'lumpinif',
        repo: 'deepcrawl',
        sha: 'main',
        path: `/apps/app/content/docs/${page.path}`,
      }}
      full={page.data.full}
      tableOfContent={{
        style: 'clerk',
        header: <div className="h-4 w-10" />,
      }}
      toc={page.data.toc}
      // lastUpdate={page.data.lastUpdated}
    >
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <DocsTitle className="mb-0">{page.data.title}</DocsTitle>
        <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">
          <CopyMarkdownButton markdownUrl={markdownUrl} />
          <OpenDocsMenu
            githubUrl={githubUrl}
            markdownUrl={markdownUrl}
            pageUrl={pageUrl}
          />
        </div>
      </div>
      <DocsDescription className="mb-8">
        {page.data.description}
      </DocsDescription>
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}
