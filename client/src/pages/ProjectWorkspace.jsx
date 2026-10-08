import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, BarChart, LifeBuoy, FileText, BarChart2, TrendingUp, Calendar, Clock, Target, CheckCircle, ArrowRight, Package, LayoutDashboard, ClipboardList } from 'lucide-react';

export default function ProjectWorkspace() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Rating states
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingReview, setRatingReview] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const socketRef = useRef();
  const chatEndRef = useRef(null);

  const [reports, setReports] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [contractDetails, setContractDetails] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  // Report states
  const [newReportPeriod, setNewReportPeriod] = useState('Week 1');
  const [newReportMetric, setNewReportMetric] = useState('Views');
  const [newReportValue, setNewReportValue] = useState('');
  const [newReportNotes, setNewReportNotes] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // Ticket states
  const [newTicketCategory, setNewTicketCategory] = useState('Technical Problem');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [newTicketPriority, setNewTicketPriority] = useState('NORMAL');
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [togglingTask, setTogglingTask] = useState(null);

  const handleToggleTask = async (taskId) => {
    try {
      setTogglingTask(taskId);
      const res = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/contracts/tasks/${taskId}/toggle`);
      const updatedTask = res.data;

      setContractDetails(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? updatedTask : t)
      }));
    } catch (err) {
      console.error('Failed to toggle task', err);
      alert(err.response?.data?.error || 'Failed to update task');
    } finally {
      setTogglingTask(null);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProjectData = async () => {
      try {
        const [projRes, msgRes, repRes, tickRes] = await Promise.all([  axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/projects/${id}`),
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/projects/${id}/messages`),
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/projects/${id}/reports`),
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/projects/${id}/support`),
        ]);

        const projectData = projRes.data;
        setProject(projectData);
        setMessages(msgRes.data);
        setReports(repRes.data);
        setTickets(tickRes.data);

        // Fetch contract details if available
        if (projectData.contract?.id) {
          try {
            const contractRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/contracts/${projectData.contract.id}`);
            setContractDetails(contractRes.data);
          } catch (err) {
            console.error('Failed to fetch contract details', err);
          }
        }

        // Fetch analytics based on role
        try {
          if (user.role === 'ARTISAN') {
            const analyticsRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/analytics/artisan`);
            setAnalytics(analyticsRes.data);
          } else if (user.role === 'INTERN' && projectData.artisan?.userId) {
            // Need artisan profile ID, but we only have artisan ID from project.
            // Wait, projectData.artisan.id is the artisan profile ID.
            const analyticsRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/analytics/intern/client/${projectData.artisan.id}`);
            setAnalytics(analyticsRes.data);
          }
        } catch (err) {
          console.error('Failed to fetch analytics', err);
        }

      } catch (err) {
        console.error('Failed to load project', err);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();

    // Socket.IO setup
    socketRef.current = io(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}`);

    socketRef.current.emit('joinProject', id);

    socketRef.current.on('receiveMessage', (messageData) => {
      setMessages((prev) => [...prev, messageData]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [id, user, navigate]);

  useEffect(() => {
    // Scroll to bottom on new message
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/projects/${id}/messages`, {
        content: newMessage,
      });

      const sentMsg = res.data;
      // Emit via socket
      socketRef.current.emit('sendMessage', { projectId: id, message: sentMsg });
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const handleCompleteProject = async () => {
    if (!window.confirm('Are you sure you want to mark this project as COMPLETED?')) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/projects/${id}/complete`);
      setProject({ ...project, status: 'COMPLETED' });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to complete project');
    }
  };

  const handleRateIntern = async (e) => {
    e.preventDefault();
    setIsSubmittingRating(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/projects/${id}/rating`, {
        score: ratingScore,
        review: ratingReview,
      });
      setRatingSubmitted(true);
      setProject({ ...project, rating: true }); // optimistic update
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit rating');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!newReportValue) return;
    try {
      setSubmittingReport(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/projects/${id}/reports`, {
        period: newReportPeriod,
        metric: newReportMetric,
        value: newReportValue,
        notes: newReportNotes,
      });
      setReports([res.data, ...reports]);
      setNewReportValue('');
      setNewReportNotes('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit report');
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicketMessage) return;
    try {
      setSubmittingTicket(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/projects/${id}/support`, {
        category: newTicketCategory,
        message: newTicketMessage,
        priority: newTicketPriority,
      });
      setTickets([res.data, ...tickets]);
      setNewTicketMessage('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit ticket');
    } finally {
      setSubmittingTicket(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading workspace...</div>;
  if (!project) return <div className="text-center py-12">Project not found</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 pt-12 pb-8 flex flex-col md:flex-row gap-8 min-h-[calc(100vh-8rem)] relative">
      {/* Top Navigation Links */}
      <div className="absolute top-2 left-4 flex gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm font-semibold text-gray-600 hover:text-amber-800 flex items-center gap-1"
        >
          &larr; Back to Dashboard
        </button>
        {project.contract && (
          <button
            onClick={() => navigate(`/contracts/${project.contract.id}`)}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            View Partnership Agreement &rarr;
          </button>
        )}
      </div>

      {/* Sidebar: Project Info */}
      <div className="md:w-1/3 flex flex-col gap-6">
        <div className="card p-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Project Workspace</h2>
          <h1 className="text-2xl font-extrabold text-text mb-4">{project.request.title}</h1>

          <div className="space-y-3 text-sm border-t pt-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-gray-500">Partnership Health</span>
              <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${
                project.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                contractDetails?.tasks?.some(t => !t.isCompleted && t.dueDate && new Date(t.dueDate) < new Date()) ? 'bg-red-100 text-red-700' :
                project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {project.status === 'COMPLETED' ? 'COMPLETED' :
                 contractDetails?.tasks?.some(t => !t.isCompleted && t.dueDate && new Date(t.dueDate) < new Date()) ? 'ATTENTION NEEDED' :
                 project.status === 'IN_PROGRESS' ? 'ON TRACK' : project.status.replace('_', ' ')}
              </span>
            </div>

            {user.role === 'ARTISAN' ? (
              <div className="flex justify-between">
                <span className="text-gray-500">Your Growth Manager</span>
                <span className="font-semibold">{project.intern.user.name}</span>
              </div>
            ) : (
              <div className="flex justify-between">
                <span className="text-gray-500">Client / Business Owner</span>
                <span className="font-semibold">{project.artisan.user.name}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-500">Category</span>
              <span className="font-semibold">{project.request.category}</span>
            </div>
          </div>
        </div>

        {/* Completion Action (Artisan Only) */}
        {user.role === 'ARTISAN' && project.status === 'IN_PROGRESS' && (
          <div className="card p-6 bg-blue-50/50 border-blue-100">
            <h3 className="font-bold text-blue-900 mb-2">Project Completion</h3>
            <p className="text-sm text-blue-700 mb-4">When the Growth Manager finishes their work, confirm completion here.</p>
            <button onClick={handleCompleteProject} className="btn-primary w-full py-2 bg-blue-600 hover:bg-blue-700 border-none">
              Confirm Project Completion
            </button>
          </div>
        )}

        {/* Rating System (Artisan Only after completion) */}
        {user.role === 'ARTISAN' && project.status === 'COMPLETED' && !project.rating && !ratingSubmitted && (
          <div className="card p-6 bg-green-50/50 border-green-100">
            <h3 className="font-bold text-green-900 mb-4">Rate Your Growth Manager</h3>
            <form onSubmit={handleRateIntern} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-800 mb-2">Score (1-5)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRatingScore(num)}
                      className={`w-10 h-10 rounded-full font-bold transition-colors ${
                        ratingScore >= num ? 'bg-green-500 text-white' : 'bg-green-200 text-green-700 hover:bg-green-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-green-800 mb-1">Review (Optional)</label>
                <textarea
                  value={ratingReview}
                  onChange={(e) => setRatingReview(e.target.value)}
                  className="w-full p-3 rounded-lg border border-green-200 focus:outline-none focus:border-green-500 text-sm h-24 resize-none"
                  placeholder="Tell us about your experience..."
                />
              </div>
              <button
                type="submit"
                disabled={isSubmittingRating}
                className="w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
              >
                Submit Rating
              </button>
            </form>
          </div>
        )}

        {(project.rating || ratingSubmitted) && user.role === 'ARTISAN' && (
          <div className="card p-6 text-center text-green-700 bg-green-50/50 border-green-100">
            <span className="text-2xl mb-2 block">⭐</span>
            <p className="font-medium">Thank you for your feedback.</p>
          </div>
        )}

      </div>

      {/* Main Area: Tabs */}
      <div className="md:w-2/3 flex flex-col card overflow-hidden">
        <div className="flex border-b bg-white overflow-x-auto scrollbar-none">
          <button onClick={() => setActiveTab('OVERVIEW')} className={`px-6 py-4 text-sm font-bold flex items-center gap-2 shrink-0 ${activeTab === 'OVERVIEW' ? 'border-b-2 border-amber-800 text-amber-900' : 'text-gray-500 hover:text-gray-700'}`}>
            <LayoutDashboard className="w-4 h-4" /> Overview
          </button>
          <button onClick={() => setActiveTab('ANALYTICS')} className={`px-6 py-4 text-sm font-bold flex items-center gap-2 shrink-0 ${activeTab === 'ANALYTICS' ? 'border-b-2 border-amber-800 text-amber-900' : 'text-gray-500 hover:text-gray-700'}`}>
            <BarChart2 className="w-4 h-4" /> {user.role === 'ARTISAN' ? 'Business Performance' : 'Client Performance'}
          </button>
          <button onClick={() => setActiveTab('PLAN')} className={`px-6 py-4 text-sm font-bold flex items-center gap-2 shrink-0 ${activeTab === 'PLAN' ? 'border-b-2 border-amber-800 text-amber-900' : 'text-gray-500 hover:text-gray-700'}`}>
            <ClipboardList className="w-4 h-4" /> Execution Plan
          </button>
          <button onClick={() => setActiveTab('CHAT')} className={`px-6 py-4 text-sm font-bold flex items-center gap-2 shrink-0 ${activeTab === 'CHAT' ? 'border-b-2 border-amber-800 text-amber-900' : 'text-gray-500 hover:text-gray-700'}`}>
            <MessageSquare className="w-4 h-4" /> Communication
          </button>
          <button onClick={() => setActiveTab('REPORTS')} className={`px-6 py-4 text-sm font-bold flex items-center gap-2 shrink-0 ${activeTab === 'REPORTS' ? 'border-b-2 border-amber-800 text-amber-900' : 'text-gray-500 hover:text-gray-700'}`}>
            <BarChart className="w-4 h-4" /> Partnership Reports
          </button>
          <button onClick={() => setActiveTab('SUPPORT')} className={`px-6 py-4 text-sm font-bold flex items-center gap-2 shrink-0 ${activeTab === 'SUPPORT' ? 'border-b-2 border-amber-800 text-amber-900' : 'text-gray-500 hover:text-gray-700'}`}>
            <LifeBuoy className="w-4 h-4" /> {user.role === 'ARTISAN' ? 'Partnership Support' : 'Client Support'}
          </button>
        </div>
      {activeTab === 'OVERVIEW' && (
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50 min-h-[400px] space-y-8">

          {/* 1. PARTNERSHIP HEADER */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 justify-between items-start">
            <div className="space-y-4">
              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold mb-3 ${
                  project?.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                  project?.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project?.status?.replace('_', ' ') || 'UNKNOWN'}
                </span>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  {project?.request?.title || 'Growth Partnership'}
                </h2>
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                  <span>{user.role === 'INTERN' ? 'Client' : 'Business'}: <strong>{project?.artisan?.user?.name || '—'}</strong></span>
                  <span className="text-gray-300">↔</span>
                  <span>{user.role === 'ARTISAN' ? 'Your Growth Manager' : 'Growth Manager'}: <strong>{project?.intern?.user?.name || '—'}</strong></span>
                </p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Started: <strong>{project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : '—'}</strong></span>
                </div>
                {contractDetails?.duration && (
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Duration: <strong>{contractDetails.duration}</strong></span>
                  </div>
                )}
                {contractDetails?.status && (
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span>Contract: <strong>{contractDetails.status}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions (Right aligned on desktop) */}
            <div className="flex flex-col gap-3 min-w-[200px] w-full md:w-auto">
              {project?.contract?.id && (
                <button onClick={() => navigate(`/contracts/${project.contract.id}`)} className="flex items-center justify-between px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors">
                  <span>View Contract</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => setActiveTab('REPORTS')} className="flex items-center justify-between px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors">
                <span>View Reports</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              {user.role === 'ARTISAN' && project?.status === 'IN_PROGRESS' && (
                <button onClick={handleCompleteProject} className="flex items-center justify-between px-4 py-2 bg-amber-800 text-white rounded-xl hover:bg-amber-900 font-semibold transition-colors">
                  <span>Complete Project</span>
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">

            {/* Main Content Column (Progress, Snapshot, Objectives) */}
            <div className="lg:col-span-2 space-y-6">

              {/* 2. PARTNERSHIP PROGRESS */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-gray-900 text-lg">{user.role === 'ARTISAN' ? 'Partnership Progress' : 'Execution Progress'}</h3>
                </div>

                {contractDetails?.tasks && contractDetails.tasks.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-end text-sm">
                      <span className="text-gray-600 font-medium">Tasks Completed</span>
                      <span className="text-gray-900 font-bold text-lg">
                        {contractDetails.tasks.filter(t => t.isCompleted).length} / {contractDetails.tasks.length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${(contractDetails.tasks.filter(t => t.isCompleted).length / contractDetails.tasks.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl">
                    No task data available yet. {user.role === 'ARTISAN' ? 'Wait for your manager to add tasks.' : 'Add tasks to the contract to track progress.'}
                  </div>
                )}
              </div>

              {/* 4. BUSINESS / GROWTH SNAPSHOT */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-gray-900 text-lg">Growth Snapshot</h3>
                </div>

                {!analytics ? (
                  <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl">
                    Analytics will appear as data is collected.
                  </div>
                ) : user.role === 'ARTISAN' ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-1">Products</span>
                      <span className="text-2xl font-extrabold text-gray-900">{analytics.totalProducts ?? 0}</span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-1">Views</span>
                      <span className="text-2xl font-extrabold text-gray-900">{analytics.totalViews ?? 0}</span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-1">Orders</span>
                      <span className="text-2xl font-extrabold text-gray-900">{analytics.totalOrders ?? 0}</span>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl">
                      <span className="text-green-700 text-xs font-bold uppercase tracking-wider block mb-1">Revenue</span>
                      <span className="text-2xl font-extrabold text-green-900">₹{analytics.totalRevenue ?? 0}</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-1">Client Products</span>
                      <span className="text-2xl font-extrabold text-gray-900">{analytics.totalProducts ?? 0}</span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-1">Client Views</span>
                      <span className="text-2xl font-extrabold text-gray-900">{analytics.totalViews ?? 0}</span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-1">Client Orders</span>
                      <span className="text-2xl font-extrabold text-gray-900">{analytics.totalOrders ?? 0}</span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-1">Tasks Completed</span>
                      <span className="text-2xl font-extrabold text-gray-900">{analytics.tasksCompleted ?? 0} / {analytics.tasksTotal ?? 0}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. DELIVERABLES & UPCOMING WORK */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-gray-900 text-lg">{user.role === 'ARTISAN' ? 'Partnership Deliverables & Upcoming Work' : 'Client Deliverables & Upcoming Work'}</h3>
                </div>

                <div className="space-y-6">
                  {contractDetails?.responsibilities?.length > 0 ? (
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Core Deliverables</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                        {contractDetails.responsibilities.map((resp, i) => (
                          <li key={i}>{resp}</li>
                        ))}
                      </ul>
                    </div>
                  ) : contractDetails?.description ? (
                    <p className="text-sm text-gray-700">{contractDetails.description}</p>
                  ) : null}

                  {contractDetails?.tasks && contractDetails.tasks.some(t => !t.isCompleted) ? (
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Upcoming Tasks</h4>
                      <div className="space-y-3">
                        {contractDetails.tasks
                          .filter(t => !t.isCompleted)
                          .sort((a, b) => {
                            if (!a.dueDate) return 1;
                            if (!b.dueDate) return -1;
                            return new Date(a.dueDate) - new Date(b.dueDate);
                          })
                          .slice(0, 3)
                          .map(task => {
                            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                            return (
                              <div key={task.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div>
                                  <p className="text-sm font-bold text-gray-800">{task.title}</p>
                                  {task.dueDate && (
                                    <p className={`text-xs mt-0.5 font-medium ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                                      {isOverdue ? 'Overdue: ' : 'Due: '} {new Date(task.dueDate).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                                <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {isOverdue ? 'Attention Needed' : 'In Progress'}
                                </span>
                              </div>
                            );
                        })}
                      </div>
                      <button onClick={() => setActiveTab('PLAN')} className="mt-4 text-sm font-bold text-indigo-600 hover:text-indigo-800">
                        View Full Execution Plan &rarr;
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl">
                      No upcoming work scheduled. {user.role === 'ARTISAN' ? 'Your Growth Manager will update the execution plan.' : 'Add tasks to the Execution Plan to keep your client informed.'}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column (Activity) */}
            <div className="space-y-6">

              {/* 5. RECENT ACTIVITY */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900 text-lg">Recent Activity</h3>
                </div>

                <div className="space-y-5">
                  {reports && reports.length > 0 && (
                    <div className="relative pl-4 border-l-2 border-indigo-100">
                      <div className="absolute w-2.5 h-2.5 bg-indigo-500 rounded-full -left-[6px] top-1.5"></div>
                      <p className="text-sm font-semibold text-gray-900">Report Submitted</p>
                      <p className="text-xs text-gray-500">{reports[0].period} - {reports[0].metric}</p>
                      <span className="text-xs text-gray-400 mt-1 block">{new Date(reports[0].createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  {contractDetails?.tasks?.filter(t => t.isCompleted)?.slice(0, 2).map((task, idx) => (
                    <div key={idx} className="relative pl-4 border-l-2 border-green-100">
                      <div className="absolute w-2.5 h-2.5 bg-green-500 rounded-full -left-[6px] top-1.5"></div>
                      <p className="text-sm font-semibold text-gray-900">Task Completed</p>
                      <p className="text-xs text-gray-500">{task.title}</p>
                      <span className="text-xs text-gray-400 mt-1 block">{task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'Recently'}</span>
                    </div>
                  ))}
                  {messages && messages.length > 0 && (
                    <div className="relative pl-4 border-l-2 border-gray-100">
                      <div className="absolute w-2.5 h-2.5 bg-gray-300 rounded-full -left-[6px] top-1.5"></div>
                      <p className="text-sm font-semibold text-gray-900">New Message</p>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">{messages[messages.length - 1].content}</p>
                    </div>
                  )}
                  <div className="relative pl-4 border-l-2 border-amber-100">
                    <div className="absolute w-2.5 h-2.5 bg-amber-500 rounded-full -left-[6px] top-1.5"></div>
                    <p className="text-sm font-semibold text-gray-900">Project Started</p>
                    <p className="text-xs text-gray-500">Partnership initiated</p>
                    <span className="text-xs text-gray-400 mt-1 block">{project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : '—'}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {activeTab === 'ANALYTICS' && (
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50 min-h-[400px] space-y-8">

          <div className="flex items-center gap-2 mb-2">
            <BarChart2 className="w-6 h-6 text-amber-600" />
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Business Analytics</h2>
          </div>

          {!analytics ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">
              Loading analytics data...
            </div>
          ) : (
            <div className="space-y-6">

              {/* KEY METRICS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {user.role === 'ARTISAN' ? (
                  <>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                      <span className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Total Products</span>
                      <span className="text-3xl font-extrabold text-gray-900 mt-auto">{analytics.totalProducts ?? 0}</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                      <span className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Store Views</span>
                      <span className="text-3xl font-extrabold text-gray-900 mt-auto">{analytics.totalViews ?? 0}</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                      <span className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Orders</span>
                      <span className="text-3xl font-extrabold text-gray-900 mt-auto">{analytics.totalOrders ?? 0}</span>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-2xl shadow-sm border border-green-200 flex flex-col">
                      <span className="text-green-800 text-xs font-bold uppercase tracking-wider mb-2">Revenue</span>
                      <span className="text-3xl font-extrabold text-green-900 mt-auto">₹{analytics.totalRevenue ?? 0}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                      <span className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Client Products</span>
                      <span className="text-3xl font-extrabold text-gray-900 mt-auto">{analytics.totalProducts ?? 0}</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                      <span className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Client Views</span>
                      <span className="text-3xl font-extrabold text-gray-900 mt-auto">{analytics.totalViews ?? 0}</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                      <span className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Client Orders</span>
                      <span className="text-3xl font-extrabold text-gray-900 mt-auto">{analytics.totalOrders ?? 0}</span>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-2xl shadow-sm border border-indigo-200 flex flex-col">
                      <span className="text-indigo-800 text-xs font-bold uppercase tracking-wider mb-2">Tasks Completed</span>
                      <span className="text-3xl font-extrabold text-indigo-900 mt-auto">{analytics.tasksCompleted ?? 0} <span className="text-lg text-indigo-700">/ {analytics.tasksTotal ?? 0}</span></span>
                    </div>
                  </>
                )}
              </div>

              {/* GRID for Trend & Performance */}
              <div className="grid lg:grid-cols-2 gap-6">

                {/* PERFORMANCE TREND EMPTY STATE */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      Performance Trend
                    </h3>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    <BarChart2 className="w-12 h-12 text-gray-300 mb-3" />
                    <h4 className="text-sm font-bold text-gray-700 mb-1">Historical data required</h4>
                    <p className="text-xs text-gray-500 max-w-[250px] mx-auto">Historical trend data will appear as more customer activity is collected.</p>
                  </div>
                </div>

                {/* PRODUCT PERFORMANCE EMPTY STATE */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                      <Package className="w-5 h-5 text-amber-600" />
                      Product Performance
                    </h3>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    <Target className="w-12 h-12 text-gray-300 mb-3" />
                    <h4 className="text-sm font-bold text-gray-700 mb-1">No product-level analytics</h4>
                    <p className="text-xs text-gray-500 max-w-[250px] mx-auto">Product ranking and item-specific analytics are not available yet.</p>
                  </div>
                </div>

              </div>

              {/* GROWTH / ACTIVITY (Reports) */}
              {reports && reports.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-gray-900 text-lg">Growth Reports & Activity</h3>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reports.slice(0, 3).map((report, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                        <span className="text-xs font-bold text-gray-500 block mb-1">{report.period}</span>
                        <div className="font-bold text-indigo-900">{report.metric}: <span className="text-indigo-700">{report.value}</span></div>
                        {report.notes && <p className="text-xs text-gray-600 mt-2 line-clamp-2">{report.notes}</p>}
                        <span className="text-[10px] text-gray-400 mt-3 block">{new Date(report.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {activeTab === 'PLAN' && (
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50 min-h-[400px] space-y-8">
          {/* PLAN HEADER */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 justify-between items-start">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Execution Plan</h2>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                <span>{project?.contract?.title || project?.request?.title || 'Partnership'}</span>
                {contractDetails?.duration && (
                  <>
                    <span>•</span>
                    <span>{contractDetails.duration}</span>
                  </>
                )}
              </p>
              <div className="flex items-center gap-2 text-sm mt-3 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{contractDetails?.startDate ? new Date(contractDetails.startDate).toLocaleDateString() : '—'}</span>
                <span>—</span>
                <span>{contractDetails?.endDate ? new Date(contractDetails.endDate).toLocaleDateString() : '—'}</span>
              </div>
            </div>

            <div className="md:w-64 w-full">
              <div className="flex justify-between items-end text-sm mb-2">
                <span className="text-gray-600 font-medium">Progress</span>
                <span className="text-gray-900 font-bold">
                  {contractDetails?.tasks?.filter(t => t.isCompleted).length || 0} / {contractDetails?.tasks?.length || 0} tasks
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${contractDetails?.tasks?.length ? ((contractDetails.tasks.filter(t => t.isCompleted).length) / contractDetails.tasks.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* TASKS */}
          {!contractDetails?.tasks || contractDetails.tasks.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No tasks have been added yet</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">Your partnership plan will appear here once deliverables and tasks are defined.</p>
              {user.role === 'INTERN' && contractDetails?.id && (
                <button onClick={() => navigate(`/contracts/${contractDetails.id}`)} className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-xl font-bold">
                  Manage Tasks
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                      <Package className="w-5 h-5 text-indigo-600" />
                      Execution Tasks
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {contractDetails.tasks.map(task => {
                      const isOverdue = !task.isCompleted && task.dueDate && new Date(task.dueDate) < new Date();
                      return (
                        <div key={task.id} className="p-6 flex flex-col md:flex-row gap-4 items-start md:items-center hover:bg-gray-50/50 transition-colors">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                              <h4 className={`font-bold text-base ${task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{task.title}</h4>
                              {isOverdue && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wider">Overdue</span>}
                              {task.isCompleted && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wider">Completed</span>}
                              {!task.isCompleted && !isOverdue && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">In Progress</span>}
                            </div>
                            {task.description && <p className="text-sm text-gray-600 mb-3">{task.description}</p>}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-medium">
                              <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Role: {task.assignedRole.replace('_', ' ')}</span>
                              {task.dueDate && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                              {task.completedAt && <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Done: {new Date(task.completedAt).toLocaleDateString()}</span>}
                            </div>
                          </div>
                          <div className="md:text-right w-full md:w-auto mt-4 md:mt-0">
                            <button
                              onClick={() => handleToggleTask(task.id)}
                              disabled={togglingTask === task.id}
                              className={`px-4 py-2 text-sm font-bold rounded-xl flex items-center justify-center gap-2 w-full md:w-auto transition-colors ${
                                task.isCompleted
                                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                              }`}
                            >
                              {togglingTask === task.id ? 'Updating...' : task.isCompleted ? 'Reopen Task' : 'Mark Complete'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
              </div>

              {/* PROFESSIONAL DELIVERABLES VIEW */}
              {contractDetails?.responsibilities?.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-amber-600" />
                    <h3 className="font-bold text-gray-900 text-lg">Partnership Deliverables</h3>
                  </div>
                  <ul className="grid md:grid-cols-2 gap-4">
                    {contractDetails.responsibilities.map((resp, i) => (
                      <li key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 font-medium">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

        {activeTab === 'CHAT' && (
          <div className="flex-1 flex flex-col min-h-[400px]">
            <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm z-10">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-600" />
                Communication
              </h3>
              <span className="text-sm text-gray-500">
                Direct communication with {user.role === 'ARTISAN' ? 'your Growth Manager' : 'your client'}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 mt-10">No messages yet. Say hi!</div>
              ) : (
                messages.map((msg, idx) => {
                  const isMine = msg.senderId === user.id;
                  return (
                    <div key={msg.id || idx} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        isMine ? 'bg-amber-800 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t bg-white mt-auto">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-700"
                  disabled={project.status === 'CANCELLED'}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || project.status === 'CANCELLED'}
                  className="px-6 py-2 bg-amber-800 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'REPORTS' && (
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50 min-h-[400px] space-y-8">

            {/* REPORTS HEADER & SUMMARY */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BarChart className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Partnership Reports</h2>
                </div>
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                  <span>{project?.contract?.title || project?.request?.title || 'Partnership'}</span>
                </p>
                <div className="flex items-center gap-2 text-sm mt-3 text-gray-600">
                  <span><strong>{project?.artisan?.user?.name || 'Artisan'}</strong></span>
                  <span className="text-gray-300">↔</span>
                  <span><strong>{project?.intern?.user?.name || 'Growth Manager'}</strong></span>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl min-w-[200px]">
                <span className="block text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Report Summary</span>
                <div className="space-y-1">
                  <p className="text-sm text-indigo-900">Total Submitted: <strong className="text-indigo-700">{reports?.length || 0}</strong></p>
                  {reports && reports.length > 0 && (
                    <>
                      <p className="text-sm text-indigo-900">Latest Period: <strong className="text-indigo-700">{reports[0].period}</strong></p>
                      <p className="text-sm text-indigo-900">Latest Metric: <strong className="text-indigo-700">{reports[0].metric}</strong></p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* GROWTH MANAGER ACTION (CREATE REPORT) */}
            {user.role === 'INTERN' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Submit New Report
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Provide a structured update to your client regarding the partnership progress.</p>
                </div>
                <form onSubmit={handleCreateReport} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Reporting Period</label>
                      <input type="text" placeholder="e.g. Month 1, Week 2" value={newReportPeriod} onChange={e => setNewReportPeriod(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-gray-50" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Primary Metric</label>
                      <select value={newReportMetric} onChange={e => setNewReportMetric(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-gray-50">
                        <option>Views</option><option>Sales</option><option>Revenue</option><option>Social Reach</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Measured Value</label>
                      <input type="text" placeholder="e.g. 500 views, ₹2500" value={newReportValue} onChange={e => setNewReportValue(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-gray-50" required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Context / Notes (Optional)</label>
                      <textarea placeholder="Provide professional context for this metric..." value={newReportNotes} onChange={e => setNewReportNotes(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm h-20 resize-none focus:outline-none focus:border-indigo-500 bg-gray-50" />
                    </div>
                  </div>
                  <button type="submit" disabled={submittingReport} className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-bold rounded-xl text-sm">
                    {submittingReport ? 'Submitting...' : 'Submit Report to Client'}
                  </button>
                </form>
              </div>
            )}

            {/* REPORTS LIST */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                Report History
              </h3>

              {!reports || reports.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-bold text-gray-900 mb-2">No partnership reports yet</h4>
                  <p className="text-gray-500 text-sm max-w-sm mx-auto">Reports submitted by the Growth Manager will appear here chronologically.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report, idx) => (
                    <div key={report.id || idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden flex flex-col md:flex-row gap-6 items-start md:items-center hover:shadow-md transition-shadow">
                      {idx === 0 && (
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                      )}

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 uppercase tracking-wider">{report.period}</span>
                          {idx === 0 && <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wider">Latest Report</span>}
                        </div>
                        <h4 className="text-xl font-extrabold text-gray-900 mb-1">{report.metric}: <span className="text-indigo-600">{report.value}</span></h4>
                        {report.notes && <p className="text-sm text-gray-600 mt-2">{report.notes}</p>}
                      </div>

                      <div className="text-left md:text-right w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                        <span className="block text-xs text-gray-400 font-medium">Submitted by</span>
                        <span className="block text-sm font-bold text-gray-700 mb-1">{project?.intern?.user?.name || 'Growth Manager'}</span>
                        <span className="block text-xs text-gray-500 flex items-center md:justify-end gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'SUPPORT' && (
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50/30 min-h-[400px]">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{user.role === 'ARTISAN' ? 'Partnership Support' : 'Client Support'}</h2>
              <p className="text-sm text-gray-500 mt-1">Submit tickets for issues requiring platform or administration assistance.</p>
            </div>

            <form onSubmit={handleCreateTicket} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 space-y-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-red-600" />
                Submit Support Ticket
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select value={newTicketCategory} onChange={e => setNewTicketCategory(e.target.value)} className="p-2 border rounded text-sm">
                  <option>Technical Problem</option><option>Product Problem</option><option>Contract Problem</option><option>Other</option>
                </select>
                <select value={newTicketPriority} onChange={e => setNewTicketPriority(e.target.value)} className="p-2 border rounded text-sm">
                  <option value="NORMAL">Normal</option><option value="HIGH">High</option><option value="URGENT">Urgent</option>
                </select>
                <textarea placeholder="Describe your issue..." value={newTicketMessage} onChange={e => setNewTicketMessage(e.target.value)} className="p-2 border rounded text-sm col-span-1 sm:col-span-2 h-20" required />
              </div>
              <button type="submit" disabled={submittingTicket} className="px-4 py-2 bg-red-600 text-white font-bold rounded text-sm w-full">Submit Ticket</button>
            </form>

            <div className="space-y-4">
              {tickets.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No support tickets.</div>
              ) : (
                tickets.map(ticket => (
                  <div key={ticket.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase">{ticket.category}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${ticket.status === 'OPEN' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>{ticket.status}</span>
                    </div>
                    <p className="text-sm text-gray-800">{ticket.message}</p>
                    <span className="text-xs text-gray-400 mt-2 block">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
