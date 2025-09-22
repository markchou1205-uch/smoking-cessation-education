export async function fetchAnalytics(params?: { from?: string; to?: string; tzOffset?: number }) {
  const q = new URLSearchParams();
  if (params?.from) q.set('from', params.from);
  if (params?.to) q.set('to', params.to);
  if (typeof params?.tzOffset === 'number') q.set('tzOffset', String(params.tzOffset));
  const res = await fetch(`/api/analytics${q.toString() ? `?${q}` : ''}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Fetch analytics failed');
  return res.json();
}

