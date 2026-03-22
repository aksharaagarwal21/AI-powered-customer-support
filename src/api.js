const API_BASE = '/api';

export async function sendMessage(ticketId, message, customerId) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticket_id: ticketId, message, customer_id: customerId }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export async function getTickets(filters = {}) {
  // Filter out undefined/empty values to prevent "status=undefined" in query string
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  );
  const params = new URLSearchParams(cleanFilters);
  const res = await fetch(`${API_BASE}/tickets?${params}`);
  if (!res.ok) throw new Error('Failed to fetch tickets');
  return res.json();
}

export async function getTicket(id) {
  const res = await fetch(`${API_BASE}/ticket/${id}`);
  if (!res.ok) throw new Error('Failed to fetch ticket');
  return res.json();
}

export async function updateTicket(id, data) {
  const res = await fetch(`${API_BASE}/ticket/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update ticket');
  return res.json();
}

export async function createTicket(data) {
  const res = await fetch(`${API_BASE}/ticket`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create ticket');
  return res.json();
}

export async function submitCSAT(ticketId, rating, comment) {
  const res = await fetch(`${API_BASE}/ticket/${ticketId}/csat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating, comment }),
  });
  if (!res.ok) throw new Error('Failed to submit CSAT');
  return res.json();
}

export async function getAnalytics() {
  const res = await fetch(`${API_BASE}/analytics`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function getCustomers() {
  const res = await fetch(`${API_BASE}/ticket/customers/list`);
  if (!res.ok) throw new Error('Failed to fetch customers');
  return res.json();
}

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Server not available');
  return res.json();
}
