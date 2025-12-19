// pages/api/students/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { googleSheet } from '../../../lib/googleSheet';

// ===== helpers =====
function parseObj(v: any) {
  if (!v) return {};
  if (typeof v === 'object') return v;
  try { return JSON.parse(String(v)); } catch { return {}; }
}
function pick<T = any>(obj: any, keys: string[], fallback?: any): T {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== '') return v as T;
  }
  return fallback as T;
}
function toArray(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  return String(v).split(/[,，;；、\s]+/).filter(Boolean);
}
function toBool(v: any): boolean | null {
  if (v === undefined || v === null || v === '') return null;
  const s = String(v).trim();
  if (['true', '1', 'yes', '是', '有', 'y'].includes(s)) return true;
  if (['false', '0', 'no', '否', '沒有', 'n', '无'].includes(s)) return false;
  return null;
}
function normalizeClassName(cls: string) {
  if (!cls) return '';
  const i = cls.indexOf('系');
  return i >= 0 ? cls.slice(0, i + 1) : cls;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // ============== 新增一筆（POST） ==============
    if (req.method === 'POST') {
      const raw = typeof req.body === 'string' ? (() => { try { return JSON.parse(req.body); } catch { return {}; } })() : (req.body || {});
      const form = typeof raw.form === 'object' ? raw.form : raw;     // 允許 {form:{...}} 或直接 {...}
      const dIn = parseObj(form.data);                               // 允許把問卷塞在 data 裡

      // --- 基本資料（姓名/班級/學號/手機/教官）---
      const name = pick<string>({ ...form, ...dIn }, ['name', '姓名']);
      const student_id = pick<string>({ ...form, ...dIn }, ['student_id', 'studentId', '學號'], '');
      const cls = pick<string>({ ...form, ...dIn }, ['class', '班級'], '');
      const department = pick<string>({ ...form, ...dIn }, ['department', '科系', 'dept'], '');
      const phone = pick<string>({ ...form, ...dIn }, ['phone', '手機', 'phoneNumber'], '');
      const instructor = pick<string>({ ...form, ...dIn }, ['instructor', '輔導教官', 'instructorName'], '');

      // --- 問卷題目（照你畫面上的題目）---
      const startSmokingPeriod = pick<string>({ ...form, ...dIn }, [
        'startSmokingPeriod', '你從什麼時候開始吸菸？', '開始吸菸時間'
      ]);
      const weeklyFrequency = pick<string>({ ...form, ...dIn }, [
        'weeklyFrequency', '你一週抽幾次？'
      ]);
      const dailyAmount = pick<string>({ ...form, ...dIn }, [
        'dailyAmount', '你一天吸菸幾支？', '每日支數'
      ]);

      // 多選：原因
      let smokingReasons = toArray(pick({ ...form, ...dIn }, ['smokingReasons', '你平常吸菸的原因是什麼？']));
      // 多選：菸品種類（接受「陣列」或三個 checkbox 布林）
      let productTypesUsed = toArray(pick({ ...form, ...dIn }, ['productTypesUsed', '你是使用哪種菸品？']));
      const pElectronic = toBool(pick({ ...form, ...dIn }, ['電子煙', 'electronic']));
      const pCigarette = toBool(pick({ ...form, ...dIn }, ['紙菸', '紙煙', 'cigarette']));
      const pHeated = toBool(pick({ ...form, ...dIn }, ['加熱煙', 'heated']));
      if (!productTypesUsed.length) {
        const b: string[] = [];
        if (pElectronic) b.push('電子煙');
        if (pCigarette) b.push('紙菸');
        if (pHeated) b.push('加熱煙');
        productTypesUsed = b;
      }

      const familySmoker = toBool(pick({ ...form, ...dIn }, ['familySmoker', '你家中有人吸菸嗎？']));
      const knowSchoolBan = toBool(pick({ ...form, ...dIn }, ['knowSchoolBan', '你知道校園全面禁止吸菸嗎？']));
      const seenTobaccoAds = toBool(pick({ ...form, ...dIn }, ['seenTobaccoAds', '你有在學校看過菸商廣告嗎？']));
      const everVaped = toBool(pick({ ...form, ...dIn }, ['everVaped', '你有曾抽過電子煙嗎？']));
      const wantQuit = toBool(pick({ ...form, ...dIn }, ['wantQuit', '你現在有沒有戒菸的想法？']));
      const wantsCounseling = toBool(pick({ ...form, ...dIn }, ['wantsCounseling', '你現在有沒有戒菸的需求？']));
      const interestedInFreeSvc = toBool(pick({ ...form, ...dIn }, ['interestedInFreeProgram', '政府有提供免費的戒菸輔導，你有興趣瞭解嗎？']));

      // 統一存到 data（jsonb stringified for Sheet）
      const dataObj = {
        name, department, class: cls, phone, instructor,
        startSmokingPeriod, weeklyFrequency, dailyAmount,
        smokingReasons, productTypesUsed,
        familySmoker, knowSchoolBan, seenTobaccoAds,
        everVaped, wantQuit, wantsCounseling, interestedInFreeSvc
      };

      // 寫入 Google Sheet
      const inserted = await googleSheet.appendSubmission({
        student_id,
        title: form.title ?? '',
        score: typeof form.score === 'number' ? form.score : null,
        data: JSON.stringify(dataObj)
      });

      return res.status(201).json({ ok: true, item: inserted });
    }

    // ============== 讀列表（GET） ==============
    const { from, to } = req.query as { from?: string; to?: string };

    // 轉換日期為 ISO 如果有提供
    const fromIso = from ? new Date(`${from}T00:00:00`).toISOString() : undefined;
    const toIso = to ? new Date(`${to}T23:59:59.999`).toISOString() : undefined;

    const rawRows = await googleSheet.getSubmissions({
      from: fromIso,
      to: toIso,
      ascending: false,
    });

    const list = rawRows.map((row) => {
      const d = parseObj(row.data);
      return {
        id: row.id,
        student_id: row.student_id ?? '',
        name: d.name ?? '',
        department: d.department ?? '',
        class: normalizeClassName(d.class ?? ''),
        phone: d.phone ?? '',
        instructor: d.instructor ?? '',
        status: 'completed',
        createdAt: row.created_at,

        // 問卷欄位（直接給前端顯示/統計）
        startSmokingPeriod: d.startSmokingPeriod ?? null,
        weeklyFrequency: d.weeklyFrequency ?? null,
        dailyAmount: d.dailyAmount ?? null,
        smokingReasons: Array.isArray(d.smokingReasons) ? d.smokingReasons : toArray(d.smokingReasons),
        productTypesUsed: Array.isArray(d.productTypesUsed) ? d.productTypesUsed : toArray(d.productTypesUsed),
        familySmoker: d.familySmoker,
        knowSchoolBan: d.knowSchoolBan,
        seenTobaccoAds: d.seenTobaccoAds,
        everVaped: d.everVaped,
        wantQuit: d.wantQuit,
        wantsCounseling: d.wantsCounseling,
        interestedInFreeSvc: d.interestedInFreeSvc,

        title: row.title ?? '',
        score: typeof row.score === 'number' ? row.score : null,
      };
    });

    return res.status(200).json({ data: list });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e?.message ?? 'Internal Error' });
  }
}
