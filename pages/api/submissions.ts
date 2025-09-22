// pages/api/submissions.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const TABLE_NAME = 'submissions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from(TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ items: data ?? [] });
    }

    if (req.method === 'POST') {
      const body = req.body ? (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) : {};
      // TODO：依你的 schema 做驗證（zod/joi）
      const payload = {
        title: body.title,
        student_id: body.student_id,
        created_at: new Date().toISOString(),
        ...body,
      };
      const { data, error } = await supabaseAdmin.from(TABLE_NAME).insert(payload).select().single();
      if (error) throw error;
      return res.status(201).json({ item: data });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).end('Method Not Allowed');
  } catch (e: any) {
    return res.status(500).json({ error: e.message ?? 'Internal Error' });
  }
}
