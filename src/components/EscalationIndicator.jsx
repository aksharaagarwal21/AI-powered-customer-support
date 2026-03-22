const riskConfig = {
  Low: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', icon: '✓' },
  Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', icon: '!' },
  High: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', icon: '⚡' },
};

export default function EscalationIndicator({ level = 'Low' }) {
  const config = riskConfig[level] || riskConfig.Low;
  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
      style={{ background: config.bg, color: config.color, border: `1px solid ${config.border}` }}
    >
      <span className="text-sm">{config.icon}</span>
      <span>Escalation Risk: {level}</span>
    </div>
  );
}
