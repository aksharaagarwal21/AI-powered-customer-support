import { useState, useEffect } from 'react';
import { getAnalytics } from '../api';
import StatCard from '../components/StatCard';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      const result = await getAnalytics();
      setData(result);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="h-8 w-48 bg-surface-3/50 rounded-lg shimmer mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-surface-2/50 rounded-2xl shimmer" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-surface-2/50 rounded-2xl shimmer" />)}
        </div>
      </div>
    );
  }

  const o = data?.overview || {};

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
        <p className="text-sm text-text-secondary mt-1">Performance metrics and customer insights</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
          <StatCard title="Avg Resolution" value={`${o.avg_resolution_hours || 0}h`} icon="⏱️" color="#3b82f6" subtitle="Average time to resolve" />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '50ms' }}>
          <StatCard title="Avg Sentiment" value={o.avg_sentiment || 0} icon="😊" color="#10b981" subtitle="Across all tickets" />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <StatCard title="Resolution Rate" value={`${o.resolution_rate || 0}%`} icon="📈" color="#8b5cf6" subtitle={`${o.resolved_tickets || 0} resolved`} />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
          <StatCard title="CSAT Score" value={o.csat_score ? `${o.csat_score}/5` : 'N/A'} icon="⭐" color="#f59e0b" subtitle={`${o.csat_total || 0} total ratings`} />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Intent Distribution */}
        <div className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h3 className="text-sm font-semibold text-text-primary mb-4">Intent Distribution</h3>
          <IntentChart data={data?.intent_distribution || []} total={o.total_tickets || 1} />
        </div>

        {/* CSAT Distribution */}
        <div className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '250ms' }}>
          <h3 className="text-sm font-semibold text-text-primary mb-4">CSAT Ratings Distribution</h3>
          <CSATChart data={data?.csat_distribution || []} />
        </div>

        {/* Priority Distribution */}
        <div className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <h3 className="text-sm font-semibold text-text-primary mb-4">Priority Distribution</h3>
          <PriorityChart data={data?.priority_distribution || []} />
        </div>

        {/* Customer Tier Breakdown */}
        <div className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '350ms' }}>
          <h3 className="text-sm font-semibold text-text-primary mb-4">Customer Tier Analysis</h3>
          <TierBreakdown data={data?.tier_breakdown || []} />
        </div>

        {/* Ticket Volume (full width) */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <h3 className="text-sm font-semibold text-text-primary mb-4">Ticket Volume (Last 7 Days)</h3>
          <VolumeChart data={data?.ticket_volume || []} />
        </div>

        {/* Top Escalation Reasons */}
        {(data?.top_escalations || []).length > 0 && (
          <div className="lg:col-span-2 glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '450ms' }}>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Top Escalation Reasons</h3>
            <div className="space-y-3">
              {data.top_escalations.map((esc, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span className="text-xs text-text-muted w-6 text-right">{idx + 1}.</span>
                  <div className="flex-1">
                    <p className="text-sm text-text-primary">{esc.escalation_reason}</p>
                    <div className="mt-1 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-red rounded-full transition-all duration-700"
                        style={{ width: `${Math.min((esc.count / (data.top_escalations[0]?.count || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-text-muted font-medium">{esc.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==============================
   Chart Components (SVG-based)
   ============================== */

function IntentChart({ data, total }) {
  const colors = {
    billing: '#f59e0b', technical: '#3b82f6', account: '#8b5cf6',
    complaint: '#ef4444', refund: '#f97316', general: '#64748b',
  };

  return (
    <div className="space-y-3">
      {data.map(({ intent, count }) => {
        const pct = Math.round((count / total) * 100);
        return (
          <div key={intent}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ background: colors[intent] || '#64748b' }} />
                <span className="text-xs text-text-primary capitalize font-medium">{intent}</span>
              </div>
              <span className="text-xs text-text-muted">{count} ({pct}%)</span>
            </div>
            <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${pct}%`, background: colors[intent] || '#64748b' }}
              />
            </div>
          </div>
        );
      })}
      {data.length === 0 && <p className="text-xs text-text-muted text-center py-4">No data yet</p>}
    </div>
  );
}

function CSATChart({ data }) {
  const max = Math.max(...data.map(d => d.count), 1);
  const labels = ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'];
  const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981'];

  // Fill in missing ratings
  const filledData = [1, 2, 3, 4, 5].map(rating => {
    const found = data.find(d => d.rating === rating);
    return { rating, count: found ? found.count : 0 };
  });

  return (
    <div className="flex items-end gap-3 h-40 pt-4">
      {filledData.map(({ rating, count }, idx) => {
        const height = max > 0 ? (count / max) * 100 : 0;
        return (
          <div key={rating} className="flex-1 flex flex-col items-center gap-2">
            <span className="text-xs text-text-muted font-medium">{count}</span>
            <div className="w-full bg-surface-3 rounded-t-lg relative overflow-hidden" style={{ height: '100px' }}>
              <div
                className="absolute bottom-0 w-full rounded-t-lg transition-all duration-1000"
                style={{ height: `${height}%`, background: colors[idx] }}
              />
            </div>
            <span className="text-[10px] text-text-muted">{rating}★</span>
          </div>
        );
      })}
    </div>
  );
}

function PriorityChart({ data }) {
  const colors = { low: '#64748b', medium: '#f59e0b', high: '#f97316', urgent: '#ef4444' };
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;

  return (
    <div className="space-y-3">
      {['urgent', 'high', 'medium', 'low'].map(priority => {
        const item = data.find(d => d.priority === priority);
        const count = item?.count || 0;
        const pct = Math.round((count / total) * 100);
        return (
          <div key={priority}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs capitalize font-medium" style={{ color: colors[priority] }}>{priority}</span>
              <span className="text-xs text-text-muted">{count} ({pct}%)</span>
            </div>
            <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: colors[priority] }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TierBreakdown({ data }) {
  const colors = { standard: '#64748b', premium: '#8b5cf6', vip: '#f59e0b' };

  return (
    <div className="space-y-4">
      {data.map(({ tier, ticket_count, avg_sentiment }) => (
        <div key={tier} className="flex items-center gap-4">
          <div className="flex items-center gap-2 w-24">
            <div className="w-3 h-3 rounded" style={{ background: colors[tier] || '#64748b' }} />
            <span className="text-xs capitalize font-medium" style={{ color: colors[tier] }}>
              {tier} {tier === 'vip' && '⭐'}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-text-muted">{ticket_count} tickets</span>
              <span className="text-xs text-text-muted">Avg sentiment: {Math.round(avg_sentiment)}</span>
            </div>
            <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${avg_sentiment}%`, background: colors[tier] }}
              />
            </div>
          </div>
        </div>
      ))}
      {data.length === 0 && <p className="text-xs text-text-muted text-center py-4">No data yet</p>}
    </div>
  );
}

function VolumeChart({ data }) {
  if (data.length === 0) {
    return <p className="text-xs text-text-muted text-center py-8">No ticket volume data for the last 7 days</p>;
  }

  const maxTotal = Math.max(...data.map(d => d.total), 1);
  const width = 600;
  const height = 150;
  const padding = 30;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height + padding}`} className="w-full" style={{ minWidth: '400px' }}>
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map(p => (
          <g key={p}>
            <line
              x1={padding} y1={height * (1 - p)} x2={width} y2={height * (1 - p)}
              stroke="rgba(148,163,184,0.08)" strokeDasharray="4"
            />
            <text x={0} y={height * (1 - p) + 4} fill="#64748b" fontSize="9">{Math.round(maxTotal * p)}</text>
          </g>
        ))}

        {/* Bars */}
        {data.map((d, i) => {
          const barWidth = Math.min((width - padding) / data.length - 8, 40);
          const x = padding + i * ((width - padding) / data.length) + ((width - padding) / data.length - barWidth) / 2;
          const totalH = (d.total / maxTotal) * height;
          const resolvedH = (d.resolved / maxTotal) * height;

          return (
            <g key={i}>
              {/* Total bar */}
              <rect x={x} y={height - totalH} width={barWidth} height={totalH} rx={4} fill="#3b82f6" opacity={0.3} />
              {/* Resolved bar */}
              <rect x={x} y={height - resolvedH} width={barWidth} height={resolvedH} rx={4} fill="#10b981" opacity={0.7} />
              {/* Date label */}
              <text x={x + barWidth / 2} y={height + 16} fill="#64748b" fontSize="9" textAnchor="middle">
                {new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
              </text>
              {/* Count */}
              <text x={x + barWidth / 2} y={height - totalH - 5} fill="#94a3b8" fontSize="9" textAnchor="middle">
                {d.total}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform={`translate(${width - 180}, ${height + 20})`}>
          <rect x={0} y={0} width={10} height={10} rx={2} fill="#3b82f6" opacity={0.3} />
          <text x={14} y={9} fill="#94a3b8" fontSize="9">Total</text>
          <rect x={50} y={0} width={10} height={10} rx={2} fill="#10b981" opacity={0.7} />
          <text x={64} y={9} fill="#94a3b8" fontSize="9">Resolved</text>
        </g>
      </svg>
    </div>
  );
}
