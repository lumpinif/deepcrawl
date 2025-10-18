export const ValueProp = () => (
  <section className="space-y-10 px-4 py-24 text-center sm:px-8">
    <div className="space-y-2">
      <span className="font-semibold text-muted-foreground text-sm uppercase tracking-[0.2em]">
        Core Advantage
      </span>
      <h2 className="text-balance font-semibold text-3xl tracking-tight sm:text-4xl">
        Why teams pick Deepcrawl
      </h2>
      <p className="mx-auto max-w-2xl text-base text-muted-foreground">
        Three pillars we obsess over—keep them concise for now while we shape
        the full story.
      </p>
    </div>
    <div className="grid gap-6 sm:grid-cols-3">
      {[
        {
          title: 'Compress messy pages',
          description:
            'Placeholder copy explaining how we turn chaotic HTML into structured markdown for agents.',
        },
        {
          title: 'Map every link',
          description:
            'Placeholder copy highlighting the domain-wide link intelligence Deepcrawl renders.',
        },
        {
          title: 'Built for agent stacks',
          description:
            'Placeholder copy surfacing the type-safe API + SDK layers that feel native in modern workflows.',
        },
      ].map((item) => (
        <article
          className="flex flex-col items-center gap-4 rounded-3xl border border-border/30 bg-muted/20 p-8 text-left"
          key={item.title}
        >
          <div className="size-12 rounded-full border border-border/40 bg-gradient-to-br from-muted/40 to-muted" />
          <div className="space-y-2">
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
  </section>
);
