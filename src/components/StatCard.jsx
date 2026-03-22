export default function StatCard({ title, value, subtitle, icon, color = '#3b82f6', trend }) {
  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold mt-2" style={{ color }}>{value}</p>
          {subtitle && <p className="text-xs text-text-secondary mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
              <span>{trend >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend)}% vs last week</span>
            </div>
          )}
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0"
          style={{ background: `${color}15`, color }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
