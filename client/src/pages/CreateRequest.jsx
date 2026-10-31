import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft, Sparkles, TrendingUp } from 'lucide-react';

export default function CreateRequest() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Instagram Marketing',
    budget: '',
    deadline: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.role !== 'ARTISAN') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/requests`, formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0b634e] mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">{t('createRequest')}</h1>
        <p className="text-slate-600 text-xs sm:text-sm mt-1">{t('createRequestSub')}</p>
      </div>

      <div className="card p-6 sm:p-10 space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs font-medium animate-in fade-in">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Request Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Need assistance with Instagram storytelling & catalog photography"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-field bg-white"
              required
            >
              <option value="Instagram Marketing">Instagram Marketing</option>
              <option value="Product Photography">Product Photography</option>
              <option value="Catalog Management">Catalog Management</option>
              <option value="Packaging & Shipping">Packaging & Shipping</option>
              <option value="E-commerce Expansion">E-commerce Expansion</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Stipend / Budget (e.g. ₹2000 or Free Learning)
              </label>
              <input
                type="text"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g. ₹3,000 / month or Learning Project"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Detailed Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Explain your craft, current digital challenges, and what specific tasks you need help with..."
              className="input-field h-36 resize-none text-xs sm:text-sm leading-relaxed"
              required
            />
          </div>

          <div className="flex items-center gap-3.5 pt-4 border-t border-[#f0ebe1]">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary px-6 py-2.5 text-xs font-bold"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 py-3 text-xs sm:text-sm font-bold shadow-md"
              disabled={loading}
            >
              {loading ? 'Submitting Request...' : 'Post Growth Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
