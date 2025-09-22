export async function createSubmission(payload: any) {
  const res = await fetch('/api/submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Create failed');
  return res.json(); // { item }
}

export async function fetchSubmissions() {
  const res = await fetch('/api/submissions', { cache: 'no-store' });
  if (!res.ok) throw new Error('Fetch failed');
  return res.json(); // { items }
}

