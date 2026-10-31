import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Shield, Award, Briefcase, CheckCircle2, UserCheck, Search, Filter, Sparkles, X, ArrowRight } from 'lucide-react';
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
        <div className="card-forest rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="max-w-2xl space-y-3.5 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-100 text-xs font-semibold uppercase tracking-wider border border-white/15 backdrop-blur-sm">
              <Star className="w-3.5 h-3.5 text-amber-300" /> Growth Opportunities
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
              Partner with Indian Artisans to Scale Their Digital Presence
            </h1>
            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
              Browse open requests posted by rural and regional artisans who need skilled assistance with cataloguing, branding, product photography, and multichannel expansion.
            </p>
          </div>
        </div>

        <div className="card p-5">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search opportunities by title, craft category, or description..."
              value={searchSkill}
              onChange={(e) => setSearchSkill(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 text-xs">Loading opportunities...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="card p-12 text-center space-y-3">
            <Star className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 font-display">No open requests found</h3>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">
              Check back soon for new artisan growth opportunities.
            </p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {filteredRequests.map(req => (
                <div key={req.id} className="card card-hover p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-start">
                      <span className="bg-[#e3f6f0] text-[#06372b] px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-[#a7f3d0] uppercase tracking-wider">
                        {req.category}
                      </span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Budget: {req.budget || 'Negotiable'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 font-display">{req.title}</h3>
                    <p className="text-xs text-slate-500">By {req.artisan?.user?.name || 'Artisan'}</p>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {req.description}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/dashboard/requests/${req.id}`)}
                    className="btn-secondary w-full py-2 text-xs font-bold text-center"
                  >
                    View Request Details &rarr;
                  </button>
                </div>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3">
                <button
                  disabled={page === 1}
                  onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }}
                  className="btn-secondary text-xs py-2 px-4 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-slate-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }}
                  className="btn-secondary text-xs py-2 px-4 disabled:opacity-40"
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
      <div className="card-forest rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
        <div className="max-w-2xl space-y-3.5 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-100 text-xs font-semibold uppercase tracking-wider border border-white/15 backdrop-blur-sm">
            <UserCheck className="w-3.5 h-3.5 text-amber-300" /> Growth Manager Directory
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
            Partner with Student Growth Managers to Scale Your Craft
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            Choose from tiered, university-vetted student apprentices skilled in digital cataloguing, artisan storytelling, social media, and logistics setup.
          </p>
        </div>
      </div>

      {/* Tier Filter Pills & Search */}
      <div className="card p-5 space-y-4">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by skill (e.g., Social Media, Catalog, Photography) or manager name..."
            value={searchSkill}
            onChange={(e) => setSearchSkill(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 pr-2 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Tier:
          </span>
          {TIERS.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTier(t.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedTier === t.id
                  ? 'bg-[#0b634e] text-white shadow-sm'
                  : 'bg-[#f4efe6] text-slate-700 hover:bg-[#eae2d5]'
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
            <div key={n} className="card p-6 animate-pulse space-y-4">
              <div className="h-5 bg-slate-100 rounded w-1/2"></div>
              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
              <div className="h-20 bg-slate-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredInterns.length === 0 ? (
        <div className="card p-12 text-center space-y-3">
          <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 font-display">No Growth Managers Found</h3>
          <p className="text-slate-500 text-xs">Try selecting a different tier or clearing your search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInterns.map((manager) => (
            <div
              key={manager.id}
              className="card card-hover p-6 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#06372b] to-[#0b634e] text-white font-bold flex items-center justify-center text-base shadow-sm font-display">
                      {manager.name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base font-display">{manager.name}</h3>
                      <p className="text-xs text-slate-500">{manager.college || 'Student Growth Partner'}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 bg-[#f4efe6] text-slate-800 border border-[#ded6c9] rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {manager.tier}
                  </span>
                </div>

                {/* Rating & Projects */}
                <div className="flex items-center gap-4 bg-[#faf8f5] p-3 rounded-xl border border-[#ded6c9]/60 text-xs text-slate-700">
                  <div className="flex items-center gap-1 font-bold text-slate-900 font-display">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {manager.rating}
                  </div>
                  <div className="w-px h-4 bg-slate-200"></div>
                  <div className="flex items-center gap-1.5 font-medium text-slate-600">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    {manager.completedProjects} Completed Projects
                  </div>
                </div>

                {/* Bio */}
                {manager.bio && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed italic">
                    "{manager.bio}"
                  </p>
                )}

                {/* Skills Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {manager.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-[#f4efe6] text-slate-700 rounded-md text-[10px] font-semibold border border-[#ded6c9]/40"
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
                  className="btn-primary w-full py-2.5 text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 mt-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Hire / Propose Contract
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Contract Proposal Modal */}
      {selectedIntern && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative animate-in fade-in border border-[#ded6c9]">
            <button
              onClick={() => setSelectedIntern(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#0b634e] uppercase tracking-wider block">
                Formal Engagement Proposal
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 font-display">
                Propose Growth Contract to {selectedIntern.name}
              </h2>
              <p className="text-xs text-slate-500">Tier: {selectedIntern.tier} Growth Manager</p>
            </div>

            {contractError && (
              <div className="bg-rose-50 text-rose-700 p-3 rounded-xl text-xs font-medium border border-rose-200">{contractError}</div>
            )}

            <form onSubmit={handleCreateContractProposal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Contract Title
                </label>
                <input
                  type="text"
                  required
                  value={contractTitle}
                  onChange={(e) => setContractTitle(e.target.value)}
                  className="input-field text-xs py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Expected Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="input-field text-xs py-2 font-medium bg-white"
                >
                  <option value="2 Weeks">2 Weeks</option>
                  <option value="1 Month">1 Month</option>
                  <option value="3 Months">3 Months</option>
                  <option value="6 Months">6 Months</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Engagement Type
                  </label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="input-field text-xs py-2 font-medium bg-white"
                  >
                    <option value="FREE">Free Learning Project</option>
                    <option value="FIXED">Fixed Stipend</option>
                    <option value="HOURLY">Hourly Rate</option>
                    <option value="STIPEND">Monthly Stipend</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="input-field text-xs py-2 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Scope & Deliverables
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail specific tasks (e.g. Catalog cleanup, Social media setup, E-commerce onboarding)..."
                  value={contractDesc}
                  onChange={(e) => setContractDesc(e.target.value)}
                  className="input-field text-xs py-2 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingContract}
                className="btn-primary w-full py-3 text-xs font-bold shadow-md"
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
