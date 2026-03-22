const intentConfig = {
  billing: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', icon: '💳' },
  technical: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', icon: '🔧' },
  account: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)', icon: '👤' },
  complaint: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', icon: '⚠️' },
  refund: { color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.25)', icon: '💰' },
  general: { color: '#64748b', bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.25)', icon: '💬' },
};

export default function IntentBadge({ intent, showIcon = true }) {
  const config = intentConfig[intent] || intentConfig.general;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold capitalize"
      style={{ background: config.bg, color: config.color, border: `1px solid ${config.border}` }}
    >
      {showIcon && <span className="text-[10px]">{config.icon}</span>}
      {intent}
    </span>
  );
}
