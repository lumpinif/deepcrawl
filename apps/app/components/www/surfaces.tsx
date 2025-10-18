const SURFACES = [
  {
    heading: 'Deepcrawl Worker',
    blurb:
      'REST + oRPC APIs powering the crawl pipeline. Placeholder copy for platform overview.',
    mock: (
      <div className="h-44 w-full rounded-3xl border border-border/20 bg-gradient-to-tr from-muted/30 via-transparent to-muted/50" />
    ),
  },
  {
    heading: 'Auth Worker',
    blurb:
      'Better Auth, OAuth, and passkeys out of the box. Placeholder copy for security story.',
    mock: (
      <div className="h-44 w-full rounded-3xl border border-border/20 bg-[radial-gradient(circle_at_center,theme(colors.muted/30),transparent_60%)]" />
    ),
  },
  {
    heading: 'Dashboard',
    blurb:
      'Next.js monitoring, playground, and key management interface. Placeholder copy for UI surface.',
    mock: (
      <div className="h-44 w-full rounded-3xl border border-border/20 bg-muted/10" />
    ),
  },
];

export const Surfaces = () => (
  <section className="space-y-12 px-4 py-24 sm:px-8">
    <div className="space-y-2 text-center">
      <span className="font-semibold text-muted-foreground text-sm uppercase tracking-[0.2em]">
        Product Surfaces
      </span>
      <h2 className="text-balance font-semibold text-3xl tracking-tight sm:text-4xl">
        A full platform, not just an API endpoint
      </h2>
      <p className="mx-auto max-w-2xl text-base text-muted-foreground">
        Each card gets its own animation later. For now the placeholder blocks
        hint at visuals.
      </p>
    </div>
    <div className="grid gap-6 sm:grid-cols-3">
      {SURFACES.map((surface) => (
        <article
          className="flex flex-col gap-5 rounded-3xl border border-border/30 bg-card/60 p-6"
          key={surface.heading}
        >
          {surface.mock}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg tracking-tight">
              {surface.heading}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {surface.blurb}
            </p>
          </div>
        </article>
      ))}
    </div>
  </section>
);
