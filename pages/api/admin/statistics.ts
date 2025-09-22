// pages/api/admin/statistics.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

function tally(list: (string | null | undefined)[]) {
  const m = new Map<string, number>();
  for (const v of list) if (v) m.set(v, (m.get(v) || 0) + 1);
  return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
}

function toArrayMaybe(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  return String(v).split(/[,，;；、\s]+/).filter(Boolean);
}
function parseData(d: any) {
  if (!d) return {};
  if (typeof d === 'object') return d;
  try { return JSON.parse(String(d)); } catch { return {}; }
}
function pick<T = any>(obj: any, keys: string[], fallback: any = ''): T {
  for (const k of keys) { const v = obj?.[k]; if (v !== undefined && v !== null && v !== '') return v; }
  return fallback;
}
function normalizeClassName(cls: string): string {
  if (!cls) return '';
  const i = cls.indexOf('系');
  return i >= 0 ? cls.slice(0, i + 1) : cls;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { from, to } = req.query as { from?: string; to?: string };

    let q = supabaseAdmin
      .from('submissions')
      .select('id, student_id, data, created_at')
      .order('created_at', { ascending: false });

    if (from) q = q.gte('created_at', new Date(`${from}T00:00:00`).toISOString());
    if (to)   q = q.lte('created_at', new Date(`${to}T23:59:59.999`).toISOString());

    const { data, error } = await q;
    if (error) throw error;

    const rows = (data ?? []).map((row: any) => {
      const d = parseData(row.data);
      const status      = pick<string>({ ...row, ...d }, ['status'], 'completed');
      const startSmoking  = pick<string>({ ...row, ...d }, ['startSmoking', 'start_smoking']);
      const frequency     = pick<string>({ ...row, ...d }, ['frequency']);
      const dailyAmount   = pick<string>({ ...row, ...d }, ['dailyAmount', 'daily_amount']);
      const tobaccoType   = pick<string>({ ...row, ...d }, ['tobaccoType', 'tobacco_type']);
      const quitIntention = pick<string>({ ...row, ...d }, ['quitIntention', 'quit_intention']);
      const instructor    = pick<string>({ ...row, ...d }, ['instructor']);
      const className     = normalizeClassName(pick<string>({ ...row, ...d }, ['class', 'className']));
      const reasons       = toArrayMaybe(pick<string | string[]>({ ...row, ...d }, ['reasons']));
      return { status, startSmoking, frequency, dailyAmount, tobaccoType, quitIntention, instructor, className, reasons };
    });

    const totalStudents = rows.length;
    const completedStudents = rows.filter(r => r.status === 'completed').length;
    const completionRate = totalStudents ? Math.round((completedStudents / totalStudents) * 100) : 0;

    const startSmokingStats  = tally(rows.map(r => r.startSmoking));
    const frequencyStats     = tally(rows.map(r => r.frequency));
    const dailyAmountStats   = tally(rows.map(r => r.dailyAmount));
    const tobaccoTypeStats   = tally(rows.map(r => r.tobaccoType));
    const quitIntentionStats = tally(rows.map(r => r.quitIntention));
    const instructorStats    = tally(rows.map(r => r.instructor));
    const classStats         = tally(rows.map(r => r.className));
    // 多選原因
    const reasonsMap = new Map<string, number>();
    for (const r of rows) for (const reason of r.reasons) {
      reasonsMap.set(reason, (reasonsMap.get(reason) || 0) + 1);
    }
    const reasonsStats = Array.from(reasonsMap.entries()).map(([name, value]) => ({ name, value }));

    res.status(200).json({
      data: {
        totalStudents, completedStudents, completionRate,
        startSmokingStats, frequencyStats, dailyAmountStats,
        reasonsStats, tobaccoTypeStats, quitIntentionStats,
        instructorStats, classStats
      }
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'Internal Error' });
  }
}
