import { useState } from 'react';

export default function CSATModal({ ticketId, onSubmit, onClose }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    try {
      await onSubmit(ticketId, rating, comment);
      setSubmitted(true);
      setTimeout(onClose, 2000);
    } catch (err) {
      console.error('Failed to submit CSAT:', err);
    }
  };

  const labels = ['', 'Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'];

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
        <div className="glass-card rounded-2xl p-8 max-w-sm w-full mx-4 text-center" onClick={e => e.stopPropagation()}>
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-text-primary">Thank You!</h3>
          <p className="text-sm text-text-secondary mt-2">Your feedback helps us improve.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 max-w-sm w-full mx-4 animate-slide-up" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-text-primary mb-2">Rate Your Experience</h3>
        <p className="text-sm text-text-secondary mb-6">How satisfied were you with the support you received?</p>

        {/* Star rating */}
        <div className="flex justify-center gap-2 mb-3">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="text-3xl transition-transform hover:scale-125 cursor-pointer"
            >
              {star <= (hoveredRating || rating) ? '⭐' : '☆'}
            </button>
          ))}
        </div>
        <p className="text-xs text-text-muted text-center h-4 mb-4">
          {labels[hoveredRating || rating] || ''}
        </p>

        {/* Comment */}
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Any additional feedback? (optional)"
          rows={3}
          className="w-full bg-surface-3/50 border border-white/10 rounded-xl p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 resize-none"
        />

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-white/5 transition-colors cursor-pointer"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-brand-600 text-white hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Submit Rating
          </button>
        </div>
      </div>
    </div>
  );
}
