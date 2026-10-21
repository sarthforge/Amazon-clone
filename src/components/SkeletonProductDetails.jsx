function SkeletonProductDetails() {
  return (
    <div className="skeleton-details">
      <div className="skeleton skeleton-main-img"></div>
      <div className="skeleton-info">
        <div className="skeleton skeleton-line title"></div>
        <div className="skeleton skeleton-line short"></div>
        <div className="skeleton skeleton-line"></div>
        <div className="skeleton skeleton-line"></div>
        <div className="skeleton skeleton-line short"></div>
        <div className="skeleton skeleton-btn" style={{ width: '200px', marginTop: '20px' }}></div>
      </div>
    </div>
  );
}

export default SkeletonProductDetails;