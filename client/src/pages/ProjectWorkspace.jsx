import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

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

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProjectAndMessages = async () => {
      try {
        const [projRes, msgRes] = await Promise.all([
          axios.get(`http://localhost:5001/api/projects/${id}`),
          axios.get(`http://localhost:5001/api/projects/${id}/messages`)
        ]);
        setProject(projRes.data);
        setMessages(msgRes.data);
      } catch (err) {
        console.error('Failed to load project', err);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndMessages();

    // Socket.IO setup
    socketRef.current = io('http://localhost:5001');
    
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
      const res = await axios.post(`http://localhost:5001/api/projects/${id}/messages`, {
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
      await axios.put(`http://localhost:5001/api/projects/${id}/complete`);
      setProject({ ...project, status: 'COMPLETED' });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to complete project');
    }
  };

  const handleRateIntern = async (e) => {
    e.preventDefault();
    setIsSubmittingRating(true);
    try {
      await axios.post(`http://localhost:5001/api/projects/${id}/rating`, {
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

  if (loading) return <div className="text-center py-12">Loading workspace...</div>;
  if (!project) return <div className="text-center py-12">Project not found</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 min-h-[calc(100vh-8rem)]">
      
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

      {/* Main Area: Chat */}
      <div className="md:w-2/3 flex flex-col card overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-bold text-text">Project Chat</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">
              No messages yet. Say hi!
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMine = msg.senderId === user.id;
              // Avoid duplicate key warnings since socket gives same message that might already be in state if we pushed it manually,
              // but we are pushing via socket, so it's fine. Wait, we rely on the socket callback to push to state.
              return (
                <div key={msg.id || idx} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isMine ? 'bg-primary text-white rounded-br-none' : 'bg-gray-200 text-text rounded-bl-none'
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
        
        <div className="p-4 border-t bg-white">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 input-field py-2"
              disabled={project.status === 'CANCELLED'}
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim() || project.status === 'CANCELLED'}
              className="btn-primary py-2 px-6 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
      
    </div>
  );
}
