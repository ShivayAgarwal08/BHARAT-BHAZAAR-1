import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Star,
  FileText,
  UserCheck,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Settings,
} from 'lucide-react';

export default function InternDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [openRequests, setOpenRequests] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [reputation, setReputation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Profile update state
  const [tier, setTier] = useState('STARTER');
  const [hourlyRate, setHourlyRate] = useState('');
  const [projectRate, setProjectRate] = useState('');
  const [bio, setBio] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [reqRes, appRes, contractRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/requests`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/applications/my`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/contracts/my`),
      ]);

      setOpenRequests(reqRes.data.data || reqRes.data || []);
      setMyApplications(appRes.data || []);
      setContracts(contractRes.data || []);

      if (user?.intern) {
        setTier(user.intern.tier || 'STARTER');
        setHourlyRate(user.intern.hourlyRate || '');
        setProjectRate(user.intern.projectRate || '');
        setBio(user.intern.bio || '');

        try {
          const repRes = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/projects/intern/${user.intern.id}/reputation`
          );
          setReputation(repRes.data);
        } catch (repErr) {
          console.warn('Reputation fetch error:', repErr);
        }
      }
    } catch (err) {
      console.error('Failed to load intern dashboard', err);
      setError('Unable to load Growth Manager dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'INTERN') {
      navigate('/');
      return;
    }

    fetchData();
  }, [user, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdatingProfile(true);
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/interns/profile`, {
        tier,
        hourlyRate,
        projectRate,
        bio,
      });
      setShowSettings(false);
      alert('Profile & Tier preferences updated!');
    } catch (err) {
      console.error('Profile update error:', err);
      alert('Failed to update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-[#0b634e] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 font-medium text-xs">Loading Growth Manager workspace...</p>
      </div>
    );
  }

  if (error && !contracts.length && !myApplications.length) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4 card p-8">
        <div className="w-12 h-12 bg-rose-50 text-rose-700 rounded-2xl flex items-center justify-center font-bold text-xl mx-auto">
          !
        </div>
        <h2 className="text-lg font-bold text-slate-900 font-display">Unable to load partnerships</h2>
        <p className="text-xs text-slate-500">{error}</p>
        <button
          onClick={fetchData}
          className="btn-primary text-xs py-2 px-5 inline-flex"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Reputation Badge */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 card p-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#e3f6f0] text-[#06372b] border border-[#a7f3d0] rounded-full text-[11px] font-bold uppercase tracking-wider">
              {tier} Growth Manager
            </span>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 text-slate-400 hover:text-[#0b634e] rounded-lg hover:bg-[#faf8f5] transition-colors"
              title="Configure Tier & Rates"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 font-display">
            Growth Manager Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your artisan partnerships, execute verified milestones, and build your digital e-commerce portfolio.
          </p>
        </div>

        {reputation && (
          <div className="flex items-center gap-6 card-cream p-4 rounded-2xl border border-[#ded6c9] shrink-0">
            <div className="text-center">
              <span className="block text-xl font-black text-slate-900 flex items-center gap-1 justify-center font-display">
                {reputation.averageRating} <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                {reputation.reviews} Reviews
              </span>
            </div>
            <div className="w-px h-8 bg-[#ded6c9]"></div>
            <div className="text-center">
              <span className="block text-xl font-black text-slate-900 font-display">
                {reputation.projectsCompleted}
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                Clients Finished
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tier Settings Drawer */}
      {showSettings && (
        <div className="card-cream border border-[#ded6c9] rounded-3xl p-6 space-y-4 animate-in fade-in shadow-sm">
          <div className="flex justify-between items-center border-b border-[#e8decb] pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 font-display">
              <Award className="w-4 h-4 text-[#0b634e]" />
              Configure Growth Manager Tier & Rate Preferences
            </h3>
            <button onClick={() => setShowSettings(false)} className="text-xs font-bold text-slate-500 hover:text-slate-800">
              Close
            </button>
          </div>

          <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Target Tier</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="input-field text-xs py-2 font-bold bg-white"
              >
                <option value="STARTER">STARTER (Basic Catalog & Setup)</option>
                <option value="GROWTH">GROWTH (Branding & Social Media)</option>
                <option value="PRO">PRO (Multichannel E-commerce)</option>
                <option value="EXPERT">EXPERT (End-to-End Growth Operations)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Hourly Rate (₹)</label>
              <input
                type="number"
                placeholder="e.g. 300"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="input-field text-xs py-2"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Project Rate (₹)</label>
              <input
                type="number"
                placeholder="e.g. 5000"
                value={projectRate}
                onChange={(e) => setProjectRate(e.target.value)}
                className="input-field text-xs py-2"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end pt-2">
              <button
                type="submit"
                disabled={updatingProfile}
                className="btn-primary text-xs py-2 px-5 font-semibold shadow-sm"
              >
                Save Preferences
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Client Contracts */}
      <div className="card p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-[#f0ebe1] pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
            <FileText className="w-4 h-4 text-[#0b634e]" />
            Active Client Contracts ({contracts.length})
          </h2>
        </div>

        {contracts.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs italic">
            You don't have any active artisan client contracts yet. Apply for growth opportunities below!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {contracts.map((contract) => {
              const targetProjectId = contract.projectId || contract.project?.id;
              return (
                <div
                  key={contract.id}
                  className="border border-[#ded6c9] rounded-2xl p-5 hover:shadow-md transition bg-white flex flex-col justify-between space-y-4 shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="bg-[#f4efe6] text-slate-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-[#ded6c9]">
                        {contract.tier} Tier
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                          contract.status === 'ACTIVE' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {contract.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 font-display">
                      {contract.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Artisan Client: <span className="font-semibold text-slate-800">{contract.artisan?.user?.name}</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#f0ebe1] space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-black text-slate-900 font-display">₹{contract.paymentAmount} ({contract.paymentType})</span>
                      <span className="text-[11px] text-slate-500">{contract.tasks?.filter(t => t.isCompleted).length || 0} tasks done</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {targetProjectId && (
                        <Link
                          to={`/projects/${targetProjectId}`}
                          className="btn-primary flex-1 text-center py-2 px-3 text-xs font-semibold shadow-sm"
                        >
                          Open Workspace &rarr;
                        </Link>
                      )}
                      <Link
                        to={`/contracts/${contract.id}`}
                        state={{ projectId: targetProjectId }}
                        className="btn-secondary py-2 px-3 text-xs font-semibold text-center"
                      >
                        Agreement
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Applications Track */}
      <div className="card p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-[#f0ebe1] pb-3 font-display">
          My Applications Track ({myApplications.length})
        </h2>

        {myApplications.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs italic">
            You haven't submitted any applications yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#f0ebe1] bg-[#faf8f5] text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-3.5 rounded-l-xl">Request Title</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 rounded-r-xl text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ebe1]">
                {myApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-[#faf8f5]/60 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 font-display">
                      <Link to={`/dashboard/requests/${app.requestId}`} className="hover:text-[#0b634e] hover:underline">
                        {app.request?.title}
                      </Link>
                    </td>
                    <td className="p-3.5 text-slate-600">{app.request?.category}</td>
                    <td className="p-3.5 text-slate-400">
                      {new Date(app.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-3.5 text-right">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          app.status === 'ACCEPTED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : app.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Open Artisan Growth Opportunities */}
      <div className="card p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-[#f0ebe1] pb-3 font-display">
          Open Artisan Growth Opportunities ({openRequests.length})
        </h2>

        {openRequests.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs italic">
            There are currently no open artisan requests. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {openRequests.map((req) => (
              <Link
                key={req.id}
                to={`/dashboard/requests/${req.id}`}
                className="border border-[#ded6c9] rounded-2xl p-5 hover:shadow-md transition bg-white flex flex-col justify-between space-y-4 group block shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="bg-[#e3f6f0] text-[#06372b] px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-[#a7f3d0]">
                      {req.category}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(req.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 group-hover:text-[#0b634e] transition-colors line-clamp-1 font-display">
                    {req.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{req.description}</p>
                </div>

                <div className="pt-3 border-t border-[#f0ebe1] flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">{req.artisan?.user?.name}</span>
                  <span className="font-black text-slate-900 font-display">{req.budget || 'Budget Open'}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
