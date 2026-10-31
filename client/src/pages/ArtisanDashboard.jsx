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
  Globe,
  ArrowRight
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
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-[#0b634e] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 font-medium text-xs">Loading your business dashboard...</p>
      </div>
    );
  }

  if (error && !products.length && !contracts.length) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4 card p-8">
        <div className="w-12 h-12 bg-rose-50 text-rose-700 rounded-2xl flex items-center justify-center font-bold text-xl mx-auto">
          !
        </div>
        <h2 className="text-lg font-bold text-slate-900 font-display">Unable to load dashboard</h2>
        <p className="text-xs text-slate-500">{error}</p>
        <button
          onClick={fetchData}
          className="btn-primary text-xs py-2 px-5 inline-flex"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 card p-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            {t('myShop')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Welcome back, {user?.name}. Here is how your artisan enterprise is growing on Bharat Bazaar.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={toggleLanguage}
            className="btn-secondary py-2 px-3 text-xs"
            title="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            {lang === 'en' ? 'हिंदी' : 'English'}
          </button>
          <Link
            to="/growth-managers"
            className="btn-secondary py-2 px-3.5 text-xs text-[#06372b]"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#0b634e]" />
            Hire Growth Manager
          </Link>
          <Link
            to="/dashboard/add-product"
            className="btn-primary py-2 px-4 text-xs font-semibold shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('addNewProduct')}
          </Link>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card p-5 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Products</span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-slate-900 font-display">{analytics?.totalProducts || products.length}</span>
            <div className="w-10 h-10 rounded-xl bg-[#e3f6f0] text-[#0b634e] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500">Live products in marketplace</p>
        </div>

        <div className="card p-5 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Orders</span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-slate-900 font-display">{analytics?.totalOrders || orders.length}</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500">Customer orders received</p>
        </div>

        <div className="card p-5 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Revenue</span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-slate-900 font-display">
              ₹{(analytics?.totalRevenue || 0).toLocaleString('en-IN')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500">Direct sales generated</p>
        </div>

        <div className="card p-5 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Growth Partner</span>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900 truncate max-w-[140px] font-display">
              {analytics?.activeContract?.growthManagerName || 'None assigned'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          {analytics?.activeContract ? (
            <p className="text-[11px] text-emerald-700 font-semibold">
              {analytics.activeContract.tasksCompleted}/{analytics.activeContract.tasksTotal} Deliverables Done
            </p>
          ) : (
            <p className="text-[11px] text-slate-400">Hire a student partner</p>
          )}
        </div>
      </div>

      {/* Customer Orders Received */}
      <div className="card p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-[#f0ebe1] pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
            <ShoppingBag className="w-4 h-4 text-[#0b634e]" />
            Customer Orders Received ({orders.length})
          </h2>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs italic">
            No customer orders received yet. Once customers purchase your creations, they will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#f0ebe1] bg-[#faf8f5] text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-3.5 rounded-l-xl">Product</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Price & Qty</th>
                  <th className="p-3.5">Order Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 rounded-r-xl text-right">Update Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ebe1]">
                {orders.map((item) => (
                  <tr key={item.id} className="hover:bg-[#faf8f5]/60 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 font-display">{item.title}</td>
                    <td className="p-3.5 text-slate-600 font-medium">
                      {item.order?.customerName || item.order?.customer?.name || 'Customer'}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 font-display">
                      ₹{item.price.toLocaleString('en-IN')} (x{item.quantity})
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {new Date(item.order?.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#e3f6f0] text-[#06372b] border border-[#a7f3d0]">
                        {item.order?.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <select
                        value={item.order?.status || 'PENDING'}
                        onChange={(e) => handleUpdateOrderStatus(item.orderId, e.target.value)}
                        className="px-2.5 py-1 bg-white border border-[#ded6c9] rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#0b634e]/20 focus:border-[#0b634e]"
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
      <div className="card p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-[#f0ebe1] pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
            <FileText className="w-4 h-4 text-[#0b634e]" />
            Growth Contracts & Manager Partnerships ({contracts.length})
          </h2>
          <Link to="/growth-managers" className="text-xs text-[#0b634e] font-bold hover:underline">
            Browse Directory &rarr;
          </Link>
        </div>

        {contracts.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs italic">
            No active growth contracts yet. Click "Browse Directory" to partner with a student growth manager.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contracts.map((contract) => {
              const targetProjectId = contract.projectId || contract.project?.id;
              return (
                <div
                  key={contract.id}
                  className="p-5 border border-[#ded6c9] rounded-2xl bg-[#faf8f5] hover:bg-white hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-bold text-slate-900 font-display">{contract.title}</span>
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border ${
                        contract.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {contract.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Growth Partner: <span className="font-semibold text-slate-800">{contract.intern?.user?.name}</span>
                    </p>
                    <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                      <span>Tier: {contract.tier}</span>
                      <span>{contract.tasks?.filter((t) => t.isCompleted).length || 0} Deliverables Done</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#ded6c9]/60">
                    {targetProjectId && (
                      <Link
                        to={`/projects/${targetProjectId}`}
                        className="btn-primary flex-1 text-center py-2 px-3 text-xs font-semibold shadow-sm"
                      >
                        Open Workspace &rarr;
                      </Link>
                    )}
                    <Link
                      to={`/contracts/${contract.id}`}
                      state={{ projectId: targetProjectId }}
                      className="btn-secondary py-2 px-3 text-xs font-semibold text-center"
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
      <div className="card p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-[#f0ebe1] pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
            <Package className="w-4 h-4 text-[#0b634e]" />
            Digital Catalog Products ({products.length})
          </h2>
          <Link
            to="/dashboard/add-product"
            className="btn-primary py-1.5 px-3 text-xs font-semibold"
          >
            + Add Product
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs italic">
            You haven't added any products to your digital catalog yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {products.map((product) => (
              <div key={product.id} className="border border-[#ded6c9] rounded-2xl p-4 bg-white space-y-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <div className="w-full h-36 bg-[#f4efe6] rounded-xl overflow-hidden border border-[#ded6c9]">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl.startsWith('http') ? product.imageUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/${product.imageUrl.replace(/\\/g, '/').replace(/^\//, '')}`}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#f4efe6] text-[#0b634e] text-xs font-bold font-display">
                        {product.title}
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm truncate font-display">{product.title}</h3>
                  <div className="flex justify-between text-xs">
                    <span className="font-black text-slate-900 font-display">₹{product.price.toLocaleString('en-IN')}</span>
                    <span className="text-slate-500 font-medium">Stock: {product.quantity}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#f0ebe1] pt-3 text-xs">
                  <Link
                    to={`/dashboard/edit-product/${product.id}`}
                    className="text-[#0b634e] font-bold flex items-center gap-1 hover:underline"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-rose-600 font-medium flex items-center gap-1 hover:underline"
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
