export const Observability = () => (
  <section className="space-y-12 px-4 py-24 sm:px-8">
    <div className="space-y-2 text-center">
      <span className="font-semibold text-muted-foreground text-sm uppercase tracking-[0.2em]">
        Observability
      </span>
      <h2 className="font-semibold text-3xl tracking-tight sm:text-4xl">
        Built-in insight loops for agent teams
      </h2>
      <p className="mx-auto max-w-2xl text-base text-muted-foreground">
        Placeholder copy selling the logs export, live metrics, and replay
        tooling while we craft final messaging.
      </p>
    </div>
    <div className="grid gap-6 sm:grid-cols-[1.4fr,1fr]">
      <div className="space-y-4 rounded-3xl border border-border/30 bg-card/70 p-6">
        <div className="h-48 w-full rounded-2xl border border-border/40 bg-[linear-gradient(120deg,theme(colors.muted/20),transparent_60%)]" />
        <div className="space-y-2">
          <h3 className="font-semibold text-lg tracking-tight">
            Request timeline mock
          </h3>
          <p className="text-muted-foreground text-sm">
            Placeholder description for timeline showing request, cache hit,
            markdown render, metrics capture.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-3xl border border-border/30 bg-muted/20 p-6">
        <div className="rounded-2xl border border-border/30 bg-background/60 p-4">
          <p className="font-semibold text-sm tracking-tight">
            Export Responses
          </p>
          <p className="text-muted-foreground text-xs">
            Placeholder note about exporting markdown via REST or dashboard with
            a single click.
          </p>
        </div>
        <div className="rounded-2xl border border-border/30 bg-background/60 p-4">
          <p className="font-semibold text-sm tracking-tight">
            Structured Logs
          </p>
          <p className="text-muted-foreground text-xs">
            Placeholder note about requestId tracing, metrics, and retry hints.
          </p>
        </div>
        <div className="rounded-2xl border border-border/30 bg-background/60 p-4">
          <p className="font-semibold text-sm tracking-tight">
            Playground Snapshots
          </p>
          <p className="text-muted-foreground text-xs">
            Placeholder note about saving playground runs and sharing replay
            URLs.
          </p>
        </div>
      </div>
    </div>
  </section>
);
