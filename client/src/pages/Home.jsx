import { Link } from 'react-router-dom';
import { ShoppingBag, Users, Sparkles, TrendingUp, Award, CheckCircle2, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#06372b] via-[#084d3c] to-[#0b634e] text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8 shadow-sm">
        {/* Subtle decorative artisan pattern background */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-emerald-100 text-xs font-bold uppercase tracking-wider border border-white/15 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Empowering India's Heritage Makers
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] text-white font-display">
              Local Craft. <br />
              <span className="text-amber-300 font-serif italic font-normal">Limitless</span> Possibilities.
            </h1>

            <p className="text-emerald-100/90 text-base sm:text-lg max-w-xl leading-relaxed font-normal">
              Bharat Bazaar bridges authentic rural Indian artisans directly with conscious customers and dedicated university student Growth Managers who build and scale their digital storefronts.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start pt-3">
              <Link
                to="/marketplace"
                className="px-8 py-3.5 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 text-center flex items-center justify-center gap-2 hover:-translate-y-0.5"
              >
                <ShoppingBag className="w-4 h-4" />
                Explore Marketplace
              </Link>
              {!user && (
                <Link
                  to="/register"
                  className="px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all border border-white/20 text-center flex items-center justify-center gap-2 backdrop-blur-sm hover:-translate-y-0.5"
                >
                  <Users className="w-4 h-4 text-emerald-200" />
                  Join as Artisan or Manager
                </Link>
              )}
            </div>

            {/* Quick stats ribbon */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 text-left">
              <div>
                <span className="block text-2xl font-extrabold text-white font-display">1,200+</span>
                <span className="text-xs text-emerald-200/80 font-medium">Verified Artisans</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-white font-display">100%</span>
                <span className="text-xs text-emerald-200/80 font-medium">Direct Proceeds</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-white font-display">350+</span>
                <span className="text-xs text-emerald-200/80 font-medium">Student Partners</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl space-y-6 text-white">
              <div className="flex items-center gap-4 border-b border-white/15 pb-5">
                <div className="w-12 h-12 bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 rounded-2xl font-black flex items-center justify-center text-xl shadow font-display">
                  BB
                </div>
                <div>
                  <h3 className="font-bold text-white text-base font-display">The Bharat Bazaar Ecosystem</h3>
                  <p className="text-xs text-emerald-200 font-medium">Customer • Artisan • Growth Manager</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-start gap-3.5 bg-white/10 p-3.5 rounded-2xl border border-white/10 transition-colors hover:bg-white/15">
                  <div className="p-2 bg-emerald-500/20 text-emerald-200 rounded-xl">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block text-sm font-display">1. Customer Marketplace</span>
                    <span className="text-emerald-100/80 leading-relaxed block mt-0.5">Discover genuine handmade textiles, terracotta, and jewelry directly from local creators.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 bg-white/10 p-3.5 rounded-2xl border border-white/10 transition-colors hover:bg-white/15">
                  <div className="p-2 bg-amber-500/20 text-amber-200 rounded-xl">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block text-sm font-display">2. Artisan Shop & AI Listing</span>
                    <span className="text-emerald-100/80 leading-relaxed block mt-0.5">Voice-to-listing creation in Hindi/English, real order tracking, and stock analytics.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 bg-white/10 p-3.5 rounded-2xl border border-white/10 transition-colors hover:bg-white/15">
                  <div className="p-2 bg-indigo-500/20 text-indigo-200 rounded-xl">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block text-sm font-display">3. Student Growth Managers</span>
                    <span className="text-emerald-100/80 leading-relaxed block mt-0.5">Contract-based student apprentices handling photography, storytelling, and promotion.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pillars Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="inline-block text-xs font-bold text-[#0b634e] uppercase tracking-wider bg-[#e3f6f0] px-3 py-1 rounded-full border border-emerald-200/50">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
            Designed for Every Participant
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            A collaborative model connecting regional creators, dedicated university talent, and mindful patrons.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Customer */}
          <div className="card p-8 flex flex-col justify-between hover:border-[#0b634e]/40 hover:shadow-xl transition-all duration-300 group">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#e3f6f0] text-[#0b634e] rounded-2xl flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-display">For Customers</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Browse handcrafted pottery, textiles, jewelry, and woodcraft. Support rural Indian artisans with direct orders, transparent prices, and zero middlemen markups.
              </p>
            </div>
            <Link
              to="/marketplace"
              className="text-[#0b634e] font-bold text-xs flex items-center gap-1.5 hover:underline pt-6 border-t border-[#f0ebe1] mt-6"
            >
              Browse Marketplace <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Artisan */}
          <div className="card p-8 flex flex-col justify-between hover:border-[#0b634e]/40 hover:shadow-xl transition-all duration-300 group bg-gradient-to-b from-white to-[#faf6ef]">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-800 rounded-2xl flex items-center justify-center font-bold group-hover:scale-105 transition-transform border border-amber-200/40">
                <TrendingUp className="w-6 h-6 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-display">For Artisans</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Create digital listings in seconds using speech/voice input in Hindi or English. Post growth requests to get hands-on assistance from university student Growth Managers.
              </p>
            </div>
            <Link
              to="/how-it-works/artisan"
              className="text-[#0b634e] font-bold text-xs flex items-center gap-1.5 hover:underline pt-6 border-t border-[#f0ebe1] mt-6"
            >
              Grow Your Business <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Growth Manager */}
          <div className="card p-8 flex flex-col justify-between hover:border-[#0b634e]/40 hover:shadow-xl transition-all duration-300 group">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-800 rounded-2xl flex items-center justify-center font-bold group-hover:scale-105 transition-transform border border-indigo-100">
                <Award className="w-6 h-6 text-indigo-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-display">For Growth Managers</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Act as the artisan's personal digital partner. Optimize product listings, shoot photography, manage promotion, and build verified e-commerce credentials.
              </p>
            </div>
            <Link
              to="/how-it-works/growth-manager"
              className="text-[#0b634e] font-bold text-xs flex items-center gap-1.5 hover:underline pt-6 border-t border-[#f0ebe1] mt-6"
            >
              Apply as Manager <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contract & Trust Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-cream rounded-3xl p-8 sm:p-12 space-y-8 border border-[#e8decb]">
          <div className="max-w-3xl space-y-2.5">
            <span className="inline-block text-xs font-bold text-amber-800 uppercase tracking-wider bg-amber-100/70 px-3 py-1 rounded-full border border-amber-200">
              Formal Partnership
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              Contract-Governed Collaboration
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every artisan and Growth Manager relationship is established through structured, milestone-based digital agreements with transparent scopes and verified reputation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#ded6c9] space-y-2.5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-[#e3f6f0] text-[#0b634e] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-[#0b634e]" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm font-display">Configurable Tiers</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Starter, Growth, Pro, and Expert student skill levels matched to artisan needs.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#ded6c9] space-y-2.5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-[#e3f6f0] text-[#0b634e] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-[#0b634e]" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm font-display">Defined Scope</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Clear deliverables for cataloguing, product storytelling, and packaging guidelines.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#ded6c9] space-y-2.5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-[#e3f6f0] text-[#0b634e] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-[#0b634e]" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm font-display">Fair Compensation</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Support for zero-cost pro-bono university projects, fixed project stipends, or hourly rates.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#ded6c9] space-y-2.5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-[#e3f6f0] text-[#0b634e] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-[#0b634e]" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm font-display">Real Growth Analytics</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Transparent tracking of product views, orders placed, customer feedback, and sales volume.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
