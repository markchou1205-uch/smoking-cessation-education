// pages/api/analytics.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

type Row = {
  id: string;
  student_id: string | null;
  score?: number | null;
  created_at: string;
};

function pad(n: number) { return String(n).padStart(2, '0'); }

// 把 YYYY-MM-DD（該時區的當天）轉成 UTC ISO 起迄
function toUtcIsoRangeFromLocalYMD(ymd: string, tzOffsetMin: number, endExclusive = false) {
  const [y, m, d] = ymd.split('-').map(Number);
  const base = Date.UTC(y, (m - 1), d, 0, 0, 0);
  const ms = base - tzOffsetMin * 60 * 1000 + (endExclusive ? 24 * 60 * 60 * 1000 : 0);
  return new Date(ms).toISOString();
}

function todayLocalYMD(tzOffsetMin: number) {
  const now = new Date();
  const local = new Date(now.getTime() + tzOffsetMin * 60 * 1000);
  return `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}`;
}

function ymdNDaysAgo(n: number, tzOffsetMin: number) {
  const now = new Date();
  const local = new Date(now.getTime() + tzOffsetMin * 60 * 1000);
  local.setUTCDate(local.getUTCDate() - (n - 1));
  return `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const tzOffset = Number.isFinite(Number(req.query.tzOffset))
      ? Number(req.query.tzOffset) : 480; // 預設台灣 +480 分

    const fromYmd = typeof req.query.from === 'string' ? req.query.from : undefined;
    const toYmd   = typeof req.query.to   === 'string' ? req.query.to   : undefined;

    let fromIso: string;
    let toIsoExclusive: string;
    let rangeLabel = '';

    if (fromYmd && toYmd) {
      // 使用者自選區間（含 to 當天，查詢用 < to+1 天）
      fromIso = toUtcIsoRangeFromLocalYMD(fromYmd, tzOffset, false);
      toIsoExclusive = toUtcIsoRangeFromLocalYMD(toYmd, tzOffset, true);
      rangeLabel = `${fromYmd} ~ ${toYmd}`;
    } else {
      // 預設近 30 天（含今天）
      const to = todayLocalYMD(tzOffset);
      const from = ymdNDaysAgo(30, tzOffset);
      fromIso = toUtcIsoRangeFromLocalYMD(from, tzOffset, false);
      toIsoExclusive = toUtcIsoRangeFromLocalYMD(to, tzOffset, true);
      rangeLabel = `近30天（${from} ~ ${to}）`;
    }

    // 取指定區間內資料
    const { data: rows, error } = await supabaseAdmin
      .from('submissions')
      .select('id, student_id, score, created_at')
      .gte('created_at', fromIso)
      .lt('created_at', toIsoExclusive)
      .limit(20000);

    if (error) throw error;

    // 全期間總數（可顯示在總覽）
    const { count: totalAll, error: countErr } = await supabaseAdmin
      .from('submissions')
      .select('*', { count: 'exact', head: true });
    if (countErr) throw countErr;

    // —— Node 端彙整（以 tzOffset 的「當地日期」分組）——
    const byDate: Record<string, number> = {};
    const byStudent: Record<string, number> = {};
    let sumScore = 0;
    let scoreCnt = 0;

    for (const r of (rows ?? []) as Row[]) {
      // 轉成「當地時間」後再取 YMD
      const tMsLocal = new Date(r.created_at).getTime() + tzOffset * 60 * 1000;
      const local = new Date(tMsLocal);
      const ymd = `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}`;

      byDate[ymd] = (byDate[ymd] ?? 0) + 1;

      if (r.student_id) byStudent[r.student_id] = (byStudent[r.student_id] ?? 0) + 1;
      if (typeof r.score === 'number') { sumScore += r.score; scoreCnt += 1; }
    }

    const dailySeries = Object.entries(byDate)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, count]) => ({ date, count }));

    const topStudents = Object.entries(byStudent)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([student_id, count]) => ({ student_id, count }));

    const avgScore = scoreCnt ? Number((sumScore / scoreCnt).toFixed(1)) : null;

    return res.status(200).json({
      rangeLabel,
      from: fromYmd ?? null,
      to: toYmd ?? null,
      tzOffset,
      totalInRange: rows?.length ?? 0,
      totalAll: totalAll ?? 0,
      uniqueStudentsInRange: Object.keys(byStudent).length,
      avgScore,
      dailySeries,
      topStudents,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? 'Internal Error' });
  }
}
