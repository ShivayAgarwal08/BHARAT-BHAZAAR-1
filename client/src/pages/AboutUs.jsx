import { Link } from 'react-router-dom';
import {
  ArrowRight, Store, Users, TrendingUp, ShoppingBag, Briefcase,
  BarChart2, MessageSquare, Target, CheckCircle, Star, Handshake,
  Palette, GraduationCap, Heart, Sparkles, ShieldCheck
} from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="bg-background min-h-screen font-sans">

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-100 via-stone-50 to-background pt-20 pb-28 border-b border-slate-200/80">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10 space-y-6">
          <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-emerald-100/80 text-emerald-950 text-xs font-bold font-display tracking-widest uppercase shadow-2xs border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-800" />
            Our Mission & Story
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            India's local businesses deserve<br className="hidden sm:block" />
            <span className="text-emerald-900"> more than just a marketplace.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed">
            Bharat Bazaar connects artisans and local businesses with dedicated growth managers and conscious consumers — creating a complete, accountable ecosystem for Indian craft and commerce to flourish digitally.
          </p>

          <p className="text-xs font-bold font-display text-amber-800 uppercase tracking-widest">
            Local craft • Limitless possibilities
          </p>

          {/* Ecosystem Visual */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 max-w-2xl mx-auto pt-6">
            <div className="card-cream p-5 rounded-2xl border border-stone-200 flex-1 w-full text-center space-y-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 mx-auto flex items-center justify-center mb-2">
                <Palette className="w-5 h-5 text-emerald-800" />
              </div>
              <span className="font-bold font-display text-slate-900 block text-sm">Artisans</span>
              <span className="text-xs text-slate-500">Create & Sell</span>
            </div>

            <ArrowRight className="w-5 h-5 text-slate-400 hidden sm:block" />
            <span className="text-slate-400 sm:hidden">↓</span>

            <div className="card-cream p-5 rounded-2xl border border-stone-200 flex-1 w-full text-center space-y-1">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 mx-auto flex items-center justify-center mb-2">
                <GraduationCap className="w-5 h-5 text-amber-800" />
              </div>
              <span className="font-bold font-display text-slate-900 block text-sm">Growth Managers</span>
              <span className="text-xs text-slate-500">Scale & Operate</span>
            </div>

            <ArrowRight className="w-5 h-5 text-slate-400 hidden sm:block" />
            <span className="text-slate-400 sm:hidden">↓</span>

            <div className="card-cream p-5 rounded-2xl border border-stone-200 flex-1 w-full text-center space-y-1">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-900 mx-auto flex items-center justify-center mb-2">
                <Heart className="w-5 h-5 text-teal-800" />
              </div>
              <span className="font-bold font-display text-slate-900 block text-sm">Customers</span>
              <span className="text-xs text-slate-500">Discover & Cherish</span>
            </div>
          </div>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold font-display text-slate-400 uppercase tracking-widest block mb-2">The Real Challenge</span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-slate-900 mb-4">
            Talented makers are invisible online.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Millions of Indian artisans and small creators produce extraordinary handcrafted goods. But most lack the digital infrastructure, photography skills, social marketing, and operational bandwidth to reach buyers outside their geographic locality.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { icon: Store, title: 'No digital presence', desc: 'Craftspeople have no accessible way to showcase collections online with trustworthy credibility.' },
            { icon: TrendingUp, title: 'No growth support', desc: 'No dedicated partner to assist with listings, marketing campaigns, or performance analysis.' },
            { icon: Users, title: 'Restricted distribution', desc: 'Turnover remains bottlenecked by local foot traffic, seasonal fairs, and exploitative intermediaries.' },
          ].map((item, i) => (
            <div key={i} className="card p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-stone-100 text-emerald-900 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-emerald-800" />
              </div>
              <h3 className="font-bold font-display text-slate-900 text-base">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* THE BHARAT BAZAAR APPROACH */}
      <section className="py-20 px-6 bg-white border-y border-slate-200/80">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-xs font-bold font-display text-emerald-900 uppercase tracking-widest block mb-2">Our Distinct Approach</span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-slate-900 mb-4">
            Not just a catalog. An end-to-end growth platform.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Bharat Bazaar integrates three foundational pillars that have traditionally operated in silos:
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mt-12 text-left">
            <div className="card-cream p-6 rounded-2xl border border-stone-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-emerald-800" />
              </div>
              <h3 className="font-bold font-display text-slate-900 text-base">Direct Commerce</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                A verified marketplace where artisans list inventory with AI assistance and sell directly to customers across India with transparent pricing.
              </p>
            </div>

            <div className="card-cream p-6 rounded-2xl border border-stone-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                <Handshake className="w-5 h-5 text-amber-800" />
              </div>
              <h3 className="font-bold font-display text-slate-900 text-base">Human Partnerships</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated Growth Managers — university students and emerging professionals — who partner with artisans via signed agreements to run digital operations.
              </p>
            </div>

            <div className="card-cream p-6 rounded-2xl border border-stone-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-900 flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-teal-800" />
              </div>
              <h3 className="font-bold font-display text-slate-900 text-base">Actionable Intelligence</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Unified analytics, periodic metric reporting, and execution roadmaps that translate daily effort into measurable, compounding sales growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16 space-y-2">
          <span className="text-xs font-bold font-display text-slate-400 uppercase tracking-widest block">The End-to-End Workflow</span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-slate-900">
            A structured partnership journey.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            From listing the very first product to building sustainable, multi-channel commerce.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { step: '01', title: 'Register & Catalog', desc: 'Artisans onboard in English or Hindi, listing products with speech recognition and multi-provider AI descriptions.' },
            { step: '02', title: 'Nationwide Discovery', desc: 'Products go live on the storefront. Customers explore authentic regional crafts and order directly.' },
            { step: '03', title: 'Post Growth Need', desc: 'Artisans post formal growth requests outlining target business goals, marketing needs, or catalog support.' },
            { step: '04', title: 'Growth Partner Matching', desc: 'Vetted growth managers submit applications with their credentials, experience, and tailored strategy.' },
            { step: '05', title: 'Digital Agreement', desc: 'Both parties agree on scope, deliverables, and timelines, establishing an official digital contract.' },
            { step: '06', title: 'Execute in Workspace', desc: 'Collaborate within the dedicated partnership workspace with task checklists, milestones, and real-time messaging.' },
            { step: '07', title: 'Report & Prove Impact', desc: 'Log periodic performance updates, revenue metrics, and channel breakdowns with automated trend analysis.' },
            { step: '08', title: 'Sustained Ecosystem Growth', desc: 'Artisans increase revenue; Growth Managers build verified professional portfolios. Mutual prosperity.' },
          ].map((item, i) => (
            <div key={i} className="card p-5 flex gap-5 items-start hover:border-slate-300 transition-colors">
              <span className="text-2xl font-black font-display text-emerald-900/30 leading-none shrink-0 w-10">{item.step}</span>
              <div>
                <h3 className="font-bold font-display text-slate-900 text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* THREE ROLES */}
      <section className="py-20 px-6 bg-white border-y border-slate-200/80">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 space-y-2">
            <span className="text-xs font-bold font-display text-emerald-900 uppercase tracking-widest block">Our Ecosystem</span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-slate-900">
              Artisans create. Students grow. Customers cherish.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* ARTISANS */}
            <div className="card-cream p-6 rounded-2xl border border-stone-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center mb-4">
                  <Palette className="w-5 h-5 text-emerald-800" />
                </div>
                <h3 className="text-lg font-bold font-display text-slate-900 mb-3">For Artisans</h3>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  {[
                    'Direct customer reach without middlemen',
                    'Hindi & Hinglish voice listing generation',
                    'Dedicated Growth Manager matching',
                    'Digital formal partnership agreements',
                    'Real-time order and sales intelligence',
                    'Phone onboarding assistance if needed',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/register" className="btn-primary text-xs mt-6 w-full text-center">
                Start Selling As Artisan
              </Link>
            </div>

            {/* GROWTH MANAGERS */}
            <div className="card-cream p-6 rounded-2xl border border-stone-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center mb-4">
                  <GraduationCap className="w-5 h-5 text-amber-800" />
                </div>
                <h3 className="text-lg font-bold font-display text-slate-900 mb-3">For Growth Managers</h3>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  {[
                    'Real-world business management experience',
                    'Verified portfolio and client testimonials',
                    'Structured 6-month digital growth plans',
                    'Dedicated project collaboration workspace',
                    'Tier progression & reputation recognition',
                    'Tangible, measurable business impact',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/how-it-works/growth-manager" className="btn-secondary text-xs mt-6 w-full text-center">
                Become a Growth Partner
              </Link>
            </div>

            {/* CUSTOMERS */}
            <div className="card-cream p-6 rounded-2xl border border-stone-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-900 flex items-center justify-center mb-4">
                  <Heart className="w-5 h-5 text-teal-800" />
                </div>
                <h3 className="text-lg font-bold font-display text-slate-900 mb-3">For Conscious Buyers</h3>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  {[
                    '100% authentic handcrafted Indian crafts',
                    'Direct payment to verified creators',
                    'Maker provenance & craft origins',
                    'Reliable order delivery tracking',
                    'Preservation of heritage artforms',
                    'Direct buyer-artisan communication',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/marketplace" className="btn-accent text-xs mt-6 w-full text-center">
                Explore The Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WHY DIFFERENT */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12 space-y-2">
          <span className="text-xs font-bold font-display text-slate-400 uppercase tracking-widest block">Why Bharat Bazaar</span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-slate-900">
            Marketplace + Human Growth Partner + Digital Trust
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Traditional platforms stop at product listings. We combine digital commerce with operational talent, signed agreements, and transparent intelligence.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: Target, title: 'Execution Plans', desc: 'Concrete milestones with due dates and role assignment, not abstract advice.' },
            { icon: MessageSquare, title: 'Integrated Channels', desc: 'Secure real-time project messaging built right into the workspace.' },
            { icon: BarChart2, title: 'Verified Analytics', desc: 'Track catalog views, orders, revenue, and channel distribution in one place.' },
            { icon: Briefcase, title: 'Digital Agreements', desc: 'Formal digitized agreements signed electronically and exportable as PDF.' },
            { icon: Star, title: 'Reputation Governance', desc: 'Growth managers earn verified tiers; artisans provide authenticated reviews.' },
            { icon: ShieldCheck, title: 'No Hidden Lock-ins', desc: 'Artisans retain full brand ownership and control over their pricing and inventory.' },
          ].map((item, i) => (
            <div key={i} className="card p-5 flex gap-4 items-start">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0 mt-0.5">
                <item.icon className="w-4 h-4 text-emerald-800" />
              </div>
              <div>
                <h3 className="font-bold font-display text-slate-900 text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-emerald-950 text-white">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight">Ready to participate in Bharat's craft renaissance?</h2>
          <p className="text-sm sm:text-base text-emerald-100/80 max-w-xl mx-auto leading-relaxed">
            Whether you are an artisan bringing your craft online, a student seeking real-world operational impact, or a customer looking for authentic Indian heritage — you belong here.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link to="/register" className="btn-accent px-6 py-3 text-sm font-bold w-full sm:w-auto inline-flex items-center justify-center gap-2">
              Join Bharat Bazaar Today <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/marketplace" className="btn-outline px-6 py-3 text-sm font-bold text-white border-emerald-700 hover:bg-emerald-900 w-full sm:w-auto text-center">
              Explore Handcrafted Goods
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}