const PIPELINE_STEPS = [
  {
    title: 'Crawling pipeline',
    description:
      'Workers orchestrate fetch, normalization, and link graph building. Placeholder copy for now.',
  },
  {
    title: 'Rendering outputs',
    description:
      'Engines transform HTML into markdown tuned for agents while keeping metadata rich.',
  },
  {
    title: 'Developer toolchain',
    description:
      'Shared packages and scripts maintain consistency across the stack. Keep copy succinct.',
  },
];

export const Pipeline = () => (
  <section className="space-y-12 px-4 py-24 sm:px-8">
    <div className="space-y-2 text-center">
      <span className="font-semibold text-muted-foreground text-sm uppercase tracking-[0.2em]">
        How It Works
      </span>
      <h2 className="font-semibold text-3xl tracking-tight sm:text-4xl">
        Pipeline in three precise beats
      </h2>
      <p className="mx-auto max-w-2xl text-base text-muted-foreground">
        Timeline placeholder: we will refine animations later. For now it
        communicates the flow.
      </p>
    </div>
    <ol className="grid gap-6 sm:grid-cols-3">
      {PIPELINE_STEPS.map((step, index) => (
        <li
          className="relative flex flex-col gap-3 rounded-3xl border border-border/30 bg-muted/20 p-6 text-left"
          key={step.title}
        >
          <span className="flex size-10 items-center justify-center rounded-full border border-border/40 font-semibold text-sm">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg tracking-tight">
              {step.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {step.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  </section>
);
