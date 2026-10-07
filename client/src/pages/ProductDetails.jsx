import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBag, MapPin, Tag, ArrowLeft, ShieldCheck, Truck, Plus, Minus, Eye, X, Sparkles } from 'lucide-react';
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
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-500 font-medium">Loading artisan product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Product Not Found</h2>
        <Link to="/marketplace" className="text-amber-800 font-semibold text-sm underline">
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
      setToastMessage('Please login to add items to your cart.');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    setAdding(true);
    const res = await addToCart(product.id, quantity);
    setAdding(false);

    if (res.success) {
      setToastMessage(`${quantity} item(s) added to cart!`);
      setTimeout(() => setToastMessage(''), 3000);
    } else {
      setToastMessage(res.error || 'Failed to add item');
      setTimeout(() => setToastMessage(''), 3000);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border border-gray-700 animate-bounce">
          <ShoppingBag className="w-5 h-5 text-amber-400" />
          <span className="font-medium text-xs">{toastMessage}</span>
        </div>
      )}

      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-amber-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </button>

      <div className="bg-white rounded-3xl p-6 sm:p-12 border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="w-full aspect-square bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden relative shadow-inner">
              {imageUrl ? (
                <img src={imageUrl} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-amber-50 text-amber-900 font-extrabold text-2xl">
                  {product.title}
                </div>
              )}
              <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-900 border border-amber-100 shadow-sm flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-700" />
                {product.category}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Handcrafted Product
                </span>
                {views > 0 && (
                  <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                    <Eye className="w-3.5 h-3.5 text-amber-700" />
                    {views} Views
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
                {product.title}
              </h1>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-amber-900">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md">
                  In Stock ({product.quantity} units)
                </span>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed border-t border-b border-gray-100 py-4">
                {product.description}
              </p>

              {/* Artisan Profile Card */}
              <div className="bg-amber-50/60 rounded-3xl p-6 border border-amber-100 space-y-4 shadow-sm relative overflow-hidden mt-8">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/40 rounded-full blur-2xl -mr-10 -mt-10"></div>
                
                <div className="relative z-10">
                  <h3 className="text-sm font-black text-amber-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Meet the Artisan
                  </h3>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 text-white font-black flex items-center justify-center text-xl shadow-lg shrink-0 border-2 border-white">
                      {product.artisanName ? product.artisanName[0] : 'B'}
                    </div>
                    <div className="space-y-1 flex-grow">
                      <h4 className="font-black text-gray-900 text-lg leading-tight">
                        {product.artisanName || 'Bharat Bazaar Artisan'}
                      </h4>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs font-semibold text-gray-600">
                        {product.location && (
                          <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                            <MapPin className="w-3.5 h-3.5 text-amber-600" />
                            {product.location}, {product.state}
                          </span>
                        )}
                        <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                          <Tag className="w-3.5 h-3.5 text-amber-600" />
                          {product.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed font-medium mt-2">
                        {product.artisanName 
                          ? `This product is handcrafted by ${product.artisanName}. Support local Indian craftsmanship.`
                          : 'Made by a Bharat Bazaar artisan.'}
                      </p>
                    </div>
                  </div>

                  {product.artisanName && (
                    <div className="mt-5 pt-5 border-t border-amber-200/50">
                      <button 
                        onClick={() => setShowArtisanModal(true)}
                        className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
                      >
                        View Full Profile
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quantity Selector & Action CTAs */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-700 uppercase">Quantity</span>
                <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-2 text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-bold text-gray-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                    disabled={quantity >= product.quantity}
                    className="p-2 text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.quantity <= 0 || adding}
                  className="py-3.5 px-6 bg-white border-2 border-amber-800 text-amber-900 font-bold rounded-xl text-xs hover:bg-amber-50 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-800" />
                  {adding ? 'Adding...' : 'Add to Cart'}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.quantity <= 0}
                  className="py-3.5 px-6 bg-amber-700 text-white font-bold rounded-xl text-xs hover:bg-amber-800 transition-colors shadow-lg shadow-amber-700/20 disabled:bg-gray-300"
                >
                  Buy Now
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 pt-2">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Authentic Indian Craft
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="w-4 h-4 text-amber-700" /> Direct Delivery from Artisan
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Artisan Profile Modal */}
      {showArtisanModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-stone-50 rounded-[2rem] w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-br from-amber-800 to-amber-900"></div>
            
            <button 
              onClick={() => setShowArtisanModal(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative z-10 px-8 pt-16 pb-8 text-center flex-grow overflow-y-auto">
              <div className="w-24 h-24 mx-auto bg-white rounded-full p-1.5 shadow-xl mb-4">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 text-white font-black flex items-center justify-center text-4xl border border-amber-100">
                  {product.artisanName[0]}
                </div>
              </div>
              
              <h2 className="text-3xl font-black text-gray-900 mb-1">{product.artisanName}</h2>
              <p className="text-amber-800 font-bold text-sm tracking-widest uppercase mb-4">{product.category} Artisan</p>

              <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                {product.location && (
                  <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm text-sm font-semibold text-gray-600">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    {product.location}, {product.state}
                  </span>
                )}
                <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm text-sm font-semibold text-gray-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Verified Maker
                </span>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-left relative overflow-hidden">
                <Sparkles className="absolute top-0 right-0 w-32 h-32 text-amber-50 opacity-50 -mr-10 -mt-10" />
                <h4 className="font-bold text-gray-900 mb-2 relative z-10">About the Maker</h4>
                <p className="text-gray-600 text-sm leading-relaxed relative z-10">
                  Every piece crafted by {product.artisanName} tells a story of heritage and dedication. Operating out of {product.location || 'India'}, they specialize in {product.category.toLowerCase()} and bring unique local craftsmanship to a national audience through Bharat Bazaar.
                </p>
              </div>
            </div>
            
            <div className="p-6 bg-white border-t border-gray-100 text-center shrink-0">
              <p className="text-xs font-semibold text-gray-500 mb-3">You are buying directly from a person, not an anonymous listing.</p>
              <button 
                onClick={() => setShowArtisanModal(false)}
                className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors shadow-lg"
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
