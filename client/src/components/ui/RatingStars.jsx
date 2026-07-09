import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({
  value = 0,
  onChange,
  size = 20,
  readOnly = false,
  id,
}) => {
  const [hoverValue, setHoverValue] = useState(null);

  const handleClick = (starValue) => {
    if (readOnly || !onChange) return;
    onChange(starValue);
  };

  const handleMouseEnter = (starValue) => {
    if (readOnly || !onChange) return;
    setHoverValue(starValue);
  };

  const handleMouseLeave = () => {
    if (readOnly || !onChange) return;
    setHoverValue(null);
  };

  const displayValue = hoverValue !== null ? hoverValue : value;

  return (
    <div id={id} className="rating" style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayValue;
        return (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: readOnly ? 'default' : 'pointer',
              color: isFilled ? 'var(--accent-primary)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              transition: 'color var(--transition-fast) ease',
            }}
          >
            <Star
              size={size}
              fill={isFilled ? 'var(--accent-primary)' : 'none'}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
};

export default RatingStars;
