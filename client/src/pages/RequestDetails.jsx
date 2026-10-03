import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

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
        const reqRes = await axios.get(`http://localhost:5001/api/requests/${id}`);
        setRequest(reqRes.data);

        if (user.role === 'ARTISAN') {
          // Fetch all applicants if Artisan
          const appRes = await axios.get(`http://localhost:5001/api/requests/${id}/applications`);
          setApplications(appRes.data);
        } else if (user.role === 'INTERN') {
          // Check if intern already applied
          const myAppsRes = await axios.get(`http://localhost:5001/api/applications/my`);
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
      const res = await axios.post('http://localhost:5001/api/applications', {
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
      await axios.put(`http://localhost:5001/api/applications/${applicationId}/accept`);
      alert('Growth Manager selected! Project is now in progress.');
      // Refresh data
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to accept application');
    }
  };

  if (loading) return <div className="text-center py-12">Loading details...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;
  if (!request) return <div className="text-center py-12">Request not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <span className="bg-orange-50 text-primary px-3 py-1 rounded-full text-sm font-semibold mb-3 inline-block">
            {request.category}
          </span>
          <h1 className="text-3xl font-extrabold text-text">{request.title}</h1>
          <p className="text-text-light mt-2">Posted by {request.artisan?.user?.name}</p>
        </div>
        <span className={`text-sm font-bold px-3 py-1.5 rounded-lg ${
          request.status === 'OPEN' ? 'bg-green-100 text-green-700' :
          request.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {request.status}
        </span>
      </div>

      <div className="card p-8 mb-8">
        <h2 className="text-xl font-bold border-b pb-4 mb-4">Request Details</h2>
        <p className="whitespace-pre-wrap text-text-light mb-6">{request.description}</p>
        
        <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl">
          <div>
            <span className="block text-gray-500 font-medium">Budget</span>
            <span className="font-semibold text-text">{request.budget || 'Not specified'}</span>
          </div>
          <div>
            <span className="block text-gray-500 font-medium">Deadline</span>
            <span className="font-semibold text-text">
              {request.deadline ? new Date(request.deadline).toLocaleDateString() : 'Not specified'}
            </span>
          </div>
        </div>
      </div>

      {/* Intern View */}
      {user.role === 'INTERN' && (
        <div className="card p-8">
          <h2 className="text-xl font-bold border-b pb-4 mb-4">Application</h2>
          
          {myApplication ? (
            <div className="bg-orange-50/50 border border-orange-100 p-6 rounded-xl">
              <h3 className="font-bold text-primary mb-2">Application Submitted</h3>
              <p className="text-sm text-text-light mb-4">You have already applied for this request.</p>
              
              <div className="bg-white p-4 rounded-lg border text-sm mb-4">
                <span className="font-semibold block mb-1">Your Message:</span>
                {myApplication.message}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">Status:</span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  myApplication.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                  myApplication.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {myApplication.status}
                </span>
              </div>
              {myApplication.status === 'ACCEPTED' && (
                <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-lg text-sm font-medium">
                  🎉 Congratulations! The artisan has selected you. The project has started.
                </div>
              )}
            </div>
          ) : request.status === 'OPEN' ? (
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Why are you a good fit? (Cover Message)</label>
                <textarea
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  className="input-field h-32 resize-none"
                  placeholder="Introduce yourself and explain how you can help..."
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn-primary w-full py-3"
                disabled={isApplying}
              >
                {isApplying ? 'Submitting...' : 'Apply as Growth Manager'}
              </button>
            </form>
          ) : (
            <div className="text-center p-6 bg-gray-50 rounded-xl text-gray-500">
              This request is no longer accepting applications.
            </div>
          )}
        </div>
      )}

      {/* Artisan View */}
      {user.role === 'ARTISAN' && (
        <div className="card p-8">
          <h2 className="text-xl font-bold border-b pb-4 mb-6">Applicants ({applications.length})</h2>
          
          {request.status === 'IN_PROGRESS' && (
            <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-xl font-medium">
              Project Started! You have selected a Growth Manager.
            </div>
          )}

          {applications.length === 0 ? (
            <div className="text-center py-8 text-text-light">
              No applications yet. Check back later!
            </div>
          ) : (
            <div className="space-y-6">
              {applications.map(app => (
                <div key={app.id} className={`border rounded-xl p-6 ${app.status === 'ACCEPTED' ? 'border-green-300 bg-green-50/30' : ''}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{app.intern?.user?.name}</h3>
                      <span className={`text-xs font-bold px-2 py-1 rounded mt-2 inline-block ${
                        app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        app.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    
                    {request.status === 'OPEN' && app.status === 'PENDING' && (
                      <button 
                        onClick={() => handleAccept(app.id)}
                        className="btn-primary text-sm py-2 px-4"
                      >
                        Select Growth Manager
                      </button>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg text-sm text-text-light whitespace-pre-wrap">
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
