export function getSentimentColor(score) {
  if (score < 20) return { text: 'sentiment-critical', bg: 'sentiment-bg-critical', hex: '#ff3d3d', label: 'Critical' };
  if (score < 40) return { text: 'sentiment-low', bg: 'sentiment-bg-low', hex: '#ff6d00', label: 'Low' };
  if (score < 60) return { text: 'sentiment-medium', bg: 'sentiment-bg-medium', hex: '#ffab00', label: 'Neutral' };
  if (score < 80) return { text: 'sentiment-good', bg: 'sentiment-bg-good', hex: '#00e676', label: 'Good' };
  return { text: 'sentiment-excellent', bg: 'sentiment-bg-excellent', hex: '#18ffff', label: 'Excellent' };
}

export function SentimentMeter({ score, size = 80 }) {
  const { hex, label } = getSentimentColor(score);
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke="rgba(148,163,184,0.1)"
            strokeWidth={4}
            fill="none"
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={hex}
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.3s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold" style={{ color: hex }}>{score}</span>
        </div>
      </div>
      <span className="text-xs font-medium" style={{ color: hex }}>{label}</span>
    </div>
  );
}

export function SentimentBadge({ score, compact = false }) {
  const { text, bg } = getSentimentColor(score);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${text}`} style={{ background: 'currentColor' }} />
      {!compact && score}
    </span>
  );
}
