'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  size?: number;
}

export function StarRating({ value, onChange, size = 16 }: StarRatingProps) {
  return (
    <div className="stars" role="group" aria-label={`Avaliação: ${value} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        return (
          <button
            key={star}
            type="button"
            className={`star-btn ${filled ? 'filled' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onChange?.(star);
            }}
            disabled={!onChange}
            title={`${star} estrela${star > 1 ? 's' : ''}`}
            aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
          >
            <Star size={size} fill={filled ? 'currentColor' : 'none'} />
          </button>
        );
      })}
    </div>
  );
}
