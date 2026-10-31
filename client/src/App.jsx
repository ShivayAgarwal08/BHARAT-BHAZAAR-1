import { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import { ShoppingBag, Package, UserCheck, LogOut, UserPlus, LogIn, Menu, X, Sparkles, Heart } from 'lucide-react';

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
import AboutUs from './pages/AboutUs';

function App() {
  const { user, logout, loading } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <div className="text-center space-y-6 max-w-sm px-6">
          <div className="w-16 h-16 bg-[#0b634e] text-white rounded-2xl flex items-center justify-center text-2xl font-black mx-auto shadow-xl shadow-[#0b634e]/20 relative overflow-hidden font-display">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#06372b] to-[#0e7b62]"></div>
            <span className="relative z-10">BB</span>
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Bharat Bazaar</h1>
            <p className="text-xs font-semibold text-[#0b634e] uppercase tracking-widest">
              Local craft • Limitless possibilities
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#0b634e] animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-[#0b634e] animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-[#0b634e] animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-slate-800 font-sans selection:bg-[#e3f6f0] selection:text-[#06372b]">
      {/* Top Banner Accent */}
      <div className="bg-[#06372b] text-emerald-100 text-[11px] font-medium py-1.5 px-4 text-center border-b border-[#0b634e]/40 hidden sm:block">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Directly empowering 1,200+ Indian rural artisans & university student growth partners
        </span>
      </div>

      {/* Main Header / Navigation */}
      <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-[#e8e2d8] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group" onClick={() => setMobileMenuOpen(false)}>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#06372b] to-[#0b634e] text-white font-black flex items-center justify-center text-lg shadow-md shadow-[#0b634e]/15 group-hover:scale-[1.02] transition-transform font-display relative">
                <span>BB</span>
                <span className="w-2 h-2 rounded-full bg-amber-400 absolute -bottom-0.5 -right-0.5 border-2 border-white"></span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-[#0b634e] transition-colors font-display">
                  Bharat Bazaar
                </span>
                <span className="text-[10px] text-[#0b634e] font-bold uppercase tracking-wider -mt-0.5">
                  Artisans & Growth
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {!user && (
                <>
                  <Link
                    to="/marketplace"
                    className={`text-sm font-semibold px-3.5 py-2 rounded-xl transition-all ${
                      isActive('/marketplace')
                        ? 'bg-[#e3f6f0] text-[#06372b]'
                        : 'text-slate-700 hover:text-[#0b634e] hover:bg-[#faf6ef]'
                    }`}
                  >
                    Marketplace
                  </Link>
                  <Link
                    to="/growth-managers"
                    className={`text-sm font-semibold px-3.5 py-2 rounded-xl transition-all ${
                      isActive('/growth-managers')
                        ? 'bg-[#e3f6f0] text-[#06372b]'
                        : 'text-slate-700 hover:text-[#0b634e] hover:bg-[#faf6ef]'
                    }`}
                  >
                    Growth Managers
                  </Link>
                  <Link
                    to="/about"
                    className={`text-sm font-semibold px-3.5 py-2 rounded-xl transition-all ${
                      isActive('/about')
                        ? 'bg-[#e3f6f0] text-[#06372b]'
                        : 'text-slate-700 hover:text-[#0b634e] hover:bg-[#faf6ef]'
                    }`}
                  >
                    About Us
                  </Link>
                </>
              )}

              {user?.role === 'CUSTOMER' && (
                <>
                  <Link
                    to="/marketplace"
                    className={`text-sm font-semibold px-3.5 py-2 rounded-xl transition-all ${
                      isActive('/marketplace')
                        ? 'bg-[#e3f6f0] text-[#06372b]'
                        : 'text-slate-700 hover:text-[#0b634e] hover:bg-[#faf6ef]'
                    }`}
                  >
                    Explore Shop
                  </Link>
                  <Link
                    to="/orders"
                    className={`text-sm font-semibold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                      isActive('/orders')
                        ? 'bg-[#e3f6f0] text-[#06372b]'
                        : 'text-slate-700 hover:text-[#0b634e] hover:bg-[#faf6ef]'
                    }`}
                  >
                    <Package className="w-4 h-4 text-[#0b634e]" />
                    My Orders
                  </Link>
                </>
              )}

              {user?.role === 'ARTISAN' && (
                <>
                  <Link
                    to="/dashboard"
                    className={`text-sm font-semibold px-3.5 py-2 rounded-xl transition-all ${
                      isActive('/dashboard') && !location.pathname.includes('/add-product')
                        ? 'bg-[#e3f6f0] text-[#06372b]'
                        : 'text-slate-700 hover:text-[#0b634e] hover:bg-[#faf6ef]'
                    }`}
                  >
                    My Shop Dashboard
                  </Link>
                  <Link
                    to="/growth-managers"
                    className={`text-sm font-semibold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                      isActive('/growth-managers')
                        ? 'bg-[#e3f6f0] text-[#06372b]'
                        : 'text-slate-700 hover:text-[#0b634e] hover:bg-[#faf6ef]'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-[#0b634e]" />
                    Find Growth Manager
                  </Link>
                  <Link
                    to="/marketplace"
                    className={`text-sm font-semibold px-3.5 py-2 rounded-xl transition-all ${
                      isActive('/marketplace')
                        ? 'bg-[#e3f6f0] text-[#06372b]'
                        : 'text-slate-700 hover:text-[#0b634e] hover:bg-[#faf6ef]'
                    }`}
                  >
                    Marketplace
                  </Link>
                </>
              )}

              {user?.role === 'INTERN' && (
                <>
                  <Link
                    to="/dashboard"
                    className={`text-sm font-semibold px-3.5 py-2 rounded-xl transition-all ${
                      isActive('/dashboard')
                        ? 'bg-[#e3f6f0] text-[#06372b]'
                        : 'text-slate-700 hover:text-[#0b634e] hover:bg-[#faf6ef]'
                    }`}
                  >
                    Manager Workspace
                  </Link>
                  <Link
                    to="/growth-managers"
                    className={`text-sm font-semibold px-3.5 py-2 rounded-xl transition-all ${
                      isActive('/growth-managers')
                        ? 'bg-[#e3f6f0] text-[#06372b]'
                        : 'text-slate-700 hover:text-[#0b634e] hover:bg-[#faf6ef]'
                    }`}
                  >
                    Open Requests
                  </Link>
                  <Link
                    to="/marketplace"
                    className={`text-sm font-semibold px-3.5 py-2 rounded-xl transition-all ${
                      isActive('/marketplace')
                        ? 'bg-[#e3f6f0] text-[#06372b]'
                        : 'text-slate-700 hover:text-[#0b634e] hover:bg-[#faf6ef]'
                    }`}
                  >
                    Marketplace
                  </Link>
                </>
              )}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* Cart Button */}
              {(!user || user.role === 'CUSTOMER') && (
                <Link
                  to="/cart"
                  className="relative p-2.5 text-slate-700 hover:text-[#0b634e] rounded-xl hover:bg-[#faf6ef] transition-colors"
                  title="Shopping Cart"
                >
                  <ShoppingBag className="w-5 h-5 text-[#0b634e]" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                      {itemCount}
                    </span>
                  )}
                </Link>
              )}

              {user ? (
                <div className="flex items-center gap-3 pl-3 border-l border-[#e8e2d8]">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                      {user.name}
                    </span>
                    <span className="text-[10px] font-semibold text-[#0b634e] uppercase tracking-wider">
                      {user.role === 'INTERN' ? 'Growth Manager' : user.role === 'ARTISAN' ? 'Artisan' : 'Customer'}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-xs font-bold text-slate-700 hover:text-[#0b634e] px-3.5 py-2 rounded-xl hover:bg-[#faf6ef] transition-colors flex items-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5 text-[#0b634e]" />
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary py-2 px-4 text-xs font-bold shadow-sm flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Join Platform
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              {(!user || user.role === 'CUSTOMER') && (
                <Link
                  to="/cart"
                  className="relative p-2 text-slate-700 hover:text-[#0b634e]"
                >
                  <ShoppingBag className="w-5 h-5 text-[#0b634e]" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-700 hover:text-[#0b634e] rounded-xl hover:bg-[#faf6ef]"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#e8e2d8] bg-white px-4 pt-4 pb-6 space-y-3 shadow-lg">
            {!user && (
              <>
                <Link
                  to="/marketplace"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-semibold text-slate-800 py-2 px-3 rounded-lg hover:bg-[#faf6ef]"
                >
                  Marketplace
                </Link>
                <Link
                  to="/growth-managers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-semibold text-slate-800 py-2 px-3 rounded-lg hover:bg-[#faf6ef]"
                >
                  Growth Managers
                </Link>
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-semibold text-slate-800 py-2 px-3 rounded-lg hover:bg-[#faf6ef]"
                >
                  About Us
                </Link>
                <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-secondary w-full text-center text-xs py-2.5"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary w-full text-center text-xs py-2.5"
                  >
                    Join Platform
                  </Link>
                </div>
              </>
            )}

            {user?.role === 'CUSTOMER' && (
              <>
                <Link
                  to="/marketplace"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-semibold text-slate-800 py-2 px-3 rounded-lg hover:bg-[#faf6ef]"
                >
                  Explore Shop
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-semibold text-slate-800 py-2 px-3 rounded-lg hover:bg-[#faf6ef]"
                >
                  My Orders
                </Link>
              </>
            )}

            {user?.role === 'ARTISAN' && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-semibold text-slate-800 py-2 px-3 rounded-lg hover:bg-[#faf6ef]"
                >
                  My Shop Dashboard
                </Link>
                <Link
                  to="/growth-managers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-semibold text-slate-800 py-2 px-3 rounded-lg hover:bg-[#faf6ef]"
                >
                  Find Growth Manager
                </Link>
                <Link
                  to="/marketplace"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-semibold text-slate-800 py-2 px-3 rounded-lg hover:bg-[#faf6ef]"
                >
                  Marketplace
                </Link>
              </>
            )}

            {user?.role === 'INTERN' && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-semibold text-slate-800 py-2 px-3 rounded-lg hover:bg-[#faf6ef]"
                >
                  Manager Workspace
                </Link>
                <Link
                  to="/growth-managers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-semibold text-slate-800 py-2 px-3 rounded-lg hover:bg-[#faf6ef]"
                >
                  Open Requests
                </Link>
                <Link
                  to="/marketplace"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-semibold text-slate-800 py-2 px-3 rounded-lg hover:bg-[#faf6ef]"
                >
                  Marketplace
                </Link>
              </>
            )}

            {user && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between px-3">
                <div>
                  <span className="block text-xs font-bold text-slate-900">{user.name}</span>
                  <span className="text-[10px] text-[#0b634e] font-semibold uppercase">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Content View */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
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

      {/* Premium Footer */}
      <footer className="bg-white border-t border-[#e8e2d8] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand column */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0b634e] text-white font-black flex items-center justify-center text-sm shadow font-display">
                  BB
                </div>
                <span className="text-lg font-bold text-slate-900 font-display">Bharat Bazaar</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Empowering India's traditional makers with digital commerce, student growth managers, and ethical direct consumer discovery.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-[#0b634e] font-semibold">
                <Heart className="w-3.5 h-3.5 fill-[#0b634e]" />
                Made with pride for Indian Craft
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-display">Marketplace</h4>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li><Link to="/marketplace" className="hover:text-[#0b634e] transition-colors">Handicrafts & Decor</Link></li>
                <li><Link to="/marketplace" className="hover:text-[#0b634e] transition-colors">Textiles & Handloom</Link></li>
                <li><Link to="/marketplace" className="hover:text-[#0b634e] transition-colors">Terracotta & Pottery</Link></li>
                <li><Link to="/marketplace" className="hover:text-[#0b634e] transition-colors">Artisan Jewelry</Link></li>
              </ul>
            </div>

            {/* Ecosystem */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-display">Ecosystem</h4>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li><Link to="/how-it-works/artisan" className="hover:text-[#0b634e] transition-colors">Artisan Onboarding</Link></li>
                <li><Link to="/how-it-works/growth-manager" className="hover:text-[#0b634e] transition-colors">Student Growth Program</Link></li>
                <li><Link to="/growth-managers" className="hover:text-[#0b634e] transition-colors">Growth Manager Directory</Link></li>
                <li><Link to="/about" className="hover:text-[#0b634e] transition-colors">About Our Mission</Link></li>
              </ul>
            </div>

            {/* Trust & Transparency */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-display">Transparency</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Direct payments to artisans. Verified student university partnerships. 100% authentic regional crafts.
              </p>
              <div className="pt-2">
                <span className="inline-block px-3 py-1 bg-[#f4efe6] text-[#06372b] rounded-lg text-[11px] font-semibold border border-[#e8e2d8]">
                  Verified Craft Guarantee
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-[#f0ebe1] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
            <p>&copy; 2026 Bharat Bazaar. Connecting Indian Artisans, Conscious Customers & Growth Managers.</p>
            <div className="flex gap-4">
              <Link to="/about" className="hover:text-[#0b634e]">About</Link>
              <span>•</span>
              <Link to="/marketplace" className="hover:text-[#0b634e]">Marketplace</Link>
              <span>•</span>
              <Link to="/growth-managers" className="hover:text-[#0b634e]">Managers</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
