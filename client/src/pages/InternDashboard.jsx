import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function InternDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [openRequests, setOpenRequests] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [projects, setProjects] = useState([]);
  const [reputation, setReputation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'INTERN') {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const [reqRes, appRes, projRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/requests`),
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/applications/my`),
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/projects`)
        ]);
        setOpenRequests(reqRes.data);
        setMyApplications(appRes.data);
        setProjects(projRes.data);

        // Fetch reputation
        if (user.intern?.id) {
          const repRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/projects/intern/${user.intern.id}/reputation`);
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

  if (loading) return <div className="text-center py-12">Loading marketplace...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-text">Growth Manager Dashboard</h1>
          <p className="text-text-light mt-1">Find local businesses and manage your projects.</p>
        </div>
        
        {reputation && (
          <div className="flex items-center gap-6 bg-white p-4 rounded-xl border shadow-sm">
            <div className="text-center">
              <span className="block text-2xl font-bold text-primary">{reputation.averageRating} <span className="text-lg">⭐</span></span>
              <span className="text-xs text-gray-500 uppercase font-semibold">{reputation.reviews} Reviews</span>
            </div>
            <div className="w-px h-10 bg-gray-200"></div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-text">{reputation.projectsCompleted}</span>
              <span className="text-xs text-gray-500 uppercase font-semibold">Completed</span>
            </div>
          </div>
        )}
      </div>

      {/* Active Projects Section */}
      <div className="card p-6">
        <h2 className="text-xl font-bold border-b pb-4 mb-6">My Projects</h2>
        
        {projects.length === 0 ? (
          <div className="text-center py-8 text-text-light">
            You don't have any active projects yet. Apply for requests below!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(proj => (
              <Link key={proj.id} to={`/projects/${proj.id}`} className="border rounded-xl p-5 hover:shadow-md transition bg-white flex flex-col group block cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-orange-50 text-primary px-2 py-1 rounded text-xs font-semibold">
                    {proj.request?.category}
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    proj.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                    proj.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {proj.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-text mb-2 line-clamp-1 group-hover:text-primary transition-colors">{proj.request?.title}</h3>
                <p className="text-sm text-text-light mb-4">Business: {proj.artisan?.user?.name}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* My Applications Section */}
      <div className="card p-6">
        <h2 className="text-xl font-bold border-b pb-4 mb-6">My Applications</h2>
        
        {myApplications.length === 0 ? (
          <div className="text-center py-8 text-text-light">
            You haven't applied to any requests yet. Browse the marketplace below!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-gray-50 text-text-light text-sm">
                  <th className="p-4 rounded-tl-lg font-medium">Request Title</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Request Status</th>
                  <th className="p-4 rounded-tr-lg font-medium text-right">My Status</th>
                </tr>
              </thead>
              <tbody>
                {myApplications.map(app => (
                  <tr key={app.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <Link to={`/dashboard/requests/${app.requestId}`} className="font-medium text-primary hover:underline">
                        {app.request.title}
                      </Link>
                    </td>
                    <td className="p-4"><span className="bg-orange-50 text-primary px-2 py-1 rounded text-xs">{app.request.category}</span></td>
                    <td className="p-4 text-sm text-text-light">{app.request.status}</td>
                    <td className="p-4 text-right">
                      <span className={`text-xs font-bold px-2 py-1 rounded inline-block ${
                        app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        app.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {app.status === 'ACCEPTED' ? 'PROJECT STARTED' : app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Marketplace Section */}
      <div className="card p-6">
        <h2 className="text-xl font-bold border-b pb-4 mb-6">Open Requests</h2>
        
        {openRequests.length === 0 ? (
          <div className="text-center py-12 text-text-light">
            There are currently no open growth requests. Check back later!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {openRequests.map(req => (
              <Link 
                key={req.id} 
                to={`/dashboard/requests/${req.id}`}
                className="border rounded-xl p-5 hover:shadow-md transition bg-white flex flex-col group block cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-orange-50 text-primary px-2 py-1 rounded text-xs font-semibold">
                    {req.category}
                  </span>
                  <span className="text-xs text-text-light">{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
                
                <h3 className="font-bold text-lg text-text mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {req.title}
                </h3>
                <p className="text-sm text-text-light mb-4 line-clamp-3 flex-grow">{req.description}</p>
                
                <div className="mt-auto pt-4 border-t flex flex-wrap gap-y-2 justify-between items-center text-sm">
                  <div className="text-gray-500 font-medium">
                    {req.artisan?.user?.name}
                  </div>
                  <div className="font-semibold text-text">
                    {req.budget || 'Budget open'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
