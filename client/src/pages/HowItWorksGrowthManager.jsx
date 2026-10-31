import { ArrowRight, Search, Target, ClipboardList, Briefcase, TrendingUp, Award, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HowItWorksGrowthManager() {
  return (
    <div className="bg-stone-50 min-h-screen font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gray-900 pt-24 pb-32 border-b border-gray-800">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-900 rounded-full blur-[100px] opacity-30 mix-blend-screen"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-900 rounded-full blur-[80px] opacity-30 mix-blend-screen"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <span className="inline-block py-1.5 px-4 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold tracking-widest uppercase mb-6 shadow-sm">For Students & Growth Managers</span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-8">
            Turn your digital skills into <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">real business impact.</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 font-medium max-w-2xl mx-auto mb-12">
            You are not simply uploading products. You become the artisan's digital business partner. Help local creators grow their nationwide reach and build an undeniable portfolio of real-world results.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 rounded-2xl font-bold text-lg shadow-xl shadow-white/10 transition-all flex items-center justify-center gap-2">
              Become a Growth Manager <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* The Journey */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl font-black text-gray-900 mb-4">The Growth Journey</h2>
          <p className="text-gray-500 font-medium max-w-xl mx-auto">Your job is not just to do tasks. Your job is to help a real local business grow.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-8 left-12 right-12 h-1 bg-gradient-to-r from-blue-100 via-indigo-100 to-stone-100 z-0"></div>
          
          {[
            { icon: Search, title: 'Discover & Understand', desc: 'Find an artisan looking for help. Understand their craft, their current struggles, and their business goals.' },
            { icon: Target, title: 'Agree on Goals', desc: 'Sign a formal 6-month digital growth contract outlining expectations, payment (if any), and targets.' },
            { icon: ClipboardList, title: 'Execute Tasks', desc: 'Improve catalogs, fix product photography, setup social media, and manage their online visibility.' },
            { icon: TrendingUp, title: 'Prove Results', desc: 'Track monthly revenue, views, and orders. Prove that your intervention actually grew their business.' }
          ].map((step, i) => (
            <div key={i} className="relative z-10 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all text-center">
              <div className="w-16 h-16 mx-auto bg-gray-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-gray-100">
                <step.icon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Skills Matrix */}
      <section className="bg-white py-24 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="md:w-1/2 space-y-6">
              <h2 className="text-3xl font-black text-gray-900">What will you actually do?</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Artisans are masters of their craft, but often struggle with the digital ecosystem. You step in to bridge that gap. 
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4 pt-6">
                {[
                  'Product catalog improvement',
                  'Social media setup & strategy',
                  'Digital marketing basics',
                  'Marketplace onboarding',
                  'Product descriptions & SEO',
                  'Customer handling guidance',
                  'Inventory & Excel tracking',
                  'Growth analysis reporting'
                ].map((skill, i) => (
                  <div key={i} className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-gray-100">
                    <CheckCircleIcon className="w-5 h-5 text-indigo-600 shrink-0" />
                    <span className="text-sm font-medium text-gray-700">{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Example 6 month plan UI mockup */}
            <div className="md:w-1/2 w-full">
              <div className="bg-gray-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden border border-gray-800">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
                <div className="flex justify-between items-center mb-8 relative z-10 border-b border-gray-800 pb-4">
                  <h3 className="text-white font-bold tracking-widest text-xs uppercase">Example 6-Month Plan</h3>
                  <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-[10px] rounded font-bold">EXAMPLE</span>
                </div>
                <div className="space-y-4 relative z-10">
                  <TimelineItem month="Month 1" title="Digital Setup" desc="Account creation, photography basics, initial 10 products listed." />
                  <TimelineItem month="Month 2" title="Catalog Optimization" desc="SEO descriptions, tagging, pricing strategy, inventory tracking." />
                  <TimelineItem month="Month 3" title="Market Reach" desc="Instagram setup, basic digital marketing, first cross-state orders." />
                  <TimelineItem month="Month 4" title="Conversion" desc="Analyzing drop-offs, improving images, customer review generation." />
                  <TimelineItem month="Month 5" title="Optimization" desc="Streamlining shipping workflow, identifying top-selling items." />
                  <TimelineItem month="Month 6" title="Growth Review" desc="Final metric report, contract completion, reputation rating." />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="py-24 max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-gray-900 mb-4">A Professional Workspace</h2>
          <p className="text-gray-500 font-medium">Everything you need to manage the partnership effectively.</p>
        </div>
        
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { icon: Briefcase, title: 'Formal Contracts', desc: 'Draft and sign digital agreements to ensure clarity of expectations.' },
            { icon: BarChart3, title: 'Metric Tracking', desc: 'Record daily/weekly/monthly revenue and traffic metrics to prove your impact.' },
            { icon: Award, title: 'Reputation System', desc: 'Earn tier upgrades and reviews from artisans to boost your real-world resume.' }
          ].map((feature, i) => (
            <div key={i} className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <feature.icon className="w-10 h-10 mx-auto text-indigo-600 mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function CheckCircleIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}

function TimelineItem({ month, title, desc }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-16 shrink-0 text-right">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{month}</span>
      </div>
      <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-500 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
      <div>
        <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
    </div>
  );
}
