import { Banner } from '@/components/www/banner';
import { Faq } from '@/components/www/sections/faq';
import { Hero } from '@/components/www/sections/hero';
import { Observability } from '@/components/www/sections/observability';
import { OpenSource } from '@/components/www/sections/open-source';
import { Surfaces } from '@/components/www/sections/surfaces';
import { ToolkitSuite } from '@/components/www/sections/toolkit-suite';
import { ValueProp } from '@/components/www/sections/value-prop';

export default function IndexPage() {
  return (
    <div className="container relative mx-auto size-full max-w-6xl divide-y px-0 [&>*:nth-child(n+3)]:sm:border-x">
      <Banner />
      <Hero />
      <ValueProp />
      <ToolkitSuite />
      <Surfaces />
      <OpenSource />
      <Observability />
      <Faq />
    </div>
  );
}
