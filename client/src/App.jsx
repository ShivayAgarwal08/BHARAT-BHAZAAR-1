import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import { ShoppingBag, Package, UserCheck, LogOut, Sparkles } from 'lucide-react';

import Home from './pages/Home';
import Login from './pages/Login';
import Marketplace from './pages/Marketplace';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import GrowthManagers from './pages/GrowthManagers';
import ContractDetails from './pages/ContractDetails';
import ArtisanDashboard from './pages/ArtisanDashboard';
import InternDashboard from './pages/InternDashboard';
import AddProduct from './pages/AddProduct';
import ProductDetails from './pages/ProductDetails';
import CreateRequest from './pages/CreateRequest';
import RequestDetails from './pages/RequestDetails';
import ProjectWorkspace from './pages/ProjectWorkspace';

function App() {
  const { user, logout, loading } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50/40">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 font-semibold text-sm">Loading Bharat Bazaar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50 text-gray-800 font-sans">
      {/* Header Bar */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-2xl bg-amber-800 text-white font-black flex items-center justify-center text-lg shadow-md group-hover:bg-amber-900 transition-colors">
                BB
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-gray-900 group-hover:text-amber-800 transition-colors">
                  Bharat Bazaar
                </span>
                <span className="text-[10px] text-amber-800 font-bold uppercase tracking-widest -mt-1">
                  Craft & Growth
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="flex items-center gap-2 sm:gap-6">
              <Link
                to="/marketplace"
                className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-amber-800 transition-colors px-3 py-2 rounded-xl hover:bg-amber-50/50"
              >
                Marketplace
              </Link>

              {user?.role === 'ARTISAN' && (
                <Link
                  to="/growth-managers"
                  className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-amber-800 transition-colors px-3 py-2 rounded-xl hover:bg-amber-50/50 flex items-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                  Growth Managers
                </Link>
              )}

              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-amber-800 transition-colors px-3 py-2 rounded-xl hover:bg-amber-50/50"
                  >
                    Dashboard
                  </Link>

                  {user.role === 'CUSTOMER' && (
                    <Link
                      to="/orders"
                      className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-amber-800 transition-colors px-3 py-2 rounded-xl hover:bg-amber-50/50 flex items-center gap-1"
                    >
                      <Package className="w-3.5 h-3.5 text-amber-700" />
                      Orders
                    </Link>
                  )}

                  {/* Cart Link with Badge */}
                  <Link
                    to="/cart"
                    className="relative p-2 text-gray-700 hover:text-amber-800 transition-colors rounded-xl hover:bg-amber-50/50"
                    title="Shopping Cart"
                  >
                    <ShoppingBag className="w-5 h-5 text-amber-800" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-amber-700 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow">
                        {itemCount}
                      </span>
                    )}
                  </Link>

                  <div className="flex items-center gap-3 pl-2 border-l border-gray-100">
                    <span className="text-xs font-bold text-gray-700 hidden md:inline">
                      Hi, {user.name}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-xl hover:bg-red-50"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/cart"
                    className="relative p-2 text-gray-700 hover:text-amber-800 transition-colors rounded-xl hover:bg-amber-50/50"
                  >
                    <ShoppingBag className="w-5 h-5 text-amber-800" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-amber-700 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/login"
                    className="px-4 py-2 bg-amber-800 text-white text-xs font-bold rounded-xl hover:bg-amber-900 transition-all shadow-sm"
                  >
                    Login / Register
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/growth-managers" element={<GrowthManagers />} />
          <Route path="/contracts/:id" element={<ContractDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route
            path="/dashboard"
            element={user?.role === 'INTERN' ? <InternDashboard /> : <ArtisanDashboard />}
          />
          <Route path="/dashboard/add-product" element={<AddProduct />} />
          <Route path="/dashboard/edit-product/:id" element={<AddProduct />} />
          <Route path="/dashboard/create-request" element={<CreateRequest />} />
          <Route path="/dashboard/requests/:id" element={<RequestDetails />} />
          <Route path="/projects/:id" element={<ProjectWorkspace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="text-xs font-semibold text-gray-500">
            &copy; 2026 Bharat Bazaar — Connecting Indian Artisans, Customers, and Student Growth Managers.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
