import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx-components';
import { absoluteUrl } from '@/lib/navigation-config';
import { source } from '@/lib/source';

export const revalidate = false;
export const dynamic = 'force-static';
export const dynamicParams = false;

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
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}
