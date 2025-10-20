import { OperationSelectorDemo } from '../operation-selector-demo';

export const ToolkitSuite = () => (
  <section className="relative space-y-12 px-4 py-24 sm:px-8">
    <div className="space-y-3 text-center">
      <h2 className="text-pretty font-semibold text-3xl tracking-tight sm:text-4xl">
        Multi-purposes Features And Endpoints
      </h2>
      <p className="mx-auto max-w-2xl text-base text-muted-foreground">
        Not only does it include enhanced commonly used tools, but there are
        also many more planned features coming soon!
      </p>
    </div>
    <OperationSelectorDemo />
  </section>
);
