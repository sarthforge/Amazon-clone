import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, Bookmark, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

function Cart() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    cartCount,
    savedItems,
    saveForLater,
    moveToCart,
    removeSavedItem,
  } = useCart();

  // If cart AND saved items are both empty
  if (cart.length === 0 && savedItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart-box">
          <h2>Your Amazon Cart is empty</h2>
          <p>Your Shopping Cart lives to serve. Give it purpose — fill it with books, electronics, videos, and more.</p>
          <Link to="/" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        {/* Left Side: Cart Items List */}
        <div className="cart-main">
          <h1 className="cart-title">Shopping Cart</h1>

          {cart.length === 0 ? (
            <p style={{ color: '#565959', padding: '20px 0' }}>
              Your cart is empty. Check your saved items below, or{' '}
              <Link to="/" style={{ color: '#007185' }}>continue shopping</Link>.
            </p>
          ) : (
            cart.map((item) => {
              const itemPriceINR = Math.round(item.price * 80);
              const itemTotalINR = itemPriceINR * item.quantity;

              return (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.title} className="cart-item-image" />

                  <div className="cart-item-details">
                    <h3 className="cart-item-title">{item.title}</h3>
                    <p className="cart-item-price-unit">Price: ₹{itemPriceINR.toLocaleString('en-IN')}</p>

                    <div className="cart-qty-row">
                      {/* Quantity Controls */}
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}>
                          <Minus size={14} />
                        </button>
                        <span className="qty-count">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}>
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Delete Link */}
                      <button className="delete-btn" onClick={() => removeFromCart(item.id)}>
                        <Trash2 size={16} /> Delete
                      </button>

                      {/* Save for Later Link */}
                      <button className="save-for-later-btn" onClick={() => saveForLater(item.id)}>
                        <Bookmark size={16} /> Save for later
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-total">
                    ₹{itemTotalINR.toLocaleString('en-IN')}
                  </div>
                </div>
              );
            })
          )}

          {/* ===== Saved for Later Section ===== */}
          {savedItems.length > 0 && (
            <div className="saved-for-later-section">
              <h2 className="saved-for-later-heading">
                Saved for later ({savedItems.length} {savedItems.length === 1 ? 'item' : 'items'})
              </h2>

              {savedItems.map((item) => {
                const itemPriceINR = Math.round(item.price * 80);

                return (
                  <div key={item.id} className="cart-item saved-item">
                    <img src={item.image} alt={item.title} className="cart-item-image" />

                    <div className="cart-item-details">
                      <h3 className="cart-item-title">{item.title}</h3>
                      <p className="cart-item-price-unit">₹{itemPriceINR.toLocaleString('en-IN')}</p>

                      <div className="cart-qty-row">
                        <button className="move-to-cart-btn" onClick={() => moveToCart(item.id)}>
                          <ShoppingCart size={16} /> Move to Cart
                        </button>

                        <button className="delete-btn" onClick={() => removeSavedItem(item.id)}>
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Order Subtotal Box */}
        {cart.length > 0 && (
          <div className="cart-summary">
            <h2 className="summary-heading">
              Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'}):
            </h2>
            <div className="summary-subtotal">
              ₹{cartSubtotal.toLocaleString('en-IN')}
            </div>

            <Link to="/checkout" className="checkout-btn">
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;