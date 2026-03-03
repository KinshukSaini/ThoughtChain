'use client';

import Link from "next/link"
import { Network, ArrowRight, GitBranch, Layers, Map, Sparkles, Zap, Shield, CodeXml } from "lucide-react"
import { motion } from "framer-motion"

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as any }
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#030303] text-[#f5f5f5] selection:bg-[#a855f7]/30 font-sans overflow-x-hidden relative">
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-[100%] bg-[#a855f7] opacity-[0.06] blur-[120px] mix-blend-screen" />
        <div className="absolute top-[40%] right-[-10%] w-[40%] h-[40%] rounded-[100%] bg-[#c084fc] opacity-[0.04] blur-[100px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] rounded-[100%] bg-[#a855f7] opacity-[0.03] blur-[100px] mix-blend-screen" />
      </div>

      <header className="fixed w-full top-0 z-50 flex h-20 items-center justify-between border-b border-white/[0.08] bg-[rgba(15,15,15,0.7)] px-8 backdrop-blur-[16px]">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-linear-to-br from-[#a855f7] to-[#c084fc] flex items-center justify-center shadow-lg shadow-[#a855f7]/20">
            <Network className="size-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight font-mono text-white">ThoughtChain</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/chat">
            <button className="relative group h-10 rounded-full px-6 text-sm font-semibold text-white overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300">
              <span className="relative z-10 flex items-center gap-2">
                Open App <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent group-hover:animate-shimmer" />
            </button>
          </Link>
        </div>
      </header>

      <main className="flex-1 relative z-10 pt-20">
        {/* Hero Section */}
        <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
          <div className="container mx-auto px-8 sm:px-12 md:px-16 lg:px-20 xl:px-32 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-12">

              {/* Left text */}
              <motion.div
                className="flex-1 text-center lg:text-left"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-[#a1a1aa] mb-8 shadow-inner shadow-white/5 backdrop-blur-md">
                  <Sparkles className="size-4 text-[#a855f7]" />
                  <span className="font-mono text-xs uppercase tracking-wider text-[#d4d4d8]">AI Laboratory Interface</span>
                </motion.div>

                <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl font-extrabold tracking-tight md:text-5xl lg:text-6xl mb-6 leading-[1.15]">
                  Study Without Losing Your{" "}
                  <span className="relative inline-block text-transparent bg-clip-text bg-linear-to-r from-[#a855f7] via-[#c084fc] to-[#e879f9]">
                    Train of Thought
                    <div className="absolute -bottom-2 left-0 w-full h-4 bg-[#a855f7]/20 blur-xl rounded-full" />
                  </span>
                </motion.h1>

                <motion.p variants={itemVariants} className="text-lg md:text-xl text-[#a1a1aa] max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed font-light">
                  ThoughtChain helps you stay focused by letting you move up or dive deeper into context levels, instead of drowning in one long, messy chat.
                </motion.p>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start items-center">
                  <Link href="/chat">
                    <button className="group relative h-14 rounded-full bg-linear-to-b from-[#a855f7] to-[#8b5cf6] px-8 text-base font-bold text-white shadow-xl shadow-[#a855f7]/30 hover:shadow-[#a855f7]/50 transition-all duration-300 flex items-center gap-3 overflow-hidden">
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                      <span className="relative z-10">Initialize Workspace</span>
                      <ArrowRight className="relative z-10 size-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Right Hero Graphic */}
              <motion.div
                className="flex-1 relative w-full max-w-lg mx-auto lg:max-w-none lg:w-auto h-[350px] md:h-[450px] mt-8 lg:mt-0"
                initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                style={{ perspective: "1000px" }}
              >
                <div className="relative w-full h-full transform-gpu" style={{ transformStyle: "preserve-3d" }}>
                  {/* Central glowing orb */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#a855f7] rounded-full blur-[100px] opacity-20 animate-pulse" />

                  {/* SVG Edges connecting nodes */}
                  <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                    <defs>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
                      d="M 120 120 C 180 200, 260 180, 320 220"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="2"
                    />
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, delay: 0.7, ease: "easeInOut" }}
                      d="M 320 220 C 280 280, 200 320, 160 340"
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="2"
                      filter="url(#glow)"
                      className="animate-pulse"
                    />
                    <motion.path
                      initial={{ strokeDashoffset: 100 }}
                      animate={{ strokeDashoffset: 0 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      d="M 120 120 C 110 250, 130 300, 160 340"
                      fill="none"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="2"
                      strokeDasharray="6 6"
                    />
                  </svg>

                  {/* Floating Nodes */}
                  <motion.div
                    animate={{ y: [-8, 8, -8] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[20%] left-[15%] w-28 md:w-36 p-3 md:p-4 bg-[#111111] border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col gap-3 z-20 scale-90 md:scale-100"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="size-2 rounded-full bg-white/50" />
                      <div className="h-1.5 w-16 bg-white/30 rounded-full" />
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full" />
                    <div className="h-1.5 w-4/5 bg-white/10 rounded-full" />
                  </motion.div>

                  <motion.div
                    animate={{ y: [10, -10, 10] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-[45%] right-[5%] w-32 md:w-44 p-3 md:p-5 bg-[#1a0f2e] border border-[#a855f7]/40 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.2)] flex flex-col gap-3 z-20 scale-90 md:scale-110"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="size-2.5 rounded-full bg-[#c084fc] shadow-[0_0_8px_#c084fc]" />
                      <div className="h-2 w-20 bg-[#c084fc]/80 rounded-full" />
                    </div>
                    <div className="h-1.5 w-full bg-white/20 rounded-full" />
                    <div className="h-1.5 w-5/6 bg-white/20 rounded-full" />
                    <div className="h-1.5 w-4/6 bg-white/20 rounded-full" />
                  </motion.div>

                  <motion.div
                    animate={{ y: [-6, 6, -6], x: [-3, 3, -3] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[10%] left-[30%] w-32 md:w-40 p-3 md:p-4 bg-[#111111] border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col gap-3 z-10 opacity-80 scale-90 md:scale-100"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="size-2 rounded-full bg-white/30" />
                      <div className="h-1.5 w-14 bg-white/20 rounded-full" />
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full" />
                    <div className="h-1.5 w-3/4 bg-white/10 rounded-full" />
                  </motion.div>

                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* The Problem / Visual Nodes */}
        <section className="py-24 relative border-y border-white/[0.05] bg-black/40 backdrop-blur-3xl">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

          <div className="container mx-auto px-6 max-w-6xl relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 font-mono tracking-tighter">
                The Problem with Linear Chats
              </h2>
              <p className="text-xl text-[#a1a1aa] max-w-2xl mx-auto">When your context keeps piling up, the AI forgets what matters.</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: GitBranch, title: "Unintended Branching", text: "One question leads to another, pulling you totally off course." },
                { icon: Layers, title: "Infinite Context", text: "The AI's memory builds up with irrelevant details, confusing its answers." },
                { icon: Map, title: "Disjointed Workflows", text: "You end up opening 5 different tabs just to keep concepts separate." }
              ].map((feature, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  key={i}
                  className="group relative bg-[rgba(15,15,15,0.6)] border border-white/[0.08] rounded-3xl p-8 hover:bg-[rgba(25,25,25,0.8)] hover:border-[#a855f7]/50 transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#a855f7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#a855f7]/10 group-hover:border-[#a855f7]/30 transition-all duration-300">
                    <feature.icon className="size-6 text-[#a855f7]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 font-mono tracking-tight">{feature.title}</h3>
                  <p className="text-[#a1a1aa] leading-relaxed">{feature.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Visual Map Demo Section */}
        <section className="py-32 relative overflow-hidden">
          <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="flex-1 space-y-8"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/30 text-sm text-[#c084fc] font-mono">
                  <Zap className="size-4" /> Topology Maps
                </div>
                <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tighter">
                  Navigate Thoughts <br /> Like a Tech Tree
                </h2>
                <p className="text-xl text-[#a1a1aa] leading-relaxed font-light">
                  Control which context the AI applies. Select any node in your visual history to isolate the conversation, allowing deep-dives without polluting your main objective.
                </p>
                <ul className="space-y-4 pt-4">
                  {[
                    "Local context isolation",
                    "Parent-child inheritance",
                    "Clean branch hopping"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 text-lg text-[#d4d4d8]">
                      <div className="size-6 rounded-full bg-[#a855f7]/20 flex items-center justify-center border border-[#a855f7]/30">
                        <div className="size-2 rounded-full bg-[#a855f7]" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="flex-1 relative w-full aspect-square md:aspect-[4/3] bg-[rgba(15,15,15,0.5)] border border-white/10 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl shadow-black ring-1 ring-white/5"
              >
                {/* Simulated Graph UI */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-[300px] h-[300px]">
                    {/* Node 1 */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 p-3 bg-white/5 border border-white/20 rounded-xl backdrop-blur-md shadow-lg flex flex-col items-center">
                      <div className="text-[10px] text-[#a1a1aa] font-mono mb-1">Root.tsx</div>
                      <div className="h-1 w-12 bg-[#a855f7] rounded-full" />
                    </div>
                    {/* Edges */}
                    <svg className="absolute top-[48px] left-[50%] w-[150px] h-[100px] overflow-visible z-[-1]">
                      <path d="M 0 0 C 0 50, -100 50, -100 100" fill="none" stroke="#555" strokeWidth="2" strokeDasharray="4 4" />
                      <path d="M 0 0 C 0 50, 100 50, 100 100" fill="none" stroke="#a855f7" strokeWidth="2" className="animate-pulse" />
                    </svg>
                    {/* Node 2 */}
                    <div className="absolute top-[148px] left-[10%] -translate-x-1/2 w-32 p-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md shadow-lg opacity-50 flex flex-col items-center">
                      <div className="text-[10px] text-[#a1a1aa] font-mono mb-1">Branch A</div>
                    </div>
                    {/* Node 3 (Active) */}
                    <div className="absolute top-[148px] left-[90%] -translate-x-1/2 w-36 p-4 bg-[rgba(15,15,15,0.8)] border border-[#a855f7] rounded-xl backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.3)] flex flex-col items-center transform scale-105">
                      <div className="text-[10px] text-white font-mono mb-2">Focus Mode</div>
                      <div className="h-1.5 w-16 bg-linear-to-r from-[#a855f7] to-[#c084fc] rounded-full" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Security & Access */}
        <section className="py-24 border-y border-white/5 bg-black/50">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <Shield className="size-12 text-[#a855f7] mx-auto mb-6" />
              <h2 className="text-3xl md:text-5xl font-bold mb-6 font-mono tracking-tighter">Bring Your Own Key</h2>
              <p className="text-xl text-[#a1a1aa]">Your data stays in your browser. Fully transparent. Zero lock-in.</p>
            </motion.div>

            <div className="bg-[rgba(15,15,15,0.6)] border border-white/10 p-8 md:p-12 rounded-3xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#a855f7] opacity-5 blur-[100px]" />
              <div className="flex flex-col md:flex-row items-center gap-8 justify-between relative z-10">
                <div className="text-left">
                  <h3 className="text-2xl font-bold font-mono mb-2">Google Gemini API</h3>
                  <p className="text-[#a1a1aa]">Get a free API key from Google AI Studio to unlock ThoughtChain instantly.</p>
                </div>
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 rounded-full text-white font-semibold transition-colors"
                >
                  <CodeXml className="size-5" /> Get API Key
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#a855f7]/10 via-transparent to-transparent pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center relative z-10"
          >
            <h2 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tighter">
              Enter the <span className="text-transparent bg-clip-text bg-linear-to-r from-[#a855f7] to-[#c084fc]">Laboratory</span>
            </h2>
            <Link href="/chat">
              <button className="group relative h-16 rounded-full bg-white px-12 text-xl font-bold text-black shadow-2xl shadow-white/10 hover:shadow-white/20 transition-all duration-300 flex items-center gap-3 mx-auto hover:bg-gray-200">
                Launch Workspace
                <ArrowRight className="size-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-white/[0.08] bg-black px-8 py-8 relative z-20">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between text-[#a1a1aa] text-sm">
          <div className="flex items-center gap-2 font-mono">
            <Network className="size-4" /> ThoughtChain Core
          </div>
          <p className="mt-4 md:mt-0 font-mono text-xs">STATUS: ONLINE / POWERED BY GEMINI</p>
        </div>
      </footer>
    </div>
  )
}

