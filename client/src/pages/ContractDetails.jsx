import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FileText, CheckCircle2, Calendar, ShieldCheck, UserCheck, Plus, CheckSquare, Square, ArrowLeft, Download, PenTool, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ContractDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();

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
        <p className="text-gray-500 font-medium">Loading partnership agreement...</p>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-red-600">{error || 'Agreement not found'}</h2>
      </div>
    );
  }

  const isArtisan = user?.role === 'ARTISAN';
  const isIntern = user?.role === 'INTERN';
  const hasAgreed = isArtisan ? contract.artisanAgreed : isIntern ? contract.internAgreed : false;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        {(() => {
          const targetProjectId = contract.projectId || location.state?.projectId;
          return (
            <Link
              to={targetProjectId ? `/projects/${targetProjectId}` : '/dashboard'}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              {targetProjectId ? 'Back to Partnership Workspace' : 'Back to Dashboard'}
            </Link>
          );
        })()}
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/contracts/${id}/pdf`, {
                  responseType: 'blob',
                  headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Bharat-Bazaar-Partnership-Agreement-${id}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                window.URL.revokeObjectURL(url);
              } catch (err) {
                console.error('PDF download error:', err);
                if (!err.response) {
                  setError('Unable to reach the server. Please try again.');
                } else if (err.response.status === 403) {
                  setError('You are not authorized to download this agreement.');
                } else {
                  setError('Failed to download PDF. Please try again.');
                }
              }
            }}
            className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Main A4 Style Document Container */}
      <div className="bg-white mx-auto shadow-sm border border-gray-200 rounded-lg max-w-4xl overflow-hidden">

        {/* Document Header */}
        <div className="bg-gray-50 px-8 py-10 border-b border-gray-200 text-center">
          <h2 className="text-xl font-extrabold text-amber-900 tracking-widest uppercase mb-1">BHARAT BAZAAR</h2>
          <p className="text-xs text-amber-700 tracking-widest uppercase mb-6">Local craft. Limitless possibilities.</p>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-6">PARTNERSHIP AGREEMENT</h1>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs font-semibold text-gray-600">
            <span>REF: <span className="text-gray-900">{contract.id.slice(0, 8).toUpperCase()}</span></span>
            <span>DATE: <span className="text-gray-900">{new Date(contract.createdAt).toLocaleDateString('en-IN')}</span></span>
            <span>STATUS: <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white ${contract.status === 'ACTIVE' ? 'bg-emerald-600' : contract.status === 'COMPLETED' ? 'bg-blue-600' : 'bg-amber-600'}`}>{contract.status}</span></span>
          </div>
        </div>

        {/* Document Body */}
        <div className="px-8 py-10 space-y-10 text-gray-800">

          {/* PARTIES */}
          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2 mb-6">PARTIES</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-6 border border-gray-100 rounded-lg">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-4">Client / Business Owner</span>
                <p className="font-serif text-lg font-bold text-gray-900 mb-1">{contract.artisan?.user?.name}</p>
                <p className="text-sm text-gray-600">Business/Brand Owner</p>
                {contract.artisan?.location && <p className="text-sm text-gray-600 mt-2">{contract.artisan.location}</p>}
              </div>
              <div className="bg-gray-50 p-6 border border-gray-100 rounded-lg">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-4">Growth Manager / Partner</span>
                <p className="font-serif text-lg font-bold text-gray-900 mb-1">{contract.intern?.user?.name}</p>
                <p className="text-sm text-gray-600">Professional Growth Partner</p>
                {contract.intern?.institution && <p className="text-sm text-gray-600 mt-2">{contract.intern.institution}</p>}
              </div>
            </div>
          </section>

          {/* 1. PURPOSE OF THE PARTNERSHIP */}
          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2 mb-4">1. Purpose of the Partnership</h3>
            <p className="text-sm text-gray-700 leading-relaxed font-serif">
              {contract.description || `The purpose of this agreement is to define the terms of the growth and operational partnership regarding: ${contract.title}. Both parties commit to collaborating professionally through the Bharat Bazaar platform.`}
            </p>
          </section>

          {/* 2. SCOPE OF WORK */}
          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2 mb-4">2. Scope of Work</h3>
            {contract.responsibilities && contract.responsibilities.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700 font-serif">
                {contract.responsibilities.map((resp, idx) => (
                  <li key={idx} className="pl-2">{resp}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-700 italic font-serif">The specific responsibilities will be detailed within the Execution Plan on the platform.</p>
            )}
          </section>

          {/* 3. DELIVERABLES */}
          <section>
            <div className="flex justify-between items-end border-b border-gray-200 pb-2 mb-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">3. Deliverables (Execution Plan)</h3>
              <span className="text-xs text-gray-500">{contract.tasks?.length || 0} Listed</span>
            </div>
            {contract.tasks && contract.tasks.length > 0 ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-3 font-semibold">Deliverable / Task</th>
                      <th className="p-3 font-semibold w-32">Due Date</th>
                      <th className="p-3 font-semibold w-24 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 font-serif">
                    {contract.tasks.map(task => (
                      <tr key={task.id} className="bg-white">
                        <td className="p-3 text-gray-800">{task.title}</td>
                        <td className="p-3 text-gray-600">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</td>
                        <td className="p-3 text-center">
                          {task.isCompleted ? (
                            <span className="inline-flex items-center justify-center bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">DONE</span>
                          ) : (
                            <span className="inline-flex items-center justify-center bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">PENDING</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-600 font-serif">
                No deliverables have been formally attached to this document yet. Both parties may define deliverables within the workspace.
              </div>
            )}

            {/* Manage Tasks Action for Authorized Users */}
            {(isArtisan || isIntern) && (
              <form onSubmit={handleAddTask} className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Add a new formal deliverable..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-amber-700"
                />
                <button
                  type="submit"
                  disabled={addingTask || !newTaskTitle.trim()}
                  className="px-4 py-2 bg-gray-900 text-white rounded text-sm font-bold hover:bg-gray-800 disabled:opacity-50"
                >
                  Append Task
                </button>
              </form>
            )}
          </section>

          {/* 4. PARTNERSHIP PERIOD */}
          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2 mb-4">4. Partnership Period</h3>
            <div className="grid grid-cols-3 gap-4 text-sm font-serif">
              <div>
                <p className="text-gray-500 mb-1 font-sans text-xs uppercase tracking-wider font-bold">Commencement Date</p>
                <p className="text-gray-900 font-semibold">{contract.startDate ? new Date(contract.startDate).toLocaleDateString('en-IN') : '—'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1 font-sans text-xs uppercase tracking-wider font-bold">Duration</p>
                <p className="text-gray-900 font-semibold">{contract.duration || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1 font-sans text-xs uppercase tracking-wider font-bold">End Date</p>
                <p className="text-gray-900 font-semibold">{contract.endDate ? new Date(contract.endDate).toLocaleDateString('en-IN') : 'Ongoing/Variable'}</p>
              </div>
            </div>
          </section>

          {/* 5. COMMERCIAL TERMS */}
          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2 mb-4">5. Commercial Terms</h3>
            <div className="grid grid-cols-2 gap-4 text-sm font-serif">
              <div>
                <p className="text-gray-500 mb-1 font-sans text-xs uppercase tracking-wider font-bold">Engagement Type</p>
                <p className="text-gray-900 font-semibold">{contract.paymentType}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1 font-sans text-xs uppercase tracking-wider font-bold">Agreed Value</p>
                <p className="text-gray-900 font-semibold">{contract.paymentAmount ? `₹${contract.paymentAmount.toLocaleString('en-IN')}` : 'Pro Bono / Mutual Agreement'}</p>
              </div>
            </div>
          </section>

          {/* 6. REPORTING & COMMUNICATION */}
          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2 mb-4">6. Collaboration Guidelines</h3>
            <div className="space-y-3 text-sm text-gray-700 font-serif leading-relaxed">
              <p>
                <strong>Reporting:</strong> The Growth Manager is expected to submit periodic performance updates via the "Partnership Reports" module in the workspace.
              </p>
              <p>
                <strong>Communication:</strong> All official project-related communications shall occur via the secure platform "Communication" channels to maintain transparency.
              </p>
            </div>
          </section>

          {/* 7. PLATFORM ACKNOWLEDGEMENT */}
          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2 mb-4">7. Platform Acknowledgement</h3>
            <p className="text-sm text-gray-600 font-serif leading-relaxed italic">
              By utilizing this service, both parties acknowledge that Bharat Bazaar operates solely as a facilitator providing digital tools, analytics, and infrastructure for this partnership. Bharat Bazaar is not a legal party to this specific agreement and this document serves as a structured digital record of the mutually agreed scope between the Client and Growth Manager.
            </p>
          </section>

          {/* 8. SIGNATURE / ACKNOWLEDGEMENT */}
          <section className="pt-8 mt-12 border-t-2 border-gray-900">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest text-center mb-10">Digital Acknowledgement & Signatures</h3>

            {/* Agreement Actions Box if pending */}
            {!hasAgreed && (
              <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg text-center mb-10">
                <ShieldCheck className="w-8 h-8 text-amber-600 mx-auto mb-3" />
                <h4 className="font-bold text-amber-900 mb-2">Pending Your Agreement</h4>
                <p className="text-sm text-amber-800 mb-4 max-w-md mx-auto">Please review the terms defined above. By confirming, you legally acknowledge and agree to the partnership structure.</p>
                <button
                  onClick={handleAgreeContract}
                  disabled={agreeing}
                  className="px-6 py-3 bg-amber-700 text-white font-bold rounded-lg hover:bg-amber-800 transition-colors shadow-md disabled:bg-gray-400"
                >
                  {agreeing ? 'Signing...' : 'I Agree & Sign Electronically'}
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-2">
                <div className={`h-16 border-b-2 flex items-end pb-2 ${contract.artisanAgreed ? 'border-gray-900' : 'border-gray-300 border-dashed'}`}>
                  {contract.artisanAgreed && <span className="font-serif text-2xl text-gray-900 opacity-80 italic">{contract.artisan?.user?.name}</span>}
                </div>
                <p className="font-bold text-xs uppercase tracking-widest text-gray-500">Client Signature</p>
                <div className="flex items-center gap-1.5 mt-1">
                  {contract.artisanAgreed ? (
                    <><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /><span className="text-xs font-semibold text-emerald-700">Digitally Verified</span></>
                  ) : (
                    <><Clock className="w-3.5 h-3.5 text-amber-600" /><span className="text-xs font-medium text-amber-600">Pending</span></>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className={`h-16 border-b-2 flex items-end pb-2 ${contract.internAgreed ? 'border-gray-900' : 'border-gray-300 border-dashed'}`}>
                  {contract.internAgreed && <span className="font-serif text-2xl text-gray-900 opacity-80 italic">{contract.intern?.user?.name}</span>}
                </div>
                <p className="font-bold text-xs uppercase tracking-widest text-gray-500">Growth Partner Signature</p>
                <div className="flex items-center gap-1.5 mt-1">
                  {contract.internAgreed ? (
                    <><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /><span className="text-xs font-semibold text-emerald-700">Digitally Verified</span></>
                  ) : (
                    <><Clock className="w-3.5 h-3.5 text-amber-600" /><span className="text-xs font-medium text-amber-600">Pending</span></>
                  )}
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="bg-gray-900 text-gray-400 py-4 px-8 text-[10px] text-center tracking-widest uppercase">
          Bharat Bazaar Platform-Facilitated Partnership Agreement • Document Ref: {contract.id}
        </div>
      </div>
    </div>
  );
}
