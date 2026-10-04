import { Link } from 'react-router-dom';
import { ShoppingBag, Users, Sparkles, ShieldCheck, ArrowRight, TrendingUp, Award, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amber-950 via-amber-900 to-orange-950 text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" /> India's Premier Artisan Marketplace & Growth Platform
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
              Local Craft. <br />
              <span className="text-amber-400">Limitless Possibilities.</span>
            </h1>
            <p className="text-amber-100 text-base sm:text-lg max-w-xl leading-relaxed">
              Bharat Bazaar connects authentic Indian artisans with conscious customers and dedicated student Growth Managers who help scale their digital businesses.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link
                to="/marketplace"
                className="px-8 py-4 bg-amber-500 text-amber-950 font-extrabold rounded-2xl hover:bg-amber-400 transition-all shadow-xl text-center flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Explore Marketplace
              </Link>
              {!user && (
                <Link
                  to="/login"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all border border-white/20 text-center flex items-center justify-center gap-2"
                >
                  <Users className="w-5 h-5 text-amber-400" />
                  Become a Growth Manager
                </Link>
              )}
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl space-y-6 text-amber-100">
              <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                <div className="w-12 h-12 bg-amber-500 text-amber-950 rounded-2xl font-black flex items-center justify-center text-xl shadow">
                  BB
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">The Bharat Bazaar Ecosystem</h3>
                  <p className="text-xs text-amber-200">Customer • Artisan • Growth Manager</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/10">
                  <ShoppingBag className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-white block">1. Customer Marketplace</span>
                    <span className="text-amber-200">Discover authentic handicrafts & buy directly from creators.</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/10">
                  <TrendingUp className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-white block">2. Artisan Business Growth</span>
                    <span className="text-amber-200">AI product creation, catalog management, and order analytics.</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/10">
                  <Award className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-white block">3. Growth Manager Partnership</span>
                    <span className="text-amber-200">Contract-based student managers leading cataloguing & social media.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pillars Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">How It Works</span>
          <h2 className="text-3xl font-extrabold text-gray-900">Designed for Every Participant</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Customer */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-4 hover:shadow-lg transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-800 rounded-2xl flex items-center justify-center font-bold">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">For Customers</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Browse handcrafted pottery, textiles, jewelry, and art. Support rural Indian artisans with direct orders and transparent delivery.
              </p>
            </div>
            <Link
              to="/marketplace"
              className="text-amber-800 font-bold text-xs flex items-center gap-1 hover:underline pt-4 border-t border-gray-50"
            >
              Browse Marketplace &rarr;
            </Link>
          </div>

          {/* Artisan */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-4 hover:shadow-lg transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">For Artisans</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Create digital listings in seconds using AI voice input. Post growth requests to get hands-on assistance from student Growth Managers.
              </p>
            </div>
            <Link
              to={user?.role === 'ARTISAN' ? '/dashboard' : '/login'}
              className="text-amber-800 font-bold text-xs flex items-center gap-1 hover:underline pt-4 border-t border-gray-50"
            >
              Grow Your Business &rarr;
            </Link>
          </div>

          {/* Growth Manager */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-4 hover:shadow-lg transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-800 rounded-2xl flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">For Growth Managers</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Act as the artisan's personal digital manager. Improve product listings, manage social media, setup shipping, and build your tier reputation.
              </p>
            </div>
            <Link
              to={user?.role === 'INTERN' ? '/dashboard' : '/login'}
              className="text-amber-800 font-bold text-xs flex items-center gap-1 hover:underline pt-4 border-t border-gray-50"
            >
              Become a Growth Manager &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Contract & Trust Section */}
      <section className="bg-amber-50/70 border border-amber-100 rounded-3xl p-8 sm:p-12 max-w-7xl mx-auto space-y-8">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Formal Partnership</span>
          <h2 className="text-3xl font-extrabold text-gray-900">Contract-Based Collaboration</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            The relationship between artisan and Growth Manager is transparent and governed by mutual agreement contracts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-amber-100 space-y-2">
            <CheckCircle2 className="w-5 h-5 text-amber-700" />
            <h4 className="font-bold text-gray-900 text-sm">Configurable Tiers</h4>
            <p className="text-xs text-gray-500">Starter, Growth, Pro, and Expert manager levels.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-amber-100 space-y-2">
            <CheckCircle2 className="w-5 h-5 text-amber-700" />
            <h4 className="font-bold text-gray-900 text-sm">Defined Scope</h4>
            <p className="text-xs text-gray-500">Clear milestones for catalog, photography, and social media.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-amber-100 space-y-2">
            <CheckCircle2 className="w-5 h-5 text-amber-700" />
            <h4 className="font-bold text-gray-900 text-sm">Fair Pricing</h4>
            <p className="text-xs text-gray-500">Support for free learning projects, fixed stipends, or hourly rates.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-amber-100 space-y-2">
            <CheckCircle2 className="w-5 h-5 text-amber-700" />
            <h4 className="font-bold text-gray-900 text-sm">Real Analytics</h4>
            <p className="text-xs text-gray-500">Track product views, cart adds, orders, and sales performance.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
