import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SkeletonProductDetails from '../components/SkeletonProductDetails';

function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [added, setAdded] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState('');

  // Fetch Product & Local Reviews
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await fetch(`https://fakestoreapi.com/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();

    // Load stored reviews for this product ID from localStorage
    const savedReviews = localStorage.getItem(`amazon_react_reviews_${id}`);
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    } else {
      setReviews([]);
    }
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  // Submit New Review Handler
  const handleReviewSubmit = (e) => {
    e.preventDefault();

    if (!newComment.trim()) {
      showToast('Please write a review comment before submitting.', 'error');
      return;
    }

    const reviewObj = {
      id: Date.now(),
      userName: user ? user.name : 'Amazon Customer',
      rating: newRating,
      comment: newComment.trim(),
      date: new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    };

    const updatedReviews = [reviewObj, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(`amazon_react_reviews_${id}`, JSON.stringify(updatedReviews));

    setNewComment('');
    setNewRating(5);
    showToast('🎉 Review submitted successfully!', 'success');
  };

  if (loading) return <SkeletonProductDetails />;

  if (error || !product) {
    return (
      <div className="error-box">
        <p>⚠️ Product not found.</p>
        <Link to="/" style={{ color: '#007185', textDecoration: 'underline' }}>Back to Home</Link>
      </div>
    );
  }

  const priceINR = Math.round(product.price * 80);

  // Calculate dynamic rating combining API rating + User reviews
  const baseRate = product.rating?.rate || 4.2;
  const baseCount = product.rating?.count || 120;
  const totalReviewsCount = baseCount + reviews.length;
  
  const userReviewsSum = reviews.reduce((sum, r) => sum + r.rating, 0);
  const calculatedAvg = ((baseRate * baseCount + userReviewsSum) / totalReviewsCount).toFixed(1);

  return (
    <div className="product-details-page">
      {/* Top Product Details Card */}
      <div className="details-container">
        {/* Left: Product Image */}
        <div className="details-image-box">
          <img src={product.image} alt={product.title} className="details-image" />
        </div>

        {/* Center: Details */}
        <div className="details-info">
          <p className="details-category">Category: {product.category}</p>
          <h1 className="details-title">{product.title}</h1>

          <div className="details-rating" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#ffa41c', display: 'flex', alignItems: 'center' }}>
              <Star size={18} fill="#ffa41c" color="#ffa41c" />
              <strong style={{ marginLeft: '4px' }}>{calculatedAvg}</strong>
            </span>
            <span style={{ color: '#007185' }}>({totalReviewsCount} ratings)</span>
          </div>

          <hr className="details-divider" />

          <h3 className="details-description-title">About this item</h3>
          <p className="details-description">{product.description}</p>
        </div>

        {/* Right: Buy Box */}
        <div className="details-buy-box">
          <div className="details-price">₹{priceINR.toLocaleString('en-IN')}</div>
          <div className="details-stock">In Stock</div>
          <p style={{ fontSize: '13px', color: '#555', marginBottom: '15px' }}>
            FREE delivery available for this item.
          </p>

          <button
            className="details-add-btn"
            onClick={handleAddToCart}
            style={{ backgroundColor: added ? '#2ecc71' : '#ffd814', color: added ? 'white' : 'black' }}
          >
            {added ? '✓ Added to Cart' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Customer Reviews & Form Section */}
      <div className="reviews-section">
        <div className="reviews-grid">
          {/* Left Column: Rating Score Breakdown */}
          <div className="reviews-summary-box">
            <h2 className="reviews-summary-title">Customer Reviews</h2>

            <div className="reviews-score-large">
              <span>{calculatedAvg}</span>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={22}
                    fill={star <= Math.round(calculatedAvg) ? '#ffa41c' : 'none'}
                    color="#ffa41c"
                  />
                ))}
              </div>
            </div>

            <p className="reviews-count-text">
              Based on {totalReviewsCount} global ratings ({reviews.length} written customer reviews)
            </p>
          </div>

          {/* Right Column: Write Review Form + Posted Reviews List */}
          <div>
            {/* Form */}
            <form className="add-review-box" onSubmit={handleReviewSubmit}>
              <h3 className="add-review-title">Create Review</h3>

              {/* Star Rating Selection */}
              <div className="star-picker-row">
                <span style={{ fontSize: '13px', fontWeight: 'bold', marginRight: '6px' }}>
                  Select Rating:
                </span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={24}
                    onClick={() => setNewRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    fill={(hoverRating || newRating) >= star ? '#ffa41c' : 'none'}
                    color="#ffa41c"
                    style={{ cursor: 'pointer' }}
                  />
                ))}
                <span style={{ fontSize: '13px', color: '#555', marginLeft: '6px' }}>
                  ({hoverRating || newRating} / 5 Stars)
                </span>
              </div>

              {/* Text Area */}
              <textarea
                className="review-textarea"
                placeholder="What did you like or dislike about this product?"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />

              <button type="submit" className="submit-review-btn">
                Submit Review
              </button>
            </form>

            {/* List of Posted Customer Reviews */}
            <div className="reviews-list">
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                User Reviews ({reviews.length})
              </h3>

              {reviews.length === 0 ? (
                <p style={{ color: '#767676', fontSize: '14px', italic: 'true' }}>
                  No written reviews yet. Be the first to review this item!
                </p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="review-card-item">
                    <div className="review-user-row">
                      <div className="review-avatar">{rev.userName.charAt(0).toUpperCase()}</div>
                      <span className="review-username">{rev.userName}</span>
                    </div>

                    <div className="review-stars-date">
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            fill={star <= rev.rating ? '#ffa41c' : 'none'}
                            color="#ffa41c"
                          />
                        ))}
                      </div>
                      <span className="review-date">Reviewed in India on {rev.date}</span>
                    </div>

                    <p className="review-comment">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;