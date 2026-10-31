import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Package, ArrowLeft, MapPin, Phone, User, CheckCircle2, Clock, Truck, ShoppingBag, ShieldCheck } from 'lucide-react';

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
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-500 font-medium">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-red-600">{error || 'Order not found'}</h2>
        <Link to="/orders" className="text-amber-800 font-semibold text-sm underline">
          Return to My Orders
        </Link>
      </div>
    );
  }

  const currentStepIndex = TRACKING_STEPS.indexOf(order.status);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link to="/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-amber-800">
        <ArrowLeft className="w-4 h-4" />
        Back to My Orders
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
            Order Confirmation
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Order #{order.id.substring(0, 8)}
          </h1>
          <p className="text-xs text-gray-400">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-gray-400 block font-medium">Total Order Value</span>
          <span className="text-2xl font-extrabold text-amber-900">₹{order.totalAmount.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Tracking Timeline */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Truck className="w-5 h-5 text-amber-700" />
          Fulfillment Status & Delivery Tracking
        </h2>

        {order.status === 'CANCELLED' ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-semibold text-center border border-red-200">
            This order has been CANCELLED.
          </div>
        ) : (
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
            {TRACKING_STEPS.map((step, idx) => {
              const isPassed = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step} className="flex sm:flex-col items-center gap-3 sm:gap-2 flex-1 relative z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isPassed
                        ? 'bg-amber-700 text-white shadow-md ring-4 ring-amber-100'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>
                  <div className="text-left sm:text-center">
                    <span
                      className={`text-xs font-bold block ${
                        isCurrent ? 'text-amber-800' : isPassed ? 'text-gray-800' : 'text-gray-400'
                      }`}
                    >
                      {step}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] text-amber-600 font-medium">Current Status</span>
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
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-700" />
            Purchased Artisan Items ({order.items.length})
          </h2>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900 text-sm">{item.title}</h3>
                  {item.artisan?.user?.name && (
                    <p className="text-xs text-amber-800 font-medium">Artisan: {item.artisan.user.name}</p>
                  )}
                  <p className="text-xs text-gray-400">Quantity: {item.quantity} x ₹{item.price.toLocaleString('en-IN')}</p>
                </div>

                <span className="font-extrabold text-amber-900 text-base">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4 h-fit">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-700" />
            Delivery Recipient
          </h2>

          <div className="space-y-3 text-xs text-gray-600">
            <div className="flex items-center gap-2 text-gray-800 font-semibold">
              <User className="w-4 h-4 text-gray-400" />
              {order.customerName || order.customer?.name}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              {order.phone}
            </div>
            <div className="flex items-start gap-2 pt-1">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{order.shippingAddress}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-1">
            <span className="font-bold text-gray-700 block">Payment Settlement:</span>
            <p>Direct Artisan Settlement / Cash on Delivery on fulfillment.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
