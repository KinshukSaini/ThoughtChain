'use client';

import Link from "next/link"
import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  Network, ArrowRight, GitBranch, Focus, MousePointerClick, KeyRound,
  FileText, Smartphone, ExternalLink, CornerDownRight,
} from "lucide-react"

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease },
};

/* ------------------------------------------------------------------ */
/* Hero demo: a scripted conversation that branches as it goes         */
/* ------------------------------------------------------------------ */

type DemoNodeId = "root" | "atp" | "calvin";

const demoNodes: Record<DemoNodeId, { label: string; x: number; y: number; parent?: DemoNodeId; step: number }> = {
  root: { label: "Photosynthesis", x: 50, y: 18, step: 0 },
  atp: { label: "ATP", x: 24, y: 64, parent: "root", step: 2 },
  calvin: { label: "Calvin cycle", x: 76, y: 64, parent: "root", step: 4 },
};

const demoMessages: { id: string; node: DemoNodeId; step: number; role: "user" | "bot"; text: string }[] = [
  { id: "u1", node: "root", step: 0, role: "user", text: "Explain photosynthesis for my bio exam." },
  { id: "b1", node: "root", step: 1, role: "bot", text: "Plants turn light, water and CO₂ into glucose and oxygen, in two stages: the light reactions and the Calvin cycle." },
  { id: "u2", node: "atp", step: 2, role: "user", text: "Wait, what is ATP exactly?" },
  { id: "b2", node: "atp", step: 3, role: "bot", text: "ATP is the cell's energy carrier. The light reactions charge it up; other processes spend it." },
  { id: "u3", node: "calvin", step: 4, role: "user", text: "Got it. Back to the Calvin cycle: what happens there?" },
  { id: "b3", node: "calvin", step: 5, role: "bot", text: "It fixes CO₂ into sugar, powered by the energy made in the light reactions." },
];

const STEP_MS = [1600, 2200, 1800, 2400, 1800, 4200];

function activeNodeAt(step: number): DemoNodeId {
  if (step >= 4) return "calvin";
  if (step >= 2) return "atp";
  return "root";
}

function pathTo(id: DemoNodeId): DemoNodeId[] {
  const parent = demoNodes[id].parent;
  return parent ? [...pathTo(parent), id] : [id];
}

function HeroDemo() {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const current = reduceMotion ? STEP_MS.length - 1 : step;

  useEffect(() => {
    if (reduceMotion) return;
    const t = setTimeout(() => setStep((s) => (s + 1) % STEP_MS.length), STEP_MS[step]);
    return () => clearTimeout(t);
  }, [step, reduceMotion]);

  const active = activeNodeAt(current);
  const path = pathTo(active);
  const visibleMessages = demoMessages.filter((m) => m.step <= current && path.includes(m.node));
  const atpHidden = current >= 4;

  return (
    <div className="relative rounded-2xl border border-white/10 bg-[#0b0b0c] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/[0.03] overflow-hidden">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-4 h-10">
        <span className="size-2.5 rounded-full bg-white/10" />
        <span className="size-2.5 rounded-full bg-white/10" />
        <span className="size-2.5 rounded-full bg-white/10" />
        <span className="ml-3 font-mono text-[11px] text-[#71717a]">thoughtchain / chat</span>
      </div>

      <div className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Tree panel */}
        <div
          className="relative h-[210px] md:h-[400px] border-b md:border-b-0 md:border-r border-white/[0.06] bg-[#111112]"
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)", backgroundSize: "16px 16px" }}
        >
          <span className="absolute top-3 left-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[#52525b]">Thought map</span>

          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
            {(Object.keys(demoNodes) as DemoNodeId[]).map((id) => {
              const n = demoNodes[id];
              if (!n.parent || n.step > current) return null;
              const p = demoNodes[n.parent];
              const onPath = path.includes(id);
              return (
                <motion.path
                  key={id}
                  d={`M ${p.x} ${p.y + 6} C ${p.x} ${(p.y + n.y) / 2}, ${n.x} ${(p.y + n.y) / 2}, ${n.x} ${n.y - 6}`}
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, stroke: onPath ? "#a855f7" : "rgba(255,255,255,0.18)" }}
                  transition={{ duration: 0.6, ease }}
                  strokeWidth={onPath ? 2 : 1.5}
                  strokeDasharray={onPath ? undefined : "4 4"}
                />
              );
            })}
          </svg>

          {(Object.keys(demoNodes) as DemoNodeId[]).map((id) => {
            const n = demoNodes[id];
            const isActive = id === active;
            const onPath = path.includes(id);
            return (
              <AnimatePresence key={id}>
                {n.step <= current && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: onPath ? 1 : 0.45, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, ease }}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${n.x}%`, top: `${n.y}%` }}
                  >
                    <div
                      className={`whitespace-nowrap rounded-lg border px-3 py-1.5 text-[11px] md:text-xs font-medium transition-colors duration-500 ${
                        isActive
                          ? "border-[#a855f7] bg-[#1c1027] text-white shadow-[0_0_24px_rgba(168,85,247,0.35)]"
                          : "border-white/15 bg-[#1c1c1e] text-[#d4d4d8]"
                      }`}
                    >
                      {n.label}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            );
          })}

          <AnimatePresence>
            {(current === 2 || current === 4) && (
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[#a855f7]/30 bg-[#a855f7]/10 px-3 py-1 text-[10px] md:text-[11px] text-[#d8b4fe]"
              >
                <GitBranch className="size-3" /> New topic, new branch
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chat panel */}
        <div className="flex flex-col h-[340px] md:h-[400px]">
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 h-11 shrink-0 overflow-hidden">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#52525b] shrink-0">Context</span>
            <div className="flex items-center gap-1 text-xs text-[#d4d4d8] min-w-0">
              {path.map((id, i) => (
                <span key={id} className="flex items-center gap-1 whitespace-nowrap">
                  {i > 0 && <span className="text-[#52525b]">›</span>}
                  <span className={id === active ? "text-[#d8b4fe]" : ""}>{demoNodes[id].label}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-end gap-3 p-4 overflow-hidden mask-[linear-gradient(to_bottom,transparent,black_48px)]">
            <AnimatePresence initial={false} mode="popLayout">
              {visibleMessages.map((m) => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -16, transition: { duration: 0.25 } }}
                  transition={{ duration: 0.4, ease }}
                  className={m.role === "user" ? "self-end max-w-[85%]" : "self-start max-w-[92%]"}
                >
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      m.role === "user"
                        ? "bg-[#2a1a3d] text-[#f4f4f5] rounded-br-md"
                        : "bg-white/[0.04] border border-white/[0.06] text-[#d4d4d8] rounded-bl-md"
                    }`}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="shrink-0 px-4 pb-4">
            <AnimatePresence>
              {atpHidden && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mb-2 flex items-center gap-1.5 text-[11px] text-[#71717a]">
                    <CornerDownRight className="size-3" /> The ATP tangent is kept out of this branch&apos;s context
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 h-10 text-[13px] text-[#52525b]">
              Ask a follow-up…
              <ArrowRight className="size-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Comparison: the same study session as a thread vs. a tree           */
/* ------------------------------------------------------------------ */

const topicColors = {
  root: "#a855f7",
  atp: "#f59e0b",
  calvin: "#2dd4bf",
  chloro: "#60a5fa",
} as const;

type Topic = keyof typeof topicColors;

const linearThread: { topic: Topic; user: boolean; w: number }[] = [
  { topic: "root", user: true, w: 45 }, { topic: "root", user: false, w: 80 },
  { topic: "atp", user: true, w: 35 }, { topic: "atp", user: false, w: 70 },
  { topic: "chloro", user: true, w: 50 }, { topic: "chloro", user: false, w: 75 },
  { topic: "atp", user: true, w: 40 }, { topic: "atp", user: false, w: 60 },
  { topic: "calvin", user: true, w: 55 }, { topic: "calvin", user: false, w: 85 },
  { topic: "chloro", user: true, w: 30 }, { topic: "calvin", user: true, w: 45 },
];

function Comparison() {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      {/* Linear */}
      <motion.div {...fadeUp} className="rounded-2xl border border-white/[0.08] bg-[#0b0b0c] p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-white">One long chat</h3>
          <span className="font-mono text-[11px] text-[#71717a]">12 messages in context</span>
        </div>
        <div className="relative flex flex-col gap-2 h-[260px] overflow-hidden">
          {linearThread.map((m, i) => (
            <div
              key={i}
              className={`h-4 rounded-full shrink-0 ${m.user ? "self-end" : "self-start"}`}
              style={{ width: `${m.w}%`, backgroundColor: topicColors[m.topic], opacity: m.user ? 0.55 : 0.3 }}
            />
          ))}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-[#0b0b0c] to-transparent" />
        </div>
        <p className="mt-6 text-sm leading-relaxed text-[#a1a1aa]">
          Tangents pile up in one stream. Every answer is shaped by everything you asked before, including the parts that don&apos;t matter anymore.
        </p>
      </motion.div>

      {/* Tree */}
      <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="rounded-2xl border border-[#a855f7]/25 bg-[#0d0a12] p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-white">ThoughtChain</h3>
          <span className="font-mono text-[11px] text-[#d8b4fe]">4 messages in context</span>
        </div>
        <div className="relative h-[260px]">
          <svg viewBox="0 0 300 260" className="absolute inset-0 size-full" aria-hidden>
            <path d="M150 50 C150 100, 50 90, 50 140" stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" fill="none" />
            <path d="M150 50 C150 100, 150 90, 150 140" stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" fill="none" />
            <path d="M150 50 C150 100, 250 90, 250 140" stroke="#a855f7" strokeWidth="2" fill="none" />
            <path d="M50 160 C50 190, 50 190, 50 215" stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" fill="none" />
          </svg>
          {[
            { label: "Photosynthesis", topic: "root" as Topic, x: 50, y: 15, on: true },
            { label: "ATP", topic: "atp" as Topic, x: 16.6, y: 57, on: false },
            { label: "Chlorophyll", topic: "chloro" as Topic, x: 50, y: 57, on: false },
            { label: "Calvin cycle", topic: "calvin" as Topic, x: 83.3, y: 57, on: true },
            { label: "ADP", topic: "atp" as Topic, x: 16.6, y: 88, on: false },
          ].map((n) => (
            <div
              key={n.label}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-xs ${
                n.on ? "border-[#a855f7]/60 bg-[#1c1027] text-white" : "border-white/10 bg-[#161618] text-[#71717a]"
              }`}
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
            >
              <span className="size-1.5 rounded-full" style={{ backgroundColor: topicColors[n.topic] }} />
              {n.label}
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm leading-relaxed text-[#a1a1aa]">
          Each tangent gets its own branch. When you ask about the Calvin cycle, the AI only sees that branch and the topic above it.
        </p>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const steps = [
  { title: "Ask anything", text: "Start with the topic you're studying. Your first question becomes the root of the map." },
  { title: "Go off on tangents", text: "When a question opens a new topic, ThoughtChain creates a branch for it automatically. No setup, no folders." },
  { title: "Jump back in", text: "Click any node to pick up from there. The AI gets that branch's history and nothing else." },
];

const features = [
  { icon: GitBranch, title: "Automatic branching", text: "The assistant decides when a question is a new topic and names the branch for you." },
  { icon: Focus, title: "Scoped context", text: "Answers draw on the path from the root to the node you're in, so side quests don't leak in." },
  { icon: MousePointerClick, title: "A map you can click", text: "Your whole session laid out as a tree. Select a node to read it or continue from it." },
  { icon: FileText, title: "Readable answers", text: "Short, exam-focused replies with Markdown: lists, tables, code and highlights." },
  { icon: Smartphone, title: "Works on your phone", text: "Switch between the chat and the map with one tap on small screens." },
  { icon: KeyRound, title: "Your own key, optional", text: "Runs on Gemini 2.5 Flash. Add your free key if the shared quota runs out." },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050505] font-sans text-[#f4f4f5] selection:bg-[#a855f7]/30">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#050505]/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[#a855f7]">
              <Network className="size-4 text-white" />
            </span>
            <span className="font-semibold tracking-tight text-white">ThoughtChain</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-[#a1a1aa]">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#api-key" className="hover:text-white transition-colors">API key</a>
          </nav>
          <Link
            href="/chat"
            className="group flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-[#e4e4e7]"
          >
            Open app <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative pt-32 md:pt-40 pb-20 md:pb-28">
          <div
            className="pointer-events-none absolute inset-0 mask-[radial-gradient(ellipse_at_top,black_20%,transparent_70%)]"
            style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          />
          <div className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[900px] max-w-full -translate-x-1/2 rounded-full bg-[#a855f7] opacity-[0.12] blur-[140px]" />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease }}
              className="mx-auto max-w-3xl text-center"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[#a1a1aa]">
                <span className="size-1.5 rounded-full bg-[#a855f7]" />
                An AI study assistant that thinks in branches
              </span>
              <h1 className="mt-6 text-[2.5rem] leading-[1.08] sm:text-6xl md:text-7xl font-semibold tracking-[-0.035em] text-white">
                Study without losing your{" "}
                <span className="bg-linear-to-r from-[#c084fc] via-[#a855f7] to-[#e879f9] bg-clip-text text-transparent">train of thought</span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-[#a1a1aa]">
                Every tangent becomes its own branch on a map. Dive deeper or step back up, and the AI only remembers the part of the conversation you&apos;re in.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/chat"
                  className="group flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#a855f7] px-7 font-medium text-white shadow-[0_8px_30px_-6px_rgba(168,85,247,0.6)] transition-colors hover:bg-[#9333ea]"
                >
                  Start studying free <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="#how-it-works"
                  className="flex h-12 w-full sm:w-auto items-center justify-center rounded-full border border-white/10 px-7 font-medium text-[#d4d4d8] transition-colors hover:border-white/25 hover:text-white"
                >
                  See how it works
                </a>
              </div>
              <p className="mt-4 text-xs text-[#71717a]">No sign-up. Works in your browser.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.25, ease }}
              className="mx-auto mt-16 md:mt-20 max-w-5xl"
            >
              <HeroDemo />
            </motion.div>
          </div>
        </section>

        {/* Problem / comparison */}
        <section className="relative border-t border-white/[0.06] py-24 md:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <motion.div {...fadeUp} className="max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#a855f7]">The problem</p>
              <h2 className="mt-4 text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white">
                Same study session, two shapes.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-[#a1a1aa]">
                One question leads to another. In a normal chat, those detours stack up and the AI starts mixing them into every answer.
              </p>
            </motion.div>
            <div className="mt-14">
              <Comparison />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-16 border-t border-white/[0.06] py-24 md:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <motion.div {...fadeUp} className="max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#a855f7]">How it works</p>
              <h2 className="mt-4 text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white">
                Three steps, zero setup.
              </h2>
            </motion.div>
            <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08] md:grid-cols-3">
              {steps.map((s, i) => (
                <motion.li
                  key={s.title}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.08 }}
                  className="bg-[#08080a] p-7 md:p-9"
                >
                  <span className="font-mono text-sm text-[#a855f7]">0{i + 1}</span>
                  <h3 className="mt-5 text-xl font-semibold text-white">{s.title}</h3>
                  <p className="mt-3 leading-relaxed text-[#a1a1aa]">{s.text}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-16 border-t border-white/[0.06] py-24 md:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <motion.div {...fadeUp} className="max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#a855f7]">Features</p>
              <h2 className="mt-4 text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white">
                Built for focused studying.
              </h2>
            </motion.div>
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: (i % 3) * 0.08 }}
                  className="group rounded-2xl border border-white/[0.08] bg-[#0b0b0c] p-7 transition-colors duration-300 hover:border-[#a855f7]/40"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] transition-colors group-hover:border-[#a855f7]/40 group-hover:bg-[#a855f7]/10">
                    <f.icon className="size-[18px] text-[#c084fc]" />
                  </div>
                  <h3 className="mt-5 font-semibold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#a1a1aa]">{f.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* API key */}
        <section id="api-key" className="scroll-mt-16 border-t border-white/[0.06] py-24 md:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <motion.div
              {...fadeUp}
              className="grid items-center gap-10 rounded-3xl border border-white/[0.08] bg-[#0b0b0c] p-8 md:p-12 md:grid-cols-[1.2fr_1fr]"
            >
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#a855f7]">Bring your own key</p>
                <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-white">
                  Free to start. Your key when you need more.
                </h2>
                <p className="mt-5 leading-relaxed text-[#a1a1aa]">
                  ThoughtChain runs on Google&apos;s Gemini 2.5 Flash. If the shared quota runs out, paste in a free key from Google AI Studio and keep going.
                </p>
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-medium text-white transition-colors hover:border-white/30 hover:bg-white/[0.04]"
                >
                  Get a free Gemini key <ExternalLink className="size-3.5" />
                </a>
              </div>
              <ul className="space-y-4 text-sm">
                {[
                  ["Stored in your browser", "Your key is saved in local storage and sent only with your own requests."],
                  ["Temporary sessions", "Conversations live in a short-lived session that expires after a day."],
                  ["No account", "No sign-up, no email, nothing to cancel."],
                ].map(([title, text]) => (
                  <li key={title} className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#a855f7]" />
                    <span>
                      <span className="font-medium text-white">{title}</span>
                      <span className="mt-1 block leading-relaxed text-[#a1a1aa]">{text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden border-t border-white/[0.06] py-28 md:py-36">
          <div className="pointer-events-none absolute bottom-[-200px] left-1/2 h-[400px] w-[800px] max-w-full -translate-x-1/2 rounded-full bg-[#a855f7] opacity-[0.15] blur-[140px]" />
          <motion.div {...fadeUp} className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
            <h2 className="text-4xl md:text-6xl font-semibold tracking-[-0.035em] text-white">
              Follow every tangent.
              <br />
              <span className="text-[#71717a]">Never lose the thread.</span>
            </h2>
            <Link
              href="/chat"
              className="group mx-auto mt-10 flex h-12 w-full sm:w-fit items-center justify-center gap-2 rounded-full bg-white px-8 font-medium text-black transition-colors hover:bg-[#e4e4e7]"
            >
              Open ThoughtChain <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:px-6 py-8 text-sm text-[#71717a] sm:flex-row">
          <span className="flex items-center gap-2">
            <Network className="size-4" /> ThoughtChain
          </span>
          <span>Powered by Gemini</span>
        </div>
      </footer>
    </div>
  )
}
