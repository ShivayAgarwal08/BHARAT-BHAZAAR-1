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

  // Profile update state
  const [tier, setTier] = useState('STARTER');
  const [hourlyRate, setHourlyRate] = useState('');
  const [projectRate, setProjectRate] = useState('');
  const [bio, setBio] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'INTERN') {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [reqRes, appRes, contractRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/requests`),
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/applications/my`),
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/contracts/my`),
        ]);

        setOpenRequests(reqRes.data.data || reqRes.data);
        setMyApplications(appRes.data);
        setContracts(contractRes.data);

        if (user.intern) {
          setTier(user.intern.tier || 'STARTER');
          setHourlyRate(user.intern.hourlyRate || '');
          setProjectRate(user.intern.projectRate || '');
          setBio(user.intern.bio || '');

          const repRes = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/projects/intern/${user.intern.id}/reputation`
          );
          setReputation(repRes.data);
        }
      } catch (err) {
        console.error('Failed to load intern dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
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
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-500 font-medium">Loading Growth Manager workspace...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Reputation Badge */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-extrabold uppercase">
              {tier} Growth Manager
            </span>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 text-gray-400 hover:text-amber-800 rounded-lg hover:bg-gray-100"
              title="Configure Tier & Rates"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
            Growth Manager Workspace
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Manage your artisan client contracts, work on growth milestones, and build your digital reputation.
          </p>
        </div>

        {reputation && (
          <div className="flex items-center gap-6 bg-amber-50/70 p-4 rounded-2xl border border-amber-100">
            <div className="text-center">
              <span className="block text-2xl font-extrabold text-amber-900 flex items-center gap-1 justify-center">
                {reputation.averageRating} <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              </span>
              <span className="text-[10px] text-amber-800 uppercase font-bold tracking-wider">
                {reputation.reviews} Reviews
              </span>
            </div>
            <div className="w-px h-8 bg-amber-200"></div>
            <div className="text-center">
              <span className="block text-2xl font-extrabold text-gray-900">
                {reputation.projectsCompleted}
              </span>
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                Completed Clients
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tier Settings Drawer Modal */}
      {showSettings && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-3xl p-6 space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center border-b border-amber-200/60 pb-3">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-800" />
              Configure Growth Manager Tier & Rate Preferences
            </h3>
            <button onClick={() => setShowSettings(false)} className="text-xs font-bold text-gray-500 hover:text-gray-700">
              Close
            </button>
          </div>

          <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Target Tier</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-bold"
              >
                <option value="STARTER">STARTER (Basic Catalog & Setup)</option>
                <option value="GROWTH">GROWTH (Branding & Social Media)</option>
                <option value="PRO">PRO (Multichannel E-commerce)</option>
                <option value="EXPERT">EXPERT (End-to-End Growth Operations)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Hourly Rate (₹)</label>
              <input
                type="number"
                placeholder="e.g. 300"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Project Rate (₹)</label>
              <input
                type="number"
                placeholder="e.g. 5000"
                value={projectRate}
                onChange={(e) => setProjectRate(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={updatingProfile}
                className="px-5 py-2.5 bg-amber-700 text-white font-bold rounded-xl text-xs hover:bg-amber-800 shadow"
              >
                Save Preferences
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Client Contracts */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-700" />
            Active Client Contracts ({contracts.length})
          </h2>
        </div>

        {contracts.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs italic">
            You don't have any active artisan client contracts yet. Apply for growth opportunities below!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contracts.map((contract) => {
              const targetProjectId = contract.projectId || contract.project?.id;
              return (
                <div
                  key={contract.id}
                  className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition bg-white flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="bg-amber-50 text-amber-800 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase">
                        {contract.tier} Tier
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                          contract.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {contract.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-gray-900">
                      {contract.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Artisan Client: <span className="font-semibold text-gray-800">{contract.artisan?.user?.name}</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-amber-900">₹{contract.paymentAmount} ({contract.paymentType})</span>
                      <span className="text-xs text-gray-500">{contract.tasks?.filter(t => t.isCompleted).length || 0} tasks done</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {targetProjectId && (
                        <Link
                          to={`/projects/${targetProjectId}`}
                          className="flex-1 text-center py-2 px-3 bg-amber-700 text-white rounded-xl text-xs font-bold hover:bg-amber-800 transition-colors shadow-sm"
                        >
                          Open Workspace &rarr;
                        </Link>
                      )}
                      <Link
                        to={`/contracts/${contract.id}`}
                        state={{ projectId: targetProjectId }}
                        className="py-2 px-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors text-center"
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
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">
          My Applications Track ({myApplications.length})
        </h2>

        {myApplications.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-xs italic">
            You haven't submitted any applications yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-3.5 rounded-tl-xl">Request Title</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 rounded-tr-xl text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {myApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-amber-900">
                      <Link to={`/dashboard/requests/${app.requestId}`} className="hover:underline">
                        {app.request?.title}
                      </Link>
                    </td>
                    <td className="p-3.5 text-gray-600">{app.request?.category}</td>
                    <td className="p-3.5 text-gray-400">
                      {new Date(app.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-3.5 text-right">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          app.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
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

      {/* Open Artisan Growth Opportunities Directory */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">
          Open Artisan Growth Opportunities ({openRequests.length})
        </h2>

        {openRequests.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs italic">
            There are currently no open artisan requests. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {openRequests.map((req) => (
              <Link
                key={req.id}
                to={`/dashboard/requests/${req.id}`}
                className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition bg-white flex flex-col justify-between space-y-4 group block"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="bg-amber-50 text-amber-800 px-2.5 py-1 rounded-md text-[10px] font-extrabold">
                      {req.category}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(req.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-gray-900 group-hover:text-amber-800 transition-colors line-clamp-1">
                    {req.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{req.description}</p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">{req.artisan?.user?.name}</span>
                  <span className="font-bold text-amber-900">{req.budget || 'Budget Open'}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
