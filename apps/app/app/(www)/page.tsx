import { Banner } from '@/components/www/banner';
import { CreateDeepcrawlCliSection } from '@/components/www/sections/create-deepcrawl-cli';
import { Faq } from '@/components/www/sections/faq';
import { Footer } from '@/components/www/sections/footer';
import { Hero } from '@/components/www/sections/hero';
import { Surfaces } from '@/components/www/sections/surfaces';
import { ToolkitSuite } from '@/components/www/sections/toolkit-suite';
import { ValueProp } from '@/components/www/sections/value-prop';

export default function IndexPage() {
  return (
    <div className="container relative mx-auto size-full max-w-6xl divide-y px-0 [&>*:nth-child(n+3)]:sm:border-x">
      <Banner />
      <Hero />
      <CreateDeepcrawlCliSection />
      <ValueProp />
      <ToolkitSuite />
      <Surfaces />
      <Faq />
      <Footer />
    </div>
  );
}
