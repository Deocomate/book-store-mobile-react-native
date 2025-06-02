import React, { createContext, useContext, useEffect, useState } from 'react';
import { cartService } from '../services';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  const fetchCart = async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      const cartData = await cartService.getCart();
      setCart(cartData);
    } catch (error) {
      setError('Failed to fetch cart data');
      console.error('Fetch cart error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch cart when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [isAuthenticated]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      setIsLoading(true);
      await cartService.addToCart(productId, quantity);
      await fetchCart(); // Refresh cart after adding
      return true;
    } catch (error) {
      setError('Failed to add item to cart');
      console.error('Add to cart error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartItem = async (cartProductId, quantity) => {
    try {
      setIsLoading(true);
      await cartService.updateCartItem(cartProductId, quantity);
      await fetchCart(); // Refresh cart after updating
      return true;
    } catch (error) {
      setError('Failed to update cart item');
      console.error('Update cart item error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeCartItem = async (cartProductId) => {
    try {
      setIsLoading(true);
      await cartService.removeCartItem(cartProductId);
      await fetchCart(); // Refresh cart after removing
      return true;
    } catch (error) {
      setError('Failed to remove cart item');
      console.error('Remove cart item error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setIsLoading(true);
      await cartService.clearCart();
      setCart([]);
      return true;
    } catch (error) {
      setError('Failed to clear cart');
      console.error('Clear cart error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.product.discountPrice || item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const getSelectedItems = (selectedIds = []) => {
    if (!selectedIds.length) return [];
    return cart.filter(item => selectedIds.includes(item.id));
  };

  const getSelectedTotal = (selectedIds = []) => {
    if (!selectedIds.length) return 0;
    return getSelectedItems(selectedIds).reduce((total, item) => {
      const price = item.product.discountPrice || item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const value = {
    cart,
    isLoading,
    error,
    fetchCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    getCartTotal,
    getCartCount,
    getSelectedItems,
    getSelectedTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext; 