import { ActionSuite } from '@/components/www/action-suite';
import { CtaStrip } from '@/components/www/cta-strip';
import { Faq } from '@/components/www/faq';
import { Hero } from '@/components/www/hero';
import { Integrations } from '@/components/www/integrations';
import { Observability } from '@/components/www/observability';
import { OpenSource } from '@/components/www/open-source';
import { Pipeline } from '@/components/www/pipeline';
import { Surfaces } from '@/components/www/surfaces';
import { ValueProp } from '@/components/www/value-prop';

export default function IndexPage() {
  return (
    <div className="container mx-auto size-full max-w-6xl divide-y px-0 sm:border-x">
      <Hero />
      <ValueProp />
      <ActionSuite />
      <Pipeline />
      <Surfaces />
      <OpenSource />
      <Observability />
      <Integrations />
      <CtaStrip />
      <Faq />
    </div>
  );
}
