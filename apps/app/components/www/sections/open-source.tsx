export const OpenSource = () => (
  <section className="space-y-10 px-4 py-24 sm:px-8">
    <div className="grid gap-8 rounded-3xl border border-border/30 bg-muted/20 p-8 sm:grid-cols-[1.2fr,1fr]">
      <div className="space-y-4">
        <span className="font-semibold text-muted-foreground text-sm uppercase tracking-[0.2em]">
          Open Source
        </span>
        <h2 className="font-semibold text-3xl tracking-tight sm:text-4xl">
          Own your stack from day zero
        </h2>
        <p className="text-base text-muted-foreground leading-relaxed">
          Explain how deployments fan out to Vercel + Cloudflare and why the MIT
          license matters. Placeholder paragraph keeps rhythm until final
          messaging lands.
        </p>
        <div className="flex flex-wrap gap-3 text-muted-foreground text-xs">
          <span className="rounded-full border border-border/40 px-3 py-1 uppercase tracking-widest">
            GitHub CTA
          </span>
          <span className="rounded-full border border-border/40 px-3 py-1 uppercase tracking-widest">
            Self-hosting Docs
          </span>
        </div>
      </div>
      <div className="flex flex-col justify-between gap-6">
        <div className="grid gap-4 text-sm">
          <div className="rounded-2xl border border-border/30 bg-background/80 p-4">
            <p className="font-medium tracking-tight">Deploy to Vercel</p>
            <p className="text-muted-foreground">
              Placeholder steps for dashboard deployment and environment
              configuration.
            </p>
          </div>
          <div className="rounded-2xl border border-border/30 bg-background/80 p-4">
            <p className="font-medium tracking-tight">Deploy to Cloudflare</p>
            <p className="text-muted-foreground">
              Placeholder steps for worker rollout, Wrangler setup, and secrets
              management.
            </p>
          </div>
        </div>
        <div className="flex h-24 items-center justify-center rounded-2xl border border-border/40 border-dashed text-muted-foreground text-sm uppercase tracking-[0.3em]">
          Placeholder badge strip for shields.io metrics
        </div>
      </div>
    </div>
  </section>
);
