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
    <div className="bg-stone-50 min-h-screen font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-24 pb-32 border-b border-gray-100">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-amber-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-orange-50 rounded-full blur-3xl opacity-50"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <span className="inline-block py-1.5 px-4 rounded-full bg-amber-100 text-amber-800 text-xs font-bold tracking-widest uppercase mb-6 shadow-sm border border-amber-200">For Artisans</span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight mb-8">
            Your craft deserves <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-orange-600">a bigger market.</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 font-medium max-w-2xl mx-auto mb-12">
            Sell your work online, reach customers beyond your town, and get practical digital help when you need it. Let us handle the technology while you focus on what you do best.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-bold text-lg shadow-xl shadow-gray-900/20 transition-all flex items-center justify-center gap-2">
              Start Selling Online <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#assistance" className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-gray-200 hover:border-amber-700 hover:text-amber-800 text-gray-700 rounded-2xl font-bold text-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer">
              <PhoneCall className="w-5 h-5" /> Need help joining?
            </a>
          </div>
        </div>
      </section>

      {/* The Journey */}
      <section className="py-24 max-w-5xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl font-black text-gray-900 mb-4">How Bharat Bazaar Works</h2>
          <p className="text-gray-500 font-medium">A simple path from your workshop to customers nationwide.</p>
        </div>

        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-10 sm:before:ml-1/2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-amber-200 before:via-orange-200 before:to-stone-100">
          
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-20 h-20 rounded-full border-4 border-white bg-amber-100 text-amber-700 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-black text-xl">01</div>
            <div className="w-[calc(100%-6rem)] md:w-[calc(50%-4rem)] p-6 sm:p-8 rounded-3xl bg-white shadow-sm border border-gray-100 group-hover:shadow-lg group-hover:border-amber-200 transition-all">
              <Store className="w-8 h-8 text-amber-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Bring your craft online</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Create your digital storefront in minutes. Use your voice (in English or Hindi) to describe your products, and our smart AI will write beautiful descriptions for you.</p>
            </div>
          </div>

          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-20 h-20 rounded-full border-4 border-white bg-amber-100 text-amber-700 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-black text-xl">02</div>
            <div className="w-[calc(100%-6rem)] md:w-[calc(50%-4rem)] p-6 sm:p-8 rounded-3xl bg-white shadow-sm border border-gray-100 group-hover:shadow-lg group-hover:border-amber-200 transition-all">
              <MapPin className="w-8 h-8 text-amber-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Let customers discover you</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Your products are listed on our national marketplace. Customers don't just buy a product; they meet the maker and learn your unique story.</p>
            </div>
          </div>

          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-20 h-20 rounded-full border-4 border-white bg-amber-100 text-amber-700 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-black text-xl">03</div>
            <div className="w-[calc(100%-6rem)] md:w-[calc(50%-4rem)] p-6 sm:p-8 rounded-3xl bg-white shadow-sm border border-gray-100 group-hover:shadow-lg group-hover:border-amber-200 transition-all">
              <ShoppingCart className="w-8 h-8 text-amber-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sell and manage orders</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Receive notifications for new orders. Pack your items, update the shipping status with a single click, and securely receive your payments.</p>
            </div>
          </div>

          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-20 h-20 rounded-full border-4 border-white bg-amber-100 text-amber-700 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-black text-xl">04</div>
            <div className="w-[calc(100%-6rem)] md:w-[calc(50%-4rem)] p-6 sm:p-8 rounded-3xl bg-white shadow-sm border border-gray-100 group-hover:shadow-lg group-hover:border-amber-200 transition-all">
              <UserCheck className="w-8 h-8 text-amber-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Get a Growth Manager</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Need help with social media, photography, or digital marketing? Post a request and partner with a skilled student who acts as your personal digital assistant.</p>
            </div>
          </div>

          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-20 h-20 rounded-full border-4 border-white bg-amber-100 text-amber-700 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-black text-xl">05</div>
            <div className="w-[calc(100%-6rem)] md:w-[calc(50%-4rem)] p-6 sm:p-8 rounded-3xl bg-amber-800 text-white shadow-xl shadow-amber-900/20 border border-amber-700 transition-all">
              <TrendingUp className="w-8 h-8 text-amber-200 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Grow your business</h3>
              <p className="text-amber-100 text-sm leading-relaxed">Watch your reach expand. While your Growth Manager helps optimize your digital presence, you can focus purely on creating your beautiful craft.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us Cards */}
      <section className="bg-white py-24 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900 mb-4">Why Bharat Bazaar?</h2>
            <p className="text-gray-500 font-medium">A platform built specifically for the needs of Indian artisans.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Sell beyond your local market', desc: 'Reach customers across the entire country instead of relying solely on local foot traffic.' },
              { title: 'Simple product management', desc: 'No complex forms. Upload a photo, speak to describe it, and let our system do the rest.' },
              { title: 'Hindi & English support', desc: 'Switch the entire platform to Hindi instantly if you prefer reading and working in your native language.' },
              { title: 'Growth Manager support', desc: 'You do not have to be a tech expert. Hire an intern to manage your digital growth.' },
              { title: 'Human assistance', desc: 'Real people ready to help you onboard over a phone call if you get stuck.' },
              { title: 'Business insights', desc: 'Track your performance, revenue, and views easily from your personal dashboard.' }
            ].map((feature, i) => (
              <div key={i} className="bg-stone-50 rounded-3xl p-8 border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all">
                <Sparkles className="w-6 h-6 text-amber-700 mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assistance CTA */}
      <section id="assistance" className="py-24 max-w-4xl mx-auto px-6">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="text-left space-y-4 md:w-1/2">
              <h2 className="text-3xl font-black text-white">Not comfortable with technology?</h2>
              <p className="text-gray-300 font-medium leading-relaxed">
                That is completely fine. Give us your phone number and some basic details. Our friendly team will call you back and help you set up your entire account over the phone.
              </p>
            </div>
            
            <div className="w-full md:w-1/2 bg-white rounded-3xl p-6 shadow-xl">
              {success ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 text-xl mb-2">Request Received!</h3>
                  <p className="text-gray-500 text-sm">We will call you on the number provided very soon.</p>
                  <button onClick={() => setSuccess(false)} className="mt-6 text-sm font-semibold text-amber-700 hover:underline">Submit another request</button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                    <PhoneCall className="w-5 h-5 text-amber-700" /> Let us help you get started
                  </h3>
                  
                  {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" placeholder="Your Name" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-700 outline-none" />
                    <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} type="tel" placeholder="Phone Number" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-700 outline-none" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} type="text" placeholder="City" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-700 outline-none" />
                    <input required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} type="text" placeholder="State" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-700 outline-none" />
                  </div>

                  <input required value={formData.craft} onChange={e => setFormData({...formData, craft: e.target.value})} type="text" placeholder="What do you make? (e.g., Pottery, Textiles)" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-700 outline-none" />

                  <select required value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-700 outline-none">
                    <option value="">Preferred Language</option>
                    <option value="HINDI">हिंदी (Hindi)</option>
                    <option value="ENGLISH">English</option>
                  </select>
                  
                  <button disabled={submitting} type="submit" className="w-full py-3.5 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-50">
                    {submitting ? 'Submitting...' : 'Request a Call'}
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
