import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, ShieldCheck, MapPin, Phone, User, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
        <Link to="/marketplace" className="text-amber-800 font-semibold underline">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!shippingAddress.trim() || !phone.trim() || !customerName.trim()) {
      setError('Please fill in all shipping details.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/orders`, {
        customerName,
        phone,
        shippingAddress,
      });

      // Clear local cart
      await clearCart();

      // Redirect to Order Confirmation page
      navigate(`/orders/${res.data.id}`);
    } catch (err) {
      console.error('Order creation error:', err);
      setError(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link to="/cart" className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-amber-800">
        <ArrowLeft className="w-4 h-4" />
        Back to Cart
      </Link>

      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Checkout & Delivery Details</h1>
        <p className="text-sm text-gray-500 mt-1">
          Complete your delivery details to place your artisan order directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Delivery Address Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <MapPin className="w-5 h-5 text-amber-700" />
            Shipping & Contact Information
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmitOrder} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="Enter recipient full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  required
                  placeholder="Enter contact phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Full Delivery Address
              </label>
              <textarea
                required
                rows={4}
                placeholder="House No., Street, Landmark, City, State, Pincode"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
              />
            </div>

            {/* Clear Payment Term Explanation */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-900 space-y-1">
              <span className="font-bold block">Payment Term Notice (MVP Settlement):</span>
              <p className="leading-relaxed text-amber-800">
                This order will be registered directly with the artisan. Payment settlement is completed upon order confirmation/delivery via Cash on Delivery or Direct Artisan Payment.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-amber-700 text-white font-bold rounded-xl hover:bg-amber-800 transition-colors shadow-lg shadow-amber-700/20 text-sm flex items-center justify-center gap-2 disabled:bg-gray-400"
            >
              {loading ? (
                <span>Processing Order...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Confirm & Place Order (₹{cartTotal.toLocaleString('en-IN')})
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Items Review */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6 h-fit">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-700" />
            Items in Order
          </h2>

          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 text-sm">
                <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                  {item.product?.imageUrl ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/${item.product.imageUrl}`}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-amber-50 text-amber-800 text-xs font-bold">
                      Craft
                    </div>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="font-bold text-gray-800 truncate text-xs">{item.product?.title}</h4>
                  <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                </div>
                <span className="font-extrabold text-amber-900 text-xs">
                  ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600 text-xs">
              <span>Subtotal</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gray-600 text-xs">
              <span>Shipping</span>
              <span className="text-emerald-600 font-semibold">FREE</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-50">
              <span>Total Payable</span>
              <span className="text-amber-900 font-extrabold">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="pt-2 text-xs text-gray-400 flex items-center gap-1.5 justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Direct Artisan Empowerment Purchase
          </div>
        </div>
      </div>
    </div>
  );
}
