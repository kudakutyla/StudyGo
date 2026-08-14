"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Clock3, NotebookPen, ShieldCheck, Sparkles } from "lucide-react";

const features = [
  {
    icon: NotebookPen,
    title: "Assignment management",
    description: "Keep all your assignments organized in one place.",
  },
  {
    icon: Clock3,
    title: "Deadline tracking",
    description: "Never lose track of important due dates.",
  },
  {
    icon: Sparkles,
    title: "Priority management",
    description: "Focus on what matters most.",
  },
  {
    icon: CheckCircle2,
    title: "Progress tracking",
    description: "Track assignments from pending to completed.",
  },
];

const phrase = "Stay organized. Stay ahead.";

export default function HomePage() {
  const [visibleText, setVisibleText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setVisibleText(phrase);
      return;
    }

    const typeSpeed = 100;
    const deleteSpeed = 60;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        const nextText = phrase.slice(0, visibleText.length + 1);
        setVisibleText(nextText);

        if (nextText === phrase) {
          setTimeout(() => setIsDeleting(true), 1200);
        }
      } else {
        const nextText = phrase.slice(0, visibleText.length - 1);
        setVisibleText(nextText);

        if (nextText === "") {
          setIsDeleting(false);
        }
      }
    }, isDeleting ? deleteSpeed : typeSpeed);

    return () => clearTimeout(timeout);
  }, [visibleText, isDeleting]);

  return (
    <main className="min-h-screen bg-[#f8f3ee] text-[#1f1a17]">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8d7c1] text-[#3f312b] shadow-soft">S</div>
          <span>StudyGo</span>
        </div>
        <div className="hidden items-center gap-8 text-sm md:flex">
          <Link href="/" className="text-[#3f312b]">Home</Link>
          <a href="#features" className="text-[#3f312b]">Features</a>
          <Link href="/login" className="text-[#3f312b]">Login</Link>
          <Link href="/register" className="rounded-full bg-[#3f312b] px-4 py-2 text-white transition hover:bg-[#2d241f]">Get Started</Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-12 pt-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div>
          <p className="mb-6 inline-flex rounded-full border border-[#d7c2a5] bg-[#f4efe9] px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-[#6d5648]">
            StudyGo
          </p>
          <h1 className="text-5xl font-semibold tracking-tight text-[#1f1a17] md:text-6xl">
            Stay organized.
            <br />
            <span className="inline-block min-h-[72px] text-[#6d5648]">
              {visibleText}
              <span className="ml-1 inline-block h-10 w-[2px] animate-pulse bg-[#6d5648] align-middle" />
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-[#4e413b]">
            Manage your assignments, track deadlines, and stay on top of your academic workload.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/register" className="inline-flex items-center justify-center rounded-full bg-[#3f312b] px-6 py-3 text-base font-medium text-white shadow-soft transition hover:bg-[#2e2420]">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center rounded-full border border-[#d7c2a5] bg-white px-6 py-3 text-base font-medium text-[#2d241f] transition hover:bg-[#f4efe9]">
              Login
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-[#f1dfc6] via-[#f8f3ee] to-[#edd7c5] blur-xl" />
          <div className="overflow-hidden rounded-[2rem] border border-[#eadcca] bg-white/60 shadow-soft backdrop-blur-sm">
            <div
              className="h-[420px] w-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, rgba(77,58,50,0.45), rgba(248,243,238,0.12)), url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80')",
              }}
            />
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 pb-20 pt-10">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-[#7b655d]">Features</p>
          <h2 className="text-3xl font-semibold tracking-tight text-[#1f1a17]">Everything you need to stay ahead.</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-3xl border border-[#eadcca] bg-white p-6 shadow-soft">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3e2d8] text-[#3f312b]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-[#1f1a17]">{title}</h3>
              <p className="text-[#4e413b]">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-[2rem] border border-[#eadcca] bg-[#f4efe9] p-8 shadow-soft">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-[#7b655d]">Built for students</p>
              <h3 className="mt-2 text-2xl font-semibold text-[#1f1a17]">A calmer way to manage your workload.</h3>
            </div>
            <Link href="/register" className="inline-flex items-center justify-center rounded-full bg-[#3f312b] px-5 py-3 text-base font-medium text-white transition hover:bg-[#2d241f]">
              Start now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
