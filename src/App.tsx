import { Flame, Github, Shield, Clock, Zap, CheckCircle2, Code } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-[#010409] text-gray-100">
      <nav className="sticky top-0 z-50 bg-[#010409]/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Flame className="w-6 h-6 text-[#39d353]" />
              <span className="text-xl font-bold">Streak Companion</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How it Works</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</a>
            </div>

            <button className="px-4 py-2 text-sm font-medium text-white border border-gray-700 rounded-md hover:bg-gray-800 transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2ea043]/5 to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-32 sm:pb-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Never Break Your GitHub
              <span className="block text-[#39d353] mt-2">Streak Again</span>
            </h1>

            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
              Build a consistent coding habit with daily smart reminders and micro-task suggestions.
              <span className="block mt-2">No bots, just genuine productivity.</span>
            </p>

            <button className="group relative inline-flex items-center space-x-3 bg-[#2ea043] hover:bg-[#39d353] text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg shadow-[#2ea043]/20">
              <Github className="w-6 h-6" />
              <span>Continue with GitHub</span>
            </button>

            <div className="mt-16 max-w-4xl mx-auto">
              <div className="bg-[#0d1117] border border-gray-800 rounded-lg p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Flame className="w-5 h-5 text-[#39d353]" />
                    <span className="text-sm font-medium">Streak Saved!</span>
                  </div>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Your reminder helped you maintain a 147-day streak
                </p>
                <div className="flex space-x-1">
                  {[...Array(52)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-sm ${
                        i < 48 ? 'bg-[#39d353]' : i < 51 ? 'bg-[#2ea043]' : 'bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 bg-[#0d1117]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg">Three simple steps to maintain your coding momentum</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-[#010409] border border-gray-800 rounded-lg p-8 hover:border-[#2ea043] transition-colors">
                <div className="w-12 h-12 bg-[#2ea043]/10 rounded-lg flex items-center justify-center mb-6">
                  <Github className="w-6 h-6 text-[#39d353]" />
                </div>
                <div className="text-[#39d353] font-bold text-sm mb-2">STEP 1</div>
                <h3 className="text-xl font-bold mb-3">Connect</h3>
                <p className="text-gray-400">Sign in with GitHub securely. We only access public contribution data.</p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-[#010409] border border-gray-800 rounded-lg p-8 hover:border-[#2ea043] transition-colors">
                <div className="w-12 h-12 bg-[#2ea043]/10 rounded-lg flex items-center justify-center mb-6">
                  <Clock className="w-6 h-6 text-[#39d353]" />
                </div>
                <div className="text-[#39d353] font-bold text-sm mb-2">STEP 2</div>
                <h3 className="text-xl font-bold mb-3">Schedule</h3>
                <p className="text-gray-400">Set your preferred coding time. Get reminders that respect your timezone.</p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-[#010409] border border-gray-800 rounded-lg p-8 hover:border-[#2ea043] transition-colors">
                <div className="w-12 h-12 bg-[#2ea043]/10 rounded-lg flex items-center justify-center mb-6">
                  <Code className="w-6 h-6 text-[#39d353]" />
                </div>
                <div className="text-[#39d353] font-bold text-sm mb-2">STEP 3</div>
                <h3 className="text-xl font-bold mb-3">Commit</h3>
                <p className="text-gray-400">Get micro-task ideas when stuck. Push real code and keep your flame lit.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-gray-400 text-lg">Everything you need to build a sustainable coding habit</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-[#0d1117] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
              <Clock className="w-8 h-8 text-[#39d353] mb-4" />
              <h3 className="text-lg font-bold mb-2">Smart Scheduling</h3>
              <p className="text-gray-400 text-sm">Browser notifications that respect your timezone and coding routine.</p>
            </div>

            <div className="bg-[#0d1117] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
              <Zap className="w-8 h-8 text-[#39d353] mb-4" />
              <h3 className="text-lg font-bold mb-2">Micro-Task Engine</h3>
              <p className="text-gray-400 text-sm">Don't know what to code? Get ideas like "Refactor a variable" or "Update documentation".</p>
            </div>

            <div className="bg-[#0d1117] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
              <Shield className="w-8 h-8 text-[#39d353] mb-4" />
              <h3 className="text-lg font-bold mb-2">Privacy First</h3>
              <p className="text-gray-400 text-sm">We don't read your private code. We only track public commit timestamps.</p>
            </div>

            <div className="bg-[#0d1117] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
              <Flame className="w-8 h-8 text-[#39d353] mb-4" />
              <h3 className="text-lg font-bold mb-2">Streak Analytics</h3>
              <p className="text-gray-400 text-sm">Track your progress with detailed insights into your contribution patterns.</p>
            </div>

            <div className="bg-[#0d1117] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
              <CheckCircle2 className="w-8 h-8 text-[#39d353] mb-4" />
              <h3 className="text-lg font-bold mb-2">Daily Motivation</h3>
              <p className="text-gray-400 text-sm">Get gentle nudges and celebrate milestones to stay motivated.</p>
            </div>

            <div className="bg-[#0d1117] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
              <Code className="w-8 h-8 text-[#39d353] mb-4" />
              <h3 className="text-lg font-bold mb-2">Real Coding Only</h3>
              <p className="text-gray-400 text-sm">We encourage genuine work, not automated commits that violate GitHub ToS.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-24 bg-[#0d1117]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Loved by Developers</h2>
            <p className="text-gray-400 text-lg">Join thousands building consistent coding habits</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#010409] border border-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-[#2ea043] rounded-full flex items-center justify-center font-bold">
                  S
                </div>
                <div>
                  <div className="font-semibold">Sarah Chen</div>
                  <div className="text-sm text-gray-500">@sarahcodes</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                "Went from sporadic commits to a 200+ day streak. The micro-task suggestions are genuinely helpful!"
              </p>
            </div>

            <div className="bg-[#010409] border border-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-[#2ea043] rounded-full flex items-center justify-center font-bold">
                  M
                </div>
                <div>
                  <div className="font-semibold">Marcus Johnson</div>
                  <div className="text-sm text-gray-500">@marcusj</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                "Finally a tool that respects GitHub's ToS. No fake commits, just real motivation to code daily."
              </p>
            </div>

            <div className="bg-[#010409] border border-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-[#2ea043] rounded-full flex items-center justify-center font-bold">
                  A
                </div>
                <div>
                  <div className="font-semibold">Aisha Patel</div>
                  <div className="text-sm text-gray-500">@aishap</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                "The smart reminders fit perfectly into my schedule. My coding habit has never been stronger!"
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#0d1117] border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#010409] border-2 border-[#2ea043]/30 rounded-lg p-8 text-center">
            <Shield className="w-12 h-12 text-[#39d353] mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-3">100% Ethical & GitHub ToS Compliant</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Streak Companion does <strong className="text-white">NOT</strong> automate commits or generate fake contributions.
              We provide reminders and task suggestions to help you write <strong className="text-white">real code</strong> consistently.
              All contributions are genuine work created by you.
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-[#010409] border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Flame className="w-5 h-5 text-[#39d353]" />
              <span className="font-bold">Streak Companion</span>
            </div>

            <div className="flex space-x-8 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>

          <div className="text-center mt-8 text-sm text-gray-500">
            &copy; 2025 Streak Companion. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
