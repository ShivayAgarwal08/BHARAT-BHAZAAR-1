import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  UserCheck,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles,
  Globe
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ArtisanDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, lang, toggleLanguage } = useLanguage();

  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [prodRes, reqRes, contractRes, orderRes, analyticsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/products/my/products`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/requests/my/requests`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/contracts/my`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/orders/artisan/my`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/analytics/artisan`),
      ]);

      setProducts(prodRes.data || []);
      setRequests(reqRes.data || []);
      setContracts(contractRes.data || []);
      setOrders(orderRes.data || []);
      setAnalytics(analyticsRes.data || null);
    } catch (err) {
      console.error('Failed to fetch artisan dashboard data', err);
      setError('Unable to load your business dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'ARTISAN') {
      navigate('/');
      return;
    }

    fetchData();
  }, [user, navigate]);

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product listing?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/products/${id}`);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      alert('Failed to delete product.');
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/orders/${orderId}/status`, {
        status,
      });

      // Update local state
      setOrders(
        orders.map((item) => (item.orderId === orderId ? { ...item, order: { ...item.order, status } } : item))
      );
    } catch (err) {
      alert('Failed to update order status.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-500 font-medium">Loading your business dashboard...</p>
      </div>
    );
  }

  if (error && !products.length && !contracts.length) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 bg-red-100 text-red-700 rounded-2xl flex items-center justify-center font-bold text-xl mx-auto">
          !
        </div>
        <h2 className="text-xl font-bold text-gray-900">Unable to load dashboard</h2>
        <p className="text-sm text-gray-500">{error}</p>
        <button
          onClick={fetchData}
          className="px-6 py-2.5 bg-amber-700 text-white font-bold rounded-xl text-sm hover:bg-amber-800 transition-colors shadow-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            {t('myShop')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Welcome back, {user?.name}. Here is how your business is growing on Bharat Bazaar.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={toggleLanguage}
            className="px-3 py-2.5 bg-gray-50 text-gray-700 border border-gray-200 font-bold rounded-xl text-xs hover:bg-gray-100 transition-colors flex items-center gap-1.5"
            title="Toggle Language"
          >
            <Globe className="w-4 h-4 text-gray-500" />
            {lang === 'en' ? 'हिंदी' : 'English'}
          </button>
          <Link
            to="/growth-managers"
            className="px-4 py-2.5 bg-amber-50 text-amber-900 border border-amber-200 font-bold rounded-xl text-xs hover:bg-amber-100 transition-colors flex items-center gap-1.5"
          >
            <UserCheck className="w-4 h-4 text-amber-800" />
            Hire Growth Manager
          </Link>
          <Link
            to="/dashboard/add-product"
            className="px-4 py-2.5 bg-amber-700 text-white font-bold rounded-xl text-xs hover:bg-amber-800 transition-colors shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            {t('addNewProduct')}
          </Link>
        </div>
      </div>

      {/* Analytics Overview Cards (UNDERSTAND & GROW) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Products</span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-extrabold text-gray-900">{analytics?.totalProducts || products.length}</span>
            <Package className="w-8 h-8 text-amber-700 bg-amber-50 p-1.5 rounded-xl" />
          </div>
          <p className="text-[11px] text-gray-500">Live products in marketplace</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Orders</span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-extrabold text-gray-900">{analytics?.totalOrders || orders.length}</span>
            <ShoppingBag className="w-8 h-8 text-emerald-700 bg-emerald-50 p-1.5 rounded-xl" />
          </div>
          <p className="text-[11px] text-gray-500">Received customer orders</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Revenue</span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-extrabold text-amber-900">
              ₹{(analytics?.totalRevenue || 0).toLocaleString('en-IN')}
            </span>
            <TrendingUp className="w-8 h-8 text-amber-800 bg-amber-50 p-1.5 rounded-xl" />
          </div>
          <p className="text-[11px] text-gray-500">Real sales from orders</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Growth Manager</span>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900 truncate">
              {analytics?.activeContract?.growthManagerName || 'No active contract'}
            </span>
            <UserCheck className="w-8 h-8 text-indigo-700 bg-indigo-50 p-1.5 rounded-xl flex-shrink-0" />
          </div>
          {analytics?.activeContract ? (
            <p className="text-[11px] text-emerald-600 font-semibold">
              {analytics.activeContract.tasksCompleted}/{analytics.activeContract.tasksTotal} Tasks Done
            </p>
          ) : (
            <p className="text-[11px] text-gray-400">Hire a student growth partner</p>
          )}
        </div>
      </div>

      {/* Customer Orders Received */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-700" />
            Customer Orders Received ({orders.length})
          </h2>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs italic">
            No customer orders received yet. Once customers purchase your products, they will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-3.5 rounded-tl-xl">Product</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Price & Qty</th>
                  <th className="p-3.5">Order Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 rounded-tr-xl text-right">Update Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-gray-800">{item.title}</td>
                    <td className="p-3.5 text-gray-600">
                      {item.order?.customerName || item.order?.customer?.name || 'Customer'}
                    </td>
                    <td className="p-3.5 font-bold text-amber-900">
                      ₹{item.price.toLocaleString('en-IN')} (x{item.quantity})
                    </td>
                    <td className="p-3.5 text-gray-500">
                      {new Date(item.order?.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                        {item.order?.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <select
                        value={item.order?.status || 'PENDING'}
                        onChange={(e) => handleUpdateOrderStatus(item.orderId, e.target.value)}
                        className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-amber-700"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active Growth Contracts */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-700" />
            Growth Contracts & Manager Agreements ({contracts.length})
          </h2>
          <Link to="/growth-managers" className="text-xs text-amber-800 font-bold hover:underline">
            Browse Growth Managers &rarr;
          </Link>
        </div>

        {contracts.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs italic">
            No active growth contracts yet. Click "Browse Growth Managers" to partner with a student manager.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contracts.map((contract) => {
              const targetProjectId = contract.projectId || contract.project?.id;
              return (
                <div
                  key={contract.id}
                  className="p-5 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-bold text-gray-900">{contract.title}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                        contract.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {contract.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Growth Partner: <span className="font-semibold text-gray-700">{contract.intern?.user?.name}</span>
                    </p>
                    <div className="flex justify-between text-[11px] text-gray-400 pt-1">
                      <span>Tier: {contract.tier}</span>
                      <span>{contract.tasks?.filter((t) => t.isCompleted).length || 0} Deliverables Done</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    {targetProjectId && (
                      <Link
                        to={`/projects/${targetProjectId}`}
                        className="flex-1 text-center py-2 px-3 bg-amber-700 text-white rounded-xl text-xs font-bold hover:bg-amber-800 transition-colors shadow-sm"
                      >
                        Open Workspace &rarr;
                      </Link>
                    )}
                    <Link
                      to={`/contracts/${contract.id}`}
                      state={{ projectId: targetProjectId }}
                      className="py-2 px-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors text-center"
                    >
                      Agreement
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Products Catalog Table */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-700" />
            Digital Catalog Products ({products.length})
          </h2>
          <Link
            to="/dashboard/add-product"
            className="px-3 py-1.5 bg-amber-700 text-white rounded-xl text-xs font-bold hover:bg-amber-800"
          >
            + Add Product
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs italic">
            You haven't added any products to your digital catalog yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="border border-gray-100 rounded-2xl p-4 bg-white space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-full h-36 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl.startsWith('http') ? product.imageUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/${product.imageUrl.replace(/\\/g, '/').replace(/^\//, '')}`}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-amber-50 text-amber-900 text-xs font-bold">
                        {product.title}
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm truncate">{product.title}</h3>
                  <div className="flex justify-between text-xs">
                    <span className="font-extrabold text-amber-900">₹{product.price.toLocaleString('en-IN')}</span>
                    <span className="text-gray-400">Qty: {product.quantity}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
                  <Link
                    to={`/dashboard/edit-product/${product.id}`}
                    className="text-amber-800 font-bold flex items-center gap-1 hover:underline"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-red-500 font-medium flex items-center gap-1 hover:underline"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
