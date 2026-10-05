import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FileText, CheckCircle2, Clock, Calendar, ShieldCheck, UserCheck, Plus, CheckSquare, Square, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ContractDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Task state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const [agreeing, setAgreeing] = useState(false);

  useEffect(() => {
    fetchContract();
  }, [id]);

  const fetchContract = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/contracts/${id}`);
      setContract(res.data);
    } catch (err) {
      console.error('Fetch contract error:', err);
      setError('Failed to load contract details.');
    } finally {
      setLoading(false);
    }
  };

  const handleAgreeContract = async () => {
    try {
      setAgreeing(true);
      const res = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/contracts/${id}/agree`);
      setContract(res.data);
    } catch (err) {
      console.error('Agree contract error:', err);
      setError('Failed to record contract agreement.');
    } finally {
      setAgreeing(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      setAddingTask(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/contracts/${id}/tasks`, {
        title: newTaskTitle,
      });

      setContract((prev) => ({
        ...prev,
        tasks: [...prev.tasks, res.data],
      }));
      setNewTaskTitle('');
    } catch (err) {
      console.error('Add task error:', err);
    } finally {
      setAddingTask(false);
    }
  };

  const handleToggleTask = async (taskId, currentCompleted) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/contracts/tasks/${taskId}/toggle`,
        { isCompleted: !currentCompleted }
      );

      setContract((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === taskId ? res.data : t)),
      }));
    } catch (err) {
      console.error('Toggle task error:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-500 font-medium">Loading contract workspace...</p>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-red-600">{error || 'Contract not found'}</h2>
      </div>
    );
  }

  const isArtisan = user?.role === 'ARTISAN';
  const isIntern = user?.role === 'INTERN';
  const hasAgreed = isArtisan ? contract.artisanAgreed : isIntern ? contract.internAgreed : false;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link
        to={isArtisan ? '/dashboard' : '/dashboard'}
        className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-amber-800"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Contract Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
          <div className="space-y-1">
            <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-extrabold uppercase tracking-wider">
              {contract.tier} Growth Contract
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{contract.title}</h1>
            <p className="text-xs text-gray-400 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Duration: {contract.duration || '1 Month'} | Initiated on{' '}
              {new Date(contract.createdAt).toLocaleDateString('en-IN')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
                contract.status === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : contract.status === 'COMPLETED'
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : 'bg-amber-100 text-amber-800 border-amber-200'
              }`}
            >
              {contract.status}
            </span>
            {(contract.status === 'ACTIVE' || contract.status === 'COMPLETED') && contract.projectId && (
              <Link
                to={`/projects/${contract.projectId}`}
                className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-full text-xs hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Open Workspace &rarr;
              </Link>
            )}
          </div>
        </div>

        {/* Agreement Status Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs">
          <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
            <span className="font-bold text-gray-700">Artisan: {contract.artisan?.user?.name}</span>
            {contract.artisanAgreed ? (
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" /> Agreed
              </span>
            ) : (
              <span className="text-amber-600 font-medium">Pending Agreement</span>
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
            <span className="font-bold text-gray-700">Growth Manager: {contract.intern?.user?.name}</span>
            {contract.internAgreed ? (
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" /> Agreed
              </span>
            ) : (
              <span className="text-amber-600 font-medium">Pending Agreement</span>
            )}
          </div>
        </div>

        {/* Agreement CTA */}
        {!hasAgreed && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-amber-900">
              <h4 className="font-bold text-sm">Review & Sign Contract Terms</h4>
              <p className="text-xs text-amber-800">
                Please review the terms and responsibilities below. Click Sign Contract to confirm the agreement.
              </p>
            </div>
            <button
              onClick={handleAgreeContract}
              disabled={agreeing}
              className="px-6 py-3 bg-amber-700 text-white font-bold text-xs rounded-xl hover:bg-amber-800 transition-colors shadow-md flex-shrink-0 disabled:bg-gray-400"
            >
              {agreeing ? 'Signing...' : 'Sign & Accept Contract Terms'}
            </button>
          </div>
        )}
      </div>

      {/* Grid: Contract Details + Milestone Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contract Terms */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6 h-fit">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-700" />
            Contract Terms
          </h2>

          <div className="space-y-3 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Engagement Type</span>
              <span className="font-bold text-gray-800">{contract.paymentType}</span>
            </div>
            <div className="flex justify-between">
              <span>Agreed Amount</span>
              <span className="font-extrabold text-amber-900 text-sm">
                ₹{contract.paymentAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Target Tier</span>
              <span className="font-bold text-gray-800">{contract.tier}</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2">
            <span className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
              Agreed Responsibilities
            </span>
            <ul className="space-y-1.5 text-xs text-gray-600">
              {contract.responsibilities.map((resp, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Milestone Task Checklist */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-amber-700" />
              Contract Growth Tasks Checklist
            </h2>
            <span className="text-xs font-bold text-gray-400">
              {contract.tasks.filter((t) => t.isCompleted).length} / {contract.tasks.length} Completed
            </span>
          </div>

          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="flex gap-2">
            <input
              type="text"
              placeholder="Add a new growth task (e.g., Update 10 product titles, Register on Amazon)..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-grow px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-700"
            />
            <button
              type="submit"
              disabled={addingTask}
              className="px-4 py-2.5 bg-amber-700 text-white rounded-xl text-xs font-bold hover:bg-amber-800 transition-colors flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </form>

          {/* Task List */}
          <div className="space-y-2">
            {contract.tasks.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6 italic">
                No tasks added to this contract yet. Use the input above to add growth milestones!
              </p>
            ) : (
              contract.tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id, task.isCompleted)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    task.isCompleted
                      ? 'bg-emerald-50/50 border-emerald-200 text-gray-500 line-through'
                      : 'bg-white border-gray-100 hover:border-amber-200 text-gray-800'
                  }`}
                >
                  {task.isCompleted ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-300 flex-shrink-0" />
                  )}
                  <span className="text-xs font-medium flex-grow">{task.title}</span>
                  {task.isCompleted && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      Done
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
