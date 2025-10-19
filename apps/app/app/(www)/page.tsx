import { ActionSuite } from '@/components/www/sections/action-suite';
import { Faq } from '@/components/www/sections/faq';
import { Hero } from '@/components/www/sections/hero';
import { Observability } from '@/components/www/sections/observability';
import { OpenSource } from '@/components/www/sections/open-source';
import { Surfaces } from '@/components/www/sections/surfaces';
import { ValueProp } from '@/components/www/sections/value-prop';

export default function IndexPage() {
  return (
    <div className="container mx-auto size-full max-w-6xl divide-y px-0 sm:border-x">
      <Hero />
      <ValueProp />
      <ActionSuite />
      <Surfaces />
      <OpenSource />
      <Observability />
      <Faq />
    </div>
  );
}
