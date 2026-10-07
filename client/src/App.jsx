import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import { ShoppingBag, Package, UserCheck, LogOut, UserPlus, LogIn } from 'lucide-react';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
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
import HowItWorksArtisan from './pages/HowItWorksArtisan';
import HowItWorksGrowthManager from './pages/HowItWorksGrowthManager';

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
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center space-y-6 max-w-sm px-6">
          <div className="w-20 h-20 bg-amber-800 text-white rounded-3xl flex items-center justify-center text-4xl font-black mx-auto shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-900 to-amber-700"></div>
            <span className="relative z-10">BB</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-gray-900">Bharat Bazaar</h1>
            <p className="text-sm font-medium text-amber-800 uppercase tracking-widest">
              Local craft. Limitless possibilities.
            </p>
          </div>
          <div className="pt-4 flex justify-center">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-700 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-amber-700 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-amber-700 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
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
            <nav className="flex items-center gap-2 sm:gap-5">
              {!user && (
                <>
                  <Link
                    to="/marketplace"
                    className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-amber-800 transition-colors px-3 py-2 rounded-xl hover:bg-amber-50/50"
                  >
                    Marketplace
                  </Link>
                  <Link
                    to="/how-it-works/artisan"
                    className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-amber-800 transition-colors px-3 py-2 rounded-xl hover:bg-amber-50/50 hidden md:inline"
                  >
                    For Artisans
                  </Link>
                </>
              )}

              {user?.role === 'CUSTOMER' && (
                <>
                  <Link
                    to="/marketplace"
                    className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-amber-800 transition-colors px-3 py-2 rounded-xl hover:bg-amber-50/50"
                  >
                    Shop
                  </Link>
                </>
              )}

              {user?.role === 'ARTISAN' && (
                <>
                  <Link
                    to="/dashboard"
                    className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-amber-800 transition-colors px-3 py-2 rounded-xl hover:bg-amber-50/50"
                  >
                    My Shop
                  </Link>
                  <Link
                    to="/growth-managers"
                    className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-amber-800 transition-colors px-3 py-2 rounded-xl hover:bg-amber-50/50 flex items-center gap-1"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                    Find a Manager
                  </Link>
                </>
              )}

              {user?.role === 'INTERN' && (
                <>
                  <Link
                    to="/dashboard"
                    className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-amber-800 transition-colors px-3 py-2 rounded-xl hover:bg-amber-50/50"
                  >
                    Workspace
                  </Link>
                  <Link
                    to="/marketplace"
                    className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-amber-800 transition-colors px-3 py-2 rounded-xl hover:bg-amber-50/50"
                  >
                    Marketplace
                  </Link>
                </>
              )}

              {user ? (
                <>
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
                  {user.role === 'CUSTOMER' && (
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
                  )}

                  <div className="flex items-center gap-3 pl-2 border-l border-gray-100">
                    <span className="text-xs font-bold text-gray-700 hidden md:inline">
                      Account: {user.name}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-xl hover:bg-red-50"
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3">
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
                    className="text-xs font-bold text-gray-700 hover:text-amber-800 px-3 py-2 rounded-xl hover:bg-amber-50/50 flex items-center gap-1"
                  >
                    <LogIn className="w-3.5 h-3.5 text-amber-700" />
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-amber-800 text-white text-xs font-bold rounded-xl hover:bg-amber-900 transition-all shadow-sm flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Create Account
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
          <Route path="/how-it-works/artisan" element={<HowItWorksArtisan />} />
          <Route path="/how-it-works/growth-manager" element={<HowItWorksGrowthManager />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/growth-managers" element={<GrowthManagers />} />
          <Route path="/contracts/:id" element={<ContractDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
