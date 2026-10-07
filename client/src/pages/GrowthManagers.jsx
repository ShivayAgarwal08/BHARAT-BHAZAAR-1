import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Shield, Award, Briefcase, CheckCircle2, UserCheck, Search, Filter, Sparkles, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TIERS = [
  { id: 'All', name: 'All Tiers' },
  { id: 'STARTER', name: 'Starter', desc: 'Catalog & basic setup' },
  { id: 'GROWTH', name: 'Growth', desc: 'Branding & Social media' },
  { id: 'PRO', name: 'Pro', desc: 'Multichannel & Operations' },
  { id: 'EXPERT', name: 'Expert', desc: 'End-to-end digital growth' },
];

export default function GrowthManagers() {
  const { user } = useAuth();
  const [interns, setInterns] = useState([]);
  const [openRequests, setOpenRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState('All');
  const [searchSkill, setSearchSkill] = useState('');
  const [selectedIntern, setSelectedIntern] = useState(null);
  
  // Contract Modal Form
  const [contractTitle, setContractTitle] = useState('');
  const [contractDesc, setContractDesc] = useState('');
  const [duration, setDuration] = useState('1 Month');
  const [paymentType, setPaymentType] = useState('FIXED');
  const [paymentAmount, setPaymentAmount] = useState('0');
  const [submittingContract, setSubmittingContract] = useState(false);
  const [contractError, setContractError] = useState('');


  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRequests = async (currentPage = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/requests?status=OPEN&page=${currentPage}&limit=10`);
      setOpenRequests(res.data.data || res.data);
      if (res.data.meta) {
        setTotalPages(res.data.meta.totalPages);
      }
    } catch (err) {
      console.error('Fetch requests error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInterns = async () => {
    try {
      setLoading(true);
      const url =
        selectedTier === 'All'
          ? `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/interns`
          : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/interns?tier=${selectedTier}`;

      const res = await axios.get(url);
      setInterns(res.data);
    } catch (err) {
      console.error('Fetch interns error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'INTERN') {
      fetchRequests(page);
    } else {
      fetchInterns();
    }
  }, [selectedTier, user, page]);



  const handleCreateContractProposal = async (e) => {
    e.preventDefault();
    if (!selectedIntern) return;

    try {
      setSubmittingContract(true);
      setContractError('');

      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/contracts`, {
        internId: selectedIntern.id,
        title: contractTitle,
        description: contractDesc,
        tier: selectedIntern.tier,
        duration,
        paymentType,
        paymentAmount: parseFloat(paymentAmount) || 0,
        responsibilities: [
          'Improve Bharat Bazaar product listings',
          'Optimize product photos & descriptions',
          'Provide digital growth recommendations',
        ],
      });

      setSelectedIntern(null);
      navigate(`/contracts/${res.data.id}`);
    } catch (err) {
      console.error('Contract creation error:', err);
      setContractError(err.response?.data?.error || 'Failed to propose contract');
    } finally {
      setSubmittingContract(false);
    }
  };

  const filteredInterns = interns.filter((i) => {
    if (!searchSkill) return true;
    const term = searchSkill.toLowerCase();
    const matchesSkill = Array.isArray(i.skills) && i.skills.some((s) => s?.toLowerCase().includes(term));
    const matchesName = i.name?.toLowerCase().includes(term);
    const matchesCollege = i.college?.toLowerCase().includes(term);
    return matchesSkill || matchesName || matchesCollege;
  });

  const filteredRequests = openRequests.filter((r) => {
    if (!searchSkill) return true;
    const term = searchSkill.toLowerCase();
    return r.title?.toLowerCase().includes(term) ||
      r.description?.toLowerCase().includes(term) ||
      r.category?.toLowerCase().includes(term);
  });

  if (user?.role === 'INTERN') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-yellow-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 text-xs font-semibold uppercase tracking-wider border border-amber-400/30">
              <Star className="w-3.5 h-3.5" /> Growth Opportunities
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Partner with Indian Artisans to Grow Their Digital Business
            </h1>
            <p className="text-amber-100 text-sm sm:text-base leading-relaxed">
              Browse open requests from artisans who need help with cataloguing, branding, social media, shipping, and e-commerce.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search opportunities..."
              value={searchSkill}
              onChange={(e) => setSearchSkill(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading opportunities...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center space-y-3">
            <Star className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-xl font-bold text-gray-900">No open requests found</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Check back soon for new opportunities to help artisans grow.
            </p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredRequests.map(req => (
                <div key={req.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-amber-50 text-amber-800 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                        {req.category}
                      </span>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                        Budget: {req.budget || 'Negotiable'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{req.title}</h3>
                    <p className="text-xs text-gray-500 mb-3">By {req.artisan?.user?.name || 'Artisan'}</p>
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                      {req.description}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/dashboard/requests/${req.id}`)}
                    className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold rounded-xl text-sm transition-colors border border-gray-200"
                  >
                    View Request Details
                  </button>
                </div>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                <button
                  disabled={page === 1}
                  onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }}
                  className="px-4 py-2 border rounded-xl disabled:opacity-50 text-sm font-bold bg-white"
                >
                  Previous
                </button>
                <span className="text-sm font-semibold text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }}
                  className="px-4 py-2 border rounded-xl disabled:opacity-50 text-sm font-bold bg-white"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-yellow-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 text-xs font-semibold uppercase tracking-wider border border-amber-400/30">
            <UserCheck className="w-3.5 h-3.5" /> Growth Manager Directory
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Partner with Student Growth Managers to Expand Your Digital Business
          </h1>
          <p className="text-amber-100 text-sm sm:text-base leading-relaxed">
            Choose from tiered, vetted student managers skilled in cataloguing, branding, social media, shipping, and external e-commerce registration.
          </p>
        </div>
      </div>

      {/* Tier Filter Pills & Search */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by skill (e.g., Social Media, Catalog, Photography) or name..."
              value={searchSkill}
              onChange={(e) => setSearchSkill(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1 pr-2">
            <Filter className="w-3.5 h-3.5" /> Tier:
          </span>
          {TIERS.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTier(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedTier === t.id
                  ? 'bg-amber-800 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-20 bg-gray-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredInterns.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center space-y-3">
          <UserCheck className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-lg font-bold text-gray-800">No Growth Managers Found</h3>
          <p className="text-gray-500 text-sm">Try selecting a different tier or clearing your skill search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInterns.map((manager) => (
            <div
              key={manager.id}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-lg shadow-inner">
                      {manager.name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{manager.name}</h3>
                      <p className="text-xs text-gray-500">{manager.college || 'Student Growth Manager'}</p>
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-extrabold uppercase tracking-wider">
                    {manager.tier}
                  </span>
                </div>

                {/* Rating & Projects */}
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl text-xs text-gray-700">
                  <div className="flex items-center gap-1 font-bold text-amber-800">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    {manager.rating}
                  </div>
                  <div className="flex items-center gap-1 font-medium text-gray-600">
                    <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                    {manager.completedProjects} Completed Projects
                  </div>
                </div>

                {/* Bio */}
                {manager.bio && (
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed italic">
                    "{manager.bio}"
                  </p>
                )}

                {/* Skills Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {manager.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-[11px] font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              {user?.role === 'ARTISAN' && (
                <button
                  onClick={() => {
                    setSelectedIntern(manager);
                    setContractTitle(`Digital Growth Agreement with ${manager.name}`);
                  }}
                  className="w-full py-2.5 bg-amber-700 text-white rounded-xl font-bold text-xs hover:bg-amber-800 transition-colors shadow-sm flex items-center justify-center gap-1.5 mt-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Hire / Propose Contract
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Contract Proposal Modal */}
      {selectedIntern && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative animate-in fade-in">
            <button
              onClick={() => setSelectedIntern(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Formal Engagement Proposal
              </span>
              <h2 className="text-xl font-extrabold text-gray-900">
                Propose Growth Contract to {selectedIntern.name}
              </h2>
              <p className="text-xs text-gray-500">Tier: {selectedIntern.tier} Growth Manager</p>
            </div>

            {contractError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-medium">{contractError}</div>
            )}

            <form onSubmit={handleCreateContractProposal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Contract Title
                </label>
                <input
                  type="text"
                  required
                  value={contractTitle}
                  onChange={(e) => setContractTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Expected Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-700 font-medium"
                >
                  <option value="2 Weeks">2 Weeks</option>
                  <option value="1 Month">1 Month</option>
                  <option value="3 Months">3 Months</option>
                  <option value="6 Months">6 Months</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Engagement Type
                  </label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-700 font-medium"
                  >
                    <option value="FREE">Free Learning Project</option>
                    <option value="FIXED">Fixed Stipend</option>
                    <option value="HOURLY">Hourly Rate</option>
                    <option value="STIPEND">Monthly Stipend</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-700 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Scope & Responsibilities
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail specific tasks (e.g. Catalog cleanup, Social media setup, E-commerce onboarding)..."
                  value={contractDesc}
                  onChange={(e) => setContractDesc(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-700"
                />
              </div>

              <button
                type="submit"
                disabled={submittingContract}
                className="w-full py-3 bg-amber-700 text-white font-bold rounded-xl text-sm hover:bg-amber-800 transition-colors shadow-md disabled:bg-gray-400"
              >
                {submittingContract ? 'Sending Proposal...' : 'Send Formal Contract Proposal'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
