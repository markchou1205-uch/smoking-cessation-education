// pages/api/students.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

// 解析 data 欄（jsonb 或字串）
function parseData(d: any) {
  if (!d) return {};
  if (typeof d === 'object') return d;
  try { return JSON.parse(String(d)); } catch { return {}; }
}

function pick<T = any>(obj: any, keys: string[], fallback: any = ''): T {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return fallback;
}

function toArrayMaybe(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  return String(v).split(/[,，;；、\s]+/).filter(Boolean);
}

function normalizeClassName(cls: string): string {
  if (!cls) return '';
  const i = cls.indexOf('系');
  return i >= 0 ? cls.slice(0, i + 1) : cls;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 可選：日期區間過濾（YYYY-MM-DD），前端若沒帶就全撈
    const { from, to } = req.query as { from?: string; to?: string };

    let q = supabaseAdmin
      .from('submissions')
      .select('id, student_id, title, score, data, created_at')
      .order('created_at', { ascending: false });

    if (from) q = q.gte('created_at', new Date(`${from}T00:00:00`).toISOString());
    if (to)   q = q.lte('created_at', new Date(`${to}T23:59:59.999`).toISOString());

    const { data, error } = await q;
    if (error) throw error;

    const list = (data ?? []).map((row: any) => {
      const d = parseData(row.data);
      // 盡量從多個可能鍵名取得資料，避免你前面表單鍵名不一致
      const name        = pick<string>({ ...row, ...d }, ['name', 'studentName', '姓名']);
      const department  = pick<string>({ ...row, ...d }, ['department', '科系', 'dept']);
      const className   = normalizeClassName(pick<string>({ ...row, ...d }, ['class', '班級', 'className']));
      const phone       = pick<string>({ ...row, ...d }, ['phone', 'mobile', '手機', 'phoneNumber']);
      const instructor  = pick<string>({ ...row, ...d }, ['instructor', '輔導教官', 'instructorName']);
      const status      = pick<string>({ ...row, ...d }, ['status'], 'completed');

      const startSmoking  = pick<string>({ ...row, ...d }, ['startSmoking', 'start_smoking', '開始吸菸年齡']);
      const frequency     = pick<string>({ ...row, ...d }, ['frequency', '吸菸頻率']);
      const dailyAmount   = pick<string>({ ...row, ...d }, ['dailyAmount', 'daily_amount', '每日支數']);
      const tobaccoType   = pick<string>({ ...row, ...d }, ['tobaccoType', 'tobacco_type', '菸品種類']);
      const quitIntention = pick<string>({ ...row, ...d }, ['quitIntention', 'quit_intention', '戒菸意圖']);
      const reasons       = toArrayMaybe(pick<string | string[]>({ ...row, ...d }, ['reasons', '戒菸原因']));

      return {
        id: row.id,
        student_id: row.student_id ?? '',
        name,
        department,
        class: className,
        phone,
        instructor,
        status,
        createdAt: row.created_at,
        // 供統計第二頁使用的欄位
        startSmoking, frequency, dailyAmount, tobaccoType, quitIntention, reasons,
        // 你原本就有的欄位（保留）
        title: row.title ?? '',
        score: typeof row.score === 'number' ? row.score : null,
      };
    });

    res.status(200).json({ data: list });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'Internal Error' });
  }
}
