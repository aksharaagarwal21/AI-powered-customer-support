import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAnalytics, getTickets } from '../api';
import StatCard from '../components/StatCard';
import IntentBadge from '../components/IntentBadge';
import { SentimentBadge } from '../components/SentimentMeter';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [analyticsData, ticketsData] = await Promise.all([
        getAnalytics(),
        getTickets({ sort: 'created_at', order: 'DESC', limit: 5 })
      ]);
      setAnalytics(analyticsData);
      setTickets(ticketsData.tickets || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSkeleton />;

  const o = analytics?.overview || {};

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">Real-time overview of your support operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
          <StatCard title="Open Tickets" value={o.open_tickets || 0} icon="🎫" color="#3b82f6" subtitle={`${o.total_tickets || 0} total`} />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '50ms' }}>
          <StatCard title="Escalated" value={o.escalated_tickets || 0} icon="⚡" color="#ef4444" subtitle="Needs attention" />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <StatCard title="Resolution Rate" value={`${o.resolution_rate || 0}%`} icon="✅" color="#10b981" subtitle={`${o.resolved_tickets || 0} resolved`} />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
          <StatCard title="CSAT Score" value={o.csat_score ? `${o.csat_score}/5` : 'N/A'} icon="⭐" color="#f59e0b" subtitle={`${o.csat_total || 0} ratings`} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tickets */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-primary">Recent Tickets</h2>
            <Link to="/tickets" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">View all →</Link>
          </div>
          <div className="space-y-2">
            {tickets.map(ticket => (
              <Link
                key={ticket.id}
                to={`/chat/${ticket.id}`}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <StatusDot status={ticket.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate group-hover:text-brand-300 transition-colors">{ticket.subject}</p>
                  <p className="text-xs text-text-muted mt-0.5">{ticket.customer_name} · {formatTime(ticket.created_at)}</p>
                </div>
                <IntentBadge intent={ticket.intent} showIcon={false} />
                <SentimentBadge score={ticket.sentiment_score} />
              </Link>
            ))}
            {tickets.length === 0 && (
              <p className="text-sm text-text-muted text-center py-8">No tickets yet. Start a conversation!</p>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Intent Distribution */}
          <div className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '250ms' }}>
            <h2 className="text-base font-semibold text-text-primary mb-4">Intent Distribution</h2>
            <div className="space-y-3">
              {(analytics?.intent_distribution || []).map(({ intent, count }) => {
                const total = analytics?.overview?.total_tickets || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={intent}>
                    <div className="flex items-center justify-between mb-1">
                      <IntentBadge intent={intent} />
                      <span className="text-xs text-text-muted">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: getIntentColor(intent) }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <h2 className="text-base font-semibold text-text-primary mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                to="/chat"
                className="flex items-center gap-3 p-3 rounded-xl bg-brand-600/20 hover:bg-brand-600/30 text-brand-400 transition-colors"
              >
                <span className="text-lg">💬</span>
                <span className="text-sm font-medium">New Conversation</span>
              </Link>
              <Link
                to="/tickets?status=escalated"
                className="flex items-center gap-3 p-3 rounded-xl bg-accent-red/10 hover:bg-accent-red/20 text-accent-red transition-colors"
              >
                <span className="text-lg">⚡</span>
                <span className="text-sm font-medium">View Escalated ({o.escalated_tickets || 0})</span>
              </Link>
              <Link
                to="/analytics"
                className="flex items-center gap-3 p-3 rounded-xl bg-accent-purple/10 hover:bg-accent-purple/20 text-accent-purple transition-colors"
              >
                <span className="text-lg">📊</span>
                <span className="text-sm font-medium">View Analytics</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusDot({ status }) {
  const colors = {
    open: 'bg-brand-400',
    escalated: 'bg-accent-red animate-pulse-glow',
    resolved: 'bg-accent-green',
    closed: 'bg-text-muted',
  };
  return <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${colors[status] || colors.open}`} />;
}

function getIntentColor(intent) {
  const colors = {
    billing: '#f59e0b',
    technical: '#3b82f6',
    account: '#8b5cf6',
    complaint: '#ef4444',
    refund: '#f97316',
    general: '#64748b',
  };
  return colors[intent] || colors.general;
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffHrs = diffMs / (1000 * 60 * 60);
  if (diffHrs < 1) return `${Math.round(diffMs / (1000 * 60))}m ago`;
  if (diffHrs < 24) return `${Math.round(diffHrs)}h ago`;
  return `${Math.round(diffHrs / 24)}d ago`;
}

function LoadingSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="h-8 w-48 bg-surface-3/50 rounded-lg shimmer mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-surface-2/50 rounded-2xl shimmer" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-surface-2/50 rounded-2xl shimmer" />
        <div className="h-80 bg-surface-2/50 rounded-2xl shimmer" />
      </div>
    </div>
  );
}
