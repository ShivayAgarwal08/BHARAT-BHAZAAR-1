import { useState } from 'react';
import { ArrowRight, Store, ShoppingCart, UserCheck, TrendingUp, PhoneCall, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function HowItWorksArtisan() {
  const [formData, setFormData] = useState({ name: '', phone: '', language: '', location: '', state: '', craft: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/assistance/artisan`, formData);
      setSuccess(true);
      setFormData({ name: '', phone: '', language: '', location: '', state: '', craft: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background min-h-screen font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-100 via-stone-50 to-background pt-20 pb-28 border-b border-slate-200/80">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-6">
          <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-emerald-100/80 text-emerald-950 text-xs font-bold font-display tracking-widest uppercase shadow-2xs border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-800" />
            Empowering Indian Artisans
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display text-slate-900 tracking-tight leading-tight">
            Your handmade craft deserves <br className="hidden sm:block" />
            <span className="text-emerald-900"> a national marketplace.</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Sell directly to conscious customers across India, manage orders with ease, and get paired with a dedicated student Growth Manager to handle your digital expansion.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/register" className="btn-primary text-sm px-6 py-3 flex items-center justify-center gap-2">
              Start Selling Online <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#assistance" className="btn-outline text-sm px-6 py-3 flex items-center justify-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-800" /> Need Help Joining?
            </a>
          </div>
        </div>
      </section>

      {/* The Journey */}
      <section className="py-20 max-w-5xl mx-auto px-6">
        <div className="text-center mb-16 space-y-2">
          <span className="text-xs font-bold font-display text-slate-400 uppercase tracking-widest block">How It Works</span>
          <h2 className="text-3xl font-bold font-display text-slate-900">A simple path from workshop to buyers nationwide</h2>
          <p className="text-xs sm:text-sm text-slate-500">You focus on creating; we help you with the digital technology.</p>
        </div>

        <div className="space-y-6">
          {[
            {
              step: '01',
              icon: Store,
              title: 'Bring your craft online effortlessly',
              desc: 'Create your digital storefront in minutes. Speak in Hindi, Hinglish, or English to describe your crafts, and our multi-provider AI instantly generates professional titles, descriptions, and taggings.'
            },
            {
              step: '02',
              icon: MapPin,
              title: 'Get discovered by conscious customers',
              desc: 'Your catalog goes live nationwide. Buyers discover the heritage, regional authenticity, and cultural story behind each piece directly from you without broker commissions.'
            },
            {
              step: '03',
              icon: ShoppingCart,
              title: 'Fulfill orders with one-click status updates',
              desc: 'Receive instant notifications when customers buy. Pack your items, update fulfillment status from your dashboard, and securely receive your verified payments.'
            },
            {
              step: '04',
              icon: UserCheck,
              title: 'Pair with a dedicated Growth Manager',
              desc: 'Need help with social media, product photography, or marketing? Post a growth request and partner with a vetted student growth manager who works on your store.'
            },
            {
              step: '05',
              icon: TrendingUp,
              title: 'Grow sustainable, compounding revenue',
              desc: 'Track sales, views, and repeat customers in your dashboard. Build a durable business while preserving traditional craftsmanship for generations to come.'
            }
          ].map((item, i) => (
            <div key={i} className="card p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center hover:border-slate-300 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 font-bold font-display text-base flex items-center justify-center shrink-0">
                {item.step}
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-emerald-800" />
                  <h3 className="font-bold font-display text-slate-900 text-base">{item.title}</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Us Cards */}
      <section className="bg-white py-20 border-y border-slate-200/80">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14 space-y-2">
            <span className="text-xs font-bold font-display text-emerald-900 uppercase tracking-widest block">Platform Features</span>
            <h2 className="text-3xl font-bold font-display text-slate-900">Why Artisans Choose Bharat Bazaar</h2>
            <p className="text-xs sm:text-sm text-slate-500">Designed deliberately for the practical realities of Indian makers.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: 'National Distribution', desc: 'Reach conscious buyers across metro cities and towns without relying solely on local market stalls.' },
              { title: 'Voice-to-Listing AI', desc: 'No complex typing needed. Describe your product using your phone microphone in Hindi or English.' },
              { title: 'Bilingual Interface', desc: 'Toggle the entire portal between English and Hindi at any time with a single tap.' },
              { title: 'Growth Partner Network', desc: 'You do not need to be a digital marketing expert. Hire a dedicated student intern to handle marketing.' },
              { title: 'Telephonic Onboarding', desc: 'Stuck with technology? Our regional support team will call you back to help set up everything over the phone.' },
              { title: 'Transparent Analytics', desc: 'Clear views, orders, and revenue reporting with zero hidden platform charges.' }
            ].map((feature, i) => (
              <div key={i} className="card-cream p-5 rounded-2xl border border-stone-200 space-y-2">
                <Sparkles className="w-4 h-4 text-emerald-800 mb-1" />
                <h3 className="font-bold font-display text-slate-900 text-sm">{feature.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assistance CTA Form */}
      <section id="assistance" className="py-20 max-w-4xl mx-auto px-6">
        <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl p-8 sm:p-12 shadow-md relative overflow-hidden border border-emerald-800">
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="text-left space-y-4 md:w-1/2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-[10px] font-bold font-display tracking-widest uppercase">
                <PhoneCall className="w-3 h-3" /> Direct Assistance
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">Not comfortable with technology?</h2>
              <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
                That is completely fine! Enter your phone number and city. Our team will call you back directly and set up your complete account and listings over the phone.
              </p>
            </div>

            <div className="w-full md:w-1/2 bg-white rounded-2xl p-6 shadow-sm">
              {success ? (
                <div className="text-center py-6 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h3 className="font-bold font-display text-slate-900 text-base">Request Received!</h3>
                  <p className="text-xs text-slate-600">Our representative will call your number shortly to help you get started.</p>
                  <button onClick={() => setSuccess(false)} className="text-xs font-bold text-emerald-800 hover:underline">
                    Submit another request
                  </button>
                </div>
              ) : (
                <form className="space-y-3" onSubmit={handleSubmit}>
                  <h3 className="font-bold font-display text-slate-900 text-sm mb-3 flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-emerald-800" /> Request a free callback
                  </h3>

                  {error && <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg">{error}</p>}

                  <div className="grid grid-cols-2 gap-2.5">
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" placeholder="Your Name" className="input-field text-xs" />
                    <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} type="tel" placeholder="Phone Number" className="input-field text-xs" />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} type="text" placeholder="City / District" className="input-field text-xs" />
                    <input required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} type="text" placeholder="State" className="input-field text-xs" />
                  </div>

                  <input required value={formData.craft} onChange={e => setFormData({...formData, craft: e.target.value})} type="text" placeholder="What craft do you make? (e.g. Woodcraft, Pottery)" className="input-field text-xs" />

                  <select required value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} className="input-field text-xs">
                    <option value="">Preferred Language for Call</option>
                    <option value="HINDI">हिंदी (Hindi)</option>
                    <option value="ENGLISH">English</option>
                  </select>

                  <button disabled={submitting} type="submit" className="btn-primary w-full text-xs py-2.5 disabled:opacity-50">
                    {submitting ? 'Submitting...' : 'Request a Callback'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}