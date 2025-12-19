// pages/api/admin/statistics.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { googleSheet } from '../../../lib/googleSheet';

// ---------- helpers ----------
function pad(n: number) { return String(n).padStart(2, '0'); }
function toUtcIso(ymd: string, tzOffsetMin: number, endExclusive = false) {
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
function ymdDaysAgo(n: number, tzOffsetMin: number) {
  const now = new Date();
  const local = new Date(now.getTime() + tzOffsetMin * 60 * 1000);
  local.setUTCDate(local.getUTCDate() - (n - 1));
  return `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}`;
}
function parseObj(v: any) { if (!v) return {}; if (typeof v === 'object') return v; try { return JSON.parse(String(v)); } catch { return {}; } }
function tally(list: (string | null | undefined)[]) {
  const m = new Map<string, number>();
  for (const v of list) if (v) m.set(v, (m.get(v) || 0) + 1);
  return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
}
function tallyMulti(list: (string[] | undefined | null)[]) {
  const m = new Map<string, number>();
  for (const arr of list) if (Array.isArray(arr)) for (const x of arr) if (x) m.set(x, (m.get(x) || 0) + 1);
  return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
}
function boolStats(list: (boolean | null | undefined)[], labels = ['有', '沒有', '未填']) {
  let yes = 0, no = 0, unk = 0;
  for (const v of list) {
    if (v === true) yes++; else if (v === false) no++; else unk++;
  }
  return [{ name: labels[0], value: yes }, { name: labels[1], value: no }, { name: labels[2], value: unk }];
}
function normClassName(cls: string) {
  if (!cls) return '';
  const i = cls.indexOf('系');
  return i >= 0 ? cls.slice(0, i + 1) : cls;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const tzOffset = Number.isFinite(Number(req.query.tzOffset)) ? Number(req.query.tzOffset) : 480;
    const fromYmd = typeof req.query.from === 'string' ? req.query.from : undefined;
    const toYmd = typeof req.query.to === 'string' ? req.query.to : undefined;

    let fromIso: string, toIsoExclusive: string, rangeLabel: string;
    if (fromYmd && toYmd) {
      fromIso = toUtcIso(fromYmd, tzOffset, false);
      toIsoExclusive = toUtcIso(toYmd, tzOffset, true);
      rangeLabel = `${fromYmd} ~ ${toYmd}`;
    } else {
      const to = todayLocalYMD(tzOffset);
      const from = ymdDaysAgo(30, tzOffset);
      fromIso = toUtcIso(from, tzOffset, false);
      toIsoExclusive = toUtcIso(to, tzOffset, true);
      rangeLabel = `近30天（${from} ~ ${to}）`;
    }

    // 取資料 (Google Sheets)
    // Note: googleSheet helper's `to` uses <=, but here we have exclusive limit.
    // Depending on precision, we can use toIsoExclusive directly or filter manually.
    // We'll fetch slightly loosely and filter precisely here.
    const rows = await googleSheet.getSubmissions({
      from: fromIso,
      to: toIsoExclusive
    });

    // Exact filtering < toIsoExclusive
    const filteredRows = rows.filter(r => r.created_at >= fromIso && r.created_at < toIsoExclusive);

    // 全期間總數
    const allRows = await googleSheet.getSubmissions({}); // get all
    const totalAll = allRows.length;

    // 轉成分析需要的欄位
    type R = {
      created_at: string;
      student_id: string | null;
      name?: string; department?: string; class?: string; instructor?: string;
      startSmokingPeriod?: string | null;
      weeklyFrequency?: string | null;
      dailyAmount?: string | null;
      smokingReasons?: string[] | null;
      productTypesUsed?: string[] | null;
      familySmoker?: boolean | null;
      knowSchoolBan?: boolean | null;
      seenTobaccoAds?: boolean | null;
      everVaped?: boolean | null;
      wantQuit?: boolean | null;
      wantsCounseling?: boolean | null;
      interestedInFreeSvc?: boolean | null;
    };

    const parsed: R[] = filteredRows.map((row: any) => {
      const d = parseObj(row.data);
      return {
        created_at: row.created_at,
        student_id: row.student_id ?? null,
        name: d.name ?? '',
        department: d.department ?? '',
        class: normClassName(d.class ?? ''),
        instructor: d.instructor ?? '',
        startSmokingPeriod: d.startSmokingPeriod ?? null,
        weeklyFrequency: d.weeklyFrequency ?? null,
        dailyAmount: d.dailyAmount ?? null,
        smokingReasons: Array.isArray(d.smokingReasons) ? d.smokingReasons : [],
        productTypesUsed: Array.isArray(d.productTypesUsed) ? d.productTypesUsed : [],
        familySmoker: typeof d.familySmoker === 'boolean' ? d.familySmoker : null,
        knowSchoolBan: typeof d.knowSchoolBan === 'boolean' ? d.knowSchoolBan : null,
        seenTobaccoAds: typeof d.seenTobaccoAds === 'boolean' ? d.seenTobaccoAds : null,
        everVaped: typeof d.everVaped === 'boolean' ? d.everVaped : null,
        wantQuit: typeof d.wantQuit === 'boolean' ? d.wantQuit : null,
        wantsCounseling: typeof d.wantsCounseling === 'boolean' ? d.wantsCounseling : null,
        interestedInFreeSvc: typeof d.interestedInFreeSvc === 'boolean' ? d.interestedInFreeSvc : null,
      };
    });

    // 匯總
    const totalInRange = parsed.length;
    const uniqueStudentsInRange = new Set(parsed.map(r => r.student_id).filter(Boolean)).size;

    // 日期趨勢（依 tzOffset 分日）
    const byDate = new Map<string, number>();
    for (const r of parsed) {
      const tLocal = new Date(r.created_at).getTime() + tzOffset * 60 * 1000;
      const d = new Date(tLocal);
      const ymd = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
      byDate.set(ymd, (byDate.get(ymd) || 0) + 1);
    }
    const dailySeries = Array.from(byDate.entries()).sort(([a], [b]) => a < b ? -1 : 1).map(([date, count]) => ({ date, count }));

    // 題目分布
    const startSmokingPeriodStats = tally(parsed.map(r => r.startSmokingPeriod ?? undefined));
    const weeklyFrequencyStats = tally(parsed.map(r => r.weeklyFrequency ?? undefined));
    const dailyAmountStats = tally(parsed.map(r => r.dailyAmount ?? undefined));
    const smokingReasonsStats = tallyMulti(parsed.map(r => r.smokingReasons));
    const productTypesUsedStats = tallyMulti(parsed.map(r => r.productTypesUsed));

    const familySmokerStats = boolStats(parsed.map(r => r.familySmoker));
    const knowSchoolBanStats = boolStats(parsed.map(r => r.knowSchoolBan));
    const seenTobaccoAdsStats = boolStats(parsed.map(r => r.seenTobaccoAds));
    const everVapedStats = boolStats(parsed.map(r => r.everVaped));
    const wantQuitStats = boolStats(parsed.map(r => r.wantQuit));
    const wantsCounselingStats = boolStats(parsed.map(r => r.wantsCounseling));
    const interestedInFreeSvcStats = boolStats(parsed.map(r => r.interestedInFreeSvc));

    const instructorStats = tally(parsed.map(r => r.instructor ?? undefined));
    const classStats = tally(parsed.map(r => r.class ?? undefined));

    // （可選）向下相容舊鍵名：有用到再讀
    const legacy = {
      startSmokingStats: startSmokingPeriodStats,
      frequencyStats: weeklyFrequencyStats,
      reasonsStats: smokingReasonsStats,
      tobaccoTypeStats: productTypesUsedStats,
      quitIntentionStats: wantQuitStats,
    };

    return res.status(200).json({
      rangeLabel, from: fromYmd ?? null, to: toYmd ?? null, tzOffset,
      totalInRange, totalAll: totalAll ?? 0, uniqueStudentsInRange,
      dailySeries,

      // 新題目鍵名（建議前端改讀這些）
      startSmokingPeriodStats,
      weeklyFrequencyStats,
      dailyAmountStats,
      smokingReasonsStats,
      productTypesUsedStats,
      familySmokerStats,
      knowSchoolBanStats,
      seenTobaccoAdsStats,
      everVapedStats,
      wantQuitStats,
      wantsCounselingStats,
      interestedInFreeSvcStats,
      instructorStats,
      classStats,

      // 舊鍵名（避免短期內前端崩）
      ...legacy
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? 'Internal Error' });
  }
}
