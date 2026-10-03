import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [phone, setPhone] = useState('1111111111'); // Demo Artisan
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await login(phone, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 card">
      <h2 className="text-2xl font-bold mb-6 text-center text-primary">Login to Bharat Bazaar</h2>
      {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1">Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
          />
        </div>
        <button type="submit" className="btn-primary w-full mt-4">Login</button>
      </form>
      <div className="mt-6 text-sm text-text-light text-center">
        Demo Accounts:<br/>
        Artisan: 1111111111 | Intern: 2222222222 | Admin: 0000000000 <br/>
        Password: password123
      </div>
    </div>
  );
}
