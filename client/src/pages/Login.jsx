import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Phone, Lock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim() || !password.trim()) {
      setError('Please provide both your phone number or email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const user = await login(phone, password);
      if (user?.role === 'CUSTOMER') {
        navigate('/marketplace');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (!err.response) {
        if (err.code === 'ECONNABORTED') {
          setError('The server took too long to respond. The service may be warming up—please try again.');
        } else {
          setError('Unable to reach the server. Please check your internet connection and try again.');
        }
      } else if (err.response.status === 401) {
        setError(err.response.data?.error || 'Invalid phone number or password.');
      } else if (err.response.data?.code === 'DATABASE_ERROR' || err.response.status === 503) {
        setError('Database service is currently warming up. Please wait a few seconds and try again.');
      } else if (err.response.status === 502 || err.response.status === 504) {
        setError('Server is currently starting up or experiencing high traffic. Please retry in a moment.');
      } else if (err.response.status >= 500) {
        setError(err.response.data?.error || 'Server error. Please try again in a few moments.');
      } else {
        setError(err.response.data?.error || 'Authentication error. Please check your details and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-20 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-gradient-to-tr from-[#06372b] to-[#0b634e] text-white rounded-2xl flex items-center justify-center text-lg font-black mx-auto shadow-md shadow-[#0b634e]/20 font-display">
          BB
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">Sign In to Bharat Bazaar</h1>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Enter your registered phone number or email and password to access your account.
        </p>
      </div>

      <div className="card p-6 sm:p-8 space-y-5">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-medium leading-relaxed animate-in fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Phone Number or Email
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Enter 10-digit phone or email"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 disabled:bg-slate-300"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing In&hellip;
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="border-t border-[#f0ebe1] pt-4 text-center">
          <p className="text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-[#0b634e] hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
