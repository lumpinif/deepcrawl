'use client';

import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { Button } from '@deepcrawl/ui/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { CreateDeepcrawlTerminal } from '../create-deepcrawl-terminal';
import { H2 } from '../h2';
import { CommandInstaller } from '../installer';
import { Tick } from '../tick';

export function CreateDeepcrawlCliSection() {
  const rootRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [highlightPlaybackId, setHighlightPlaybackId] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const node = rootRef.current;
    if (!node || isVisible) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    setHighlightPlaybackId((current) => current + 1);
  }, [isVisible]);

  return (
    <section className="relative" id="create-deepcrawl" ref={rootRef}>
      <Tick position={['top-right']} />
      <Badge
        className="absolute top-4 left-4 border-cyan-300/30 md:hidden"
        variant={'outline'}
      >
        New
      </Badge>
      <Badge
        className="absolute bottom-8 left-8 hidden border-cyan-300/30 md:block"
        variant={'outline'}
      >
        New
      </Badge>
      <div className="relative overflow-hidden px-4 sm:px-8">
        <div className="grid gap-8 pt-12 md:min-h-120 lg:min-h-132 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-stretch lg:gap-10">
          <div className="flex max-w-md flex-col justify-start space-y-5">
            <div className="flex justify-start pt-2">
              <CommandInstaller
                className="w-fit max-w-full"
                code="npm create deepcrawl"
                compact
              />
            </div>

            <div className="space-y-3">
              <H2 className="my-1 mt-2 text-balance">
                Deploy your own Deepcrawl with one command
              </H2>
            </div>

            <p className="text-base text-muted-foreground md:text-lg">
              Imagine deploying a fullstack Deepcrawl like adding a{' '}
              <span className="relative isolate mx-0.5 inline-flex px-1">
                <span className="relative z-10 text-foreground">shadcn/ui</span>
                {highlightPlaybackId > 0 ? (
                  <motion.span
                    animate={{ scaleX: 1 }}
                    aria-hidden="true"
                    className="absolute inset-y-[-0.08em] right-[-0.08em] left-[-0.08em] z-0 origin-left rounded-[3px] bg-cyan-300/70"
                    initial={{ scaleX: 0 }}
                    key={highlightPlaybackId}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : {
                            delay: 0.42,
                            duration: 1.7,
                            ease: [0.16, 1, 0.3, 1],
                          }
                    }
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-[-0.08em] right-[-0.08em] left-[-0.08em] z-0 origin-left scale-x-0 rounded-[3px] bg-cyan-300/70"
                  />
                )}
              </span>{' '}
              component.
            </p>
            <div className="mt-6">
              <Button asChild className="gap-2">
                <Link href="/docs/reference/self-hosting/create-deepcrawl">
                  Read the guide
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <CreateDeepcrawlTerminal
            isVisible={isVisible}
            onReplay={() => setHighlightPlaybackId((current) => current + 1)}
          />
        </div>
      </div>
    </section>
  );
}
