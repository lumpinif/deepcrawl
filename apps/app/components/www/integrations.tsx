const INTEGRATIONS = [
  'TypeScript SDK',
  'ai-sdk ready',
  'LangChain adapters',
  'Rest + oRPC contracts',
  'CLI tooling roadmap',
  'Bring-your-own queue',
];

export const Integrations = () => (
  <section className="space-y-10 px-4 py-24 sm:px-8">
    <div className="space-y-2 text-center">
      <span className="font-semibold text-muted-foreground text-sm uppercase tracking-[0.2em]">
        Integrations
      </span>
      <h2 className="font-semibold text-3xl tracking-tight sm:text-4xl">
        Built to slot into modern agent stacks
      </h2>
      <p className="mx-auto max-w-2xl text-base text-muted-foreground">
        Placeholder language covering today’s SDK plus upcoming ecosystems we
        want to highlight once ready.
      </p>
    </div>
    <div className="flex flex-wrap justify-center gap-4 font-medium text-muted-foreground text-sm uppercase tracking-[0.3em]">
      {INTEGRATIONS.map((integration) => (
        <span
          className="rounded-full border border-border/30 px-4 py-2"
          key={integration}
        >
          {integration}
        </span>
      ))}
    </div>
  </section>
);
