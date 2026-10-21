import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product.id);
  };

  if (wishlist.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="empty-cart-box">
          <h2>Your Wishlist is Empty</h2>
          <p>Explore our catalog and click the heart icon on any product to save items for later.</p>
          <Link to="/" className="continue-shopping-btn">Explore Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-header-row">
        <h1 className="wishlist-title">Your Saved Wishlist ({wishlist.length} items)</h1>
      </div>

      <div className="wishlist-grid">
        {wishlist.map((product) => {
          const priceINR = Math.round(product.price * 80);

          return (
            <div key={product.id} className="wishlist-card">
              <div>
                <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <img src={product.image} alt={product.title} className="wishlist-card-image" />
                  <h3 className="product-title" style={{ fontSize: '15px' }}>{product.title}</h3>
                </Link>
                <p className="product-price">₹{priceINR.toLocaleString('en-IN')}</p>
              </div>

              <div>
                <button
                  className="move-to-cart-btn"
                  onClick={() => handleMoveToCart(product)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <ShoppingCart size={16} /> Move to Cart
                </button>

                <button
                  className="wishlist-remove-btn"
                  onClick={() => removeFromWishlist(product.id)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', width: '100%' }}
                >
                  <Trash2 size={14} /> Remove Item
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Wishlist;