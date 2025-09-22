// pages/api/students/export.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

function parseData(d: any) {
  if (!d) return {};
  if (typeof d === 'object') return d;
  try { return JSON.parse(String(d)); } catch { return {}; }
}
function pick<T = any>(obj: any, keys: string[], fallback: any = ''): T {
  for (const k of keys) { const v = obj?.[k]; if (v !== undefined && v !== null && v !== '') return v; }
  return fallback;
}
function toArrayMaybe(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  return String(v).split(/[,，;；、\s]+/).filter(Boolean);
}
function csvEscape(s: any) {
  const t = s === null || s === undefined ? '' : String(s);
  if (/[,"\n]/.test(t)) return `"${t.replace(/"/g, '""')}"`;
  return t;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { from, to } = req.query as { from?: string; to?: string };

    let q = supabaseAdmin
      .from('submissions')
      .select('id, student_id, title, score, data, created_at')
      .order('created_at', { ascending: false });

    if (from) q = q.gte('created_at', new Date(`${from}T00:00:00`).toISOString());
    if (to)   q = q.lte('created_at', new Date(`${to}T23:59:59.999`).toISOString());

    const { data, error } = await q;
    if (error) throw error;

    const rows = (data ?? []).map((row: any) => {
      const d = parseData(row.data);
      return {
        id: row.id,
        student_id: row.student_id ?? '',
        name:        pick<string>({ ...row, ...d }, ['name', 'studentName', '姓名']),
        department:  pick<string>({ ...row, ...d }, ['department', '科系', 'dept']),
        class:       pick<string>({ ...row, ...d }, ['class', '班級', 'className']),
        phone:       pick<string>({ ...row, ...d }, ['phone', 'mobile', '手機', 'phoneNumber']),
        instructor:  pick<string>({ ...row, ...d }, ['instructor', '輔導教官']),
        status:      pick<string>({ ...row, ...d }, ['status'], 'completed'),
        startSmoking:  pick<string>({ ...row, ...d }, ['startSmoking', 'start_smoking']),
        frequency:     pick<string>({ ...row, ...d }, ['frequency']),
        dailyAmount:   pick<string>({ ...row, ...d }, ['dailyAmount', 'daily_amount']),
        tobaccoType:   pick<string>({ ...row, ...d }, ['tobaccoType', 'tobacco_type']),
        quitIntention: pick<string>({ ...row, ...d }, ['quitIntention', 'quit_intention']),
        reasons:       toArrayMaybe(pick<string | string[]>({ ...row, ...d }, ['reasons'])).join('、'),
        created_at: row.created_at
      };
    });

    const header = [
      'ID','學號','姓名','科系','班級','手機','輔導教官','狀態',
      '開始吸菸年齡','吸菸頻率','每日支數','菸品種類','戒菸意圖','戒菸原因','建立時間'
    ];
    const lines = rows.map(r => [
      r.id, r.student_id, r.name, r.department, r.class, r.phone, r.instructor, r.status,
      r.startSmoking, r.frequency, r.dailyAmount, r.tobaccoType, r.quitIntention, r.reasons, r.created_at
    ].map(csvEscape).join(','));

    const csv = '\uFEFF' + [header.map(csvEscape).join(','), ...lines].join('\n'); // BOM for Excel
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=students_${new Date().toISOString().slice(0,10)}.csv`);
    res.status(200).send(csv);
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'Internal Error' });
  }
}
