import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@deepcrawl/ui/components/ui/accordion';
import { ChevronUp } from 'lucide-react';
import { H2 } from '../h2';

const FAQS = [
  {
    question: 'What happens to my data after a crawl?',
    answer:
      'Placeholder answer about metadata retention, logs export, and manual purge controls.',
  },
  {
    question: 'Where can I follow the roadmap?',
    answer:
      'Placeholder answer pointing to docs, GitHub issues, or community updates once defined.',
  },
];

const CONTENT = [
  {
    title: 'Is Deepcrawl free to use and self-host?',
    value: 'self-hosting',
    content:
      'Yes. Deepcrawl is 100% free and open for anyone to deploy. Follow the self-hosting guide to provision the Next.js app, Workers, and SDK locally or on your own infrastructure.',
  },
  {
    title: 'How fast is Deepcrawl compared to Firecrawl?',
    value: 'speed-comparison',
    content:
      'Deepcrawl is faster than Firecrawl on general by a lot, ranging from 5x to 10x faster in some cases. Deepcrawl uses the Cloudflare Workers platform to fetch and process pages with v8 engine, which is much faster than Firecrawl.',
  },
  {
    title: 'What are the planned features coming soon?',
    value: 'planned-features',
    content:
      'We are releasing new endpoints and features regularly, such as Browser-rendering support for page screenshot, parsing PDF, asyncronous crawling support, built-in web searching integrations, MCP server, and more planned features.',
  },
  {
    title: 'How do I install the SDK?',
    value: 'install-sdk',
    content:
      'Run `pnpm add deepcrawl` (or `npm install` / `bun install`). Then create a server-side client. Check the documentation for more details.',
  },
  {
    title: 'How do I learn to use Deepcrawl?',
    value: 'learn-to-use-deepcrawl',
    content: 'Visit the documentation to learn how to use the SDK and API.',
  },
  {
    title: 'How can I contribute to Deepcrawl?',
    value: 'contribute-to-deepcrawl',
    content:
      'Visit the documentation to learn how to contribute to the project. Contributions are welcome! Please read the CONTRIBUTING.md file for details.',
  },
];

export function Faq() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
          <div className="py-0 text-left md:py-4">
            <H2>FAQs</H2>
            <p className="text-base text-muted-foreground">
              Frequently asked questions about Deepcrawl.
            </p>
          </div>
          <div className="col-span-2 border-t px-3 sm:px-4 md:border-none">
            <Accordion
              className="flex w-full flex-col divide-y"
              type="multiple"
            >
              {CONTENT.map((item) => (
                <AccordionItem
                  className="py-4"
                  key={item.value}
                  value={item.value}
                >
                  <AccordionTrigger className="w-full text-left">
                    <div className="font-medium text-base text-primary md:text-lg">
                      {item.title}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="pt-2 text-muted-foreground">{item.content}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}
