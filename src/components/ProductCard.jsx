import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [added, setAdded] = useState(false);

  const isLiked = isInWishlist(product.id);
  const priceINR = Math.round(product.price * 80);

  const handleAdd = (e) => {
    e.preventDefault();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="product-card" style={{ position: 'relative' }}>
      {/* Heart Wishlist Toggle Button */}
      <button
        className="wishlist-btn-icon"
        onClick={handleWishlistClick}
        title={isLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
      >
        <Heart
          size={18}
          color={isLiked ? '#e74c3c' : '#7f8c8d'}
          fill={isLiked ? '#e74c3c' : 'none'}
        />
      </button>

      <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <h3 className="product-title">{product.title}</h3>

        <div className="product-image-container">
          <img src={product.image} alt={product.title} className="product-image" />
        </div>
      </Link>

      <p className="product-price">₹{priceINR.toLocaleString('en-IN')}</p>

      <button
        className="add-to-cart-btn"
        onClick={handleAdd}
        style={{ backgroundColor: added ? '#2ecc71' : '#ffd814', color: added ? 'white' : 'black' }}
      >
        {added ? '✓ Added to Cart' : 'Add to Cart'}
      </button>
    </div>
  );
}

export default ProductCard;