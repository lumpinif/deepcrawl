export const CtaStrip = () => (
  <section className="px-4 pt-16 pb-32 sm:px-8">
    <div className="flex flex-col items-center gap-6 rounded-3xl border border-border/30 bg-primary/10 px-8 py-12 text-center">
      <h2 className="font-semibold text-3xl tracking-tight sm:text-4xl">
        Ready to crawl the open web differently?
      </h2>
      <p className="max-w-xl text-base text-muted-foreground">
        Placeholder sentence nudging visitors into the product funnel. Final
        copy will reference Start Crawling and documentation depth.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <button className="rounded-full border border-primary bg-primary px-6 py-2 font-semibold text-primary-foreground text-sm uppercase tracking-[0.2em]">
          Start Crawling
        </button>
        <button className="rounded-full border border-border/50 px-6 py-2 font-semibold text-muted-foreground text-sm uppercase tracking-[0.2em]">
          View Docs
        </button>
      </div>
    </div>
  </section>
);
