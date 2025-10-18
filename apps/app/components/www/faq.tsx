const FAQS = [
  {
    question: 'Is Deepcrawl really free to self-host?',
    answer:
      'Placeholder answer referencing MIT license and deploy instructions. Will tighten copy once pricing model is confirmed.',
  },
  {
    question: 'How do rate limits work during early access?',
    answer:
      'Placeholder answer summarizing sensible defaults and how teams can request adjustments.',
  },
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

export const Faq = () => (
  <section className="space-y-10 px-4 pt-24 pb-48 sm:px-8">
    <div className="space-y-2 text-center">
      <span className="font-semibold text-muted-foreground text-sm uppercase tracking-[0.2em]">
        FAQs
      </span>
      <h2 className="font-semibold text-3xl tracking-tight sm:text-4xl">
        Answers to the first questions new teams ask
      </h2>
      <p className="mx-auto max-w-2xl text-base text-muted-foreground">
        Placeholder responses keep structure in place so we can swap in
        finalized messaging later.
      </p>
    </div>
    <dl className="mx-auto grid max-w-3xl gap-6 text-left">
      {FAQS.map((faq) => (
        <div
          className="rounded-3xl border border-border/30 bg-muted/20 p-6"
          key={faq.question}
        >
          <dt className="font-semibold text-lg tracking-tight">
            {faq.question}
          </dt>
          <dd className="mt-2 text-muted-foreground text-sm leading-relaxed">
            {faq.answer}
          </dd>
        </div>
      ))}
    </dl>
  </section>
);
