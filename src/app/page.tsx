import Link from "next/link"
import { Network, ArrowRight, GitBranch, Layers, Map } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0b] text-[#f5f5f5] selection:bg-[#a855f7]/30">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/5 bg-[#0a0a0b]/80 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">ThoughtChain</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/chat">
            <button className="h-8 rounded-full border-2 border-[#a855f7] px-5 text-sm font-semibold text-white shadow hover:bg-[#a855f7]/90 transition-colors">
              Get Started
            </button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-52 pb-48 md:pt-56 md:pb-52">
          <div className="absolute inset-0 pointer-events-none" />
          <div className="container mx-auto px-6 text-center max-w-5xl relative z-10">
            
            <h1 className="text-5xl font-bold tracking-tight md:text-7xl mb-8 leading-tight">
              Study Without Losing Your{" "}
              <span className="bg-linear-to-r from-[#a855f7] to-[#c084fc] bg-clip-text text-transparent">
                Train of Thought
              </span>
            </h1>
            <p className="text-lg md:text-xl text-[#a1a1aa] max-w-3xl mx-auto mb-8 leading-relaxed">
              ThoughtChain helps you stay focused by letting you move up or dive deeper into context levels, 
              instead of drowning in one long, messy chat.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/chat">
                <button className="group h-14 rounded-full bg-[#a855f7] px-10 text-lg font-bold text-white shadow-lg shadow-[#a855f7]/30 hover:shadow-[#a855f7]/50 hover:bg-[#9333ea] transition-all duration-200 flex items-center gap-2">
                  Get Started
                  <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Problem Statement */}
        <section className="py-20 md:py-32 bg-[#0f0f10] border-y border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#a855f7]/5 via-transparent to-transparent pointer-events-none" />
          <div className="container mx-auto px-6 max-w-5xl relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                The Problem with <span className="text-[#a855f7]">Linear Chats</span>
              </h2>
              <p className="text-xl text-[#a1a1aa] max-w-2xl mx-auto">When you're studying:</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="group bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8 hover:border-[#a855f7]/30 hover:shadow-lg hover:shadow-[#a855f7]/10 transition-all duration-300">
                <div className="size-12 rounded-xl bg-[#a855f7]/10 flex items-center justify-center mb-4 group-hover:bg-[#a855f7]/20 transition-colors">
                  <GitBranch className="size-6 text-[#a855f7]" />
                </div>
                <p className="text-lg text-[#d4d4d8]">One question leads to another</p>
              </div>
              <div className="group bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8 hover:border-[#a855f7]/30 hover:shadow-lg hover:shadow-[#a855f7]/10 transition-all duration-300">
                <div className="size-12 rounded-xl bg-[#a855f7]/10 flex items-center justify-center mb-4 group-hover:bg-[#a855f7]/20 transition-colors">
                  <Layers className="size-6 text-[#a855f7]" />
                </div>
                <p className="text-lg text-[#d4d4d8]">Topics branch unexpectedly</p>
              </div>
              <div className="group bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8 hover:border-[#a855f7]/30 hover:shadow-lg hover:shadow-[#a855f7]/10 transition-all duration-300">
                <div className="size-12 rounded-xl bg-[#a855f7]/10 flex items-center justify-center mb-4 group-hover:bg-[#a855f7]/20 transition-colors">
                  <Map className="size-6 text-[#a855f7]" />
                </div>
                <p className="text-lg text-[#d4d4d8]">Context keeps piling up</p>
              </div>
            </div>
            
            <div className="text-center mb-12">
              <p className="text-xl text-[#a1a1aa] mb-8">
                Soon, the AI remembers everything — even what you don't want it to.
              </p>
              
              <div className="max-w-xl mx-auto bg-white/[0.02] border border-white/5 rounded-2xl p-8 mb-8">
                <p className="text-lg font-semibold text-white mb-6">To fix this, most people:</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-2 rounded-full bg-[#a855f7]" />
                    <p className="text-[#a1a1aa]">Open 2–3 chat tabs</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-2 rounded-full bg-[#a855f7]" />
                    <p className="text-[#a1a1aa]">Copy-paste questions</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-2 rounded-full bg-[#a855f7]" />
                    <p className="text-[#a1a1aa]">Manually rebuild context</p>
                  </div>
                </div>
              </div>
              
              <p className="text-2xl font-bold text-[#a855f7]">
                It's inefficient and breaks your flow.
              </p>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                A <span className="text-[#a855f7]">Smarter Way</span> to Handle Context
              </h2>
              <p className="text-xl md:text-2xl text-[#d4d4d8] mb-6 font-medium">
                ThoughtChain introduces context levels.
              </p>
              <p className="text-lg text-[#a1a1aa] max-w-3xl mx-auto">
                Instead of one endless conversation, your learning becomes a tree of ideas:
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-br from-[#a855f7]/20 to-[#a855f7]/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 rounded-2xl p-8 hover:border-[#a855f7]/30 transition-all duration-300">
                  <div className="size-16 rounded-2xl bg-[#a855f7]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <GitBranch className="size-8 text-[#a855f7]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Stay on Topic</h3>
                  <p className="text-[#a1a1aa]">Keep your current conversation focused without distractions</p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-br from-[#a855f7]/20 to-[#a855f7]/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 rounded-2xl p-8 hover:border-[#a855f7]/30 transition-all duration-300">
                  <div className="size-16 rounded-2xl bg-[#a855f7]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Layers className="size-8 text-[#a855f7]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Dive Deeper</h3>
                  <p className="text-[#a1a1aa]">Explore sub-topics in their own branches without clutter</p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-br from-[#a855f7]/20 to-[#a855f7]/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 rounded-2xl p-8 hover:border-[#a855f7]/30 transition-all duration-300">
                  <div className="size-16 rounded-2xl bg-[#a855f7]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <ArrowRight className="size-8 text-[#a855f7]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Jump Back</h3>
                  <p className="text-[#a1a1aa]">Return to higher-level ideas anytime with clean context</p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="inline-block px-8 py-4 shadow-2xl">
                <p className="text-xl font-semibold text-white">
                  "You decide how much context the AI should see"
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 md:py-32 bg-[#0f0f10] border-y border-white/5">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Learn Like Your Brain <span className="text-[#a855f7]">Actually Thinks</span>
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#a855f7] text-xl font-bold text-white shadow-lg shadow-[#a855f7]/30">
                    1
                  </div>
                  <div className="pt-1">
                    <h3 className="font-bold text-2xl mb-3">Start a topic</h3>
                    <p className="text-[#a1a1aa] text-lg">Ask your question normally.</p>
                  </div>
                </div>
                
                <div className="flex gap-6">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#a855f7] text-xl font-bold text-white shadow-lg shadow-[#a855f7]/30">
                    2
                  </div>
                  <div className="pt-1">
                    <h3 className="font-bold text-2xl mb-3">Go deeper when needed</h3>
                    <p className="text-[#a1a1aa] text-lg">Explore side concepts without polluting the main discussion.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#a855f7] text-xl font-bold text-white shadow-lg shadow-[#a855f7]/30">
                    3
                  </div>
                  <div className="pt-1">
                    <h3 className="font-bold text-2xl mb-3">Move up a level</h3>
                    <p className="text-[#a1a1aa] text-lg">With just a click return to the bigger picture with clean context.</p>
                  </div>
                </div>
                
                <div className="flex gap-6">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#a855f7] text-xl font-bold text-white shadow-lg shadow-[#a855f7]/30">
                    4
                  </div>
                  <div className="pt-1">
                    <h3 className="font-bold text-2xl mb-3">Visualize everything</h3>
                    <p className="text-[#a1a1aa] text-lg">See your entire learning journey as a structured tree.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Key Features</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="group bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-10 hover:border-[#a855f7]/30 hover:shadow-2xl hover:shadow-[#a855f7]/10 transition-all duration-300">
                <div className="size-14 rounded-2xl bg-[#a855f7]/10 flex items-center justify-center mb-6 group-hover:bg-[#a855f7]/20 transition-colors">
                  <Network className="size-7 text-[#a855f7]" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Context as a Tree, Not a Mess</h3>
                <p className="text-[#a1a1aa] text-lg leading-relaxed">
                  Your conversations are organized into branches, not buried in chat history.
                </p>
              </div>
              
              <div className="group bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-10 hover:border-[#a855f7]/30 hover:shadow-2xl hover:shadow-[#a855f7]/10 transition-all duration-300">
                <div className="size-14 rounded-2xl bg-[#a855f7]/10 flex items-center justify-center mb-6 group-hover:bg-[#a855f7]/20 transition-colors">
                  <Layers className="size-7 text-[#a855f7]" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Move Up or Down Levels</h3>
                <p className="text-[#a1a1aa] mb-4 text-lg">Control whether the AI responds with:</p>
                <ul className="space-y-3 text-[#a1a1aa] text-lg">
                  <li className="flex items-center gap-3">
                    <div className="size-2 rounded-full bg-[#a855f7]" />
                    <span>Local context (focused)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="size-2 rounded-full bg-[#a855f7]" />
                    <span>Parent context (broader)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="size-2 rounded-full bg-[#a855f7]" />
                    <span>Full path (complete understanding)</span>
                  </li>
                </ul>
              </div>
              
              <div className="group bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-10 hover:border-[#a855f7]/30 hover:shadow-2xl hover:shadow-[#a855f7]/10 transition-all duration-300">
                <div className="size-14 rounded-2xl bg-[#a855f7]/10 flex items-center justify-center mb-6 group-hover:bg-[#a855f7]/20 transition-colors">
                  <GitBranch className="size-7 text-[#a855f7]" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Stay in the Flow</h3>
                <p className="text-[#a1a1aa] text-lg leading-relaxed">
                  No more switching tabs or restarting explanations.
                </p>
              </div>
              
              <div className="group bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-10 hover:border-[#a855f7]/30 hover:shadow-2xl hover:shadow-[#a855f7]/10 transition-all duration-300">
                <div className="size-14 rounded-2xl bg-[#a855f7]/10 flex items-center justify-center mb-6 group-hover:bg-[#a855f7]/20 transition-colors">
                  <Map className="size-7 text-[#a855f7]" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Visual Learning Map</h3>
                <p className="text-[#a1a1aa] text-lg leading-relaxed">
                  Understand where you are and how you got there.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Closing CTA */}
        <section className="py-24 md:py-40 relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-[#a855f7]/10 via-transparent to-transparent pointer-events-none" />
          <div className="container mx-auto px-6 text-center max-w-5xl relative z-10">
            <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              Stop Restarting Chats.<br />
              <span className="bg-linear-to-r from-[#a855f7] to-[#c084fc] bg-clip-text text-transparent">
                Start Navigating Your Thoughts.
              </span>
            </h2>
            <div className="space-y-3 mb-12">
              <p className="text-xl md:text-2xl text-[#d4d4d8]">
                Study with clarity, structure, and control.
              </p>
              <p className="text-xl md:text-2xl text-[#d4d4d8]">
                Build your knowledge — one branch at a time.
              </p>
            </div>
            <Link href="/chat">
              <button className="group h-16 rounded-full bg-[#a855f7] px-12 text-xl font-bold text-white shadow-2xl shadow-[#a855f7]/40 hover:shadow-[#a855f7]/60 hover:bg-[#9333ea] transition-all duration-200 flex items-center gap-3 mx-auto">
                Start Learning Smarter
                <ArrowRight className="size-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-[#0a0a0b] px-6 py-12">
        <div className="container mx-auto flex flex-col items-center justify-center md:flex-row">
          <p className="text-xs text-[#a1a1aa]">© 2025 ThoughtChain. Powered by Gemini.</p>
        </div>
      </footer>
    </div>
  )
}
