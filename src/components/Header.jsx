import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ShoppingCart, Heart, MapPin, LogOut, X, Menu, User, Package, Sun, Moon } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';

export default function Header() {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [productsList, setProductsList] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const searchContainerRef = useRef(null);

  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    fetch('https://fakestoreapi.com/products')
      .then((res) => res.json())
      .then((data) => setProductsList(data))
      .catch((err) => console.error('Failed to load products for search autocomplete:', err));
  }, []);

  useEffect(() => {
    const trimmed = debouncedSearchTerm.trim().toLowerCase();
    if (trimmed.length > 0 && productsList.length > 0) {
      const filtered = productsList.filter(
        (product) =>
          product.title.toLowerCase().includes(trimmed) ||
          product.category.toLowerCase().includes(trimmed)
      );
      setSuggestions(filtered.slice(0, 6));
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [debouncedSearchTerm, productsList]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [mobileMenuOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setIsOpen(false);
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/');
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleSelectSuggestion = (productId) => {
    setIsOpen(false);
    navigate(`/product/${productId}`);
  };

  const handleMobileNavigate = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const handleMobileLogout = () => {
    setMobileMenuOpen(false);
    logout();
  };

  return (
    <header className="header">
      {/* 1. Amazon Logo */}
      <Link to="/" className="header-logo-container">
        <img
          src="https://pngimg.com/uploads/amazon/amazon_PNG11.png"
          alt="Amazon Logo"
          className="header-logo"
          style={{ height: '30px', width: 'auto', objectFit: 'contain' }}
        />
        <span className="logo-domain">.in</span>
      </Link>

      {/* 2. Deliver To Location (hidden on mobile via CSS) */}
      <div className="header-location">
        <MapPin size={18} color="#ffffff" style={{ marginTop: '2px' }} />
        <div className="location-text">
          <span className="location-line1">Deliver to</span>
          <span className="location-line2">India</span>
        </div>
      </div>

      {/* 3. Search Bar with Debounced Autocomplete */}
      <div className="search-container" ref={searchContainerRef}>
        <form className="header-search" onSubmit={handleSearchSubmit}>
          <select className="search-category-select" defaultValue="all">
            <option value="all">All</option>
            <option value="electronics">Electronics</option>
            <option value="jewelery">Jewelery</option>
            <option value="men's clothing">Men's</option>
            <option value="women's clothing">Women's</option>
          </select>

          <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              className="search-input"
              placeholder="Search Amazon.in"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (debouncedSearchTerm.trim().length > 0 && suggestions.length > 0) {
                  setIsOpen(true);
                }
              }}
            />

            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#555', display: 'flex', alignItems: 'center' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button type="submit" className="search-button" aria-label="Search">
            <Search size={20} color="#333333" />
          </button>
        </form>

        {isOpen && (
          <div className="autocomplete-dropdown">
            {suggestions.length > 0 ? (
              suggestions.map((item) => {
                const priceInINR = Math.round(item.price * 80);
                return (
                  <div key={item.id} className="autocomplete-item" onClick={() => handleSelectSuggestion(item.id)}>
                    <img src={item.image} alt={item.title} className="autocomplete-thumb" />
                    <div className="autocomplete-details">
                      <span className="autocomplete-title">{item.title}</span>
                      <div className="autocomplete-meta">
                        <span className="autocomplete-category">{item.category}</span>
                        <span className="autocomplete-price">₹{priceInINR.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="autocomplete-no-results">
                No matching products found for "<strong>{debouncedSearchTerm}</strong>"
              </div>
            )}
          </div>
        )}
      </div>

{/* 4. Language & Flag (hidden on mobile via CSS) */}
<div className="header-nav-item language-selector">
  <img
    src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg"
    alt="India Flag"
    className="flag-icon"
    style={{ width: '20px', height: '14px', objectFit: 'cover' }}
  />
  <span className="lang-code">EN</span>

  
{/* 4.5 Dark Mode Toggle (hidden on mobile via CSS, lives in drawer instead) */}
  <button
  className="header-nav-item theme-toggle-desktop"
  onClick={toggleTheme}
  aria-label="Toggle dark mode"
  style={{
    background: 'none',
    border: 'none',
    color: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    minWidth: '50px',
    padding: '5px',
  }}
>
  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
  <span className="nav-line2">{theme === 'light' ? 'Dark' : 'Light'}</span>
</button>

</div>

      {/* 5. Account & Sign In (hidden on mobile via CSS) */}
      {user ? (
        <div className="header-nav-item account-menu">
          <span className="nav-line1">Hello, {user.name}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="nav-line2">Account</span>
            <button onClick={logout} title="Sign Out" style={{ background: 'none', border: 'none', color: '#febd69', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '4px' }}>
              <LogOut size={14} />
            </button>
          </div>
        </div>
      ) : (
        <Link to="/login" className="header-nav-item account-menu" style={{ textDecoration: 'none' }}>
          <span className="nav-line1">Hello, sign in</span>
          <span className="nav-line2">Account & Lists</span>
        </Link>
      )}

      {/* 6. Returns & Orders (hidden on mobile via CSS) */}
      <Link to="/orders" className="header-nav-item orders-menu" style={{ textDecoration: 'none' }}>
        <span className="nav-line1">Returns</span>
        <span className="nav-line2">& Orders</span>
      </Link>

      {/* 7. Wishlist Link (hidden on mobile via CSS, lives in drawer instead) */}
      <Link to="/wishlist" className="header-nav-item cart-link wishlist-desktop" style={{ textDecoration: 'none' }}>
        <div className="cart-icon-container">
          <Heart size={24} color="#ffffff" />
          {wishlistCount > 0 && <span className="cart-count">{wishlistCount}</span>}
        </div>
        <span className="cart-text">Wishlist</span>
      </Link>

      {/* 8. Cart Link (always visible) */}
      <Link to="/cart" className="header-nav-item cart-link" style={{ textDecoration: 'none' }}>
        <div className="cart-icon-container">
          <ShoppingCart size={30} color="#ffffff" />
          <span className="cart-count">{cartCount}</span>
        </div>
        <span className="cart-text">Cart</span>
      </Link>

      {/* 9. Mobile Hamburger Toggle (hidden on desktop via CSS) */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={26} />
      </button>

      {/* 10. Mobile Drawer Menu */}
      <div className={`mobile-drawer-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)}>
        {mobileMenuOpen && (
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                {user ? `Hello, ${user.name}` : 'Hello, sign in'}
              </span>
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                <X size={22} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderBottom: '1px solid #eee', color: '#555', fontSize: '13px' }}>
              <MapPin size={16} /> Deliver to India
            </div>

            {!user ? (
              <button className="mobile-drawer-item" onClick={() => handleMobileNavigate('/login')}>
                <User size={18} /> Sign In / Register
              </button>
            ) : (
              <button className="mobile-drawer-item" onClick={handleMobileLogout}>
                <LogOut size={18} /> Sign Out
              </button>
            )}

            <button className="mobile-drawer-item" onClick={() => handleMobileNavigate('/orders')}>
              <Package size={18} /> Your Orders
            </button>

            <button className="mobile-drawer-item" onClick={() => handleMobileNavigate('/wishlist')}>
              <Heart size={18} /> Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
            </button>

            <button className="mobile-drawer-item" onClick={toggleTheme}>
  {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
</button>

<div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', color: '#555', fontSize: '13px' }}>
              <img
                src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg"
                alt="India Flag"
                style={{ width: '18px', height: '12px', objectFit: 'cover' }}
              />
              English (EN)
            </div>
          </div>
        )}
      </div>
    </header>
  );
}