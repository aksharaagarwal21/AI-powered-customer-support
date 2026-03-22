import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sendMessage, getTicket, getCustomers, updateTicket, submitCSAT } from '../api';
import { SentimentMeter } from '../components/SentimentMeter';
import IntentBadge from '../components/IntentBadge';
import EscalationIndicator from '../components/EscalationIndicator';
import CSATModal from '../components/CSATModal';

export default function Chat() {
  const { ticketId: paramTicketId } = useParams();
  const navigate = useNavigate();
  const [ticketId, setTicketId] = useState(paramTicketId || null);
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!paramTicketId);
  const [typing, setTyping] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [escalation, setEscalation] = useState(null);
  const [showCSAT, setShowCSAT] = useState(false);
  const [suggestClose, setSuggestClose] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (paramTicketId) {
      loadTicket(paramTicketId);
    } else {
      setInitialLoading(false);
      loadCustomers();
    }
  }, [paramTicketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (!initialLoading && !loading) {
      inputRef.current?.focus();
    }
  }, [initialLoading, loading]);

  async function loadCustomers() {
    try {
      const data = await getCustomers();
      setCustomers(data.customers || []);
      if (data.customers?.length > 0) {
        setSelectedCustomer(data.customers[0].id);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
      setError('Failed to connect to server. Is the backend running on port 3001?');
    }
  }

  async function loadTicket(id) {
    setInitialLoading(true);
    try {
      const data = await getTicket(id);
      setTicket(data.ticket);
      setMessages(data.messages || []);
      setTicketId(data.ticket.id);
      setError(null);
    } catch (err) {
      console.error('Failed to load ticket:', err);
      setError('Failed to load ticket. It may not exist.');
    } finally {
      setInitialLoading(false);
    }
  }

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);
    setTyping(true);
    setSuggestClose(false);
    setError(null);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    // Optimistically add user message
    const tempMsg = {
      id: 'temp-' + Date.now(),
      role: 'customer',
      content: userMessage,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const data = await sendMessage(ticketId, userMessage, selectedCustomer || undefined);

      // Update ticket ID if new
      if (data.is_new_ticket && data.ticket_id) {
        setTicketId(data.ticket_id);
        navigate(`/chat/${data.ticket_id}`, { replace: true });
      }

      // Update ticket info
      if (data.ticket) {
        setTicket(data.ticket);
      }

      // Update escalation
      if (data.escalation) {
        setEscalation(data.escalation);
      }

      // Add AI response with small delay for natural feel
      await new Promise(r => setTimeout(r, 300));

      if (data.message) {
        setMessages(prev => [...prev, data.message]);
      }

      // Check suggest close
      if (data.suggest_close) {
        setSuggestClose(true);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Check if the backend server is running.');
      setMessages(prev => [...prev, {
        id: 'error-' + Date.now(),
        role: 'system',
        content: '⚠️ Failed to get AI response. Please check the server connection and try again.',
        created_at: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
      setTyping(false);
      inputRef.current?.focus();
    }
  }

  async function handleResolve() {
    if (!ticketId) return;
    try {
      await updateTicket(ticketId, { status: 'resolved' });
      setTicket(prev => ({ ...prev, status: 'resolved' }));
      setShowCSAT(true);
    } catch (err) {
      console.error('Failed to resolve ticket:', err);
    }
  }

  async function handleCSAT(tId, rating, comment) {
    await submitCSAT(tId, rating, comment);
  }

  function handleNewChat() {
    setTicketId(null);
    setTicket(null);
    setMessages([]);
    setEscalation(null);
    setSuggestClose(false);
    setError(null);
    navigate('/chat');
    loadCustomers();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const sentiment = ticket?.sentiment_score ?? 50;
  const riskLevel = escalation?.riskLevel || (sentiment < 30 ? 'High' : sentiment < 60 ? 'Medium' : 'Low');
  const isResolved = ticket?.status === 'resolved' || ticket?.status === 'closed';

  // Loading state
  if (initialLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-text-secondary">Loading ticket...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="shrink-0 px-6 py-4 border-b border-white/5" style={{ background: 'rgba(5,5,5,0.9)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-bold text-text-primary truncate">
                  {ticket?.subject || '💬 New Conversation'}
                </h1>
                {ticket && <StatusPill status={ticket.status} />}
              </div>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {ticket && (
                  <>
                    <IntentBadge intent={ticket.intent || 'general'} />
                    <EscalationIndicator level={riskLevel} />
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              {ticket && (
                <button
                  onClick={handleNewChat}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-text-secondary text-xs font-medium rounded-xl transition-colors cursor-pointer border border-white/5"
                >
                  + New Chat
                </button>
              )}
              {ticket && !isResolved && (
                <button
                  onClick={handleResolve}
                  className="px-4 py-2 bg-accent-green/15 hover:bg-accent-green/25 text-accent-green text-sm font-medium rounded-xl transition-colors cursor-pointer border border-accent-green/20"
                >
                  ✓ Resolve
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-6 mt-3 px-4 py-3 bg-accent-red/10 border border-accent-red/20 rounded-xl text-sm text-accent-red flex items-center gap-2 animate-slide-up">
            <span>⚠️</span>
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-accent-red/60 hover:text-accent-red cursor-pointer">✕</button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* New chat welcome */}
          {messages.length === 0 && !ticketId && (
            <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-500 via-accent-purple to-accent-cyan flex items-center justify-center text-4xl mb-6 shadow-2xl" style={{ boxShadow: '0 0 60px rgba(59,130,246,0.2), 0 0 120px rgba(139,92,246,0.1)' }}>
                🧠
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">ACSCAM AI Support</h2>
              <p className="text-sm text-text-secondary max-w-md mb-8 leading-relaxed">
                Describe your issue below and I'll assist you with intelligent, adaptive support — 
                or connect you with a human agent if needed.
              </p>

              {/* Customer selector */}
              {customers.length > 0 && (
                <div className="glass-card rounded-2xl p-5 w-full max-w-md">
                  <label className="text-xs text-text-muted block mb-2 uppercase tracking-wider font-medium">Simulating as customer</label>
                  <select
                    value={selectedCustomer}
                    onChange={e => setSelectedCustomer(e.target.value)}
                    className="w-full bg-surface-3 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.tier.toUpperCase()}) — {c.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quick start suggestions */}
              <div className="mt-8 flex flex-wrap gap-2 justify-center max-w-lg">
                {[
                  { emoji: '💳', text: 'I have a billing question' },
                  { emoji: '🔧', text: 'Something is broken' },
                  { emoji: '💰', text: 'I want a refund' },
                  { emoji: '👤', text: 'Help with my account' },
                ].map(({ emoji, text }) => (
                  <button
                    key={text}
                    onClick={() => { setInput(text); inputRef.current?.focus(); }}
                    className="px-4 py-2 glass-card glass-card-hover rounded-xl text-xs text-text-secondary hover:text-text-primary transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>{emoji}</span> {text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message bubbles */}
          {messages.map((msg, idx) => (
            <MessageBubble key={msg.id || idx} message={msg} index={idx} />
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center text-xs text-white font-bold shadow-lg" style={{ boxShadow: '0 0 15px rgba(59,130,246,0.3)' }}>AI</div>
              <div className="glass-card rounded-2xl rounded-bl-md px-5 py-3.5">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-brand-400 rounded-full typing-dot" />
                  <span className="w-2 h-2 bg-brand-400 rounded-full typing-dot" />
                  <span className="w-2 h-2 bg-brand-400 rounded-full typing-dot" />
                </div>
              </div>
            </div>
          )}

          {/* Suggest close */}
          {suggestClose && ticket?.status === 'open' && (
            <div className="flex justify-center animate-slide-up">
              <div className="glass-card rounded-xl px-5 py-3.5 flex items-center gap-4 border border-accent-green/20">
                <span className="text-sm text-text-secondary">Issue resolved?</span>
                <button
                  onClick={handleResolve}
                  className="px-4 py-1.5 bg-accent-green/15 hover:bg-accent-green/25 text-accent-green text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Yes, close ticket
                </button>
                <button
                  onClick={() => setSuggestClose(false)}
                  className="px-3 py-1.5 hover:bg-white/5 text-text-muted text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Not yet
                </button>
              </div>
            </div>
          )}

          {/* Resolved state */}
          {isResolved && (
            <div className="flex justify-center animate-slide-up">
              <div className="glass-card rounded-xl px-5 py-3.5 text-center border border-accent-green/20">
                <p className="text-accent-green font-semibold text-sm">✅ Ticket Resolved</p>
                <p className="text-xs text-text-muted mt-1">Thank you for using ACSCAM support.</p>
                <button
                  onClick={handleNewChat}
                  className="mt-3 px-4 py-2 bg-brand-600/20 hover:bg-brand-600/30 text-brand-400 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Start New Conversation
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="shrink-0 px-6 py-4 border-t border-white/5" style={{ background: 'rgba(5,5,5,0.9)', backdropFilter: 'blur(20px)' }}>
          <div className="flex gap-3 items-end max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isResolved ? 'Ticket resolved — start a new conversation' : 'Type your message... (Enter to send, Shift+Enter for new line)'}
                disabled={loading || isResolved}
                rows={1}
                className="w-full bg-surface-3/80 border border-white/8 rounded-xl px-4 py-3 pr-12 text-sm text-text-primary placeholder:text-text-muted/70 focus:outline-none resize-none disabled:opacity-40 transition-all"
                style={{ minHeight: '48px', maxHeight: '140px' }}
                onInput={e => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
                }}
              />
              {loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="shrink-0 w-12 h-12 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all cursor-pointer"
              style={{ boxShadow: input.trim() && !loading ? '0 0 20px rgba(37,99,235,0.3)' : 'none' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.876L5.999 12Zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Right panel — Ticket Info */}
      {ticket && (
        <div className="w-72 shrink-0 border-l border-white/5 overflow-y-auto p-5 space-y-6 hidden xl:block" style={{ background: 'rgba(5,5,5,0.7)' }}>
          {/* Sentiment */}
          <div className="text-center">
            <p className="text-xs text-text-muted mb-3 uppercase tracking-wider font-medium">Sentiment Score</p>
            <SentimentMeter score={sentiment} size={110} />
          </div>

          {/* Ticket details */}
          <div className="space-y-3 glass-card rounded-xl p-4">
            <DetailRow label="Status" value={<StatusPill status={ticket.status} />} />
            <DetailRow label="Intent" value={<IntentBadge intent={ticket.intent} showIcon={true} />} />
            <DetailRow label="Priority" value={
              <span className={`text-xs font-semibold capitalize ${
                ticket.priority === 'urgent' ? 'text-accent-red' :
                ticket.priority === 'high' ? 'text-orange-400' :
                ticket.priority === 'medium' ? 'text-accent-amber' : 'text-text-muted'
              }`}>{ticket.priority}</span>
            } />
            <DetailRow label="Customer" value={<span className="text-xs text-text-primary">{ticket.customer_name || 'Unknown'}</span>} />
            {ticket.customer_tier && (
              <DetailRow label="Tier" value={
                <span className={`text-xs font-semibold capitalize ${
                  ticket.customer_tier === 'vip' ? 'text-accent-amber' :
                  ticket.customer_tier === 'premium' ? 'text-accent-purple' : 'text-text-secondary'
                }`}>{ticket.customer_tier} {ticket.customer_tier === 'vip' && '⭐'}</span>
              } />
            )}
            <DetailRow label="Messages" value={<span className="text-xs text-text-secondary">{messages.length}</span>} />
          </div>

          {/* Escalation info */}
          {ticket.escalation_reason && (
            <div className="p-3 bg-accent-red/8 border border-accent-red/15 rounded-xl">
              <p className="text-xs font-semibold text-accent-red mb-1">⚠️ Escalated</p>
              <p className="text-xs text-accent-red/70 leading-relaxed">{ticket.escalation_reason}</p>
            </div>
          )}

          {/* Sentiment history mini chart */}
          {messages.filter(m => m.sentiment_score != null).length > 1 && (
            <div>
              <p className="text-xs text-text-muted mb-3 uppercase tracking-wider font-medium">Sentiment Trend</p>
              <SentimentSparkline messages={messages} />
            </div>
          )}

          {/* KB articles used */}
          {ticket && (
            <div>
              <p className="text-xs text-text-muted mb-2 uppercase tracking-wider font-medium">AI Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                <span className="text-xs text-text-secondary">Active — Mock Mode</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CSAT Modal */}
      {showCSAT && (
        <CSATModal
          ticketId={ticketId}
          onSubmit={handleCSAT}
          onClose={() => setShowCSAT(false)}
        />
      )}
    </div>
  );
}

function MessageBubble({ message, index }) {
  const isCustomer = message.role === 'customer';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center animate-fade-in">
        <div className="px-4 py-2 bg-white/3 rounded-full text-xs text-text-muted border border-white/5">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isCustomer ? 'flex-row-reverse' : ''} animate-slide-up`} style={{ animationDelay: `${Math.min(index * 30, 200)}ms` }}>
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-bold shadow-lg ${
        isCustomer
          ? 'bg-gradient-to-br from-accent-green to-emerald-700 text-white'
          : 'bg-gradient-to-br from-brand-500 to-accent-purple text-white'
      }`}
        style={{ boxShadow: isCustomer ? '0 0 12px rgba(0,230,118,0.2)' : '0 0 12px rgba(59,130,246,0.2)' }}
      >
        {isCustomer ? 'U' : 'AI'}
      </div>

      {/* Bubble */}
      <div className={`max-w-[70%] ${
        isCustomer
          ? 'bg-brand-600/15 border border-brand-600/15 rounded-2xl rounded-br-sm'
          : 'rounded-2xl rounded-bl-sm border border-white/5'
      } px-4 py-3`}
        style={!isCustomer ? { background: 'rgba(12, 12, 12, 0.8)' } : {}}
      >
        <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">{message.content}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] text-text-muted/60">
            {message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
          {message.intent && !isCustomer && (
            <IntentBadge intent={message.intent} showIcon={false} />
          )}
          {message.sentiment_score != null && !isCustomer && (
            <span className="text-[10px] text-text-muted/60">• sentiment: {message.sentiment_score}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const config = {
    open: { bg: 'bg-brand-500/15', text: 'text-brand-400', border: 'border-brand-500/20' },
    escalated: { bg: 'bg-accent-red/15', text: 'text-accent-red', border: 'border-accent-red/20' },
    resolved: { bg: 'bg-accent-green/15', text: 'text-accent-green', border: 'border-accent-green/20' },
    closed: { bg: 'bg-text-muted/15', text: 'text-text-muted', border: 'border-text-muted/20' },
  };
  const c = config[status] || config.open;
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold capitalize border ${c.bg} ${c.text} ${c.border}`}>
      {status}
    </span>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-text-muted">{label}</span>
      {value}
    </div>
  );
}

function SentimentSparkline({ messages }) {
  const data = messages
    .filter(m => m.sentiment_score != null)
    .map(m => m.sentiment_score);

  if (data.length < 2) return null;

  const width = 200;
  const height = 50;
  const max = 100;
  const min = 0;
  const step = width / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / (max - min)) * height;
    return `${x},${y}`;
  }).join(' ');

  const lastScore = data[data.length - 1];
  const color = lastScore < 30 ? '#ff3d3d' : lastScore < 60 ? '#ffab00' : '#00e676';

  return (
    <svg width={width} height={height + 10} className="w-full">
      <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} stroke="rgba(255,255,255,0.03)" />
      <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="rgba(255,255,255,0.03)" />
      <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} stroke="rgba(255,255,255,0.03)" />
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${points} ${width},${height}`} fill="url(#sparkGrad)" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={(data.length - 1) * step} cy={height - ((lastScore - min) / (max - min)) * height} r="3" fill={color} />
    </svg>
  );
}
