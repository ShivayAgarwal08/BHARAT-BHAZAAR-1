import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, ShoppingBag, MapPin, Tag, Sparkles, ArrowUpDown, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All', 'Handicrafts', 'Textiles', 'Jewelry', 'Pottery', 'Art'];

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'price-low', 'price-high'
  const [addingId, setAddingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/products`);
      setProducts(res.data);
    } catch (err) {
      console.error('Fetch products error:', err);
      setError('Failed to load marketplace products.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setToastMessage('Please sign in to add artisan items to your cart.');
      setTimeout(() => setToastMessage(''), 3500);
      return;
    }

    setAddingId(productId);
    const res = await addToCart(productId, 1);
    setAddingId(null);

    if (res.success) {
      setToastMessage('Handcrafted item added to your cart!');
      setTimeout(() => setToastMessage(''), 3500);
    } else {
      setToastMessage(res.error || 'Could not add to cart');
      setTimeout(() => setToastMessage(''), 3500);
    }
  };

  // Filter and sort logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      (p.artisanName && p.artisanName.toLowerCase().includes(search.toLowerCase())) ||
      (p.location && p.location.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-[#06372b] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-emerald-500/30 animate-in fade-in slide-in-from-top-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="card-forest rounded-3xl p-8 sm:p-12 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <ShoppingBag className="w-72 h-72 text-white" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-3.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-100 text-xs font-semibold uppercase tracking-wider border border-white/15 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Authentic Indian Craftsmanship
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display">
            Discover Handcrafted Treasures from Local Artisans
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            Every purchase connects you directly with regional makers, preserving cultural craftsmanship and funding rural artisan livelihoods without middlemen.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3.5 justify-between items-center">
          {/* Search Input */}
          <div className="relative flex-grow w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product, craft type, artisan name, or state..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <ArrowUpDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#faf8f5] border border-[#ded6c9] rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0b634e]/20 focus:border-[#0b634e]"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="price-low">Sort: Price (Low to High)</option>
              <option value="price-high">Sort: Price (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 pr-2 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#0b634e] text-white shadow-sm'
                  : 'bg-[#f4efe6] text-slate-700 hover:bg-[#eae2d5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="card p-4 animate-pulse space-y-4">
              <div className="w-full h-56 bg-slate-100 rounded-xl"></div>
              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              <div className="h-8 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 card p-8">
          <p className="text-red-600 font-medium text-sm">{error}</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 card p-8 space-y-4">
          <div className="w-14 h-14 bg-[#f4efe6] text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7 text-[#0b634e]" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-display">No artisan creations found</h3>
          <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto">
            Try adjusting your search keywords or switching category filters to discover more crafts.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
            }}
            className="btn-primary text-xs py-2 px-5"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="group card card-hover flex flex-col justify-between overflow-hidden"
            >
              {/* Product Image */}
              <div>
                <div className="relative w-full h-60 bg-[#f4efe6] overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl.startsWith('http') ? product.imageUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/${product.imageUrl.replace(/\\/g, '/').replace(/^\//, '')}`}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#f4efe6] text-[#0b634e] font-bold text-base px-4 text-center font-display">
                      {product.title}
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-[#06372b] border border-[#e8e2d8] shadow-sm flex items-center gap-1">
                    <Tag className="w-3 h-3 text-[#0b634e]" />
                    {product.category}
                  </span>
                  {product.quantity <= 0 && (
                    <span className="absolute top-3 right-3 bg-rose-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow">
                      Sold Out
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h2 className="font-bold text-slate-900 text-base group-hover:text-[#0b634e] transition-colors line-clamp-1 font-display">
                    {product.title}
                  </h2>
                  <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Artisan identity */}
                  {product.artisanName && (
                    <div className="flex items-center gap-2 pt-2 border-t border-[#f0ebe1] text-xs text-slate-600">
                      <span className="w-6 h-6 rounded-full bg-[#e3f6f0] text-[#06372b] font-bold flex items-center justify-center text-[11px]">
                        {product.artisanName[0]}
                      </span>
                      <span className="font-medium text-slate-700 truncate">By {product.artisanName}</span>
                      {product.location && (
                        <span className="flex items-center gap-0.5 text-slate-400 ml-auto text-[11px]">
                          <MapPin className="w-3 h-3 text-amber-600" />
                          {product.location}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Price & Action */}
              <div className="px-5 pb-5 pt-3 border-t border-[#f0ebe1] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price</span>
                  <span className="text-lg font-black text-slate-900 font-display">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  onClick={(e) => handleAddToCart(e, product.id)}
                  disabled={product.quantity <= 0 || addingId === product.id}
                  className="btn-primary py-2 px-3.5 text-xs font-semibold"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  {addingId === product.id ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
