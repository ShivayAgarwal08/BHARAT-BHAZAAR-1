import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Mic, MicOff, Sparkles, AlertCircle } from 'lucide-react';

export default function AddProduct() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  
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
    if (!voiceText.trim()) return;
    setAiLoading(true);
    setAiError('');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/products/generate`, { text: voiceText });
      setFormData({
        title: res.data.title,
        description: res.data.description,
        price: res.data.price,
        quantity: res.data.quantity,
        category: res.data.category,
      });
      // Clear voice text so they can see the generated form clearly
      setVoiceText('');
    } catch (err) {
      setAiError(err.response?.data?.error || 'We couldn\'t create the listing automatically. You can enter the details manually.');
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
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-text">
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h1>
        <p className="text-text-light mt-2">
          {isEditing ? 'Update your product details below.' : 'Tell us about your product or fill in the details manually.'}
        </p>
      </div>

      {!isEditing && (
        <div className="card p-6 mb-8 bg-orange-50/50 border-orange-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
              <Sparkles size={24} /> Step 1: Tell us about your product
            </h2>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="text-sm border border-orange-200 rounded-md px-3 py-1.5 bg-white text-text-light outline-none focus:border-primary"
            >
              <option value="hi-IN">Hindi</option>
              <option value="en-IN">English</option>
            </select>
          </div>
          
          <div className="mb-4">
            <textarea
              value={voiceText}
              onChange={(e) => setVoiceText(e.target.value)}
              className="w-full h-32 p-4 rounded-xl border border-orange-200 focus:outline-none focus:border-primary bg-white resize-none"
              placeholder="e.g. 'Main bamboo ki tokri banata hoon. Mere paas 20 pieces hain aur ek ki price 300 rupaye hai...'"
            />
          </div>
          
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <button
              type="button"
              onClick={toggleListening}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                isListening 
                  ? 'bg-red-500 text-white shadow-lg animate-pulse' 
                  : 'bg-white border-2 border-primary text-primary hover:bg-orange-50'
              }`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              {isListening ? 'Stop Recording' : '🎤 Speak'}
            </button>
            
            <button
              type="button"
              onClick={generateListing}
              disabled={!voiceText.trim() || aiLoading}
              className="btn-primary py-3 px-8 flex items-center gap-2 disabled:opacity-50"
            >
              {aiLoading ? (
                <>Creating Listing...</>
              ) : (
                <>
                  <Sparkles size={18} /> Let us create your listing
                </>
              )}
            </button>
          </div>
          
          {aiError && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-red-100 flex items-start gap-3 text-red-600">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm">{aiError}</p>
            </div>
          )}
        </div>
      )}

      <div className="card p-8">
        <h2 className="text-xl font-bold text-text mb-6 pb-4 border-b">
          {!isEditing ? 'Step 2: Review your details & Add a photo' : 'Product Details'}
        </h2>
        {error && <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Product Name</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field h-32 resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Price (₹)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="input-field"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Stock Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="input-field"
                required
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
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
              <label className="block text-sm font-medium text-text mb-1">
                Add a photo {isEditing ? '(Optional)' : '*'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="input-field py-1.5"
                required={!isEditing && !image}
              />
              {image && (
                <div className="mt-2 text-sm text-secondary font-medium">
                  {image.name} selected
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t mt-8">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-outline px-8"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 text-lg py-3"
              disabled={loading}
            >
              {loading ? 'Publishing...' : isEditing ? 'Save Changes' : 'Publish Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
