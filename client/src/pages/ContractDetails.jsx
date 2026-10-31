import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  FileText, CheckCircle2, Calendar, ShieldCheck, UserCheck, Plus,
  CheckSquare, Square, ArrowLeft, Download, PenTool, CheckCircle, ArrowRight, Clock,
  Sparkles, Building, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ContractDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);

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
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-600 font-medium font-sans">Loading partnership agreement...</p>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-xl font-bold font-display text-rose-700">{error || 'Agreement not found'}</h2>
        <Link to="/dashboard" className="btn-secondary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  const isArtisan = user?.role === 'ARTISAN';
  const isIntern = user?.role === 'INTERN';
  const hasAgreed = isArtisan ? contract.artisanAgreed : isIntern ? contract.internAgreed : false;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Top Navigation & Action Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {(() => {
          const targetProjectId = contract.projectId || location.state?.projectId;
          return (
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={targetProjectId ? `/projects/${targetProjectId}` : '/dashboard'}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {targetProjectId ? 'Back to Partnership Workspace' : 'Back to Dashboard'}
              </Link>
              {targetProjectId && (
                <Link
                  to={`/projects/${targetProjectId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  Active Workspace <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          );
        })()}

        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              try {
                setDownloadingPdf(true);
                const token = localStorage.getItem('token');
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
                const res = await axios.get(`${apiUrl}/api/contracts/${id}/pdf`, {
                  responseType: 'blob',
                  headers: token ? { Authorization: `Bearer ${token}` } : {}
                });

                if (res.data?.type === 'application/json') {
                  const errorText = await res.data.text();
                  const parsed = JSON.parse(errorText);
                  throw new Error(parsed.error || 'Server error generating PDF.');
                }

                const ref = (contract?.id || id).slice(0, 8).toUpperCase();
                const filename = `Bharat-Bazaar-Partnership-Agreement-${ref}.pdf`;
                const blob = new Blob([res.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                window.URL.revokeObjectURL(url);
              } catch (err) {
                console.error('PDF download error:', err);
                let message = 'Failed to download PDF. Please try again.';
                if (err.response?.data instanceof Blob) {
                  try {
                    const text = await err.response.data.text();
                    const parsed = JSON.parse(text);
                    if (parsed.error) message = parsed.error;
                  } catch (_) {}
                } else if (err.response?.status === 403) {
                  message = 'You are not authorized to download this agreement.';
                } else if (!err.response) {
                  message = 'Unable to reach the server. Please check connection and try again.';
                } else if (err.message) {
                  message = err.message;
                }
                alert(message);
              } finally {
                setDownloadingPdf(false);
              }
            }}
            disabled={downloadingPdf}
            className="btn-outline px-4 py-2 text-xs flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            {downloadingPdf ? 'Generating PDF...' : 'Download Official PDF'}
          </button>
        </div>
      </div>

      {/* Main A4 Style Document Container */}
      <div className="bg-white mx-auto shadow-md border border-slate-200/90 rounded-2xl max-w-4xl overflow-hidden">

        {/* Document Header */}
        <div className="bg-gradient-to-b from-stone-50 via-emerald-950/5 to-white px-8 sm:px-12 py-10 border-b border-slate-200 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/10 text-emerald-950 text-[10px] font-bold tracking-widest uppercase mb-3 border border-emerald-900/20">
            <Building className="w-3 h-3 text-emerald-800" />
            Official Digital Record
          </div>
          <h2 className="text-xl font-extrabold font-display text-emerald-950 tracking-widest uppercase mb-1">
            BHARAT BAZAAR
          </h2>
          <p className="text-xs text-amber-800 font-semibold tracking-wider uppercase mb-5">
            Local craft. Limitless possibilities.
          </p>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mb-6">
            DIGITAL PARTNERSHIP AGREEMENT
          </h1>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs font-semibold text-slate-600 pt-2 border-t border-slate-200/70 max-w-xl mx-auto">
            <span>REFERENCE: <span className="text-slate-900 font-bold font-mono">{contract.id.slice(0, 8).toUpperCase()}</span></span>
            <span>RECORDED: <span className="text-slate-900 font-bold">{new Date(contract.createdAt).toLocaleDateString('en-IN')}</span></span>
            <span>STATUS: <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
              contract.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
              contract.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
              'bg-amber-100 text-amber-800 border border-amber-200'
            }`}>{contract.status}</span></span>
          </div>
        </div>

        {/* Document Body */}
        <div className="px-8 sm:px-12 py-10 space-y-10 text-slate-800">

          {/* PARTIES */}
          <section>
            <h3 className="text-xs font-extrabold font-display text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-6">
              1. PARTNERSHIP PARTIES
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card-cream p-5 rounded-2xl border border-stone-200/80">
                <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-widest block mb-2">
                  Client / Business Owner
                </span>
                <p className="font-serif text-lg font-bold text-slate-900 mb-1">{contract.artisan?.user?.name}</p>
                <p className="text-xs text-slate-600">Business & Craft Creator</p>
                {contract.artisan?.location && (
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <span className="text-slate-400">Location:</span> {contract.artisan.location}
                  </p>
                )}
              </div>
              <div className="card-cream p-5 rounded-2xl border border-stone-200/80">
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-widest block mb-2">
                  Growth Partner / Intern
                </span>
                <p className="font-serif text-lg font-bold text-slate-900 mb-1">{contract.intern?.user?.name}</p>
                <p className="text-xs text-slate-600">Growth Strategist & Operator</p>
                {contract.intern?.institution && (
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <span className="text-slate-400">Institution:</span> {contract.intern.institution}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* 2. PURPOSE OF THE PARTNERSHIP */}
          <section>
            <h3 className="text-xs font-extrabold font-display text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">
              2. PURPOSE OF THE COLLABORATION
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed font-serif bg-stone-50/60 p-4 rounded-xl border border-stone-200/60">
              {contract.description || `The purpose of this agreement is to define the terms of the digital growth and operational partnership regarding: ${contract.title}. Both parties commit to collaborating professionally through the Bharat Bazaar workspace.`}
            </p>
          </section>

          {/* 3. SCOPE OF WORK */}
          <section>
            <h3 className="text-xs font-extrabold font-display text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">
              3. SCOPE OF OPERATIONAL RESPONSIBILITIES
            </h3>
            {contract.responsibilities && contract.responsibilities.length > 0 ? (
              <ul className="space-y-2.5 font-serif text-sm text-slate-700">
                {contract.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-600 italic font-serif">
                Specific milestones and tasks will be defined dynamically within the Execution Plan on the workspace.
              </p>
            )}
          </section>

          {/* 4. DELIVERABLES */}
          <section>
            <div className="flex justify-between items-end border-b border-slate-200 pb-2 mb-4">
              <h3 className="text-xs font-extrabold font-display text-slate-400 uppercase tracking-widest">
                4. FORMAL DELIVERABLES & EXECUTION PLAN
              </h3>
              <span className="text-xs font-semibold text-slate-500">{contract.tasks?.length || 0} Listed</span>
            </div>
            {contract.tasks && contract.tasks.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-sm">
                  <thead className="bg-stone-50 border-b border-slate-200 text-xs text-slate-600 uppercase tracking-wider font-display font-semibold">
                    <tr>
                      <th className="p-3.5">Deliverable / Milestone Task</th>
                      <th className="p-3.5 w-36">Target Date</th>
                      <th className="p-3.5 w-28 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-serif">
                    {contract.tasks.map(task => (
                      <tr key={task.id} className="bg-white hover:bg-stone-50/50 transition-colors">
                        <td className="p-3.5 text-slate-800 font-medium">{task.title}</td>
                        <td className="p-3.5 text-slate-600 text-xs">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td className="p-3.5 text-center">
                          {task.isCompleted ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                              <CheckCircle className="w-3 h-3" /> DONE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                              <Clock className="w-3 h-3" /> PENDING
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-sm text-slate-600 font-serif">
                No deliverables have been formally attached to this document yet. Both parties may define deliverables within the workspace.
              </div>
            )}

            {/* Manage Tasks Action for Authorized Users */}
            {(isArtisan || isIntern) && (
              <form onSubmit={handleAddTask} className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Add a new deliverable to this agreement..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="input-field flex-grow text-xs"
                />
                <button
                  type="submit"
                  disabled={addingTask || !newTaskTitle.trim()}
                  className="btn-primary text-xs px-4 py-2 shrink-0 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {addingTask ? 'Appending...' : 'Append Deliverable'}
                </button>
              </form>
            )}
          </section>

          {/* 5. PARTNERSHIP PERIOD */}
          <section>
            <h3 className="text-xs font-extrabold font-display text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">
              5. TIMELINE & ENGAGEMENT PERIOD
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm">
              <div>
                <p className="text-slate-500 mb-1 font-display text-xs uppercase tracking-wider font-bold">Commencement Date</p>
                <p className="text-slate-900 font-semibold font-serif">
                  {contract.startDate ? new Date(contract.startDate).toLocaleDateString('en-IN') : '—'}
                </p>
              </div>
              <div>
                <p className="text-slate-500 mb-1 font-display text-xs uppercase tracking-wider font-bold">Duration</p>
                <p className="text-slate-900 font-semibold font-serif">{contract.duration || '6 Months'}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1 font-display text-xs uppercase tracking-wider font-bold">Target Conclusion</p>
                <p className="text-slate-900 font-semibold font-serif">
                  {contract.endDate ? new Date(contract.endDate).toLocaleDateString('en-IN') : 'Ongoing/Variable'}
                </p>
              </div>
            </div>
          </section>

          {/* 6. COMMERCIAL TERMS */}
          <section>
            <h3 className="text-xs font-extrabold font-display text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">
              6. FINANCIAL & COMMERCIAL TERMS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm">
              <div>
                <p className="text-slate-500 mb-1 font-display text-xs uppercase tracking-wider font-bold">Engagement Model</p>
                <p className="text-slate-900 font-semibold font-serif">{contract.paymentType}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1 font-display text-xs uppercase tracking-wider font-bold">Agreed Value</p>
                <p className="text-emerald-950 font-bold font-serif text-base">
                  {contract.paymentAmount ? `₹${contract.paymentAmount.toLocaleString('en-IN')}` : 'Pro Bono / Mutual Agreement'}
                </p>
              </div>
            </div>
          </section>

          {/* 7. COLLABORATION GUIDELINES */}
          <section>
            <h3 className="text-xs font-extrabold font-display text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">
              7. GOVERNANCE & COMMUNICATION
            </h3>
            <div className="space-y-3 text-sm text-slate-700 font-serif leading-relaxed">
              <p>
                <strong className="text-slate-900 font-sans">Reporting Cadence:</strong> The Growth Manager is expected to submit periodic performance logs via the "Partnership Reports" module in the workspace.
              </p>
              <p>
                <strong className="text-slate-900 font-sans">Official Communication:</strong> All strategic and operational communications must remain on the platform workspace to ensure transparency and accountability.
              </p>
            </div>
          </section>

          {/* 8. PLATFORM ACKNOWLEDGEMENT */}
          <section>
            <h3 className="text-xs font-extrabold font-display text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">
              8. PLATFORM FACILITATION ACKNOWLEDGEMENT
            </h3>
            <p className="text-xs text-slate-500 font-serif leading-relaxed italic bg-stone-50 p-4 rounded-xl border border-stone-200/60">
              By utilizing this service, both parties acknowledge that Bharat Bazaar operates solely as a facilitator providing digital tooling, performance analytics, and collaboration infrastructure. Bharat Bazaar is not a legal party to this specific engagement; this document serves as a structured digital record of the mutually agreed scope.
            </p>
          </section>

          {/* 9. SIGNATURE / ACKNOWLEDGEMENT */}
          <section className="pt-8 mt-10 border-t-2 border-emerald-950">
            <h3 className="text-sm font-extrabold font-display text-emerald-950 uppercase tracking-widest text-center mb-8">
              DIGITAL ACKNOWLEDGEMENT & VERIFICATION
            </h3>

            {/* Agreement Actions Box if pending */}
            {!hasAgreed && (
              <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl text-center mb-10 shadow-xs">
                <ShieldCheck className="w-8 h-8 text-amber-700 mx-auto mb-3" />
                <h4 className="font-bold font-display text-amber-950 text-base mb-1">Pending Your Digital Confirmation</h4>
                <p className="text-xs text-amber-800 mb-4 max-w-md mx-auto leading-relaxed">
                  Please review the terms and deliverables outlined above. By confirming, you officially record your consent to this collaboration scope.
                </p>
                <button
                  onClick={handleAgreeContract}
                  disabled={agreeing}
                  className="btn-accent px-6 py-2.5 text-xs font-bold shadow-sm disabled:opacity-50 inline-flex items-center gap-2"
                >
                  <PenTool className="w-4 h-4" />
                  {agreeing ? 'Signing...' : 'I Agree & Sign Electronically'}
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="p-4 rounded-xl bg-stone-50 border border-slate-200/80 space-y-2">
                <div className={`h-14 border-b-2 flex items-end pb-1.5 ${contract.artisanAgreed ? 'border-emerald-800' : 'border-slate-300 border-dashed'}`}>
                  {contract.artisanAgreed ? (
                    <span className="font-serif text-xl text-emerald-950 italic font-bold">{contract.artisan?.user?.name}</span>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Signature pending...</span>
                  )}
                </div>
                <div className="flex justify-between items-center pt-1">
                  <p className="font-bold font-display text-[10px] uppercase tracking-wider text-slate-600">Client Signature</p>
                  <div className="flex items-center gap-1">
                    {contract.artisanAgreed ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                        <CheckCircle className="w-3 h-3 text-emerald-600" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700">
                        <Clock className="w-3 h-3 text-amber-600" /> Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-slate-200/80 space-y-2">
                <div className={`h-14 border-b-2 flex items-end pb-1.5 ${contract.internAgreed ? 'border-emerald-800' : 'border-slate-300 border-dashed'}`}>
                  {contract.internAgreed ? (
                    <span className="font-serif text-xl text-emerald-950 italic font-bold">{contract.intern?.user?.name}</span>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Signature pending...</span>
                  )}
                </div>
                <div className="flex justify-between items-center pt-1">
                  <p className="font-bold font-display text-[10px] uppercase tracking-wider text-slate-600">Growth Partner Signature</p>
                  <div className="flex items-center gap-1">
                    {contract.internAgreed ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                        <CheckCircle className="w-3 h-3 text-emerald-600" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700">
                        <Clock className="w-3 h-3 text-amber-600" /> Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {contract.artisanAgreed && contract.internAgreed && (
              <div className="mt-8 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="font-bold font-display text-emerald-950 text-sm">Agreement is Fully Executed</h4>
                    <p className="text-xs text-emerald-700">Both parties have digitally confirmed the terms and deliverables.</p>
                  </div>
                </div>
                {contract.projectId ? (
                  <Link
                    to={`/projects/${contract.projectId}`}
                    className="btn-primary text-xs px-5 py-2.5 inline-flex items-center gap-2 whitespace-nowrap"
                  >
                    Open Partnership Workspace <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button
                    onClick={fetchContract}
                    className="btn-outline text-xs px-4 py-2"
                  >
                    Refresh Workspace Link
                  </button>
                )}
              </div>
            )}
          </section>

        </div>

        {/* Footer */}
        <div className="bg-emerald-950 text-emerald-100/70 py-4 px-8 text-[10px] text-center tracking-widest uppercase font-mono">
          Bharat Bazaar Platform-Facilitated Partnership Agreement • Document Ref: {contract.id}
        </div>
      </div>
    </div>
  );
}