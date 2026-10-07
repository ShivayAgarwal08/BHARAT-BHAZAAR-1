import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, ShoppingBag, MapPin, Tag, Sparkles, ArrowUpDown } from 'lucide-react';
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
      setToastMessage('Please login to add items to your cart.');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    setAddingId(productId);
    const res = await addToCart(productId, 1);
    setAddingId(null);

    if (res.success) {
      setToastMessage('Product added to cart!');
      setTimeout(() => setToastMessage(''), 3000);
    } else {
      setToastMessage(res.error || 'Could not add to cart');
      setTimeout(() => setToastMessage(''), 3000);
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
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border border-gray-700 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-800 via-amber-700 to-orange-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-15">
          <ShoppingBag className="w-80 h-80 text-white" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 text-xs font-semibold uppercase tracking-wider border border-amber-400/30">
            Authentic Indian Craftsmanship
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Discover Handcrafted Treasures directly from Local Artisans
          </h1>
          <p className="text-amber-100 text-sm sm:text-base leading-relaxed">
            Every purchase empowers an artisan entrepreneur and supports India's rich cultural heritage.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          {/* Search Input */}
          <div className="relative flex-grow w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products, crafts, artisans, or locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600 transition-all text-sm"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-600"
            >
              <option value="newest">Sort by: Newest First</option>
              <option value="price-low">Sort by: Price Low to High</option>
              <option value="price-high">Sort by: Price High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1 pr-2">
            <Filter className="w-3.5 h-3.5" /> Categories:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-amber-700 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
            <div key={n} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse space-y-4">
              <div className="w-full h-48 bg-gray-200 rounded-xl"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 space-y-4">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-lg font-bold text-gray-800">No products found</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Try adjusting your search query or selecting a different category filter.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 bg-amber-700 text-white rounded-xl text-sm font-medium hover:bg-amber-800"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Image Container */}
              <div className="relative w-full h-56 bg-gray-50 overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl.startsWith('http') ? product.imageUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/${product.imageUrl.replace(/\\/g, '/').replace(/^\//, '')}`}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-amber-50 text-amber-800 font-semibold text-lg">
                    {product.title}
                  </div>
                )}
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-amber-900 border border-amber-100 shadow-sm flex items-center gap-1">
                  <Tag className="w-3 h-3 text-amber-700" />
                  {product.category}
                </span>
                {product.quantity <= 0 && (
                  <span className="absolute top-3 right-3 bg-red-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h2 className="font-bold text-gray-900 text-lg group-hover:text-amber-800 transition-colors line-clamp-1">
                    {product.title}
                  </h2>
                  <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Artisan Badge */}
                {product.artisanName && (
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-50 text-xs text-gray-600">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                      {product.artisanName[0]}
                    </span>
                    <span className="font-medium text-gray-700 truncate">By {product.artisanName}</span>
                    {product.location && (
                      <span className="flex items-center gap-0.5 text-gray-400 ml-auto text-xs">
                        <MapPin className="w-3 h-3 text-amber-600" />
                        {product.location}
                      </span>
                    )}
                  </div>
                )}

                {/* Price and Cart Action */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-xs text-gray-400 block font-medium">Price</span>
                    <span className="text-xl font-extrabold text-amber-900">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleAddToCart(e, product.id)}
                    disabled={product.quantity <= 0 || addingId === product.id}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-700 text-white rounded-xl text-xs font-semibold hover:bg-amber-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {addingId === product.id ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
