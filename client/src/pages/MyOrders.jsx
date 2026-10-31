import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Package, Calendar, Clock, ChevronRight, ShoppingBag } from 'lucide-react';

const STATUS_COLORS = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  PROCESSING: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
  DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
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
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-500 font-medium">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <Package className="w-7 h-7 text-amber-700" />
            My Orders
          </h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage your artisan marketplace purchases</p>
        </div>

        <Link
          to="/marketplace"
          className="px-4 py-2 bg-amber-700 text-white font-semibold rounded-xl text-xs hover:bg-amber-800 transition-colors"
        >
          Browse Marketplace
        </Link>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium text-center">{error}</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center space-y-4">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-lg font-bold text-gray-800">No Orders Placed Yet</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            You haven't placed any orders yet. Discover unique handcrafted goods from local artisans.
          </p>
          <Link
            to="/marketplace"
            className="inline-block px-5 py-2.5 bg-amber-700 text-white font-semibold text-xs rounded-xl hover:bg-amber-800 transition-colors shadow"
          >
            Explore Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all block space-y-4 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-50 pb-4">
                <div className="space-y-1">
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">
                    Order #{order.id.substring(0, 8)}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
                      STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="text-base font-extrabold text-amber-900">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-amber-800 group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              {/* Order Items Snapshot */}
              <div className="flex items-center gap-4 overflow-x-auto py-1">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl text-xs flex-shrink-0">
                    <span className="font-bold text-gray-800">{item.title}</span>
                    <span className="text-gray-400">x{item.quantity}</span>
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
