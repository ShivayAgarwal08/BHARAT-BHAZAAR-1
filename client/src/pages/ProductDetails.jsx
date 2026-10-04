import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBag, MapPin, Tag, ArrowLeft, ShieldCheck, Truck, Plus, Minus, Eye } from 'lucide-react';
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
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/${product.imageUrl}`
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
              {product.artisanName && (
                <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-100/80 space-y-2">
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                    Meet the Artisan Creator
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-800 text-white font-bold flex items-center justify-center text-sm shadow">
                      {product.artisanName[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{product.artisanName}</h4>
                      {product.location && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-700" />
                          {product.location}, {product.state}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
    </div>
  );
}
