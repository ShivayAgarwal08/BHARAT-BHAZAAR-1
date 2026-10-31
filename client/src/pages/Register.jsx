import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, TrendingUp, UserCheck, ShieldCheck, ArrowRight } from 'lucide-react';

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
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900">Create Your Bharat Bazaar Account</h1>
        <p className="text-sm text-gray-500">
          Join India's craft marketplace & digital growth ecosystem. Select your account type below.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setRole('CUSTOMER')}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
            role === 'CUSTOMER'
              ? 'bg-amber-50 border-amber-800 ring-2 ring-amber-700/20'
              : 'bg-white border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <ShoppingBag className={`w-5 h-5 ${role === 'CUSTOMER' ? 'text-amber-800' : 'text-gray-400'}`} />
            {role === 'CUSTOMER' && <span className="w-2 h-2 rounded-full bg-amber-700"></span>}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Customer</h3>
            <p className="text-[11px] text-gray-500">Discover & buy local artisan crafts</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setRole('ARTISAN')}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
            role === 'ARTISAN'
              ? 'bg-amber-50 border-amber-800 ring-2 ring-amber-700/20'
              : 'bg-white border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <TrendingUp className={`w-5 h-5 ${role === 'ARTISAN' ? 'text-amber-800' : 'text-gray-400'}`} />
            {role === 'ARTISAN' && <span className="w-2 h-2 rounded-full bg-amber-700"></span>}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Artisan</h3>
            <p className="text-[11px] text-gray-500">Sell products & get digital growth help</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setRole('INTERN')}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
            role === 'INTERN'
              ? 'bg-amber-50 border-amber-800 ring-2 ring-amber-700/20'
              : 'bg-white border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <UserCheck className={`w-5 h-5 ${role === 'INTERN' ? 'text-amber-800' : 'text-gray-400'}`} />
            {role === 'INTERN' && <span className="w-2 h-2 rounded-full bg-amber-700"></span>}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Growth Manager</h3>
            <p className="text-[11px] text-gray-500">Student digital manager for artisans</p>
          </div>
        </button>
      </div>

      {/* Registration Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="10-digit phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                placeholder="Choose a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-700"
              />
            </div>
          </div>

          {/* Role specific fields */}
          {role === 'ARTISAN' && (
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                Artisan Business Profile
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">City / Village</label>
                  <input
                    type="text"
                    placeholder="e.g. Jaipur"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">State</label>
                  <input
                    type="text"
                    placeholder="e.g. Rajasthan"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Craft Type</label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
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
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                Growth Manager Profile
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">College / University</label>
                  <input
                    type="text"
                    placeholder="e.g. Delhi University"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Course / Degree</label>
                  <input
                    type="text"
                    placeholder="e.g. BBA / Digital Marketing"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Target Tier</label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                  >
                    <option value="STARTER">STARTER (Catalog & Setup)</option>
                    <option value="GROWTH">GROWTH (Branding & Social)</option>
                    <option value="PRO">PRO (Multichannel Sales)</option>
                    <option value="EXPERT">EXPERT (End-to-End Growth)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Skills (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Social Media, Photography, Cataloguing"
                    value={skillsStr}
                    onChange={(e) => setSkillsStr(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-amber-700 text-white font-bold rounded-xl text-sm hover:bg-amber-800 transition-colors shadow-lg shadow-amber-700/20 flex items-center justify-center gap-2 disabled:bg-gray-400"
          >
            {loading ? 'Creating Account...' : `Create Account as ${role === 'INTERN' ? 'Growth Manager' : role}`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="border-t border-gray-100 pt-4 text-center">
          <p className="text-xs text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-amber-800 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
