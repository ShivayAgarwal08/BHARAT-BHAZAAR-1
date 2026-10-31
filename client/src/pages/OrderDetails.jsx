import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Package, ArrowLeft, MapPin, Phone, User, CheckCircle2, Truck, ShoppingBag, ShieldCheck } from 'lucide-react';

const TRACKING_STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error('Fetch order details error:', err);
      setError(err.response?.data?.error || 'Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-[#0b634e] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 font-medium text-xs">Loading order fulfillment details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4 card p-8">
        <h2 className="text-xl font-bold text-rose-600 font-display">{error || 'Order not found'}</h2>
        <Link to="/orders" className="btn-primary text-xs py-2 px-5 inline-flex">
          Return to My Orders
        </Link>
      </div>
    );
  }

  const currentStepIndex = TRACKING_STEPS.indexOf(order.status);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0b634e] transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to My Orders
      </Link>

      {/* Header */}
      <div className="card p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-[#0b634e] uppercase tracking-wider block">
            Order Confirmation
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            Order #{order.id.substring(0, 8)}
          </h1>
          <p className="text-xs text-slate-500">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Order Value</span>
          <span className="text-2xl font-black text-slate-900 font-display">₹{order.totalAmount.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Tracking Timeline */}
      <div className="card p-6 sm:p-8 space-y-6">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
          <Truck className="w-5 h-5 text-[#0b634e]" />
          Fulfillment Status & Delivery Tracking
        </h2>

        {order.status === 'CANCELLED' ? (
          <div className="bg-rose-50 text-rose-700 p-4 rounded-xl text-xs font-semibold text-center border border-rose-200">
            This order has been CANCELLED.
          </div>
        ) : (
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
            {TRACKING_STEPS.map((step, idx) => {
              const isPassed = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step} className="flex sm:flex-col items-center gap-3 sm:gap-2 flex-1 relative z-10 w-full sm:w-auto">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shrink-0 ${
                      isPassed
                        ? 'bg-[#0b634e] text-white shadow-md ring-4 ring-[#e3f6f0]'
                        : 'bg-[#faf8f5] text-slate-400 border border-[#ded6c9]'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>
                  <div className="text-left sm:text-center">
                    <span
                      className={`text-xs font-bold block ${
                        isCurrent ? 'text-[#06372b]' : isPassed ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {step}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] text-[#0b634e] font-semibold">Current State</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid: Delivery Info + Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Purchased Items */}
        <div className="lg:col-span-2 card p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-[#f0ebe1] pb-3 flex items-center gap-2 font-display">
            <ShoppingBag className="w-4 h-4 text-[#0b634e]" />
            Purchased Artisan Items ({order.items.length})
          </h2>

          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-[#faf8f5] rounded-xl border border-[#ded6c9]/60"
              >
                <div className="space-y-0.5">
                  <h3 className="font-bold text-slate-900 text-sm font-display">{item.title}</h3>
                  {item.artisan?.user?.name && (
                    <p className="text-xs text-[#0b634e] font-medium">Artisan: {item.artisan.user.name}</p>
                  )}
                  <p className="text-xs text-slate-500">Quantity: {item.quantity} x ₹{item.price.toLocaleString('en-IN')}</p>
                </div>

                <span className="font-black text-slate-900 text-base font-display">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="card p-6 space-y-4 h-fit border border-[#e8e2d8]">
          <h2 className="text-base font-bold text-slate-900 border-b border-[#f0ebe1] pb-3 flex items-center gap-2 font-display">
            <MapPin className="w-4 h-4 text-[#0b634e]" />
            Delivery Recipient
          </h2>

          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <User className="w-4 h-4 text-slate-400" />
              {order.customerName || order.customer?.name}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              {order.phone}
            </div>
            <div className="flex items-start gap-2 pt-1">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{order.shippingAddress}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#f0ebe1] text-xs text-slate-500 space-y-1">
            <span className="font-bold text-slate-700 block font-display">Payment & Settlement:</span>
            <p className="text-[11px] leading-relaxed">Direct Artisan Settlement / Cash on Delivery on fulfillment.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
