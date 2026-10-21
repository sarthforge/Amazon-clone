import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { showToast } = useToast();

  // Load wishlist from localStorage
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('amazon_react_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('amazon_react_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Check if product is in wishlist
  const isInWishlist = (id) => wishlist.some((item) => item.id === id);

  // Toggle Wishlist Status (Add or Remove)
  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        showToast(`Removed "${product.title.substring(0, 20)}..." from Wishlist`, 'info');
        return prev.filter((item) => item.id !== product.id);
      } else {
        showToast(`Added "${product.title.substring(0, 20)}..." to Wishlist!`, 'success');
        return [...prev, product];
      }
    });
  };

  // Explicit Remove
  const removeFromWishlist = (id) => {
    const item = wishlist.find((i) => i.id === id);
    setWishlist((prev) => prev.filter((i) => i.id !== id));
    if (item) {
      showToast(`Removed "${item.title.substring(0, 20)}..." from Wishlist`, 'info');
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);