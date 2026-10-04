import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!token) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/cart`);
      setCart(res.data);
    } catch (error) {
      console.error('Fetch cart error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token, user]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/cart/items`, {
        productId,
        quantity,
      });
      setCart(res.data);
      return { success: true };
    } catch (error) {
      console.error('Add to cart error:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to add item to cart' };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/cart/items/${itemId}`,
        { quantity }
      );
      // Refresh cart
      fetchCart();
      return { success: true };
    } catch (error) {
      console.error('Update quantity error:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to update quantity' };
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/cart/items/${itemId}`);
      fetchCart();
      return { success: true };
    } catch (error) {
      console.error('Remove from cart error:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to remove item' };
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/cart`);
      setCart(null);
      fetchCart();
    } catch (error) {
      console.error('Clear cart error:', error);
    }
  };

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const cartTotal = cart?.items?.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        itemCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
