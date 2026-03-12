import { getLLMText } from '@/lib/get-llm-text';
import { source } from '@/lib/source';

// Next 16 already emits this route handler as SSG from generateStaticParams,
// so we intentionally do not add dynamic = 'force-static' here.
export function generateStaticParams() {
  return source.generateParams();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug } = await params;
  const page = source.getPage(slug);

  if (!page) {
    return new Response('Not found', {
      status: 404,
    });
  }

  return new Response(await getLLMText(page), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
