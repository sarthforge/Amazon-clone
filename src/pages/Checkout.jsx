import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MapPin, CreditCard, ShieldCheck, Tag, X } from 'lucide-react';

// Centralized promo code database — in production, this would come from the backend
const PROMO_CODES = {
  'WELCOME10': { type: 'percentage', value: 10, description: '10% off your order' },
  'SAVE50': { type: 'flat', value: 50, description: '₹50 off your order' },
  'FREESHIP': { type: 'shipping', value: 0, description: 'Free shipping on this order' }
};

export default function Checkout() {
  const { cart, cartSubtotal, clearCart } = useCart();
  const { user, savedAddresses, addAddress } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Address Management State
  const [addressMode, setAddressMode] = useState(savedAddresses.length > 0 ? 'saved' : 'new');
  const [selectedAddressId, setSelectedAddressId] = useState(savedAddresses[0]?.id || '');
  const [saveAddressCheckbox, setSaveAddressCheckbox] = useState(true);

  const [formData, setFormData] = useState({
    fullName: user ? user.name : '',
    mobile: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    label: 'Home'
  });

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [cardDetails, setCardDetails] = useState({ cardNumber: '', expiry: '', cvv: '', cardName: '' });
  const [upiId, setUpiId] = useState('');

  // Promo Code State
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null); // { code, type, value, description }

  // Base Pricing Calculation
  const baseShippingFee = cartSubtotal > 499 || cartSubtotal === 0 ? 0 : 40;

  // Discount Calculation based on applied promo
  let discountAmount = 0;
  let finalShippingFee = baseShippingFee;

  if (appliedPromo) {
    if (appliedPromo.type === 'percentage') {
      discountAmount = Math.round((cartSubtotal * appliedPromo.value) / 100);
    } else if (appliedPromo.type === 'flat') {
      discountAmount = Math.min(appliedPromo.value, cartSubtotal); // never discount more than subtotal
    } else if (appliedPromo.type === 'shipping') {
      finalShippingFee = 0;
    }
  }

  const grandTotal = cartSubtotal - discountAmount + finalShippingFee;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e) => {
    let { name, value } = e.target;
    if (name === 'cardNumber') {
      value = value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    }
    if (name === 'expiry') {
      value = value.replace(/\D/g, '').slice(0, 4);
      if (value.length >= 3) {
        value = `${value.slice(0, 2)}/${value.slice(2)}`;
      }
    }
    if (name === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 3);
    }
    setCardDetails({ ...cardDetails, [name]: value });
  };

  const selectSavedAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setFormData({
      fullName: addr.fullName,
      mobile: addr.mobile,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      label: addr.label
    });
  };

  // ===== PROMO CODE LOGIC =====
  const handleApplyPromo = (e) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();

    if (!code) {
      showToast('Please enter a promo code.', 'error');
      return;
    }

    const match = PROMO_CODES[code];

    if (!match) {
      showToast(`"${code}" is not a valid promo code.`, 'error');
      return;
    }

    if (appliedPromo && appliedPromo.code === code) {
      showToast('This promo code is already applied.', 'info');
      return;
    }

    setAppliedPromo({ code, ...match });
    setPromoInput('');
    showToast(`Promo code "${code}" applied: ${match.description}!`, 'success');
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    showToast('Promo code removed.', 'info');
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      showToast('Your cart is empty!', 'error');
      return;
    }

    let activeAddress = formData;
    if (addressMode === 'saved') {
      const found = savedAddresses.find(a => a.id === selectedAddressId);
      if (found) {
        activeAddress = found;
      } else if (savedAddresses.length > 0) {
        activeAddress = savedAddresses[0];
      }
    }

    if (!activeAddress.fullName || !activeAddress.mobile || !activeAddress.street || !activeAddress.city || !activeAddress.pincode) {
      showToast('Please fill in all required shipping address fields.', 'error');
      return;
    }

    if (paymentMethod === 'card') {
      const rawCard = cardDetails.cardNumber.replace(/\s/g, '');
      if (rawCard.length !== 16) {
        showToast('Please enter a valid 16-digit card number.', 'error');
        return;
      }
      if (!cardDetails.expiry || cardDetails.expiry.length !== 5) {
        showToast('Please enter a valid expiry date (MM/YY).', 'error');
        return;
      }
      if (!cardDetails.cvv || cardDetails.cvv.length !== 3) {
        showToast('Please enter a valid 3-digit CVV.', 'error');
        return;
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId || !upiId.includes('@')) {
        showToast('Please enter a valid UPI ID (e.g., name@upi).', 'error');
        return;
      }
    }

    if (user && addressMode === 'new' && saveAddressCheckbox) {
      addAddress(formData);
    }

    const newOrder = {
      orderId: `ORD-${Date.now()}`,
      date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      items: cart,
      subtotal: cartSubtotal,
      discount: discountAmount,
      promoCode: appliedPromo ? appliedPromo.code : null,
      shippingFee: finalShippingFee,
      total: grandTotal,
      address: activeAddress,
      paymentMethod: paymentMethod.toUpperCase(),
      status: 'Placed'
    };

    const storedOrders = JSON.parse(localStorage.getItem('amazon_react_orders') || '[]');
    localStorage.setItem('amazon_react_orders', JSON.stringify([newOrder, ...storedOrders]));

    clearCart();
    showToast(`Order #${newOrder.orderId} placed successfully!`, 'success');
    navigate('/orders');
  };

  if (cart.length === 0) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', textAlign: 'center' }}>
        <h2>Your Cart is Empty</h2>
        <p style={{ margin: '15px 0' }}>Add items to your cart before proceeding to checkout.</p>
        <Link to="/" className="add-to-cart-btn" style={{ textDecoration: 'none', display: 'inline-block', width: 'auto', padding: '10px 20px' }}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ShieldCheck size={28} color="#e47911" /> Secure Checkout
      </h1>

      <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '25px' }}>

        {/* LEFT COLUMN: Shipping & Payment (UNCHANGED FROM PREVIOUS STEP) */}
        <div>
          {/* SECTION 1: Address Selection */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} color="#e47911" /> 1. Select Delivery Address
            </h2>

            {user && savedAddresses.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                  <label style={{ cursor: 'pointer', fontWeight: addressMode === 'saved' ? 'bold' : 'normal' }}>
                    <input
                      type="radio"
                      name="addrMode"
                      checked={addressMode === 'saved'}
                      onChange={() => setAddressMode('saved')}
                      style={{ marginRight: '6px' }}
                    />
                    Use Saved Address
                  </label>
                  <label style={{ cursor: 'pointer', fontWeight: addressMode === 'new' ? 'bold' : 'normal' }}>
                    <input
                      type="radio"
                      name="addrMode"
                      checked={addressMode === 'new'}
                      onChange={() => setAddressMode('new')}
                      style={{ marginRight: '6px' }}
                    />
                    + Add New Address
                  </label>
                </div>

                {addressMode === 'saved' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => selectSavedAddress(addr)}
                          style={{
                            border: isSelected ? '2px solid #e47911' : '1px solid #ccc',
                            backgroundColor: isSelected ? '#fffdfa' : '#fff',
                            borderRadius: '6px',
                            padding: '12px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            position: 'relative'
                          }}
                        >
                          <span style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '11px', backgroundColor: '#eee', padding: '2px 6px', borderRadius: '4px' }}>
                            {addr.label || 'Home'}
                          </span>
                          <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>{addr.fullName}</strong>
                          <p style={{ margin: '2px 0' }}>{addr.street}</p>
                          <p style={{ margin: '2px 0' }}>{addr.city}, {addr.state} - {addr.pincode}</p>
                          <p style={{ margin: '4px 0 0 0', color: '#555' }}>Mobile: {addr.mobile}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {(addressMode === 'new' || !user || savedAddresses.length === 0) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input type="text" name="fullName" placeholder="Full Name *" value={formData.fullName} onChange={handleInputChange} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} required />
                <input type="text" name="mobile" placeholder="Mobile Number (10 digits) *" value={formData.mobile} onChange={handleInputChange} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} required />
                <input type="text" name="street" placeholder="Street Address / Flat No *" value={formData.street} onChange={handleInputChange} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', gridColumn: 'span 2' }} required />
                <input type="text" name="city" placeholder="City *" value={formData.city} onChange={handleInputChange} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} required />
                <input type="text" name="state" placeholder="State *" value={formData.state} onChange={handleInputChange} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} required />
                <input type="text" name="pincode" placeholder="PIN Code *" value={formData.pincode} onChange={handleInputChange} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} required />
                <select name="label" value={formData.label} onChange={handleInputChange} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>

                {user && (
                  <div style={{ gridColumn: 'span 2', marginTop: '5px' }}>
                    <label style={{ fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input type="checkbox" checked={saveAddressCheckbox} onChange={(e) => setSaveAddressCheckbox(e.target.checked)} />
                      Save this address to my account for future orders
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION 2: Payment Method */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
            <h2 style={{ fontSize: '18px', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={20} color="#e47911" /> 2. Payment Method
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ padding: '12px', border: '1px solid #eee', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                <div>
                  <strong>Cash on Delivery (COD)</strong>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Pay in cash upon delivery.</p>
                </div>
              </label>

              <label style={{ padding: '12px', border: '1px solid #eee', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                <div>
                  <strong>Credit or Debit Card</strong>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Visa, MasterCard, RuPay</p>
                </div>
              </label>

              {paymentMethod === 'card' && (
                <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '6px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginLeft: '25px' }}>
                  <input type="text" name="cardNumber" placeholder="16-Digit Card Number" value={cardDetails.cardNumber} onChange={handleCardChange} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', gridColumn: 'span 2' }} />
                  <input type="text" name="expiry" placeholder="MM/YY" value={cardDetails.expiry} onChange={handleCardChange} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                  <input type="password" name="cvv" placeholder="CVV" value={cardDetails.cvv} onChange={handleCardChange} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
              )}

              <label style={{ padding: '12px', border: '1px solid #eee', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} />
                <div>
                  <strong>UPI (Google Pay, PhonePe, Paytm)</strong>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Instant pay using your VPA handle.</p>
                </div>
              </label>

              {paymentMethod === 'upi' && (
                <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '6px', marginLeft: '25px' }}>
                  <input type="text" placeholder="Enter UPI ID (e.g. mobile@upi)" value={upiId} onChange={(e) => setUpiId(e.target.value)} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary + Promo Code Box */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '18px', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>Order Summary</h3>

          {/* PROMO CODE SECTION */}
          <div className="promo-code-box" style={{ borderTop: 'none', paddingTop: 0, marginTop: 0, marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Tag size={15} color="#e47911" /> Have a Promo Code?
            </label>

            {!appliedPromo ? (
              <form className="promo-input-row" onSubmit={handleApplyPromo}>
                <input
                  type="text"
                  placeholder="e.g. WELCOME10"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                />
                <button type="submit" className="promo-apply-btn">Apply</button>
              </form>
            ) : (
              <div className="promo-applied-banner">
                <span>✅ "{appliedPromo.code}" Applied — {appliedPromo.description}</span>
                <button onClick={handleRemovePromo} className="promo-remove-btn">
                  <X size={12} style={{ verticalAlign: 'middle' }} /> Remove
                </button>
              </div>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '12px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
            <span>Items ({cart.length}):</span>
            <span>₹{cartSubtotal.toLocaleString('en-IN')}</span>
          </div>

          {discountAmount > 0 && (
            <div className="discount-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span>Discount ({appliedPromo.code}):</span>
              <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
            <span>Shipping:</span>
            <span>
              {finalShippingFee === 0 ? (
                <strong style={{ color: 'green' }}>
                  FREE {appliedPromo?.type === 'shipping' && baseShippingFee > 0 && '(Promo Applied)'}
                </strong>
              ) : (
                `₹${finalShippingFee}`
              )}
            </span>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '12px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '18px', fontWeight: 'bold', color: '#b12704' }}>
            <span>Order Total:</span>
            <span>₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>

          <button onClick={handlePlaceOrder} className="add-to-cart-btn" style={{ fontSize: '15px', padding: '12px', fontWeight: 'bold' }}>
            Place Your Order
          </button>
        </div>

      </div>
    </div>
  );
}