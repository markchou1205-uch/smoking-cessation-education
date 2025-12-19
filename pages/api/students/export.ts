// pages/api/students/export.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { googleSheet } from '../../../lib/googleSheet';

function parseObj(v: any) { if (!v) return {}; if (typeof v === 'object') return v; try { return JSON.parse(String(v)) } catch { return {} } }
function arr(v: any) { if (!v) return []; return Array.isArray(v) ? v : v.toString().split(/[,，;；、\s]+/).filter(Boolean); }
function yesno(v: any) { if (v === true || String(v).trim() === '有' || String(v).trim() === '是') return '有'; if (v === false || String(v).trim() === '沒有' || String(v).trim() === '否') return '沒有'; return ''; }
function esc(s: any) { const t = s == null ? '' : String(s); return /[,"\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { from, to } = req.query as { from?: string; to?: string };

    // ISO conversion
    const fromIso = from ? new Date(`${from}T00:00:00`).toISOString() : undefined;
    const toIso = to ? new Date(`${to}T23:59:59.999`).toISOString() : undefined;

    const rawRows = await googleSheet.getSubmissions({
      from: fromIso,
      to: toIso,
      ascending: false
    });

    const rows = rawRows.map((r: any) => {
      const d = parseObj(r.data);
      return {
        id: r.id, student_id: r.student_id ?? '', created_at: r.created_at,
        姓名: d.name ?? '', 科系: d.department ?? '', 班級: d.class ?? '', 手機: d.phone ?? '', 輔導教官: d.instructor ?? '',
        你從什麼時候開始吸菸: d.startSmokingPeriod ?? '',
        你一週抽幾次: d.weeklyFrequency ?? '',
        你一天吸菸幾支: d.dailyAmount ?? '',
        你平常吸菸的原因: arr(d.smokingReasons).join('、'),
        你是使用哪種菸品: arr(d.productTypesUsed).join('、'),
        你家中有人吸菸嗎: yesno(d.familySmoker),
        你知道校園全面禁止吸菸嗎: yesno(d.knowSchoolBan),
        你有在學校看過菸商廣告嗎: yesno(d.seenTobaccoAds),
        你有曾抽過電子煙嗎: yesno(d.everVaped),
        你現在有沒有戒菸的想法: yesno(d.wantQuit),
        你現在有沒有戒菸的需求: yesno(d.wantsCounseling),
        政府免費戒菸輔導是否有興趣: yesno(d.interestedInFreeSvc),
      };
    });

    const header = [
      'ID', '學號', '建立時間', '姓名', '科系', '班級', '手機', '輔導教官',
      '你從什麼時候開始吸菸', '你一週抽幾次', '你一天吸菸幾支',
      '你平常吸菸的原因', '你是使用哪種菸品',
      '你家中有人吸菸嗎', '你知道校園全面禁止吸菸嗎', '你有在學校看過菸商廣告嗎',
      '你有曾抽過電子煙嗎', '你現在有沒有戒菸的想法', '你現在有沒有戒菸的需求', '政府免費戒菸輔導是否有興趣'
    ];
    const lines = rows.map(r => [
      r.id, r.student_id, r.created_at, r.姓名, r.科系, r.班級, r.手機, r.輔導教官,
      r['你從什麼時候開始吸菸'], r['你一週抽幾次'], r['你一天吸菸幾支'],
      r['你平常吸菸的原因'], r['你是使用哪種菸品'],
      r['你家中有人吸菸嗎'], r['你知道校園全面禁止吸菸嗎'], r['你有在學校看過菸商廣告嗎'],
      r['你有曾抽過電子煙嗎'], r['你現在有沒有戒菸的想法'], r['你現在有沒有戒菸的需求'], r['政府免費戒菸輔導是否有興趣']
    ].map(esc).join(','));

    const csv = '\uFEFF' + [header.map(esc).join(','), ...lines].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=students_${new Date().toISOString().slice(0, 10)}.csv`);
    res.status(200).send(csv);
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'Internal Error' });
  }
}
