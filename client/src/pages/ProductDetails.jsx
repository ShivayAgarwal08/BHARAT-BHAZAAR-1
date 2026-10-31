import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBag, MapPin, Tag, ArrowLeft, ShieldCheck, Truck, Plus, Minus, Eye, X, Sparkles, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [views, setViews] = useState(0);
  const [showArtisanModal, setShowArtisanModal] = useState(false);

  useEffect(() => {
    const fetchProductAndRecordView = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/products/${id}`);
        setProduct(res.data);

        // Record real view event asynchronously
        axios
          .post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/analytics/products/${id}/view`)
          .then((vRes) => setViews(vRes.data.views))
          .catch(() => {});
      } catch (err) {
        console.error('Failed to fetch product', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndRecordView();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-[#0b634e] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 font-medium text-xs">Loading handcrafted product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4 card p-10">
        <h2 className="text-xl font-bold text-slate-800 font-display">Product Not Found</h2>
        <p className="text-xs text-slate-500">The product you are looking for may have been removed or is temporarily unavailable.</p>
        <Link to="/marketplace" className="btn-primary text-xs py-2 px-5 inline-flex">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const imageUrl = product.imageUrl
    ? product.imageUrl.startsWith('http') 
      ? product.imageUrl 
      : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/${product.imageUrl.replace(/\\/g, '/').replace(/^\//, '')}`
    : null;

  const handleAddToCart = async () => {
    if (!user) {
      setToastMessage('Please sign in to add items to your cart.');
      setTimeout(() => setToastMessage(''), 3500);
      return;
    }

    setAdding(true);
    const res = await addToCart(product.id, quantity);
    setAdding(false);

    if (res.success) {
      setToastMessage(`${quantity} item(s) added to your cart!`);
      setTimeout(() => setToastMessage(''), 3500);
    } else {
      setToastMessage(res.error || 'Failed to add item');
      setTimeout(() => setToastMessage(''), 3500);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    await addToCart(product.id, quantity);
    navigate('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-[#06372b] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-emerald-500/30 animate-in fade-in slide-in-from-top-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Back Link */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0b634e] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Marketplace
      </button>

      <div className="card p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Gallery / Product Visual */}
          <div className="space-y-4">
            <div className="w-full aspect-square bg-[#f4efe6] rounded-2xl border border-[#ded6c9] overflow-hidden relative shadow-inner">
              {imageUrl ? (
                <img src={imageUrl} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#f4efe6] text-[#0b634e] font-bold text-2xl font-display px-6 text-center">
                  {product.title}
                </div>
              )}
              <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-[#06372b] border border-[#e8e2d8] shadow-sm flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#0b634e]" />
                {product.category}
              </span>
            </div>
          </div>

          {/* Details Column */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Handcrafted Product
                </span>
                {views > 0 && (
                  <span className="flex items-center gap-1 text-xs text-slate-500 font-semibold bg-[#faf8f5] px-2.5 py-1 rounded-full border border-[#e8e2d8]">
                    <Eye className="w-3.5 h-3.5 text-[#0b634e]" />
                    {views} Views
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight font-display">
                {product.title}
              </h1>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900 font-display">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                  product.quantity > 0 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {product.quantity > 0 ? `In Stock (${product.quantity} units)` : 'Out of Stock'}
                </span>
              </div>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-b border-[#f0ebe1] py-4">
                {product.description}
              </p>

              {/* Artisan Profile Card */}
              <div className="card-cream p-5 rounded-2xl border border-[#ded6c9] space-y-3.5 relative overflow-hidden mt-6">
                <div className="flex items-center justify-between border-b border-[#e8decb] pb-3">
                  <h3 className="text-xs font-bold text-[#06372b] uppercase tracking-wider flex items-center gap-1.5 font-display">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Meet the Artisan
                  </h3>
                  {product.artisanName && (
                    <button
                      onClick={() => setShowArtisanModal(true)}
                      className="text-xs font-bold text-[#0b634e] hover:underline"
                    >
                      View Profile
                    </button>
                  )}
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#06372b] to-[#0b634e] text-white font-black flex items-center justify-center text-lg shadow-md shrink-0 border border-white">
                    {product.artisanName ? product.artisanName[0] : 'B'}
                  </div>
                  <div className="space-y-1 flex-grow">
                    <h4 className="font-bold text-slate-900 text-base leading-tight font-display">
                      {product.artisanName || 'Bharat Bazaar Artisan'}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
                      {product.location && (
                        <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-[#e8e2d8] text-[11px]">
                          <MapPin className="w-3 h-3 text-amber-600" />
                          {product.location}, {product.state}
                        </span>
                      )}
                      <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-[#e8e2d8] text-[11px]">
                        <Tag className="w-3 h-3 text-[#0b634e]" />
                        {product.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity Selector & Action CTAs */}
            <div className="space-y-4 pt-4 border-t border-[#f0ebe1]">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quantity</span>
                <div className="flex items-center border border-[#ded6c9] rounded-xl bg-white overflow-hidden shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-2 text-slate-600 hover:bg-[#faf8f5] disabled:opacity-40 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-bold text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                    disabled={quantity >= product.quantity}
                    className="p-2 text-slate-600 hover:bg-[#faf8f5] disabled:opacity-40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <button
                  onClick={handleAddToCart}
                  disabled={product.quantity <= 0 || adding}
                  className="btn-outline py-3 px-5 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4 text-[#0b634e]" />
                  {adding ? 'Adding...' : 'Add to Cart'}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.quantity <= 0}
                  className="btn-primary py-3 px-5 text-xs font-bold flex items-center justify-center gap-2"
                >
                  Buy Now Directly
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-[#f0ebe1]">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Authentic Indian Craft
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Truck className="w-4 h-4 text-[#0b634e]" /> Direct Artisan Fulfillment
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Artisan Profile Modal */}
      {showArtisanModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-[#faf8f5] rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] border border-[#e8e2d8]">
            {/* Modal Header */}
            <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-br from-[#06372b] to-[#0b634e]"></div>
            
            <button 
              onClick={() => setShowArtisanModal(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors backdrop-blur-md"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative z-10 px-6 sm:px-8 pt-12 pb-6 text-center flex-grow overflow-y-auto">
              <div className="w-20 h-20 mx-auto bg-white rounded-full p-1.5 shadow-xl mb-3">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#06372b] to-[#0b634e] text-white font-black flex items-center justify-center text-3xl font-display">
                  {product.artisanName ? product.artisanName[0] : 'B'}
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-0.5 font-display">{product.artisanName}</h2>
              <p className="text-[#0b634e] font-bold text-xs uppercase tracking-wider mb-4">{product.category} Artisan</p>

              <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                {product.location && (
                  <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-[#ded6c9] text-xs font-semibold text-slate-700 shadow-sm">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    {product.location}, {product.state}
                  </span>
                )}
                <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-[#ded6c9] text-xs font-semibold text-slate-700 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Maker
                </span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#ded6c9] shadow-sm text-left relative overflow-hidden">
                <h4 className="font-bold text-slate-900 text-sm mb-1.5 font-display">About the Maker</h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Every piece crafted by {product.artisanName} represents generations of regional cultural heritage. Operating out of {product.location || 'India'}, they specialize in authentic {product.category.toLowerCase()} and bring unique local craftsmanship to customers nationwide through Bharat Bazaar.
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-white border-t border-[#f0ebe1] text-center shrink-0">
              <button 
                onClick={() => setShowArtisanModal(false)}
                className="btn-primary w-full py-2.5 text-xs font-bold"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
