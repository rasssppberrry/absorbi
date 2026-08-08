"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Orbitron } from "next/font/google";
import { useLanguage } from "@/lib/i18n/provider";
import { landingText } from "@/lib/i18n/landing";
import { LanguageToggle } from "@/components/app/language-toggle";
import { Reveal } from "@/components/app/reveal";
import { SmoothScroll } from "@/components/app/smooth-scroll";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["500", "700"] });

export function Landing() {
  const { lang } = useLanguage();
  const L = landingText[lang];
  const lastRef = useRef<HTMLElement | null>(null);
  const [atLast, setAtLast] = useState(false);

  useEffect(() => {
    const el = lastRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setAtLast(entry.isIntersecting),
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative bg-white text-foreground">
      <SmoothScroll />

      <div className="fixed right-4 top-4 z-50 flex items-center gap-3 rounded-full bg-white/70 px-3 py-2 backdrop-blur">
        <LanguageToggle />
        {!atLast ? (
          <Link href="/login">
            <button className="rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover">
              {L.tryMvp}
            </button>
          </Link>
        ) : null}
      </div>

      <section
        className="relative flex min-h-screen items-center"
        style={{
          backgroundImage: "url(/spine.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="max-w-xl">
            <h1
              className={`${orbitron.className} text-6xl font-bold lowercase tracking-tight text-foreground md:text-7xl`}
            >
              absorbi
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-foreground/80 md:text-lg">
              {L.brandDesc}
            </p>
          </div>
        </div>
        {/* Pulsing glow over the herniated disc. Adjust left and top to line it up with the red spot. */}
        <span className="animate-pulse-glow pointer-events-none absolute left-[68%] top-[60%] h-12 w-12 rounded-full bg-danger/50 blur-md" />
      </section>

      <section className="flex min-h-screen items-center bg-white py-24">
        <div className="mx-auto w-full max-w-6xl px-6">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
              {L.problemQuestion}
            </h2>
          </Reveal>
          <Reveal className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              [L.p1Num, L.p1Text],
              [L.p2Num, L.p2Text],
              [L.p3Num, L.p3Text],
            ].map(([num, text]) => (
              <div
                key={text}
                className="rounded-2xl bg-white p-8 shadow-[0_10px_40px_rgba(37,99,235,0.18)]"
              >
                <div className="text-4xl font-semibold tracking-tight text-accent">
                  {num}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted">{text}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="flex min-h-screen items-center bg-white py-24">
        <div className="mx-auto w-full max-w-6xl px-6">
          <Reveal className="flex flex-col gap-4">
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
              {L.solutionTitle}
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-muted md:text-lg">
              {L.solutionLead}
            </p>
          </Reveal>
          <Reveal className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-8 shadow-[0_10px_40px_rgba(37,99,235,0.12)]">
              <div className="text-xs font-semibold uppercase tracking-widest text-accent">
                {L.solutionForWhoTitle}
              </div>
              <p className="mt-3 text-base text-foreground">{L.solutionForWho}</p>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-[0_10px_40px_rgba(37,99,235,0.12)]">
              <div className="text-xs font-semibold uppercase tracking-widest text-accent">
                {L.solutionGivesTitle}
              </div>
              <p className="mt-3 text-base text-foreground">{L.solutionGives}</p>
            </div>
          </Reveal>
          <Reveal className="mt-6">
            <div className="rounded-2xl bg-accent/5 p-8 shadow-[0_10px_40px_rgba(37,99,235,0.10)]">
              <p className="text-lg font-medium leading-relaxed text-foreground md:text-xl">
                {L.solutionDoctor}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section
        ref={lastRef}
        className="relative flex min-h-screen items-center justify-center"
      >
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/aura.png" alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-white/50" />
        </div>
        <div className="relative flex max-w-3xl flex-col items-center gap-8 px-6 text-center">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-6xl">
            {L.slogan}
          </h2>
          <Link href="/login">
            <button className="rounded-full bg-accent px-8 py-4 text-base font-medium text-white transition-colors hover:bg-accent-hover">
              {L.tryProduct}
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
