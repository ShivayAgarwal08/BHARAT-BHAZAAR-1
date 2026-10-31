import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, User, Calendar, Tag, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export default function RequestDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Intern application state
  const [applyMessage, setApplyMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [myApplication, setMyApplication] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const reqRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/requests/${id}`);
        setRequest(reqRes.data);

        if (user.role === 'ARTISAN') {
          // Fetch all applicants if Artisan
          const appRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/requests/${id}/applications`);
          setApplications(appRes.data);
        } else if (user.role === 'INTERN') {
          // Check if intern already applied
          const myAppsRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/applications/my`);
          const existingApp = myAppsRes.data.find(app => app.requestId === id);
          if (existingApp) {
            setMyApplication(existingApp);
          }
        }
      } catch (err) {
        setError('Failed to load request details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, user, navigate]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!applyMessage.trim()) return;
    setIsApplying(true);
    
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/applications`, {
        requestId: id,
        message: applyMessage
      });
      setMyApplication(res.data);
      alert('Application submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to apply');
    } finally {
      setIsApplying(false);
    }
  };

  const handleAccept = async (applicationId) => {
    if (!window.confirm('Are you sure you want to select this Growth Manager? All other applications will be rejected and the project will start.')) return;
    
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/applications/${applicationId}/accept`);
      alert('Growth Manager selected! Project is now in progress.');
      // Refresh data
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to accept application');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-[#0b634e] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 font-medium text-xs">Loading request details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center card p-8">
        <p className="text-rose-600 font-semibold text-xs">{error}</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center card p-8">
        <p className="text-slate-600 font-medium text-xs">Request not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <Link
        to={user.role === 'INTERN' ? '/growth-managers' : '/dashboard'}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0b634e] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-[#f0ebe1] pb-5">
        <div className="space-y-1.5">
          <span className="bg-[#e3f6f0] text-[#06372b] px-3 py-1 rounded-full text-xs font-bold border border-[#a7f3d0] uppercase tracking-wider inline-block">
            {request.category}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">{request.title}</h1>
          <p className="text-xs text-slate-500">Posted by {request.artisan?.user?.name || 'Artisan'}</p>
        </div>

        <span className={`text-xs font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider border shrink-0 ${
          request.status === 'OPEN' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
          request.status === 'IN_PROGRESS' ? 'bg-sky-50 text-sky-800 border-sky-200' :
          'bg-slate-100 text-slate-700 border-slate-200'
        }`}>
          {request.status}
        </span>
      </div>

      <div className="card p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 border-b border-[#f0ebe1] pb-3 font-display">
            Request Overview & Goals
          </h2>
          <p className="whitespace-pre-wrap text-slate-600 text-xs sm:text-sm leading-relaxed mt-4">
            {request.description}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-xs card-cream p-4 rounded-2xl border border-[#ded6c9]">
          <div>
            <span className="block text-slate-400 font-bold uppercase tracking-wider text-[10px]">Proposed Budget</span>
            <span className="font-extrabold text-slate-900 text-sm font-display">{request.budget || 'Open / Discussion'}</span>
          </div>
          <div>
            <span className="block text-slate-400 font-bold uppercase tracking-wider text-[10px]">Target Date</span>
            <span className="font-bold text-slate-800 text-sm font-display">
              {request.deadline ? new Date(request.deadline).toLocaleDateString('en-IN') : 'Flexible'}
            </span>
          </div>
        </div>
      </div>

      {/* Intern View */}
      {user.role === 'INTERN' && (
        <div className="card p-6 sm:p-8 space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-[#f0ebe1] pb-3 font-display">
            Your Application
          </h2>
          
          {myApplication ? (
            <div className="card-cream border border-[#ded6c9] p-5 rounded-2xl space-y-3">
              <h3 className="font-bold text-[#06372b] text-sm font-display">Application Submitted</h3>
              <p className="text-xs text-slate-600">You have registered your interest for this artisan opportunity.</p>
              
              <div className="bg-white p-4 rounded-xl border border-[#ded6c9] text-xs text-slate-700">
                <span className="font-bold text-slate-900 block mb-1">Your Pitch:</span>
                {myApplication.message}
              </div>
              
              <div className="flex items-center gap-2 pt-1">
                <span className="font-bold text-xs text-slate-700">Status:</span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                  myApplication.status === 'PENDING' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                  myApplication.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                  'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {myApplication.status}
                </span>
              </div>
              {myApplication.status === 'ACCEPTED' && (
                <div className="mt-3 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200">
                  🎉 Congratulations! The artisan has accepted your proposal. The milestone workspace is now active.
                </div>
              )}
            </div>
          ) : request.status === 'OPEN' ? (
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Why are you the right fit? (Cover Message & Strategy)
                </label>
                <textarea
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  className="input-field h-32 resize-none text-xs sm:text-sm leading-relaxed"
                  placeholder="Introduce yourself, cite your relevant skills (e.g. photography, catalog writing, Reels), and describe your proposed approach..."
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn-primary w-full py-3 text-xs font-bold shadow-md"
                disabled={isApplying}
              >
                {isApplying ? 'Submitting Application...' : 'Apply as Growth Manager'}
              </button>
            </form>
          ) : (
            <div className="text-center p-6 bg-[#faf8f5] rounded-2xl text-slate-500 text-xs border border-[#ded6c9]">
              This artisan request is no longer accepting new applications.
            </div>
          )}
        </div>
      )}

      {/* Artisan View */}
      {user.role === 'ARTISAN' && (
        <div className="card p-6 sm:p-8 space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-[#f0ebe1] pb-3 font-display">
            Applicant Proposals ({applications.length})
          </h2>
          
          {request.status === 'IN_PROGRESS' && (
            <div className="p-4 bg-sky-50 text-sky-800 rounded-2xl text-xs font-semibold border border-sky-200">
              Project Started! You have selected your student Growth Manager.
            </div>
          )}

          {applications.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs italic">
              No applications submitted yet. Student Growth Managers will be notified of your request.
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map(app => (
                <div key={app.id} className={`border rounded-2xl p-5 bg-white space-y-3 ${app.status === 'ACCEPTED' ? 'border-emerald-300 bg-emerald-50/20' : 'border-[#ded6c9]'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 font-display">{app.intern?.user?.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border mt-1 inline-block ${
                        app.status === 'PENDING' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        app.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    
                    {request.status === 'OPEN' && app.status === 'PENDING' && (
                      <button 
                        onClick={() => handleAccept(app.id)}
                        className="btn-primary text-xs py-2 px-4 shadow-sm"
                      >
                        Select Growth Manager
                      </button>
                    )}
                  </div>
                  
                  <div className="bg-[#faf8f5] p-3.5 rounded-xl text-xs text-slate-700 whitespace-pre-wrap border border-[#ded6c9]/60 leading-relaxed">
                    {app.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
