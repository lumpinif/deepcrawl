'use client';

import { Button, buttonVariants } from '@deepcrawl/ui/components/ui/button';
import { Label } from '@deepcrawl/ui/components/ui/label';
import { Switch } from '@deepcrawl/ui/components/ui/switch';

// import { authClient } from '@/lib/auth.client';
import { cn } from '@deepcrawl/ui/lib/utils';
import NumberFlow from '@number-flow/react';
import confetti from 'canvas-confetti';
import { CheckIcon, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addListener(listener);

    return () => media.removeListener(listener);
  }, [query, matches]);

  return matches;
}

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = 'Simple, Transparent Pricing',
  description = 'Choose the plan that works for you',
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: [
          'hsl(var(--primary))',
          'hsl(var(--accent))',
          'hsl(var(--secondary))',
          'hsl(var(--muted))',
        ],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ['circle'],
      });
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-3 space-y-4 text-center">
        <h2 className="font-bold text-2xl tracking-tight sm:text-3xl">
          {title}
        </h2>
        <p className="whitespace-pre-line text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="mb-10 flex justify-center">
        <label
          htmlFor="switch"
          className="relative inline-flex cursor-pointer items-center"
        >
          <Label>
            <Switch
              ref={switchRef}
              checked={!isMonthly}
              onCheckedChange={handleToggle}
              className="relative"
            />
          </Label>
        </label>
        <span className="ml-2 font-semibold">
          Annual billing <span className="text-primary">(Save 20%)</span>
        </span>
      </div>

      <div className="sm:2 grid grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ y: 50, opacity: 1 }}
            whileInView={
              isDesktop
                ? {
                    y: plan.isPopular ? -20 : 0,
                    opacity: 1,
                    x: index === 2 ? -30 : index === 0 ? 30 : 0,
                    scale: index === 0 || index === 2 ? 0.94 : 1.0,
                  }
                : {}
            }
            viewport={{ once: true }}
            transition={{
              duration: 1.6,
              type: 'spring',
              stiffness: 100,
              damping: 30,
              delay: 0.4,
              opacity: { duration: 0.5 },
            }}
            className={cn(
              `relative rounded-sm border-[1px] bg-background p-6 text-center lg:flex lg:flex-col lg:justify-center`,
              plan.isPopular ? 'border-2 border-border' : 'border-border',
              'flex flex-col',
              !plan.isPopular && 'mt-5',
              index === 0 || index === 2
                ? '-translate-z-[50px] z-0 translate-x-0 translate-y-0 rotate-y-[10deg] transform'
                : 'z-10',
              index === 0 && 'origin-right',
              index === 2 && 'origin-left',
            )}
          >
            {plan.isPopular && (
              <div className="absolute top-0 right-0 flex items-center rounded-tr-sm rounded-bl-sm bg-primary px-2 py-0.5">
                <Star className="h-4 w-4 fill-current text-primary-foreground" />
                <span className="ml-1 font-sans font-semibold text-primary-foreground">
                  Popular
                </span>
              </div>
            )}
            <div className="flex flex-1 flex-col">
              <p className="mt-2 font-semibold text-base text-muted-foreground">
                {plan.name}
              </p>
              <div className="mt-6 flex items-center justify-center gap-x-2">
                <span className="font-bold text-5xl text-foreground tracking-tight">
                  <NumberFlow
                    value={
                      isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)
                    }
                    format={{
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }}
                    transformTiming={{
                      duration: 500,
                      easing: 'ease-out',
                    }}
                    willChange
                    className="font-variant-numeric: tabular-nums"
                  />
                </span>
                {plan.period !== 'Next 3 months' && (
                  <span className="font-semibold text-muted-foreground text-sm leading-6 tracking-wide">
                    / {plan.period}
                  </span>
                )}
              </div>

              <p className="text-muted-foreground text-xs leading-5">
                {isMonthly ? 'billed monthly' : 'billed annually'}
              </p>

              <ul className="mt-5 flex flex-col gap-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckIcon className="mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="text-left">{feature}</span>
                  </li>
                ))}
              </ul>

              <hr className="my-4 w-full" />
              <Button
                // onClick={async () => {
                //   await authClient.subscription.upgrade({
                //     plan: plan.name.toLowerCase(),
                //     successUrl: '/dashboard',
                //   });
                // }}
                className={cn(
                  buttonVariants({
                    variant: 'outline',
                  }),
                  'group relative w-full gap-2 overflow-hidden font-semibold text-lg tracking-tighter',
                  'transform-gpu ring-offset-current transition-all duration-300 ease-out hover:bg-primary hover:text-primary-foreground hover:ring-2 hover:ring-primary hover:ring-offset-1',
                  plan.isPopular
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-foreground',
                )}
              >
                {plan.buttonText}
              </Button>
              <p className="mt-6 text-muted-foreground text-xs leading-5">
                {plan.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
