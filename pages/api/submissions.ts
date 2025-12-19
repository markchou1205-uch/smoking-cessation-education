import type { NextApiRequest, NextApiResponse } from 'next';
import { googleSheet } from '../../lib/googleSheet';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const rows = await googleSheet.getSubmissions({ ascending: false });
      return res.status(200).json({ items: rows });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {});

      const payload = {
        title: body.title ?? null,
        student_id: body.student_id ?? null,
        score: body.score ?? null,
        data: JSON.stringify(body), // Store raw body in data column
        created_at: new Date().toISOString(),
      };

      const inserted = await googleSheet.appendSubmission(payload);
      return res.status(201).json({ item: inserted });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).end('Method Not Allowed');
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e.message ?? 'Internal Error' });
  }
}
