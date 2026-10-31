import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Package, ChevronRight, ShoppingBag, ArrowLeft } from 'lucide-react';

const STATUS_COLORS = {
  PENDING: 'bg-amber-50 text-amber-800 border-amber-200/80',
  CONFIRMED: 'bg-sky-50 text-sky-800 border-sky-200/80',
  PROCESSING: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
  SHIPPED: 'bg-purple-50 text-purple-800 border-purple-200/80',
  DELIVERED: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  CANCELLED: 'bg-rose-50 text-rose-800 border-rose-200/80',
};

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/orders/my`);
      setOrders(res.data);
    } catch (err) {
      console.error('Fetch my orders error:', err);
      setError('Failed to load order history.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-[#0b634e] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 font-medium text-xs">Loading your artisan orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-[#f0ebe1] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5 font-display">
            <Package className="w-6 h-6 text-[#0b634e]" />
            My Orders
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Track and manage your handcrafted artisan purchases</p>
        </div>

        <Link
          to="/marketplace"
          className="btn-primary py-2 px-4 text-xs font-semibold self-start sm:self-auto"
        >
          Browse Marketplace
        </Link>
      </div>

      {error ? (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl text-xs font-medium text-center border border-rose-200">{error}</div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-[#f4efe6] text-slate-400 rounded-3xl flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8 text-[#0b634e]" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-display">No Orders Placed Yet</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
            You haven't placed any orders yet. Discover unique handcrafted creations directly from local artisans across India.
          </p>
          <Link to="/marketplace" className="btn-primary text-xs py-2.5 px-5 inline-flex">
            Start Exploring
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="card card-hover p-5 sm:p-6 block space-y-4 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f0ebe1] pb-3 text-xs">
                <div>
                  <span className="font-extrabold text-slate-900 text-sm font-display block">
                    Order #{order.id.substring(0, 8)}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${
                      STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {order.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0b634e] transition-colors" />
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-2.5 bg-[#faf8f5] p-2 rounded-xl border border-[#ded6c9]/60">
                    <span className="w-5 h-5 rounded-md bg-[#e3f6f0] text-[#06372b] font-bold flex items-center justify-center text-[10px]">
                      {item.quantity}x
                    </span>
                    <span className="font-medium truncate text-slate-800">{item.title}</span>
                    <span className="text-slate-500 ml-auto font-display font-semibold">₹{item.price.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              {/* Summary Bottom */}
              <div className="flex items-center justify-between pt-2 text-xs border-t border-[#f0ebe1]">
                <span className="text-slate-500 font-medium">
                  {order.items?.length || 0} {(order.items?.length === 1) ? 'item' : 'items'}
                </span>
                <div>
                  <span className="text-slate-400 mr-2 font-medium">Total:</span>
                  <span className="text-base font-black text-slate-900 font-display">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
