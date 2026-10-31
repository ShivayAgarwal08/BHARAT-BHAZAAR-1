import { Link } from 'react-router-dom';
import { ArrowRight, Store, Users, TrendingUp, ShoppingBag, Briefcase, BarChart2, MessageSquare, Target, CheckCircle, Star, Handshake, Palette, GraduationCap, Heart } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="bg-stone-50 min-h-screen font-sans">

      {/* HERO */}
      <section className="relative overflow-hidden bg-white pt-20 pb-28 border-b border-gray-100">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-amber-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-orange-50 rounded-full blur-3xl opacity-50"></div>

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <span className="inline-block py-1.5 px-4 rounded-full bg-amber-100 text-amber-800 text-xs font-bold tracking-widest uppercase mb-6 shadow-sm border border-amber-200">
            About Us
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight mb-6">
            India's local businesses deserve<br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-orange-600">more than a marketplace.</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
            Bharat Bazaar connects artisans and local businesses with dedicated growth managers and customers — creating a complete ecosystem for Indian craft and commerce to thrive in the digital age.
          </p>
          <p className="text-sm font-bold text-amber-800 uppercase tracking-widest mb-10">
            Local craft. Limitless possibilities.
          </p>

          {/* Ecosystem Visual */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 max-w-2xl mx-auto">
            <div className="flex flex-col items-center gap-2 p-6 bg-amber-50 rounded-2xl border border-amber-100 flex-1 w-full">
              <Palette className="w-8 h-8 text-amber-700" />
              <span className="font-bold text-gray-900">Artisans</span>
              <span className="text-xs text-gray-500">Create & Sell</span>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 hidden sm:block" />
            <span className="text-gray-400 sm:hidden">↓</span>
            <div className="flex flex-col items-center gap-2 p-6 bg-indigo-50 rounded-2xl border border-indigo-100 flex-1 w-full">
              <GraduationCap className="w-8 h-8 text-indigo-700" />
              <span className="font-bold text-gray-900">Growth Managers</span>
              <span className="text-xs text-gray-500">Grow & Support</span>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 hidden sm:block" />
            <span className="text-gray-400 sm:hidden">↓</span>
            <div className="flex flex-col items-center gap-2 p-6 bg-green-50 rounded-2xl border border-green-100 flex-1 w-full">
              <Heart className="w-8 h-8 text-green-700" />
              <span className="font-bold text-gray-900">Customers</span>
              <span className="text-xs text-gray-500">Discover & Buy</span>
            </div>
          </div>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-4">The Problem</span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6">
            Talented makers are invisible online.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            Millions of Indian artisans and small businesses create extraordinary products. But most struggle with digital presence, product photography, online selling, social media, and reaching customers beyond their local market.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 text-left">
            {[
              { icon: Store, title: 'No digital storefront', desc: 'Most artisans have no way to showcase their work online.' },
              { icon: TrendingUp, title: 'No growth support', desc: 'No one to help with marketing, listings, or analytics.' },
              { icon: Users, title: 'Limited reach', desc: 'Sales are restricted to local foot traffic and word of mouth.' },
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <item.icon className="w-8 h-8 text-amber-700 mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE BHARAT BAZAAR APPROACH */}
      <section className="py-20 px-6 bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block mb-4">Our Approach</span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6">
            Not just a store. A growth platform.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4 leading-relaxed">
            Bharat Bazaar combines three things that don't usually exist together:
          </p>
          <div className="grid sm:grid-cols-3 gap-6 mt-10">
            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
              <ShoppingBag className="w-8 h-8 text-amber-700 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">Commerce</h3>
              <p className="text-sm text-gray-600">A marketplace where artisans list and sell their products directly to customers across India.</p>
            </div>
            <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
              <Handshake className="w-8 h-8 text-indigo-700 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">Human Partnerships</h3>
              <p className="text-sm text-gray-600">Dedicated Growth Managers — students and professionals — who partner long-term with artisans to grow their business.</p>
            </div>
            <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
              <BarChart2 className="w-8 h-8 text-green-700 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">Business Intelligence</h3>
              <p className="text-sm text-gray-600">Analytics, performance tracking, reporting and structured execution plans that turn effort into measurable growth.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-4">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              The complete partnership journey.
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From listing your first product to achieving sustainable business growth.
            </p>
          </div>

          <div className="space-y-6">
            {[
              { step: '01', title: 'Join & Create', desc: 'Artisan registers, lists products with AI-assisted descriptions and photography tools.' },
              { step: '02', title: 'Get Discovered', desc: 'Products go live on the marketplace. Customers browse, add to cart, and order.' },
              { step: '03', title: 'Request Growth Support', desc: 'Artisan posts a growth request describing what business help they need.' },
              { step: '04', title: 'Growth Manager Applies', desc: 'Students and professionals browse opportunities and apply with their skills and experience.' },
              { step: '05', title: 'Partnership Agreement', desc: 'Artisan selects a Growth Manager. A formal partnership agreement is created with scope, responsibilities, and timelines.' },
              { step: '06', title: 'Execute & Track', desc: 'Tasks are assigned, progress is tracked. The Growth Manager works on marketing, listings, social media, and analytics.' },
              { step: '07', title: 'Measure & Report', desc: 'Performance data is recorded. Reports are submitted. Both parties can see what\'s working and what\'s not.' },
              { step: '08', title: 'Grow Together', desc: 'The artisan\'s business grows. The Growth Manager builds their portfolio and reputation. Everyone wins.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-3xl font-black text-amber-200 leading-none shrink-0 w-12">{item.step}</span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THREE SIDES */}
      <section className="py-20 px-6 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block mb-4">Three Sides</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              Artisans create. Students grow. We connect.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* FOR ARTISANS */}
            <div className="bg-amber-50/50 p-8 rounded-2xl border border-amber-100">
              <Palette className="w-10 h-10 text-amber-700 mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">For Artisans</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                {[
                  'List products and reach customers across India',
                  'AI-powered product descriptions and photography',
                  'Get matched with a dedicated Growth Manager',
                  'Professional partnership agreement',
                  'Track your business performance with real analytics',
                  'Receive structured growth reports',
                  'Rate and review your Growth Manager',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register" className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-amber-700 text-white font-bold rounded-xl text-sm hover:bg-amber-800 transition-colors shadow-md w-full justify-center">
                Start Selling <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* FOR GROWTH MANAGERS */}
            <div className="bg-indigo-50/50 p-8 rounded-2xl border border-indigo-100">
              <GraduationCap className="w-10 h-10 text-indigo-700 mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">For Growth Managers</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                {[
                  'Work with real clients on real businesses',
                  'Build a professional portfolio and reputation',
                  'Structured execution plans and deliverables',
                  'Gain practical marketing and growth experience',
                  'Long-term partnerships — not one-off gigs',
                  'Professional partnership workspace',
                  'Analytics, reports, and performance tracking',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/how-it-works/growth-manager" className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 transition-colors shadow-md w-full justify-center">
                Become a Growth Manager <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* FOR CUSTOMERS */}
            <div className="bg-green-50/50 p-8 rounded-2xl border border-green-100">
              <Heart className="w-10 h-10 text-green-700 mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">For Customers</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                {[
                  'Discover authentic Indian handmade products',
                  'Buy directly from artisans — no middlemen',
                  'Support local businesses and real makers',
                  'Quality products with real stories behind them',
                  'Easy cart, checkout, and order tracking',
                  'Browse by craft, category, and region',
                  'Know that your purchase makes a difference',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/marketplace" className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-green-700 text-white font-bold rounded-xl text-sm hover:bg-green-800 transition-colors shadow-md w-full justify-center">
                Explore Marketplace <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WHY DIFFERENT */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-4">Why We're Different</span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6">
            Marketplace + Growth + Partnership
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            Most platforms stop at listing products. Bharat Bazaar goes further — pairing each business with human expertise, structured plans, and real analytics to drive sustainable growth.
          </p>
          <div className="grid sm:grid-cols-2 gap-6 text-left">
            {[
              { icon: Target, title: 'Structured Growth Plans', desc: 'Not generic advice. Real execution plans with tasks, timelines, and accountability.' },
              { icon: MessageSquare, title: 'Direct Communication', desc: 'Real-time chat between artisans and their Growth Managers, built into the workspace.' },
              { icon: BarChart2, title: 'Business Analytics', desc: 'Track products, views, orders, revenue, and growth — all in one dashboard.' },
              { icon: Briefcase, title: 'Professional Agreements', desc: 'Formal partnership agreements with digital signatures, downloadable as PDF.' },
              { icon: Star, title: 'Reputation & Ratings', desc: 'Growth Managers build portfolios. Artisans rate their experience. Quality rises.' },
              { icon: Handshake, title: 'Long-term Relationships', desc: 'Not gigs. Real 3-6 month partnerships that create lasting business impact.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <item.icon className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Ready to start?</h2>
          <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">
            Whether you're an artisan bringing your craft online, a student building your career, or a customer looking for authentic products — there's a place for you here.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-amber-700 hover:bg-amber-800 text-white rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2">
              Bring your craft online <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/marketplace" className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2">
              Explore the marketplace
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
