import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, Package, PackageCheck, Truck, XCircle, Ban } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Calculates a simulated order status based on how many days have passed
// since the order timestamp embedded in the Order ID (ORD-<timestamp>)
// unless the order has been manually cancelled, which always takes priority.
function getOrderStatus(order) {
  if (order.status === 'Cancelled') {
    return { label: 'Cancelled', className: 'status-cancelled', Icon: Ban };
  }

  const orderId = order.orderId;

  if (!orderId || typeof orderId !== 'string') {
    return { label: 'Placed', className: 'status-placed', Icon: Package };
  }

  const timestampStr = orderId.replace('ORD-', '');
  const orderTimestamp = parseInt(timestampStr, 10);

  if (isNaN(orderTimestamp)) {
    return { label: 'Placed', className: 'status-placed', Icon: Package };
  }

  const diffMs = Date.now() - orderTimestamp;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays >= 5) {
    return { label: 'Delivered', className: 'status-delivered', Icon: PackageCheck };
  } else if (diffDays >= 2) {
    return { label: 'Shipped', className: 'status-shipped', Icon: Truck };
  } else {
    return { label: 'Placed', className: 'status-placed', Icon: Package };
  }
}

export default function Orders() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [allOrders, setAllOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cancelConfirmId, setCancelConfirmId] = useState(null);

  // Load orders from localStorage on mount
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('amazon_react_orders') || '[]');
    setAllOrders(stored);
  }, []);

  // Filter orders belonging to the current user/guest session
  const userOrders = useMemo(() => {
    return allOrders.filter((order) => {
      if (user) {
        return order.address?.fullName || order; // guest orders have no account tie, show all for demo
      }
      return true;
    });
  }, [allOrders, user]);

  // Apply search filtering by Order ID or Product Title
  const filteredOrders = useMemo(() => {
    const trimmed = searchTerm.trim().toLowerCase();
    if (!trimmed) return userOrders;

    return userOrders.filter((order) => {
      const matchesOrderId = order.orderId?.toLowerCase().includes(trimmed) || false;
      const matchesProduct = order.items?.some((item) =>
        item.title?.toLowerCase().includes(trimmed)
      );
      return matchesOrderId || matchesProduct;
    });
  }, [userOrders, searchTerm]);

  const handleClearSearch = () => setSearchTerm('');

  // Step 1: User clicks "Cancel Order" -> show inline confirmation
  const handleCancelClick = (orderId) => {
    setCancelConfirmId(orderId);
  };

  // Step 2: User clicks "Yes, Cancel" -> actually update status
  const handleConfirmCancel = (orderId) => {
    const updatedOrders = allOrders.map((order) =>
      order.orderId === orderId ? { ...order, status: 'Cancelled' } : order
    );
    setAllOrders(updatedOrders);
    localStorage.setItem('amazon_react_orders', JSON.stringify(updatedOrders));
    setCancelConfirmId(null);
    showToast(`Order ${orderId} has been cancelled.`, 'info');
  };

  // User backs out of the confirmation
  const handleDismissCancel = () => setCancelConfirmId(null);

  if (allOrders.length === 0) {
    return (
      <div style={{ maxWidth: '800px', margin: '60px auto', padding: '20px', textAlign: 'center' }}>
        <h2>No orders yet</h2>
        <p style={{ margin: '15px 0', color: '#565959' }}>
          You haven't placed any orders. Start shopping to see your order history here!
        </p>
        <Link to="/" className="add-to-cart-btn" style={{ textDecoration: 'none', display: 'inline-block', width: 'auto', padding: '10px 20px' }}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '950px', margin: '30px auto', padding: '0 20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Your Orders</h1>

      {/* Search Toolbar */}
      <div className="orders-toolbar">
        <div className="orders-search-box">
          <input
            type="text"
            placeholder="Search by Order ID or Product Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm ? (
            <button className="orders-search-clear" onClick={handleClearSearch}>
              <X size={16} />
            </button>
          ) : (
            <Search size={16} className="orders-search-icon" />
          )}
        </div>
        <span style={{ fontSize: '13px', color: '#565959' }}>
          Showing {filteredOrders.length} of {userOrders.length} order{userOrders.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="no-orders-found">
          No orders found matching "<strong>{searchTerm}</strong>". Try a different Order ID or product name.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {filteredOrders.map((order, orderIndex) => {
            const status = getOrderStatus(order);
            const StatusIcon = status.Icon;
            const canCancel = status.label === 'Placed';
            const isConfirming = cancelConfirmId === order.orderId;

            return (
              <div
                key={order.orderId || `order-${orderIndex}`}
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}
              >
                {/* Order Header */}
                <div
                  style={{
                    backgroundColor: '#f0f2f2',
                    padding: '12px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    fontSize: '13px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ color: '#565959' }}>ORDER PLACED</div>
                      <div style={{ fontWeight: 'bold' }}>{order.date}</div>
                    </div>
                    <div>
                      <div style={{ color: '#565959' }}>TOTAL</div>
                      <div style={{ fontWeight: 'bold' }}>₹{order.total?.toLocaleString('en-IN')}</div>
                    </div>
                    <div>
                      <div style={{ color: '#565959' }}>SHIP TO</div>
                      <div style={{ fontWeight: 'bold' }}>{order.address?.fullName || 'N/A'}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#565959' }}>ORDER # {order.orderId || 'N/A'}</div>
                    <span className={`status-badge ${status.className}`}>
                      <StatusIcon size={12} /> {status.label}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div style={{ padding: '15px 20px' }}>
                  {order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        padding: '10px 0',
                        borderBottom: idx !== order.items.length - 1 ? '1px solid #f0f0f0' : 'none'
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', margin: 0 }}>{item.title}</p>
                        <p style={{ fontSize: '12px', color: '#565959', margin: '4px 0 0 0' }}>
                          Qty: {item.quantity} × ₹{Math.round(item.price * 80).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}

                  {order.promoCode && (
                    <p style={{ fontSize: '12px', color: '#0d6e1f', marginTop: '10px' }}>
                      🏷️ Promo Applied: <strong>{order.promoCode}</strong> (-₹{order.discount?.toLocaleString('en-IN')})
                    </p>
                  )}

                  <p style={{ fontSize: '12px', color: '#565959', marginTop: '8px' }}>
                    Payment Method: <strong>{order.paymentMethod}</strong>
                  </p>

                  {/* ===== Order Cancellation UI ===== */}
                  {canCancel && !isConfirming && (
                    <button
                      className="cancel-order-btn"
                      onClick={() => handleCancelClick(order.orderId)}
                    >
                      <XCircle size={14} /> Cancel Order
                    </button>
                  )}

                  {isConfirming && (
                    <div className="cancel-confirm-box">
                      <span>Are you sure you want to cancel this order?</span>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                        <button
                          className="confirm-cancel-yes"
                          onClick={() => handleConfirmCancel(order.orderId)}
                        >
                          Yes, Cancel Order
                        </button>
                        <button
                          className="confirm-cancel-no"
                          onClick={handleDismissCancel}
                        >
                          No, Keep Order
                        </button>
                      </div>
                    </div>
                  )}

                  {status.label === 'Cancelled' && (
                    <p className="cancelled-note">
                      This order was cancelled and will not be processed further.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}