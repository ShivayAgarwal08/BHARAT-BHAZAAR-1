import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck } from 'lucide-react';

export default function Cart() {
  const { cart, loading, updateQuantity, removeFromCart, cartTotal, itemCount } = useCart();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-500 font-medium">Loading your shopping cart...</p>
      </div>
    );
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-800">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Your Cart is Empty</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            You haven't added any artisan products to your cart yet. Explore authentic handicrafts from across India!
          </p>
        </div>
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-700 text-white font-semibold rounded-xl hover:bg-amber-800 transition-colors shadow-md text-sm"
        >
          Explore Marketplace
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
          <ShoppingBag className="w-7 h-7 text-amber-700" />
          Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </h1>
        <Link
          to="/marketplace"
          className="text-amber-800 hover:text-amber-900 text-sm font-semibold flex items-center gap-1"
        >
          Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
              >
                {/* Product Info */}
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl.startsWith('http') ? product.imageUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/${product.imageUrl.replace(/\\/g, '/').replace(/^\//, '')}`}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-amber-50 text-amber-800 font-bold text-sm">
                        Craft
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Link
                      to={`/product/${product.id}`}
                      className="font-bold text-gray-900 hover:text-amber-800 text-base transition-colors"
                    >
                      {product.title}
                    </Link>
                    <p className="text-xs text-gray-400">Category: {product.category}</p>
                    {product.artisan?.user?.name && (
                      <p className="text-xs text-amber-800 font-medium">By {product.artisan.user.name}</p>
                    )}
                    <span className="text-sm font-extrabold text-amber-900 sm:hidden block">
                      ₹{(product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                  {/* Quantity Buttons */}
                  <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="p-2 text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right hidden sm:block">
                    <span className="text-xs text-gray-400 block font-medium">Subtotal</span>
                    <span className="text-base font-extrabold text-amber-900">
                      ₹{(product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Remove Item */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6 h-fit">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Order Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Items Total ({itemCount})</span>
              <span className="font-semibold text-gray-800">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span className="flex items-center gap-1">
                <Truck className="w-4 h-4 text-emerald-600" />
                Delivery Fee
              </span>
              <span className="font-semibold text-emerald-600">FREE</span>
            </div>

            <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
              <span className="text-base font-bold text-gray-900">Grand Total</span>
              <span className="text-2xl font-extrabold text-amber-900">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3.5 bg-amber-700 text-white font-bold rounded-xl hover:bg-amber-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-700/20 text-sm"
          >
            Proceed to Checkout
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="space-y-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Direct support to rural Indian artisans</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-700" />
              <span>Safe packaging and tracked delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
