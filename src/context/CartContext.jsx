import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext'; // 1. Import useToast

const CartContext = createContext();

export function CartProvider({ children }) {
  const { showToast } = useToast(); // 2. Get showToast function

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('amazon_react_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('amazon_react_cart', JSON.stringify(cart));
  }, [cart]);

  // Add Item + Trigger Toast
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });

    showToast(`Added "${product.title.substring(0, 25)}..." to Cart!`, 'success');
  };

  // Remove Item + Trigger Toast
  const removeFromCart = (id) => {
    const item = cart.find((i) => i.id === id);
    setCart((prevCart) => prevCart.filter((i) => i.id !== id));
    if (item) {
      showToast(`Removed "${item.title.substring(0, 25)}..." from Cart`, 'info');
    }
  };

  const updateQuantity = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (total, item) => total + Math.round(item.price * 80) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);