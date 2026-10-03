import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function CreateRequest() {
  const { user } = useAuth();
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
      await axios.post('http://localhost:5001/api/requests', formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-text">Create Growth Request</h1>
        <p className="text-text-light mt-2">Find a student to help grow your business digitally.</p>
      </div>

      <div className="card p-8">
        {error && <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Request Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Need someone to manage my Instagram"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="Instagram Marketing">Instagram Marketing</option>
              <option value="Branding">Branding</option>
              <option value="Product Photography">Product Photography</option>
              <option value="Amazon Listing">Amazon Listing</option>
              <option value="Website">Website</option>
              <option value="Graphic Design">Graphic Design</option>
              <option value="Video Editing">Video Editing</option>
              <option value="Digital Marketing">Digital Marketing</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Explain what you need help with..."
              className="input-field h-32 resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Budget (Optional)</label>
              <input
                type="text"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g. 1000 INR or Negotiable"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Deadline (Optional)</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t mt-8">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-outline px-8"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 text-lg py-3"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Post Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
