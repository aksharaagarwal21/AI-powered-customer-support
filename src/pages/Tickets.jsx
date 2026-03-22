import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getTickets, updateTicket } from '../api';
import IntentBadge from '../components/IntentBadge';
import { SentimentBadge } from '../components/SentimentMeter';

const statusFilters = [
  { value: '', label: 'All', icon: '📋' },
  { value: 'open', label: 'Open', icon: '🟢' },
  { value: 'escalated', label: 'Escalated', icon: '🔴' },
  { value: 'resolved', label: 'Resolved', icon: '✅' },
  { value: 'closed', label: 'Closed', icon: '🔒' },
];

export default function Tickets() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(searchParams.get('status') || '');

  useEffect(() => {
    loadTickets();
  }, [activeFilter]);

  async function loadTickets() {
    setLoading(true);
    try {
      const data = await getTickets({ status: activeFilter || undefined, sort: 'created_at', order: 'DESC' });
      setTickets(data.tickets || []);
      setStatusCounts(data.status_counts || {});
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(value) {
    setActiveFilter(value);
    if (value) {
      setSearchParams({ status: value });
    } else {
      setSearchParams({});
    }
  }

  async function handleStatusChange(ticketId, newStatus) {
    try {
      await updateTicket(ticketId, { status: newStatus });
      loadTickets();
    } catch (err) {
      console.error('Failed to update ticket:', err);
    }
  }

  const totalTickets = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Tickets</h1>
          <p className="text-sm text-text-secondary mt-1">{totalTickets} total tickets</p>
        </div>
        <Link
          to="/chat"
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
        >
          <span>+</span> New Ticket
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {statusFilters.map(({ value, label, icon }) => {
          const count = value ? (statusCounts[value] || 0) : totalTickets;
          return (
            <button
              key={value}
              onClick={() => handleFilterChange(value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === value
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
                  : 'glass-card text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}
            >
              <span className="text-xs">{icon}</span>
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-md ${activeFilter === value ? 'bg-brand-600/30' : 'bg-surface-3/50'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Ticket List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-surface-2/50 rounded-xl shimmer" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎫</div>
          <p className="text-text-secondary text-sm">No tickets found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((ticket, idx) => (
            <div
              key={ticket.id}
              className="glass-card glass-card-hover rounded-xl p-4 animate-slide-up"
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <div className="flex items-center gap-4">
                <StatusBadge status={ticket.status} />
                <div className="flex-1 min-w-0">
                  <Link to={`/chat/${ticket.id}`} className="text-sm font-semibold text-text-primary hover:text-brand-300 transition-colors">
                    {ticket.subject}
                  </Link>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-text-muted">
                      {ticket.customer_name || 'Unknown'}
                      {ticket.customer_tier === 'vip' && <span className="ml-1 text-amber-400">⭐ VIP</span>}
                    </span>
                    <span className="text-xs text-text-muted">·</span>
                    <span className="text-xs text-text-muted">{formatDate(ticket.created_at)}</span>
                    {ticket.message_count && (
                      <>
                        <span className="text-xs text-text-muted">·</span>
                        <span className="text-xs text-text-muted">{ticket.message_count} messages</span>
                      </>
                    )}
                  </div>
                </div>
                <IntentBadge intent={ticket.intent} />
                <SentimentBadge score={ticket.sentiment_score} />
                <PriorityBadge priority={ticket.priority} />
                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {ticket.status === 'open' && (
                    <button
                      onClick={() => handleStatusChange(ticket.id, 'resolved')}
                      className="p-1.5 rounded-lg text-accent-green hover:bg-accent-green/10 transition-colors text-xs cursor-pointer"
                      title="Resolve"
                    >
                      ✓
                    </button>
                  )}
                  {ticket.status === 'escalated' && (
                    <button
                      onClick={() => handleStatusChange(ticket.id, 'open')}
                      className="p-1.5 rounded-lg text-brand-400 hover:bg-brand-400/10 transition-colors text-xs cursor-pointer"
                      title="De-escalate"
                    >
                      ↩
                    </button>
                  )}
                  <Link
                    to={`/chat/${ticket.id}`}
                    className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors text-xs"
                    title="Open chat"
                  >
                    →
                  </Link>
                </div>
              </div>
              {ticket.escalation_reason && ticket.status === 'escalated' && (
                <div className="mt-2 ml-18 px-3 py-1.5 bg-accent-red/10 border border-accent-red/20 rounded-lg text-xs text-accent-red">
                  ⚠️ {ticket.escalation_reason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    open: { bg: 'bg-brand-500/20', text: 'text-brand-400', label: 'Open' },
    escalated: { bg: 'bg-accent-red/20', text: 'text-accent-red', label: 'Escalated' },
    resolved: { bg: 'bg-accent-green/20', text: 'text-accent-green', label: 'Resolved' },
    closed: { bg: 'bg-text-muted/20', text: 'text-text-muted', label: 'Closed' },
  };
  const c = config[status] || config.open;
  return (
    <span className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const config = {
    low: { color: '#64748b' },
    medium: { color: '#f59e0b' },
    high: { color: '#f97316' },
    urgent: { color: '#ef4444' },
  };
  const c = config[priority] || config.medium;
  return (
    <span className="text-xs font-medium capitalize" style={{ color: c.color }}>
      {priority}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
