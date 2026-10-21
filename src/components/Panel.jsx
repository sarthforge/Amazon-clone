import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Menu } from 'lucide-react';

function Panel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';

  const categories = [
    { label: 'All', id: 'all' },
    { label: 'Electronics', id: 'electronics' },
    { label: 'Jewelery', id: 'jewelery' },
    { label: "Men's Fashion", id: "men's clothing" },
    { label: "Women's Fashion", id: "women's clothing" },
  ];

  const handleCategoryClick = (catId) => {
    if (catId === 'all') {
      navigate('/');
    } else {
      navigate(`/?category=${encodeURIComponent(catId)}`);
    }
  };

  return (
    <div className="panel">
      <div
        className={`panel-all border ${currentCategory === 'all' ? 'active-cat' : ''}`}
        onClick={() => handleCategoryClick('all')}
        style={{ cursor: 'pointer' }}
      >
        <Menu size={18} />
        <span>All</span>
      </div>

      <div className="panel-ops">
        {categories.slice(1).map((cat) => (
          <p
            key={cat.id}
            className={`border ${currentCategory === cat.id ? 'active-cat' : ''}`}
            onClick={() => handleCategoryClick(cat.id)}
            style={{ cursor: 'pointer' }}
          >
            {cat.label}
          </p>
        ))}
      </div>

      <div className="panel-deals border">
        Shop deals in Electronics
      </div>
    </div>
  );
}

export default Panel;