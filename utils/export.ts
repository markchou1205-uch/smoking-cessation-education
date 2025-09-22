// 例如 utils/api.ts 或表單 submit 的地方
export async function createSubmission(payload: any) {
  const res = await fetch('/api/submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Create failed');
  return res.json(); // { item }
}
 
