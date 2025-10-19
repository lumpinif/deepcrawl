const ACTIONS = [
  {
    label: 'readUrl()',
    description: 'Full-fidelity fetch with markdown, metadata, and metrics.',
    mock: (
      <div className="h-36 w-full rounded-2xl border border-border/30 bg-gradient-to-b from-muted/40 via-transparent to-muted/40" />
    ),
  },
  {
    label: 'getMarkdown()',
    description: 'Ultra-light call tuned for LLM prompts and token control.',
    mock: (
      <div className="h-36 w-full rounded-2xl border border-border/40 border-dashed bg-muted/20" />
    ),
  },
  {
    label: 'extractLinks()',
    description: 'Domain graphing with hierarchical trees and metadata.',
    mock: (
      <div className="h-36 w-full rounded-2xl border border-border/30 bg-[radial-gradient(circle_at_top,theme(colors.muted/40),transparent_55%)]" />
    ),
  },
];

export const ActionSuite = () => (
  <section className="space-y-12 px-4 py-24 sm:px-8">
    <div className="space-y-3 text-center">
      <span className="font-semibold text-muted-foreground text-sm uppercase tracking-[0.2em]">
        Action Surface
      </span>
      <h2 className="text-balance font-semibold text-3xl tracking-tight sm:text-4xl">
        Your mission control for web intelligence
      </h2>
      <p className="mx-auto max-w-2xl text-base text-muted-foreground">
        Keep it simple: headline, short supporting line, and three cards hinting
        at docs, playground, and SDK usage.
      </p>
    </div>
    <div className="grid gap-6 sm:grid-cols-3">
      {ACTIONS.map((action) => (
        <article
          className="flex flex-col gap-5 rounded-3xl border border-border/40 bg-card/50 p-6"
          key={action.label}
        >
          {action.mock}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg tracking-tight">
              {action.label}
            </h3>
            <p className="text-muted-foreground text-sm">
              {action.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-muted-foreground text-xs">
            <span className="rounded-full border border-border/40 px-3 py-1 uppercase tracking-widest">
              Playground CTA
            </span>
            <span className="rounded-full border border-border/40 px-3 py-1 uppercase tracking-widest">
              Docs CTA
            </span>
          </div>
        </article>
      ))}
    </div>
  </section>
);
