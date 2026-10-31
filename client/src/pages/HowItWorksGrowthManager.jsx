import { ArrowRight, Search, Target, ClipboardList, Briefcase, TrendingUp, Award, BarChart3, CheckCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

function TimelineItem({ month, title, desc }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-16 shrink-0 text-right">
        <span className="text-[10px] font-bold font-display text-slate-400 uppercase tracking-wider">{month}</span>
      </div>
      <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-400 shrink-0 shadow-2xs"></div>
      <div className="space-y-0.5">
        <h4 className="text-xs font-bold text-white">{title}</h4>
        <p className="text-[11px] text-slate-300 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function HowItWorksGrowthManager() {
  return (
    <div className="bg-background min-h-screen font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 pt-20 pb-28 border-b border-emerald-800">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-emerald-800/30 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-amber-600/20 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-6">
          <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 text-amber-300 border border-white/10 text-xs font-bold font-display tracking-widest uppercase shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            For Students & Emerging Operators
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display text-white tracking-tight leading-tight">
            Turn your digital skills into <br className="hidden sm:block" />
            <span className="text-amber-300"> real, verifiable business impact.</span>
          </h1>
          <p className="text-base sm:text-lg text-emerald-100/90 font-medium max-w-2xl mx-auto leading-relaxed">
            You are not simply completing disconnected freelance gigs. You become an artisan's strategic digital partner — expanding their national reach and building a verified portfolio of real-world results.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/register" className="btn-accent text-sm px-6 py-3 flex items-center justify-center gap-2">
              Become a Growth Manager <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* The Journey */}
      <section className="py-20 max-w-5xl mx-auto px-6">
        <div className="text-center mb-16 space-y-2">
          <span className="text-xs font-bold font-display text-slate-400 uppercase tracking-widest block">The Engagement Cycle</span>
          <h2 className="text-3xl font-bold font-display text-slate-900">How Growth Managers Operate</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Your objective is not just ticking off tasks — it is compounding real business revenue for your artisan client.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Search,
              step: '01',
              title: 'Discover & Understand',
              desc: 'Review open opportunities from artisans. Understand their craft traditions, inventory bottlenecks, and sales goals.'
            },
            {
              icon: Target,
              step: '02',
              title: 'Formal Agreement',
              desc: 'Execute a digital partnership agreement defining scope, commercial terms, and concrete milestones.'
            },
            {
              icon: ClipboardList,
              step: '03',
              title: 'Execute in Workspace',
              desc: 'Optimize catalogs, refine photographs, drive social awareness, and coordinate via dedicated workspace messaging.'
            },
            {
              icon: TrendingUp,
              step: '04',
              title: 'Prove With Data',
              desc: 'Track periodic views, orders, and revenue. Build an undeniable portfolio verified by client ratings and tier upgrades.'
            }
          ].map((item, i) => (
            <div key={i} className="card p-6 space-y-3 relative hover:border-slate-300 transition-colors">
              <div className="flex justify-between items-center">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-emerald-800" />
                </div>
                <span className="text-xl font-black font-display text-slate-300">{item.step}</span>
              </div>
              <h3 className="font-bold font-display text-slate-900 text-sm">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Skills Matrix & 6-Month Plan */}
      <section className="bg-white py-20 border-y border-slate-200/80">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-1/2 space-y-5">
              <span className="text-xs font-bold font-display text-emerald-900 uppercase tracking-widest block">Operational Scope</span>
              <h2 className="text-3xl font-bold font-display text-slate-900">What will you actually execute?</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Artisans are master creators of their heritage craft, but navigating multi-channel digital retail is challenging. You bridge that gap with contemporary digital execution skills.
              </p>

              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                {[
                  'Product catalog optimization',
                  'Social media setup & campaigns',
                  'Pricing and market positioning',
                  'Customer inquiries handling',
                  'AI prompt crafting & SEO',
                  'Order tracking & packaging flow',
                  'Inventory management basics',
                  'Periodic growth analysis logs'
                ].map((skill, i) => (
                  <div key={i} className="flex items-center gap-2.5 card-cream p-3 rounded-xl border border-stone-200">
                    <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="text-xs font-semibold text-slate-700">{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 6-Month Roadmap Visual */}
            <div className="lg:w-1/2 w-full">
              <div className="bg-emerald-950 rounded-3xl p-7 shadow-md relative overflow-hidden border border-emerald-800 space-y-5">
                <div className="flex justify-between items-center border-b border-emerald-800/80 pb-3">
                  <h3 className="text-white font-bold font-display tracking-widest text-xs uppercase">Example 6-Month Execution Cadence</h3>
                  <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 text-[10px] rounded-md font-bold font-display">STANDARD ROADMAP</span>
                </div>
                <div className="space-y-4">
                  <TimelineItem month="Month 1" title="Digital Foundation" desc="Account creation, craft story framing, initial 10 catalog items published." />
                  <TimelineItem month="Month 2" title="Catalog SEO & Pricing" desc="Search tagging, product pricing benchmarking, inventory tracking setup." />
                  <TimelineItem month="Month 3" title="Outreach & Visibility" desc="Social channels launch, initial local outreach, first cross-state buyer orders." />
                  <TimelineItem month="Month 4" title="Conversion Optimization" desc="Catalog imagery improvements, customer review collection, cart friction audits." />
                  <TimelineItem month="Month 5" title="Fulfillment Streamlining" desc="Streamlining packing workflows, identifying top-performing product lines." />
                  <TimelineItem month="Month 6" title="Performance Review & Tier Advance" desc="Final metric report, client review submission, tier upgrade on platform." />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 max-w-5xl mx-auto px-6">
        <div className="text-center mb-14 space-y-2">
          <span className="text-xs font-bold font-display text-slate-400 uppercase tracking-widest block">Tools & Governance</span>
          <h2 className="text-3xl font-bold font-display text-slate-900">A Professional Digital Workspace</h2>
          <p className="text-xs sm:text-sm text-slate-500">Everything needed to collaborate productively with accountability.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {[
            {
              icon: Briefcase,
              title: 'Formal Agreements',
              desc: 'Digitally signed partnership agreements clarify responsibilities, timelines, and payment models from day one.'
            },
            {
              icon: BarChart3,
              title: 'Metric Tracking',
              desc: 'Record periodic updates across sales, revenue, and reach. Trends are automatically charted to demonstrate your impact.'
            },
            {
              icon: Award,
              title: 'Reputation System',
              desc: 'Earn authentic client ratings, build a verifiable digital track record, and progress through Bronze, Silver, Gold, and Platinum tiers.'
            }
          ].map((feature, i) => (
            <div key={i} className="card p-6 text-center space-y-3">
              <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-emerald-800" />
              </div>
              <h3 className="font-bold font-display text-slate-900 text-sm">{feature.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}