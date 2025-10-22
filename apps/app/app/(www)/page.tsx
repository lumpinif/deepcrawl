import { Banner } from '@/components/www/banner';
import { LazySections } from '@/components/www/lazy-sections';
import { Faq } from '@/components/www/sections/faq';
import { Footer } from '@/components/www/sections/footer';
import { Hero } from '@/components/www/sections/hero';

export default function IndexPage() {
  return (
    <div className="container relative mx-auto size-full max-w-6xl divide-y px-0 [&>*:nth-child(n+3)]:sm:border-x">
      <Banner />
      <Hero />
      <LazySections />
      <Faq />
      <Footer />
    </div>
  );
}
