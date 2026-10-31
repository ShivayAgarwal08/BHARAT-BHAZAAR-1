import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, ArrowLeft } from 'lucide-react';

export default function Cart() {
  const { cart, loading, updateQuantity, removeFromCart, cartTotal, itemCount } = useCart();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-[#0b634e] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 font-medium text-xs">Loading your shopping cart...</p>
      </div>
    );
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-[#f4efe6] rounded-3xl flex items-center justify-center mx-auto text-[#0b634e] shadow-inner">
          <ShoppingBag className="w-9 h-9" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 font-display">Your Cart is Empty</h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            You haven't added any handcrafted artisan creations to your cart yet. Explore authentic handicrafts from across India!
          </p>
        </div>
        <Link
          to="/marketplace"
          className="btn-primary py-3 px-6 text-xs font-bold inline-flex items-center gap-2 shadow-md"
        >
          Explore Marketplace
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between border-b border-[#f0ebe1] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5 font-display">
            <ShoppingBag className="w-6 h-6 text-[#0b634e]" />
            Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Review items before proceeding to direct artisan checkout</p>
        </div>
        <Link
          to="/marketplace"
          className="text-xs font-bold text-[#0b634e] hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
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
                className="card p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
              >
                {/* Product Info */}
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 bg-[#f4efe6] rounded-xl overflow-hidden flex-shrink-0 border border-[#ded6c9]">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl.startsWith('http') ? product.imageUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/${product.imageUrl.replace(/\\/g, '/').replace(/^\//, '')}`}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#f4efe6] text-[#0b634e] font-bold text-xs font-display">
                        Craft
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Link
                      to={`/product/${product.id}`}
                      className="font-bold text-slate-900 hover:text-[#0b634e] text-sm sm:text-base transition-colors font-display"
                    >
                      {product.title}
                    </Link>
                    <p className="text-[11px] text-slate-500">Category: {product.category}</p>
                    {product.artisan?.user?.name && (
                      <p className="text-[11px] text-[#0b634e] font-medium">By {product.artisan.user.name}</p>
                    )}
                    <span className="text-sm font-black text-slate-900 sm:hidden block font-display pt-1">
                      ₹{(product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#f0ebe1]">
                  {/* Quantity Buttons */}
                  <div className="flex items-center border border-[#ded6c9] rounded-xl bg-white overflow-hidden shadow-sm">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="p-1.5 text-slate-600 hover:bg-[#faf8f5] disabled:opacity-40 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-slate-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 text-slate-600 hover:bg-[#faf8f5] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subtotal</span>
                    <span className="text-base font-black text-slate-900 font-display">
                      ₹{(product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Remove Item */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
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
        <div className="card p-6 space-y-5 h-fit border border-[#e8e2d8]">
          <h2 className="text-base font-bold text-slate-900 border-b border-[#f0ebe1] pb-3 font-display">Order Summary</h2>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Items Total ({itemCount})</span>
              <span className="font-bold text-slate-800">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600" />
                Delivery Fee
              </span>
              <span className="font-bold text-emerald-600">FREE</span>
            </div>

            <div className="border-t border-[#f0ebe1] pt-3 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-900 font-display">Grand Total</span>
              <span className="text-2xl font-black text-slate-900 font-display">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn-primary w-full py-3.5 text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2"
          >
            Proceed to Checkout
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="space-y-2 pt-3 border-t border-[#f0ebe1] text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0b634e]" />
              <span>100% of proceeds go directly to regional artisans</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#0b634e]" />
              <span>Careful artisanal packaging & tracked dispatch</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
