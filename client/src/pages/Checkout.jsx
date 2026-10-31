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
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4 card p-8">
        <h2 className="text-xl font-bold text-slate-900 font-display">Your cart is empty</h2>
        <p className="text-xs text-slate-500">Please add items from the artisan marketplace to proceed with checkout.</p>
        <Link to="/marketplace" className="btn-primary text-xs py-2 px-5 inline-flex">
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link to="/cart" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0b634e] transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Shopping Cart
      </Link>

      <div className="border-b border-[#f0ebe1] pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">Checkout & Delivery Details</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete your delivery information to place your artisan order directly with the makers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Delivery Address Form */}
        <div className="lg:col-span-2 card p-6 sm:p-8 space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-[#f0ebe1] pb-3 font-display">
            <MapPin className="w-5 h-5 text-[#0b634e]" />
            Shipping & Contact Information
          </h2>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-medium animate-in fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmitOrder} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Recipient Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Enter recipient full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Contact Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  placeholder="Enter contact phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Delivery Address *
              </label>
              <textarea
                required
                rows={4}
                placeholder="House No., Street, Landmark, City, State, Pincode"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="input-field resize-none text-xs sm:text-sm leading-relaxed"
              />
            </div>

            {/* Clear Payment Term Explanation */}
            <div className="card-cream border border-[#ded6c9] rounded-2xl p-4 text-xs text-slate-700 space-y-1">
              <span className="font-bold text-[#06372b] block font-display">Payment & Settlement Notice:</span>
              <p className="leading-relaxed text-slate-600">
                This order will be registered directly with the artisan. Settlement is confirmed upon fulfillment via Direct Payment or Cash on Delivery.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 disabled:bg-slate-300"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing Order...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm & Place Order (₹{cartTotal.toLocaleString('en-IN')})
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Items Review */}
        <div className="card p-6 space-y-5 h-fit border border-[#e8e2d8]">
          <h2 className="text-base font-bold text-slate-900 border-b border-[#f0ebe1] pb-3 flex items-center gap-2 font-display">
            <ShoppingBag className="w-4 h-4 text-[#0b634e]" />
            Order Summary
          </h2>

          <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1 scrollbar-none">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 text-xs">
                <div className="w-12 h-12 bg-[#f4efe6] rounded-xl overflow-hidden flex-shrink-0 border border-[#ded6c9]">
                  {item.product?.imageUrl ? (
                    <img
                      src={item.product.imageUrl.startsWith('http') ? item.product.imageUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/${item.product.imageUrl.replace(/\\/g, '/').replace(/^\//, '')}`}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#f4efe6] text-[#0b634e] text-[10px] font-bold">
                      Craft
                    </div>
                  )}
                </div>
                <div className="flex-grow min-w-0 space-y-0.5">
                  <h4 className="font-bold text-slate-800 truncate">{item.product?.title}</h4>
                  <p className="text-slate-500 text-[11px]">Qty: {item.quantity}</p>
                </div>
                <span className="font-extrabold text-slate-900 font-display">
                  ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#f0ebe1] pt-3 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Items Total</span>
              <span className="font-semibold text-slate-800">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee</span>
              <span className="text-emerald-700 font-bold">FREE</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-[#f0ebe1]">
              <span className="font-display">Total Payable</span>
              <span className="text-slate-900 font-black text-base font-display">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5 justify-center border-t border-[#f0ebe1]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified Direct Artisan Purchase
          </div>
        </div>
      </div>
    </div>
  );
}
