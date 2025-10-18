import { cn } from '@deepcrawl/ui/lib/utils';
import { PerformanceMeter } from './performance-meter';

const VALUE_ITEMS = [
  {
    title: 'Better Performance by Default',
    description: 'Edge-native workers stream results in milliseconds.',
    illustration: <PerformanceMeter />,
  },
  {
    title: 'Optimized for LLM pipelines',
    description:
      'Links-tree intelligence for agents to better plan their next steps and less tokens for better markdown extraction.',
  },
  {
    title: 'Global CDN, resilient APIs',
    description:
      'Requests terminate on a worldwide footprint with built-in retries, and intelligent caching.',
  },
  {
    title: 'Full type safety, plug-in schemas',
    description:
      'Shared contracts across OpenAPI, REST, oRPC, and workers ensure every response is typed, validated, and ready to slot into your checks.',
  },
  {
    title: 'Developer-first SDK experience',
    description:
      'First-party TypeScript SDK exposes ergonomic helpers, and playground parity straight from install.',
  },
  {
    title: 'Free and open',
    description:
      'MIT-licensed, bring-your-own infra—no paywalls, credits, or surprise pricing.',
  },
];

export const ValueProp = () => (
  <div className="grid divide-x divide-y divide-border sm:grid-cols-3">
    {VALUE_ITEMS.map((item, index) => (
      <article
        className={cn(
          'flex flex-col gap-6 p-8',
          index > 2 && 'sm:border-b-0',
          (index === 2 || index === VALUE_ITEMS.length - 1) && 'sm:border-r-0',
        )}
        key={item.title}
      >
        {item.illustration}
        <div className="space-y-2 text-pretty text-center">
          <h3 className="font-semibold text-lg tracking-tight sm:text-xl">
            {item.title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {item.description}
          </p>
        </div>
      </article>
    ))}
  </div>
);
