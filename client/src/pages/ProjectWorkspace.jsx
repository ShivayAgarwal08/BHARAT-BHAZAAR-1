import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, BarChart, LifeBuoy, FileText } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('CHAT');

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

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProjectData = async () => {
      try {
        const [projRes, msgRes, repRes, tickRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/projects/${id}`),
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/projects/${id}/messages`),
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/projects/${id}/reports`),
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/projects/${id}/support`),
        ]);
        setProject(projRes.data);
        setMessages(msgRes.data);
        setReports(repRes.data);
        setTickets(tickRes.data);
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
            View Contract Tasks &rarr;
          </button>
        )}
      </div>

      {/* Sidebar: Project Info */}
      <div className="md:w-1/3 flex flex-col gap-6">
        <div className="card p-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Project Workspace</h2>
          <h1 className="text-2xl font-extrabold text-text mb-4">{project.request.title}</h1>
          
          <div className="space-y-3 text-sm border-t pt-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Category</span>
              <span className="font-semibold">{project.request.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Business</span>
              <span className="font-semibold">{project.artisan.user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Growth Manager</span>
              <span className="font-semibold">{project.intern.user.name}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-gray-500">Status</span>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                project.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {project.status.replace('_', ' ')}
              </span>
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
          <button onClick={() => setActiveTab('CHAT')} className={`px-6 py-4 text-sm font-bold flex items-center gap-2 ${activeTab === 'CHAT' ? 'border-b-2 border-amber-800 text-amber-900' : 'text-gray-500 hover:text-gray-700'}`}>
            <MessageSquare className="w-4 h-4" /> Chat
          </button>
          <button onClick={() => setActiveTab('REPORTS')} className={`px-6 py-4 text-sm font-bold flex items-center gap-2 ${activeTab === 'REPORTS' ? 'border-b-2 border-amber-800 text-amber-900' : 'text-gray-500 hover:text-gray-700'}`}>
            <BarChart className="w-4 h-4" /> Reports
          </button>
          <button onClick={() => setActiveTab('SUPPORT')} className={`px-6 py-4 text-sm font-bold flex items-center gap-2 ${activeTab === 'SUPPORT' ? 'border-b-2 border-amber-800 text-amber-900' : 'text-gray-500 hover:text-gray-700'}`}>
            <LifeBuoy className="w-4 h-4" /> Support
          </button>
        </div>

        {activeTab === 'CHAT' && (
          <div className="flex-1 flex flex-col min-h-[400px]">
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
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50/30 min-h-[400px]">
            {user.role === 'INTERN' && (
              <form onSubmit={handleCreateReport} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 space-y-4">
                <h3 className="font-bold text-gray-800">Add Growth Report</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Period (e.g. Week 1)" value={newReportPeriod} onChange={e => setNewReportPeriod(e.target.value)} className="p-2 border rounded text-sm" required />
                  <select value={newReportMetric} onChange={e => setNewReportMetric(e.target.value)} className="p-2 border rounded text-sm">
                    <option>Views</option><option>Sales</option><option>Revenue</option><option>Social Reach</option>
                  </select>
                  <input type="text" placeholder="Value (e.g. 500, Rs. 1000)" value={newReportValue} onChange={e => setNewReportValue(e.target.value)} className="p-2 border rounded text-sm col-span-2" required />
                  <textarea placeholder="Notes (Optional)" value={newReportNotes} onChange={e => setNewReportNotes(e.target.value)} className="p-2 border rounded text-sm col-span-2 h-16" />
                </div>
                <button type="submit" disabled={submittingReport} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded text-sm w-full">Submit Report</button>
              </form>
            )}
            
            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No reports submitted yet.</div>
              ) : (
                reports.map(report => (
                  <div key={report.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <span className="text-xs font-bold text-gray-400">{report.period}</span>
                      <h4 className="text-lg font-extrabold text-indigo-900">{report.metric}: {report.value}</h4>
                      {report.notes && <p className="text-sm text-gray-600 mt-1">{report.notes}</p>}
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'SUPPORT' && (
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50/30 min-h-[400px]">
            <form onSubmit={handleCreateTicket} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 space-y-4">
              <h3 className="font-bold text-gray-800">Submit Support Ticket</h3>
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
