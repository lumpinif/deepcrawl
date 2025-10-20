import { cn } from '@deepcrawl/ui/lib/utils';
import PyramidAnimation from '../ascii-pyramid';
import { Globe } from '../globe';
import { SecureShield } from '../secure-shield';
import { Tick } from '../tick';

const SURFACES = [
  {
    title: 'Deepcrawl Worker',
    description: 'REST + oRPC APIs powering the backend workflow.',
    illustration: (
      <div className="relative flex size-full items-center justify-center overflow-hidden opacity-85 [mask-image:linear-gradient(to_top,transparent,black_50%)]">
        <Globe className="md:-translate-x-3 md:max-w-[250px]" />
      </div>
    ),
    className: 'pr-0',
  },
  {
    title: 'Auth Worker',
    description: 'Better Auth, OAuth, and passkeys out of the box.',
    illustration: (
      <div className="relative flex size-full items-center justify-center overflow-hidden p-6">
        <SecureShield />
      </div>
    ),
  },
  {
    title: 'Next.js Dashboard',
    description:
      'Optimized Next.js dashboard, monitoring, playground, and key management interface.',
    illustration: (
      <div className="flex size-full items-center justify-center overflow-hidden opacity-85 [mask-image:linear-gradient(to_top,transparent,black_30%)]">
        <PyramidAnimation className="scale-[0.5]" edges={false} />
      </div>
    ),
  },
];

export const Surfaces = () => (
  <section className="relative px-4 py-24 sm:px-8" id="surfaces">
    <Tick position={['bottom-left', 'bottom-right']} />
    <div className="space-y-12">
      <div className="space-y-3 text-center">
        <h2 className="text-pretty font-semibold text-3xl tracking-tight sm:text-4xl">
          A full platform provided, not just API endpoints
        </h2>
        <p className="mx-auto max-w-2xl text-base text-muted-foreground">
          Not only does it include enhanced commonly used tools, but there are
          also many more planned features coming soon!
        </p>
      </div>
      <div className="grid divide-x divide-y border md:grid-cols-3">
        {SURFACES.map((surface) => (
          <div
            className={cn(
              'flex h-[350px] flex-col items-start justify-end gap-3 overflow-hidden p-6 md:h-[400px]',
              surface.className,
            )}
            key={surface.title}
          >
            {surface.illustration}
            <h3 className="font-semibold text-lg tracking-tighter">
              {surface.title}
            </h3>
            <p className="text-muted-foreground">{surface.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
