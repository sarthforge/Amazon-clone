import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';

const PAGE_SIZE = 8;

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Infinite scroll
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef(null);

  // Filter States
  const [sortBy, setSortBy] = useState('featured');
  const [priceFilter, setPriceFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState(0);

  // URL Parameters
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryQuery = searchParams.get('category') || 'all';

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(false);
      // Fetch ALL products so infinite scroll + filters work on the full catalog
      const res = await fetch('https://fakestoreapi.com/products');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Reset visible window whenever filters / search / sort change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [sortBy, priceFilter, ratingFilter, searchQuery, categoryQuery]);

  const handleClearFilters = () => {
    setPriceFilter('all');
    setRatingFilter(0);
    setSortBy('featured');
  };

  // 1. Multi-Filter Pipeline
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      categoryQuery === 'all' ||
      product.category.toLowerCase() === categoryQuery.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());

    const priceINR = Math.round(product.price * 80);
    let matchesPrice = true;
    if (priceFilter === 'under1000') matchesPrice = priceINR < 1000;
    else if (priceFilter === '1000to5000') matchesPrice = priceINR >= 1000 && priceINR <= 5000;
    else if (priceFilter === 'above5000') matchesPrice = priceINR > 5000;

    const itemRating = product.rating?.rate || 0;
    const matchesRating = itemRating >= ratingFilter;

    return matchesCategory && matchesSearch && matchesPrice && matchesRating;
  });

  // 2. Sorting Pipeline
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = Math.round(a.price * 80);
    const priceB = Math.round(b.price * 80);

    if (sortBy === 'price-low') return priceA - priceB;
    if (sortBy === 'price-high') return priceB - priceA;
    if (sortBy === 'rating') return (b.rating?.rate || 0) - (a.rating?.rate || 0);
    return 0;
  });

  const visibleProducts = sortedProducts.slice(0, visibleCount);
  const hasMore = visibleCount < sortedProducts.length;

  // 3. IntersectionObserver — load next page when sentinel enters viewport
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    // Small delay so the skeleton flash is visible (feels like a real network fetch)
    setTimeout(() => {
      setVisibleCount((prev) => prev + PAGE_SIZE);
      setLoadingMore(false);
    }, 400);
  }, [loadingMore, hasMore]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { root: null, rootMargin: '200px', threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  const hasActiveFilters = priceFilter !== 'all' || ratingFilter > 0 || sortBy !== 'featured';

  return (
    <div className="home">
      {/* Hero Banner */}
      <div className="hero-container">
        <img
          src="https://m.media-amazon.com/images/I/61zAjw4bqPL._SX3000_.jpg"
          alt="Amazon Hero Banner"
          className="hero-image"
        />
      </div>

      {/* Initial Loading — full skeleton layout */}
      {loading && (
        <div className="home-layout">
          <aside className="sidebar-filter">
            <h3 className="sidebar-title">Filters</h3>
            <div className="skeleton skeleton-line" style={{ height: '20px', width: '50%', marginBottom: '15px' }}></div>
            <div className="skeleton skeleton-line" style={{ marginBottom: '10px' }}></div>
            <div className="skeleton skeleton-line" style={{ marginBottom: '10px' }}></div>
            <div className="skeleton skeleton-line" style={{ marginBottom: '10px' }}></div>
            <div className="skeleton skeleton-line short" style={{ marginBottom: '10px' }}></div>
          </aside>
          <main style={{ width: '100%' }}>
            <div className="products-grid" style={{ margin: 0, padding: 0 }}>
              {Array(PAGE_SIZE)
                .fill(0)
                .map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
            </div>
          </main>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-box">
          <p>⚠️ Failed to load products. Check connection.</p>
          <button onClick={fetchProducts}>Retry</button>
        </div>
      )}

      {/* Controls Bar */}
      {!loading && !error && (
        <div className="controls-bar">
          <div className="category-status-text">
            {categoryQuery !== 'all' || searchQuery ? (
              <span>
                {categoryQuery !== 'all' && (
                  <>
                    Category: <strong>{categoryQuery}</strong>
                  </>
                )}
                {categoryQuery !== 'all' && searchQuery && ' | '}
                {searchQuery && (
                  <>
                    Search: <strong>"{searchQuery}"</strong>
                  </>
                )}{' '}
                ({sortedProducts.length} items)
              </span>
            ) : (
              <span>
                Showing <strong>All Products</strong> ({sortedProducts.length} items)
              </span>
            )}
          </div>

          <div className="sort-dropdown-group">
            <label htmlFor="sort-select">Sort by: </label>
            <select
              id="sort-select"
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Avg. Customer Review</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Layout */}
      {!loading && !error && (
        <div className="home-layout">
          <aside className="sidebar-filter">
            <h3 className="sidebar-title">Filters</h3>

            <div className="filter-section">
              <h4 className="filter-heading">Price (INR)</h4>
              <label className="filter-option">
                <input
                  type="radio"
                  name="price"
                  checked={priceFilter === 'all'}
                  onChange={() => setPriceFilter('all')}
                />
                <span>All Prices</span>
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="price"
                  checked={priceFilter === 'under1000'}
                  onChange={() => setPriceFilter('under1000')}
                />
                <span>Under ₹1,000</span>
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="price"
                  checked={priceFilter === '1000to5000'}
                  onChange={() => setPriceFilter('1000to5000')}
                />
                <span>₹1,000 - ₹5,000</span>
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="price"
                  checked={priceFilter === 'above5000'}
                  onChange={() => setPriceFilter('above5000')}
                />
                <span>Over ₹5,000</span>
              </label>
            </div>

            <div className="filter-section">
              <h4 className="filter-heading">Customer Review</h4>
              {[4, 3, 2].map((minRating) => (
                <label key={minRating} className="filter-option">
                  <input
                    type="radio"
                    name="rating"
                    checked={ratingFilter === minRating}
                    onChange={() => setRatingFilter(minRating)}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        fill={s <= minRating ? '#ffa41c' : 'none'}
                        color="#ffa41c"
                      />
                    ))}
                    <span style={{ fontSize: '12px', marginLeft: '4px' }}>& Up</span>
                  </div>
                </label>
              ))}
            </div>

            {hasActiveFilters && (
              <button className="clear-filters-btn" onClick={handleClearFilters}>
                Clear Filters
              </button>
            )}
          </aside>

          <main style={{ width: '100%' }}>
            {sortedProducts.length === 0 ? (
              <div
                className="loading-box"
                style={{
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  padding: '40px',
                  borderRadius: '4px',
                }}
              >
                No products match all selected filters.
              </div>
            ) : (
              <>
                <div className="products-grid" style={{ margin: 0, padding: 0 }}>
                  {visibleProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}

                  {/* Skeletons while next page is "loading" */}
                  {loadingMore &&
                    Array(Math.min(PAGE_SIZE, sortedProducts.length - visibleCount))
                      .fill(0)
                      .map((_, index) => <SkeletonCard key={`more-${index}`} />)}
                </div>

                {/* Sentinel — when this enters the viewport, load more */}
                {hasMore && <div ref={sentinelRef} className="scroll-sentinel" />}

                {/* End of list */}
                {!hasMore && (
                  <div className="end-of-results">
                    You’ve seen all {sortedProducts.length} product
                    {sortedProducts.length !== 1 ? 's' : ''}.
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      )}
    </div>
  );
}

export default Home;