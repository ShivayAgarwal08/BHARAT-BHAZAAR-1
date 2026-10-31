import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, TrendingUp, UserCheck, ArrowRight } from 'lucide-react';

export default function Register() {
  const [role, setRole] = useState('CUSTOMER'); // 'CUSTOMER', 'ARTISAN', 'INTERN'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Role specific state
  const [location, setLocation] = useState('');
  const [state, setState] = useState('');
  const [businessType, setBusinessType] = useState('Handicrafts');
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [tier, setTier] = useState('STARTER');
  const [skillsStr, setSkillsStr] = useState('Social Media, Cataloguing');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const roleData = {};
      if (role === 'ARTISAN') {
        roleData.location = location;
        roleData.state = state;
        roleData.businessType = businessType;
      } else if (role === 'INTERN') {
        roleData.college = college;
        roleData.course = course;
        roleData.tier = tier;
        roleData.skills = skillsStr.split(',').map((s) => s.trim()).filter(Boolean);
      }

      const user = await register({
        name,
        phone,
        email,
        password,
        role,
        ...roleData,
      });

      if (user.role === 'CUSTOMER') {
        navigate('/marketplace');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">Create Your Bharat Bazaar Account</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Join India's craft marketplace & digital growth ecosystem. Select your account type below.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <button
          type="button"
          onClick={() => setRole('CUSTOMER')}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 cursor-pointer ${
            role === 'CUSTOMER'
              ? 'bg-[#e3f6f0]/50 border-[#0b634e] ring-2 ring-[#0b634e]/20 shadow-sm'
              : 'bg-white border-[#ded6c9] hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${role === 'CUSTOMER' ? 'bg-[#0b634e] text-white' : 'bg-[#faf8f5] text-slate-500'}`}>
              <ShoppingBag className="w-4 h-4" />
            </div>
            {role === 'CUSTOMER' && <span className="w-2.5 h-2.5 rounded-full bg-[#0b634e]"></span>}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm font-display">Customer</h3>
            <p className="text-[11px] text-slate-500 leading-snug mt-0.5">Discover & buy local artisan crafts directly</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setRole('ARTISAN')}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 cursor-pointer ${
            role === 'ARTISAN'
              ? 'bg-[#e3f6f0]/50 border-[#0b634e] ring-2 ring-[#0b634e]/20 shadow-sm'
              : 'bg-white border-[#ded6c9] hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${role === 'ARTISAN' ? 'bg-[#0b634e] text-white' : 'bg-[#faf8f5] text-slate-500'}`}>
              <TrendingUp className="w-4 h-4" />
            </div>
            {role === 'ARTISAN' && <span className="w-2.5 h-2.5 rounded-full bg-[#0b634e]"></span>}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm font-display">Artisan</h3>
            <p className="text-[11px] text-slate-500 leading-snug mt-0.5">Sell products & get student growth assistance</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setRole('INTERN')}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 cursor-pointer ${
            role === 'INTERN'
              ? 'bg-[#e3f6f0]/50 border-[#0b634e] ring-2 ring-[#0b634e]/20 shadow-sm'
              : 'bg-white border-[#ded6c9] hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${role === 'INTERN' ? 'bg-[#0b634e] text-white' : 'bg-[#faf8f5] text-slate-500'}`}>
              <UserCheck className="w-4 h-4" />
            </div>
            {role === 'INTERN' && <span className="w-2.5 h-2.5 rounded-full bg-[#0b634e]"></span>}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm font-display">Growth Manager</h3>
            <p className="text-[11px] text-slate-500 leading-snug mt-0.5">Student digital manager for regional artisans</p>
          </div>
        </button>
      </div>

      {/* Registration Form Card */}
      <div className="card p-6 sm:p-8 space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-medium animate-in fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="10-digit phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password *
              </label>
              <input
                type="password"
                required
                placeholder="Choose a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Role specific fields */}
          {role === 'ARTISAN' && (
            <div className="pt-4 border-t border-[#f0ebe1] space-y-4 animate-in fade-in">
              <span className="text-xs font-bold text-[#06372b] uppercase tracking-wider block">
                Artisan Business Profile
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">City / Village</label>
                  <input
                    type="text"
                    placeholder="e.g. Jaipur"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input-field text-xs py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">State</label>
                  <input
                    type="text"
                    placeholder="e.g. Rajasthan"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="input-field text-xs py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Craft Type</label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="input-field text-xs py-2 bg-white"
                  >
                    <option value="Handicrafts">Handicrafts</option>
                    <option value="Textiles">Textiles</option>
                    <option value="Pottery">Pottery</option>
                    <option value="Jewelry">Jewelry</option>
                    <option value="Art">Art</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {role === 'INTERN' && (
            <div className="pt-4 border-t border-[#f0ebe1] space-y-4 animate-in fade-in">
              <span className="text-xs font-bold text-[#06372b] uppercase tracking-wider block">
                Growth Manager Profile
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">College / University</label>
                  <input
                    type="text"
                    placeholder="e.g. Delhi University"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="input-field text-xs py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Course / Degree</label>
                  <input
                    type="text"
                    placeholder="e.g. BBA / Digital Marketing"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="input-field text-xs py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Target Tier</label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                    className="input-field text-xs py-2 font-bold bg-white"
                  >
                    <option value="STARTER">STARTER (Catalog & Setup)</option>
                    <option value="GROWTH">GROWTH (Branding & Social)</option>
                    <option value="PRO">PRO (Multichannel Sales)</option>
                    <option value="EXPERT">EXPERT (End-to-End Growth)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Skills (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Social Media, Photography, Cataloguing"
                    value={skillsStr}
                    onChange={(e) => setSkillsStr(e.target.value)}
                    className="input-field text-xs py-2"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 disabled:bg-slate-300"
          >
            {loading ? 'Creating Account...' : `Create Account as ${role === 'INTERN' ? 'Growth Manager' : role === 'ARTISAN' ? 'Artisan' : 'Customer'}`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="border-t border-[#f0ebe1] pt-4 text-center">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#0b634e] hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
