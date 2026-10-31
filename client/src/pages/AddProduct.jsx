import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Mic, MicOff, Sparkles, AlertCircle, ArrowLeft, Upload, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AddProduct() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    quantity: '',
    category: 'Handicrafts',
  });
  
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Voice & AI States
  const [voiceText, setVoiceText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [language, setLanguage] = useState('hi-IN');
  const [aiError, setAiError] = useState('');
  const [aiProvider, setAiProvider] = useState('');
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Setup Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setVoiceText((prev) => prev + transcriptPart + ' ');
          } else {
            currentTranscript += transcriptPart;
          }
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    if (isEditing) {
      const fetchProduct = async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/products/${id}`);
          setFormData({
            title: res.data.title,
            description: res.data.description,
            price: res.data.price,
            quantity: res.data.quantity,
            category: res.data.category,
          });
        } catch (err) {
          setError('Failed to fetch product details for editing.');
        }
      };
      fetchProduct();
    }
  }, [id, isEditing, language]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (!recognitionRef.current) {
        alert("Voice input isn't supported in this browser. You can type your product details instead.");
        return;
      }
      setVoiceText('');
      recognitionRef.current.lang = language;
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const generateListing = async () => {
    if (!voiceText.trim() || aiLoading) return; // prevent double-submit
    setAiLoading(true);
    setAiError('');
    setAiProvider('');
    const originalVoiceText = voiceText; // preserve for recovery on error
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/products/generate`,
        { text: voiceText },
        { timeout: 45000 } // 45 s client-side timeout
      );
      setFormData({
        title: res.data.title,
        description: res.data.description,
        price: res.data.price,
        quantity: res.data.quantity,
        category: res.data.category,
      });
      if (res.data.provider) {
        setAiProvider(res.data.provider);
      }
      // Clear voice text so they can see the generated form clearly
      setVoiceText('');
    } catch (err) {
      // Restore voice text so the user does not lose their input
      setVoiceText(originalVoiceText);
      setAiProvider('');
      if (err.code === 'ECONNABORTED' || err.code === 'ERR_CANCELED') {
        setAiError('The AI took too long to respond. Please try again, or enter the details manually below.');
      } else if (err.response?.data?.code === 'GENERATION_IN_PROGRESS') {
        setAiError('A listing is already being generated. Please wait for it to complete.');
      } else if (err.response?.data?.code === 'AI_DAILY_QUOTA_EXHAUSTED') {
        setAiError('AI listing generation has reached its daily usage quota. You can enter your product details manually below or try again later.');
      } else if (err.response?.data?.code === 'AI_ALL_PROVIDERS_UNAVAILABLE') {
        setAiError(err.response?.data?.error || 'AI listing generation is currently unavailable across all providers. You can enter your product details manually below or try again later.');
      } else if (err.response?.status === 429 || err.response?.data?.code === 'AI_RATE_LIMITED') {
        setAiError('AI service is busy right now. Please wait 30 seconds and try again.');
      } else {
        setAiError(err.response?.data?.error || "We couldn't create the listing automatically. You can enter the details manually below.");
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('quantity', formData.quantity);
    data.append('category', formData.category);
    if (image) {
      data.append('image', image);
    }

    try {
      if (isEditing) {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/products/${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/products`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while saving the product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button & Title */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0b634e] mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
          {isEditing ? 'Edit Product Listing' : 'Publish New Artisan Craft'}
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm mt-1.5">
          {isEditing 
            ? 'Update the pricing, stock, description, or image for this listing.' 
            : 'Describe your item using voice or text in Hindi or English, and our assistant will structure your marketplace listing.'}
        </p>
      </div>

      {/* Step 1: AI Assistant Section */}
      {!isEditing && (
        <div className="card-cream p-6 sm:p-8 rounded-3xl border border-[#ded6c9] space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#e8decb] pb-4">
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 text-[#06372b] font-display">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
              Step 1: Tell us about your product (Voice or Text)
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Language:</span>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="text-xs font-bold border border-[#ded6c9] rounded-xl px-3 py-1.5 bg-white text-slate-800 outline-none focus:border-[#0b634e]"
              >
                <option value="hi-IN">हिंदी (Hindi)</option>
                <option value="en-IN">English</option>
              </select>
            </div>
          </div>
          
          <div>
            <textarea
              value={voiceText}
              onChange={(e) => setVoiceText(e.target.value)}
              className="w-full h-32 p-4 rounded-2xl border border-[#ded6c9] focus:outline-none focus:ring-2 focus:ring-[#0b634e]/20 focus:border-[#0b634e] bg-white text-sm text-slate-800 placeholder-slate-400 resize-none shadow-inner"
              placeholder="e.g. 'Main bamboo ki tokri banata hoon. Mere paas 20 pieces hain aur ek ki price 300 rupaye hai...'"
            />
          </div>
          
          <div className="flex flex-wrap gap-3.5 items-center justify-between pt-1">
            <button
              type="button"
              onClick={toggleListening}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
                isListening 
                  ? 'bg-rose-600 text-white shadow-rose-600/30 animate-pulse' 
                  : 'bg-white border border-[#ded6c9] text-slate-700 hover:bg-[#faf8f5]'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-rose-600" />}
              {isListening ? 'Stop Recording' : 'Start Speech Input'}
            </button>
            
            <button
              type="button"
              onClick={generateListing}
              disabled={!voiceText.trim() || aiLoading}
              className="btn-primary py-2.5 px-6 text-xs font-bold shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {aiLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating listing (with fallback)&hellip;
                </span>
              ) : (
                <><Sparkles className="w-4 h-4 text-amber-300" /> Let us create your listing</>
              )}
            </button>
          </div>
          
          {aiProvider && (
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-emerald-800 text-xs font-semibold animate-in fade-in">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Listing generated successfully via {aiProvider.toUpperCase()}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200/60">
                Multi-Provider AI Active
              </span>
            </div>
          )}

          {aiError && (
            <div className="p-4 bg-white rounded-2xl border border-rose-200 flex items-start gap-3 text-rose-700 shadow-sm animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
              <p className="text-xs leading-relaxed font-medium">{aiError}</p>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Form Review Section */}
      <div className="card p-6 sm:p-10 space-y-6">
        <div className="border-b border-[#f0ebe1] pb-4">
          <h2 className="text-lg font-bold text-slate-900 font-display">
            {!isEditing ? 'Step 2: Review your details & Add a photo' : 'Product Details'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">Review the details generated above or enter them manually before publishing.</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t('titleLabel')} *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field font-medium"
              placeholder="e.g. Handwoven Pashmina Shawl with Floral Embroidery"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field h-32 resize-none text-xs sm:text-sm leading-relaxed"
              placeholder="Describe the materials, dimensions, traditional technique, and care instructions..."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Price (₹ INR) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="input-field font-semibold"
                placeholder="450"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="input-field font-semibold"
                placeholder="10"
                required
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field font-medium bg-white"
                required
              >
                <option value="Handicrafts">Handicrafts</option>
                <option value="Textiles">Textiles</option>
                <option value="Jewelry">Jewelry</option>
                <option value="Pottery">Pottery</option>
                <option value="Art">Art</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Product Photo {isEditing ? '(Optional)' : '*'}
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="input-field py-2 text-xs"
                  required={!isEditing && !image}
                />
              </div>
              {image && (
                <div className="mt-2 text-xs text-[#0b634e] font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  {image.name} selected
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3.5 pt-6 border-t border-[#f0ebe1] mt-8">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary px-6 py-2.5 text-xs font-bold"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 py-3 text-xs sm:text-sm font-bold shadow-md"
              disabled={loading}
            >
              {loading ? 'Publishing...' : isEditing ? 'Save Changes' : 'Publish Product to Marketplace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
