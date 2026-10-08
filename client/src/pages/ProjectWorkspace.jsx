import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare, BarChart, LifeBuoy, FileText, BarChart2, TrendingUp, Calendar,
  Clock, Target, CheckCircle, Package, LayoutDashboard, ClipboardList,
  Plus, AlertCircle, Shield, User, ArrowLeft, X
} from 'lucide-react';

const parseReportNotes = (notes) => {
  if (!notes) return { description: '', source: '', category: 'Marketplace', unit: '' };
  try {
    if (typeof notes === 'string' && notes.startsWith('{') && notes.endsWith('}')) {
      const parsed = JSON.parse(notes);
      return {
        description: parsed.description || '',
        source: parsed.source || '',
        category: parsed.category || 'Marketplace',
        unit: parsed.unit || '',
        date: parsed.date || '',
      };
    }
  } catch (e) {}
  const parts = typeof notes === 'string' ? notes.split('|SOURCE:') : [];
  return {
    description: parts[0]?.trim() || (typeof notes === 'string' ? notes : ''),
    source: parts[1]?.trim() || '',
    category: 'Marketplace',
    unit: '',
    date: '',
  };
};

function PerformanceCharts({ reports }) {
  const numericReports = (reports || []).filter(r => {
    const rawNum = String(r.value || '').replace(/[^0-9.-]+/g, '');
    const num = parseFloat(rawNum);
    return !isNaN(num);
  });

  const metrics = Array.from(new Set(numericReports.map(r => r.metric)));
  const [selectedMetric, setSelectedMetric] = useState(metrics[0] || '');

  useEffect(() => {
    if (metrics.length > 0 && (!selectedMetric || !metrics.includes(selectedMetric))) {
      setSelectedMetric(metrics[0]);
    }
  }, [reports]);

  if (numericReports.length === 0) return null;

  const currentMetric = metrics.includes(selectedMetric) ? selectedMetric : metrics[0];
  const metricData = numericReports
    .filter(r => r.metric === currentMetric)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  if (metricData.length === 0) return null;

  const values = metricData.map(r => parseFloat(String(r.value).replace(/[^0-9.-]+/g, '')));
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);
  const range = maxVal - minVal || 1;

  const sourceBreakdown = {};
  metricData.forEach(r => {
    const parsed = parseReportNotes(r.notes);
    const src = parsed.source || 'Direct / Store';
    const val = parseFloat(String(r.value).replace(/[^0-9.-]+/g, '')) || 0;
    sourceBreakdown[src] = (sourceBreakdown[src] || 0) + val;
  });

  const width = 500;
  const height = 180;
  const paddingX = 45;
  const paddingY = 30;

  const points = metricData.map((d, i) => {
    const x = metricData.length === 1
      ? width / 2
      : paddingX + (i / (metricData.length - 1)) * (width - 2 * paddingX);
    const val = parseFloat(String(d.value).replace(/[^0-9.-]+/g, ''));
    const y = height - paddingY - ((val - minVal) / range) * (height - 2 * paddingY);
    return { x, y, val, period: d.period };
  });

  const pathD = points.length > 1
    ? points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')
    : '';

  const areaD = points.length > 1
    ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : '';

  const totalSourceVal = Object.values(sourceBreakdown).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            Performance Trends & Distribution
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Real historical progress and channel breakdown.
          </p>
        </div>
        {metrics.length > 1 && (
          <div className="flex flex-wrap gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
            {metrics.map(m => (
              <button
                key={m}
                onClick={() => setSelectedMetric(m)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                  currentMetric === m ? 'bg-amber-800 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-stone-50/60 rounded-2xl p-5 border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">{currentMetric} Progression</span>
            <span className="text-xs text-gray-500 font-medium">{metricData.length} recorded {metricData.length === 1 ? 'period' : 'periods'}</span>
          </div>

          <div className="w-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#b45309" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#b45309" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#e5e7eb" strokeDasharray="3 3" />
              <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#e5e7eb" strokeDasharray="3 3" />
              <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#e5e7eb" />

              {areaD && <path d={areaD} fill="url(#chartGradient)" />}
              {pathD && <path d={pathD} fill="none" stroke="#b45309" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

              {points.map((p, idx) => (
                <g key={idx}>
                  <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#b45309" strokeWidth="2.5" />
                  <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1f2937">
                    {p.val.toLocaleString('en-IN')}
                  </text>
                  <text x={p.x} y={height - 10} textAnchor="middle" fontSize="10" fontWeight="600" fill="#6b7280">
                    {p.period}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        <div className="bg-stone-50/60 rounded-2xl p-5 border border-gray-100 flex flex-col justify-between">
          <div className="mb-3">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Channel Distribution</span>
            <span className="text-xs text-gray-400">Total: {totalSourceVal.toLocaleString('en-IN')}</span>
          </div>

          <div className="space-y-3.5 my-auto">
            {Object.entries(sourceBreakdown).map(([src, val], i) => {
              const pct = Math.round((val / totalSourceVal) * 100);
              return (
                <div key={src} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-700">{src}</span>
                    <span className="font-bold text-gray-900">{val.toLocaleString('en-IN')} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${i % 3 === 0 ? 'bg-amber-600' : i % 3 === 1 ? 'bg-indigo-600' : 'bg-emerald-600'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectWorkspace() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(null); // 'ERROR' | 'UNAUTHORIZED' | 'NOT_FOUND' | null

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

  // New task creation states for Execution Plan
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskRole, setNewTaskRole] = useState('GROWTH_MANAGER');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [savingTask, setSavingTask] = useState(false);

  // Report states
  const [newReportPeriod, setNewReportPeriod] = useState('Week 1');
  const [newReportMetric, setNewReportMetric] = useState('Sales');
  const [newReportValue, setNewReportValue] = useState('');
  const [newReportUnit, setNewReportUnit] = useState('Units');
  const [newReportCategory, setNewReportCategory] = useState('Marketplace');
  const [newReportSource, setNewReportSource] = useState('Amazon');
  const [newReportDesc, setNewReportDesc] = useState('');
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

  const handleCreateWorkspaceTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !contractDetails?.id) return;
    try {
      setSavingTask(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/contracts/${contractDetails.id}/tasks`, {
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim(),
        assignedRole: newTaskRole,
        dueDate: newTaskDueDate || null,
      });

      setContractDetails(prev => ({
        ...prev,
        tasks: [...(prev.tasks || []), res.data]
      }));
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskDueDate('');
      setIsAddingTask(false);
    } catch (err) {
      console.error('Failed to create task', err);
      alert(err.response?.data?.error || 'Failed to add task to execution plan');
    } finally {
      setSavingTask(false);
    }
  };

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      setErrorState(null);
      const [projRes, msgRes, repRes, tickRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/projects/${id}`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/projects/${id}/messages`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/projects/${id}/reports`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/projects/${id}/support`),
      ]);

      const projectData = projRes.data;
      setProject(projectData);
      setMessages(msgRes.data || []);
      setReports(repRes.data || []);
      setTickets(tickRes.data || []);

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
        if (user?.role === 'ARTISAN') {
          const analyticsRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/analytics/artisan`);
          setAnalytics(analyticsRes.data);
        } else if (user?.role === 'INTERN' && projectData.artisan?.id) {
          const analyticsRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/analytics/intern/client/${projectData.artisan.id}`);
          setAnalytics(analyticsRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      }

    } catch (err) {
      console.error('Failed to load project', err);
      if (err.response?.status === 403) {
        setErrorState('UNAUTHORIZED');
      } else if (err.response?.status === 404) {
        setErrorState('NOT_FOUND');
      } else {
        setErrorState('ERROR');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

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
      const notesPayload = JSON.stringify({
        description: (newReportDesc || '').trim(),
        source: (newReportSource || 'Bharat Bazaar').trim(),
        category: newReportCategory || 'Marketplace',
        unit: newReportUnit || '',
        date: new Date().toISOString(),
      });
      const formattedValue = newReportUnit && !newReportValue.includes(newReportUnit)
        ? `${newReportValue.trim()} ${newReportUnit}`.trim()
        : newReportValue.trim();

      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/projects/${id}/reports`, {
        period: newReportPeriod,
        metric: newReportMetric,
        value: formattedValue,
        notes: notesPayload,
      });
      setReports([res.data, ...reports]);
      setNewReportValue('');
      setNewReportDesc('');
      setNewReportSource('');
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-600 font-bold text-sm">Loading digital growth partnership...</p>
      </div>
    );
  }

  if (errorState === 'UNAUTHORIZED') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center font-bold text-xl mx-auto">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900">Access Restricted</h2>
        <p className="text-sm text-gray-500">You do not have authorization to view this partnership.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2.5 bg-amber-800 text-white font-bold rounded-xl text-sm hover:bg-amber-900 transition-colors shadow-sm inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Partnerships
        </button>
      </div>
    );
  }

  if (errorState === 'NOT_FOUND' || !project) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center font-bold text-xl mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900">Partnership Not Found</h2>
        <p className="text-sm text-gray-500">This partnership no longer exists or the link is invalid.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2.5 bg-amber-800 text-white font-bold rounded-xl text-sm hover:bg-amber-900 transition-colors shadow-sm inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Partnerships
        </button>
      </div>
    );
  }

  if (errorState === 'ERROR') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 bg-red-100 text-red-700 rounded-2xl flex items-center justify-center font-bold text-xl mx-auto">
          !
        </div>
        <h2 className="text-xl font-extrabold text-gray-900">Unable to load this partnership</h2>
        <p className="text-sm text-gray-500">There was a server issue retrieving the partnership records. Your data is safe.</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={fetchProjectData}
            className="px-6 py-2.5 bg-amber-800 text-white font-bold rounded-xl text-sm hover:bg-amber-900 transition-colors shadow-sm"
          >
            Retry
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Partnerships
          </button>
        </div>
      </div>
    );
  }

  // Meaningful health system derived from REAL data
  const getPartnershipHealth = () => {
    if (project.status === 'COMPLETED') {
      return {
        badge: 'COMPLETED',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-500',
        summary: 'All partnership milestones finalized successfully.',
      };
    }
    const tasks = contractDetails?.tasks || [];
    const overdue = tasks.filter(t => !t.isCompleted && t.dueDate && new Date(t.dueDate) < new Date());
    const completed = tasks.filter(t => t.isCompleted).length;
    const total = tasks.length;

    if (overdue.length >= 2) {
      return {
        badge: 'AT RISK',
        color: 'bg-red-100 text-red-800 border-red-200',
        dot: 'bg-red-500',
        summary: `${overdue.length} milestones past deadline. Immediate review advised.`,
      };
    }
    if (overdue.length === 1) {
      return {
        badge: 'NEEDS ATTENTION',
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
        summary: `1 milestone past deadline: "${overdue[0].title}".`,
      };
    }
    if (total > 0 && completed === total) {
      return {
        badge: 'ON TRACK',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-500',
        summary: `All ${total} planned execution tasks completed.`,
      };
    }
    if (total > 0) {
      return {
        badge: 'ON TRACK',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        dot: 'bg-blue-500',
        summary: `${completed} of ${total} planned tasks completed on schedule.`,
      };
    }
    return {
      badge: 'ON TRACK',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      dot: 'bg-gray-400',
      summary: 'Partnership active and ready for milestone execution.',
    };
  };

  const nowTimestamp = Date.now();

  const health = getPartnershipHealth();

  const allTasks = contractDetails?.tasks || [];
  const overdueTasks = allTasks.filter(t => !t.isCompleted && t.dueDate && new Date(t.dueDate).getTime() < nowTimestamp);
  const inProgressTasks = allTasks.filter(t => !t.isCompleted && (!t.dueDate || new Date(t.dueDate).getTime() >= nowTimestamp));
  const completedTasks = allTasks.filter(t => t.isCompleted);

  const getDaysRemaining = () => {
    const end = contractDetails?.endDate ? new Date(contractDetails.endDate) : null;
    if (!end || isNaN(end.getTime())) return null;
    const diffTime = end.getTime() - nowTimestamp;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  const daysRemaining = getDaysRemaining();

  const healthDimensions = {
    executionPct: allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0,
    hasExecution: allTasks.length > 0,
    reportsCount: reports?.length || 0,
    deliverablesCount: contractDetails?.responsibilities?.length || 0,
    messagesCount: messages?.length || 0,
  };

  const currentFocusTasks = allTasks
    .filter(t => !t.isCompleted)
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    })
    .slice(0, 5);

  const nextActionTask = currentFocusTasks[0] || null;
  const artisanPendingTasks = allTasks.filter(t => !t.isCompleted && (t.assignedRole === 'ARTISAN' || t.assignedRole === 'SHARED'));

  const getNextBestAction = () => {
    if (overdueTasks.length > 0) {
      return {
        title: `${overdueTasks.length} milestone deliverable${overdueTasks.length > 1 ? 's are' : ' is'} past target deadline`,
        description: `Deliverable "${overdueTasks[0].title}" requires immediate review to stay on schedule.`,
        actionLabel: 'Review Execution Plan',
        tab: 'PLAN',
        isUrgent: true,
      };
    }
    if (user.role === 'ARTISAN' && artisanPendingTasks.length > 0) {
      return {
        title: `Your action required on: "${artisanPendingTasks[0].title}"`,
        description: 'Assigned to you. Please review requirements and complete when ready.',
        actionLabel: 'Review Deliverable',
        tab: 'PLAN',
        isUrgent: false,
      };
    }
    if (user.role === 'INTERN' && (!reports || reports.length === 0)) {
      return {
        title: 'Submit your first periodic growth update',
        description: 'Provide operational transparency to your client by logging initial store reach, product views, or sales.',
        actionLabel: 'Add Performance Data',
        tab: 'ANALYTICS',
        isUrgent: false,
      };
    }
    if (nextActionTask) {
      return {
        title: `Next priority: "${nextActionTask.title}"`,
        description: nextActionTask.dueDate ? `Target completion date: ${new Date(nextActionTask.dueDate).toLocaleDateString('en-IN')}.` : 'Ready to begin execution.',
        actionLabel: 'Open in Execution Plan',
        tab: 'PLAN',
        isUrgent: false,
      };
    }
    return {
      title: 'All planned milestones are currently completed',
      description: 'Review overall performance metrics or formulate next growth cycle objectives with your partner.',
      actionLabel: 'View Performance',
      tab: 'ANALYTICS',
      isUrgent: false,
    };
  };

  const nextBestAction = getNextBestAction();

  // Compiled real event timeline
  const activityEvents = [];
  if (reports && reports.length > 0) {
    reports.forEach(r => {
      const parsed = parseReportNotes(r.notes);
      activityEvents.push({
        id: `rep-${r.id}`,
        type: 'report',
        title: `Growth update recorded: ${r.value} ${r.metric}`,
        subtitle: `${r.period} • ${parsed.source || 'Bharat Bazaar'}${parsed.description ? ` — "${parsed.description}"` : ''}`,
        date: new Date(r.createdAt),
      });
    });
  }
  if (allTasks.length > 0) {
    allTasks.forEach(t => {
      if (t.isCompleted && t.completedAt) {
        activityEvents.push({
          id: `task-done-${t.id}`,
          type: 'task_completed',
          title: `Milestone completed: "${t.title}"`,
          subtitle: `Assigned: ${t.assignedRole?.replace('_', ' ') || 'Team'}`,
          date: new Date(t.completedAt),
        });
      }
      if (t.createdAt) {
        activityEvents.push({
          id: `task-new-${t.id}`,
          type: 'task_created',
          title: `Milestone added: "${t.title}"`,
          subtitle: t.dueDate ? `Due date: ${new Date(t.dueDate).toLocaleDateString('en-IN')}` : 'No due date',
          date: new Date(t.createdAt),
        });
      }
    });
  }
  if (contractDetails?.createdAt) {
    activityEvents.push({
      id: `contract-${contractDetails.id}`,
      type: 'contract',
      title: 'Partnership Agreement established',
      subtitle: `Status: ${contractDetails.status || 'ACTIVE'} • Ref: ${contractDetails.id.slice(0, 8).toUpperCase()}`,
      date: new Date(contractDetails.createdAt),
    });
  }
  if (project.createdAt) {
    activityEvents.push({
      id: `proj-${project.id}`,
      type: 'project',
      title: 'Digital Growth Partnership launched',
      subtitle: `${project.request?.category || 'Growth Engagement'} officially began`,
      date: new Date(project.createdAt),
    });
  }
  activityEvents.sort((a, b) => b.date - a.date);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-xs font-bold text-gray-700 hover:text-amber-900 inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-400" /> Back to My Partnerships
        </button>
        {project.contract?.id && (
          <button
            onClick={() => navigate(`/contracts/${project.contract.id}`, { state: { projectId: id } })}
            className="text-xs font-bold text-amber-900 hover:text-amber-800 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200 inline-flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" /> View Partnership Agreement &rarr;
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar: Project Info & Actions */}
        <div className="lg:w-80 flex flex-col gap-6 shrink-0">
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-900/80 bg-amber-100/60 px-2.5 py-1 rounded-md inline-block mb-2">
                Digital Growth Partnership
              </span>
              <h1 className="text-xl font-black text-gray-900 leading-snug">{project.request.title}</h1>
            </div>

            <div className="space-y-3 text-xs border-t border-gray-100 pt-4">
              <div className="flex justify-between items-center pb-2.5 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Health Status</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${health.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${health.dot}`}></span>
                  {health.badge}
                </span>
              </div>

              {user.role === 'ARTISAN' ? (
                <div className="flex justify-between items-start pb-2.5 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">Growth Manager</span>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{project.intern.user.name}</p>
                    <p className="text-[10px] text-gray-400">{project.intern.college || 'Verified Partner'}</p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start pb-2.5 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">Client / Artisan</span>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{project.artisan.user.name}</p>
                    <p className="text-[10px] text-gray-400">{project.artisan.location || 'India'}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between pb-2.5 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Category</span>
                <span className="font-bold text-gray-900">{project.request.category}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Duration</span>
                <span className="font-bold text-gray-900">{contractDetails?.duration || '6 Months'}</span>
              </div>
            </div>
          </div>

          {/* Completion Action (Artisan Only) */}
          {user.role === 'ARTISAN' && project.status === 'IN_PROGRESS' && (
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-3xl p-6 space-y-3">
              <h3 className="font-bold text-blue-950 text-sm">Project Completion</h3>
              <p className="text-xs text-blue-800 leading-relaxed">
                When all milestone deliverables are satisfactorily completed by your Growth Manager, confirm completion here.
              </p>
              <button
                onClick={handleCompleteProject}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
              >
                Confirm Project Completion
              </button>
            </div>
          )}

          {/* Rating System (Artisan Only after completion) */}
          {user.role === 'ARTISAN' && project.status === 'COMPLETED' && !project.rating && !ratingSubmitted && (
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-3xl p-6 space-y-4">
              <h3 className="font-bold text-emerald-950 text-sm">Rate Your Growth Manager</h3>
              <form onSubmit={handleRateIntern} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-800 mb-2">Score (1-5)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setRatingScore(num)}
                        className={`w-9 h-9 rounded-xl font-bold transition-colors ${
                          ratingScore >= num ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-200/60 text-emerald-800 hover:bg-emerald-200'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-800 mb-1">Feedback</label>
                  <textarea
                    value={ratingReview}
                    onChange={(e) => setRatingReview(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-emerald-200 bg-white text-xs h-20 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    placeholder="Share how the collaboration helped your business..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingRating}
                  className="w-full py-2.5 bg-emerald-700 text-white font-bold rounded-xl text-xs hover:bg-emerald-800 transition shadow-sm"
                >
                  Submit Rating
                </button>
              </form>
            </div>
          )}

          {(project.rating || ratingSubmitted) && user.role === 'ARTISAN' && (
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-5 text-center text-emerald-800 space-y-1">
              <span className="text-xl block">⭐</span>
              <p className="text-xs font-bold">Feedback Recorded</p>
              <p className="text-[11px] text-emerald-600">Thank you for rating your growth partner.</p>
            </div>
          )}
        </div>

        {/* Main Area: Navigation Tabs & Tab Content */}
        <div className="flex-1 min-w-0 bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="flex border-b border-gray-200/80 bg-gray-50/50 px-4 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-5 py-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 shrink-0 transition-colors border-b-2 ${
                activeTab === 'OVERVIEW'
                  ? 'border-amber-800 text-amber-900 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Overview
            </button>
            <button
              onClick={() => setActiveTab('PLAN')}
              className={`px-5 py-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 shrink-0 transition-colors border-b-2 ${
                activeTab === 'PLAN'
                  ? 'border-amber-800 text-amber-900 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <ClipboardList className="w-4 h-4" /> Execution Plan
            </button>
            <button
              onClick={() => setActiveTab('ANALYTICS')}
              className={`px-5 py-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 shrink-0 transition-colors border-b-2 ${
                activeTab === 'ANALYTICS'
                  ? 'border-amber-800 text-amber-900 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <BarChart2 className="w-4 h-4" /> {user.role === 'ARTISAN' ? 'Business Performance' : 'Client Performance'}
            </button>
            <button
              onClick={() => setActiveTab('CHAT')}
              className={`px-5 py-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 shrink-0 transition-colors border-b-2 ${
                activeTab === 'CHAT'
                  ? 'border-amber-800 text-amber-900 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" /> Communication
            </button>
            <button
              onClick={() => setActiveTab('REPORTS')}
              className={`px-5 py-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 shrink-0 transition-colors border-b-2 ${
                activeTab === 'REPORTS'
                  ? 'border-amber-800 text-amber-900 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <BarChart className="w-4 h-4" /> Partnership Reports
            </button>
            <button
              onClick={() => setActiveTab('SUPPORT')}
              className={`px-5 py-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 shrink-0 transition-colors border-b-2 ${
                activeTab === 'SUPPORT'
                  ? 'border-amber-800 text-amber-900 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <LifeBuoy className="w-4 h-4" /> Support
            </button>
          </div>

          {/* TAB 1: OVERVIEW — COMMAND CENTER */}
          {activeTab === 'OVERVIEW' && (
            <div className="p-6 sm:p-8 space-y-8 bg-gray-50/30 flex-1">
              {/* Command Center Header */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 bg-amber-100 text-amber-900 font-extrabold text-[10px] tracking-wider uppercase rounded-full">
                      {project.artisan?.user?.name || 'Artisan'} × {project.intern?.user?.name || 'Growth Manager'}
                    </span>
                    <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 font-bold text-[10px] uppercase rounded-full">
                      Digital Growth Partnership
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${health.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${health.dot}`}></span>
                      {health.badge}
                    </span>
                    {daysRemaining !== null && (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${daysRemaining > 0 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {daysRemaining > 0 ? `${daysRemaining} Days Left` : 'Period Completed'}
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    {project.request?.title || contractDetails?.title || 'Digital Expansion Partnership'}
                  </h2>

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-gray-600">
                    <span className="font-medium">
                      Artisan: <strong className="text-gray-900 font-bold">{project.artisan?.user?.name}</strong>
                    </span>
                    <span className="text-gray-300">↔</span>
                    <span className="font-medium">
                      Growth Manager: <strong className="text-gray-900 font-bold">{project.intern?.user?.name}</strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      Started: {project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-IN') : '—'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      Target End: {contractDetails?.endDate ? new Date(contractDetails.endDate).toLocaleDateString('en-IN') : '6 Months'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-gray-400" />
                      {completedTasks.length} of {allTasks.length} Milestones Completed ({allTasks.length ? Math.round((completedTasks.length / allTasks.length) * 100) : 0}%)
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
                  {project.contract?.id && (
                    <button
                      onClick={() => navigate(`/contracts/${project.contract.id}`, { state: { projectId: id } })}
                      className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-2"
                    >
                      <FileText className="w-3.5 h-3.5" /> View Agreement
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab('PLAN')}
                    className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-2"
                  >
                    <ClipboardList className="w-3.5 h-3.5" /> Execution Plan &rarr;
                  </button>
                </div>
              </div>

              {/* NEXT BEST ACTION BANNER (PART 5) */}
              <div className={`rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border ${
                nextBestAction.isUrgent
                  ? 'bg-red-950 text-white border-red-900'
                  : 'bg-gradient-to-r from-amber-900 to-amber-950 text-white border-amber-900'
              }`}>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded ${
                      nextBestAction.isUrgent ? 'bg-red-500/30 text-red-200' : 'bg-white/10 text-amber-200'
                    }`}>
                      {nextBestAction.isUrgent ? 'URGENT ACTION NEEDED' : 'NEXT BEST ACTION'}
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-white">{nextBestAction.title}</h4>
                  <p className="text-xs text-amber-100/80 max-w-2xl leading-relaxed">{nextBestAction.description}</p>
                </div>
                <button
                  onClick={() => setActiveTab(nextBestAction.tab)}
                  className="px-5 py-2.5 bg-white text-gray-900 font-bold rounded-xl text-xs hover:bg-amber-50 transition shadow-xs whitespace-nowrap self-start md:self-auto"
                >
                  {nextBestAction.actionLabel} &rarr;
                </button>
              </div>

              {/* REAL PARTNERSHIP HEALTH DIMENSIONS (PART 5) */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-amber-800" />
                    <h3 className="font-extrabold text-gray-900 text-base">Partnership Health Scorecard</h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${health.color}`}>
                    Overall: {health.badge}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                  {/* 1. Execution */}
                  <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Execution</span>
                      <span className="font-black text-gray-900">{healthDimensions.executionPct}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-amber-800 h-2 rounded-full" style={{ width: `${healthDimensions.executionPct}%` }}></div>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      {completedTasks.length} / {allTasks.length} tasks completed
                    </p>
                  </div>

                  {/* 2. Reporting */}
                  <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Reporting</span>
                      <span className="font-black text-gray-900">
                        {healthDimensions.reportsCount > 0 ? `${healthDimensions.reportsCount} Logs` : '—'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(100, healthDimensions.reportsCount * 25)}%` }}></div>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      {healthDimensions.reportsCount > 0 ? `${healthDimensions.reportsCount} verified updates recorded` : 'Not enough activity yet'}
                    </p>
                  </div>

                  {/* 3. Deliverables */}
                  <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Deliverables</span>
                      <span className="font-black text-gray-900">
                        {healthDimensions.deliverablesCount > 0 ? `${healthDimensions.deliverablesCount} Items` : '—'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${healthDimensions.deliverablesCount > 0 ? 100 : 0}%` }}></div>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      {healthDimensions.deliverablesCount > 0 ? 'Agreed in contract scope' : 'Not enough activity yet'}
                    </p>
                  </div>

                  {/* 4. Communication */}
                  <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Communication</span>
                      <span className="font-black text-gray-900">
                        {healthDimensions.messagesCount > 0 ? `${healthDimensions.messagesCount} Msgs` : '—'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${Math.min(100, healthDimensions.messagesCount * 10)}%` }}></div>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      {healthDimensions.messagesCount > 0 ? `${healthDimensions.messagesCount} channel messages exchanged` : 'Not enough activity yet'}
                    </p>
                  </div>
                </div>
              </div>

              {/* BUSINESS GROWTH SNAPSHOT (PART 5) */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-amber-800" />
                    <h3 className="font-extrabold text-gray-900 text-base">Business Growth Snapshot</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('ANALYTICS')}
                    className="text-xs font-bold text-amber-800 hover:underline"
                  >
                    View Full Intelligence &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {user.role === 'ARTISAN' ? (
                    <>
                      <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
                        <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Total Products</span>
                        <span className="text-2xl font-black text-gray-900">{analytics?.totalProducts ?? 0}</span>
                      </div>
                      <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
                        <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Store Views</span>
                        <span className="text-2xl font-black text-gray-900">{analytics?.totalViews ?? 0}</span>
                      </div>
                      <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
                        <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Total Orders</span>
                        <span className="text-2xl font-black text-gray-900">{analytics?.totalOrders ?? 0}</span>
                      </div>
                      <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                        <span className="text-[10px] font-black uppercase text-emerald-800 block mb-1">Gross Revenue</span>
                        <span className="text-2xl font-black text-emerald-950">₹{analytics?.totalRevenue ?? 0}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
                        <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Client Products</span>
                        <span className="text-2xl font-black text-gray-900">{analytics?.totalProducts ?? 0}</span>
                      </div>
                      <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
                        <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Store Views</span>
                        <span className="text-2xl font-black text-gray-900">{analytics?.totalViews ?? 0}</span>
                      </div>
                      <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
                        <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Client Orders</span>
                        <span className="text-2xl font-black text-gray-900">{analytics?.totalOrders ?? 0}</span>
                      </div>
                      <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100">
                        <span className="text-[10px] font-black uppercase text-blue-800 block mb-1">Milestones Completed</span>
                        <span className="text-2xl font-black text-blue-950">{completedTasks.length} / {allTasks.length}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Main Content Grid: Left (Focus & Goals) / Right (Partner Context & Activity) */}
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* THIS WEEK / CURRENT FOCUS (PART 5) */}
                  <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-800" />
                        <h3 className="font-extrabold text-gray-900 text-base">This Week / Current Focus</h3>
                      </div>
                      <button onClick={() => setActiveTab('PLAN')} className="text-xs font-bold text-amber-800 hover:underline">
                        View All Milestones ({allTasks.length}) &rarr;
                      </button>
                    </div>

                    {currentFocusTasks.length > 0 ? (
                      <div className="space-y-3">
                        {currentFocusTasks.map((task, idx) => {
                          const isOverdue = task.dueDate && new Date(task.dueDate).getTime() < nowTimestamp;
                          const isAssignedToUser = (user.role === 'ARTISAN' && task.assignedRole === 'ARTISAN') || (user.role === 'INTERN' && task.assignedRole === 'GROWTH_MANAGER');
                          const numStr = String(idx + 1).padStart(2, '0');
                          return (
                            <div key={task.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition">
                              <div className="flex items-start gap-3">
                                <span className="text-xs font-black text-amber-900 bg-amber-100/80 px-2 py-1 rounded-lg shrink-0">
                                  {numStr}
                                </span>
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h5 className="font-bold text-sm text-gray-900">{task.title}</h5>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                      task.assignedRole === 'ARTISAN' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                      task.assignedRole === 'SHARED' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                      'bg-blue-50 text-blue-700 border border-blue-200'
                                    }`}>
                                      {task.assignedRole?.replace('_', ' ') || 'Team'}
                                    </span>
                                    {isOverdue && (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-100 text-red-700">
                                        Overdue
                                      </span>
                                    )}
                                    {isAssignedToUser && !isOverdue && (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                                        Needs Your Action
                                      </span>
                                    )}
                                  </div>
                                  {task.dueDate && (
                                    <p className={`text-[11px] font-medium ${isOverdue ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                                      {isOverdue ? 'Overdue deadline: ' : 'Target deadline: '} {new Date(task.dueDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleToggleTask(task.id)}
                                disabled={togglingTask === task.id}
                                className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold rounded-xl text-xs transition shadow-2xs self-start sm:self-auto shrink-0"
                              >
                                {togglingTask === task.id ? 'Updating...' : 'Mark Done'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-xs text-gray-400 bg-gray-50 rounded-2xl space-y-1">
                        <p className="font-bold text-gray-600">No pending milestones in this period.</p>
                        <p>All scheduled work items are up to date.</p>
                      </div>
                    )}
                  </div>

                  {/* PARTNERSHIP GOALS & SCOPE BOARD (PART 5) */}
                  <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-amber-800" />
                        <h3 className="font-extrabold text-gray-900 text-base">Partnership Goals & Scope</h3>
                      </div>
                      <span className="text-xs font-bold text-gray-400">Core Objectives</span>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                          Primary Partnership Goal
                        </span>
                        <p className="text-sm font-bold text-gray-900">
                          {project.request?.title || 'Expand digital market presence and repeatable sales'}
                        </p>
                        {project.request?.description && (
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                            {project.request.description}
                          </p>
                        )}
                      </div>

                      {contractDetails?.responsibilities && contractDetails.responsibilities.length > 0 ? (
                        <div className="space-y-2.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                            Key Agreed Deliverables
                          </span>
                          <div className="space-y-2">
                            {contractDetails.responsibilities.map((resp, idx) => (
                              <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-800 font-medium">
                                <span className="font-black text-amber-900 text-[10px] bg-amber-100 px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                                  {String(idx + 1).padStart(2, '0')}
                                </span>
                                <span className="leading-relaxed">{resp}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 border border-dashed border-gray-200 rounded-2xl space-y-1">
                          <p className="text-xs font-bold text-gray-700">No specific responsibilities listed in agreement</p>
                          <p className="text-[11px] text-gray-400">Deliverables defined in the Execution Plan guide collaboration.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Role Perspective & Real Activity Feed */}
                <div className="space-y-6">
                  {/* Role Specific Perspective */}
                  {user.role === 'ARTISAN' ? (
                    <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-amber-800" />
                        <h3 className="font-extrabold text-gray-900 text-base">Your Growth Partner</h3>
                      </div>
                      <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-2">
                        <p className="font-black text-gray-900 text-sm">{project.intern.user.name}</p>
                        <p className="text-xs text-gray-600">{project.intern.college || 'Growth Manager'}</p>
                        <p className="text-[11px] text-gray-500">Responsible for cataloging, marketing execution, and channel reports.</p>
                        <button
                          onClick={() => setActiveTab('CHAT')}
                          className="mt-2 w-full py-2 bg-amber-800 text-white font-bold rounded-xl text-xs hover:bg-amber-900 transition shadow-2xs flex items-center justify-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Message Partner
                        </button>
                      </div>

                      {artisanPendingTasks.length > 0 && (
                        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
                          <span className="text-[10px] font-black uppercase text-emerald-800 block">Needs Your Attention</span>
                          <p className="text-xs text-emerald-950 font-bold">{artisanPendingTasks[0].title}</p>
                          <button
                            onClick={() => setActiveTab('PLAN')}
                            className="text-xs font-bold text-emerald-800 hover:underline"
                          >
                            Review & Complete &rarr;
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-amber-800" />
                        <h3 className="font-extrabold text-gray-900 text-base">Client Overview</h3>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                        <p className="font-black text-gray-900 text-sm">{project.artisan.user.name}</p>
                        <p className="text-xs text-gray-600">Location: {project.artisan.location || 'India'}</p>
                        <p className="text-xs text-gray-600">Category: {project.request.category}</p>
                        <div className="pt-2 flex flex-col gap-2">
                          <button
                            onClick={() => setActiveTab('ANALYTICS')}
                            className="w-full py-2 bg-gray-900 text-white font-bold rounded-xl text-xs hover:bg-gray-800 transition"
                          >
                            Record Performance Update
                          </button>
                          <button
                            onClick={() => setActiveTab('CHAT')}
                            className="w-full py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-50 transition"
                          >
                            Send Client Message
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Real-Event Activity Feed (Part 11) */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-800" />
                      <h3 className="font-extrabold text-gray-900 text-base">Partnership Activity</h3>
                    </div>

                    <div className="space-y-4">
                      {activityEvents.slice(0, 6).map((ev) => {
                        const getRelativeDay = (d) => {
                          if (!d) return '—';
                          const now = new Date();
                          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                          const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                          const diff = Math.floor((today - target) / (1000 * 60 * 60 * 24));
                          if (diff === 0) return 'TODAY';
                          if (diff === 1) return 'YESTERDAY';
                          if (diff < 7) return `${diff} DAYS AGO`;
                          return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).toUpperCase();
                        };
                        return (
                          <div key={ev.id} className="relative pl-4 border-l-2 border-amber-800/20 space-y-1">
                            <div className="absolute w-2 h-2 rounded-full bg-amber-800 -left-[5px] top-1.5"></div>
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black uppercase tracking-wider text-amber-900 bg-amber-100/70 px-1.5 py-0.5 rounded">
                                {getRelativeDay(ev.date)}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {ev.date ? ev.date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-gray-900">{ev.title}</p>
                            <p className="text-[11px] text-gray-500 leading-tight">{ev.subtitle}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

      {activeTab === 'ANALYTICS' && (
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50 min-h-[400px] space-y-8">

          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-amber-600" />
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{user.role === 'ARTISAN' ? 'Business Performance' : 'Client Performance'}</h2>
            </div>
          </div>

          {/* PLATFORM METRICS */}
          {analytics && (
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
          )}

          {/* GROWTH INSIGHTS — derived from existing report data */}
          {reports && reports.length >= 2 && (() => {
            const numericReports = reports.filter(r => {
              const rawNum = String(r.value || '').replace(/[^0-9.-]+/g, '');
              return !isNaN(parseFloat(rawNum));
            });
            const metricGroups = {};
            numericReports.forEach(r => {
              if (!metricGroups[r.metric]) metricGroups[r.metric] = [];
              const rawNum = parseFloat(String(r.value).replace(/[^0-9.-]+/g, ''));
              metricGroups[r.metric].push({ value: rawNum, date: new Date(r.createdAt), period: r.period });
            });

            const insights = [];
            Object.entries(metricGroups).forEach(([metric, entries]) => {
              if (entries.length >= 2) {
                const sorted = [...entries].sort((a, b) => a.date - b.date);
                const latest = sorted[sorted.length - 1];
                const previous = sorted[sorted.length - 2];
                const change = ((latest.value - previous.value) / (previous.value || 1) * 100).toFixed(0);
                if (change > 0) {
                  insights.push({ text: `${metric} increased ${change}% from ${previous.period} to ${latest.period}.`, type: 'positive' });
                } else if (change < 0) {
                  insights.push({ text: `${metric} decreased ${Math.abs(change)}% from ${previous.period} to ${latest.period}.`, type: 'negative' });
                } else {
                  insights.push({ text: `${metric} remained steady between ${previous.period} and ${latest.period}.`, type: 'neutral' });
                }
              }
            });

            const topMetric = Object.entries(metricGroups)
              .filter(([, entries]) => entries.length > 0)
              .sort((a, b) => b[1][b[1].length - 1].value - a[1][a[1].length - 1].value)[0];

            if (topMetric) {
              insights.push({ text: `${topMetric[0]} recorded highest peak level with ${topMetric[1][topMetric[1].length - 1].value.toLocaleString('en-IN')}.`, type: 'info' });
            }

            return insights.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-gray-900 text-lg">Growth Insights & Signals</h3>
                </div>
                <div className="space-y-3">
                  {insights.map((insight, idx) => (
                    <div key={idx} className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm ${
                      insight.type === 'positive' ? 'bg-green-50/80 border-green-200 text-green-800' :
                      insight.type === 'negative' ? 'bg-red-50/80 border-red-200 text-red-800' :
                      insight.type === 'info' ? 'bg-blue-50/80 border-blue-200 text-blue-800' :
                      'bg-gray-50 border-gray-100 text-gray-700'
                    }`}>
                      <span className="shrink-0 mt-0.5">{insight.type === 'positive' ? '📈' : insight.type === 'negative' ? '📉' : '💡'}</span>
                      <span className="font-medium">{insight.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null;
          })()}

          {/* VISUALIZATION CHARTS — Line Trend & Channel Breakdown */}
          {reports && reports.length > 0 && (
            <PerformanceCharts reports={reports} />
          )}

          {/* PERFORMANCE ENTRY — Growth Manager only */}
          {user.role === 'INTERN' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-gray-900 text-lg">Add Business Performance Data</h3>
              </div>
              <form onSubmit={handleCreateReport} className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Metric Type</label>
                    <select value={newReportMetric} onChange={e => setNewReportMetric(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-700">
                      <option>Sales</option>
                      <option>Revenue</option>
                      <option>Orders</option>
                      <option>Product Views</option>
                      <option>Website Visits</option>
                      <option>Social Reach</option>
                      <option>Social Followers</option>
                      <option>Engagement</option>
                      <option>Leads</option>
                      <option>Customers</option>
                      <option>Conversion Rate</option>
                      <option>Cart Additions</option>
                      <option>Marketplace Orders</option>
                      <option>Offline Sales</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Value</label>
                    <input type="text" value={newReportValue} onChange={e => setNewReportValue(e.target.value)}
                      placeholder="e.g. 300, 42000, 12500"
                      required
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Unit</label>
                    <select value={newReportUnit} onChange={e => setNewReportUnit(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-700">
                      <option>Units</option>
                      <option>₹</option>
                      <option>Orders</option>
                      <option>Views</option>
                      <option>Followers</option>
                      <option>Reach</option>
                      <option>%</option>
                      <option>Visits</option>
                      <option>Leads</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Period</label>
                    <select value={newReportPeriod} onChange={e => setNewReportPeriod(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-700">
                      {['Week 1','Week 2','Week 3','Week 4','Month 1','Month 2','Month 3','Month 4','Month 5','Month 6','Q1','Q2','Q3','Q4'].map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category</label>
                    <select value={newReportCategory} onChange={e => setNewReportCategory(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-700">
                      <option>Marketplace</option>
                      <option>Social Media</option>
                      <option>Offline Store</option>
                      <option>Website</option>
                      <option>Marketing</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Source / Channel</label>
                    <input type="text" value={newReportSource} onChange={e => setNewReportSource(e.target.value)}
                      placeholder="e.g. Amazon, Instagram, Local Market"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-700" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description / Action & Result</label>
                  <textarea value={newReportDesc} onChange={e => setNewReportDesc(e.target.value)}
                    placeholder="Describe what you executed and what the business result was..."
                    rows={3}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 resize-none" />
                </div>
                <button type="submit" disabled={submittingReport || !newReportValue}
                  className="px-6 py-3 bg-amber-700 text-white font-bold rounded-xl text-sm hover:bg-amber-800 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                  {submittingReport ? 'Saving...' : 'Save Performance Data'}
                </button>
              </form>
            </div>
          )}

          {/* PERFORMANCE TIMELINE */}
          {reports && reports.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-900 text-lg">{user.role === 'ARTISAN' ? 'Growth Manager Updates' : 'Performance Timeline'}</h3>
              </div>
              <div className="space-y-4">
                {reports.map((report, idx) => {
                  const parsed = parseReportNotes(report.notes);
                  return (
                    <div key={idx} className="relative pl-6 pb-4 border-l-2 border-gray-200 last:pb-0">
                      <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-1"></div>
                      <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded uppercase">{report.period}</span>
                          <span className="text-sm font-bold text-gray-900">{report.metric}</span>
                          {parsed.category && <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-[10px] font-bold rounded uppercase">{parsed.category}</span>}
                          {parsed.source && <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">{parsed.source}</span>}
                        </div>
                        <div className="text-2xl font-extrabold text-gray-900 mb-1">{report.value}</div>
                        {parsed.description && <p className="text-sm text-gray-600 leading-relaxed">{parsed.description}</p>}
                        <span className="text-[10px] text-gray-400 mt-2 block">{new Date(report.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <BarChart2 className="w-14 h-14 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Build your growth story</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
                {user.role === 'ARTISAN'
                  ? 'Your Growth Manager can add performance updates here — sales, revenue, reach, orders and more. They will appear as a clear timeline with growth insights.'
                  : 'Start recording the business signals that matter. Add sales, revenue, reach, orders or campaign results and Bharat Bazaar will turn them into clear growth insights.'}
              </p>
              {user.role === 'INTERN' && (
                <p className="text-xs text-gray-400">Use the "Add Business Performance Data" form above to begin.</p>
              )}
            </div>
          )}

          {/* INSIGHTS CTA for reports with insufficient data */}
          {reports && reports.length === 1 && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 text-center">
              Add at least 2 performance records to start seeing growth trends and insights.
            </div>
          )}

        </div>
      )}

      {activeTab === 'PLAN' && (
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto bg-gray-50/50 min-h-[400px] space-y-8">
          {/* PLAN HEADER */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-amber-100 text-amber-900 font-extrabold text-[10px] tracking-wider uppercase rounded-full">
                  Execution Plan
                </span>
                <span className="text-xs font-bold text-gray-500">
                  {contractDetails?.duration || '6 MONTH'} PARTNERSHIP
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Milestones & Operations
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {contractDetails?.startDate ? new Date(contractDetails.startDate).toLocaleDateString('en-IN') : 'Start'}
                  {' → '}
                  {contractDetails?.endDate ? new Date(contractDetails.endDate).toLocaleDateString('en-IN') : 'End'}
                </span>
                <span>•</span>
                <span>{allTasks.length} Total Milestones Defined</span>
              </div>
            </div>

            <div className="w-full lg:w-72 space-y-3">
              <div className="flex justify-between items-end text-xs">
                <span className="font-bold text-gray-500 uppercase tracking-wider">Milestone Progress</span>
                <span className="font-black text-gray-900">
                  {completedTasks.length} / {allTasks.length} Done ({allTasks.length ? Math.round((completedTasks.length / allTasks.length) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-amber-800 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${allTasks.length ? (completedTasks.length / allTasks.length) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setIsAddingTask(!isAddingTask)}
                  className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-xl text-xs transition shadow-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> {isAddingTask ? 'Cancel Adding' : 'Add Milestone Task'}
                </button>
                {contractDetails?.id && (
                  <button
                    onClick={() => navigate(`/contracts/${contractDetails.id}`, { state: { projectId: id } })}
                    className="text-xs font-bold text-gray-600 hover:text-gray-900 underline"
                  >
                    View Agreement
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* PART 10: PARTNERSHIP LIFECYCLE ROADMAP */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">
                Partnership Growth Lifecycle
              </h3>
              <span className="text-[11px] font-bold text-amber-800">
                Stage {Math.min(6, Math.max(1, Math.ceil(((completedTasks.length / (allTasks.length || 1)) * 6))))} of 6
              </span>
            </div>
            {(() => {
              const stages = ['FOUNDATION', 'VISIBILITY', 'ACQUISITION', 'CONVERSION', 'RETENTION', 'SCALE'];
              const currentStageIdx = allTasks.length === 0 ? 0 : Math.min(5, Math.floor((completedTasks.length / allTasks.length) * 5.99));
              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
                  {stages.map((st, idx) => {
                    const isDone = idx < currentStageIdx;
                    const isCurrent = idx === currentStageIdx;
                    return (
                      <div
                        key={st}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          isCurrent
                            ? 'bg-amber-800 text-white border-amber-800 shadow-xs ring-2 ring-amber-800/20'
                            : isDone
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-gray-50 text-gray-400 border-gray-200/60'
                        }`}
                      >
                        <span className="text-[9px] font-black tracking-widest block opacity-75">PHASE {idx + 1}</span>
                        <span className="text-xs font-black">{st}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* INLINE ADD TASK FORM */}
          {isAddingTask && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-800/40 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-800" />
                  <h3 className="font-extrabold text-gray-900 text-lg">Add New Partnership Milestone</h3>
                </div>
                <button onClick={() => setIsAddingTask(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateWorkspaceTask} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Milestone Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="e.g. Set up Amazon seller catalog and product photographs"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Assigned Responsibility
                    </label>
                    <select
                      value={newTaskRole}
                      onChange={(e) => setNewTaskRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
                    >
                      <option value="GROWTH_MANAGER">Growth Manager</option>
                      <option value="ARTISAN">Artisan</option>
                      <option value="SHARED">Shared (Both)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Target Due Date
                    </label>
                    <input
                      type="date"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Description & Deliverable Details
                    </label>
                    <textarea
                      value={newTaskDesc}
                      onChange={(e) => setNewTaskDesc(e.target.value)}
                      placeholder="Provide specific guidelines, assets required, and expected outcome..."
                      rows={2}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingTask(false)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingTask || !newTaskTitle.trim()}
                    className="px-5 py-2 bg-amber-800 text-white rounded-xl text-xs font-bold hover:bg-amber-900 disabled:opacity-50 transition shadow-xs"
                  >
                    {savingTask ? 'Saving Milestone...' : 'Save Milestone'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* NEXT PRIORITY ACTION BANNER */}
          {nextActionTask && (
            <div className="bg-gradient-to-r from-amber-900 to-amber-950 text-white rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-200 bg-white/10 px-2 py-0.5 rounded">
                    Next Priority Action
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    nextActionTask.assignedRole === 'ARTISAN' ? 'bg-emerald-500/20 text-emerald-200' :
                    nextActionTask.assignedRole === 'SHARED' ? 'bg-purple-500/20 text-purple-200' :
                    'bg-blue-500/20 text-blue-200'
                  }`}>
                    {nextActionTask.assignedRole?.replace('_', ' ') || 'Team'}
                  </span>
                </div>
                <h4 className="text-lg font-black">{nextActionTask.title}</h4>
                {nextActionTask.description && (
                  <p className="text-xs text-amber-100/80 line-clamp-1 max-w-xl">{nextActionTask.description}</p>
                )}
                {nextActionTask.dueDate && (
                  <p className="text-[11px] text-amber-300 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Target Due: {new Date(nextActionTask.dueDate).toLocaleDateString('en-IN')}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleToggleTask(nextActionTask.id)}
                disabled={togglingTask === nextActionTask.id}
                className="px-5 py-2.5 bg-white text-gray-900 font-bold rounded-xl text-xs hover:bg-amber-50 transition shadow-xs whitespace-nowrap"
              >
                {togglingTask === nextActionTask.id ? 'Updating...' : 'Mark Complete'}
              </button>
            </div>
          )}

          {/* TASK GROUPS: OVERDUE, IN PROGRESS, COMPLETED */}
          {allTasks.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center space-y-4">
              <Target className="w-12 h-12 text-gray-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900">No Execution Milestones Yet</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Add concrete tasks to structure your partnership execution and track progress with real deadlines.
                </p>
              </div>
              <button
                onClick={() => setIsAddingTask(true)}
                className="px-5 py-2.5 bg-amber-800 text-white font-bold rounded-xl text-xs hover:bg-amber-900 transition shadow-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add First Milestone Task
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* 1. OVERDUE TASKS */}
              {overdueTasks.length > 0 && (
                <div className="bg-white rounded-3xl border border-red-200 shadow-xs overflow-hidden">
                  <div className="p-5 bg-red-50/70 border-b border-red-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <h3 className="font-extrabold text-red-950 text-sm">
                        Overdue Milestones ({overdueTasks.length})
                      </h3>
                    </div>
                    <span className="text-[10px] font-black uppercase text-red-700 bg-red-100 px-2 py-0.5 rounded">
                      Needs Immediate Action
                    </span>
                  </div>
                  <div className="divide-y divide-red-100">
                    {overdueTasks.map(task => (
                      <div key={task.id} className="p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:bg-red-50/30 transition">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-gray-900 text-sm">{task.title}</h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              task.assignedRole === 'ARTISAN' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              task.assignedRole === 'SHARED' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                              'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {task.assignedRole?.replace('_', ' ') || 'Team'}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase">
                              Past Due
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-xs text-gray-600 leading-relaxed">{task.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-red-700 font-semibold">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" /> Due: {new Date(task.dueDate).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleTask(task.id)}
                          disabled={togglingTask === task.id}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition shadow-2xs self-start md:self-auto shrink-0"
                        >
                          {togglingTask === task.id ? 'Updating...' : 'Mark Done'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. IN PROGRESS / UPCOMING TASKS */}
              <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
                <div className="p-5 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-800" />
                    <h3 className="font-extrabold text-gray-900 text-sm">
                      Active Milestones in Progress ({inProgressTasks.length})
                    </h3>
                  </div>
                  <span className="text-[10px] font-black uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    Current Cycle
                  </span>
                </div>
                {inProgressTasks.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-400">
                    All current milestones have been completed!
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {inProgressTasks.map(task => (
                      <div key={task.id} className="p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:bg-gray-50/50 transition">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-gray-900 text-sm">{task.title}</h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              task.assignedRole === 'ARTISAN' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              task.assignedRole === 'SHARED' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                              'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {task.assignedRole?.replace('_', ' ') || 'Team'}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 uppercase">
                              In Progress
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-xs text-gray-600 leading-relaxed">{task.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                            {task.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" /> Due: {new Date(task.dueDate).toLocaleDateString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleTask(task.id)}
                          disabled={togglingTask === task.id}
                          className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-xl text-xs transition shadow-2xs self-start md:self-auto shrink-0"
                        >
                          {togglingTask === task.id ? 'Updating...' : 'Mark Done'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. COMPLETED TASKS */}
              {completedTasks.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
                  <div className="p-5 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-700" />
                      <h3 className="font-extrabold text-emerald-950 text-sm">
                        Completed Milestones ({completedTasks.length})
                      </h3>
                    </div>
                    <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      Delivered
                    </span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {completedTasks.map(task => (
                      <div key={task.id} className="p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:bg-emerald-50/20 transition">
                        <div className="space-y-1.5 flex-1 opacity-80">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-gray-600 line-through text-sm">{task.title}</h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                              Done
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              task.assignedRole === 'ARTISAN' ? 'bg-emerald-50 text-emerald-700' :
                              task.assignedRole === 'SHARED' ? 'bg-purple-50 text-purple-700' :
                              'bg-blue-50 text-blue-700'
                            }`}>
                              {task.assignedRole?.replace('_', ' ') || 'Team'}
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-xs text-gray-500 line-clamp-1">{task.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-emerald-800 font-medium">
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              Completed {task.completedAt ? new Date(task.completedAt).toLocaleDateString('en-IN') : 'recently'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleTask(task.id)}
                          disabled={togglingTask === task.id}
                          className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition shadow-2xs self-start md:self-auto shrink-0"
                        >
                          {togglingTask === task.id ? 'Updating...' : 'Reopen'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VISUAL EXECUTION TIMELINE (PART 6) */}
              <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-7 shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-800" />
                    <h3 className="font-extrabold text-gray-900 text-base">Execution Roadmap Timeline</h3>
                  </div>
                  <span className="text-xs font-bold text-gray-400">Sequential Milestones</span>
                </div>

                <div className="relative pl-6 sm:pl-8 space-y-6 border-l-2 border-amber-800/20 ml-2">
                  {/* Start Node */}
                  <div className="relative">
                    <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-4 h-4 rounded-full bg-amber-800 border-2 border-white shadow-xs"></div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">Partnership Commencement</span>
                      <p className="text-xs font-bold text-gray-900">
                        {contractDetails?.startDate ? new Date(contractDetails.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Commenced'}
                      </p>
                    </div>
                  </div>

                  {/* Task Nodes */}
                  {allTasks.map((t, idx) => {
                    const isDone = t.isCompleted;
                    const isOverdue = !t.isCompleted && t.dueDate && new Date(t.dueDate).getTime() < nowTimestamp;
                    return (
                      <div key={t.id} className="relative">
                        <div className={`absolute -left-[31px] sm:-left-[39px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                          isDone ? 'bg-emerald-600' : isOverdue ? 'bg-red-500' : 'bg-blue-600'
                        }`}></div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-gray-400">Milestone #{idx + 1}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              isDone ? 'bg-emerald-50 text-emerald-700' : isOverdue ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                            }`}>
                              {isDone ? 'Delivered' : isOverdue ? 'Overdue' : 'Active'}
                            </span>
                            <span className="text-[10px] text-gray-400 font-semibold">
                              Owner: {t.assignedRole?.replace('_', ' ') || 'Team'}
                            </span>
                          </div>
                          <p className={`text-xs font-bold ${isDone ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{t.title}</p>
                          {t.dueDate && (
                            <p className="text-[11px] text-gray-400">
                              Target Date: {new Date(t.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Target End Node */}
                  <div className="relative">
                    <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-4 h-4 rounded-full bg-gray-400 border-2 border-white shadow-xs"></div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Target Final Deliverable</span>
                      <p className="text-xs font-bold text-gray-900">
                        {contractDetails?.endDate ? new Date(contractDetails.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Partnership Completion'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CONTRACT DELIVERABLES & RESPONSIBILITIES (PART 6) */}
              {contractDetails?.responsibilities?.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-7 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-amber-800" />
                      <h3 className="font-extrabold text-gray-900 text-base">Agreed Deliverables (From Agreement)</h3>
                    </div>
                    <span className="text-xs font-bold text-gray-400">Contractual Commitments</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {contractDetails.responsibilities.map((resp, i) => (
                      <div key={i} className="flex items-start gap-3 p-3.5 bg-gray-50/70 border border-gray-100 rounded-2xl">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-xs font-medium text-gray-800 leading-relaxed">{resp}</span>
                      </div>
                    ))}
                  </div>
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
                        {(() => {
                          const parsed = parseReportNotes(report.notes);
                          return (
                            <>
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 uppercase tracking-wider">{report.period}</span>
                                {idx === 0 && <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wider">Latest Report</span>}
                                {parsed.category && <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-200 text-gray-700 uppercase tracking-wider">{parsed.category}</span>}
                                {parsed.source && <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">{parsed.source}</span>}
                              </div>
                              <h4 className="text-xl font-extrabold text-gray-900 mb-1">{report.metric}: <span className="text-indigo-600">{report.value}</span></h4>
                              {parsed.description && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{parsed.description}</p>}
                            </>
                          );
                        })()}
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
  </div>
  );
}
